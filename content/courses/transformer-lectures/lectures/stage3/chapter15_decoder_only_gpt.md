# 第15章：Decoder-only GPT — 自回归生成 | Chapter 15: Decoder-only GPT — Autoregressive Generation

> **阶段定位** | **Stage**: 第三阶段 — Transformer 核心
> **预计学时** | **Duration**: 5~7 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 真正理解 Decoder-only 架构的设计逻辑
- 掌握 Causal Mask 的实现和作用
- 理解自回归（Autoregressive）生成的本质
- 掌握 Next Token Prediction 的训练目标

**English:**
- Truly understand the design logic of Decoder-only architecture
- Master the implementation and role of Causal Mask
- Understand the essence of autoregressive generation
- Master the Next Token Prediction training objective

---

## 15.1 为什么 Decoder-only 成为主流？| Why Did Decoder-only Become Mainstream?

### 中文解释

**历史演进：**
1. 2017: Transformer（Encoder-Decoder）— 用于翻译
2. 2018: BERT（Encoder-only）— 用于理解
3. 2018: GPT-1（Decoder-only）— 用于生成
4. 2020+: GPT-3, LLaMA, Qwen... 全是 Decoder-only

**Decoder-only 的优势：**
- 结构简单，只有一个堆栈
- 天然适合生成任务
- 训练效率高（无需 encoder-decoder 对齐）
- 缩放效果好（Scaling Laws）

### English Explanation

**Historical evolution:**
1. 2017: Transformer (Encoder-Decoder) — for translation
2. 2018: BERT (Encoder-only) — for understanding
3. 2018: GPT-1 (Decoder-only) — for generation
4. 2020+: GPT-3, LLaMA, Qwen... all Decoder-only

**Advantages of Decoder-only:**
- Simple structure, only one stack
- Naturally suited for generation tasks
- Training efficient (no encoder-decoder alignment needed)
- Good scaling properties (Scaling Laws)

---

## 15.2 Causal Mask — 因果掩码 | Causal Mask

### 中文解释

**核心约束：当前 token 只能看到之前的 token，不能偷看未来**

实现方式：下三角矩阵
```
位置:   0    1    2    3    4
      ┌────┬────┬────┬────┬────┐
   0  │ 1  │ 0  │ 0  │ 0  │ 0  │  ← "我"只能看自己
      ├────┼────┼────┼────┼────┤
   1  │ 1  │ 1  │ 0  │ 0  │ 0  │  ← "喜欢"能看"我"和自己
      ├────┼────┼────┼────┼────┤
   2  │ 1  │ 1  │ 1  │ 0  │ 0  │  ← "猫"能看前三个
      ├────┼────┼────┼────┼────┤
   3  │ 1  │ 1  │ 1  │ 1  │ 0  │
      ├────┼────┼────┼────┼────┤
   4  │ 1  │ 1  │ 1  │ 1  │ 1  │
      └────┴────┴────┴────┴────┘
```

### English Explanation

**Core constraint: Current token can only see previous tokens, cannot peek at the future**

Implementation: Lower triangular matrix
```
Pos:    0    1    2    3    4
      ┌────┬────┬────┬────┬────┐
   0  │ 1  │ 0  │ 0  │ 0  │ 0  │  ← "I" can only see itself
      ├────┼────┼────┼────┼────┤
   1  │ 1  │ 1  │ 0  │ 0  │ 0  │  ← "like" can see "I" and itself
      ├────┼────┼────┼────┼────┤
   2  │ 1  │ 1  │ 1  │ 0  │ 0  │  ← "cats" can see first three
      ├────┼────┼────┼────┼────┤
   3  │ 1  │ 1  │ 1  │ 1  │ 0  │
      ├────┼────┼────┼────┼────┤
   4  │ 1  │ 1  │ 1  │ 1  │ 1  │
      └────┴────┴────┴────┴────┘
```

### 代码案例 | Code Example

```python
import torch

def create_causal_mask(seq_len):
    """创建因果掩码 | Create causal mask"""
    # torch.tril: 保留下三角（含对角线）| Keep lower triangle (including diagonal)
    mask = torch.tril(torch.ones(seq_len, seq_len))
    return mask

# 可视化 | Visualize
seq_len = 5
mask = create_causal_mask(seq_len)
print("Causal Mask:")
print(mask)

# 在 Attention 中使用 | Use in Attention
def apply_causal_mask(scores):
    """
    scores: (batch, heads, seq, seq)
    将未来位置设为 -inf | Set future positions to -inf
    """
    seq_len = scores.size(-1)
    causal_mask = torch.tril(torch.ones(seq_len, seq_len, device=scores.device))
    # 将 mask=0 的位置设为 -inf | Set mask=0 positions to -inf
    scores = scores.masked_fill(causal_mask == 0, float('-inf'))
    return scores

# 测试 | Test
scores = torch.randn(1, 1, 5, 5)
masked_scores = apply_causal_mask(scores)
print("\nOriginal scores:")
print(scores[0, 0].round(2))
print("\nMasked scores (after softmax, future positions get 0 weight):")
weights = torch.softmax(masked_scores, dim=-1)
print(weights[0, 0].round(4))
```

---

## 15.3 自回归生成 | Autoregressive Generation

### 中文解释

**核心逻辑：一次生成一个 token**

```
输入: "今天天气"

Step 1: 预测下一个 token
  "今天天气" → 模型 → "很"
  
Step 2: 将生成的 token 加入输入
  "今天天气很" → 模型 → "好"
  
Step 3: 继续
  "今天天气很好" → 模型 → "。"
  
输出: "今天天气很好。"
```

### English Explanation

**Core logic: Generate one token at a time**

```
Input: "The weather today"

Step 1: Predict next token
  "The weather today" → model → "is"
  
Step 2: Add generated token to input
  "The weather today is" → model → "nice"
  
Step 3: Continue
  "The weather today is nice" → model → "."
  
Output: "The weather today is nice."
```

### 代码案例：贪心解码 | Code Example: Greedy Decoding

```python
import torch
import torch.nn as nn

@torch.no_grad()
def greedy_generate(model, start_tokens, max_length=50):
    """
    贪心解码：每次选概率最高的 token | Greedy decoding: always pick highest probability token
    """
    model.eval()
    tokens = start_tokens.clone()
    
    for _ in range(max_length):
        # 前向传播 | Forward
        logits = model(tokens)   # (1, seq, vocab)
        
        # 取最后一个位置的 logits | Take logits at last position
        next_logits = logits[0, -1, :]   # (vocab,)
        
        # 贪心：选概率最高的 | Greedy: pick highest probability
        next_token = torch.argmax(next_logits).unsqueeze(0).unsqueeze(0)
        
        # 拼接 | Concatenate
        tokens = torch.cat([tokens, next_token], dim=1)
        
        # 如果生成了结束符，停止 | If EOS generated, stop
        if next_token.item() == 0:   # 假设 0 是 EOS | Assume 0 is EOS
            break
    
    return tokens

# 温度采样 | Temperature Sampling
@torch.no_grad()
def temperature_sample(model, start_tokens, max_length=50, temperature=1.0):
    """
    温度采样：控制随机性 | Temperature sampling: control randomness
    """
    model.eval()
    tokens = start_tokens.clone()
    
    for _ in range(max_length):
        logits = model(tokens)
        next_logits = logits[0, -1, :] / temperature
        
        # 计算概率 | Compute probabilities
        probs = torch.softmax(next_logits, dim=-1)
        
        # 采样 | Sample
        next_token = torch.multinomial(probs, num_samples=1).unsqueeze(0)
        
        tokens = torch.cat([tokens, next_token], dim=1)
    
    return tokens

# Top-k 采样 | Top-k Sampling
@torch.no_grad()
def top_k_sample(model, start_tokens, max_length=50, k=50, temperature=1.0):
    """
    Top-k 采样：只从概率最高的 k 个 token 中采样 | Top-k: only sample from top k tokens
    """
    model.eval()
    tokens = start_tokens.clone()
    
    for _ in range(max_length):
        logits = model(tokens)
        next_logits = logits[0, -1, :] / temperature
        
        # 取 top-k | Take top-k
        top_k_logits, top_k_indices = torch.topk(next_logits, k)
        top_k_probs = torch.softmax(top_k_logits, dim=-1)
        
        # 在 top-k 中采样 | Sample among top-k
        sampled_idx = torch.multinomial(top_k_probs, num_samples=1)
        next_token = top_k_indices[sampled_idx].unsqueeze(0)
        
        tokens = torch.cat([tokens, next_token], dim=1)
    
    return tokens
```

---

## 15.4 Next Token Prediction — 训练目标 | Next Token Prediction — Training Objective

### 中文解释

**训练方式：预测下一个 token**

输入：`"今天天气"`
标签：`"今天天气很"` — 即输入右移一位

Loss 计算：
- 模型输出：`["今", "天", "天", "气"]` 每个位置的 logits
- 标签：`["天", "天", "气", "很"]`
- 每个位置预测下一个 token 的 CrossEntropy Loss

### English Explanation

**Training method: Predict the next token**

Input: `"The weather"`
Label: `"The weather is"` — i.e., input shifted right by one

Loss computation:
- Model output: logits for each position of `["The", "weather"]`
- Labels: `["weather", "is"]`
- CrossEntropy Loss for predicting the next token at each position

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

def compute_loss(model, input_ids):
    """
    计算 Next Token Prediction Loss | Compute Next Token Prediction Loss
    input_ids: (batch, seq) — 输入 token IDs
    """
    # 前向传播 | Forward
    logits = model(input_ids)   # (batch, seq, vocab)
    
    # 目标：每个位置预测下一个 token | Target: predict next token at each position
    # logits[:, :-1, :] 预测 input_ids[:, 1:] | logits[:, :-1, :] predicts input_ids[:, 1:]
    
    logits_for_pred = logits[:, :-1, :]     # (batch, seq-1, vocab)
    targets = input_ids[:, 1:]               # (batch, seq-1)
    
    # 计算 loss | Compute loss
    loss = nn.functional.cross_entropy(
        logits_for_pred.reshape(-1, logits_for_pred.size(-1)),
        targets.reshape(-1),
        ignore_index=0,   # 忽略 padding token | Ignore padding token
    )
    
    return loss

# 示例 | Example
vocab_size = 1000
seq_len = 10
input_ids = torch.randint(1, vocab_size, (4, seq_len))   # (batch, seq)

# 模拟模型 | Simulate model
class SimpleModel(nn.Module):
    def __init__(self, vocab_size):
        super().__init__()
        self.emb = nn.Embedding(vocab_size, 128)
        self.head = nn.Linear(128, vocab_size)
    
    def forward(self, x):
        return self.head(self.emb(x))

model = SimpleModel(vocab_size)
loss = compute_loss(model, input_ids)
print(f"Loss: {loss.item():.4f}")
```

---

## 15.5 KV Cache — 推理加速的关键 | KV Cache — Key to Inference Acceleration

### 中文解释

**问题：自回归生成时，每次都要重新计算所有位置的 K 和 V**

**解决：缓存之前计算好的 K 和 V**

```
生成第5个 token 时：
  - 需要 Q_5 @ K_{1:5}.T
  - K_{1:4} 已经在生成前4个 token 时算过了
  - 只需计算 K_5，然后拼接
```

### English Explanation

**Problem: In autoregressive generation, K and V for all positions are recomputed every time**

**Solution: Cache previously computed K and V**

```
When generating the 5th token:
  - Need Q_5 @ K_{1:5}.T
  - K_{1:4} was already computed when generating first 4 tokens
  - Only need to compute K_5, then concatenate
```

### 代码案例 | Code Example

```python
import torch

class KVCache:
    """KV Cache 实现 | KV Cache implementation"""
    
    def __init__(self, num_layers, num_heads, max_batch_size, max_seq_len, d_head):
        """
        预分配缓存空间 | Pre-allocate cache space
        """
        self.num_layers = num_layers
        # 每个 layer 有 K 和 V 两个缓存 | Each layer has K and V caches
        self.k_cache = torch.zeros(num_layers, max_batch_size, num_heads, max_seq_len, d_head)
        self.v_cache = torch.zeros(num_layers, max_batch_size, num_heads, max_seq_len, d_head)
        self.seq_len = 0
    
    def update(self, layer_idx, k, v):
        """
        更新缓存 | Update cache
        k, v: (batch, heads, 1, d_head) — 新计算的 K/V | Newly computed K/V
        """
        self.k_cache[layer_idx, :, :, self.seq_len, :] = k.squeeze(2)
        self.v_cache[layer_idx, :, :, self.seq_len, :] = v.squeeze(2)
    
    def get(self, layer_idx):
        """
        获取缓存的 K/V | Get cached K/V
        返回: (batch, heads, seq_len, d_head) | Returns: (batch, heads, seq_len, d_head)
        """
        k = self.k_cache[layer_idx, :, :, :self.seq_len+1, :]
        v = self.v_cache[layer_idx, :, :, :self.seq_len+1, :]
        return k, v
    
    def increment(self):
        """增加序列长度 | Increment sequence length"""
        self.seq_len += 1

# 使用 KV Cache 的 Attention | Attention with KV Cache
def attention_with_kv_cache(Q, K_new, V_new, kv_cache, layer_idx):
    """
    Q: (batch, heads, 1, d_head) — 当前 token 的 Query
    K_new, V_new: (batch, heads, 1, d_head) — 当前 token 的 K/V
    """
    # 更新缓存 | Update cache
    kv_cache.update(layer_idx, K_new, V_new)
    
    # 获取所有缓存的 K/V | Get all cached K/V
    K_all, V_all = kv_cache.get(layer_idx)
    # K_all: (batch, heads, seq_len, d_head)
    
    # 计算 attention | Compute attention
    scores = torch.matmul(Q, K_all.transpose(-2, -1))   # (B, H, 1, seq)
    weights = torch.softmax(scores, dim=-1)
    output = torch.matmul(weights, V_all)                # (B, H, 1, d_head)
    
    return output
```

---

## 本章总结 | Chapter Summary

**中文：**
- Decoder-only 是现代大模型的标准架构
- Causal Mask 保证生成时不偷看未来
- 自回归 = 一次生成一个 token
- 训练目标 = Next Token Prediction
- KV Cache 是推理加速的关键优化

**English:**
- Decoder-only is the standard architecture for modern LLMs
- Causal Mask ensures no peeking at future during generation
- Autoregressive = generate one token at a time
- Training objective = Next Token Prediction
- KV Cache is the key optimization for inference acceleration

---

## 课后练习 | Homework

1. **Causal Mask**：手写因果掩码，验证它确实阻止了未来信息的泄露
2. **生成策略**：实现 greedy、temperature、top-k 三种生成策略，比较输出差异
3. **训练循环**：实现一个完整的 GPT 训练循环（forward + loss + backward）
4. **KV Cache**：在已有 Attention 基础上加入 KV Cache，验证推理速度提升
5. **序列长度实验**：测试不同序列长度下，有/无 KV Cache 的推理时间差异
