# 第 26 章：多智能体协作模式

## 学习目标

- 理解 Router、Supervisor、Worker、Aggregator、Reviewer 五种常见模式。
- 能根据任务复杂度选择合适的协作拓扑。
- 掌握多 Agent 系统中的消息传递、上下文共享与结果合并。
- 识别多 Agent 带来的新风险：循环调用、职责模糊、成本失控。

## 26.1 为什么需要多 Agent

单个 Agent 的能力边界明显：

- 上下文窗口有限
- 工具过多时决策质量下降
- 专业领域（安全、法律、代码）需要专门知识

把任务拆给多个 Agent，就像把大团队拆成小组：每个 Agent 职责单一，最后合并结果。

## 26.2 Router 模式

Router 负责根据输入把任务分发给合适的下游 Agent。

```python
class RouterAgent:
    def __init__(self, agents):
        self.agents = agents  # { "billing": ..., "tech": ..., "general": ... }

    def route(self, query: str) -> str:
        intent = self.classify(query)  # LLM 或规则分类
        return self.agents[intent].run(query)

    def classify(self, query: str) -> str:
        # 简化示例：关键词规则
        if "账单" in query or "扣费" in query:
            return "billing"
        if "bug" in query.lower() or "报错" in query:
            return "tech"
        return "general"
```

适用：客服、内部问答、多领域助手。  
风险：分类错误会级联影响结果。

## 26.3 Supervisor-Worker 模式

Supervisor 拆解任务并委派给 Worker，Worker 只负责执行子任务，Supervisor 做最终汇总。

```python
class Supervisor:
    def __init__(self, workers):
        self.workers = workers

    def run(self, task: str) -> dict:
        plan = self.plan(task)          # 拆成子任务
        results = {}
        for step in plan:
            worker = self.workers[step["agent"]]
            results[step["id"]] = worker.run(step["instruction"])
        return self.synthesize(task, results)

class Worker:
    def run(self, instruction: str) -> str:
        return llm_call(instruction)
```

适用：复杂研究、代码生成、报告撰写。  
关键：Supervisor 必须清楚每个 Worker 的能力边界。

## 26.4 Aggregator 模式

Aggregator 把多个 Agent 的输出合并成统一结果。

```python
def aggregate(reports: list[str]) -> str:
    prompt = f"""以下是三位专家的评审意见，请合并为一份结构化的最终报告：
{chr(10).join(reports)}
"""
    return llm_call(prompt)
```

适用：评审、投票、多视角分析。  
注意：Aggregator 本身也可以是 LLM，需要防止“少数意见被淹没”。

## 26.5 Reviewer 模式

Reviewer 不直接产出主结果，而是对主 Agent 的输出做检查、打分或提出修改建议。

```python
class Reviewer:
    def review(self, draft: str, criteria: list[str]) -> dict:
        prompt = f"请按以下标准评审以下内容：{criteria}\n\n{draft}"
        return parse_json(llm_call(prompt))  # { "score": 8, "issues": [...] }

class Author:
    def write(self, topic: str, feedback: dict = None) -> str:
        if feedback:
            topic += f"\n（上一轮反馈：{feedback}）"
        return llm_call(f"请撰写：{topic}")
```

适用：代码审查、合同审查、安全评估。  
关键：Reviewer 必须有明确、可执行的评分标准。

## 26.6 五种模式对比

| 模式 | 核心职责 | 输入 | 输出 | 典型场景 | 主要风险 |
|------|----------|------|------|----------|----------|
| Router | 分发 | 用户请求 | 下游 Agent 名称/调用 | 客服、多领域问答 | 分类错误 |
| Supervisor | 拆解与汇总 | 复杂任务 | 最终答案 | 研报生成、代码生成 | 计划不合理 |
| Worker | 执行子任务 | 子任务指令 | 子结果 | 检索、计算、摘要 | 上下文不足 |
| Aggregator | 合并 | 多份结果 | 统一报告 | 评审、投票 | 丢失少数意见 |
| Reviewer | 检查 | 初稿/结果 | 评分与建议 | 代码/合同审查 | 标准模糊 |

## 26.7 多语言协作示例

TypeScript 中用接口约束 Worker：

```typescript
interface Worker {
  name: string;
  run(instruction: string): Promise<string>;
}

class SupervisorAgent {
  constructor(private workers: Record<string, Worker>) {}

  async run(task: string): Promise<string> {
    const plan = await this.plan(task);
    const results = await Promise.all(
      plan.map((step) => this.workers[step.agent].run(step.instruction))
    );
    return this.synthesize(results);
  }
}
```

Go 用 interface 表达同样的思想：

```go
type Worker interface {
    Run(ctx context.Context, instruction string) (string, error)
}

type Supervisor struct {
    workers map[string]Worker
}

func (s *Supervisor) Run(ctx context.Context, task string) (string, error) {
    plan := s.Plan(task)
    var results []string
    for _, step := range plan {
        r, err := s.workers[step.Agent].Run(ctx, step.Instruction)
        if err != nil { return "", err }
        results = append(results, r)
    }
    return s.Synthesize(results), nil
}
```

## 26.8 常见错误与注意事项

- **错误 1**：Agent 之间职责重叠，导致互相踢皮球或重复工作。
- **错误 2**：上下文传递过长，每个 Worker 都收到整段历史，成本激增。
- **错误 3**：缺少全局状态，Worker 各自为战，结果无法合并。
- **错误 4**：Reviewer 只给分数不给修改建议，Author 无法改进。
- **错误 5**：Supervisor 过度拆解，子任务粒度太细，通信开销超过收益。

## 26.9 本章练习

1. 为你当前项目设计一个 Router，列出至少 3 个领域 Agent 和分类规则。
2. 用 Supervisor-Worker 实现一个“技术调研 Agent”：Supervisor 拆成资料检索、总结、风险评估，Worker 分别执行。
3. 给 26.5 的 Reviewer 增加一个“强制通过阈值”：低于 6 分必须返回修改建议。
4. 运行 Lab 18，观察不同协作模式的输出差异。

## 检查点

- 你能说出五种模式各自的角色和输出。
- 你能画出 Router、Supervisor-Worker、Reviewer 三种拓扑图。
- 你知道多 Agent 系统最常见的三个风险：分类错误、上下文爆炸、职责重叠。
- 你能用代码实现一个 Supervisor-Worker 协作链路。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\18-multi-agent-patterns`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/18-multi-agent-patterns`
