# 第 3 章：LLM 推理参数全解

## 学习目标

- 理解 temperature、top_p、max_tokens 等核心参数如何影响模型行为。
- 知道每个参数的典型取值和适用场景。
- 避免常见参数组合陷阱。
- 使用参数矩阵快速调试 prompt。

## 3.1 参数总览

OpenAI 兼容接口中，影响生成结果的主要参数如下：

| 参数 | 类型 | 作用 | 典型值 | 易错点 |
|------|------|------|--------|--------|
| `temperature` | float | 控制输出随机性 | 0.0 - 1.5 | 与 `top_p` 同时调容易互相抵消 |
| `max_tokens` | int | 生成 token 上限 | 50 - 4096 | 太小会被截断，太大浪费成本 |
| `top_p` | float | 核采样阈值 | 0.0 - 1.0 | 低值让输出更确定 |
| `frequency_penalty` | float | 抑制重复 token | -2.0 - 2.0 | 对结构化输出可能破坏格式 |
| `presence_penalty` | float | 抑制已出现主题 | -2.0 - 2.0 | 容易让回答跑题 |
| `stop` | list | 停止序列 | `["\n", "."] ` | 会截断输出，不是清理输出 |
| `seed` | int | 提高可复现性 | 任意整数 | 不代表完全确定性 |
| `response_format` | object | 强制输出格式 | `{"type": "json_object"}` | 必须显式要求 JSON |
| `n` | int | 返回候选数量 | 1 - 10 | 会线性增加 token 消耗 |
| `stream` | bool | 流式返回 | true/false | 响应结构变成 SSE |
| `logprobs` | bool | 返回 token 概率 | true/false | 大幅增加响应体积 |

## 3.2 temperature 与 top_p

`temperature` 是对 logits 做除法缩放：

- `temperature = 0`：概率分布变得尖锐，模型倾向选择最高概率 token。
- `temperature = 1`：保持原始分布。
- `temperature > 1`：分布更平坦，输出更随机、有创意。

```python
# 确定性回答
creative = client.chat_completion(messages=messages, temperature=1.2, max_tokens=120)
deterministic = client.chat_completion(messages=messages, temperature=0.0, max_tokens=120)
```

`top_p` 是核采样：只从累积概率达到 `top_p` 的最小 token 集合里采样。

- `top_p = 0.1`：只考虑概率最高的少量 token，输出更确定。
- `top_p = 1.0`：不排除任何 token。

**最佳实践**：通常只调 `temperature`，不要同时精细调节 `temperature` 和 `top_p`。OpenAI 官方建议：需要确定结果时两者都设低；需要创意时两者都设高，但二选一作为主力旋钮即可。

```python
# 不要这样做
crazy = client.chat_completion(messages=messages, temperature=1.5, top_p=0.9, max_tokens=120)

# 推荐
creative = client.chat_completion(messages=messages, temperature=0.9, max_tokens=120)
focused = client.chat_completion(messages=messages, temperature=0.2, max_tokens=120)
```

## 3.3 max_tokens

限制单次回复的最大 token 数。token 不等同于汉字或英文单词，一个汉字约 1-2 token，一个英文单词约 1-2 token。

```python
response = client.chat_completion(messages=messages, max_tokens=120)
if response["choices"][0]["finish_reason"] == "length":
    print("Warning: output was truncated")
```

## 3.4 frequency_penalty 与 presence_penalty

- `frequency_penalty`：根据 token 已出现次数降低其后续出现概率。解决车轱辘话。
- `presence_penalty`：只要 token 出现过就降低概率。鼓励模型引入新话题。

| 场景 | 推荐参数 |
|------|----------|
| 防止重复解释 | `frequency_penalty: 0.3-0.5` |
| 头脑风暴，希望多样化 | `presence_penalty: 0.3-0.6` |
| 结构化输出（JSON/SQL） | 两个都保持 0，避免破坏格式 |

## 3.5 stop 序列

`stop` 参数指定一个字符串列表，模型生成到任一字符串时立即停止，但**不会删除该字符串**。

```python
response = client.chat_completion(messages=messages, stop=["."], max_tokens=120)
# 输出可能在第一个句号处截断，句号本身不会出现在 content 中
```

适合场景：让模型只生成列表第一项、只回答一句话、在固定分隔符前停止。

## 3.6 seed 与可复现性

`seed` 用于提高相同输入下的可复现性，但受模型版本、负载均衡、后端优化策略影响，不能保证 100% 一致。

```python
response = client.chat_completion(messages=messages, seed=42, temperature=0.0, max_tokens=120)
```

需要严格可复现时，应配合 `temperature=0` 和规则化后处理。

## 3.7 response_format

强制模型输出 JSON：

```python
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "List three benefits of state machines. Return JSON with keys: summary, benefits."},
]
response = client.chat_completion(
    messages=messages,
    response_format={"type": "json_object"},
    max_tokens=200,
)
data = json.loads(response["choices"][0]["message"]["content"])
```

注意：

- `json_object` 要求 prompt 里出现 JSON 相关字眼，否则模型可能报错。
- 返回的仍然是字符串，需要自己做 `json.loads`。
- 某些模型支持 `json_schema` 进一步约束结构。

## 3.8 n、stream、logprobs

`n` 返回多个候选：

```python
response = client.chat_completion(messages=messages, n=3, temperature=1.0, max_tokens=60)
for i, choice in enumerate(response["choices"]):
    print(f"Choice {i}: {choice['message']['content']}")
```

`stream` 流式返回：

```python
for chunk in client.chat_completion(messages=messages, stream=True, max_tokens=120):
    delta = chunk["choices"][0]["delta"].get("content", "")
    print(delta, end="", flush=True)
```

流式适合前端展示和长文本场景，但代码复杂度更高。

`logprobs` 用于分析模型对每个 token 的置信度：

```python
response = client.chat_completion(messages=messages, logprobs=True, top_logprobs=3, max_tokens=60)
```

适合调试模型为什么选某个词，但不建议在普通业务链路中开启。

## 3.9 多语言参数示例

Node/TypeScript：

```typescript
await client.chatCompletion({
  messages,
  temperature: 0.2,
  max_tokens: 120,
  response_format: { type: "json_object" },
});
```

Go：

```go
resp, err := client.ChatCompletion(openaiclient.ChatCompletionRequest{
    Messages:      messages,
    Temperature:   floatPtr(0.2),
    MaxTokens:     intPtr(120),
    ResponseFormat: &openaiclient.ResponseFormat{Type: "json_object"},
})
```

Java：

```java
ChatCompletionRequest request = ChatCompletionRequest.builder()
    .model("gpt-4o-mini")
    .messages(messages)
    .temperature(0.2)
    .maxTokens(120)
    .build();
```

## 3.10 常见错误与调试技巧

- **temperature=0 仍不稳定**：确认是否同时设置了 seed；某些模型即使 temperature=0 也有少量随机性。
- **JSON 输出被破坏**：提高 `max_tokens`，避免 penalty，或在 system prompt 里强调“不要添加解释”。
- **输出被截断**：检查 `finish_reason` 是否为 `length`。
- **stop 序列截断导致语义不完整**：不要把关键标点作为 stop，除非明确只需要前半句。
- **n=3 但三个结果完全一样**：说明 temperature 太低或 prompt 过于确定。

## 3.11 本章练习

1. 运行 Lab 02，对比高/低 temperature 的输出差异。
2. 用 `response_format={"type": "json_object"}` 要求模型返回 `{ "city": "...", "weather": "..." }`，并解析结果。
3. 测试 `stop=["\n"]`，观察输出是否在你预期的地方停止。
4. 尝试让模型用 50 token 回答一个复杂问题，记录 `finish_reason` 和输出质量。

## 检查点

- 你能解释 temperature 和 top_p 的区别与组合建议。
- 你知道 max_tokens 被截断时如何排查。
- 你能用 response_format 获取结构化 JSON。
- 你了解 seed、n、stream 的适用场景。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\02-llm-parameters`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/02-llm-parameters`
