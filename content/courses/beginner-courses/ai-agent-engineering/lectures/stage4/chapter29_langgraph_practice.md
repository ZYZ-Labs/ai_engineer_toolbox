# 第 29 章：LangGraph 实践

## 学习目标

- 理解 LangGraph 的核心抽象：StateGraph、Node、Edge、Conditional Edge。
- 能构建一个带状态持久化的多步 Agent 图。
- 掌握检查点（checkpoint）与重新执行（replay）的用法。
- 能在 LangGraph 中实现循环、条件分支和人工审批点。

## 29.1 LangGraph 是什么

LangGraph 是 LangChain 团队推出的图编排框架。它把 Agent 执行过程建模为“状态图”：

- **State**：整个图共享的数据结构
- **Node**：执行具体逻辑的函数
- **Edge**：节点之间的普通转移
- **Conditional Edge**：根据状态动态决定下一步

相比简单链式调用，LangGraph 天然支持循环、条件分支和持久化。

## 29.2 状态图（StateGraph）

```python
from typing import TypedDict, Annotated
from operator import add
from langgraph.graph import StateGraph, END

class AgentState(TypedDict):
    question: str
    context: list[str]
    answer: str
    retry_count: int

graph = StateGraph(AgentState)
```

`AgentState` 是所有节点共享的“账本”。节点可以读取、修改它。

## 29.3 节点（Node）

节点是接收并返回 State 的函数。

```python
def retrieve(state: AgentState) -> AgentState:
    state["context"] = [f"doc about {state['question']}"]
    return state

def generate(state: AgentState) -> AgentState:
    state["answer"] = f"Answer based on {state['context']}"
    return state

graph.add_node("retrieve", retrieve)
graph.add_node("generate", generate)
```

## 29.4 边（Edge）与条件边

普通边直接连接两个节点；条件边根据状态返回下一个节点名称。

```python
def route(state: AgentState):
    if not state["context"]:
        return "retrieve"
    if len(state["answer"]) < 20 and state["retry_count"] < 3:
        return "generate"
    return END

graph.set_entry_point("retrieve")
graph.add_edge("retrieve", "generate")
graph.add_conditional_edges("generate", route)
```

## 29.5 完整示例：带重试的研究 Agent

```python
from langgraph.checkpoint.memory import MemorySaver

builder = StateGraph(AgentState)
builder.add_node("retrieve", retrieve)
builder.add_node("generate", generate)
builder.set_entry_point("retrieve")
builder.add_edge("retrieve", "generate")
builder.add_conditional_edges("generate", route)

# 内存检查点，生产环境可换成 Redis/SQLite 持久化
memory = MemorySaver()
app = builder.compile(checkpointer=memory)

# 运行
thread_id = "thread-1"
for event in app.stream(
    {"question": "What is idempotency?", "retry_count": 0},
    config={"configurable": {"thread_id": thread_id}},
):
    print(event)

# 查看状态
state = app.get_state({"configurable": {"thread_id": thread_id}})
print(state.values)
```

## 29.6 LangGraph 核心概念对照

| 概念 | 作用 | 类比 | 典型代码 |
|------|------|------|----------|
| StateGraph | 定义图结构 | 工作流画布 | `StateGraph(AgentState)` |
| Node | 执行业务逻辑 | 函数 | `add_node("retrieve", retrieve)` |
| Edge | 固定转移 | 箭头 | `add_edge("a", "b")` |
| Conditional Edge | 动态路由 | if/else | `add_conditional_edges("a", fn)` |
| Checkpoint | 持久化状态 | 存档 | `MemorySaver()` |
| Thread ID | 会话隔离 | 线程 | `configurable={"thread_id": ...}` |

## 29.7 多语言 LangGraph 示例

LangGraph 官方也提供 TypeScript 版本：

```typescript
import { StateGraph, END } from "@langchain/langgraph";

interface AgentState {
  question: string;
  context: string[];
  answer: string;
}

const graph = new StateGraph<AgentState>({ channels: { question: null, context: { value: (x, y) => x.concat(y) }, answer: null }})
  .addNode("retrieve", async (state) => {
    return { context: [`doc about ${state.question}`] };
  })
  .addNode("generate", async (state) => {
    return { answer: `Answer based on ${state.context}` };
  })
  .addEdge("__start__", "retrieve")
  .addEdge("retrieve", "generate")
  .addEdge("generate", END);

const app = graph.compile();
const result = await app.invoke({ question: "What is idempotency?", context: [], answer: "" });
```

## 29.8 常见错误与注意事项

- **错误 1**：节点直接修改入参 State 没有返回新 State，导致不可预期行为。
- **错误 2**：条件边返回的节点名拼写错误，LangGraph 会抛 `NodeNotFound`。
- **错误 3**：忘记设置入口节点，图无法启动。
- **错误 4**：使用 `MemorySaver` 做生产持久化，进程重启后状态丢失。
- **错误 5**：循环没有终止条件，导致无限循环直到超时。

## 29.9 本章练习

1. 把 29.5 的研究 Agent 扩展为“检索 -> 生成 -> 评分 -> 若评分低则重试”的循环。
2. 在 State 中加入 `human_approved: bool`，增加一个 `human_review` 节点，未批准时暂停。
3. 把 `MemorySaver` 替换为 SQLite 持久化检查点，测试进程重启后恢复。
4. 运行 Lab 21，完成 LangGraph 状态图与持久化练习。

## 检查点

- 你能解释 StateGraph、Node、Edge、Conditional Edge 的关系。
- 你能用 LangGraph 编写带条件分支和循环的 Agent。
- 你知道 Checkpoint 的作用以及生产持久化方案。
- 你能在图中插入人工审批点。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\21-langgraph-practice`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/21-langgraph-practice`
