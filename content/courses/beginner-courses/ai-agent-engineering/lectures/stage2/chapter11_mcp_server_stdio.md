# 第 11 章：手写 MCP Server（stdio）

## 学习目标

- 理解 stdio 作为 MCP Transport 的优缺点。
- 手动实现一个基于 stdio 的 MCP Server。
- 掌握 initialize 握手、工具注册、调用处理的生命周期。
- 能够通过命令行与 MCP Server 交互调试。

## 11.1 为什么选择 stdio

stdio 是 MCP 最简单的传输方式：Server 从标准输入读取 JSON-RPC 消息，向标准输出写入响应。

| 优点 | 缺点 |
|------|------|
| 零网络依赖 | 只能本机运行 |
| 进程隔离，权限清晰 | 不支持远程调用 |
| 调试方便，直接 `echo` | 日志容易污染 stdout |
| 与本地脚本、CLI 工具天然契合 | 单连接，无法并发多个 Client |

stdio 适合本地工具链、IDE 插件、沙箱脚本等场景。

## 11.2 MCP 消息格式

MCP 基于 JSON-RPC 2.0：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

响应：

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "add",
        "description": "Add two numbers",
        "inputSchema": {
          "type": "object",
          "properties": {
            "a": {"type": "number"},
            "b": {"type": "number"}
          },
          "required": ["a", "b"]
        }
      }
    ]
  }
}
```

## 11.3 手写 stdio Server（Python）

下面是一个不依赖高层框架、基于原始 JSON-RPC 的 MCP Server：

```python
#!/usr/bin/env python3
import json
import sys
from typing import Any


class MCPServer:
    def __init__(self):
        self.tools = {
            "add": {
                "description": "Add two numbers",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "a": {"type": "number"},
                        "b": {"type": "number"}
                    },
                    "required": ["a", "b"]
                },
                "handler": lambda args: args["a"] + args["b"]
            }
        }

    def handle(self, request: dict) -> dict:
        method = request.get("method")
        req_id = request.get("id")

        if method == "initialize":
            return self._ok(req_id, {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "serverInfo": {"name": "handwritten-mcp", "version": "0.1.0"}
            })

        if method == "tools/list":
            return self._ok(req_id, {
                "tools": [
                    {
                        "name": name,
                        "description": meta["description"],
                        "inputSchema": meta["inputSchema"]
                    }
                    for name, meta in self.tools.items()
                ]
            })

        if method == "tools/call":
            params = request.get("params", {})
            name = params.get("name")
            arguments = params.get("arguments", {})
            if name not in self.tools:
                return self._error(req_id, -32601, f"Tool not found: {name}")
            try:
                result = self.tools[name]["handler"](arguments)
                return self._ok(req_id, {
                    "content": [{"type": "text", "text": str(result)}]
                })
            except Exception as e:
                return self._error(req_id, -32603, str(e))

        return self._error(req_id, -32601, f"Method not found: {method}")

    def _ok(self, req_id: Any, result: Any) -> dict:
        return {"jsonrpc": "2.0", "id": req_id, "result": result}

    def _error(self, req_id: Any, code: int, message: str) -> dict:
        return {"jsonrpc": "2.0", "id": req_id, "error": {"code": code, "message": message}}

    def run(self):
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            try:
                request = json.loads(line)
                response = self.handle(request)
            except json.JSONDecodeError as e:
                response = self._error(None, -32700, f"Parse error: {e}")
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    server = MCPServer()
    server.run()
```

## 11.4 用命令行测试

启动 Server：

```bash
python mcp_server_stdio.py
```

在另一个终端输入 JSON-RPC 请求：

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | python mcp_server_stdio.py
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | python mcp_server_stdio.py
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"add","arguments":{"a":2,"b":3}}}' | python mcp_server_stdio.py
```

## 11.5 注册 Resource 和 Prompt

一个完整的 Server 还可以暴露 Resource 和 Prompt：

```python
def list_resources():
    return [
        {
            "uri": "docs://quickstart",
            "name": "Quickstart Guide",
            "mimeType": "text/markdown"
        }
    ]

def read_resource(uri: str):
    if uri == "docs://quickstart":
        return {"contents": [{"uri": uri, "mimeType": "text/markdown", "text": "# Quickstart\n..."}]}
    raise ValueError(f"Resource not found: {uri}")
```

## 11.6 多语言：Node.js stdio Server 骨架

```typescript
import * as readline from "readline";

const rl = readline.createInterface({ input: process.stdin });

function reply(id: number | string, result: unknown) {
  console.log(JSON.stringify({ jsonrpc: "2.0", id, result }));
}

rl.on("line", (line) => {
  const req = JSON.parse(line);
  if (req.method === "initialize") {
    reply(req.id, { protocolVersion: "2024-11-05", serverInfo: { name: "node-mcp" } });
  } else if (req.method === "tools/list") {
    reply(req.id, { tools: [{ name: "echo", description: "Echo", inputSchema: { type: "object", properties: {} } }] });
  } else {
    reply(req.id, { error: { code: -32601, message: "Method not found" } });
  }
});
```

## 11.7 常见错误

- **错误 1**：Server 向 stdout 打印普通日志，导致 Client 解析 JSON 失败。stdio Server 的 stdout 必须严格只输出 JSON-RPC。
- **错误 2**：忘记处理 `initialize` 握手，Client 直接调用工具会失败。
- **错误 3**：响应没有 `id` 或 `id` 与请求不一致。
- **错误 4**：Tool handler 里抛出未捕获异常，导致 Server 崩溃。
- **错误 5**：把 stderr 也当成错误响应通道。stderr 可用于日志，Client 不应解析 stderr。

## 11.8 本章练习

1. 在示例 Server 中新增一个 `multiply` 工具，并通过命令行调用验证。
2. 给 Server 增加一个 Resource，用 `resources/read` 方法读取。
3. 尝试在 Server 里打印 `print("debug")`，观察 Client 解析是否失败，思考如何正确输出日志。
4. 用 `mcp` Python SDK 重写同一个 Server，对比手写与 SDK 的差异。

## 检查点

- 你能手写一个基于 stdio 的 MCP Server。
- 你了解 initialize、tools/list、tools/call 的调用顺序。
- 你知道为什么 stdio Server 不能向 stdout 输出调试日志。
- 你能通过命令行与 Server 完成一轮完整交互。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\09-mcp-server-stdio`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/09-mcp-server-stdio`
