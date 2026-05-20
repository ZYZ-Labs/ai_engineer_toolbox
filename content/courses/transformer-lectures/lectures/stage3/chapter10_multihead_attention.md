# 第10章：Multi-Head Attention — 多头注意力 | Chapter 10: Multi-Head Attention

> **阶段定位** | **Stage**: 第三阶段 — Transformer 核心
> **预计学时** | **Duration**: 6~8 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 真正理解为什么需要多头注意力，而不是单头
- 掌握 Multi-Head Attention 的完整实现
- 理解 head 分工：不同头学习不同语义关系
- 能手写 Multi-Head Attention 并验证 shape

**English:**
- Truly understand why Multi-Head Attention is needed instead of single-head
- Master the complete implementation of Multi-Head Attention
- Understand head specialization: different heads learn different semantic relations
- Be able to write Multi-Head Attention by hand and verify shapes

---

## 10.1 为什么需要多头？| Why Multi-Head?

### 中文解释

**单头注意力的局限：**
- 只有一个注意力视角
- 所有语义关系混在一起计算

**多头注意力的优势：**
- 多个注意力视角并行
- 不同头可以学习不同类型的关系
- 类似卷积神经网络中的多个卷积核

### English Explanation

**Limitation of single-head attention:**
- Only one attention perspective
- All semantic relations mixed in one computation

**Advantages of multi-head attention:**
- Multiple attention perspectives in parallel
- Different heads can learn different types of relations
- Similar to multiple kernels in CNN

### Head 分工示例 | Head Specialization Example

```
句子："猫坐在垫子上，因为它很温暖"
Sentence: "The cat sat on the mat because it was warm"

Head 1: 句法关系 | Syntactic relations
  "it" → "mat" (指代 | coreference)
  
Head 2: 语义关系 | Semantic relations
  "cat" → "sat" (主谓 | subject-verb)
  
Head 3: 位置关系 | Positional relations
  "on" → "mat" (介宾 | preposition-object)
  
Head 4: 全局聚合 | Global aggregation
  关注所有内容词 | Attend to all content words
```

---

## 10.2 Multi-Head Attention 公式 | Multi-Head Attention Formula

### 中文解释

```
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) @ W_o

where head_i = Attention(Q @ W_q_i, K @ W_k_i, V @ W_v_i)
```

关键超参数：
- `d_model` = 768：模型总维度
- `num_heads` = 12：头数
- `d_head` = d_model / num_heads = 64：每个头的维度

### English Explanation

```
MultiHead(Q, K, V) = Concat(head_1, ..., head_h) @ W_o

where head_i = Attention(Q @ W_q_i, K @ W_k_i, V @ W_v_i)
```

Key hyperparameters:
- `d_model` = 768: Total model dimension
- `num_heads` = 12: Number of heads
- `d_head` = d_model / num_heads = 64: Dimension per head

---

## 10.3 完整实现 | Complete Implementation

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn
import math

class MultiHeadAttention(nn.Module):
    """多头注意力完整实现 | Complete Multi-Head Attention implementation"""
    
    def __init__(self, d_model, num_heads):
        super().__init__()
        assert d_model % num_heads == 0, "d_model must be divisible by num_heads"
        
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_head = d_model // num_heads   # 64
        
        # 线性投影层 | Linear projection layers
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        
    def split_heads(self, x):
        """
        分头：| Split heads:
        (batch, seq, d_model) → (batch, num_heads, seq, d_head)
        """
        batch_size, seq_len, _ = x.shape
        x = x.view(batch_size, seq_len, self.num_heads, self.d_head)
        return x.permute(0, 2, 1, 3)   # (B, H, S, D)
    
    def scaled_dot_product_attention(self, Q, K, V, mask=None):
        """
        单头注意力计算 | Single-head attention computation
        Q, K, V: (batch, num_heads, seq, d_head)
        """
        scores = torch.matmul(Q, K.transpose(-2, -1))   # (B, H, S, S)
        scores = scores / math.sqrt(self.d_head)
        
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))
        
        weights = torch.softmax(scores, dim=-1)   # (B, H, S, S)
        output = torch.matmul(weights, V)          # (B, H, S, d_head)
        
        return output, weights
    
    def combine_heads(self, x):
        """
        合并头：| Combine heads:
        (batch, num_heads, seq, d_head) → (batch, seq, d_model)
        """
        batch_size, _, seq_len, _ = x.shape
        x = x.permute(0, 2, 1, 3)   # (B, S, H, D)
        return x.reshape(batch_size, seq_len, self.d_model)   # (B, S, d_model)
    
    def forward(self, Q, K, V, mask=None):
        """
        完整前向传播 | Complete forward pass
        Input/Output: (batch, seq, d_model)
        """
        batch_size = Q.size(0)
        
        # 1. 线性投影 | Linear projections
        Q = self.W_q(Q)   # (B, S, d_model)
        K = self.W_k(K)
        V = self.W_v(V)
        
        # 2. 分头 | Split heads
        Q = self.split_heads(Q)   # (B, H, S, d_head)
        K = self.split_heads(K)
        V = self.split_heads(V)
        
        # 3. 注意力计算 | Attention computation
        attn_output, weights = self.scaled_dot_product_attention(Q, K, V, mask)
        # attn_output: (B, H, S, d_head)
        
        # 4. 合并头 | Combine heads
        attn_output = self.combine_heads(attn_output)   # (B, S, d_model)
        
        # 5. 最终线性投影 | Final linear projection
        output = self.W_o(attn_output)   # (B, S, d_model)
        
        return output, weights

# ========== 测试 | Test ==========
batch_size = 2
seq_len = 10
d_model = 768
num_heads = 12

mha = MultiHeadAttention(d_model, num_heads)
X = torch.randn(batch_size, seq_len, d_model)

output, weights = mha(X, X, X)

print(f"Input shape: {X.shape}")
print(f"Output shape: {output.shape}")
print(f"Attention weights shape: {weights.shape}")   # (B, H, S, S)
print(f"Expected: ({batch_size}, {num_heads}, {seq_len}, {seq_len})")
```

---

## 10.4 Shape 变化追踪 | Shape Change Tracking

### 完整数据流 | Complete Data Flow

```
Input:        (batch, seq, d_model=768)
                 ↓
W_q projection: (batch, seq, 768)
                 ↓
Split heads:    (batch, num_heads=12, seq, d_head=64)
                 ↓
Q @ K.T:        (batch, 12, seq, seq)
                 ↓
Softmax:        (batch, 12, seq, seq)  — 注意力权重 | attention weights
                 ↓
@ V:            (batch, 12, seq, 64)
                 ↓
Combine heads:  (batch, seq, 768)
                 ↓
W_o projection: (batch, seq, 768)  — 输出 | Output
```

### 代码验证 | Code Verification

```python
import torch

# 分步验证 shape | Step-by-step shape verification
batch, seq, d_model, num_heads = 2, 10, 768, 12
d_head = d_model // num_heads

X = torch.randn(batch, seq, d_model)
print(f"1. Input:           {X.shape}")

# 投影 | Projection
W_q = torch.randn(d_model, d_model)
Q = X @ W_q.T
print(f"2. After W_q:       {Q.shape}")

# 分头 | Split
Q_h = Q.view(batch, seq, num_heads, d_head).permute(0, 2, 1, 3)
print(f"3. Split heads:     {Q_h.shape}")

# Q @ K.T (假设 K=Q) | Q @ K.T (assuming K=Q)
scores = Q_h @ Q_h.transpose(-2, -1)
print(f"4. Q @ K.T:         {scores.shape}")

# Softmax
weights = torch.softmax(scores / (d_head ** 0.5), dim=-1)
print(f"5. Softmax weights: {weights.shape}")

# @ V (假设 V=Q_h) | @ V (assuming V=Q_h)
out = weights @ Q_h
print(f"6. @ V:             {out.shape}")

# 合并 | Combine
out = out.permute(0, 2, 1, 3).reshape(batch, seq, d_model)
print(f"7. Combine heads:   {out.shape}")

# 输出投影 | Output projection
W_o = torch.randn(d_model, d_model)
output = out @ W_o.T
print(f"8. After W_o:       {output.shape}")
```

---

## 10.5 多头 vs 单头的计算效率 | Computational Efficiency: Multi-Head vs Single-Head

### 中文解释

**关键发现：多头注意力的总计算量 ≈ 单头注意力的计算量**

原因：虽然分成了多个头，但每个头的维度减小了。

### English Explanation

**Key finding: Total computation of multi-head attention ≈ single-head attention computation**

Reason: Although split into multiple heads, each head's dimension is reduced.

### 计算量分析 | Computation Analysis

```
单头 (d=768):    Q@K.T: (S, 768) @ (768, S) = O(S² × 768)

多头 (12×64=768):
  分头后：12 × [(S, 64) @ (64, S)] = 12 × O(S² × 64) = O(S² × 768)
  
总计算量相同！但并行度更高。
Total computation is the same! But parallelism is higher.
```

---

## 10.6 Grouped Query Attention（GQA）预览 | Grouped Query Attention Preview

### 中文解释

**GQA = 多查询注意力（MQA）和多头的折中**

- 标准 MHA：Q/K/V 都有 num_heads 个头
- MQA：所有 head 共享 K/V
- GQA：K/V 有 num_heads/k 个组，每组共享

### English Explanation

**GQA = Compromise between Multi-Query Attention (MQA) and Multi-Head**

- Standard MHA: Q/K/V all have num_heads heads
- MQA: All heads share K/V
- GQA: K/V have num_heads/k groups, shared within group

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

class GroupedQueryAttention(nn.Module):
    """GQA 简化实现 | Simplified GQA implementation"""
    
    def __init__(self, d_model, num_heads, num_kv_groups):
        super().__init__()
        self.num_heads = num_heads
        self.num_kv_groups = num_kv_groups
        self.d_head = d_model // num_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        # K/V 的投影维度减小 | K/V projection dimension reduced
        self.W_k = nn.Linear(d_model, num_kv_groups * self.d_head)
        self.W_v = nn.Linear(d_model, num_kv_groups * self.d_head)
        self.W_o = nn.Linear(d_model, d_model)
    
    def forward(self, X):
        B, S, _ = X.shape
        
        Q = self.W_q(X).view(B, S, self.num_heads, self.d_head)
        K = self.W_k(X).view(B, S, self.num_kv_groups, self.d_head)
        V = self.W_v(X).view(B, S, self.num_kv_groups, self.d_head)
        
        # K/V 扩展以匹配 Q 的头数 | Expand K/V to match Q's head count
        # (B, S, num_kv_groups, d) → (B, S, num_heads, d)
        expand_factor = self.num_heads // self.num_kv_groups
        K = K.repeat_interleave(expand_factor, dim=2)
        V = V.repeat_interleave(expand_factor, dim=2)
        
        # 后续与标准 MHA 相同 | Rest same as standard MHA
        # ...
        return X

# 参数对比：| Parameter comparison:
# MHA:  4 × d_model² = 4 × 768² = 2.36M
# GQA (4 groups): ≈ d_model² + 2 × (d_model × d_model/4) + d_model² = 1.77M
# 节省约 25% | Saves ~25%
```

---

## 本章总结 | Chapter Summary

**中文：**
- 多头 = 多个注意力视角并行
- 每个头学习不同类型的语义关系
- 分头通过 reshape + permute 实现，不增加计算量
- 输出通过 Concat + W_o 投影回 d_model 维度
- GQA 是效率优化的重要方向

**English:**
- Multi-head = multiple attention perspectives in parallel
- Each head learns different types of semantic relations
- Head splitting via reshape + permute, no extra computation
- Output projected back to d_model via Concat + W_o
- GQA is an important direction for efficiency optimization

---

## 课后练习 | Homework

1. **手写实现**：不参考示例，独立实现 MultiHeadAttention 类
2. **Shape 追踪**：对每一步操作打印 shape，画出完整数据流图
3. **注意力可视化**：训练后取出不同 head 的注意力权重，观察差异
4. **GQA 实现**：将标准 MHA 改为 GQA，比较参数量
5. **效率测试**：比较单头和多头在相同 d_model 下的运行时间
