# 第 35 章：Agent 可观测性

## 学习目标

- 理解结构化日志、链路追踪、指标在 Agent 中的必要性。
- 能在 Python Agent 中实现带 trace_id 的日志与 OpenTelemetry 追踪。
- 能设计 token 使用量、延迟、工具调用次数等关键指标。
- 掌握基于 span 的多步 Agent 调试方法。

## 35.1 为什么 Agent 特别需要可观测性

一个用户请求可能触发：

- 多次 LLM 调用
- 多次工具调用
- 状态机跳转
- 长上下文记忆读写

没有 trace，出问题后你只知道“答错了”，却不知道错在哪一步。

## 35.2 结构化日志：每条日志都带上下文

日志必须包含 `trace_id`、`span_id`、`agent_id`、`tool_name` 等字段，便于过滤与关联。

```python
import logging
import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "message": record.getMessage(),
            "trace_id": getattr(record, "trace_id", None),
            "span_id": getattr(record, "span_id", None),
            "tool": getattr(record, "tool", None),
        }
        return json.dumps(payload, ensure_ascii=False)

handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger = logging.getLogger("agent")
logger.addHandler(handler)
logger.setLevel(logging.INFO)

logger.info("calling llm", extra={"trace_id": "t-123", "span_id": "s-1"})
```

Node.js/TypeScript 示例：

```typescript
import pino from "pino";

const logger = pino({
  level: "info",
  base: { service: "agent" },
});

logger.info({ traceId: "t-123", spanId: "s-1", tool: "search" }, "calling tool");
```

Go 示例：

```go
import "log/slog"

logger := slog.With("trace_id", traceID, "span_id", spanID)
logger.Info("calling tool", "tool", "search")
```

## 35.3 链路追踪：把每一步都变成 span

使用 OpenTelemetry 为每次 LLM 调用、工具调用、状态转换创建 span。

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter

trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(ConsoleSpanExporter())
)
tracer = trace.get_tracer("agent")

class AgentLoop:
    def run(self, user_input: str):
        with tracer.start_as_current_span("agent.run") as root:
            root.set_attribute("user_input", user_input)
            for step in range(self.max_steps):
                with tracer.start_as_current_span("llm.call") as span:
                    response = self.llm.chat(self.build_messages())
                    span.set_attribute("model", response.model)
                    span.set_attribute("tokens.prompt", response.usage.prompt_tokens)
                    span.set_attribute("tokens.completion", response.usage.completion_tokens)
                action = self.parse_action(response)
                with tracer.start_as_current_span("tool.execute") as span:
                    span.set_attribute("tool", action.tool)
                    result = self.tools[action.tool](**action.args)
                    span.set_attribute("tool.status", "ok" if result.ok else "error")
```

## 35.4 关键指标设计

| 指标名 | 类型 | 用途 |
|--------|------|------|
| `agent.request.duration` | Histogram | 端到端请求耗时 |
| `agent.llm.calls` | Counter | LLM 调用次数 |
| `agent.tool.calls` | Counter | 工具调用次数，按 tool 分标签 |
| `agent.tokens.total` | Counter | 总 token 消耗 |
| `agent.loop.steps` | Histogram | 每请求步数 |
| `agent.errors` | Counter | 错误次数，按类型分标签 |

Python + Prometheus 示例：

```python
from prometheus_client import Counter, Histogram, start_http_server

llm_calls = Counter("agent_llm_calls", "Number of LLM calls", ["model"])
tool_calls = Counter("agent_tool_calls", "Number of tool calls", ["tool"])
request_duration = Histogram("agent_request_duration_seconds", "End-to-end duration")

start_http_server(9090)
```

## 35.5 Token 使用量监控

除了计费，token 用量还能反映：上下文是否膨胀、是否重复加载、是否需要压缩。

```python
def log_usage(response, trace_id: str):
    usage = response.usage
    logger.info(
        "token usage",
        extra={
            "trace_id": trace_id,
            "prompt_tokens": usage.prompt_tokens,
            "completion_tokens": usage.completion_tokens,
            "total_tokens": usage.total_tokens,
            "model": response.model,
        },
    )
    if usage.total_tokens > 10000:
        logger.warning("high token usage", extra={"trace_id": trace_id})
```

## 35.6 基于 Span 的调试技巧

| 现象 | 在 trace 里看什么 | 常见根因 |
|------|-------------------|----------|
| 响应慢 | 哪个 span 耗时最长 | 某工具超时或 LLM 重试 |
| 答案错 | 工具返回了什么 | 工具返回空/错误，模型误读 |
| 无限循环 | loop.steps 数量 | 终止条件失效、模型反复调用同一工具 |
| 成本高 | token 用量分布 | 上下文冗余、未压缩 |
| 并发异常 | span 交叉、trace_id 丢失 | 未正确传递 context |

## 35.7 本章练习

1. 为你现有的 Agent 增加 JSON 结构化日志，确保每条日志都带 `trace_id`。
2. 用 OpenTelemetry 为一个 LLM 调用和一个工具调用创建 span，并在控制台查看输出。
3. 实现 `agent.tokens.total` 计数器，并设置超过阈值时报警。
4. 模拟一次循环 bug，通过 span 观察 loop.steps 异常增长。

## 检查点

- 你能说出结构化日志相比普通文本日志的优势。
- 你知道 OpenTelemetry span 在 Agent 中的常见划分方式。
- 你能列出至少 5 个 Agent 关键观测指标。
- 你能通过 trace 定位循环、超时、高 token 三类问题。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\27-observability`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/27-observability`
