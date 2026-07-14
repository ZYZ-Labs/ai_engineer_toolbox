# 第 1 章：从函数到 Agent：概念与边界

## 学习目标

- 区分普通函数、脚本、工作流与 Agent。
- 理解 Agent 的三大核心要素：感知（Perception）、推理（Reasoning）、行动（Action）。
- 建立后端工程师视角：Agent 是带有"决策循环"的服务组件。

## 1.1 从一个 HTTP 接口说起

作为后端工程师，你最熟悉的代码形态可能是这样：

```python
def get_user(user_id: str) -> dict:
    return db.query(User).filter_by(id=user_id).first()
```

输入确定、输出确定、分支有限、异常可枚举。整个行为在代码里已经写死。

现在看一个 Agent 的伪代码：

```python
while not done:
    thought = llm.think(observation)
    action = parse_action(thought)
    observation = execute(action)
    done = check_done(thought)
```

输入只有一个目标，**具体走哪几步在运行时才决定**。这正是 Agent 与普通函数的根本区别。

## 1.2 Agent 的定义与边界

| 形态 | 决策位置 | 典型例子 | 是否适合 LLM |
|------|----------|----------|--------------|
| 函数 | 代码里 | `get_user`, `hash_password` | 否 |
| 脚本 | 代码里，按步骤执行 | ETL pipeline, cron job | 否 |
| 工作流 | 配置里，节点固定 | Airflow DAG, CI pipeline | 部分节点可用 LLM |
| Agent | 运行时由模型决定 | ReAct Agent, 客服机器人 | 是 |

Agent 不是万能药。如果一个任务的每一步都可以精确预先定义，那么它更适合工作流或脚本，而不是 Agent。

## 1.3 Agent 的三要素

### 感知（Perception）

Agent 能看到什么。包括：
- 用户输入
- 工具返回的结果
- 环境状态（数据库、文件、API）
- 自身历史（记忆）

### 推理（Reasoning）

Agent 如何决定下一步。常见模式：
- **ReAct**：Thought → Action → Observation 循环
- **CoT**：Chain-of-Thought，让模型先写出推理过程
- **Plan-and-Solve**：先制定计划，再逐步执行

### 行动（Action）

Agent 能做什么。包括：
- 调用外部工具（API、数据库、代码执行）
- 返回最终结果给用户
- 修改自身状态或记忆

## 1.4 后端工程师为什么需要理解 Agent

你可能会想："这不就是调用大模型 API 吗？" 区别在三处：

1. **调用次数不确定**：一个请求可能触发多次 LLM 调用和工具调用。
2. **失败模式更复杂**：模型可能产生幻觉、工具可能超时、循环可能无限。
3. **状态管理更关键**：上下文窗口、记忆、幂等、重试，都是后端老本行，但在 Agent 里更突出。

换句话说，Agent 开发 = 后端工程 + LLM 不确定性管理。

## 1.5 常见误解

- **误解 1**：Agent 会自己写代码。事实是，Agent 只能按你给定的工具和权限行动。
- **误解 2**：Agent 越复杂越好。事实是，先从单轮工具调用开始，确认价值后再加循环。
- **误解 3**：Agent 不需要测试。事实是，LLM 输出有随机性，更需要回归测试和评估。

## 1.6 本章练习

1. 列出你当前负责的后端系统中，哪些任务适合用 Agent，哪些不适合。
2. 用一句话向你的团队成员解释 Agent 和普通 API 服务的区别。
3. 阅读 Lab 01，运行第一个 LLM 调用，观察响应结构。

## 检查点

- 你能说清 Agent 与普通函数/工作流的区别。
- 你知道 Agent 的三要素是什么。
- 你能判断一个任务是否适合做成 Agent。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\01-first-llm-call`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/01-first-llm-call`
