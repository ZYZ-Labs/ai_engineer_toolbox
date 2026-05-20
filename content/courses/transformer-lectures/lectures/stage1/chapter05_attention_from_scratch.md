# 第5章：从零手写 Attention — 真正开始懂 Transformer
# Chapter 5: Writing Attention from Scratch — Truly Understanding Transformer

> **阶段定位** | **Stage**: 第一阶段 — Tensor 与 Attention 基础
> **预计学时** | **Duration**: 8~10 小时（本章是分水岭 | This chapter is the watershed）

---

## 学习目标 | Learning Objectives

**中文：**
- 从零实现完整的 Scaled Dot-Product Attention
- 真正理解 Q、K、V 的含义：Q 在问什么，K 在回答匹配，V 在携带信息
- 掌握 Attention 的完整数据流和 shape 变化
- 能够 debug Attention 的中间结果

**English:**
- Implement complete Scaled Dot-Product Attention from scratch
- Truly understand Q, K, V meaning: Q asks, K matches, V carries information
- Master the complete data flow and shape changes in Attention
- Be able to debug intermediate results of Attention

---

## 5.1 Attention 的本质公式 | The Essential Formula of Attention

### 中文解释

```
Attention(Q, K, V) = softmax(QK^T / √d_k) V
```

分步拆解：
1. `QK^T`：计算所有 token 两两之间的相似度
2. `/ √d_k`：缩放，防止数值过大
3. `softmax(...)`：将相似度转化为概率分布（注意力权重）
4. `@ V`：用注意力权重对 Value 做加权求和

### English Explanation

```
Attention(Q, K, V) = softmax(QK^T / √d_k) V
```

Step-by-step breakdown:
1. `QK^T`: Compute pairwise similarity between all tokens
2. `/ √d_k`: Scale to prevent values from becoming too large
3. `softmax(...)`: Transform similarities into probability distribution (attention weights)
4. `@ V`: Weighted sum of Values using attention weights

### 核心直觉 | Core Intuition

```
Query = "我在找什么信息？"
Key   = "我有什么信息可以匹配？"
Value = "我的实际内容是什么？"

Attention = 对每个 Query，在所有 Key 中找到最匹配的，然后取对应 Value 的加权平均。

For each Query, find the best matching Keys among all tokens,
then take the weighted average of corresponding Values.
```

---

## 5.2 完整 Attention 实现 | Complete Attention Implementation

### 代码案例 | Code Example

```python
import numpy as np

class AttentionFromScratch:
    """从零实现的单头注意力 | Single-head attention from scratch"""
    
    def __init__(self, d_model):
        """
        d_model: 模型维度（Q/K/V 的维度）| Model dimension
        """
        self.d_model = d_model
        
        # 初始化投影矩阵（实际中会用更好的初始化）| Initialize projection matrices
        self.W_q = np.random.randn(d_model, d_model) * 0.01
        self.W_k = np.random.randn(d_model, d_model) * 0.01
        self.W_v = np.random.randn(d_model, d_model) * 0.01
    
    def forward(self, X, verbose=True):
        """
        前向传播 | Forward pass
        X: (seq_len, d_model) — 输入序列 | Input sequence
        """
        if verbose:
            print(f"{'='*50}")
            print("Attention 前向传播 | Forward Pass")
            print(f"{'='*50}")
            print(f"Input X shape: {X.shape}")
        
        # Step 1: 投影到 Q/K/V | Project to Q/K/V
        Q = X @ self.W_q    # (seq, d_model) @ (d_model, d_model) = (seq, d_model)
        K = X @ self.W_k
        V = X @ self.W_v
        
        if verbose:
            print(f"\nStep 1: Q/K/V 投影 | Projection")
            print(f"  Q shape: {Q.shape}")
            print(f"  K shape: {K.shape}")
            print(f"  V shape: {V.shape}")
        
        # Step 2: 计算注意力分数 | Compute attention scores
        scores = Q @ K.T    # (seq, d_model) @ (d_model, seq) = (seq, seq)
        
        if verbose:
            print(f"\nStep 2: Q @ K.T")
            print(f"  scores shape: {scores.shape}")
            print(f"  scores range: [{scores.min():.3f}, {scores.max():.3f}]")
        
        # Step 3: 缩放 | Scale
        scores_scaled = scores / np.sqrt(self.d_model)
        
        if verbose:
            print(f"\nStep 3: Scale by √{self.d_model}")
            print(f"  scaled scores range: [{scores_scaled.min():.3f}, {scores_scaled.max():.3f}]")
        
        # Step 4: Softmax | Softmax
        # 数值稳定的 softmax | Numerically stable softmax
        scores_max = np.max(scores_scaled, axis=-1, keepdims=True)
        exp_scores = np.exp(scores_scaled - scores_max)
        weights = exp_scores / np.sum(exp_scores, axis=-1, keepdims=True)
        
        if verbose:
            print(f"\nStep 4: Softmax")
            print(f"  weights shape: {weights.shape}")
            print(f"  weights sum per row: {weights.sum(axis=-1).round(6)}")
            print(f"  Attention matrix:")
            print(weights.round(4))
        
        # Step 5: 加权求和 | Weighted sum
        output = weights @ V    # (seq, seq) @ (seq, d_model) = (seq, d_model)
        
        if verbose:
            print(f"\nStep 5: weights @ V")
            print(f"  output shape: {output.shape}")
            print(f"{'='*50}")
        
        return output, weights

# ========== 测试 | Test ==========

# 创建模型 | Create model
d_model = 8
seq_len = 4
attn = AttentionFromScratch(d_model)

# 模拟输入：4个token | Simulate input: 4 tokens
# 例如："猫 抓 了 老鼠" | e.g., "cat caught the mouse"
X = np.random.randn(seq_len, d_model)

# 前向传播 | Forward pass
output, weights = attn.forward(X)

print(f"\n最终输出 | Final output shape: {output.shape}")
print(f"注意力权重矩阵 | Attention weight matrix shape: {weights.shape}")
```

---

## 5.3 可视化理解 Attention 矩阵 | Visualizing the Attention Matrix

### 代码案例 | Code Example

```python
import numpy as np

def visualize_attention(weights, tokens=None):
    """可视化注意力权重 | Visualize attention weights"""
    seq_len = weights.shape[0]
    
    if tokens is None:
        tokens = [f"T{i}" for i in range(seq_len)]
    
    print("\n注意力权重矩阵 | Attention Weight Matrix:")
    print(" " * 8, end="")
    for t in tokens:
        print(f"{t:>8}", end="")
    print()
    
    for i, token in enumerate(tokens):
        print(f"{token:>6} |", end="")
        for j in range(seq_len):
            print(f"{weights[i, j]:>8.4f}", end="")
        print()

# 创建一个人工的注意力模式 | Create an artificial attention pattern
seq_len = 4
tokens = ["猫", "抓", "了", "老鼠"]   # "cat", "caught", "the", "mouse"

# 模拟理想的注意力：| Simulate ideal attention:
# "猫"主要关注"抓"和"老鼠" | "cat" mainly attends to "caught" and "mouse"
# "抓"主要关注"猫"和"老鼠" | "caught" mainly attends to "cat" and "mouse"
# 以此类推 | And so on

weights = np.array([
    [0.50, 0.25, 0.05, 0.20],   # 猫 → [猫, 抓, 了, 老鼠]
    [0.30, 0.40, 0.05, 0.25],   # 抓 → [猫, 抓, 了, 老鼠]
    [0.15, 0.15, 0.55, 0.15],   # 了 → [猫, 抓, 了, 老鼠]
    [0.25, 0.20, 0.05, 0.50],   # 老鼠 → [猫, 抓, 了, 老鼠]
])

visualize_attention(weights, tokens)

print("\n解读 | Interpretation:")
print("  '猫'对'老鼠'的注意力: 0.2000 (较高)")
print("  '抓'对'猫'的注意力: 0.3000 (较高)")
print("  '了'主要关注自己: 0.5500 (虚词通常如此)")
```

---

## 5.4 Q、K、V 的语义理解 | Semantic Understanding of Q, K, V

### 中文解释

**Q（Query）：查询者**
- 代表当前 token "想要获取什么信息"
- 类比：你在搜索引擎中输入的关键词

**K（Key）：索引键**
- 代表每个 token "能提供什么信息"
- 类比：网页的关键词标签

**V（Value）：实际值**
- 代表每个 token "实际的内容信息"
- 类比：网页的实际内容

**注意力过程 = 搜索引擎过程：**
1. 你输入 Query（关键词）
2. 系统匹配所有 Key（网页标签）
3. 返回最匹配的 Value（网页内容）的加权组合

### English Explanation

**Q (Query): The Seeker**
- Represents what information the current token "wants to get"
- Analogy: The keywords you type into a search engine

**K (Key): The Index**
- Represents what information each token "can provide"
- Analogy: Keyword tags on web pages

**V (Value): The Actual Content**
- Represents the actual content of each token
- Analogy: The actual content of web pages

**Attention process = Search engine process:**
1. You input Query (keywords)
2. System matches all Keys (page tags)
3. Returns weighted combination of best-matching Values (page contents)

### 代码案例：语义理解 | Code Example: Semantic Understanding

```python
import numpy as np

# 用一个极端简化的例子说明 Q/K/V | Use an extreme simplified example

# 假设我们有3个词的语义向量 | Assume semantic vectors for 3 words
embeddings = {
    "king":   np.array([0.9, 0.1, 0.8, 0.2]),   # 高权力，高男性 | high power, high male
    "queen":  np.array([0.9, 0.9, 0.7, 0.2]),   # 高权力，高女性 | high power, high female
    "man":    np.array([0.2, 0.1, 0.3, 0.9]),   # 低权力，高男性 | low power, high male
}

# 查询：找"有权力的人" | Query: find "powerful person"
query = np.array([1.0, 0.0, 0.0, 0.0])   # 重视第一维（权力）| Emphasize first dim (power)

# 手动注意力 | Manual attention
for word, emb in embeddings.items():
    score = np.dot(query, emb)
    print(f"Query · {word:6} = {score:.2f}")

# 结果：king 和 queen 的分数高 | Result: king and queen have high scores
# 说明 Query 成功匹配到了"有权力"的实体
# Shows Query successfully matched "powerful" entities

print("\n--- 加上 Key/Value 分离 | With Key/Value separation ---")

# 更真实的模拟 | More realistic simulation
# Key = 用于匹配的语义特征 | Key = semantic features for matching
# Value = 用于输出的完整信息 | Value = complete information for output

for word in ["king", "queen", "man"]:
    emb = embeddings[word]
    key = emb[:2]      # 前2维用于匹配：权力+性别 | First 2 dims for matching: power+gender
    value = emb        # 完整向量用于输出 | Full vector for output
    
    score = np.dot(query[:2], key)
    print(f"{word:6}: key={key}, score={score:.2f}, value={value}")
```

---

## 5.5 Attention 的梯度流 | Gradient Flow in Attention

### 中文解释

为什么 Attention 有效？因为它提供了"可学习的全连接"。

每个位置的输出，都依赖于所有位置的输入。
梯度可以从输出反向传播到任何输入。

### English Explanation

Why does Attention work? Because it provides "learnable full connections".

Each position's output depends on all positions' inputs.
Gradients can backpropagate from output to any input.

### 代码案例 | Code Example

```python
import numpy as np

# 演示梯度如何在 Attention 中流动 | Demonstrate gradient flow in Attention

# 假设我们已经有了 Attention 权重 | Assume we already have attention weights
weights = np.array([
    [0.5, 0.3, 0.2],
    [0.2, 0.6, 0.2],
    [0.1, 0.2, 0.7],
])

# 输出对 V 的梯度 | Gradient of output w.r.t. V
# dL/dV_j = Σ_i (dL/dOutput_i * dOutput_i/dV_j)
#         = Σ_i (dL/dOutput_i * weights[i, j])

# 这意味着：| This means:
# 每个 V_j 的梯度 = 所有需要它的输出的梯度的加权和
# Each V_j's gradient = weighted sum of gradients from all outputs that need it

d_output = np.array([1.0, 2.0, 3.0])   # 假设的输出梯度 | Hypothetical output gradient

# 计算 V 的梯度 | Compute gradient w.r.t. V
d_V = weights.T @ d_output   # (3, 3).T @ (3,) = (3,)

print("梯度流演示 | Gradient flow demonstration:")
print(f"d_output: {d_output}")
print(f"d_V (gradient for each V): {d_V}")
print(f"\n注意：V[2] 的梯度最大 ({d_V[2]:.1f})，因为所有输出都需要它")
print(f"Note: V[2] has largest gradient ({d_V[2]:.1f}) because all outputs need it")
```

---

## 5.6 从单头到多头：预告 | From Single-Head to Multi-Head: Preview

### 中文解释

当前实现的是**单头注意力**。下一章将扩展到多头。

核心思想：
- 单头 = 一个注意力视角
- 多头 = 多个注意力视角并行（语法、语义、指代、位置...）

### English Explanation

Our current implementation is **single-head attention**. Next chapter extends to multi-head.

Core idea:
- Single-head = One attention perspective
- Multi-head = Multiple attention perspectives in parallel (syntax, semantics, coreference, position...)

### 代码预告 | Code Preview

```python
import numpy as np

# 多头的核心：reshape | Core of multi-head: reshape
batch_size = 2
seq_len = 128
d_model = 512
num_heads = 8
d_head = d_model // num_heads   # 64

# Q: (batch, seq, d_model)
Q = np.random.randn(batch_size, seq_len, d_model)

# 多头 reshape：| Multi-head reshape:
# (batch, seq, d_model) → (batch, num_heads, seq, d_head)
Q_multi = Q.reshape(batch_size, seq_len, num_heads, d_head)
Q_multi = Q_multi.transpose(0, 2, 1, 3)   # (batch, heads, seq, d_head)

print(f"Q shape: {Q.shape}")
print(f"Q_multi shape: {Q_multi.shape}")

# 每个头独立做 Attention | Each head does attention independently
# 这就是 Multi-Head Attention 的核心 | This is the core of Multi-Head Attention
```

---

## 本章总结 | Chapter Summary

**中文：**
- Attention = QK^T 的 softmax × V
- Q = 查询者，K = 匹配键，V = 实际值
- 手写一遍是理解 Transformer 的必经之路
- Attention 矩阵告诉你"谁在看谁"
- 梯度可以流向任何位置，实现了全连接的灵活性

**English:**
- Attention = softmax of QK^T × V
- Q = seeker, K = matcher, V = carrier
- Writing it once by hand is the only way to truly understand Transformer
- The attention matrix tells you "who is looking at whom"
- Gradients can flow to any position, achieving the flexibility of full connections

---

## 课后练习 | Homework

1. **完整复现**：不看示例代码，独立手写一个 Attention 类
2. **形状追踪**：在每一步打印 shape，画出完整的数据流图
3. **注意力分析**：用一个人造的简单输入（如 `[1,0,0,0]`），观察注意力权重的分布
4. **调试练习**：故意在代码中引入一个 shape 错误，然后追踪报错信息找到问题
5. **进阶**：给 Attention 加上 causal mask（让当前 token 只能看到之前的 token）
