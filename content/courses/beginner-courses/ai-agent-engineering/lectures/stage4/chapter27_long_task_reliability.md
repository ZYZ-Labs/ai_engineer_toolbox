# 第 27 章：长任务可靠性：幂等、重试、超时与恢复

## 学习目标

- 理解长任务链路中的典型故障模式。
- 掌握幂等键、指数退避重试、超时与截止时间传递。
- 学会设计检查点（checkpoint）与死信队列（DLQ）。
- 能在 Agent 流水线中落地“失败可恢复”的保障机制。

## 27.1 长任务为什么容易失败

Agent 任务往往具有以下特征：

- 执行时间长（秒级到分钟级）
- 调用外部 API、数据库、文件系统
- 中间状态多
- 失败时不能简单“重跑一次”

一个流程长任务失败，可能导致：重复扣款、重复发邮件、部分数据写入、状态不一致。

## 27.2 幂等性（Idempotency）

幂等 = 同一操作执行多次，结果与执行一次相同。

### 幂等键

为每个任务生成唯一 `idempotency_key`，服务端用该键去重。

```python
import hashlib

def make_idempotency_key(payload: dict) -> str:
    return hashlib.sha256(str(payload).encode()).hexdigest()[:32]

class PaymentGateway:
    def __init__(self):
        self.processed = set()

    def charge(self, order_id: str, amount: int, key: str):
        if key in self.processed:
            return {"status": "already_processed", "key": key}
        # 真实扣款逻辑
        self.processed.add(key)
        return {"status": "success", "key": key}
```

要点：

- 幂等键应包含业务关键字段（订单号、金额、操作类型）。
- 服务端需要持久化幂等键结果，不能仅存内存。
- 幂等键有效期要与业务语义匹配。

## 27.3 重试（Retry）

不是所有错误都值得重试：

| 错误类型 | 是否重试 | 策略 |
|----------|----------|------|
| 网络抖动/超时 | 是 | 指数退避，最多 3-5 次 |
| 429 Rate Limit | 是 | 按 Retry-After 等待 |
| 4xx 客户端错误 | 否 | 修正请求后再发 |
| 5xx 服务端错误 | 是，但谨慎 | 指数退避，记录日志 |
| 业务规则冲突 | 否 | 返回明确错误 |

### 指数退避示例

```python
import time
import random

def with_retry(max_attempts=3, base_delay=1.0):
    def decorator(fn):
        def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return fn(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts:
                        raise
                    delay = base_delay * (2 ** attempt) + random.uniform(0, 1)
                    print(f"attempt {attempt} failed, retry in {delay:.1f}s")
                    time.sleep(delay)
        return wrapper
    return decorator
```

## 27.4 超时与截止时间

超时分为两种：

- **单步超时**：单个 API 调用最多等多久。
- **整体截止时间**：整个任务必须在什么时间前完成。

```python
import time

def run_step_with_deadline(step_fn, deadline: float):
    remaining = deadline - time.time()
    if remaining <= 0:
        raise TimeoutError("deadline already passed")
    # 使用 timeout=remaining 调用外部服务
    return step_fn(timeout=remaining)
```

> 截止时间需要从调用链顶层向下传递，避免上游已超时，下游还在执行。

## 27.5 检查点（Checkpoint）

检查点把中间状态持久化，失败后可从最近检查点恢复，而不是从头开始。

```python
class CheckpointStore:
    def save(self, task_id: str, step: int, state: dict):
        redis.set(f"checkpoint:{task_id}", json.dumps({"step": step, "state": state}))

    def load(self, task_id: str) -> dict | None:
        raw = redis.get(f"checkpoint:{task_id}")
        return json.loads(raw) if raw else None

def run_pipeline(task_id, steps, store):
    cp = store.load(task_id)
    start = cp["step"] if cp else 0
    state = cp["state"] if cp else {}
    for i in range(start, len(steps)):
        state = steps[i](state)
        store.save(task_id, i + 1, state)
    return state
```

## 27.6 死信队列（DLQ）

当重试耗尽后，把任务送入死信队列，供人工或补偿程序处理。

```python
class TaskQueue:
    def fail(self, task_id: str, reason: str, payload: dict):
        dlq_record = {
            "task_id": task_id,
            "reason": reason,
            "payload": payload,
            "failed_at": time.isoformat(),
        }
        dlq.push(dlq_record)
```

## 27.7 多语言可靠性示例

TypeScript 重试装饰器：

```typescript
async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt === maxAttempts) throw e;
      const delay = 1000 * 2 ** attempt;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}
```

Go 中使用 context 传递 deadline：

```go
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()
resp, err := client.Call(ctx, req)
```

## 27.8 常见错误与注意事项

- **错误 1**：对所有异常都重试，导致 4xx 被反复重试浪费资源。
- **错误 2**：幂等键生成算法不稳定，相同输入生成不同键。
- **错误 3**：检查点保存不完整，恢复后缺少必要上下文。
- **错误 4**：超时只设客户端，服务端仍在执行，造成资源浪费。
- **错误 5**：DLQ 只进不出，没有告警和人工处理流程。

## 27.9 本章练习

1. 为 27.2 的 PaymentGateway 补充幂等键过期与幂等结果查询接口。
2. 在 27.3 的重试装饰器中加入“可重试异常白名单”。
3. 设计一个包含检查点和 DLQ 的 Agent 流水线，画出状态流转图。
4. 运行 Lab 19，模拟网络失败并验证重试与幂等。

## 检查点

- 你能解释幂等键为什么必须包含业务关键字段。
- 你知道哪些错误适合重试、哪些不适合。
- 你能手写指数退避重试和检查点保存逻辑。
- 你能在长任务中正确传递截止时间并处理死信。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\19-long-task-reliability`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/19-long-task-reliability`
