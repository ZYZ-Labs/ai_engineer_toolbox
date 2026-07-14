# 第 34 章：Agent 测试与评估

## 学习目标

- 区分单元测试、集成测试与端到端评估在 Agent 中的不同作用。
- 掌握 LLM-as-judge 的基本写法与评分维度设计。
- 能建立可复现的回归基准（golden set）并接入 CI。
- 避免用“跑一次没问题”当作 Agent 已验证。

## 34.1 为什么 Agent 测试比普通服务更难

普通服务的输出由代码决定，给定输入必有确定输出；Agent 的输出由模型决定，具有随机性。测试 Agent 时需要：

- 把**确定逻辑**和**模型调用**分开测。
- 用 mock 或 vcr 让模型调用可复现。
- 对模型输出用规则 + 评分模型做双重校验。

## 34.2 单元测试：测_parser、state、工具函数

这些部分不依赖模型，必须 100% 稳定。

```python
# test_parse_action.py
from agent import parse_action

def test_parse_action_json():
    text = '```json\n{"tool":"search","args":{"q":"python"}}\n```'
    action = parse_action(text)
    assert action.tool == "search"
    assert action.args["q"] == "python"

def test_parse_action_rejects_unknown_tool():
    text = '{"tool":"rm_rf","args":{"path":"/"}}'
    action = parse_action(text, allowed_tools={"search"})
    assert action is None
```

Node.js/TypeScript 示例：

```typescript
import { parseAction } from "./agent";

describe("parseAction", () => {
  it("parses JSON action block", () => {
    const action = parseAction('```json\n{"tool":"search","args":{"q":"ts"}}\n```');
    expect(action.tool).toBe("search");
  });

  it("rejects unknown tools", () => {
    const action = parseAction('{"tool":"rm"}', new Set(["search"]));
    expect(action).toBeNull();
  });
});
```

## 34.3 集成测试：mock LLM，保留工具链路

用预先录制的响应或固定 mock 替换 LLM，保证测试既覆盖链路又稳定。

```python
import json
from unittest.mock import MagicMock
from agent import AgentLoop

def test_agent_runs_search_tool():
    agent = AgentLoop(tools={"search": fake_search})
    agent.client = MagicMock()
    agent.client.chat.completions.create.return_value = MagicMock(
        choices=[MagicMock(message=MagicMock(content=json.dumps({
            "thought": "I need to search.",
            "tool": "search",
            "args": {"q": "pytest"},
        })))]
    )
    result = agent.run("how to test python")
    assert "pytest" in result
```

## 34.4 LLM-as-Judge：用模型给模型打分

把待测输出交给另一个更稳定的模型，按评分标准打分。

```python
from openai import OpenAI

JUDGE_PROMPT = """
You are an evaluator. Rate the assistant's answer on a scale of 1-5 for:
1. Correctness
2. Helpfulness
3. Conciseness
Return JSON: {"correctness": int, "helpfulness": int, "conciseness": int, "reason": str}
"""

def judge(question: str, answer: str) -> dict:
    client = OpenAI()
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": JUDGE_PROMPT},
            {"role": "user", "content": f"Question: {question}\nAnswer: {answer}"},
        ],
        response_format={"type": "json_object"},
        temperature=0.0,
    )
    return json.loads(resp.choices[0].message.content)
```

## 34.5 回归基准与 Golden Set

Golden set 是一组经过人工确认“标准答案”的输入输出对，用于回归测试。

| 字段 | 说明 |
|------|------|
| `id` | 用例唯一编号 |
| `input` | 用户请求 + 上下文 |
| `expected_tools` | 期望调用的工具及顺序 |
| `expected_answer_contains` | 答案中必须包含的关键信息 |
| `forbidden_phrases` | 禁止出现的幻觉或违规表述 |
| `judge_score_min` | LLM-as-judge 最低分 |

```python
# golden_set.jsonl 示例
{"id":"g001","input":"查询订单 1001 的状态","expected_tools":["query_order"],"expected_answer_contains":["订单号","状态"],"forbidden_phrases":["我不知道"]}
```

回归测试 runner：

```python
def run_golden_set(path: str):
    failures = []
    for case in load_jsonl(path):
        result = agent.run(case["input"])
        if not all(p in result for p in case["expected_answer_contains"]):
            failures.append((case["id"], "missing key info"))
        if any(p in result for p in case["forbidden_phrases"]):
            failures.append((case["id"], "forbidden phrase"))
    assert not failures, failures
```

## 34.6 评估指标速查

| 指标 | 适用场景 | 实现方式 |
|------|----------|----------|
| Exact Match | 结构化输出、SQL、代码 | `output == expected` |
| 语义相似度 | 开放式问答 | embedding cosine / BERTScore |
| Tool Call Accuracy | 多步 Agent | 比较工具名和参数 |
| Hallucination Rate | 知识密集型 | 事实抽取 + 外部校验 |
| Pass@k | 代码生成 | 执行 k 个候选看是否通过 |
| Latency / Token Cost | 性能回归 | 监控并设阈值 |

## 34.7 本章练习

1. 为一个 `parse_action` 函数写 5 条单元测试，覆盖正常、缺失字段、未知工具三种情况。
2. 用 mock 替换 LLM，写一个集成测试验证 Agent 在收到“查天气”时会调用 `weather` 工具。
3. 设计 3 条 golden set 用例，要求至少包含工具调用顺序校验。
4. 实现一个 LLM-as-judge 评分函数，并对 5 条真实输出打分。

## 检查点

- 你能把 Agent 拆成可单元测试的模块。
- 你知道如何用 mock 或 vcr 做集成测试。
- 你能解释 golden set 的字段设计和回归用法。
- 你能用 LLM-as-judge 做主观质量评估。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\26-testing-evals`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/26-testing-evals`
