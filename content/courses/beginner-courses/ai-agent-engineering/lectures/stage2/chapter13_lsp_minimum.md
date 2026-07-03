# 第 13 章：LSP 协议与最小 Server

## 学习目标

- 理解 LSP（Language Server Protocol）的基本定位和消息模型。
- 掌握 LSP 生命周期：initialize、消息循环、shutdown/exit。
- 手写一个最小 LSP Server，支持 `textDocument/hover`。
- 比较 LSP 与 MCP 在 Agent 场景中的不同用途。

## 13.1 为什么 Agent 需要 LSP

Agent 处理代码时，经常需要：

- 获取符号定义位置
- 查找引用
- 诊断代码错误
- 补全代码片段

这些能力正是 LSP 提供的。LSP 让 Agent 不必自己解析各种编程语言，只需与一个 Language Server 通信即可。

## 13.2 LSP 消息格式

LSP 基于 JSON-RPC，但通过 `Content-Length` 头封装：

```
Content-Length: 85

{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"processId":null,"rootUri":null,"capabilities":{}}}
```

读取时必须先读头，再按长度读 body。

## 13.3 LSP 生命周期

| 阶段 | 方法 | 说明 |
|------|------|------|
| 初始化 | `initialize` | 交换客户端/服务端能力 |
| 运行期 | `textDocument/*`, `workspace/*` | 处理文档和请求 |
| 关闭 | `shutdown` | 服务端停止处理新请求 |
| 退出 | `exit` | 客户端通知服务端退出 |

## 13.4 最小 LSP Server（Python）

```python
#!/usr/bin/env python3
import json
import sys


class LSPServer:
    def __init__(self):
        self.running = True

    def read_message(self):
        header = {}
        while True:
            line = sys.stdin.readline()
            if not line:
                return None
            line = line.strip()
            if not line:
                break
            key, value = line.split(":", 1)
            header[key.strip()] = value.strip()

        length = int(header.get("Content-Length", 0))
        body = sys.stdin.read(length)
        return json.loads(body)

    def send_message(self, payload):
        body = json.dumps(payload)
        sys.stdout.write(f"Content-Length: {len(body)}\r\n\r\n{body}")
        sys.stdout.flush()

    def handle(self, request):
        method = request.get("method")
        req_id = request.get("id")

        if method == "initialize":
            return self._ok(req_id, {
                "capabilities": {
                    "textDocumentSync": 1,
                    "hoverProvider": True,
                },
                "serverInfo": {"name": "minimal-lsp", "version": "0.1.0"}
            })

        if method == "initialized":
            return None  # 通知无需响应

        if method == "textDocument/hover":
            return self._ok(req_id, {
                "contents": {
                    "kind": "markdown",
                    "value": "**Minimal LSP**: This is a placeholder hover response."
                }
            })

        if method == "shutdown":
            return self._ok(req_id, None)

        if method == "exit":
            self.running = False
            return None

        return self._error(req_id, -32601, f"Method not found: {method}")

    def _ok(self, req_id, result):
        return {"jsonrpc": "2.0", "id": req_id, "result": result}

    def _error(self, req_id, code, message):
        return {"jsonrpc": "2.0", "id": req_id, "error": {"code": code, "message": message}}

    def run(self):
        while self.running:
            msg = self.read_message()
            if msg is None:
                break
            response = self.handle(msg)
            if response is not None:
                self.send_message(response)


if __name__ == "__main__":
    LSPServer().run()
```

## 13.5 用命令行测试

```bash
python -c "
import json, sys
body = json.dumps({'jsonrpc':'2.0','id':1,'method':'initialize','params':{'processId':None,'rootUri':None,'capabilities':{}}})
sys.stdout.write(f'Content-Length: {len(body)}\r\n\r\n{body}')
" | python lsp_server.py
```

## 13.6 LSP vs MCP

| 维度 | LSP | MCP |
|------|-----|-----|
| 设计目标 | 代码语义服务 | 通用模型上下文服务 |
| 核心能力 | 定义、引用、诊断、补全 | 工具、资源、提示模板 |
| 主要客户端 | IDE、编辑器 | Agent、Host 应用 |
| 传输层 | stdio / TCP / 管道 | stdio / SSE / HTTP |
| Agent 中用途 | 理解代码结构 | 调用外部能力 |
| 典型 Server | pyright、clangd、tsserver | 文件系统、搜索、数据库 |

两者不冲突：Agent 可以用 MCP 暴露一个 LSP Client，也可以用 LSP 读取代码结构后再通过 MCP 调用工具。

## 13.7 多语言：Node.js LSP Server 骨架

```typescript
import * as readline from "readline";

function send(payload: unknown) {
  const body = JSON.stringify(payload);
  process.stdout.write(`Content-Length: ${body.length}\r\n\r\n${body}`);
}

const rl = readline.createInterface({ input: process.stdin });
let buffer = "";
let length = 0;

rl.on("line", (line) => {
  if (line.startsWith("Content-Length:")) {
    length = parseInt(line.split(":")[1].trim());
    buffer = "";
  } else if (line === "" && length > 0) {
    process.stdin.once("data", (chunk) => {
      const req = JSON.parse(chunk.toString().slice(0, length));
      if (req.method === "initialize") {
        send({ jsonrpc: "2.0", id: req.id, result: { capabilities: { hoverProvider: true } } });
      }
    });
  }
});
```

## 13.8 常见错误

- **错误 1**：忘记 `Content-Length` 头，直接输出裸 JSON，Client 无法解析。
- **错误 2**：响应长度按字符数而不是字节数计算，中文或多字节字符会截断。
- **错误 3**：把通知当请求处理，返回了多余的响应。
- **错误 4**：没有实现 `shutdown/exit`，Client 无法正常关闭 Server。
- **错误 5**：在 Agent 里直接调用 LSP Server 却不管理文档版本，导致诊断位置错乱。

## 13.9 本章练习

1. 在示例 Server 中实现 `textDocument/definition`，对任意标识符返回固定位置。
2. 写一个简单的 LSP Client，发送 `initialize` 并读取 `initialize` 响应。
3. 对比 LSP 和 MCP 的初始化消息，列出至少三处差异。
4. 思考：如果让 Agent 分析一个 Python 项目，你会优先使用 LSP 的哪些方法？

## 检查点

- 你能解释 LSP 的 `Content-Length` 封装格式。
- 你知道 initialize、shutdown、exit 三个阶段的作用。
- 你能手写一个支持 hover 的最小 LSP Server。
- 你能比较 LSP 与 MCP 的适用场景。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\11-lsp-minimum`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/11-lsp-minimum`
