# 第13章：FFN — Feed Forward Network | Chapter 13: FFN — Feed Forward Network

> **阶段定位** | **Stage**: 第三阶段 — Transformer 核心
> **预计学时** | **Duration**: 3~5 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 理解为什么 Attention 之后还需要 FFN
- 掌握 FFN 的结构和计算过程
- 理解隐藏层扩展（hidden expansion）的意义
- 了解 FFN 的变体：GLU、SwiGLU 等

**English:**
- Understand why FFN is still needed after Attention
- Master the structure and computation of FFN
- Understand the meaning of hidden expansion
- Learn about FFN variants: GLU, SwiGLU, etc.

---

## 13.1 为什么 Attention 后还要 FFN？| Why FFN After Attention?

### 中文解释

**Attention 和 FFN 的分工：**

| 模块 | 作用 | 类比 |
|------|------|------|
| Attention | 信息路由（找谁相关）| 搜索引擎 |
| FFN | 信息变换（非线性处理）| 处理器 |

Attention 是**线性**的（加权求和），FFN 引入**非线性**（激活函数）。
没有非线性，多层网络等于一层。

### English Explanation

**Division of labor between Attention and FFN:**

| Module | Role | Analogy |
|--------|------|---------|
| Attention | Information routing (find what's relevant) | Search engine |
| FFN | Information transformation (nonlinear processing) | Processor |

Attention is **linear** (weighted sum), FFN introduces **nonlinearity** (activation function).
Without nonlinearity, multi-layer networks equal a single layer.

---

## 13.2 标准 FFN 结构 | Standard FFN Structure

### 中文解释

标准 Transformer FFN：
```
FFN(x) = activation(x @ W1 + b1) @ W2 + b2
```

维度变化：
```
(1) x:        (batch, seq, d_model)    — 输入
(2) x @ W1:   (batch, seq, d_ff)       — 扩展4倍 | Expand 4×
(3) activation (batch, seq, d_ff)       — 非线性变换 | Nonlinear transform
(4) @ W2:     (batch, seq, d_model)    — 投影回原维度 | Project back
```

d_ff 通常是 d_model 的 4 倍（如 768 → 3072）

### English Explanation

Standard Transformer FFN:
```
FFN(x) = activation(x @ W1 + b1) @ W2 + b2
```

Dimension changes:
```
(1) x:        (batch, seq, d_model)    — input
(2) x @ W1:   (batch, seq, d_ff)       — expand 4×
(3) activation (batch, seq, d_ff)       — nonlinear transform
(4) @ W2:     (batch, seq, d_model)    — project back
```

d_ff is typically 4× d_model (e.g., 768 → 3072)

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

class StandardFFN(nn.Module):
    """标准 FFN | Standard FFN"""
    
    def __init__(self, d_model, d_ff=None, activation='relu'):
        super().__init__()
        if d_ff is None:
            d_ff = d_model * 4   # 默认扩展4倍 | Default 4× expansion
        
        self.fc1 = nn.Linear(d_model, d_ff)
        self.fc2 = nn.Linear(d_ff, d_model)
        
        if activation == 'relu':
            self.activation = nn.ReLU()
        elif activation == 'gelu':
            self.activation = nn.GELU()
        else:
            raise ValueError(f"Unknown activation: {activation}")
    
    def forward(self, x):
        """
        x: (batch, seq, d_model)
        """
        # Step 1: 扩展 | Expand
        h = self.fc1(x)            # (B, S, d_ff)
        
        # Step 2: 非线性激活 | Nonlinear activation
        h = self.activation(h)     # (B, S, d_ff)
        
        # Step 3: 投影回 | Project back
        output = self.fc2(h)       # (B, S, d_model)
        
        return output

# 测试 | Test
batch, seq, d_model = 2, 10, 512
ffn = StandardFFN(d_model, activation='gelu')

x = torch.randn(batch, seq, d_model)
output = ffn(x)

print(f"Input shape:  {x.shape}")
print(f"Hidden shape: {ffn.fc1(x).shape}")
print(f"Output shape: {output.shape}")
```

---

## 13.3 激活函数对比 | Activation Function Comparison

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn
import matplotlib.pyplot as plt

x = torch.linspace(-3, 3, 100)

# ReLU
relu = nn.ReLU()
y_relu = relu(x)

# GELU（Transformer 首选）| GELU (Transformer preferred)
gelu = nn.GELU()
y_gelu = gelu(x)

# Swish / SiLU
silu = nn.SiLU()
y_silu = silu(x)

print("激活函数特性 | Activation function properties:")
print(f"ReLU(0):  {relu(torch.tensor(0.0)).item()}")
print(f"GELU(0):  {gelu(torch.tensor(0.0)).item():.4f}")
print(f"SiLU(0):  {silu(torch.tensor(0.0)).item():.4f}")

# GELU 公式近似 | GELU formula approximation:
# GELU(x) ≈ x × Φ(x) = x × 0.5 × (1 + tanh(√(2/π) × (x + 0.044715x³)))
# 比 ReLU 更平滑，梯度更稳定 | Smoother than ReLU, more stable gradients
```

### 为什么用 GELU？| Why GELU?

| 特性 | ReLU | GELU |
|------|------|------|
| 负值区域 | 截断为0 | 平滑衰减 | Smooth decay
| 在0处的导数 | 不连续 | 连续 | Continuous |
| 梯度流 | 可能死亡 | 不会死亡 | No dying |
| 使用模型 | 早期 CNN | BERT, GPT, LLaMA | |

| Feature | ReLU | GELU |
|---------|------|------|
| Negative region | Clipped to 0 | Smooth decay |
| Derivative at 0 | Discontinuous | Continuous |
| Gradient flow | Can die | Never dies |
| Used in | Early CNNs | BERT, GPT, LLaMA |

---

## 13.4 FFN 的参数量分析 | FFN Parameter Analysis

### 中文解释

FFN 是 Transformer 中**参数量最大**的部分！

```
W1: (d_model, d_ff) = (768, 3072)  → 2,359,296 参数
W2: (d_ff, d_model) = (3072, 768)  → 2,359,296 参数

一个 FFN: ~4.7M 参数
一个 Attention: ~2.4M 参数（d_model=768, heads=12）

所以：FFN 参数量 ≈ 2 × Attention 参数量
```

### English Explanation

FFN is the **largest parameter consumer** in Transformer!

```
W1: (d_model, d_ff) = (768, 3072)  → 2,359,296 parameters
W2: (d_ff, d_model) = (3072, 768)  → 2,359,296 parameters

One FFN: ~4.7M parameters
One Attention: ~2.4M parameters (d_model=768, heads=12)

So: FFN parameters ≈ 2 × Attention parameters
```

### 代码案例 | Code Example

```python
import torch.nn as nn

def count_parameters(module):
    """统计参数量 | Count parameters"""
    return sum(p.numel() for p in module.parameters())

d_model = 768
num_heads = 12
d_ff = d_model * 4

# Attention 参数量 | Attention parameters
attn = nn.MultiheadAttention(d_model, num_heads, batch_first=True)
attn_params = count_parameters(attn)
print(f"Attention params: {attn_params:,}")

# FFN 参数量 | FFN parameters
ffn = nn.Sequential(
    nn.Linear(d_model, d_ff),
    nn.GELU(),
    nn.Linear(d_ff, d_model),
)
ffn_params = count_parameters(ffn)
print(f"FFN params: {ffn_params:,}")

print(f"\nFFN / Attention ratio: {ffn_params / attn_params:.2f}x")
```

---

## 13.5 FFN 变体：GLU 和 SwiGLU | FFN Variants: GLU and SwiGLU

### 中文解释

**GLU（Gated Linear Unit）= 门控线性单元**

标准 FFN：
```
FFN(x) = activation(xW1)W2
```

GLU 变体：
```
GLU(x) = (xW1 ⊗ sigmoid(xW2))W3   # ⊗ 表示逐元素乘
SwiGLU(x) = (xW1 ⊗ Swish(xW2))W3  # LLaMA-2 使用 | Used by LLaMA-2
```

优势：
- 门控机制提供更强的表达能力
- SwiGLU 在现代 LLM 中效果最佳

### English Explanation

**GLU (Gated Linear Unit)**

Standard FFN:
```
FFN(x) = activation(xW1)W2
```

GLU variant:
```
GLU(x) = (xW1 ⊗ sigmoid(xW2))W3   # ⊗ = element-wise multiply
SwiGLU(x) = (xW1 ⊗ Swish(xW2))W3  # Used by LLaMA-2
```

Advantages:
- Gating mechanism provides stronger expressiveness
- SwiGLU performs best in modern LLMs

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

class SwiGLU(nn.Module):
    """SwiGLU FFN — LLaMA-2 使用 | SwiGLU FFN — used by LLaMA-2"""
    
    def __init__(self, d_model, d_ff=None):
        super().__init__()
        if d_ff is None:
            # SwiGLU 论文建议：d_ff = 2/3 × 4 × d_model | Paper suggests: 2/3 × 4 × d_model
            d_ff = int(8/3 * d_model)
        
        # 三个投影矩阵 | Three projection matrices
        self.W_gate = nn.Linear(d_model, d_ff, bias=False)
        self.W_up = nn.Linear(d_model, d_ff, bias=False)
        self.W_down = nn.Linear(d_ff, d_model, bias=False)
    
    def forward(self, x):
        """
        SwiGLU(x) = Swish(x @ W_gate) ⊗ (x @ W_up) @ W_down
        """
        gate = torch.nn.functional.silu(self.W_gate(x))   # Swish/SiLU 门控 | Swish/SiLU gate
        up = self.W_up(x)
        hidden = gate * up                                  # 门控乘法 | Gated multiplication
        output = self.W_down(hidden)
        return output

# 测试 | Test
swiglu = SwiGLU(d_model=512)
x = torch.randn(2, 10, 512)
output = swiglu(x)
print(f"SwiGLU output shape: {output.shape}")

# 参数量对比 | Parameter comparison
std_ffn = StandardFFN(512)
swiglu = SwiGLU(512)

print(f"\nStandard FFN params: {count_parameters(std_ffn):,}")
print(f"SwiGLU params: {count_parameters(swiglu):,}")
```

---

## 本章总结 | Chapter Summary

**中文：**
- Attention 负责信息路由，FFN 负责非线性变换
- FFN 是 Transformer 中参数量最大的部分
- 标准 FFN：d_model → 4×d_model → d_model
- GELU 是 Transformer 的标准激活函数
- SwiGLU 是现代 LLM 的最佳实践

**English:**
- Attention handles information routing, FFN handles nonlinear transformation
- FFN is the largest parameter consumer in Transformer
- Standard FFN: d_model → 4×d_model → d_model
- GELU is the standard activation for Transformers
- SwiGLU is best practice for modern LLMs

---

## 课后练习 | Homework

1. **FFN 实现**：手写标准 FFN，验证 shape 和参数量
2. **激活函数对比**：在相同输入下比较 ReLU、GELU、SiLU 的输出
3. **参数量计算**：计算一个 12 层 Transformer 中 Attention 和 FFN 的参数量占比
4. **SwiGLU 实现**：实现 SwiGLU，与标准 FFN 对比参数量
5. **思考题**：如果去掉 FFN，只用 Attention，模型还能工作吗？为什么？
