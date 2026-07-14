# 第 12 章：MCP Client 与传输层

## 学习目标

- 理解 MCP Client 的职责和生命周期。
- 掌握 stdio、SSE、HTTP 三种传输方式的差异。
- 实现一个能发现工具并调用工具的 MCP Client。
- 能够根据部署场景选择合适的 Transport。

## 12.1 Client 的职责

MCP Client 不是简单的 HTTP 调用方，它需要管理：

- 与 Server 建立连接（Transport）
- 完成 `initialize` 握手
- 发现并缓存 Server 能力（tools/resources/prompts）
- 把模型生成的工具调用转发给 Server
- 处理错误、超时、重连

```python
async with mcp_client(server_params) as client:
    tools = await client.list_tools()
    result = await client.call_tool("search", {"query": "MCP protocol"})
```

## 12.2 三种 Transport 对比

| Transport | 适用场景 | 优点 | 缺点 |
|-----------|----------|------|------|
| stdio | 本地子进程 | 简单、无网络、权限隔离 | 只能本地、单连接 |
| SSE | 远程 Server、流式推送 | 单向流支持好、HTTP 友好 | 需要服务器支持 |
| HTTP | 远程 Server、REST 团队 | 通用、易于网关和监控 | 需要轮询或长连接模拟流 |

选择建议：

- 本地脚本/CLI/IDE 插件 → stdio
- 浏览器或需要服务端推送 → SSE
- 已有 REST/网关基础设施 → HTTP

## 12.3 stdio Client（Python）

```python
import asyncio
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def main():
    server_params = StdioServerParameters(
        command=sys.executable,
        args=["mcp_server_stdio.py"],
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            print("Available tools:", [t.name for t in tools.tools])

            result = await session.call_tool("add", arguments={"a": 10, "b": 20})
            print("Result:", result.content[0].text)


if __name__ == "__main__":
    asyncio.run(main())
```

## 12.4 SSE Client（Python）

```python
import asyncio
from mcp import ClientSession
from mcp.client.sse import sse_client


async def main():
    async with sse_client("http://localhost:3000/sse") as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            print("Tools:", [t.name for t in tools.tools])


if __name__ == "__main__":
    asyncio.run(main())
```

## 12.5 HTTP Client（Python）

```python
import asyncio
import httpx


async def call_http_mcp():
    async with httpx.AsyncClient() as client:
        # 初始化
        await client.post(
            "http://localhost:3000/mcp",
            json={"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {}}
        )

        # 列出工具
        resp = await client.post(
            "http://localhost:3000/mcp",
            json={"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}
        )
        print(resp.json())


if __name__ == "__main__":
    asyncio.run(call_http_mcp())
```

## 12.6 把 MCP 工具交给 LLM 使用

Client 拿到工具列表后，可以格式化为 OpenAI Function Calling 所需的格式：

```python
def to_openai_tools(mcp_tools):
    return [
        {
            "type": "function",
            "function": {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.inputSchema,
            }
        }
        for tool in mcp_tools
    ]

# 然后传入 chat.completions.create 的 tools 参数
```

## 12.7 多语言：TypeScript Client

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "python",
  args: ["mcp_server_stdio.py"],
});

const client = new Client({ name: "demo-client", version: "0.1.0" });
await client.connect(transport);

const tools = await client.listTools();
console.log(tools.tools.map((t) => t.name));
```

## 12.8 常见错误

- **错误 1**：Client 没有 `initialize` 就直接调用工具，Server 返回协议错误。
- **错误 2**：stdio Client 没有正确等待子进程启动，导致第一条消息丢失。
- **错误 3**：把 SSE 和 WebSocket 混淆。MCP SSE 是 Server-Sent Events，不是双向 WebSocket。
- **错误 4**：HTTP Transport 下假设所有调用都是无状态的，忽略了 initialize 会话状态。
- **错误 5**：Tool 返回的内容格式与 LLM 预期不一致，导致后续对话断裂。

## 12.9 本章练习

1. 实现一个 stdio Client，连接到 Lab 09 的 Server，列出工具并调用 `add`。
2. 把 Lab 09 的 stdio Server 改造为 SSE Server，再用 SSE Client 连接。
3. 写一段代码把 `session.list_tools()` 的结果转换成 OpenAI `tools` 格式。
4. 为 Client 添加超时和异常捕获，确保 Server 崩溃时不会挂死。

## 检查点

- 你能解释 MCP Client 的四个核心职责。
- 你知道 stdio/SSE/HTTP 三种 Transport 的适用场景。
- 你能用 Python 或 TypeScript 完成一次完整的 initialize + list_tools + call_tool。
- 你能把 MCP Tool 列表映射为 LLM Function Calling 格式。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\10-mcp-client`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/10-mcp-client`
