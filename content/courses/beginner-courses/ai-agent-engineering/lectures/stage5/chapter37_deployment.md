# 第 37 章：Agent 部署架构

## 学习目标

- 比较容器化与 Serverless 两种部署方式在 Agent 场景中的优劣。
- 能在 Docker 中打包一个带 Agent 的 FastAPI 服务。
- 理解 Cloudflare Workers 与 AWS Lambda 的冷启动、并发和流式差异。
- 掌握并发控制与流式响应的实现方法。

## 37.1 Agent 部署的特殊考虑

| 考虑点 | 原因 | 设计影响 |
|--------|------|----------|
| 状态管理 | Agent 可能有长对话 | 外部化存储，服务无状态 |
| 流式输出 | 用户需要阶段性反馈 | 优先支持 SSE/WebSocket |
| 长耗时 | 多步循环可能 >30s | 异步任务 + 回调/轮询 |
| 并发 | 模型 API 有 TPM/RPM 限制 | 限流、队列、连接池 |
| 模型密钥 | 不能打包进镜像 | 运行时注入 / 密钥管理服务 |

## 37.2 Docker 容器化部署

FastAPI 服务示例：

```python
# main.py
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from agent import AgentLoop

app = FastAPI()
agent = AgentLoop()

@app.post("/chat")
async def chat(request: dict):
    async def event_stream():
        async for chunk in agent.run_stream(request["message"]):
            yield f"data: {chunk}\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")
```

Dockerfile：

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

docker-compose.yml：

```yaml
services:
  agent:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
```

## 37.3 Cloudflare Workers：边缘 Serverless

适合低延迟、全球分布、流式 SSE 的场景。

```typescript
// worker.ts
export interface Env {
  OPENAI_API_KEY: string;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const { message } = await req.json();
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
        stream: true,
      }),
    });
    return new Response(res.body, {
      headers: { "Content-Type": "text/event-stream" },
    });
  },
};
```

## 37.4 AWS Lambda：事件驱动与并发控制

Python Lambda handler 示例：

```python
import json
from agent import AgentLoop

agent = AgentLoop()

def lambda_handler(event, context):
    body = json.loads(event.get("body", "{}"))
    answer = agent.run(body.get("message", ""))
    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({"answer": answer}),
    }
```

并发控制：通过函数并发限制和 SQS 队列避免冲垮下游模型 API。

| 部署方式 | 冷启动 | 流式 | 适合场景 |
|----------|--------|------|----------|
| Docker / K8s | 可控 | 支持 | 长会话、复杂依赖 |
| Cloudflare Workers | 极低 | 支持 | 边缘低延迟、简单 Agent |
| AWS Lambda | 中低 | 需 Function URL + Response Stream | 事件驱动、突发流量 |

## 37.5 并发控制与流式响应

Agent 的模型调用通常是瓶颈。使用信号量限制并发，避免触发 RPM/TPM 限流。

```python
import asyncio
from asyncio import Semaphore

semaphore = Semaphore(10)

async def call_llm(messages):
    async with semaphore:
        return await async_client.chat.completions.create(
            model="gpt-4o-mini", messages=messages
        )
```

Node.js 并发控制示例：

```typescript
import { pLimit } from "p-limit";

const limit = pLimit(5);

async function batchCalls(inputs: string[]) {
  return Promise.all(
    inputs.map((input) => limit(() => callLLM(input)))
  );
}
```

Go 并发控制示例：

```go
var sem = make(chan struct{}, 10)

func callLLM(ctx context.Context, prompt string) (string, error) {
    sem <- struct{}{}
    defer func() { <-sem }()
    return llmClient.Complete(ctx, prompt)
}
```

## 37.6 本章练习

1. 用 Dockerfile 打包当前 Agent 服务，并本地运行 `docker compose up`。
2. 在 FastAPI 中实现 SSE 流式接口，用 curl 观察分块输出。
3. 写一个 Cloudflare Worker，接收 JSON 输入并流式转发 OpenAI 响应。
4. 为 LLM 调用加入 Semaphore，测试高并发下的稳定性。

## 检查点

- 你能比较 Docker、Cloudflare Workers、AWS Lambda 在 Agent 场景中的优劣。
- 你知道为什么 Agent 服务要尽量保持无状态。
- 你能实现 SSE 流式响应。
- 你能用信号量限制并发保护下游模型 API。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\29-deployment`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/29-deployment`
