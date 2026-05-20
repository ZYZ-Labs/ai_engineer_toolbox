# 第3章：矩阵与投影 | Chapter 3: Matrices and Projection

> **阶段定位** | **Stage**: 第一阶段 — Tensor 与 Attention 基础
> **预计学时** | **Duration**: 5~7 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 真正理解矩阵乘法的本质：线性变换
- 掌握转置（Transpose）在 Attention 中的作用
- 理解 Shape 规则：为什么 `(m,k) @ (k,n) → (m,n)`
- 建立"矩阵 = 空间变换"的直觉

**English:**
- Truly understand the essence of matrix multiplication: linear transformation
- Master the role of Transpose in Attention
- Understand shape rules: why `(m,k) @ (k,n) → (m,n)`
- Build the intuition that "matrix = spatial transformation"

---

## 3.1 矩阵乘法 = 线性变换 | Matrix Multiplication = Linear Transformation

### 中文解释

**矩阵不是数字表格，而是"空间的变形器"。**

当你计算 `Y = X @ W` 时：
- `X` 是一堆向量（输入空间中的点）
- `W` 是变换规则
- `Y` 是变换后的向量（输出空间中的点）

### English Explanation

**A matrix is not just a table of numbers, but a "space deformer".**

When you compute `Y = X @ W`:
- `X` is a collection of vectors (points in input space)
- `W` is the transformation rule
- `Y` is the transformed vectors (points in output space)

### 几何直觉 | Geometric Intuition

```
2D 变换示例 | 2D Transformation Example:

原空间          变换后空间
Original       Transformed
   y              y'
   │              │
   │  ● (1,1)     │    ● (2,1)  ← (1,1) 经过 W 变换后
   │              │
───┼─── x       ──┼─── x'
   │              │

W = [[2, 0],     # x 轴拉伸2倍 | x-axis stretched by 2
     [0, 1]]     # y 轴不变   | y-axis unchanged

(1,1) @ W = (1*2+1*0, 1*0+1*1) = (2, 1)
```

### 代码案例 | Code Example

```python
import numpy as np

# 矩阵乘法 | Matrix Multiplication
X = np.array([[1, 2],      # 2个样本，每个2维 | 2 samples, 2 dims each
              [3, 4]])
W = np.array([[2, 0],      # 变换矩阵 | Transformation matrix
              [0, 1]])

Y = X @ W
print("X =")
print(X)
print("\nW =")
print(W)
print("\nY = X @ W =")
print(Y)
# [[2 2]    ← (1,2) 经变换后 | (1,2) after transformation
#  [6 4]]   ← (3,4) 经变换后 | (3,4) after transformation

# 验证维度 | Verify dimensions
print(f"\nX shape: {X.shape}")    # (2, 2)
print(f"W shape: {W.shape}")      # (2, 2)
print(f"Y shape: {Y.shape}")      # (2, 2)
```

---

## 3.2 Shape 规则：维度匹配 | Shape Rules: Dimension Matching

### 中文解释

矩阵乘法的铁律：
```
(m, k) @ (k, n) → (m, n)
       ↑
    中间维度必须相同
```

在 Attention 中的应用：
```
Q:     (seq_len, dim) @ (dim, dim) → (seq_len, dim)
K.T:   (dim, seq_len)
Q @ K.T: (seq_len, dim) @ (dim, seq_len) → (seq_len, seq_len)
```

### English Explanation

The iron law of matrix multiplication:
```
(m, k) @ (k, n) → (m, n)
       ↑
    Middle dimensions must match
```

Application in Attention:
```
Q:     (seq_len, dim) @ (dim, dim) → (seq_len, dim)
K.T:   (dim, seq_len)
Q @ K.T: (seq_len, dim) @ (dim, seq_len) → (seq_len, seq_len)
```

### Shape 速查表 | Shape Quick Reference

| 操作 | Input Shapes | Output Shape | Attention 含义 |
|------|-------------|-------------|----------------|
| `X @ W_q` | `(seq, dim) @ (dim, dim)` | `(seq, dim)` | 生成 Q |
| `X @ W_k` | `(seq, dim) @ (dim, dim)` | `(seq, dim)` | 生成 K |
| `Q @ K.T` | `(seq, dim) @ (dim, seq)` | `(seq, seq)` | 注意力分数 |
| `W @ V` | `(seq, seq) @ (seq, dim)` | `(seq, dim)` | 注意力输出 |

| Operation | Input Shapes | Output Shape | Attention Meaning |
|-----------|-------------|-------------|-------------------|
| `X @ W_q` | `(seq, dim) @ (dim, dim)` | `(seq, dim)` | Generate Q |
| `X @ W_k` | `(seq, dim) @ (dim, dim)` | `(seq, dim)` | Generate K |
| `Q @ K.T` | `(seq, dim) @ (dim, seq)` | `(seq, seq)` | Attention scores |
| `W @ V` | `(seq, seq) @ (seq, dim)` | `(seq, dim)` | Attention output |

### 代码案例：Batch 矩阵乘法 | Code Example: Batch Matrix Multiplication

```python
import numpy as np

# Batch 处理：同时处理多个序列 | Batch: process multiple sequences at once
batch_size = 4
seq_len = 128
dim = 64

# Q: (batch, seq, dim) | Q: (batch, seq, dim)
Q = np.random.randn(batch_size, seq_len, dim)
# K.T: 需要先转置 | K.T: need transpose first
K = np.random.randn(batch_size, seq_len, dim)

# 方法1：逐个 batch 计算 | Method 1: Compute per batch
scores_manual = np.zeros((batch_size, seq_len, seq_len))
for b in range(batch_size):
    scores_manual[b] = Q[b] @ K[b].T   # (seq, dim) @ (dim, seq)

print(f"scores_manual shape: {scores_manual.shape}")   # (4, 128, 128)

# 方法2：使用 einsum（更优雅）| Method 2: Use einsum (more elegant)
scores_einsum = np.einsum('bsd,btd->bst', Q, K)
print(f"scores_einsum shape: {scores_einsum.shape}")    # (4, 128, 128)

# 验证结果相同 | Verify they match
print(f"\n结果是否相同？| Results match? {np.allclose(scores_manual, scores_einsum)}")
```

---

## 3.3 转置（Transpose）的作用 | The Role of Transpose

### 中文解释

**转置 = 翻转矩阵，行列互换**

在 Attention 中，转置的关键作用：
```
Q:  (seq, dim)  — 每个 token 有一个 query 向量
K:  (seq, dim)  — 每个 token 有一个 key 向量

要计算"每个 query 与每个 key"的相似度：
→ Q 保持 (seq, dim)
→ K 转置为 (dim, seq)
→ Q @ K.T → (seq, seq) 相似度矩阵
```

### English Explanation

**Transpose = Flip matrix, swap rows and columns**

In Attention, the key role of transpose:
```
Q:  (seq, dim)  — each token has a query vector
K:  (seq, dim)  — each token has a key vector

To compute "each query with each key" similarity:
→ Q stays (seq, dim)
→ K transposes to (dim, seq)
→ Q @ K.T → (seq, seq) similarity matrix
```

### 图解 | Visualization

```
Q (seq=3, dim=4):          K.T (dim=4, seq=3):
┌─────────────────┐        ┌─────────────────┐
│ q1 q2 q3 q4     │        │ k1 k1 k1        │
│ q1 q2 q3 q4     │   @    │ k2 k2 k2        │
│ q1 q2 q3 q4     │        │ k3 k3 k3        │
└─────────────────┘        │ k4 k4 k4        │
  (3, 4)                   └─────────────────┘
                              (4, 3)

                              ↓

scores (3, 3):
┌─────────────────┐
│ s11 s12 s13     │  ← token1 对所有 token 的注意力
│ s21 s22 s23     │  ← token2 对所有 token 的注意力
│ s31 s32 s33     │  ← token3 对所有 token 的注意力
└─────────────────┘
```

### 代码案例 | Code Example

```python
import numpy as np

# 转置操作 | Transpose operations
A = np.array([[1, 2, 3],
              [4, 5, 6]])

print(f"A shape: {A.shape}")       # (2, 3)
print(f"A.T shape: {A.T.shape}")   # (3, 2)
print("A.T =")
print(A.T)
# [[1 4]
#  [2 5]
#  [3 6]]

# 高维转置 | High-dimensional transpose
# (batch, seq, dim) → (batch, dim, seq)
X = np.random.randn(2, 3, 4)
X_t = X.transpose(0, 2, 1)   # 交换第1和第2维 | Swap dims 1 and 2
print(f"\nX shape: {X.shape}")       # (2, 3, 4)
print(f"X_t shape: {X_t.shape}")     # (2, 4, 3)

# Attention 中的完整转置链 | Complete transpose chain in Attention
batch = 2
seq = 3
dim = 4

Q = np.random.randn(batch, seq, dim)
K = np.random.randn(batch, seq, dim)

# K 转置为 (batch, dim, seq)
K_T = K.transpose(0, 2, 1)
print(f"\nQ shape: {Q.shape}")        # (2, 3, 4)
print(f"K_T shape: {K_T.shape}")      # (2, 4, 3)

# Batch 矩阵乘法 | Batch matrix multiplication
scores = Q @ K_T
print(f"scores shape: {scores.shape}")  # (2, 3, 3)
```

---

## 3.4 投影：同一个输入，不同空间 | Projection: Same Input, Different Spaces

### 中文解释

Attention 的核心思想：

**同一个输入 X，用三个不同的矩阵投影到三个不同的空间：**

```
X ──W_q──→ Q  (查询空间：我在找什么？)
X ──W_k──→ K  (键空间：我有什么信息？)
X ──W_v──→ V  (值空间：我的实际内容是什么？)
```

为什么需要三个空间？
- Q 负责"提问"
- K 负责"回答匹配"
- V 负责"提供内容"

### English Explanation

The core idea of Attention:

**The same input X projected into three different spaces with three different matrices:**

```
X ──W_q──→ Q  (Query space: What am I looking for?)
X ──W_k──→ K  (Key space: What information do I have?)
X ──W_v──→ V  (Value space: What is my actual content?)
```

Why three spaces?
- Q is responsible for "asking questions"
- K is responsible for "matching answers"
- V is responsible for "providing content"

### 代码案例 | Code Example

```python
import numpy as np

# 模拟 Attention 中的 Q/K/V 投影 | Simulate Q/K/V projection in Attention
seq_len = 3
d_model = 8

# 输入 X | Input X
X = np.random.randn(seq_len, d_model)
print(f"Input X shape: {X.shape}")    # (3, 8)

# 三个投影矩阵 | Three projection matrices
W_q = np.random.randn(d_model, d_model) * 0.1
W_k = np.random.randn(d_model, d_model) * 0.1
W_v = np.random.randn(d_model, d_model) * 0.1

# 投影到三个空间 | Project into three spaces
Q = X @ W_q    # (3, 8) @ (8, 8) = (3, 8)
K = X @ W_k    # (3, 8) @ (8, 8) = (3, 8)
V = X @ W_v    # (3, 8) @ (8, 8) = (3, 8)

print(f"Q shape: {Q.shape}")   # (3, 8)
print(f"K shape: {K.shape}")   # (3, 8)
print(f"V shape: {V.shape}")   # (3, 8)

# 注意：Q/K/V 的 shape 相同，但内容完全不同！
# Note: Q/K/V have the same shape but completely different content!

# 计算注意力分数 | Compute attention scores
scores = Q @ K.T    # (3, 8) @ (8, 3) = (3, 3)
print(f"\nScores shape: {scores.shape}")   # (3, 3)
print("Scores:")
print(scores.round(3))
```

---

## 3.5 常见 Shape 错误与 Debug | Common Shape Errors and Debugging

### 中文解释

矩阵乘法最常见的错误就是 shape 不匹配。学会读错误信息是关键。

### English Explanation

The most common matrix multiplication error is shape mismatch. Learning to read error messages is crucial.

### 代码案例：常见错误 | Code Example: Common Errors

```python
import numpy as np

A = np.random.randn(3, 4)
B = np.random.randn(5, 4)

try:
    C = A @ B    # 错误！4 ≠ 5 | Error! 4 ≠ 5
except ValueError as e:
    print(f"错误信息 | Error message: {e}")
    # shapes (3,4) and (5,4) not aligned: 4 (dim 1) != 5 (dim 0)

# 正确做法：转置 B | Correct way: transpose B
C = A @ B.T    # (3, 4) @ (4, 5) = (3, 5) ✓
print(f"C shape: {C.shape}")

# Debug 技巧：打印 shape | Debug tip: print shapes
def safe_matmul(A, B, name=""):
    """安全的矩阵乘法，带 debug 信息 | Safe matmul with debug info"""
    print(f"{name}: A{A.shape} @ B{B.shape} = ?", end=" ")
    if A.shape[-1] == B.shape[0]:
        result = A @ B
        print(f"→ {result.shape} ✓")
        return result
    else:
        print(f"→ Error: {A.shape[-1]} ≠ {B.shape[0]}")
        raise ValueError(f"Shape mismatch: {A.shape} @ {B.shape}")

safe_matmul(A, B.T, "Example")
```

---

## 本章总结 | Chapter Summary

**中文：**
- 矩阵乘法 = 线性变换 = 空间变形
- Shape 规则：`(m,k) @ (k,n) → (m,n)`，中间维度必须匹配
- 转置是 Attention 的核心操作：`Q @ K.T` 生成相似度矩阵
- Q/K/V 是同一个输入投影到三个不同空间的结果
- Debug 第一步：print shape

**English:**
- Matrix multiplication = linear transformation = space deformation
- Shape rule: `(m,k) @ (k,n) → (m,n)`, middle dimensions must match
- Transpose is a core operation in Attention: `Q @ K.T` generates similarity matrix
- Q/K/V are the same input projected into three different spaces
- Debug step one: print shape

---

## 课后练习 | Homework

1. **Shape 预测**：不运行代码，预测以下运算的输出 shape：
   - `(32, 128, 64) @ (64, 64)`
   - `(32, 128, 64) @ (32, 64, 128)`
   - `(128, 64) @ (64, 128)`
2. **转置练习**：创建一个 `(2, 3, 4)` 的数组，用 `transpose` 变为 `(4, 2, 3)`
3. **投影实现**：手写一个函数，输入 X 和三个权重矩阵，返回 Q, K, V，并验证 shape
4. **思考题**：为什么 Attention 需要三个投影（Q/K/V），而不是只用两个？
