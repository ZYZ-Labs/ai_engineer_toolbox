# 第 9 章：Function Calling vs JSON Mode

## 学习目标

- 理解 Function Calling 与 JSON Mode 的核心区别与适用场景。
- 掌握 OpenAI 兼容接口中两种模式的调用方式。
- 能够根据任务类型选择合适的结构化输出方案。
- 识别两种模式各自的常见陷阱。

## 9.1 为什么需要结构化输出

Agent 调用 LLM 时，通常不会直接把回答展示给用户，而是需要解析成程序可处理的数据结构，例如：

- 要调用的工具名和参数
- 要查询的数据库字段
- 要执行的动作序列

```python
# 理想情况：模型直接返回可以被代码解析的结构
{
  "tool": "search_weather",
  "arguments": {"city": "Beijing"}
}
```

LLM 原生输出是自由文本，为了得到可靠的结构，主流方案有两种：

1. **JSON Mode**：强制模型输出合法 JSON。
2. **Function Calling**：模型在预定义函数列表中选择并生成参数。

## 9.2 JSON Mode

JSON Mode 通过 `response_format={"type": "json_object"}` 强制模型输出可被 `json.loads` 解析的字符串。

```python
import json
from openai import OpenAI

client = OpenAI()

messages = [
    {"role": "system", "content": "You are a helpful assistant. Always return valid JSON."},
    {"role": "user", "content": "Extract the city and temperature from: 'Beijing is 28 degrees Celsius today.'"},
]

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages,
    response_format={"type": "json_object"},
    max_tokens=200,
)

content = response.choices[0].message.content
data = json.loads(content)
print(data)  # {'city': 'Beijing', 'temperature': 28}
```

关键点：

- Prompt 里必须明确提到 JSON，否则可能触发模型报错。
- 返回的是字符串，需要自己做解析和校验。
- 不保证字段顺序，也不保证字段一定存在。

## 9.3 Function Calling

Function Calling 让模型在调用时从预定义的工具列表里选择一个，并生成调用参数。

```python
from openai import OpenAI

client = OpenAI()

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get current weather for a city",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "City name"},
                    "unit": {"type": "string", "enum": ["C", "F"]},
                },
                "required": ["city"],
            },
        },
    }
]

messages = [
    {"role": "user", "content": "What's the weather like in Beijing?"}
]

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages,
    tools=tools,
    tool_choice="auto",
)

message = response.choices[0].message
if message.tool_calls:
    call = message.tool_calls[0]
    print(call.function.name)       # get_weather
    print(call.function.arguments)  # {"city": "Beijing", "unit": "C"}
```

关键点：

- 模型不真正执行函数，只返回要调用的函数名和参数。
- `tool_choice="auto"` 让模型自己决定是否调用；`tool_choice="none"` 强制不调用。
- 参数是 JSON 字符串，需要解析后由业务代码执行。

## 9.4 Function Calling vs JSON Mode

| 维度 | JSON Mode | Function Calling |
|------|-----------|------------------|
| 输出约束 | 仅要求合法 JSON | 要求匹配预定义函数签名 |
| 工具选择 | 代码自行决定 | 模型从 tools 列表中选择 |
| 适用场景 | 数据抽取、格式化输出 | Agent 工具调用、多步决策 |
| 字段校验 | 弱，需自行校验 | 较强，schema 约束参数 |
| 多轮对话 | 需要手动维护调用历史 | SDK 天然支持 message.tool_calls |
| 模型支持 | 较广泛 | 较广泛，但细节有差异 |
| 错误处理 | 解析失败兜底 | 函数名/参数异常兜底 |

## 9.5 多语言示例

TypeScript 中的 JSON Mode：

```typescript
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages,
  response_format: { type: "json_object" },
});
const data = JSON.parse(response.choices[0].message.content);
```

Go 中的 Function Calling：

```go
tools := []openai.Tool{
    {
        Type: openai.ToolTypeFunction,
        Function: &openai.FunctionDefinition{
            Name:        "get_weather",
            Description: "Get current weather for a city",
            Parameters: jsonschema.Definition{
                Type: jsonschema.Object,
                Properties: map[string]jsonschema.Definition{
                    "city": {Type: jsonschema.String},
                    "unit": {Type: jsonschema.String, Enum: []string{"C", "F"}},
                },
            },
        },
    },
}
```

## 9.6 常见错误

- **错误 1**：以为 JSON Mode 会自动填充所有字段。事实是字段仍然依赖 prompt 描述，模型可能漏掉字段。
- **错误 2**：把 Function Calling 当成函数已经执行。事实是模型只生成调用请求，执行必须由你的代码完成。
- **错误 3**：忘记在 system prompt 里强调 JSON。JSON Mode 下如果 prompt 里没有 JSON 字样，部分接口会报错。
- **错误 4**：工具参数里描述不清，导致模型填错字段类型。
- **错误 5**：没有校验返回的函数名是否在白名单里，直接 `getattr` 执行。

## 9.7 本章练习

1. 用 JSON Mode 让模型从一段文本中抽取 `人名`、`公司`、`职位`，并解析成 Python dict。
2. 用 Function Calling 实现一个 `search_product(city, keyword)` 的工具选择流程。
3. 对比同一个任务分别用 JSON Mode 和 Function Calling 实现，列出各自的代码量和可维护性差异。
4. 给工具参数添加 `required` 和 `enum` 约束，观察模型输出是否更稳定。

## 检查点

- 你能解释 JSON Mode 和 Function Calling 的核心区别。
- 你知道 Function Calling 中模型只返回调用请求，不执行函数。
- 你能为任务选择合适的结构化输出方式。
- 你能处理解析失败和字段缺失的兜底情况。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\08-function-json-mode`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/08-function-json-mode`
