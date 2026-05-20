# 第4章：Softmax — 概率的艺术 | Chapter 4: Softmax — The Art of Probability

> **阶段定位** | **Stage**: 第一阶段 — Tensor 与 Attention 基础
> **预计学时** | **Duration**: 4~6 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 真正理解 Softmax：为什么它能把任意数字变成概率分布
- 掌握数值稳定性技巧：避免指数爆炸
- 理解 Softmax 在 Attention 中的角色：注意力概率分配
- 能够手写一个稳定的 Softmax 函数

**English:**
- Truly understand Softmax: how it turns arbitrary numbers into probability distributions
- Master numerical stability techniques: avoiding exponential explosion
- Understand Softmax's role in Attention: attention probability allocation
- Be able to write a numerically stable Softmax function

---

## 4.1 Softmax 是什么？| What is Softmax?

### 中文解释

**Softmax = "软化"的最大值函数 = 将一组数变成概率分布**

输入：任意实数（正、负、零）
输出：概率分布（所有值在 0~1 之间，总和为 1）

公式：
```
softmax(x_i) = exp(x_i) / Σ_j exp(x_j)
```

### English Explanation

**Softmax = "Softened" max function = Turns a set of numbers into a probability distribution**

Input: Any real numbers (positive, negative, zero)
Output: Probability distribution (all values between 0~1, sum to 1)

Formula:
```
softmax(x_i) = exp(x_i) / Σ_j exp(x_j)
```

### 为什么叫 "Soft" max？| Why "Soft" max?

```
Hard max:  [1, 2, 3] → [0, 0, 1]   # 只保留最大值，其他变0
Softmax:   [1, 2, 3] → [0.09, 0.24, 0.67]  # 保留相对大小，但归一化

Softmax 保留了"哪个最大"的信息，同时也保留了"大多少"的信息。
Hard max loses gradient information; softmax preserves it.
```

---

## 4.2 Softmax 计算过程 | Softmax Computation Process

### 代码案例：手动实现 Softmax | Code Example: Manual Softmax Implementation

```python
import numpy as np

def softmax_naive(x):
    """朴素的 Softmax 实现（有数值问题）| Naive Softmax (has numerical issues)"""
    exp_x = np.exp(x)           # e^x
    return exp_x / np.sum(exp_x)

def softmax_stable(x):
    """数值稳定的 Softmax（实际使用）| Numerically stable Softmax (used in practice)"""
    x_max = np.max(x)           # 减去最大值 | Subtract max
    exp_x = np.exp(x - x_max)   # 最大指数变为 e^0 = 1 | Max exponent becomes e^0 = 1
    return exp_x / np.sum(exp_x)

# 测试 | Test
scores = np.array([1.0, 2.0, 3.0])

print("输入分数 | Input scores:", scores)
print("朴素 Softmax | Naive:", softmax_naive(scores).round(4))
print("稳定 Softmax | Stable:", softmax_stable(scores).round(4))
# [0.0900 0.2447 0.6652]

# 验证总和为1 | Verify sum is 1
result = softmax_stable(scores)
print(f"总和 | Sum: {result.sum():.6f}")   # 1.0
```

### 数值稳定性问题 | Numerical Stability Problem

```python
import numpy as np

# 问题案例：大数导致指数溢出 | Problem: large numbers cause overflow
big_scores = np.array([1000.0, 1001.0, 1002.0])

try:
    result_naive = softmax_naive(big_scores)
    print("朴素结果:", result_naive)
except Exception as e:
    print(f"朴素实现溢出！| Naive overflow: {e}")

# 稳定实现正常输出 | Stable version works fine
result_stable = softmax_stable(big_scores)
print("稳定结果 | Stable result:", result_stable.round(6))
# [0.0900 0.2447 0.6652] — 与 [1,2,3] 的相对关系相同！
# Same relative relationships as [1,2,3]!
```

### 为什么减去最大值有效？| Why Subtracting Max Works?

```
数学证明：| Mathematical proof:

softmax(x_i) = exp(x_i) / Σ exp(x_j)
             = exp(x_i - C) * exp(C) / (Σ exp(x_j - C) * exp(C))
             = exp(x_i - C) / Σ exp(x_j - C)

取 C = max(x)，则所有指数 ≤ 0，不会发生溢出。
Taking C = max(x), all exponents ≤ 0, no overflow occurs.
```

---

## 4.3 Softmax 的"极端化"现象 | Softmax "Extremization" Phenomenon

### 中文解释

**当输入数值差异很大时，Softmax 会趋近于 one-hot 向量。**

```
softmax([1000, 1, 1]) ≈ [1, 0, 0]
```

这意味着：
- 分数最高的那个几乎独占所有注意力
- 其他 token 几乎被忽略

### English Explanation

**When input values differ greatly, Softmax approaches a one-hot vector.**

```
softmax([1000, 1, 1]) ≈ [1, 0, 0]
```

This means:
- The highest-scoring element gets almost all the attention
- Other tokens are effectively ignored

### 代码案例 | Code Example

```python
import numpy as np

def softmax_stable(x):
    x_max = np.max(x)
    exp_x = np.exp(x - x_max)
    return exp_x / np.sum(exp_x)

# 观察不同差异程度的结果 | Observe results with different scales
cases = [
    ("均匀 | Uniform", [1.0, 1.0, 1.0]),
    ("轻微差异 | Slight diff", [1.0, 2.0, 3.0]),
    ("中等差异 | Moderate diff", [1.0, 5.0, 10.0]),
    ("巨大差异 | Huge diff", [1.0, 50.0, 100.0]),
    ("极端差异 | Extreme diff", [1.0, 500.0, 1000.0]),
]

for name, scores in cases:
    result = softmax_stable(np.array(scores))
    print(f"\n{name}:")
    print(f"  输入 | Input: {scores}")
    print(f"  Softmax: {result.round(6)}")
    print(f"  最大值占比 | Max proportion: {result.max():.6f}")
```

### 输出示例 | Output Example

```
均匀 | Uniform:
  输入 | Input: [1.0, 1.0, 1.0]
  Softmax: [0.333333 0.333333 0.333333]

中等差异 | Moderate diff:
  输入 | Input: [1.0, 5.0, 10.0]
  Softmax: [0.000123 0.006693 0.993184]

极端差异 | Extreme diff:
  输入 | Input: [1.0, 500.0, 1000.0]
  Softmax: [0.000000 0.000000 1.000000]  ← 几乎 one-hot
```

---

## 4.4 温度参数（Temperature）| Temperature Parameter

### 中文解释

**Temperature = 控制 Softmax "尖锐程度"的超参数**

公式：
```
softmax(x_i / T) = exp(x_i / T) / Σ exp(x_j / T)
```

- T → 0：更尖锐，趋近于 one-hot（确定性）
- T = 1：标准 Softmax
- T → ∞：更平滑，趋近于均匀分布（随机性）

### English Explanation

**Temperature = A hyperparameter controlling Softmax "sharpness"**

Formula:
```
softmax(x_i / T) = exp(x_i / T) / Σ exp(x_j / T)
```

- T → 0: Sharper, approaches one-hot (deterministic)
- T = 1: Standard softmax
- T → ∞: Smoother, approaches uniform distribution (random)

### 代码案例 | Code Example

```python
import numpy as np

def softmax_with_temperature(x, temperature):
    """带温度的 Softmax | Softmax with temperature"""
    return softmax_stable(x / temperature)

scores = np.array([1.0, 2.0, 3.0])

temperatures = [0.1, 0.5, 1.0, 2.0, 5.0, 10.0]

print("温度对 Softmax 的影响 | Effect of temperature on softmax:")
for T in temperatures:
    result = softmax_with_temperature(scores, T)
    print(f"T={T:4.1f}: {result.round(4)}")

# 输出趋势：| Output trend:
# T=0.1: [0.0000 0.0000 1.0000]  <- 最尖锐 | Sharpest
# T=1.0: [0.0900 0.2447 0.6652]  <- 标准  | Standard
# T=10.0: [0.3006 0.3322 0.3672] <- 接近均匀 | Near uniform
```

### AI 中的应用 | Applications in AI

| 场景 | Temperature | 效果 |
|------|-------------|------|
| 翻译/摘要 | T=1.0 | 标准输出 |
| 创意写作 | T=1.2~1.5 | 更多样化 |
| 代码生成 | T=0.2~0.5 | 更确定性 |
| 蒸馏/对齐 | T>1.0 | 软化分布 |

| Scenario | Temperature | Effect |
|----------|-------------|--------|
| Translation/Summary | T=1.0 | Standard output |
| Creative writing | T=1.2~1.5 | More diverse |
| Code generation | T=0.2~0.5 | More deterministic |
| Distillation/Alignment | T>1.0 | Soften distribution |

---

## 4.5 Softmax 在 Attention 中的角色 | Softmax's Role in Attention

### 中文解释

Attention 公式：
```
Attention(Q, K, V) = softmax(QK^T / √d) @ V
```

Softmax 的作用：
1. 将相似度分数（任意实数）→ 注意力权重（概率分布）
2. 保证所有 token 的注意力权重之和为 1
3. 通过除以 √d 控制分数尺度，防止极端化

### English Explanation

Attention formula:
```
Attention(Q, K, V) = softmax(QK^T / √d) @ V
```

Softmax's roles:
1. Transform similarity scores (any real numbers) → attention weights (probability distribution)
2. Ensure attention weights for all tokens sum to 1
3. Division by √d controls score scale, preventing extremization

### 为什么除以 √d？| Why Divide by √d?

```
问题：当 d 很大时，QK^T 的数值也会很大。
Problem: When d is large, QK^T values also become large.

原因：点积的方差随维度增加。
Reason: Variance of dot product increases with dimension.

E[(q·k)^2] = d × (方差 | variance)

当 d=64 时，方差是 d=1 时的 64 倍，Softmax 更容易极端化。
When d=64, variance is 64× that of d=1, softmax becomes more extreme.

解决：除以 √d，将方差缩放回约 1。
Solution: Divide by √d to scale variance back to ~1.
```

### 代码案例：完整 Attention Softmax | Code Example: Complete Attention Softmax

```python
import numpy as np

def softmax_stable(x):
    x_max = np.max(x, axis=-1, keepdims=True)
    exp_x = np.exp(x - x_max)
    return exp_x / np.sum(exp_x, axis=-1, keepdims=True)

def attention_with_softmax(Q, K, V):
    """完整的单头注意力（含 Softmax）| Complete single-head attention (with Softmax)"""
    d_k = Q.shape[-1]
    
    # 1. 计算分数 | Compute scores
    scores = Q @ K.T    # (seq, seq)
    print(f"Scores (raw):\n{scores.round(3)}")
    
    # 2. 缩放 | Scale
    scores = scores / np.sqrt(d_k)
    print(f"\nScores (scaled by √{d_k}):\n{scores.round(3)}")
    
    # 3. Softmax → 注意力权重 | Softmax → attention weights
    weights = softmax_stable(scores)
    print(f"\nAttention weights:\n{weights.round(4)}")
    print(f"每行和 | Row sums: {weights.sum(axis=-1).round(6)}")  # 应全为 1
    
    # 4. 加权求和 | Weighted sum
    output = weights @ V   # (seq, seq) @ (seq, dim) = (seq, dim)
    
    return output, weights

# 测试 | Test
seq_len = 3
dim = 4

Q = np.random.randn(seq_len, dim)
K = np.random.randn(seq_len, dim)
V = np.random.randn(seq_len, dim)

output, weights = attention_with_softmax(Q, K, V)
print(f"\nOutput shape: {output.shape}")
```

---

## 4.6 多种 Softmax 变体 | Softmax Variants

### 代码案例 | Code Example

```python
import numpy as np

def softmax_standard(x):
    """标准 Softmax | Standard softmax"""
    exp_x = np.exp(x - np.max(x))
    return exp_x / np.sum(exp_x)

def log_softmax(x):
    """Log Softmax：数值更稳定，常用于 loss 计算 | Numerically stable, often used in loss"""
    x_max = np.max(x)
    log_sum_exp = x_max + np.log(np.sum(np.exp(x - x_max)))
    return x - log_sum_exp

def sparsemax(x):
    """Sparsemax：输出稀疏概率分布 | Sparse probability distribution"""
    # 简化的 Sparsemax 概念 | Simplified sparsemax concept
    z_sorted = np.sort(x)[::-1]
    k = np.arange(1, len(x) + 1)
    cumsum = np.cumsum(z_sorted) - 1
    condition = z_sorted - cumsum / k > 0
    tau = cumsum[condition][-1] / k[condition][-1]
    return np.maximum(x - tau, 0)

# 对比 | Comparison
scores = np.array([1.0, 2.0, 3.0])

print("标准 Softmax | Standard:", softmax_standard(scores).round(4))
print("Log Softmax 值 | Log Softmax:", log_softmax(scores).round(4))
# Log Softmax 是 log(p)，所以值为负数 | Log Softmax is log(p), so values are negative
print("Sparsemax:", sparsemax(scores).round(4))
# Sparsemax 可能输出精确的0 | Sparsemax may output exact zeros
```

---

## 本章总结 | Chapter Summary

**中文：**
- Softmax = 归一化指数函数 = 任意数 → 概率分布
- 数值稳定性：减去最大值后再算指数
- Temperature 控制分布的"尖锐/平滑"程度
- 在 Attention 中，Softmax 将相似度分数转化为注意力权重
- 除以 √d 是为了防止维度太高时分数过于极端

**English:**
- Softmax = Normalized exponential function = arbitrary numbers → probability distribution
- Numerical stability: subtract max before computing exponential
- Temperature controls distribution "sharpness/smoothness"
- In Attention, Softmax transforms similarity scores into attention weights
- Division by √d prevents scores from becoming too extreme with high dimensions

---

## 课后练习 | Homework

1. **手写 Softmax**：不调用任何库函数，用 NumPy 实现 `softmax_stable`，并验证数值稳定性
2. **温度实验**：用 `[1.0, 2.0, 3.0, 4.0, 5.0]` 测试 T=0.01, 0.1, 1.0, 10.0, 100.0 的结果
3. **维度实验**：生成一个 d=64 的随机 Q 和 K，比较 `Q@K.T` 和 `Q@K.T/√64` 的数值范围
4. **思考题**：如果不用 Softmax，直接用 `scores / sum(scores)` 做归一化，有什么问题？（提示：负数）
