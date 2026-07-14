# 第 36 章：成本优化与缓存

## 学习目标

- 识别 Agent 成本的主要驱动因素。
- 掌握模型路由、缓存、批量、提示压缩四种降本手段。
- 能设计优雅降级策略，避免单点模型故障拖垮服务。
- 建立“按任务选模型，而不是一把梭 GPT-4”的意识。

## 36.1 Agent 成本的来源

| 成本来源 | 说明 | 优化方向 |
|----------|------|----------|
| 模型选择 | 大模型单价高 | 简单任务用小模型 |
| 输入 token 长度 | 长历史、大上下文 | 压缩、截断、摘要 |
| 输出 token 长度 | 模型啰嗦 | 限制 max_tokens、明确格式 |
| 调用次数 | 多步循环、重试 | 减少步数、缓存 |
| 失败重试 | 幻觉导致无效调用 | 输出校验、重试预算 |

## 36.2 模型选择：按难度路由

不是所有任务都需要最强模型。引入模型路由器，根据请求特征选择模型。

```python
import json

def route_request(user_input: str, history_len: int):
    # 简单分类：先让便宜模型判断任务复杂度
    classifier_prompt = [
        {"role": "system", "content": "Classify the user request as 'simple' or 'complex'. Return JSON."},
        {"role": "user", "content": user_input},
    ]
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=classifier_prompt,
        response_format={"type": "json_object"},
        max_tokens=60,
        temperature=0.0,
    )
    level = json.loads(resp.choices[0].message.content).get("level", "simple")
    return "gpt-4o" if level == "complex" else "gpt-4o-mini"
```

| 任务类型 | 推荐模型 | 原因 |
|----------|----------|------|
| 分类/路由 | gpt-4o-mini / claude-3-haiku | 便宜、快速 |
| 结构化抽取 | gpt-4o-mini + JSON mode | 格式稳定即可 |
| 复杂推理/代码 | gpt-4o / claude-3.5-sonnet | 准确性优先 |
| 创意/长文本 | claude-3-opus / gpt-4o | 输出质量优先 |

## 36.3 缓存：不要重复问同样的问题

### 精确缓存

对确定性任务（如分类、翻译、摘要），按 prompt 哈希缓存结果。

```python
import hashlib
import json
from functools import lru_cache

@lru_cache(maxsize=10000)
def cached_classify(prompt_hash: str) -> str:
    # 实际实现会按 prompt 调用模型
    return model_classify(json.loads(prompt_hash))

def classify(text: str) -> str:
    h = hashlib.sha256(text.encode()).hexdigest()
    return cached_classify(h)
```

### 语义缓存

用 embedding 缓存相似问题的答案。

```python
from redis import Redis
import numpy as np

redis = Redis()

def semantic_cache_lookup(query: str, threshold: float = 0.92):
    emb = embed(query)
    # 简化示意：遍历最近 100 条缓存的 embedding
    for key in redis.lrange("cache_keys", 0, 100):
        cached_emb = np.frombuffer(redis.get(f"emb:{key}"))
        sim = cosine_sim(emb, cached_emb)
        if sim > threshold:
            return redis.get(f"ans:{key}")
    return None
```

Node.js/TypeScript 示例：

```typescript
import { createHash } from "crypto";

function exactCacheKey(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex");
}

// 使用 Redis 缓存
const cached = await redis.get(`llm:${exactCacheKey(prompt)}`);
if (cached) return JSON.parse(cached);
```

## 36.4 批量处理

嵌入模型和某些 LLM 支持批量，摊薄每次请求开销。

```python
def batch_embed(texts: list[str], batch_size: int = 32) -> list[list[float]]:
    results = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        resp = client.embeddings.create(input=batch, model="text-embedding-3-small")
        results.extend([d.embedding for d in resp.data])
    return results
```

## 36.5 提示压缩

| 技术 | 做法 | 效果 |
|------|------|------|
| 历史摘要 | 每 N 轮用模型摘要一次 | 减少长对话 token |
| 选择性记忆 | 只保留相关记忆 | 降低噪声 |
| 去除重复系统提示 | 不要把全量文档每次塞入 | 显著降本 |
| 截断 | 保留最近 k 轮 | 简单但可能丢失关键上下文 |

```python
def compress_history(messages: list, max_messages: int = 10) -> list:
    if len(messages) <= max_messages:
        return messages
    # 保留 system 和最近 N 条
    system = [m for m in messages if m["role"] == "system"]
    recent = messages[-max_messages:]
    return system + recent
```

## 36.6 优雅降级

当主模型超时、报错或成本过高时，切换到更便宜/更快的模型或简化流程。

```python
def robust_chat(messages, primary="gpt-4o", fallback="gpt-4o-mini"):
    try:
        return client.chat.completions.create(model=primary, messages=messages, timeout=15)
    except Timeout:
        logger.warning("primary model timeout, falling back")
        return client.chat.completions.create(model=fallback, messages=messages)
```

## 36.7 本章练习

1. 实现一个简单路由器：用 gpt-4o-mini 判断用户问题是“简单”还是“复杂”，再选择模型。
2. 为一个问答接口加入精确缓存，比较命中缓存前后的延迟和成本。
3. 实现历史压缩函数，保留 system 提示和最近 6 轮对话。
4. 统计过去 100 次请求中，各模型 token 占比，并给出降本建议。

## 检查点

- 你能列出 Agent 的 5 个主要成本来源。
- 你知道精确缓存和语义缓存的区别与适用场景。
- 你能实现模型路由和优雅降级。
- 你能用 prompt 压缩控制上下文长度。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\28-cost-optimization`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/28-cost-optimization`
