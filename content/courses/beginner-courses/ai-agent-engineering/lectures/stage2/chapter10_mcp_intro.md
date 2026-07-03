# 第 10 章：MCP 协议入门

## 学习目标

- 理解 MCP（Model Context Protocol）诞生的背景和解决的问题。
- 掌握 MCP 的核心角色：Host、Client、Server、Transport。
- 了解 MCP 与传统 API 集成的差异。
- 能够描述 MCP Server 的能力类型：Tools、Resources、Prompts。

## 10.1 从直接调用 API 到协议化集成

在 Function Calling 中，Agent 开发者通常这样集成外部能力：

```python
def search_web(query: str) -> str:
    return requests.get("https://api.example.com/search", params={"q": query}).text

# 在 prompt 里描述这个函数，让模型选择调用
```

问题很明显：

- 每个工具都要手写封装和文档。
- 工具签名和描述散落各处。
- 不同 Agent 框架之间无法复用。

MCP 的目标是把这些能力抽象成一套统一协议，让任何兼容 MCP 的 Client 都能发现和使用任何兼容 MCP 的 Server。

## 10.2 MCP 的核心角色

```
┌─────────────────────────────────────────────┐
│                   Host                       │
│  ┌───────────────────────────────────────┐  │
│  │              MCP Client                │  │
│  │  - 发现 Server 能力                     │  │
│  │  - 管理连接生命周期                     │  │
│  └───────────────────────────────────────┘  │
│                      │                       │
│              Transport (stdio / SSE / HTTP) │
│                      │                       │
│  ┌───────────────────────────────────────┐  │
│  │              MCP Server                │  │
│  │  - Tools / Resources / Prompts         │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

| 角色 | 职责 | 例子 |
|------|------|------|
| Host | 运行 Client 的应用程序 | Claude Desktop、IDE、自研 Agent |
| Client | 与 Server 建立会话，调用能力 | `mcp.Client` |
| Server | 暴露 Tools、Resources、Prompts | 文件系统、数据库、搜索服务 |
| Transport | 传输 JSON-RPC 消息 | stdio、SSE、HTTP |

## 10.3 MCP Server 的能力类型

MCP Server 主要暴露三类能力：

### Tools（工具）

可被模型调用、会改变外部状态的能力。

```python
{
  "name": "send_email",
  "description": "Send an email to a recipient",
  "inputSchema": {
    "type": "object",
    "properties": {
      "to": {"type": "string"},
      "subject": {"type": "string"},
      "body": {"type": "string"}
    },
    "required": ["to", "subject", "body"]
  }
}
```

### Resources（资源）

只读或静态的上下文来源，例如文件、数据库记录、配置。

```python
{
  "uri": "file:///project/README.md",
  "mimeType": "text/markdown",
  "name": "README"
}
```

### Prompts（提示模板）

预定义的提示词模板，Server 可以提供给 Client 使用。

```python
{
  "name": "summarize_code",
  "description": "Generate a summary for a code file",
  "arguments": [
    {"name": "file_path", "description": "Path to the code file", "required": True}
  ]
}
```

## 10.4 MCP 与传统 API 集成的对比

| 维度 | 传统 API 封装 | MCP Server |
|------|---------------|------------|
| 能力发现 | 代码里硬编码 | 运行时通过协议发现 |
| 文档维护 | 手写 prompt / docstring | schema 自带描述 |
| 复用性 | 绑定特定 Agent 框架 | 任何 MCP Client 可用 |
| 权限控制 | 自行实现 | 通过 Server 隔离 |
| 部署形态 | 函数库 / 微服务 | 独立进程 / 远程服务 |
| 调试方式 | 日志 + 单测 | MCP Inspector + 协议日志 |

## 10.5 最小 MCP Server 骨架（Python）

```python
from mcp.server import Server
from mcp.types import TextContent

server = Server("demo-server")

@server.list_tools()
async def list_tools():
    return [
        {
            "name": "echo",
            "description": "Echo back the input message",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "message": {"type": "string"}
                },
                "required": ["message"]
            }
        }
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict):
    if name == "echo":
        return [TextContent(type="text", text=arguments["message"])]
    raise ValueError(f"Unknown tool: {name}")

# 后续通过 stdio 或 SSE transport 启动
```

## 10.6 常见错误

- **错误 1**：把 MCP 当成新的模型协议。事实是 MCP 不替代 LLM API，它规范的是模型与外部能力的连接方式。
- **错误 2**：在 Resource 里写会改状态的操作。Resource 应该是只读或静态上下文。
- **错误 3**：忽略 Transport 的选择。stdio 适合本地进程，SSE/HTTP 适合远程服务。
- **错误 4**：Tool 的 `inputSchema` 描述不完整，导致模型参数填错。
- **错误 5**：没有在 Server 启动前完成 `initialize` 握手，Client 直接发送请求。

## 10.7 本章练习

1. 画出 MCP Host/Client/Server/Transport 四者的关系图。
2. 列出你当前项目中适合做成 MCP Tool、Resource、Prompt 的三个能力。
3. 阅读 Lab 09 的 Server 代码，指出其中哪些部分对应 MCP 生命周期的 initialize、list_tools、call_tool。
4. 对比 MCP 和 REST API：在什么场景下 MCP 的收益大于额外复杂度？

## 检查点

- 你能说清 MCP 四个角色的职责。
- 你知道 Tools、Resources、Prompts 的区别。
- 你能解释 MCP 相比传统 API 集成的优势和成本。
- 你读过一段最小 MCP Server 代码并理解其结构。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\09-mcp-server-stdio`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/09-mcp-server-stdio`
