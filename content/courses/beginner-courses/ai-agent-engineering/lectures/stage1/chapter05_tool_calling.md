# 第 5 章：Tool Calling

## 学习目标

- 用 OpenAI 格式定义工具 schema。
- 解析模型返回的 `tool_calls`。
- 执行工具并把结果回传给模型。
- 理解 `tool_choice` 与多轮工具调用。

## 5.1 从字符串解析到结构化调用

上一章用字符串匹配 `Action: calculator(...)` 是教学演示。生产环境中更可靠的方式是使用 LLM 原生的 tool calling 能力：模型直接返回结构化的工具调用请求，包含工具名和参数。

```python
response = client.chat_completion(
    messages=messages,
    tools=TOOLS,
    tool_choice="auto",
)
```

返回的 `choices[0].message` 可能包含 `tool_calls` 字段：

```json
{
  "role": "assistant",
  "content": null,
  "tool_calls": [
    {
      "id": "call_abc123",
      "type": "function",
      "function": {
        "name": "get_weather",
        "arguments": "{\"city\": \"Shanghai\"}"
      }
    }
  ]
}
```

## 5.2 定义工具 Schema

每个工具用 JSON Schema 描述：

```python
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a city.",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "City name"},
                },
                "required": ["city"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_notes",
            "description": "Search project notes by keyword.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search keyword"},
                },
                "required": ["query"],
            },
        },
    },
]
```

好的工具描述是模型能否正确调用的关键：

- `description` 要说明工具做什么、什么时候用。
- 每个参数都要有 `description`。
- `required` 必须与实际函数签名一致。

## 5.3 解析与执行工具

完整调用循环：

```python
import json


def get_weather(city: str) -> str:
    return json.dumps({"city": city, "temperature_c": 22, "condition": "sunny"})


def search_notes(query: str) -> str:
    results = [n for n in NOTES if query.lower() in n["title"].lower() or query.lower() in n["content"].lower()]
    return json.dumps(results, ensure_ascii=False)


TOOL_FUNCTIONS = {
    "get_weather": get_weather,
    "search_notes": search_notes,
}


def run_tool_agent(client, user_message: str, max_iterations: int = 5) -> str:
    messages = [{"role": "user", "content": user_message}]

    for _ in range(max_iterations):
        response = client.chat_completion(
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            temperature=0.0,
            max_tokens=300,
        )
        message = response["choices"][0]["message"]
        messages.append(message)

        if not message.get("tool_calls"):
            return message["content"]

        for tool_call in message["tool_calls"]:
            name = tool_call["function"]["name"]
            args = json.loads(tool_call["function"]["arguments"])
            print(f"[Tool call] {name}({args})")

            func = TOOL_FUNCTIONS.get(name)
            result = func(**args) if func else json.dumps({"error": f"unknown tool {name}"})

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call["id"],
                "name": name,
                "content": result,
            })
            print(f"[Tool result] {result}")

    return "Reached max iterations."
```

## 5.4 tool_choice 的三种模式

| 值 | 含义 |
|----|------|
| `"auto"` | 模型决定是否调用工具 |
| `"none"` | 强制模型不调用工具 |
| `{"type": "function", "function": {"name": "get_weather"}}` | 强制调用指定工具 |

```python
# 强制调用 get_weather
client.chat_completion(
    messages=messages,
    tools=TOOLS,
    tool_choice={"type": "function", "function": {"name": "get_weather"}},
)
```

## 5.5 多语言工具调用示例

Node/TypeScript：

```typescript
const response = await client.chatCompletion({
  messages,
  tools: TOOLS,
  tool_choice: "auto",
  temperature: 0,
  max_tokens: 300,
});

const message = response.choices[0].message;
if (message.tool_calls) {
  for (const call of message.tool_calls) {
    const name = call.function.name;
    const args = JSON.parse(call.function.arguments);
    const result = TOOL_FUNCTIONS[name](args);
    messages.push({
      role: "tool",
      tool_call_id: call.id,
      name,
      content: result,
    });
  }
}
```

Go：

```go
resp, _ := client.ChatCompletion(openaiclient.ChatCompletionRequest{
    Messages:  messages,
    Tools:     tools,
    ToolChoice: "auto",
    Temperature: floatPtr(0),
    MaxTokens: intPtr(300),
})
msg := resp.Choices[0].Message
for _, call := range msg.ToolCalls {
    name := call.Function.Name
    var args map[string]interface{}
    json.Unmarshal([]byte(call.Function.Arguments), &args)
    result := toolFunctions[name](args)
    messages = append(messages, openaiclient.Message{
        Role:       "tool",
        ToolCallID: call.ID,
        Name:       name,
        Content:    result,
    })
}
```

## 5.6 常见错误与调试技巧

- **模型不调用工具**：检查 `description` 是否写清楚了工具用途；确认 `tool_choice` 不是 `"none"`。
- **参数解析失败**：`arguments` 是 JSON 字符串，必须 `json.loads`；注意字段类型匹配。
- **tool_call_id  mismatch**：回传 `tool` 消息时 `tool_call_id` 必须与请求里的 id 完全一致，否则模型会报错。
- **忘记把 assistant 消息加入历史**：模型返回的 `tool_calls` 那条消息必须先 `messages.append(message)`，再追加 `tool` 结果。
- **工具执行时间过长**：给工具调用设置独立超时，避免阻塞整个 Agent。

## 5.7 工具安全

- 工具函数必须做参数校验，不要把用户输入直接拼进命令或 SQL。
- 敏感工具需要鉴权，不要在 system prompt 里暴露内部实现细节。
- 给工具调用设置最大迭代次数，防止无限循环。

## 5.8 本章练习

1. 运行 Lab 04，观察模型如何选择 `get_weather` 和 `search_notes`。
2. 新增一个 `send_email(to, subject, body)` 工具 schema，先不实现功能，看模型会如何调用。
3. 把 `tool_choice` 改为 `"none"`，看模型是否还会尝试调用工具。
4. 故意让 `get_weather` 返回错误，观察模型是否会根据错误信息继续。

## 检查点

- 你能用 JSON Schema 定义工具。
- 你能解析 `tool_calls` 并执行对应函数。
- 你知道回传 `tool` 消息时 `tool_call_id` 的重要性。
- 你能区分 `tool_choice` 的三种模式。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\04-tool-calling`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/04-tool-calling`
