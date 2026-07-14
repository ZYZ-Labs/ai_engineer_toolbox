# 第 38 章：多语言 Agent 开发对比

## 学习目标

- 比较 Python、Node.js/TypeScript、Go、Java 在 Agent 开发中的优劣势。
- 能根据团队技术栈和场景选择合适的语言。
- 理解“生态、并发、类型安全、部署”四个维度的权衡。
- 知道什么时候用混合语言架构。

## 38.1 评估维度

| 维度 | 为什么重要 | 权重场景 |
|------|------------|----------|
| LLM 生态 | 框架、SDK、示例多寡 | 快速原型、复杂 Agent |
| 并发模型 | 高并发连接/工具调用 | 网关、高吞吐服务 |
| 类型安全 | 大型项目可维护性 | 企业级、多人协作 |
| 部署便利性 | 镜像大小、冷启动、运行时依赖 | Serverless、边缘部署 |
| 人才储备 | 团队熟悉度 | 落地速度 |

## 38.2 Python：生态最强，性能平庸

优点：
- LangChain、LangGraph、LlamaIndex、OpenAI SDK 最成熟。
- 数据/ML 库丰富，适合 RAG、向量检索。

缺点：
- GIL 限制 CPU 并行。
- 类型系统较弱（虽然有 type hints）。
- 容器镜像较大。

Python Agent 示例：

```python
from openai import OpenAI

client = OpenAI()

def agent_run(prompt: str, tools: dict):
    messages = [{"role": "user", "content": prompt}]
    while True:
        resp = client.chat.completions.create(
            model="gpt-4o-mini", messages=messages, tools=tools
        )
        msg = resp.choices[0].message
        if msg.tool_calls:
            for tc in msg.tool_calls:
                result = tools[tc.function.name](**json.loads(tc.function.arguments))
                messages.append({"role": "tool", "tool_call_id": tc.id, "content": str(result)})
        else:
            return msg.content
```

## 38.3 Node.js / TypeScript：异步 + 前端同构

优点：
- 原生 async/await，适合 I/O 密集型工具调用。
- 与前端共享类型定义，容易做全栈 Agent。
- 边缘部署友好（Cloudflare Workers、Vercel）。

缺点：
- LLM 框架生态不如 Python 成熟。
- 长计算/ML 任务需要调用外部服务。

Node.js Agent 示例：

```typescript
import OpenAI from "openai";

const client = new OpenAI();

async function agentRun(prompt: string, tools: Record<string, Function>) {
  const messages: any[] = [{ role: "user", content: prompt }];
  while (true) {
    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: Object.entries(tools).map(([name, fn]) => ({
        type: "function" as const,
        function: { name },
      })),
    });
    const msg = resp.choices[0].message;
    if (msg.tool_calls) {
      for (const tc of msg.tool_calls) {
        const result = await tools[tc.function.name](JSON.parse(tc.function.arguments));
        messages.push({ role: "tool", tool_call_id: tc.id, content: String(result) });
      }
    } else {
      return msg.content;
    }
  }
}
```

## 38.4 Go：高并发、低延迟、适合网关

优点：
- goroutine + channel 并发模型简单高效。
- 编译产物单一、镜像小、冷启动快。
- 类型安全、部署友好。

缺点：
- LLM 生态薄弱，大多数框架需要自己封装。
- 缺少高级 RAG/记忆抽象。

Go Agent 示例：

```go
package main

import (
    "context"
    "fmt"
    "github.com/sashabaranov/go-openai"
)

func runAgent(ctx context.Context, client *openai.Client, prompt string) (string, error) {
    messages := []openai.ChatCompletionMessage{
        {Role: openai.ChatMessageRoleUser, Content: prompt},
    }
    for i := 0; i < 10; i++ {
        resp, err := client.CreateChatCompletion(ctx, openai.ChatCompletionRequest{
            Model:    openai.GPT4oMini,
            Messages: messages,
        })
        if err != nil {
            return "", err
        }
        msg := resp.Choices[0].Message
        if msg.ToolCalls == nil {
            return msg.Content, nil
        }
        // 执行工具并追加结果...
        fmt.Println("tool call", msg.ToolCalls[0].Function.Name)
    }
    return "", fmt.Errorf("max steps exceeded")
}
```

## 38.5 Java：企业级稳健，重量偏大

优点：
- Spring AI、LangChain4j 逐步成熟。
- 类型安全、依赖管理、监控体系完善。
- 大型企业现有 Java 系统容易集成。

缺点：
- 启动慢、内存占用高。
- 容器镜像大，不适合边缘 Serverless。

Java Agent 示例：

```java
var chatClient = ChatClient.builder(chatModel)
    .defaultSystem("You are a helpful coding assistant.")
    .build();

String answer = chatClient.prompt()
    .user("Generate a REST controller for orders")
    .call()
    .content();
```

## 38.6 综合对比表

| 语言 | LLM 生态 | 并发 | 类型安全 | 部署友好 | 推荐场景 |
|------|----------|------|----------|----------|----------|
| Python | ★★★ | ★★ | ★★ | ★★ | 原型、RAG、复杂 Agent |
| Node/TS | ★★ | ★★★ | ★★★ | ★★★ | 全栈、边缘、前端协同 |
| Go | ★ | ★★★ | ★★★ | ★★★ | 网关、高并发执行器 |
| Java | ★★ | ★★★ | ★★★ | ★ | 企业集成、已有 Java 栈 |

## 38.7 混合架构建议

- 用 Python 做“大脑”：推理、RAG、规划。
- 用 Go/Node 做“网关”：限流、鉴权、工具编排、长连接。
- 用 Java 做“企业接入层”：对接现有权限、审计、审批系统。

## 38.8 本章练习

1. 用 Python 和 Node.js 各实现一个最简单的 ReAct 循环，比较代码量。
2. 用 Go 实现一个带并发限制的工具调用网关。
3. 列出你团队现有技术栈，判断哪个语言最适合作为 Agent 主栈。
4. 设计一个混合架构：规划、RAG、网关分别用什么语言，为什么？

## 检查点

- 你能说出 Python、Node、Go、Java 各自在 Agent 开发中的 2 个优势和 1 个劣势。
- 你知道什么时候应该选择混合语言架构。
- 你能用至少两种语言写出基础 Agent 调用循环。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\30-multilingual-agents`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/30-multilingual-agents`
