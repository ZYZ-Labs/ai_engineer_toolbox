# 第 28 章：人在回路

## 学习目标

- 理解 Human-in-the-Loop（HITL）在 Agent 系统中的必要位置。
- 掌握审批点、升级、人工修正与回滚四种机制的设计方法。
- 能在工作流中安全地暂停、等待人工输入并恢复执行。
- 识别 HITL 引入的新风险：延迟、权限、审计缺失。

## 28.1 为什么需要人在回路

再强大的 Agent 也不应该对所有决策负责。以下场景必须引入人：

- 涉及资金、法律、安全的操作
- 模型置信度低或出现矛盾
- 超出预算或影响范围
- 用户明确要求确认

HITL 不是“让系统变弱”，而是把不确定决策交给更适合的决策者。

## 28.2 审批点（Approval Points）

在执行高风险动作前，系统暂停并等待人工批准。

```python
class ApprovalWorkflow:
    STATES = ["running", "awaiting_approval", "approved", "rejected", "completed"]

    def __init__(self, store):
        self.store = store

    def step(self, task_id: str):
        state = self.store.load(task_id)
        if state["status"] == "awaiting_approval":
            return {"action": "wait", "task_id": task_id}
        # 执行到需要审批的步骤
        state["status"] = "awaiting_approval"
        state["pending_action"] = "deploy_to_prod"
        self.store.save(task_id, state)
        self.notify_human(task_id, state)
        return {"action": "wait_for_human"}

    def approve(self, task_id: str, user: str) -> dict:
        state = self.store.load(task_id)
        state["status"] = "approved"
        state["approved_by"] = user
        state["approved_at"] = now()
        self.store.save(task_id, state)
        return self.execute_pending_action(task_id, state)
```

关键字段：

- `pending_action`：待审批动作
- `requested_by`：谁发起
- `approved_by` / `rejected_by`：谁决策
- `approved_at`：时间戳，用于审计

## 28.3 升级（Escalation）

当 Agent 无法处理或置信度低于阈值时，把任务升级给人工。

```python
def escalate(task: dict, reason: str) -> dict:
    return {
        "status": "escalated",
        "to": "human-oncall",
        "reason": reason,
        "context": task,
        "url": f"https://ops.example.com/tasks/{task['id']}",
    }

# 使用示例
confidence = llm_score(task)
if confidence < 0.6:
    return escalate(task, reason="模型置信度低于阈值")
```

升级渠道：IM、邮件、工单系统、电话。升级信息必须包含完整上下文。

## 28.4 人工修正（Human Correction）

Agent 输出后，人可以直接修改，修改后的内容作为新的状态继续执行。

```python
def submit_correction(task_id: str, correction: str, user: str):
    state = store.load(task_id)
    state["draft"] = correction
    state["correction_by"] = user
    state["correction_at"] = now()
    state["status"] = "corrected"
    store.save(task_id, state)
    return resume_workflow(task_id, state)
```

要点：保留原始输出和修正记录，便于审计和模型迭代。

## 28.5 回滚（Rollback）

审批被拒绝或执行后发现问题，需要回滚已执行的操作。

```python
class Compensation:
    def __init__(self):
        self.actions = []

    def do(self, action, rollback):
        result = action()
        self.actions.append((rollback, result))
        return result

    def rollback_all(self):
        for rollback, result in reversed(self.actions):
            rollback(result)
```

回滚不是简单“撤销”，而是执行补偿动作：退款、删除、恢复配置、发送通知。

## 28.6 HITL 模式对比

| 机制 | 触发条件 | 人的角色 | 系统行为 | 审计重点 |
|------|----------|----------|----------|----------|
| 审批点 | 高风险操作前 | 批准/拒绝 | 暂停等待 | 谁、何时、批了什么 |
| 升级 | 置信度低/异常 | 接管处理 | 转人工 | 升级原因、上下文 |
| 人工修正 | 输出需要调整 | 编辑内容 | 用修正版继续 | 原输出、修正版、修正人 |
| 回滚 | 执行失败或被拒 | 确认回滚 | 执行补偿 | 补偿动作、影响范围 |

## 28.7 多语言 HITL 示例

TypeScript 中用状态机表达审批：

```typescript
type TaskState = "running" | "awaiting_approval" | "approved" | "rejected";

interface Task {
  id: string;
  status: TaskState;
  pendingAction?: string;
  approvedBy?: string;
}

function approve(task: Task, user: string): Task {
  if (task.status !== "awaiting_approval") throw new Error("invalid state");
  return { ...task, status: "approved", approvedBy: user };
}
```

Go 中把补偿动作抽象成闭包：

```go
type Action struct {
    Do       func() (any, error)
    Rollback func(any) error
}

func (a *Action) Execute() (any, error) {
    result, err := a.Do()
    if err != nil { return nil, err }
    return result, nil
}
```

## 28.8 常见错误与注意事项

- **错误 1**：审批链接没有权限校验，任何人都能批准。
- **错误 2**：上下文不完整，人工审批时看不到关键信息。
- **错误 3**：升级没有超时处理，任务无限期挂起。
- **错误 4**：人工修正后没有重新校验，导致修正内容破坏约束。
- **错误 5**：回滚没有补偿动作，只是改状态，留下脏数据。

## 28.9 本章练习

1. 为 28.2 的 ApprovalWorkflow 增加“审批超时自动拒绝”逻辑。
2. 设计一个“置信度低则升级”的规则矩阵，列出至少 5 种触发条件。
3. 实现 Compensation 类，并用一个“创建虚拟机 + 回滚删除”的场景测试。
4. 运行 Lab 20，模拟审批、修正与回滚的完整流程。

## 检查点

- 你能说明审批点、升级、人工修正、回滚的触发条件和系统行为。
- 你能在工作流中正确保存和恢复等待人工输入的状态。
- 你知道 HITL 必须具备审计字段和权限控制。
- 你能为高风险操作设计补偿/回滚方案。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\20-human-in-the-loop`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/20-human-in-the-loop`
