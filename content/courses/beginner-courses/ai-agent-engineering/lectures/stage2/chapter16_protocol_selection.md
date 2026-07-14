# 第 16 章：如何选择协议

## 学习目标

- 掌握 Function Calling、JSON Mode、MCP、LSP、A2A 的选择依据。
- 能够根据任务类型、部署环境和团队成熟度做出协议决策。
- 理解不同协议之间的组合使用方式。
- 避免过度设计或错误地把临时方案当成架构方向。

## 16.1 五种能力回顾

| 协议/模式 | 核心能力 | 通信方向 | 典型粒度 |
|-----------|----------|----------|----------|
| JSON Mode | 强制输出 JSON | 应用 → LLM | 单次调用 |
| Function Calling | 模型选择工具并生成参数 | 应用 ↔ LLM | 单次调用 |
| MCP | 统一暴露工具/资源/提示模板 | Host/Client ↔ Server | 本地或近程能力 |
| LSP | 代码语义服务 | IDE/Agent ↔ Language Server | 代码符号级 |
| A2A | Agent 之间任务协作 | Agent ↔ Agent | 任务级 |

## 16.2 选择决策矩阵

| 场景 | 推荐协议 | 原因 |
|------|----------|------|
| 只需要结构化输出，不调用外部工具 | JSON Mode | 最简单，无额外依赖 |
| 模型需要从几个函数里选择 | Function Calling | SDK 原生支持，开发最快 |
| 工具数量多、需要跨 Agent 复用 | MCP | 统一发现、schema 自描述 |
| 本地脚本/CLI/IDE 插件能力 | MCP + stdio | 进程隔离、部署简单 |
| 远程服务化能力 | MCP + SSE/HTTP | 网络化、可扩展 |
| Agent 需要理解代码结构 | LSP | 类型、定义、引用、诊断 |
| Agent 需要修改代码 | LSP + Tree-sitter | 语法校验 + 语义校验 |
| 多个 Agent 需要协作 | A2A | Task 状态机、消息传递 |
| 跨组织/跨平台 Agent 协作 | A2A + Agent Card | 标准化能力发现 |

## 16.3 组合使用示例

一个复杂的 Agent 系统可能同时使用多种协议：

```
用户请求
   │
   ▼
LLM Function Calling ──▶ 决定使用哪个 MCP Tool
   │
   ▼
MCP Client ──▶ 调用文件系统 / 数据库 / 搜索 MCP Server
   │
   ▼
需要分析代码 ──▶ LSP 获取定义和引用
   │
   ▼
Tree-sitter 提取 AST 结构
   │
   ▼
需要外部专家 Agent ──▶ A2A 调用安全审查 Agent
   │
   ▼
返回最终结果（JSON Mode 结构化输出）
```

## 16.4 选择时的常见误区

| 误区 | 正确认识 |
|------|----------|
| 所有能力都用 MCP 包一层 | JSON Mode/Function Calling 在单次调用中更简单直接 |
| MCP 可以替代 A2A | MCP 解决能力暴露，A2A 解决 Agent 协作，层级不同 |
| LSP 只给 IDE 用 | Agent 分析代码时，LSP 是最省力的语义来源 |
| Tree-sitter 可以替代 LSP | Tree-sitter 只做语法，不能做跨文件语义 |
| 协议选得越多架构越先进 | 协议是有成本的，先从最直接的需求出发 |

## 16.5 渐进式选型建议

阶段一：单轮工具调用

```python
# 用 Function Calling 实现第一个 Agent 能力
tools = [{"type": "function", "function": {"name": "search", ...}}]
response = client.chat.completions.create(messages=messages, tools=tools)
```

阶段二：工具标准化

```python
# 当工具数量变多、需要复用时，迁移到 MCP Server
# Client 发现工具 → 交给 LLM → 调用 Server
```

阶段三：代码理解

```python
# 加入 LSP + Tree-sitter 处理代码相关任务
# Agent 可以“读懂”项目，而不仅是执行命令
```

阶段四：多 Agent 协作

```python
# 当系统内有多个独立 Agent 时，引入 A2A
# 通过 Agent Card 发现能力，通过 Task 编排协作
```

## 16.6 多语言对比：同一个工具用不同协议实现

Function Calling（OpenAI SDK）：

```python
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages,
    tools=tools,
)
```

MCP Client：

```python
async with ClientSession(read, write) as session:
    await session.initialize()
    result = await session.call_tool("search", {"query": "..."})
```

A2A：

```python
requests.post(
    "http://research-agent/tasks/send",
    json={"messages": [{"role": "user", "parts": [{"type": "text", "text": "..."}]}]}
)
```

## 16.7 常见错误

- **错误 1**：一上来就为所有工具写 MCP Server，忽略了 Function Calling 已经足够。
- **错误 2**：把 A2A 用于进程内函数调用，增加无意义的网络开销。
- **错误 3**：在不需要代码语义的场景强行引入 LSP。
- **错误 4**：协议选型只看技术热度，不看团队维护能力和现有基础设施。
- **错误 5**：多个协议混用时没有统一错误处理和日志格式。

## 16.8 本章练习

1. 列出你当前系统里三种不同能力，分别判断适合用 JSON Mode、MCP 还是 A2A。
2. 画一张架构图，展示 Function Calling、MCP、LSP、A2A 在你的 Agent 系统中的位置。
3. 假设团队只有 1 周时间，你会优先落地哪种协议？为什么？
4. 为 Stage 2 的每个 Lab 写一句话说明它解决了哪个协议问题。

## 检查点

- 你能根据场景选择 JSON Mode、Function Calling、MCP、LSP、A2A。
- 你知道这些协议可以组合使用，而不是互斥。
- 你能识别过度设计和选型不足的迹象。
- 你理解渐进式引入协议的价值。

## 配套代码

本章综合参考 Stage 2 所有实验：

| 章节 | 主题 | 本地路径 | 在线地址 |
|------|------|----------|----------|
| 第 9 章 | Function Calling vs JSON Mode | `D:\Project\github\agent-labs\labs\08-function-json-mode` | `https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/08-function-json-mode` |
| 第 10-11 章 | MCP Server（stdio） | `D:\Project\github\agent-labs\labs\09-mcp-server-stdio` | `https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/09-mcp-server-stdio` |
| 第 12 章 | MCP Client | `D:\Project\github\agent-labs\labs\10-mcp-client` | `https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/10-mcp-client` |
| 第 13 章 | LSP 最小 Server | `D:\Project\github\agent-labs\labs\11-lsp-minimum` | `https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/11-lsp-minimum` |
| 第 14 章 | LSP + Tree-sitter | `D:\Project\github\agent-labs\labs\12-lsp-treesitter` | `https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/12-lsp-treesitter` |
| 第 15 章 | A2A Agent | `D:\Project\github\agent-labs\labs\13-a2a-agent` | `https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/13-a2a-agent` |
