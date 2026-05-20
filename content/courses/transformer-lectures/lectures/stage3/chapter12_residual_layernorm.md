# 第12章：Residual + LayerNorm — 深层网络的稳定器 | Chapter 12: Residual + LayerNorm — Stabilizers for Deep Networks

> **阶段定位** | **Stage**: 第三阶段 — Transformer 核心
> **预计学时** | **Duration**: 4~6 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 理解为什么深层网络需要 Residual Connection
- 掌握 LayerNorm 的计算方法和作用
- 理解 Pre-Norm vs Post-Norm 的区别
- 能够解释为什么 Transformer 能堆叠几十层而不崩

**English:**
- Understand why deep networks need Residual Connections
- Master LayerNorm computation method and role
- Understand Pre-Norm vs Post-Norm differences
- Be able to explain why Transformers can stack dozens of layers without collapse

---

## 12.1 梯度消失问题 | The Vanishing Gradient Problem

### 中文解释

**问题：网络越深，梯度越难传回前面**

假设每层梯度都乘以 0.5：
- 第1层：梯度 = g
- 第10层：梯度 = g × 0.5^10 ≈ g × 0.001
- 第50层：梯度 = g × 0.5^50 ≈ 0

前面的层几乎学不到东西！

### English Explanation

**Problem: The deeper the network, the harder gradients flow back to earlier layers**

Assume each layer multiplies gradient by 0.5:
- Layer 1: gradient = g
- Layer 10: gradient = g × 0.5^10 ≈ g × 0.001
- Layer 50: gradient = g × 0.5^50 ≈ 0

Earlier layers barely learn anything!

### 可视化 | Visualization

```
无 Residual 的梯度流：| Gradient flow without Residual:

input → [Layer1] → [Layer2] → ... → [LayerN] → output
   ↑                                              |
   └──────── gradient × 0.5^N ←───────────────────┘
   
当 N=50 时，梯度几乎为 0 | When N=50, gradient is almost 0
```

---

## 12.2 Residual Connection（残差连接）| Residual Connection

### 中文解释

**Residual = "绕路" = 让信息直接穿过层**

公式：
```
output = input + sublayer(input)
```

作用：
- 梯度可以直接通过 "+" 操作回流
- 即使 `sublayer` 的梯度很小，`+` 也能让梯度保持
- 网络可以很深（100+ 层）

### English Explanation

**Residual = "Bypass" = Let information directly pass through layers**

Formula:
```
output = input + sublayer(input)
```

Role:
- Gradients can flow back directly through the "+" operation
- Even if `sublayer`'s gradient is small, "+" preserves gradient flow
- Networks can be very deep (100+ layers)

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

class ResidualBlock(nn.Module):
    """残差块 | Residual block"""
    
    def __init__(self, dim):
        super().__init__()
        self.sublayer = nn.Sequential(
            nn.Linear(dim, dim),
            nn.ReLU(),
            nn.Linear(dim, dim),
        )
    
    def forward(self, x):
        """output = x + sublayer(x)"""
        return x + self.sublayer(x)

# 测试深层网络 | Test deep network
dim = 512
depth = 50

model = nn.Sequential(*[ResidualBlock(dim) for _ in range(depth)])
x = torch.randn(1, dim, requires_grad=True)

# 前向传播 | Forward
output = model(x)

# 反向传播 | Backward
loss = output.sum()
loss.backward()

print(f"Input gradient norm: {x.grad.norm().item():.4f}")
# 如果没有残差连接，这个值会极小 | Without residual, this would be extremely small

# 对比：无残差 | Comparison: without residual
class NoResidualBlock(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.sublayer = nn.Sequential(
            nn.Linear(dim, dim),
            nn.ReLU(),
            nn.Linear(dim, dim),
        )
    
    def forward(self, x):
        return self.sublayer(x)

model_no_res = nn.Sequential(*[NoResidualBlock(dim) for _ in range(depth)])
x2 = torch.randn(1, dim, requires_grad=True)
output2 = model_no_res(x2)
loss2 = output2.sum()
loss2.backward()
print(f"Without residual gradient norm: {x2.grad.norm().item():.6f}")
# 应该极小 | Should be extremely small
```

### 梯度流的数学解释 | Mathematical Explanation of Gradient Flow

```python
import torch

# 残差连接的梯度流：| Gradient flow with residual:
# output = x + f(x)
# d(output)/dx = 1 + df/dx

# 关键：即使 df/dx ≈ 0，d(output)/dx ≈ 1
# Key: Even if df/dx ≈ 0, d(output)/dx ≈ 1

x = torch.tensor(2.0, requires_grad=True)
f = x * 0.001   # 很小的变换 | Small transformation
output = x + f
output.backward()

print(f"df/dx = {0.001}")
print(f"d(output)/dx = {x.grad.item()}")   # ≈ 1.001 — 梯度保留！| Gradient preserved!
```

---

## 12.3 Layer Normalization | Layer Normalization

### 中文解释

**LayerNorm = 对每个样本的特征维度做归一化**

公式：
```
LayerNorm(x) = γ × (x - μ) / (σ + ε) + β

其中：| where:
μ = mean(x, dim=-1)   # 沿特征维度求均值
σ = std(x, dim=-1)    # 沿特征维度求标准差
γ, β = 可学习参数 | learnable parameters
```

作用：
- 稳定每层的数值分布
- 防止数值过大或过小
- 加速训练收敛

### English Explanation

**LayerNorm = Normalize across feature dimensions for each sample**

Formula:
```
LayerNorm(x) = γ × (x - μ) / (σ + ε) + β

where:
μ = mean(x, dim=-1)
σ = std(x, dim=-1)
γ, β = learnable parameters
```

Role:
- Stabilize numerical distribution at each layer
- Prevent values from becoming too large or too small
- Accelerate training convergence

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

# PyTorch 内置 LayerNorm | PyTorch built-in LayerNorm
layernorm = nn.LayerNorm(normalized_shape=512)

x = torch.randn(2, 10, 512)   # (batch, seq, dim)
output = layernorm(x)

print(f"Input mean/std: {x.mean(dim=-1)[0, 0]:.3f}, {x.std(dim=-1)[0, 0]:.3f}")
print(f"Output mean/std: {output.mean(dim=-1)[0, 0]:.6f}, {output.std(dim=-1)[0, 0]:.3f}")
# 输出均值 ≈ 0，标准差 ≈ 1 | Output mean ≈ 0, std ≈ 1

# 手写 LayerNorm | Manual LayerNorm
def manual_layernorm(x, eps=1e-6):
    """手写 LayerNorm | Manual LayerNorm implementation"""
    mean = x.mean(dim=-1, keepdim=True)
    var = x.var(dim=-1, unbiased=False, keepdim=True)
    x_norm = (x - mean) / torch.sqrt(var + eps)
    return x_norm

output_manual = manual_layernorm(x)
print(f"\nManual LayerNorm std: {output_manual.std(dim=-1)[0, 0]:.3f}")
```

### LayerNorm vs BatchNorm | LayerNorm vs BatchNorm

| 特性 | LayerNorm | BatchNorm |
|------|-----------|-----------|
| 归一化维度 | 特征维度 | Batch 维度 |
| 序列数据 | 适合 | 不适合 |
| batch_size=1 | 可以 | 不行 |
| 推理 | 无需统计 | 需要 running mean/var |

| Feature | LayerNorm | BatchNorm |
|---------|-----------|-----------|
| Normalize dim | Feature dim | Batch dim |
| Sequence data | Suitable | Not suitable |
| batch_size=1 | Works | Doesn't work |
| Inference | No stats needed | Needs running mean/var |

**Transformer 用 LayerNorm，不用 BatchNorm！**

---

## 12.4 Pre-Norm vs Post-Norm | Pre-Norm vs Post-Norm

### 中文解释

**两种残差连接的位置：**

```
Post-Norm（原始 Transformer）：
  output = LayerNorm(x + Attention(x))
  
Pre-Norm（现代 Transformer）：
  output = x + Attention(LayerNorm(x))
```

**Post-Norm 的问题：**
- 深层时梯度仍然可能消失
- 训练不稳定

**Pre-Norm 的优势：**
- 梯度更稳定
- 可以训练更深的网络
- 现代模型（GPT, LLaMA）都用 Pre-Norm

### English Explanation

**Two positions for residual connections:**

```
Post-Norm (original Transformer):
  output = LayerNorm(x + Attention(x))
  
Pre-Norm (modern Transformer):
  output = x + Attention(LayerNorm(x))
```

**Post-Norm problems:**
- Gradients may still vanish in deep layers
- Training is unstable

**Pre-Norm advantages:**
- More stable gradients
- Can train deeper networks
- Modern models (GPT, LLaMA) all use Pre-Norm

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

class PostNormBlock(nn.Module):
    """Post-Norm 块（原始 Transformer）| Post-Norm block (original Transformer)"""
    
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.attn = nn.MultiheadAttention(d_model, num_heads, batch_first=True)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_model * 4),
            nn.GELU(),
            nn.Linear(d_model * 4, d_model),
        )
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
    
    def forward(self, x):
        # Post-Norm
        x = self.norm1(x + self.attn(x, x, x)[0])   # 先加再归一化 | Add then normalize
        x = self.norm2(x + self.ffn(x))
        return x

class PreNormBlock(nn.Module):
    """Pre-Norm 块（现代 Transformer）| Pre-Norm block (modern Transformer)"""
    
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.attn = nn.MultiheadAttention(d_model, num_heads, batch_first=True)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_model * 4),
            nn.GELU(),
            nn.Linear(d_model * 4, d_model),
        )
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
    
    def forward(self, x):
        # Pre-Norm
        x = x + self.attn(self.norm1(x), self.norm1(x), self.norm1(x))[0]   # 先归一化再加 | Normalize then add
        x = x + self.ffn(self.norm2(x))
        return x

# 测试深层网络稳定性 | Test deep network stability
d_model = 512
num_heads = 8
depth = 32

# Pre-Norm 模型 | Pre-Norm model
model = nn.Sequential(*[PreNormBlock(d_model, num_heads) for _ in range(depth)])
x = torch.randn(2, 10, d_model, requires_grad=True)

output = model(x)
loss = output.sum()
loss.backward()

print(f"Pre-Norm, depth={depth}: input grad norm = {x.grad.norm().item():.4f}")
# 应该仍然有合理的梯度值 | Should still have reasonable gradient
```

---

## 12.5 RMSNorm — LayerNorm 的简化版 | RMSNorm — Simplified LayerNorm

### 中文解释

**RMSNorm = 去掉 mean 的 LayerNorm**

公式：
```
RMSNorm(x) = x / RMS(x) × γ
RMS(x) = sqrt(mean(x²))
```

优势：
- 计算更简单（少一次 mean 计算）
- 效果与 LayerNorm 相当
- LLaMA 使用 RMSNorm

### English Explanation

**RMSNorm = LayerNorm without mean subtraction**

Formula:
```
RMSNorm(x) = x / RMS(x) × γ
RMS(x) = sqrt(mean(x²))
```

Advantages:
- Simpler computation (one less mean calculation)
- Performance comparable to LayerNorm
- Used by LLaMA

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

class RMSNorm(nn.Module):
    """RMSNorm 实现 | RMSNorm implementation"""
    
    def __init__(self, dim, eps=1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))
    
    def forward(self, x):
        """
        x: (..., dim)
        """
        # RMS = sqrt(mean(x²)) | RMS = sqrt(mean(x²))
        rms = torch.sqrt(torch.mean(x ** 2, dim=-1, keepdim=True) + self.eps)
        x_norm = x / rms
        return x_norm * self.weight

# 对比 | Comparison
x = torch.randn(2, 10, 512)

layernorm = nn.LayerNorm(512)
rmsnorm = RMSNorm(512)

out_ln = layernorm(x)
out_rms = rmsnorm(x)

print(f"LayerNorm output std: {out_ln.std(dim=-1).mean():.4f}")
print(f"RMSNorm output RMS: {torch.sqrt((out_rms**2).mean(dim=-1)).mean():.4f}")
```

---

## 本章总结 | Chapter Summary

**中文：**
- 残差连接 = 信息高速公路，让梯度可以直达深层
- LayerNorm = 每层稳定器，保持数值分布稳定
- Pre-Norm 比 Post-Norm 更稳定，是现代标准
- RMSNorm 是 LayerNorm 的高效替代
- 没有这两样，Transformer 不可能做到 100+ 层

**English:**
- Residual connection = Information highway, lets gradients reach deep layers
- LayerNorm = Layer stabilizer, keeps numerical distribution stable
- Pre-Norm is more stable than Post-Norm, modern standard
- RMSNorm is an efficient alternative to LayerNorm
- Without these two, Transformers couldn't achieve 100+ layers

---

## 课后练习 | Homework

1. **残差对比**：实现有/无残差的 50 层网络，比较输入梯度范数
2. **LayerNorm 手写**：不用 PyTorch 内置，手写 LayerNorm
3. **Pre/Post Norm 对比**：训练两个相同深度的模型，观察 loss 曲线差异
4. **RMSNorm 实现**：实现 RMSNorm，与 LayerNorm 对比输出统计量
5. **思考题**：为什么 BatchNorm 不适合 Transformer？从 shape 和序列特性两个角度分析
