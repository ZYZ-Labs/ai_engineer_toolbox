# 第2章：向量 — Attention 的灵魂 | Chapter 2: Vectors — The Soul of Attention

> **阶段定位** | **Stage**: 第一阶段 — Tensor 与 Attention 基础
> **预计学时** | **Duration**: 4~6 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 真正理解向量是什么，为什么它是 Attention 的核心
- 掌握点积（Dot Product）和 cosine similarity 的计算与含义
- 理解 `QK^T` 的本质：token 之间的相似度计算
- 建立"向量 = 语义"的直觉

**English:**
- Truly understand what vectors are and why they're the core of Attention
- Master dot product and cosine similarity computation and meaning
- Understand the essence of `QK^T`: similarity computation between tokens
- Build the intuition that "vector = semantics"

---

## 2.1 向量是什么？| What is a Vector?

### 中文解释

**向量 = 有方向和大小的箭头 = 高维空间中的一个点**

在 AI 中：
- 一个单词 → 一个向量（embedding）
- 向量的每个维度 → 某种语义特征
- 向量之间的距离 → 语义的相似程度

### English Explanation

**Vector = An arrow with direction and magnitude = A point in high-dimensional space**

In AI:
- One word → One vector (embedding)
- Each dimension of the vector → Some semantic feature
- Distance between vectors → Semantic similarity

### 直观图解 | Visual Intuition

```
2D 空间中的向量：
Vector in 2D space:

      ^ y
      |
  v2 = (3,4) ●
      |    /|
      |   / |
      |  /  |
      | /   |
      |/    |
  ────┼─────┼────> x
      |     ● v1 = (4,0)
      |

高维空间想象：
Imagine in high-D space:
  "king"   → [0.2, -0.5, 0.8, ..., 0.1]  (768维 | 768 dims)
  "queen"  → [0.3, -0.4, 0.7, ..., 0.2]
  "apple"  → [-0.8, 0.2, -0.1, ..., 0.5]
  
  "king" 和 "queen" 的向量很近（相似度高）
  "king" 和 "apple" 的向量很远（相似度低）
  
  "king" and "queen" vectors are close (high similarity)
  "king" and "apple" vectors are far apart (low similarity)
```

---

## 2.2 点积（Dot Product）| Dot Product

### 中文解释

**点积 = 衡量两个向量"同向程度"的标量**

公式：
```
a · b = Σ(a_i × b_i) = |a| × |b| × cos(θ)
```

含义：
- 点积 > 0：两向量大致同向（相似）
- 点积 = 0：两向量正交（无关）
- 点积 < 0：两向量反向（相反）

### English Explanation

**Dot Product = A scalar measuring how much two vectors point in the same direction**

Formula:
```
a · b = Σ(a_i × b_i) = |a| × |b| × cos(θ)
```

Meaning:
- Dot product > 0: Vectors roughly point the same way (similar)
- Dot product = 0: Vectors are orthogonal (unrelated)
- Dot product < 0: Vectors point opposite ways (opposite)

### 代码案例 | Code Example

```python
import numpy as np

# 定义向量 | Define vectors
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])
c = np.array([-1, -2, -3])   # 与 a 反向 | Opposite to a
d = np.array([1, 0, 0])      # 与 a 部分相关 | Partially related to a

# 点积计算 | Dot product computation
dot_ab = np.dot(a, b)   # 1*4 + 2*5 + 3*6 = 32
dot_ac = np.dot(a, c)   # 1*(-1) + 2*(-2) + 3*(-3) = -14
dot_ad = np.dot(a, d)   # 1*1 + 2*0 + 3*0 = 1

print(f"a · b = {dot_ab}  (同向/相似 | Same direction/similar)")
print(f"a · c = {dot_ac}  (反向/相反 | Opposite direction)")
print(f"a · d = {dot_ad}  (部分相关 | Partially related)")

# 手动实现点积 | Manual implementation
def manual_dot(x, y):
    """手动点积：对应元素相乘再求和"""
    """Manual dot: multiply corresponding elements and sum"""
    result = 0
    for i in range(len(x)):
        result += x[i] * y[i]
    return result

print(f"手动计算 a·b = {manual_dot(a, b)}")
```

### Attention 中的点积 | Dot Product in Attention

```python
import numpy as np

# 模拟三个 token 的向量 | Simulate vectors for 3 tokens
# "猫" | "cat"
q_cat = np.array([0.8, 0.2, 0.1])     # 查询向量 | Query vector
# "抓" | "catch"
k_catch = np.array([0.3, 0.9, 0.1])   # 键向量 | Key vector
# "老鼠" | "mouse"
k_mouse = np.array([0.9, 0.1, 0.8])   # 键向量 | Key vector

# 计算注意力分数 | Compute attention scores
score_catch = np.dot(q_cat, k_catch)   # "猫" 对 "抓" 的注意力 | Attention from "cat" to "catch"
score_mouse = np.dot(q_cat, k_mouse)   # "猫" 对 "老鼠" 的注意力 | Attention from "cat" to "mouse"

print(f"猫→抓 的注意力分数: {score_catch:.3f}")
print(f"猫→老鼠 的注意力分数: {score_mouse:.3f}")

# 结论：猫和老鼠的关联度可能更高！
# Conclusion: "cat" and "mouse" may have higher relevance!
```

---

## 2.3 Cosine Similarity（余弦相似度）| Cosine Similarity

### 中文解释

**Cosine Similarity = 只看方向，不看大小的相似度度量**

公式：
```
cos(θ) = (a · b) / (|a| × |b|)
```

取值范围：`[-1, 1]`
- 1：完全同向（最相似）
- 0：正交（无关）
- -1：完全反向（最不相似）

为什么除以模长？
- 消除向量长度的影响，只保留方向信息
- 在 NLP 中，避免长文档总是得分更高的问题

### English Explanation

**Cosine Similarity = Measures similarity by direction only, ignoring magnitude**

Formula:
```
cos(θ) = (a · b) / (|a| × |b|)
```

Range: `[-1, 1]`
- 1: Exactly same direction (most similar)
- 0: Orthogonal (unrelated)
- -1: Exactly opposite (least similar)

Why divide by magnitude?
- Eliminates the effect of vector length, keeping only directional information
- In NLP, prevents longer documents from always scoring higher

### 代码案例 | Code Example

```python
import numpy as np

def cosine_similarity(a, b):
    """计算余弦相似度 | Compute cosine similarity"""
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)   # |a| = sqrt(sum(a_i^2))
    norm_b = np.linalg.norm(b)   # |b| = sqrt(sum(b_i^2))
    return dot / (norm_a * norm_b)

# 案例：不同长度的相似向量 | Case: Similar vectors with different lengths
v1 = np.array([1, 1])
v2 = np.array([2, 2])       # 与 v1 同向，但更长 | Same direction, longer
v3 = np.array([1, -1])      # 与 v1 正交 | Orthogonal to v1

print(f"v1·v2 = {np.dot(v1, v2):.3f},  cosine = {cosine_similarity(v1, v2):.3f}")
print(f"v1·v3 = {np.dot(v1, v3):.3f},  cosine = {cosine_similarity(v1, v3):.3f}")

# 结果 | Results:
# v1·v2 = 4.000,  cosine = 1.000  <- 方向完全相同 | Same direction
# v1·v3 = 0.000,  cosine = 0.000  <- 完全无关 | Unrelated
```

### 点积 vs 余弦相似度 | Dot Product vs Cosine Similarity

| 特性 | 点积 Dot Product | 余弦相似度 Cosine Similarity |
|------|-----------------|----------------------------|
| 考虑长度 | 是 Yes | 否 No |
| 范围 | (-∞, +∞) | [-1, 1] |
| 计算成本 | 低 Low | 中 Medium（需算 norm）|
| Attention 使用 | Scaled Dot-Product | 归一化后等价 | Normalized equivalent |

---

## 2.4 QK^T 的本质 | The Essence of QK^T

### 中文解释

在 Attention 中：
```
scores = Q @ K^T
```

这不是什么魔法，而是：
**每个 token 的 Query 向量，与所有 token 的 Key 向量做点积。**

结果 `scores[i, j]` 表示：
> "第 i 个 token 应该多关注第 j 个 token"

### English Explanation

In Attention:
```
scores = Q @ K^T
```

This is not magic, but:
**Each token's Query vector dot-products with all tokens' Key vectors.**

The result `scores[i, j]` means:
> "How much should token i pay attention to token j"

### 代码案例：完整 QK^T 计算 | Code Example: Complete QK^T Computation

```python
import numpy as np

# 模拟：3个token，每个4维 | Simulate: 3 tokens, 4 dimensions each
# 句子："猫 抓 老鼠" | Sentence: "cat catch mouse"
seq_len = 3
dim = 4

# 输入 X: (seq_len, dim) | Input X
X = np.array([
    [0.8, 0.2, 0.1, 0.5],   # 猫 | cat
    [0.3, 0.9, 0.1, 0.2],   # 抓 | catch
    [0.9, 0.1, 0.8, 0.3],   # 老鼠 | mouse
])

# 权重矩阵（简化版，实际是学习得到的）| Weight matrices (simplified, learned in practice)
W_q = np.random.randn(dim, dim) * 0.1
W_k = np.random.randn(dim, dim) * 0.1

# 计算 Q 和 K | Compute Q and K
Q = X @ W_q    # (3, 4) @ (4, 4) = (3, 4)
K = X @ W_k    # (3, 4) @ (4, 4) = (3, 4)

print(f"Q shape: {Q.shape}")
print(f"K shape: {K.shape}")

# 计算 QK^T | Compute QK^T
scores = Q @ K.T   # (3, 4) @ (4, 3) = (3, 3)
print(f"\nScores shape: {scores.shape}")
print("注意力分数矩阵 | Attention score matrix:")
print(scores.round(3))

# 解读 | Interpretation:
# scores[i, j] = token_i 对 token_j 的注意力
# scores[i, j] = attention from token_i to token_j
# 比如 scores[0, 2] = "猫" 对 "老鼠" 的注意力分数
# e.g., scores[0, 2] = attention score from "cat" to "mouse"
```

### 可视化解释 | Visual Explanation

```
输入 X: (seq_len=3, dim=4)
        猫      抓      老鼠
       cat    catch    mouse
        ↓       ↓        ↓
Q = X @ Wq → [q_cat, q_catch, q_mouse]  (3, 4)
K = X @ Wk → [k_cat, k_catch, k_mouse]  (3, 4)

scores = Q @ K.T:

              k_cat   k_catch  k_mouse
             ┌──────┬────────┬────────┐
    q_cat    │ s00  │  s01   │  s02   │   ← "猫"关注谁最多？
             ├──────┼────────┼────────┤      Who does "cat" attend to most?
    q_catch  │ s10  │  s11   │  s12   │   ← "抓"关注谁最多？
             ├──────┼────────┼────────┤      Who does "catch" attend to most?
    q_mouse  │ s20  │  s21   │  s22   │   ← "老鼠"关注谁最多？
             └──────┴────────┴────────┘      Who does "mouse" attend to most?
```

---

## 2.5 向量投影 | Vector Projection

### 中文解释

**投影 = 一个向量在另一个向量方向上的"影子"**

在 Attention 中，Q、K、V 的生成就是投影：
- Q = X @ W_q：将输入投影到"查询空间"
- K = X @ W_k：将输入投影到"键空间"
- V = X @ W_v：将输入投影到"值空间"

同一个输入，投影到三个不同的语义空间，各司其职。

### English Explanation

**Projection = The "shadow" of one vector onto another vector's direction**

In Attention, Q, K, V generation is projection:
- Q = X @ W_q: Project input into "query space"
- K = X @ W_k: Project input into "key space"
- V = X @ W_v: Project input into "value space"

The same input projected into three different semantic spaces, each with its own role.

### 代码案例 | Code Example

```python
import numpy as np

# 向量投影可视化 | Vector projection visualization
v = np.array([3, 4])       # 原向量 | Original vector
u = np.array([1, 0])       # 投影方向（x轴）| Projection direction (x-axis)

# 投影长度 = v·u / |u| | Projection length = v·u / |u|
proj_length = np.dot(v, u) / np.linalg.norm(u)
print(f"v 在 u 方向的投影长度: {proj_length:.2f}")
# v 在 x 轴的投影 = 3 | Projection of v on x-axis = 3

# 在 Attention 中：| In Attention:
# X @ W 就是投影操作 | X @ W is the projection operation
X = np.array([1, 2, 3])
W = np.array([
    [0.5, 0.5],
    [0.2, 0.8],
    [0.1, 0.9]
])
# X @ W = [1*0.5+2*0.2+3*0.1, 1*0.5+2*0.8+3*0.9]
#       = [1.2, 4.8]
# 3维向量 X 被投影到 2维空间
# 3D vector X is projected into 2D space
```

---

## 本章总结 | Chapter Summary

**中文：**
- 向量是高维空间中的点，距离代表语义相似度
- 点积衡量"同向程度"，是 Attention 分数的核心计算
- 余弦相似度只看方向不看大小，更纯粹的相似度度量
- `QK^T` = 所有 token 两两之间的相似度矩阵
- 投影 = 将向量映射到新的语义空间

**English:**
- Vectors are points in high-dimensional space; distance represents semantic similarity
- Dot product measures "same-direction-ness", the core computation of Attention scores
- Cosine similarity only looks at direction, not magnitude — a purer similarity measure
- `QK^T` = A similarity matrix between all pairs of tokens
- Projection = Mapping vectors into new semantic spaces

---

## 课后练习 | Homework

1. **点积练习**：计算 `[1, 2, 3]` 与 `[4, 5, 6]`、`[1, -1, 0]`、`[0, 0, 0]` 的点积，解释结果含义
2. **cosine 练习**：生成两个随机向量，分别计算点积和 cosine similarity，比较它们的区别
3. **相似度矩阵**：用 NumPy 实现一个小函数，输入一个矩阵 X，输出 X 中每行向量之间的 cosine similarity 矩阵
4. **思考题**：为什么在 Attention 中使用点积而不是 cosine similarity？（提示：计算效率）
