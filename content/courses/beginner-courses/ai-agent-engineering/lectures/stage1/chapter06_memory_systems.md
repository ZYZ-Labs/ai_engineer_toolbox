# 第 6 章：记忆系统

## 学习目标

- 区分短期记忆（上下文窗口）与长期记忆（向量检索）。
- 实现滑动窗口管理上下文。
- 使用向量数据库存储和检索历史信息。
- 理解检索策略对 Agent 回答质量的影响。

## 6.1 为什么 Agent 需要记忆

一个能持续对话的 Agent 必须记得：

- 用户之前说过什么。
- 自己之前做过什么决定。
- 从外部工具获得过什么事实。

没有记忆，每次请求都是全新开始，Agent 无法处理跨轮次的任务。

## 6.2 短期记忆：上下文窗口

最简单的方式是把所有历史消息直接传给模型。但模型的上下文窗口有限，消息越多：

- 成本越高。
- 响应越慢。
- 越容易丢失关键信息。

### 滑动窗口策略

只保留最近 N 条消息，超出部分丢弃：

```python
class ShortTermMemory:
    def __init__(self, max_messages: int = 10):
        self.messages = []
        self.max_messages = max_messages

    def add(self, role: str, content: str) -> None:
        self.messages.append({"role": role, "content": content})
        if len(self.messages) > self.max_messages:
            keep = 1 if self.messages and self.messages[0]["role"] == "system" else 0
            self.messages = self.messages[:keep] + self.messages[keep + 1 :]

    def get(self) -> list:
        return list(self.messages)
```

更高级的策略：

| 策略 | 优点 | 缺点 |
|------|------|------|
| 固定窗口 | 实现简单 | 会丢掉早期重要信息 |
| 保留 system + 最近 N 条 | 不丢系统提示 | 仍可能丢用户关键事实 |
| 摘要压缩 | 能保留更长时间线 | 需要额外 LLM 调用 |
| Token 预算裁剪 | 精确控制成本 | 实现复杂 |

## 6.3 长期记忆：向量检索

短期记忆放不下的内容可以存入向量数据库，按语义检索：

```python
import hashlib


class LongTermMemory:
    def __init__(self, client, collection_name: str = "agent_memory"):
        import chromadb
        db = chromadb.HttpClient(host="localhost", port=8000)
        self.collection = db.get_or_create_collection(collection_name)

    def embed(self, text: str) -> list[float]:
        # 生产环境应使用真实 embedding 模型
        # 这里仅做示例：用 sha256 生成固定长度向量
        vec = [0.0] * 64
        for i, byte in enumerate(hashlib.sha256(text.encode()).digest()):
            vec[i % 64] += byte / 255.0
        return vec

    def store(self, text: str, metadata: dict | None = None) -> None:
        doc_id = hashlib.sha256(text.encode()).hexdigest()[:16]
        self.collection.add(
            ids=[doc_id],
            documents=[text],
            metadatas=[metadata or {}],
            embeddings=[self.embed(text)],
        )

    def retrieve(self, query: str, n: int = 3) -> list[str]:
        results = self.collection.query(
            query_embeddings=[self.embed(query)],
            n_results=n,
        )
        return results["documents"][0] if results["documents"] else []
```

## 6.4 把记忆融入对话

完整的记忆流程：

```python
class AgentWithMemory:
    def __init__(self, client):
        self.client = client
        self.short_term = ShortTermMemory(max_messages=12)
        self.long_term = LongTermMemory(client)

    def chat(self, user_input: str) -> str:
        # 1. 从长期记忆检索相关内容
        relevant = self.long_term.retrieve(user_input)
        if relevant:
            context = "Relevant memory:\n" + "\n".join(f"- {r}" for r in relevant)
            self.short_term.add("system", context)

        # 2. 加入用户输入
        self.short_term.add("user", user_input)

        # 3. 调用模型
        messages = self.short_term.get()
        response = self.client.chat_completion(messages=messages, max_tokens=200)
        answer = response["choices"][0]["message"]["content"]

        # 4. 更新记忆
        self.short_term.add("assistant", answer)
        self.long_term.store(f"User: {user_input}\nAssistant: {answer}")

        return answer
```

## 6.5 检索策略

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| 最近 K 条 | 取最相似的 K 条记录 | 通用对话 |
| 阈值过滤 | 只保留相似度高于阈值的 | 避免引入无关信息 |
| 混合检索 | 向量相似 + 关键词匹配 | 需要精确命中的业务 |
| 时间加权 | 新记录权重更高 | 关注最新动态 |
| 元数据过滤 | 按用户/会话/标签过滤 | 多租户系统 |

## 6.6 多语言思路

Node/TypeScript 的短期记忆：

```typescript
class ShortTermMemory {
  private messages: ChatMessage[] = [];
  constructor(private maxMessages = 10) {}

  add(role: string, content: string) {
    this.messages.push({ role, content } as ChatMessage);
    if (this.messages.length > this.maxMessages) {
      const keep = this.messages[0]?.role === "system" ? 1 : 0;
      this.messages = [...this.messages.slice(0, keep), ...this.messages.slice(keep + 1)];
    }
  }

  get() { return [...this.messages]; }
}
```

Go 的滑动窗口核心：

```go
type ShortTermMemory struct {
    messages []openaiclient.Message
    max int
}

func (m *ShortTermMemory) Add(role, content string) {
    m.messages = append(m.messages, openaiclient.Message{Role: role, Content: content})
    if len(m.messages) > m.max {
        keep := 0
        if len(m.messages) > 0 && m.messages[0].Role == "system" {
            keep = 1
        }
        m.messages = append(m.messages[:keep], m.messages[keep+1:]...)
    }
}
```

## 6.7 常见错误与调试技巧

- **检索结果不相关**：检查 embedding 模型是否合适；尝试调整 `n_results` 或加相似度阈值。
- **长期记忆覆盖短期记忆**：不要把检索到的内容以 system 消息形式反复追加，避免污染上下文。
- **上下文窗口超限**：用 token 计数工具检查，不要只数消息条数。
- **向量数据库连接失败**：Lab 05 使用 Chroma，需要先启动 `docker compose up -d chroma`。
- **记忆幻觉**：模型可能把检索到的片段当成事实，重要信息需要来源校验。

## 6.8 本章练习

1. 运行 Lab 05，观察 Agent 如何记住用户姓名和工作方向。
2. 调整 `max_messages`，测试多轮对话后哪些信息会丢失。
3. 关闭 Chroma，观察长期记忆不可用时 Agent 的行为。
4. 尝试用真实 embedding 模型替换示例中的 sha256 向量。

## 检查点

- 你能解释短期记忆和长期记忆的区别。
- 你能实现一个简单的滑动窗口上下文管理。
- 你了解向量检索的基本流程：embed -> store -> query -> retrieve。
- 你知道检索策略会影响 Agent 回答的相关性。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\05-memory-system`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/05-memory-system`
