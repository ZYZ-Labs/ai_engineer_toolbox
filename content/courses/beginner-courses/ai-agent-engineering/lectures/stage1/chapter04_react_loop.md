# 第 4 章：手写 ReAct 循环

## 学习目标

- 理解 ReAct（Reasoning + Acting）的核心思想。
- 手写 Thought / Action / Observation 循环。
- 学会解析模型输出并调用简单工具。
- 认识循环终止条件与最大步数保护。

## 4.1 为什么需要循环

单轮 LLM 调用只能做一次性文本生成。如果任务需要多步推理、查资料、计算、验证，就需要让模型反复思考、行动、观察结果，直到完成目标。

ReAct 把这一过程显式化：

```
Thought: 我需要先计算括号里的加法
Action: calculator(128 + 256)
Observation: 384
Thought: 然后乘以 2
Action: calculator(384 * 2)
Observation: 768
Thought: 最后减去 100
Action: calculator(768 - 100)
Observation: 668
Final Answer: 668
```

## 4.2 ReAct 三步曲

| 步骤 | 英文名 | 由谁生成/执行 | 作用 |
|------|--------|---------------|------|
| 思考 | Thought | 模型生成 | 解释当前状态和下一步计划 |
| 行动 | Action | 模型生成，程序解析并执行 | 调用工具或结束 |
| 观察 | Observation | 程序生成，回传给模型 | 把工具结果反馈给模型 |

循环伪代码：

```python
while not done and steps < max_steps:
    thought_action = llm.generate(prompt)
    if "Final Answer" in thought_action:
        return extract_answer(thought_action)
    tool_name, args = parse_action(thought_action)
    observation = execute_tool(tool_name, args)
    prompt += f"\nObservation: {observation}"
```

## 4.3 手写 ReAct Agent

Lab 03 实现了一个支持 `calculator` 和 `finish` 两个工具的简单 Agent：

```python
import re

SYSTEM_PROMPT = """You are a helpful assistant that solves problems step by step.
You must follow this format exactly:

Thought: describe your reasoning
Action: tool_name(arg1, arg2, ...)
Observation: the result of the action (provided by the system)
...
Final Answer: the final answer

Available tools:
- calculator(expression: str) - evaluates a Python arithmetic expression safely
- finish(answer: str) - use when you have the final answer
"""


def calculator(expression: str) -> str:
    allowed = set("0123456789+-*/(). ")
    if not all(c in allowed for c in expression):
        return "Error: invalid characters"
    try:
        return str(eval(expression))
    except Exception as exc:
        return f"Error: {exc}"


def parse_action(text: str):
    match = re.search(r"Action:\s*(\w+)\((.*)\)", text)
    if not match:
        return None
    tool_name = match.group(1)
    args = [a.strip().strip('"').strip("'") for a in match.group(2).split(",") if a.strip()]
    return tool_name, args


def run_react(client, question: str, max_steps: int = 10) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": question},
    ]

    for step in range(max_steps):
        response = client.chat_completion(messages=messages, temperature=0.0, max_tokens=200)
        text = response["choices"][0]["message"]["content"]
        print(f"\n--- Step {step + 1} ---")
        print(text)

        if "Final Answer:" in text:
            return text.split("Final Answer:", 1)[1].strip()

        parsed = parse_action(text)
        if not parsed:
            observation = "Observation: I did not understand the action. Please use 'Action: tool_name(args)'."
        else:
            tool_name, args = parsed
            if tool_name == "calculator" and args:
                result = calculator(args[0])
                observation = f"Observation: {result}"
            else:
                observation = f"Observation: unknown tool '{tool_name}'"

        print(observation)
        messages.append({"role": "assistant", "content": text})
        messages.append({"role": "user", "content": observation})

    return "Reached max steps without final answer."
```

## 4.4 提示词工程是 ReAct 的核心

提示词必须明确告诉模型：

1. 输出格式（Thought / Action / Observation / Final Answer）。
2. 有哪些工具，每个工具的名称、参数、返回值。
3. 何时停止，如何给出最终答案。

一个好的 system prompt 示例：

```text
You must use this format:
Thought: <your reasoning>
Action: <tool_name>(<args>)
Observation: <result will be inserted by system>
...
Final Answer: <final answer>

Available tools:
- search(query: str) -> list of documents
- calculator(expression: str) -> result
- finish(answer: str) -> ends the task
```

## 4.5 多语言思路

Node/TypeScript 的循环骨架：

```typescript
async function runReAct(client: OpenAIClient, question: string, maxSteps = 10) {
  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: question },
  ];

  for (let step = 0; step < maxSteps; step++) {
    const response = await client.chatCompletion({ messages, temperature: 0, max_tokens: 200 });
    const text = response.choices[0].message.content ?? "";

    if (text.includes("Final Answer:")) {
      return text.split("Final Answer:")[1].trim();
    }

    const observation = executeTool(text);
    messages.push({ role: "assistant", content: text });
    messages.push({ role: "user", content: observation });
  }
  return "Reached max steps";
}
```

Go 的循环骨架：

```go
for step := 0; step < maxSteps; step++ {
    resp, _ := client.ChatCompletion(openaiclient.ChatCompletionRequest{
        Messages: messages,
        Temperature: floatPtr(0),
        MaxTokens: intPtr(200),
    })
    text := resp.Choices[0].Message.Content
    if strings.Contains(text, "Final Answer:") {
        return strings.SplitN(text, "Final Answer:", 2)[1]
    }
    observation := executeTool(text)
    messages = append(messages,
        openaiclient.Message{Role: "assistant", Content: text},
        openaiclient.Message{Role: "user", Content: observation},
    )
}
```

## 4.6 常见错误与调试技巧

- **模型不遵循格式**：降低 temperature，增强 system prompt，必要时给出 one-shot 示例。
- **Action 解析失败**：检查正则是否覆盖括号、引号、逗号空格等边界情况。
- **无限循环**：必须设置 `max_steps`，并检查终止条件是否被触发。
- **Observation 没回传**：模型之所以继续胡思乱想，往往是因为程序没有把工具结果写回消息列表。
- **工具执行不安全**：示例里用 `eval` 只是演示，生产环境必须用沙箱或数学库替代。

## 4.7 本章练习

1. 运行 Lab 03，观察 ReAct 循环的每一步输出。
2. 给 `calculator` 增加 `sqrt` 支持，修改 system prompt，测试 `(128 + 256) * 2 - sqrt(100)`。
3. 尝试把 temperature 提高到 0.7，看模型是否还能稳定遵循格式。
4. 为解析失败的情况添加更友好的重试逻辑。

## 检查点

- 你能解释 ReAct 中 Thought、Action、Observation 的关系。
- 你能手写一个带最大步数保护的 ReAct 循环。
- 你能解析模型输出并调用本地工具。
- 你知道为什么提示词工程对 ReAct 至关重要。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\03-react-loop`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/03-react-loop`
