# 第 15 章：A2A：Agent-to-Agent 协议

## 学习目标

- 理解 A2A 协议的设计目标：让不同框架、不同厂商的 Agent 互相协作。
- 掌握 A2A 的核心概念：Agent Card、Task、Message、Artifact。
- 实现一个最小 A2A Agent Server 和 Client。
- 比较 A2A 与 MCP 在 Agent 协作场景中的差异。

## 15.1 从单体 Agent 到多 Agent 协作

当系统里有多个 Agent 时，会出现这些问题：

- Agent A 怎么知道 Agent B 能做什么？
- Agent A 如何向 Agent B 提交任务并跟踪进度？
- 不同 Agent 之间如何传递文件、结构化结果、错误信息？

A2A（Agent-to-Agent）协议由 Google 提出，目标是标准化 Agent 之间的交互方式。

## 15.2 A2A 核心概念

| 概念 | 说明 | 类比 |
|------|------|------|
| Agent Card | Agent 的能力、端点、认证信息 | 服务名片 / OpenAPI 文档 |
| Task | 一次协作任务，有唯一 ID 和状态 | 工作流实例 |
| Message | Task 中的交流单元，包含 Parts | 邮件 / 聊天记录 |
| Part | Message 的组成部分：text、file、data | 消息体 |
| Artifact | Task 产出的结果 | 附件 / 输出文件 |

## 15.3 Agent Card

Agent Card 描述一个 Agent 的能力，通常通过 `/.well-known/agent.json` 暴露：

```json
{
  "name": "research-agent",
  "description": "Search and summarize web content",
  "url": "http://localhost:8000/",
  "version": "0.1.0",
  "capabilities": {
    "streaming": false,
    "pushNotifications": false
  },
  "skills": [
    {
      "id": "web_search",
      "name": "Web Search",
      "description": "Search the web and return summaries",
      "tags": ["search", "web"]
    }
  ]
}
```

## 15.4 Task 生命周期

```
Client                      Agent
  │    POST /tasks/send     │
  │ ──────────────────────▶ │
  │                         │
  │    {task, status}       │
  │ ◀────────────────────── │
  │                         │
  │    GET /tasks/{id}      │
  │ ──────────────────────▶ │
  │                         │
  │    {task, status, artifacts}
  │ ◀────────────────────── │
```

Task 状态：

| 状态 | 含义 |
|------|------|
| submitted | 已提交 |
| working | 处理中 |
| input-required | 需要用户补充输入 |
| completed | 完成 |
| failed | 失败 |
| canceled | 已取消 |

## 15.5 最小 A2A Agent Server（Python + FastAPI）

```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import uuid

app = FastAPI()

tasks = {}


class Part(BaseModel):
    type: str
    text: Optional[str] = None


class Message(BaseModel):
    role: str
    parts: List[Part]


class Task(BaseModel):
    id: str
    status: str
    messages: List[Message]
    artifacts: Optional[List[dict]] = None


@app.get("/.well-known/agent.json")
def agent_card():
    return {
        "name": "echo-agent",
        "description": "Echo back the user's message",
        "url": "http://localhost:8000/",
        "version": "0.1.0",
        "capabilities": {"streaming": False},
        "skills": [{"id": "echo", "name": "Echo", "description": "Echo input"}]
    }


@app.post("/tasks/send")
def send_task(task: Task):
    task_id = str(uuid.uuid4())
    user_text = task.messages[0].parts[0].text if task.messages else ""

    task.id = task_id
    task.status = "completed"
    task.artifacts = [{"parts": [{"type": "text", "text": f"Echo: {user_text}"}]}]
    tasks[task_id] = task
    return task


@app.get("/tasks/{task_id}")
def get_task(task_id: str):
    return tasks.get(task_id, {"error": "Task not found"})
```

## 15.6 A2A Client（Python）

```python
import requests


def call_agent(agent_url: str, text: str):
    card = requests.get(f"{agent_url}/.well-known/agent.json").json()
    print("Discovered agent:", card["name"])

    response = requests.post(
        f"{agent_url}/tasks/send",
        json={
            "id": "task-001",
            "status": "submitted",
            "messages": [
                {"role": "user", "parts": [{"type": "text", "text": text}]}
            ]
        }
    )
    return response.json()


if __name__ == "__main__":
    result = call_agent("http://localhost:8000", "Hello A2A")
    print(result["artifacts"][0]["parts"][0]["text"])
```

## 15.7 A2A vs MCP

| 维度 | A2A | MCP |
|------|-----|-----|
| 交互对象 | Agent ↔ Agent | Host/Client ↔ Server |
| 主要目标 | 任务协作与编排 | 能力发现与调用 |
| 协议风格 | HTTP + JSON | JSON-RPC |
| 核心实体 | Task / Message / Artifact | Tool / Resource / Prompt |
| 状态管理 | Task 有明确状态机 |  mostly 无状态 |
| 适用层级 | 系统间、组织间 Agent | 进程内/近程能力提供 |

两者可以组合：一个 Agent 通过 MCP 调用本地工具，通过 A2A 调用远端 Agent。

## 15.8 常见错误

- **错误 1**：把 A2A 当成 MCP 的替代。两者层级不同，通常互补。
- **错误 2**：Agent Card 描述不清，导致其他 Agent 无法判断你的能力。
- **错误 3**：Task 状态更新不同步，Client 轮询时看到的状态永远落后。
- **错误 4**：Message Part 类型使用混乱，把文件内容当成 text 传输。
- **错误 5**：忽略认证和授权，直接暴露 A2A 端点到公网。

## 15.9 本章练习

1. 扩展示例 Server，让 Task 状态先从 `submitted` 变成 `working`，再变成 `completed`。
2. 实现一个 Client，先读取 Agent Card，再根据 `skills` 决定是否发送任务。
3. 在 Message 中增加 `file` 类型的 Part，实现文件传输。
4. 讨论：A2A 适合跨团队 Agent 协作，MCP 适合工具集成，你的系统更适合哪种？

## 检查点

- 你能解释 Agent Card、Task、Message、Artifact 四个概念。
- 你知道 A2A Task 的几种状态及其含义。
- 你能实现一个最小 A2A Agent Server 和 Client。
- 你能区分 A2A 与 MCP 的适用层级。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\13-a2a-agent`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/13-a2a-agent`
