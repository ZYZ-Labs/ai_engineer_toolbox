# 第 7 章：规划与自我恢复

## 学习目标

- 理解“先规划再执行”的重要性。
- 实现重试循环与失败检测。
- 让模型对失败结果进行反思并修正。
- 设置重试预算和兜底策略。

## 7.1 为什么 Agent 会失败

LLM 不是确定性的程序，它会：

- 输出格式错误（JSON 截断、多余 markdown）。
- 参数值越界（端口小于 1024、replicas 为负数）。
- 误解用户意图。
- 在循环中反复犯同一个错。

一个健壮的 Agent 必须能检测失败、反思原因、尝试修复，并在超出预算时优雅退出。

## 7.2 先规划再执行

不要把所有细节都塞进一个 prompt 让模型一次性完成。复杂任务应该先让模型给出计划，再按步骤执行：

```text
User: 帮我设计一个电商订单处理 Agent

Assistant Plan:
1. 定义订单状态机
2. 列出需要的工具（查库存、扣款、通知物流）
3. 设计异常分支（库存不足、支付失败）
4. 给出核心伪代码
```

规划的好处：

- 让模型先建立全局视图，减少局部最优。
- 便于人工审查和干预。
- 每一步失败更容易定位。

## 7.3 重试与反射

Lab 06 展示了一个生成 JSON 配置并自动修复的例子：

```python
import json

SCHEMA = {
    "type": "object",
    "properties": {
        "service_name": {"type": "string"},
        "port": {"type": "integer", "minimum": 1024, "maximum": 65535},
        "replicas": {"type": "integer", "minimum": 1, "maximum": 10},
        "env": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["service_name", "port", "replicas"],
}


def validate_config(config: dict) -> str | None:
    if not isinstance(config, dict):
        return "Config must be a JSON object."
    for key in ["service_name", "port", "replicas"]:
        if key not in config:
            return f"Missing required field: {key}"
    if not (1024 <= config["port"] <= 65535):
        return "port must be between 1024 and 65535."
    if not (1 <= config["replicas"] <= 10):
        return "replicas must be between 1 and 10."
    return None


def generate_with_recovery(client, request: str, max_retries: int = 3) -> dict:
    messages = [
        {
            "role": "system",
            "content": (
                "You are a configuration generator. "
                f"Return only valid JSON matching this schema: {json.dumps(SCHEMA)}. "
                "No markdown, no explanation."
            ),
        },
        {"role": "user", "content": request},
    ]

    for attempt in range(1, max_retries + 1):
        print(f"\n--- Attempt {attempt} ---")
        response = client.chat_completion(messages=messages, temperature=0.2, max_tokens=300)
        raw = response["choices"][0]["message"]["content"]
        print("Raw output:", raw)

        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError as exc:
            error = f"Invalid JSON: {exc}"
            print(error)
            messages.append({"role": "assistant", "content": raw})
            messages.append({"role": "user", "content": f"That was not valid JSON. {error} Please retry."})
            continue

        error = validate_config(parsed)
        if error is None:
            return parsed

        print("Validation error:", error)
        messages.append({"role": "assistant", "content": raw})
        messages.append({"role": "user", "content": f"Validation failed: {error}. Fix the JSON and retry."})

    raise RuntimeError("Failed to generate valid config after max retries.")
```

## 7.4 重试策略矩阵

| 失败类型 | 是否重试 | 策略 |
|----------|----------|------|
| JSON 解析失败 | 是 | 把错误信息回传，要求重试 |
| 字段缺失 | 是 | 明确告知缺失字段 |
| 值越界 | 是 | 告知合法范围 |
| 网络超时 | 是 | 指数退避 |
| 模型完全跑题 | 否 | 返回兜底结果或转人工 |
| 重试预算耗尽 | 否 | 抛出异常或返回默认值 |

## 7.5 反思提示词

把失败信息直接塞回对话是一种简单的反思：

```text
Assistant: {"port": 80, "replicas": 3}
User: Validation failed: port must be between 1024 and 65535. Fix the JSON and retry.
```

更高级的做法是让模型先总结错误原因，再生成修正版本：

```text
User: The previous output was invalid because port 80 is reserved.
Please reflect on the mistake and produce a corrected config.
```

## 7.6 多语言思路

Node/TypeScript 重试骨架：

```typescript
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  const response = await client.chatCompletion({ messages, temperature: 0.2, max_tokens: 300 });
  const raw = response.choices[0].message.content ?? "";
  try {
    const parsed = JSON.parse(raw);
    const error = validateConfig(parsed);
    if (!error) return parsed;
    messages.push({ role: "assistant", content: raw });
    messages.push({ role: "user", content: `Validation failed: ${error}. Fix and retry.` });
  } catch (e) {
    messages.push({ role: "assistant", content: raw });
    messages.push({ role: "user", content: `Invalid JSON: ${e}. Please retry.` });
  }
}
throw new Error("Max retries exceeded");
```

Go 重试骨架：

```go
for attempt := 1; attempt <= maxRetries; attempt++ {
    resp, _ := client.ChatCompletion(openaiclient.ChatCompletionRequest{
        Messages: messages,
        Temperature: floatPtr(0.2),
        MaxTokens: intPtr(300),
    })
    raw := resp.Choices[0].Message.Content
    var parsed map[string]interface{}
    if err := json.Unmarshal([]byte(raw), &parsed); err != nil {
        messages = append(messages,
            openaiclient.Message{Role: "assistant", Content: raw},
            openaiclient.Message{Role: "user", Content: fmt.Sprintf("Invalid JSON: %v", err)},
        )
        continue
    }
    if err := validateConfig(parsed); err != nil {
        messages = append(messages,
            openaiclient.Message{Role: "assistant", Content: raw},
            openaiclient.Message{Role: "user", Content: fmt.Sprintf("Validation failed: %v", err)},
        )
        continue
    }
    return parsed
}
```

## 7.7 常见错误与调试技巧

- **重试但问题不变**：错误提示不够具体，模型无法定位原因。应给出字段级错误。
- **重试次数太多**：设置硬性上限，并在失败后返回兜底或人工介入。
- **把错误信息当普通用户输入**：用正确的 `role` 区分，避免污染用户真实意图。
- **重试导致成本失控**：记录每次重试的 token 消耗，异常时告警。

## 7.8 本章练习

1. 运行 Lab 06，观察模型如何在 JSON 错误时自我修复。
2. 修改 schema，新增 `health_check_path` 字段，测试模型是否能正确生成。
3. 故意让请求非常模糊，看重试是否陷入循环，思考如何改进提示词。
4. 为重试逻辑增加指数退避和日志记录。

## 检查点

- 你能解释为什么 Agent 需要先规划再执行。
- 你能实现带重试预算的自我修复循环。
- 你知道如何把验证错误回传给模型。
- 你能为重试失败设计兜底策略。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\06-planning-recovery`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/06-planning-recovery`
