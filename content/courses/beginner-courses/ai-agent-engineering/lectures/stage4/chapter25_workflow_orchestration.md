# 第 25 章：从状态机到 DAG：工作流编排基础

## 学习目标

- 理解状态机、DAG 与事件驱动三种编排模型的适用场景。
- 能根据任务特性选择串行、并行、条件分支或重试策略。
- 手写一个最小化的内存工作流引擎，理解其核心抽象。
- 为后续 LangGraph、Temporal 等框架学习建立概念基础。

## 25.1 为什么需要编排

Agent 的任务往往不是一次 LLM 调用就能完成的。真实链路会包含：

- 多次工具调用
- 条件分支（if/else）
- 并行子任务
- 失败重试与状态恢复

把这些步骤硬编码在 `if/else` 里，很快会变成“面条代码”。编排（Orchestration）就是把控制流显式化、可视化、可测试。

```python
# 不推荐：控制流散落在业务代码中
def handle_order(order):
    if validate(order):
        pay = charge(order)
        if pay.ok:
            ship(order)
        else:
            notify(order)
```

编排引擎把“做什么”和“怎么做”分开：业务逻辑写在节点里，控制流交给引擎。

## 25.2 状态机（State Machine）

状态机 = 一组状态 + 事件 + 转移函数。适合步骤清晰、事件触发明确的场景。

```python
class OrderWorkflow:
    STATES = {"pending", "paid", "shipped", "cancelled"}

    TRANSITIONS = {
        "pending": {"pay": "paid", "cancel": "cancelled"},
        "paid": {"ship": "shipped", "refund": "cancelled"},
    }

    def __init__(self):
        self.state = "pending"

    def trigger(self, event: str) -> bool:
        if event in self.TRANSITIONS.get(self.state, {}):
            self.state = self.TRANSITIONS[self.state][event]
            return True
        return False
```

优点：行为确定、可验证、容易画成状态图。  
缺点：状态爆炸时难以维护；不适合复杂并行。

## 25.3 DAG（有向无环图）

DAG 把任务表示为节点，依赖表示为边。只要依赖满足，节点就可以执行，天然支持并行。

```python
from collections import deque

def run_dag(nodes, edges):
    in_degree = {n: 0 for n in nodes}
    graph = {n: [] for n in nodes}
    for src, dst in edges:
        graph[src].append(dst)
        in_degree[dst] += 1

    queue = deque([n for n in nodes if in_degree[n] == 0])
    while queue:
        current = queue.popleft()
        print(f"execute {current}")
        for nxt in graph[current]:
            in_degree[nxt] -= 1
            if in_degree[nxt] == 0:
                queue.append(nxt)
```

适用：ETL、数据流水线、代码审查报告生成等多步骤依赖任务。

## 25.4 事件驱动编排

事件驱动用“事件总线”解耦步骤。上游步骤完成后发布事件，下游监听并执行。

```python
class EventBus:
    def __init__(self):
        self.handlers = {}

    def on(self, event_type, handler):
        self.handlers.setdefault(event_type, []).append(handler)

    def emit(self, event_type, payload):
        for h in self.handlers.get(event_type, []):
            h(payload)
```

适合：异步、多服务、需要削峰填谷的链路。  
风险：事件顺序、幂等、观测性需要额外设计。

## 25.5 三种模型对比

| 模型 | 控制流 | 并行能力 | 典型场景 | 主要风险 |
|------|--------|----------|----------|----------|
| 状态机 | 事件触发转移 | 弱 | 订单状态、审批流 | 状态爆炸、非法转移 |
| DAG | 依赖决定执行顺序 | 强 | 数据流水线、报表生成 | 循环依赖、重跑复杂 |
| 事件驱动 | 事件订阅/发布 | 中 | 微服务协作、异步任务 | 乱序、重复、调试困难 |

## 25.6 手写最小编排引擎

下面是一个同时支持状态机 + DAG 的最小引擎：

```python
class MiniEngine:
    def __init__(self, nodes, edges, state_machine=None):
        self.nodes = nodes          # name -> callable
        self.edges = edges          # list of (src, dst)
        self.sm = state_machine or {}
        self.results = {}

    def run(self, start, ctx):
        executed = set()
        queue = [start]
        while queue:
            name = queue.pop(0)
            if name in executed:
                continue
            # 检查状态机是否允许
            allowed = self.sm.get("from", [])
            if allowed and ctx.get("state") not in allowed:
                continue
            self.results[name] = self.nodes[name](ctx)
            executed.add(name)
            # 将下游加入队列
            for src, dst in self.edges:
                if src == name:
                    queue.append(dst)
        return self.results
```

> 真实引擎还需要处理失败重试、幂等、持久化、超时等，本章只做概念演示。

## 25.7 多语言编排示例

TypeScript 中用 Promise 链实现 DAG：

```typescript
async function runDag(tasks: Map<string, () => Promise<any>>, deps: [string, string][]) {
  const inDegree = new Map<string, number>();
  const graph = new Map<string, string[]>();
  for (const [name] of tasks) { inDegree.set(name, 0); graph.set(name, []); }
  for (const [src, dst] of deps) { graph.get(src)!.push(dst); inDegree.set(dst, inDegree.get(dst)! + 1); }
  const queue = [...inDegree.entries()].filter(([, d]) => d === 0).map(([n]) => n);
  while (queue.length) {
    const name = queue.shift()!;
    await tasks.get(name)!();
    for (const nxt of graph.get(name)!) {
      inDegree.set(nxt, inDegree.get(nxt)! - 1);
      if (inDegree.get(nxt) === 0) queue.push(nxt);
    }
  }
}
```

Go 用 channel + goroutine 表达事件：

```go
func emit(event string, ch chan<- string) {
    ch <- event
}

func worker(ch <-chan string) {
    for e := range ch {
        fmt.Println("handle", e)
    }
}
```

## 25.8 常见错误与注意事项

- **错误 1**：DAG 里出现循环依赖。编排前必须检查图是否无环。
- **错误 2**：状态机不写非法转移处理，导致静默跳过或状态错误。
- **错误 3**：事件驱动没有幂等键，同一事件被处理多次。
- **错误 4**：把“编排”和“业务”混写，导致既无法复用节点也难以单测。
- **错误 5**：过度设计：简单三步串行任务硬要上 Temporal。

## 25.9 本章练习

1. 画出你当前系统中最复杂的一个流程，用状态机、DAG、事件驱动三种方式分别表达。
2. 在上面的最小引擎中加入“失败重试 3 次”的能力。
3. 实现一个函数检测 DAG 是否存在环，并给出出错节点列表。
4. 阅读 Lab 17，运行状态机与 DAG 两个示例。

## 检查点

- 你能解释状态机、DAG、事件驱动的核心差异。
- 你能手写一个支持依赖执行的 DAG 运行器。
- 你知道编排里为什么要检查循环依赖、处理非法转移。
- 你明确了何时该用框架、何时手写足够。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\17-workflow-orchestration`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/17-workflow-orchestration`
