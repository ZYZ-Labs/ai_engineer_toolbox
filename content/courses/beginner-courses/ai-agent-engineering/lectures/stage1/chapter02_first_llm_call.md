# 第 2 章：环境配置与第一次 LLM 调用

## 学习目标

- 使用环境变量配置 OpenAI 兼容的 API 客户端。
- 发起第一次 chat completion 请求并解析响应。
- 理解响应结构：`choices`、`message`、`usage`、`finish_reason`。
- 处理缺失凭证与网络异常。

## 2.1 从环境变量开始

把 API key 写死在代码里是新手最容易犯的错误。一个后端工程项目的标准做法是：

1. 将敏感配置放在 `.env` 文件中，且 `.env` 不被提交到版本库。
2. 启动时读取环境变量，失败时给出清晰错误。

Lab 01 的目录里提供了 `.env.example`：

```bash
# .env.example
OPENAI_API_KEY=sk-xxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1
```

复制后填写真实 key：

```bash
cp .env.example .env
# 编辑 .env
```

> 生产环境不要把 key 放在代码仓库。CI/CD 使用 secrets manager 或环境变量注入。

## 2.2 第一次 chat completion 请求

Python 使用 Lab 共用的 `OpenAIClient` 封装：

```python
import json
from openai_client import OpenAIClient, configure_logging

configure_logging()
client = OpenAIClient()

messages = [
    {"role": "system", "content": "You are a concise assistant."},
    {"role": "user", "content": "Explain what an AI agent is in one sentence."},
]

response = client.chat_completion(messages=messages, max_tokens=80)
message = client.extract_message(response)

print("Assistant:", message["content"])
print("Model:", response.get("model"))
print("Finish reason:", response["choices"][0].get("finish_reason"))
print("Usage:", json.dumps(response.get("usage", {}), indent=2))
```

Node/TypeScript 等价实现：

```typescript
import { OpenAIClient } from "./openai_client";

const client = new OpenAIClient();
const response = await client.chatCompletion({
  messages: [
    { role: "system", content: "You are a concise assistant." },
    { role: "user", content: "Explain what an AI agent is in one sentence." },
  ],
  max_tokens: 80,
});

const message = client.extractMessage(response);
console.log("Assistant:", message.content);
console.log("Finish reason:", response.choices[0].finish_reason);
console.log("Usage:", JSON.stringify(response.usage, null, 2));
```

Go 等价实现：

```go
client := openaiclient.NewClient()
resp, err := client.ChatCompletion(openaiclient.ChatCompletionRequest{
    Messages: []openaiclient.Message{
        {Role: "system", Content: "You are a concise assistant."},
        {Role: "user", Content: "Explain what an AI agent is in one sentence."},
    },
    MaxTokens: intPtr(80),
})

msg := client.ExtractMessage(resp)
fmt.Println("Assistant:", msg.Content)
fmt.Println("Finish reason:", resp.Choices[0].FinishReason)
fmt.Printf("Usage: %+v\n", resp.Usage)

func intPtr(v int) *int { return &v }
```

## 2.3 响应结构拆解

一次 chat completion 返回的核心字段如下：

| 字段 | 含义 | 示例 |
|------|------|------|
| `id` | 请求唯一标识 | `chatcmpl-abc123` |
| `object` | 对象类型 | `chat.completion` |
| `created` | 创建时间戳 | `1718000000` |
| `model` | 实际使用的模型 | `gpt-4o-mini` |
| `choices` | 模型输出列表 | 数组 |
| `choices[0].message` | 助手消息 | `{role: "assistant", content: "..."}` |
| `choices[0].finish_reason` | 停止原因 | `stop`、`length`、`tool_calls` |
| `usage` | token 统计 | `{prompt_tokens, completion_tokens, total_tokens}` |

`finish_reason` 是调试的关键：

- `stop`：正常结束，遇到停止词或模型认为已完成。
- `length`：达到了 `max_tokens` 上限，回答可能被截断。
- `tool_calls`：模型决定调用工具（见第 5 章）。
- `content_filter`：内容被过滤。

```python
print(response["choices"][0]["finish_reason"])
```

## 2.4 异常处理

LLM 调用是网络 IO，必须考虑失败：

```python
import sys

try:
    client = OpenAIClient()
except ValueError as exc:
    print(f"Configuration error: {exc}", file=sys.stderr)
    sys.exit(1)

try:
    response = client.chat_completion(messages=messages, max_tokens=80)
except Exception as exc:
    print(f"Request failed: {exc}", file=sys.stderr)
    sys.exit(1)
```

常见错误与处理：

| 错误 | 可能原因 | 处理建议 |
|------|----------|----------|
| 401 Unauthorized | API key 错误或过期 | 检查 key，确认 base_url 是否正确 |
| 429 Too Many Requests | 速率限制 | 增加重试与退避 |
| 500/503 | 服务端临时故障 | 指数退避重试 |
| timeout | 网络或模型响应慢 | 设置合理超时，必要时降级 |
| Connection refused | base_url 错误 | 核对地址与端口 |

## 2.5 常见错误与调试技巧

- **不要把 key 提交到仓库**。检查 `.gitignore` 是否包含 `.env`。
- **base_url 末尾不要有多余斜杠**。多数客户端会自动处理，但自定义封装可能拼错。
- **打印完整响应**。不要只看 `content`，`usage` 和 `finish_reason` 能暴露很多问题。
- **注意 token 限制**。如果 `finish_reason` 是 `length`，先尝试提高 `max_tokens`。
- **本地开发使用较低模型**。`gpt-4o-mini` 成本低、响应快，适合调试。

## 2.6 本章练习

1. 将 `.env.example` 复制为 `.env`，填入自己的 API key，运行 Lab 01。
2. 修改 prompt，让模型用中文回答，观察响应结构是否变化。
3. 故意填错 API key，观察错误码和错误信息。
4. 打印 `response["usage"]["total_tokens"]`，连续请求三次，看 token 消耗是否稳定。

## 检查点

- 你能用环境变量配置 API 客户端。
- 你能发起 chat completion 并提取助手回复。
- 你能解释 `finish_reason` 的几种取值。
- 你能处理配置错误和请求失败。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\01-first-llm-call`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/01-first-llm-call`
