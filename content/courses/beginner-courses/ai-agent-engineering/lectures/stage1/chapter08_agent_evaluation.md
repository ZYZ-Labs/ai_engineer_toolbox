# 第 8 章：Agent 评估

## 学习目标

- 理解为什么 Agent 比传统代码更需要评估。
- 掌握规则检查与 LLM-as-judge 两种评估方式。
- 设计最小可复用的测试集。
- 收集和解读评估指标。

## 8.1 为什么评估 Agent 很难

传统单元测试：输入固定，输出确定，断言通过即正确。

Agent 测试：输入固定，输出可能有多种合理形式，且涉及多轮工具调用。你需要判断：

- 最终答案是否正确。
- 中间步骤是否合理。
- 是否 unnecessary tool calls。
- 是否遵守格式约束。
- 成本是否在可接受范围。

## 8.2 评估金字塔

| 层级 | 方法 | 优点 | 缺点 |
|------|------|------|------|
| 规则检查 | 关键词、正则、JSON Schema | 快速、稳定、可解释 | 只能覆盖已知模式 |
| LLM-as-judge | 用另一个模型打分 | 能评估语义质量 | 成本更高，有一定随机性 |
| 人工评审 | 人逐条检查 | 最准确 | 慢、贵、不可扩展 |
| 端到端测试 | 模拟用户完整会话 | 贴近真实 | 维护成本高 |

生产环境通常组合使用：规则检查做守门，LLM-as-judge 做语义补充，人工抽检做校准。

## 8.3 规则检查

最基础也最重要：

```python
def rule_check(answer: str, keywords: list[str]) -> dict:
    missing = [kw for kw in keywords if kw.lower() not in answer.lower()]
    return {"passed": not missing, "missing": missing}


def json_schema_check(answer: str, schema: dict) -> dict:
    try:
        data = json.loads(answer)
    except json.JSONDecodeError as exc:
        return {"passed": False, "error": f"Invalid JSON: {exc}"}
    # 用 jsonschema 或手动校验
    return {"passed": True, "data": data}
```

规则检查适合：

- 输出必须包含某些关键词。
- 输出必须是合法 JSON。
- 字段类型和取值范围固定。
- 不能出现敏感词或某些禁用表达。

## 8.4 LLM-as-judge

用另一个 LLM 对答案打分：

```python
def llm_judge(client, answer: str, reference: str) -> dict:
    prompt = f"""Rate how well the following answer matches the reference answer.
Answer: {answer}
Reference: {reference}
Respond with JSON only: {{"score": 1-10, "reason": "..."}}"""
    response = client.chat_completion(
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_tokens=200,
        temperature=0.0,
    )
    return json.loads(response["choices"][0]["message"]["content"])
```

为了提高稳定性：

- 使用 `temperature=0`。
- 给出清晰的评分维度和示例。
- 对边界样本做人工校准。
- 记录 judge 的 score 分布，发现 drift 时及时调整。

## 8.5 测试集与指标

Lab 07 的测试集结构：

```python
TEST_CASES = [
    {
        "input": "What port range is safe for user services?",
        "expected_keywords": ["1024", "65535"],
        "reference": "User services should use ports from 1024 to 65535.",
    },
    {
        "input": "Explain idempotency in one sentence.",
        "expected_keywords": ["same", "multiple", "result"],
        "reference": "Idempotency means calling an operation multiple times produces the same result.",
    },
]
```

完整评估流程：

```python
def evaluate_agent(client, agent_fn) -> list[dict]:
    results = []
    for case in TEST_CASES:
        answer = agent_fn(client, case["input"])
        rule_result = rule_check(answer, case["expected_keywords"])
        judge_result = llm_judge(client, answer, case["reference"])
        results.append({
            "input": case["input"],
            "answer": answer,
            "rule_passed": rule_result["passed"],
            "missing_keywords": rule_result["missing"],
            "judge_score": judge_result.get("score"),
            "judge_reason": judge_result.get("reason"),
        })
    return results
```

常用指标：

| 指标 | 说明 |
|------|------|
| 规则通过率 | 通过规则检查的样本比例 |
| 平均 judge 分 | LLM 打分的平均值 |
| 成本/样本 | 平均 token 消耗与费用 |
| 延迟/样本 | 平均响应时间 |
| 工具调用准确率 | 正确调用的工具比例 |

## 8.6 多语言思路

Node/TypeScript 评估骨架：

```typescript
async function evaluateAgent(client: OpenAIClient, agentFn: AgentFn) {
  const results = [];
  for (const testCase of TEST_CASES) {
    const answer = await agentFn(client, testCase.input);
    const rule = ruleCheck(answer, testCase.expectedKeywords);
    const judge = await llmJudge(client, answer, testCase.reference);
    results.push({ input: testCase.input, answer, rulePassed: rule.passed, judgeScore: judge.score });
  }
  const passed = results.filter(r => r.rulePassed).length;
  const avgScore = results.reduce((sum, r) => sum + (r.judgeScore ?? 0), 0) / results.length;
  console.log(`Rule checks passed: ${passed}/${results.length}`);
  console.log(`Average judge score: ${avgScore.toFixed(1)}/10`);
}
```

Go 评估骨架：

```go
func evaluateAgent(client *openaiclient.Client, agentFn AgentFn) []Result {
    var results []Result
    for _, tc := range testCases {
        answer := agentFn(client, tc.Input)
        rule := ruleCheck(answer, tc.ExpectedKeywords)
        judge := llmJudge(client, answer, tc.Reference)
        results = append(results, Result{
            Input: answer,
            RulePassed: rule.Passed,
            JudgeScore: judge.Score,
        })
    }
    return results
}
```

## 8.7 常见错误与调试技巧

- **测试集太小**：至少覆盖成功、失败、边界三种情况。
- **judge 太宽容**：prompt 里明确要求按维度打分，并给出低分示例。
- **规则过强**：不要让规则检查变成“只能输出固定句子”，否则失去评估意义。
- **忽略成本**：记录每个测试用例的 token 消耗，避免评估本身太贵。
- **不校准 judge**：定期拿人工评分与 judge 评分对比，必要时微调 prompt。

## 8.8 本章练习

1. 运行 Lab 07，观察规则检查与 LLM judge 的结果差异。
2. 增加一个测试用例，要求输出包含特定 JSON key。
3. 修改 judge prompt，让评分维度更细（准确性、简洁性、格式正确性）。
4. 用同一个 Agent 跑三次测试集，观察 judge 分数波动范围。

## 检查点

- 你能解释 Agent 评估为什么比单元测试更复杂。
- 你能写规则检查函数。
- 你能实现 LLM-as-judge 打分。
- 你能设计包含输入、参考答案、关键词的测试用例。
- 你能汇总通过率和平均 judge 分。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\07-agent-evaluation`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/07-agent-evaluation`
