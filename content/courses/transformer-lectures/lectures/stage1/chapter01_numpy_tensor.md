# 第1章：NumPy Tensor 基础 | Chapter 1: NumPy Tensor Fundamentals

> **阶段定位** | **Stage**: 第一阶段 — Tensor 与 Attention 基础
> **预计学时** | **Duration**: 6~8 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 建立对 Tensor（多维数组）的空间直觉
- 熟练掌握 Tensor 的形状变换操作
- 理解广播机制（Broadcasting）的运算规则
- 看到 `(32, 128, 768)` 能立刻反应出：batch × sequence × hidden_dim

**English:**
- Develop spatial intuition for Tensors (multi-dimensional arrays)
- Master Tensor shape transformation operations
- Understand the broadcasting mechanism and its arithmetic rules
- Instantly recognize `(32, 128, 768)` as: batch × sequence × hidden_dim

---

## 1.1 什么是 Tensor？| What is a Tensor?

### 中文解释

**Tensor = 多维数组**，是 AI 计算的基石。

| 维度 | 名称 | 示例 | 直观理解 |
|------|------|------|----------|
| 0维 | 标量 scalar | `42` | 一个数字 |
| 1维 | 向量 vector | `[1, 2, 3]` | 一行数字 |
| 2维 | 矩阵 matrix | `[[1,2],[3,4]]` | 一张表格 |
| 3维 | 张量 tensor | 图片批 `(B, H, W)` | 一叠表格 |
| 4维 | 张量 tensor | 多头注意力 `(B, H, S, D)` | 多叠表格 |

在 Transformer 中，最常见的 Tensor 是 **3维**：`(batch_size, sequence_length, hidden_dimension)`

### English Explanation

**Tensor = Multi-dimensional array**, the foundation of AI computation.

| Dimensions | Name | Example | Intuition |
|------------|------|---------|-----------|
| 0-D | Scalar | `42` | A single number |
| 1-D | Vector | `[1, 2, 3]` | A row of numbers |
| 2-D | Matrix | `[[1,2],[3,4]]` | A table/spreadsheet |
| 3-D | Tensor | Image batch `(B, H, W)` | A stack of tables |
| 4-D | Tensor | Multi-head attention `(B, H, S, D)` | Multiple stacks of tables |

In Transformers, the most common Tensor is **3D**: `(batch_size, sequence_length, hidden_dimension)`

---

## 1.2 核心 API：ndarray 基础 | Core API: ndarray Basics

### 代码案例 | Code Example

```python
import numpy as np

# 创建 Tensor | Create a Tensor
x = np.array([[1, 2, 3], [4, 5, 6]])

# 查看形状 | Check shape
print(x.shape)       # (2, 3) — 2行3列 | 2 rows, 3 columns

# 查看数据类型 | Check data type
print(x.dtype)       # int64

# 查看维度数 | Check number of dimensions
print(x.ndim)        # 2

# 查看元素总数 | Check total elements
print(x.size)        # 6

# 创建特殊 Tensor | Create special Tensors
zeros = np.zeros((3, 4))          # 全零 | All zeros
ones = np.ones((2, 3))            # 全一 | All ones
random = np.random.randn(2, 3)    # 标准正态分布 | Standard normal
arange = np.arange(0, 10, 2)      # [0, 2, 4, 6, 8]
```

### 详细解释 | Detailed Explanation

**中文：**
- `shape` 告诉你 Tensor 的"长宽高"。在 AI 中，shape 是 debug 的第一要素。
- `dtype` 决定计算精度。模型训练常用 `float32`，推理可能用 `float16` 加速。
- `ndim` 告诉你这是几维数组，直接决定你能用哪些操作。

**English:**
- `shape` tells you the "dimensions" of the Tensor. In AI, shape is the first thing to check when debugging.
- `dtype` determines computational precision. Training typically uses `float32`, inference may use `float16` for speed.
- `ndim` tells you the dimensionality, which directly determines what operations are available.

---

## 1.3 Tensor 变形（极重要）| Tensor Reshaping (Critical)

### 代码案例 | Code Example

```python
import numpy as np

x = np.arange(24)          # [0, 1, 2, ..., 23]
print(x.shape)             # (24,)

# reshape: 改变形状，不改变数据 | Reshape: change shape without changing data
x2 = x.reshape(4, 6)
print(x2.shape)            # (4, 6)

# reshape 到 3D | Reshape to 3D
x3 = x.reshape(2, 3, 4)
print(x3.shape)            # (2, 3, 4)
# 理解：2个 (3×4) 的矩阵 | Interpretation: 2 matrices of (3×4)

# transpose: 交换维度 | Transpose: swap dimensions
x_t = x3.transpose(1, 0, 2)
print(x_t.shape)           # (3, 2, 4)
# 原 (batch, seq, dim) → (seq, batch, dim)

# squeeze: 去掉长度为1的维度 | Squeeze: remove dimensions of size 1
y = np.array([[[1, 2, 3]]])   # shape: (1, 1, 3)
y_s = y.squeeze()
print(y_s.shape)           # (3,)

# unsqueeze: 增加维度 | Unsqueeze: add a dimension
z = np.array([1, 2, 3])    # shape: (3,)
z_u = z[np.newaxis, :]     # shape: (1, 3)
# 等价于 unsqueeze(0)

# flatten: 拍平为一维 | Flatten: collapse to 1D
x_flat = x3.flatten()
print(x_flat.shape)        # (24,)
```

### 详细解释 | Detailed Explanation

**中文：**

| 操作 | 作用 | AI 场景 |
|------|------|---------|
| `reshape` | 重排元素形状 | 改变 batch 组织方式 |
| `transpose` | 交换维度顺序 | Attention 中 QK^T 的维度交换 |
| `squeeze` | 删除大小为1的维度 | 去掉不必要的 batch 维度 |
| `unsqueeze` | 插入大小为1的维度 | 广播前对齐维度 |
| `flatten` | 展平为一维 | 全连接层前处理 |

**关键原则：reshape 只改变"视图"，不改变底层数据顺序。**

**English:**

| Operation | Function | AI Scenario |
|-----------|----------|-------------|
| `reshape` | Rearrange element shape | Change batch organization |
| `transpose` | Swap dimension order | Dimension swapping in QK^T for Attention |
| `squeeze` | Remove size-1 dimensions | Remove unnecessary batch dims |
| `unsqueeze` | Insert size-1 dimensions | Align dimensions before broadcasting |
| `flatten` | Collapse to 1D | Preprocessing before fully-connected layers |

**Key principle: reshape only changes the "view", not the underlying data order.**

---

## 1.4 广播机制（Broadcasting）| Broadcasting Mechanism

### 中文解释

**广播 = 自动扩展小 Tensor 去匹配大 Tensor 的形状**

规则：
1. 从最后一维开始比较
2. 如果维度相等，或其中一个为 1，则可以广播
3. 否则报错

### English Explanation

**Broadcasting = Automatically expand smaller Tensors to match larger Tensor shapes**

Rules:
1. Compare dimensions starting from the last one
2. If dimensions are equal OR one of them is 1, broadcasting is possible
3. Otherwise, error

### 代码案例 | Code Example

```python
import numpy as np

# 案例 1：标量广播 | Case 1: Scalar broadcasting
a = np.array([[1, 2, 3], [4, 5, 6]])  # shape: (2, 3)
result = a + 10                         # 10 被广播为 (2, 3)
print(result)
# [[11 12 13]
#  [14 15 16]]

# 案例 2：向量广播到矩阵 | Case 2: Vector to matrix broadcasting
b = np.array([10, 20, 30])             # shape: (3,)
result = a + b                          # b 被广播为 (2, 3)
print(result)
# [[11 22 33]
#  [14 25 36]]

# 案例 3：Transformer 中的典型广播 | Case 3: Typical broadcasting in Transformer
scores = np.random.randn(32, 8, 128, 128)   # (batch, heads, seq, seq)
mask = np.array([1, 0, 1])                   # (3,) — 实际应为 (1, 1, 1, 128)
# 在注意力中，mask 被广播到与 scores 对齐

# 案例 4：维度不匹配会报错 | Case 4: Dimension mismatch causes error
c = np.array([10, 20])                 # shape: (2,)
# a + c  # 报错！最后一维 3 ≠ 2 | Error! Last dim 3 ≠ 2
```

### AI 场景图解 | AI Scenario Visualization

```
Transformer 注意力中的广播示例：
Broadcasting example in Transformer Attention:

  Q: (32, 8, 128, 64)     # (batch, heads, seq, dim)
  K: (32, 8, 128, 64)
  
  Q @ K.T: (32, 8, 128, 128)
  
  mask: (1, 1, 128, 128)  # 通过广播扩展到 | Broadcasted to -> (32, 8, 128, 128)
  
  scores + mask: 合法广播 | Valid broadcasting
```

---

## 1.5 数学运算 | Mathematical Operations

### 代码案例 | Code Example

```python
import numpy as np

A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

# 矩阵乘法 | Matrix multiplication
# A @ B 或 np.matmul(A, B)
C = A @ B
print("A @ B =")
print(C)
# [[19 22]
#  [43 50]]

# 点积（向量）| Dot product (vectors)
v1 = np.array([1, 2, 3])
v2 = np.array([4, 5, 6])
dot = np.dot(v1, v2)        # 1*4 + 2*5 + 3*6 = 32

# 逐元素乘法 | Element-wise multiplication
D = A * B
print("A * B (element-wise) =")
print(D)
# [[ 5 12]
#  [21 32]]

# 求和、均值、最大 | Sum, mean, max
print(A.sum())          # 10
print(A.mean())         # 2.5
print(A.max())          # 4

# 按轴操作 | Operations along axis
print(A.sum(axis=0))    # [4, 6] — 按列求和 | Sum along columns
print(A.sum(axis=1))    # [3, 7] — 按行求和 | Sum along rows

# 在 Transformer 中：| In Transformer:
# softmax 按最后一个维度计算 | Softmax computed along last dimension
scores = np.array([[1.0, 2.0, 3.0]])
exp_scores = np.exp(scores)
softmax = exp_scores / exp_scores.sum(axis=-1, keepdims=True)
print("Softmax:", softmax)   # [[0.09, 0.24, 0.67]]
```

### 关键概念对比 | Key Concept Comparison

**中文：**

| 运算 | 符号 | 维度规则 | Transformer 用途 |
|------|------|----------|-----------------|
| 矩阵乘法 | `@` / `matmul` | `(m,k) @ (k,n) → (m,n)` | QK^T, 注意力输出 |
| 逐元素乘 | `*` | 相同 shape 或广播 | Dropout, 掩码 |
| 点积 | `dot` | 向量 → 标量 | 相似度计算 |
| 求和 | `sum` | 可指定 axis | Loss 计算 |

**English:**

| Operation | Symbol | Dimension Rule | Transformer Usage |
|-----------|--------|---------------|-------------------|
| Matrix multiplication | `@` / `matmul` | `(m,k) @ (k,n) → (m,n)` | QK^T, attention output |
| Element-wise multiply | `*` | Same shape or broadcast | Dropout, masking |
| Dot product | `dot` | Vector → Scalar | Similarity computation |
| Sum | `sum` | Can specify axis | Loss calculation |

---

## 1.6 Tensor 空间直觉训练 | Tensor Spatial Intuition Training

### 练习 | Exercise

看到以下 shape，立刻说出含义：

| Shape | 含义 | Meaning |
|-------|------|---------|
| `(32, 128, 768)` | batch=32, seq=128, hidden=768 | batch=32, seq=128, hidden=768 |
| `(32, 8, 128, 64)` | batch=32, heads=8, seq=128, dim=64 | batch=32, heads=8, seq=128, dim=64 |
| `(128, 768)` | seq=128, hidden=768（单条样本）| seq=128, hidden=768 (single sample) |
| `(1, 128)` | batch=1, seq=128 | batch=1, seq=128 |
| `(50257, 768)` | vocab=50257, embedding=768 | vocab=50257, embedding=768 |

### 实战：模拟 Transformer 输入 | Hands-on: Simulate Transformer Input

```python
import numpy as np

# 模拟一个 batch 的输入 | Simulate a batch input
batch_size = 32
seq_length = 128
hidden_dim = 768

# 输入 Tensor | Input Tensor
X = np.random.randn(batch_size, seq_length, hidden_dim)
print(f"Input X shape: {X.shape}")    # (32, 128, 768)

# 权重矩阵 | Weight matrix
W_q = np.random.randn(hidden_dim, hidden_dim)
print(f"W_q shape: {W_q.shape}")      # (768, 768)

# 线性变换：X @ W_q | Linear transformation
# 注意：需要 reshape 或只取最后两维 | Note: need to handle last two dims
# 实际在 PyTorch 中更简单 | In PyTorch this is simpler
```

---

## 本章总结 | Chapter Summary

**中文：**
- Tensor 是 AI 的"乐高积木"，shape 是理解和调试的第一要素
- reshape/transpose 不改变数据，只改变视图
- 广播机制让不同 shape 的 Tensor 能自动对齐运算
- 建立空间直觉：看到 shape 就想象出数据的组织结构

**English:**
- Tensors are the "LEGO bricks" of AI; shape is the first thing to understand and debug
- reshape/transpose don't change data, only the view
- Broadcasting allows Tensors of different shapes to align automatically for operations
- Build spatial intuition: imagine the data structure just by looking at the shape

---

## 课后练习 | Homework

1. **形状变换练习**：创建一个 `(24,)` 的数组，依次 reshape 为 `(2,3,4)`、`(4,2,3)`、`(6,4)`，观察数据排列规律
2. **广播练习**：用 `(3,1)` 和 `(1,3)` 的数组做加法，预测并验证结果 shape
3. **注意力预热**：用 NumPy 实现两个向量的点积，理解 `Q·K` 的本质
