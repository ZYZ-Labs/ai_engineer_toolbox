# 第 30 章：Temporal 与事件驱动流

## 学习目标

- 理解 Temporal 这类“持久化工作流”框架与事件驱动架构的区别。
- 掌握 Temporal 的 Workflow、Activity、Worker 三个核心概念。
- 理解 Saga 模式及其在分布式事务中的应用。
- 能在长链路中为关键步骤设计补偿动作。

## 30.1 事件驱动 vs 持久化工作流

事件驱动系统靠消息解耦，灵活但状态分散：

- 事件可能丢失或乱序
- 流程状态需要额外追踪
- 失败恢复依赖消费者实现

持久化工作流（如 Temporal）把状态保存在 Workflow 中，Worker 只是执行 Activity 的无状态进程。

## 30.2 Temporal 核心概念

| 概念 | 角色 | 特点 |
|------|------|------|
| Workflow | 定义业务控制流 | 可暂停、恢复、重放，状态由 Temporal Server 持久化 |
| Activity | 执行具体任务 | 可能失败，可配置重试、超时 |
| Worker | 拉取任务并执行 | 无状态，可水平扩展 |
| Task Queue | 任务队列 | Workflow 和 Activity 分别使用不同队列 |

```python
from temporalio import workflow
from temporalio.activity import activity

@activity.defn
async def charge_customer(order_id: str, amount: int) -> str:
    return await payment_api.charge(order_id, amount)

@workflow.defn
class OrderWorkflow:
    @workflow.run
    async def run(self, order_id: str, amount: int) -> str:
        result = await workflow.execute_activity(
            charge_customer,
            args=(order_id, amount),
            start_to_close_timeout=timedelta(seconds=30),
            retry_policy=RetryPolicy(maximum_attempts=3),
        )
        await workflow.execute_activity(
            ship_order,
            args=(order_id,),
            start_to_close_timeout=timedelta(seconds=60),
        )
        return result
```

## 30.3 Saga 模式

Saga 把长事务拆成多个本地事务，并为每个步骤定义补偿动作。任一步骤失败时，按相反顺序执行补偿。

```python
class SagaStep:
    def __init__(self, action, compensation):
        self.action = action
        self.compensation = compensation

async def run_saga(steps: list[SagaStep]):
    completed = []
    try:
        for step in steps:
            await step.action()
            completed.append(step)
    except Exception:
        for step in reversed(completed):
            await step.compensation()
        raise

# 使用示例
steps = [
    SagaStep(charge_customer, refund_customer),
    SagaStep(reserve_inventory, release_inventory),
    SagaStep(ship_order, cancel_shipment),
]
```

适用：跨服务事务，如电商下单、金融转账、资源开通。

## 30.4 事件驱动与 Temporal 对比

| 维度 | 事件驱动 | Temporal 持久化工作流 |
|------|----------|------------------------|
| 状态位置 | 分散在消费者/数据库 | 集中在 Workflow 状态 |
| 失败恢复 | 依赖消费者重试/DLQ | 自动重放，Activity 重试 |
| 可观测性 | 依赖链路追踪 | 内置历史记录和可视化 |
| 复杂度 | 低（初期） | 中（需要学习概念） |
| 适合场景 | 高吞吐、异步解耦 | 长流程、需要强状态保证 |

## 30.5 多语言 Temporal 示例

TypeScript SDK：

```typescript
import { workflow, activity } from "@temporalio/workflow";

const { chargeCustomer } = workflow.proxyActivities({
  startToCloseTimeout: "30s",
  retry: { maximumAttempts: 3 },
});

export async function orderWorkflow(orderId: string, amount: number): Promise<string> {
  const result = await chargeCustomer(orderId, amount);
  await workflow.proxyActivities({ startToCloseTimeout: "60s" }).shipOrder(orderId);
  return result;
}
```

Go SDK：

```go
func OrderWorkflow(ctx workflow.Context, orderID string, amount int) error {
    ao := workflow.ActivityOptions{ StartToCloseTimeout: 30 * time.Second }
    ctx = workflow.WithActivityOptions(ctx, ao)
    var result string
    if err := workflow.ExecuteActivity(ctx, ChargeCustomer, orderID, amount).Get(ctx, &result); err != nil {
        return err
    }
    return workflow.ExecuteActivity(ctx, ShipOrder, orderID).Get(ctx, nil)
}
```

## 30.6 常见错误与注意事项

- **错误 1**：在 Workflow 中直接调用外部 API，导致非确定性重放失败。
- **错误 2**：Activity 没有配置超时，长时间挂起占用 Worker。
- **错误 3**：补偿动作本身失败却没有再次重试或进入人工处理。
- **错误 4**：把不需要持久化的纯计算逻辑也放进 Activity，增加网络开销。
- **错误 5**：忽略 Workflow 的幂等性，同一任务被重复启动。

## 30.7 本章练习

1. 为 30.3 的 Saga 增加“补偿失败则进入人工审批”分支。
2. 设计一个资源开通流程（创建 VM、配置网络、挂载磁盘），列出每个步骤的正向和补偿动作。
3. 比较 Temporal 与 LangGraph 的适用边界，写出各自最适合的 3 个场景。
4. 运行 Lab 22，实现 Temporal Workflow 与 Saga 补偿。

## 检查点

- 你能解释 Workflow、Activity、Worker 在 Temporal 中的关系。
- 你能用 Saga 模式为一个跨服务流程设计补偿动作。
- 你知道持久化工作流与事件驱动架构的核心差异。
- 你能识别 Temporal 中哪些代码必须放进 Activity。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\22-temporal-orchestration`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/22-temporal-orchestration`
