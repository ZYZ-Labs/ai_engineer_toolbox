# 第11章：Position Encoding — 给模型顺序感 | Chapter 11: Position Encoding — Giving the Model a Sense of Order

> **阶段定位** | **Stage**: 第三阶段 — Transformer 核心
> **预计学时** | **Duration**: 4~6 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 理解为什么 Transformer 本身不知道 token 的顺序
- 掌握 Sinusoidal、RoPE、ALiBi 三种位置编码的原理和实现
- 理解绝对位置编码与相对位置编码的区别
- 能够手写位置编码并可视化

**English:**
- Understand why Transformers inherently don't know token order
- Master the principles and implementations of Sinusoidal, RoPE, and ALiBi
- Understand the difference between absolute and relative position encoding
- Be able to write position encodings by hand and visualize them

---

## 11.1 为什么需要位置编码？| Why Position Encoding?

### 中文解释

**Attention 的根本问题：没有位置信息**

```
Attention(Q, K, V) 对每个位置的处理是对称的：
无论 token 在前面还是后面，计算方式完全相同。

"猫抓老鼠" 和 "老鼠抓猫" 在 Attention 看来是等价的！
```

**解决方案：给每个位置添加位置信息**

### English Explanation

**Fundamental problem of Attention: no position information**

```
Attention(Q, K, V) processes each position symmetrically:
Whether a token is at the beginning or end, computation is identical.

"Cat catches mouse" and "Mouse catches cat" look equivalent to Attention!
```

**Solution: Add position information to each position**

---

## 11.2 Sinusoidal 位置编码 | Sinusoidal Position Encoding

### 中文解释

**原始 Transformer 论文的方法**

公式：
```
PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
```

核心思想：
- 用不同频率的正弦/余弦函数编码位置
- 频率随维度增加而降低
- 模型可以从这些波中推断相对位置

### English Explanation

**Method from the original Transformer paper**

Formula:
```
PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
```

Core idea:
- Encode position using sine/cosine functions of different frequencies
- Frequency decreases as dimension increases
- Model can infer relative positions from these waves

### 代码案例 | Code Example

```python
import torch
import math

def sinusoidal_position_encoding(seq_len, d_model):
    """
    Sinusoidal 位置编码 | Sinusoidal position encoding
    """
    pe = torch.zeros(seq_len, d_model)
    
    # pos: (seq_len, 1)
    position = torch.arange(0, seq_len, dtype=torch.float).unsqueeze(1)
    
    # div_term: (d_model/2,)
    # 10000^(2i/d_model) = exp(2i * -log(10000) / d_model)
    div_term = torch.exp(
        torch.arange(0, d_model, 2).float() *
        (-math.log(10000.0) / d_model)
    )
    
    # 偶数维用 sin | Even dims use sin
    pe[:, 0::2] = torch.sin(position * div_term)
    # 奇数维用 cos | Odd dims use cos
    pe[:, 1::2] = torch.cos(position * div_term)
    
    return pe

# 测试 | Test
seq_len = 100
d_model = 512

pe = sinusoidal_position_encoding(seq_len, d_model)
print(f"PE shape: {pe.shape}")   # (100, 512)
print(f"PE[0, :8]: {pe[0, :8].round(4)}")
print(f"PE[1, :8]: {pe[1, :8].round(4)}")

# 可视化 | Visualization
import matplotlib.pyplot as plt

plt.figure(figsize=(12, 6))
plt.imshow(pe.numpy(), cmap='viridis', aspect='auto')
plt.colorbar(label='Value')
plt.xlabel('Dimension')
plt.ylabel('Position')
plt.title('Sinusoidal Position Encoding')
plt.savefig('sinusoidal_pe.png', dpi=150)
print("Saved visualization")
```

### 特性分析 | Property Analysis

```python
import torch

pe = sinusoidal_position_encoding(100, 512)

# 特性1：每个位置有唯一编码 | Property 1: Each position has unique encoding
print(f"PE[0] == PE[1]: {torch.allclose(pe[0], pe[1])}")   # False

# 特性2：相对位置可推断 | Property 2: Relative positions can be inferred
# PE(pos+k) 可以用 PE(pos) 线性表示 | PE(pos+k) can be linearly represented by PE(pos)
# 这是 sin/cos 的数学性质 | This is a mathematical property of sin/cos

# 特性3：有界于 [-1, 1] | Property 3: Bounded in [-1, 1]
print(f"Max: {pe.max():.4f}, Min: {pe.min():.4f}")
```

---

## 11.3 Learnable Position Embedding | 可学习的位置嵌入

### 中文解释

**BERT/GPT 的方法：直接让模型学习位置嵌入**

与 Sinusoidal 的区别：
- Sinusoidal：固定公式，不可学习
- Learnable：可训练参数

### English Explanation

**BERT/GPT approach: Let the model directly learn position embeddings**

Difference from Sinusoidal:
- Sinusoidal: Fixed formula, not learnable
- Learnable: Trainable parameters

### 代码案例 | Code Example

```python
import torch.nn as nn

class LearnablePositionEncoding(nn.Module):
    """可学习的位置嵌入 | Learnable position embedding"""
    
    def __init__(self, max_seq_len, d_model):
        super().__init__()
        self.position_embedding = nn.Embedding(max_seq_len, d_model)
    
    def forward(self, x):
        """
        x: (batch, seq, d_model)
        """
        seq_len = x.size(1)
        positions = torch.arange(seq_len, device=x.device)
        pos_emb = self.position_embedding(positions)   # (seq, d_model)
        return x + pos_emb.unsqueeze(0)   # 广播加到输入上 | Broadcast add to input

# 使用 | Usage
pos_enc = LearnablePositionEncoding(max_seq_len=512, d_model=768)
X = torch.randn(2, 100, 768)
X_with_pos = pos_enc(X)
print(f"Output shape: {X_with_pos.shape}")
```

---

## 11.4 RoPE — 旋转位置编码 | RoPE (Rotary Position Embedding)

### 中文解释

**RoPE = 通过旋转矩阵编码位置信息**

核心思想：
- 不直接加位置向量
- 而是将 Q/K 向量按位置角度旋转
- 自然地保持相对位置关系

优势：
- 外推性好（可以处理比训练更长的序列）
- 相对位置编码，更自然地融入 Attention

### English Explanation

**RoPE = Encode position information via rotation matrices**

Core idea:
- Instead of directly adding position vectors
- Rotate Q/K vectors by position-dependent angles
- Naturally preserve relative position relationships

Advantages:
- Good extrapolation (can handle sequences longer than training)
- Relative position encoding, more naturally integrated into Attention

### 代码案例 | Code Example

```python
import torch
import math

class RoPE(nn.Module):
    """旋转位置编码 | Rotary Position Embedding"""
    
    def __init__(self, d_head, max_seq_len=2048):
        super().__init__()
        self.d_head = d_head
        
        # 预计算旋转角度 | Precompute rotation angles
        inv_freq = 1.0 / (10000 ** (torch.arange(0, d_head, 2).float() / d_head))
        positions = torch.arange(max_seq_len)
        angles = torch.einsum('i,j->ij', positions.float(), inv_freq)   # (seq, d_head/2)
        
        # 注册为 buffer（不参与训练）| Register as buffer (not trained)
        self.register_buffer('cos', torch.cos(angles))
        self.register_buffer('sin', torch.sin(angles))
    
    def forward(self, x, seq_len):
        """
        x: (..., seq, d_head)
        应用旋转 | Apply rotation
        """
        # 将 x 分成偶数维和奇数维 | Split x into even and odd dims
        x1 = x[..., ::2]    # 偶数维 | Even dims
        x2 = x[..., 1::2]   # 奇数维 | Odd dims
        
        # 应用旋转 | Apply rotation
        # [x1, x2] @ [[cos, -sin], [sin, cos]]
        cos = self.cos[:seq_len]   # (seq, d_head/2)
        sin = self.sin[:seq_len]
        
        rotated_x1 = x1 * cos - x2 * sin
        rotated_x2 = x1 * sin + x2 * cos
        
        # 交错合并 | Interleave
        rotated = torch.stack([rotated_x1, rotated_x2], dim=-1).flatten(-2)
        
        return rotated

# 在 Attention 中使用 RoPE | Using RoPE in Attention
def apply_rope_to_qk(Q, K, rope):
    """
    Q, K: (batch, heads, seq, d_head)
    """
    seq_len = Q.size(2)
    Q = rope(Q, seq_len)
    K = rope(K, seq_len)
    return Q, K

# 测试 | Test
rope = RoPE(d_head=64)
Q = torch.randn(2, 8, 128, 64)
K = torch.randn(2, 8, 128, 64)
Q_rot, K_rot = apply_rope_to_qk(Q, K, rope)
print(f"Q_rot shape: {Q_rot.shape}")   # (2, 8, 128, 64)
```

---

## 11.5 ALiBi — 线性偏置注意力 | ALiBi (Attention with Linear Biases)

### 中文解释

**ALiBi = 给注意力分数加上一个与距离相关的负偏置**

核心思想：
- 不需要位置编码向量
- 直接在注意力分数上减去 `m × 距离`
- 越远的 token，注意力分数越低

优势：
- 实现极其简单
- 外推性极好
- 训练稳定性好

### English Explanation

**ALiBi = Add a distance-dependent negative bias to attention scores**

Core idea:
- No position encoding vectors needed
- Directly subtract `m × distance` from attention scores
- Farther tokens get lower attention scores

Advantages:
- Extremely simple implementation
- Excellent extrapolation
- Good training stability

### 代码案例 | Code Example

```python
import torch

def get_alibi_slopes(num_heads):
    """计算每个 head 的斜率 | Calculate slope for each head"""
    # 几何序列的斜率 | Geometric sequence of slopes
    closest_power_of_2 = 2 ** (num_heads.bit_length() - 1)
    base = 2 ** (-(2 ** -(math.log2(closest_power_of_2) - 3)))
    
    slopes = []
    for i in range(1, num_heads + 1):
        if i <= closest_power_of_2:
            slopes.append(i * base)
        else:
            slopes.append(slopes[i - closest_power_of_2 - 1] / 2)
    
    return torch.tensor(slopes)

def apply_alibi(scores, num_heads):
    """
    scores: (batch, heads, seq, seq)
    应用 ALiBi 偏置 | Apply ALiBi bias
    """
    batch, heads, seq, _ = scores.shape
    
    # 距离矩阵 | Distance matrix
    positions = torch.arange(seq)
    distance = positions.unsqueeze(0) - positions.unsqueeze(1)   # (seq, seq)
    distance = distance.abs().unsqueeze(0).unsqueeze(0)   # (1, 1, seq, seq)
    
    # 每个 head 的斜率 | Slope per head
    slopes = get_alibi_slopes(num_heads).view(1, heads, 1, 1)
    
    # 减去偏置 | Subtract bias
    bias = -slopes * distance   # 负数，越远越大 | Negative, larger for farther
    return scores + bias

# 测试 | Test
scores = torch.randn(2, 8, 10, 10)
scores_alibi = apply_alibi(scores, num_heads=8)
print(f"Original scores range: [{scores.min():.2f}, {scores.max():.2f}]")
print(f"ALiBi scores range: [{scores_alibi.min():.2f}, {scores_alibi.max():.2f}]")
```

---

## 11.6 三种编码方式对比 | Comparison of Three Methods

| 特性 | Sinusoidal | RoPE | ALiBi |
|------|-----------|------|-------|
| 类型 | 绝对位置 | 相对位置 | 相对位置 |
| 参数 | 固定公式 | 固定公式 | 固定公式 |
| 实现复杂度 | 中 | 中 | 低 |
| 外推性 | 一般 | 好 | 极好 |
| 训练稳定性 | 好 | 好 | 极好 |
| 代表模型 | Original Transformer | LLaMA, Qwen | BLOOM, MPT |

| Feature | Sinusoidal | RoPE | ALiBi |
|---------|-----------|------|-------|
| Type | Absolute | Relative | Relative |
| Parameters | Fixed formula | Fixed formula | Fixed formula |
| Complexity | Medium | Medium | Low |
| Extrapolation | Fair | Good | Excellent |
| Training stability | Good | Good | Excellent |
| Representative models | Original Transformer | LLaMA, Qwen | BLOOM, MPT |

---

## 本章总结 | Chapter Summary

**中文：**
- Transformer 需要位置编码，因为 Attention 本身无位置感知
- Sinusoidal：经典方法，频率编码位置
- Learnable：BERT/GPT 使用，直接学习
- RoPE：通过旋转编码，外推性好
- ALiBi：最简单，直接加偏置，外推性最好
- 现代大模型（LLaMA/Qwen）普遍使用 RoPE

**English:**
- Transformers need position encoding because Attention itself has no position awareness
- Sinusoidal: Classic method, frequency encodes position
- Learnable: Used by BERT/GPT, directly learned
- RoPE: Encodes via rotation, good extrapolation
- ALiBi: Simplest, directly adds bias, best extrapolation
- Modern LLMs (LLaMA/Qwen) generally use RoPE

---

## 课后练习 | Homework

1. **Sinusoidal 实现**：手写 sinusoidal PE，可视化前 50 个位置的前 64 维
2. **RoPE 实现**：实现 RoPE，验证旋转前后向量的模长不变
3. **ALiBi 实现**：实现 ALiBi，观察不同 head 的斜率分布
4. **外推性测试**：用训练长度 128 的模型，测试长度 256 的推理效果（三种方法对比）
5. **思考题**：为什么位置编码只需要加在输入端，而不需要每层都加？
