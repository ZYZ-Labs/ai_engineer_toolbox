# 第 32 章：实战：自动化 SRE Agent

## 学习目标

- 设计一个可落地的自动化 SRE Agent：日志分析 → 诊断 → 安全修复 → 报告。
- 理解“安全修复”中的审批、灰度、回滚三重保护。
- 掌握日志结构化、异常检测、Runbook 匹配和根因推断的工程方法。
- 建立对自动化运维“可观测、可审计、可回滚”的底线意识。

## 32.1 SRE Agent 的目标与边界

SRE Agent 的核心价值是：

- **缩短 MTTR**：快速定位常见故障
- **减少误操作**：高风险动作必须有人审批或自动灰度
- **沉淀知识**：把排查过程变成可复用的报告

但它不是万能药：

- 不能替代变更管理
- 不能在没有审批的情况下做不可逆操作
- 不能在没有回滚方案时执行修复

## 32.2 日志分析

把非结构化日志变成结构化事件，是 SRE Agent 的第一步。

```python
import re
from datetime import datetime

LOG_PATTERN = re.compile(
    r"(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}) "
    r"(?P<level>\w+) "
    r"(?P<service>\S+) "
    r"(?P<message>.*)"
)

def parse_logs(raw_logs: str) -> list[dict]:
    events = []
    for line in raw_logs.splitlines():
        m = LOG_PATTERN.match(line)
        if m:
            events.append(m.groupdict())
    return events

def count_errors(events: list[dict], window_minutes: int = 5) -> dict:
    from collections import Counter
    errors = [e for e in events if e["level"] == "ERROR"]
    return {
        "total": len(errors),
        "top_services": Counter(e["service"] for e in errors).most_common(5),
    }
```

## 32.3 诊断

诊断阶段结合规则、Runbook 和 LLM 推理。

```python
class DiagnosisEngine:
    def __init__(self, runbooks: list[dict]):
        self.runbooks = runbooks

    def match_runbook(self, symptoms: dict) -> dict | None:
        for rb in self.runbooks:
            if all(k in symptoms and symptoms[k] == rb["trigger"][k] for k in rb["trigger"]):
                return rb
        return None

    def infer_root_cause(self, events: list[dict], runbook: dict) -> dict:
        prompt = f"""根据以下日志和 Runbook，推断根因并给出置信度。
Runbook: {runbook}
日志摘要: {summarize(events)}
返回 JSON：{{ "root_cause": "...", "confidence": 0-1, "recommended_action": "..." }}"""
        return json.loads(llm_call(prompt))
```

## 32.4 安全修复

修复动作必须分级：低风险可自动执行，高风险必须审批或灰度。

```python
class RemediationPlanner:
    def plan(self, diagnosis: dict) -> dict:
        action = diagnosis["recommended_action"]
        risk = self.assess_risk(action)
        return {
            "action": action,
            "risk": risk,
            "dry_run": risk != "low",
            "requires_approval": risk == "high",
            "rollback_plan": self.build_rollback(action),
        }

    def execute(self, plan: dict) -> dict:
        if plan["requires_approval"]:
            return {"status": "awaiting_approval", "plan": plan}
        if plan["dry_run"]:
            result = self.dry_run(plan["action"])
            if not result["safe"]:
                return {"status": "aborted", "reason": result["reason"]}
        return self.apply(plan["action"])
```

## 32.5 报告

每次排查和修复都要生成可审计报告。

```python
def generate_report(incident_id: str, events, diagnosis, plan, result) -> dict:
    return {
        "incident_id": incident_id,
        "time_range": [events[0]["timestamp"], events[-1]["timestamp"]],
        "symptoms": count_errors(events),
        "diagnosis": diagnosis,
        "remediation_plan": plan,
        "result": result,
        "action_log": result.get("action_log", []),
        "recommended_followup": [
            "更新 Runbook",
            "增加告警阈值",
            "复盘会议",
        ],
    }
```

## 32.6 风险等级与处理策略

| 风险等级 | 示例操作 | 是否 dry-run | 是否审批 | 是否记录审计 |
|----------|----------|--------------|----------|--------------|
| 低 | 重启无状态服务、清理临时文件 | 否 | 否 | 是 |
| 中 | 调整配置参数、扩容 | 是 | 否（可自动灰度） | 是 |
| 高 | 删除数据、修改数据库、变更网络 | 是 | 是 | 是 |

## 32.7 多语言 SRE Agent 示例

TypeScript 日志解析与计数：

```typescript
interface LogEvent {
  timestamp: string;
  level: string;
  service: string;
  message: string;
}

function parseLogs(raw: string): LogEvent[] {
  const pattern = /^(\S+) (\w+) (\S+) (.*)$/;
  return raw.split("\n")
    .map((line) => pattern.exec(line))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => ({ timestamp: m[1], level: m[2], service: m[3], message: m[4] }));
}

function countErrors(events: LogEvent[]) {
  return events.filter((e) => e.level === "ERROR").length;
}
```

Go 中用 context 控制修复超时：

```go
func executeRemediation(ctx context.Context, action Action) error {
    ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
    defer cancel()
    return action.Run(ctx)
}
```

## 32.8 常见错误与注意事项

- **错误 1**：没有做 dry-run，直接在生产环境执行修复。
- **错误 2**：诊断只依赖 LLM，没有 Runbook 和指标交叉验证。
- **错误 3**：修复动作没有回滚方案，一旦失败扩大故障。
- **错误 4**：日志解析不严谨，把 INFO 误判为 ERROR，触发误修复。
- **错误 5**：没有审计日志，事后无法复盘和追责。

## 32.9 本章练习

1. 为 32.2 的日志解析器增加对多行堆栈的合并能力。
2. 为诊断引擎增加“置信度低于 0.7 则升级人工”的规则。
3. 实现一个“自动扩容”低风险修复动作，包含 dry-run 和灰度开关。
4. 运行 Lab 24，完成日志分析、诊断、安全修复与报告生成。

## 检查点

- 你能画出 SRE Agent 的四个阶段：日志分析 → 诊断 → 修复 → 报告。
- 你知道修复动作为什么要分级，以及高风险的审批/回滚要求。
- 你能用 Runbook + LLM 共同完成根因推断。
- 你能生成包含审计信息和时间线的故障报告。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\24-sre-agent`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/24-sre-agent`
