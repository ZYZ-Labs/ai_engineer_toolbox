# 第26章：开始改 Attention — 魔改入门 | Chapter 26: Modifying Attention — Introduction to Model Hacking

> **阶段定位** | **Stage**: 第五阶段 — 源码与魔改
> **预计学时** | **Duration**: 6~8 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 理解 Attention 变体的动机和方向
- 掌握 Linear Attention、Grouped Query Attention 的实现
- 能够独立修改现有模型的 Attention 模块
- 理解每种修改的优缺点

**English:**
- Understand motivations and directions for Attention variants
- Master implementations of Linear Attention, Grouped Query Attention
- Be able to independently modify Attention modules in existing models
- Understand pros and cons of each modification

---

## 26.1 可改方向概览 | Modification Directions Overview

### 中文解释

**Attention 的主要修改方向：**

| 方向 | 问题 | 解决方案 |
|------|------|----------|
| 计算复杂度 | O(n²) | Linear Attention, Sparse Attention |
| 内存开销 | KV Cache 太大 | GQA, MQA |
| 长上下文 | 位置编码失效 | ALiBi, RoPE, NTK-aware |
| 表达能力 | 单一注意力 | Multi-Query, Multi-Scale |

### English Explanation

**Main modification directions for Attention:**

| Direction | Problem | Solution |
|-----------|---------|----------|
| Computational complexity | O(n²) | Linear Attention, Sparse Attention |
| Memory overhead | KV Cache too large | GQA, MQA |
| Long context | Position encoding failure | ALiBi, RoPE, NTK-aware |
| Expressiveness | Single attention | Multi-Query, Multi-Scale |

---

## 26.2 Linear Attention | Linear Attention

### 中文解释

**核心思想：将 softmax 替换为核函数，使复杂度从 O(n²) 降到 O(n)**

标准 Attention：
```
Attention(Q, K, V) = softmax(QK^T)V
复杂度: O(n²d) — 因为 QK^T 是 (n, n)
```

Linear Attention：
```
Attention(Q, K, V) = φ(Q) @ (φ(K)^T @ V) / (φ(Q) @ φ(K)^T @ 1)
复杂度: O(nd²) — 当 n >> d 时更快
```

### English Explanation

**Core idea: Replace softmax with kernel functions, reduce complexity from O(n²) to O(n)**

Standard Attention:
```
Attention(Q, K, V) = softmax(QK^T)V
Complexity: O(n²d) — because QK^T is (n, n)
```

Linear Attention:
```
Attention(Q, K, V) = φ(Q) @ (φ(K)^T @ V) / (φ(Q) @ φ(K)^T @ 1)
Complexity: O(nd²) — faster when n >> d
```

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

class LinearAttention(nn.Module):
    """Linear Attention 简化实现 | Simplified Linear Attention"""
    
    def __init__(self, dim, num_heads=8):
        super().__init__()
        self.num_heads = num_heads
        self.d_head = dim // num_heads
        
        self.qkv = nn.Linear(dim, dim * 3)
        self.proj = nn.Linear(dim, dim)
    
    def elu_feature_map(self, x):
        """特征映射函数 | Feature map function"""
        return torch.nn.functional.elu(x) + 1
    
    def forward(self, x):
        B, N, C = x.shape
        
        qkv = self.qkv(x).reshape(B, N, 3, self.num_heads, self.d_head).permute(2, 0, 3, 1, 4)
        q, k, v = qkv[0], qkv[1], qkv[2]   # (B, H, N, D)
        
        # 应用特征映射 | Apply feature map
        q = self.elu_feature_map(q)
        k = self.elu_feature_map(k)
        
        # Linear Attention 核心 | Linear Attention core
        # 先算 KV 的累积 | First compute cumulative KV
        kv = torch.einsum('bhnd,bhne->bhde', k, v)   # (B, H, D, D)
        
        # 再算 Q @ KV | Then compute Q @ KV
        z = torch.einsum('bhnd,bhde->bhne', q, kv)    # (B, H, N, D)
        
        # 归一化 | Normalization
        k_sum = k.sum(dim=2)   # (B, H, D)
        z_norm = torch.einsum('bhnd,bhd->bhn', q, k_sum).unsqueeze(-1)
        z = z / (z_norm + 1e-6)
        
        # 合并头 | Combine heads
        z = z.transpose(1, 2).reshape(B, N, C)
        return self.proj(z)

# 复杂度对比 | Complexity comparison
print("复杂度对比 | Complexity comparison:")
print("Standard Attention: O(n²d)")
print("Linear Attention:   O(nd²)")
print("当 n=4096, d=64 时 | When n=4096, d=64:")
print(f"  Standard: {4096**2 * 64:,} ≈ 1B ops")
print(f"  Linear:   {4096 * 64**2:,} ≈ 17M ops")
```

---

## 26.3 Grouped Query Attention（GQA）| Grouped Query Attention

### 中文解释

**核心思想：多个 Query head 共享一组 K/V**

标准 MHA：
```
Q: 16 heads, K: 16 heads, V: 16 heads
→ KV Cache = 16 × seq × d_head
```

GQA（4 组）：
```
Q: 16 heads, K: 4 heads, V: 4 heads
→ KV Cache = 4 × seq × d_head（节省 4 倍）
```

### English Explanation

**Core idea: Multiple Query heads share a group of K/V**

Standard MHA:
```
Q: 16 heads, K: 16 heads, V: 16 heads
→ KV Cache = 16 × seq × d_head
```

GQA (4 groups):
```
Q: 16 heads, K: 4 heads, V: 4 heads
→ KV Cache = 4 × seq × d_head (save 4×)
```

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

class GroupedQueryAttention(nn.Module):
    """Grouped Query Attention | GQA"""
    
    def __init__(self, d_model, num_heads, num_kv_groups):
        super().__init__()
        assert num_heads % num_kv_groups == 0
        assert d_model % num_heads == 0
        
        self.d_model = d_model
        self.num_heads = num_heads
        self.num_kv_groups = num_kv_groups
        self.d_head = d_model // num_heads
        self.head_per_group = num_heads // num_kv_groups
        
        self.q_proj = nn.Linear(d_model, d_model)
        self.k_proj = nn.Linear(d_model, num_kv_groups * self.d_head)
        self.v_proj = nn.Linear(d_model, num_kv_groups * self.d_head)
        self.o_proj = nn.Linear(d_model, d_model)
    
    def forward(self, x, kv_cache=None):
        B, S, _ = x.shape
        
        # 投影 | Project
        Q = self.q_proj(x).view(B, S, self.num_heads, self.d_head)
        K = self.k_proj(x).view(B, S, self.num_kv_groups, self.d_head)
        V = self.v_proj(x).view(B, S, self.num_kv_groups, self.d_head)
        
        # 扩展 K/V 以匹配 Q 的头数 | Expand K/V to match Q head count
        K = K.repeat_interleave(self.head_per_group, dim=2)   # (B, S, num_heads, d_head)
        V = V.repeat_interleave(self.head_per_group, dim=2)
        
        # 转置用于 attention | Transpose for attention
        Q = Q.transpose(1, 2)   # (B, H, S, D)
        K = K.transpose(1, 2)
        V = V.transpose(1, 2)
        
        # Attention
        scores = torch.matmul(Q, K.transpose(-2, -1)) / (self.d_head ** 0.5)
        weights = torch.softmax(scores, dim=-1)
        output = torch.matmul(weights, V)
        
        # 合并 | Combine
        output = output.transpose(1, 2).contiguous().view(B, S, self.d_model)
        return self.o_proj(output)

# 内存对比 | Memory comparison
d_model = 4096
num_heads = 32
seq_len = 8192

mha_kv = 2 * num_heads * seq_len * (d_model // num_heads) * 2 / 1024**3   # float16
gqa_kv = 2 * 4 * seq_len * (d_model // num_heads) * 2 / 1024**3   # 4 groups

print(f"MHA KV Cache: {mha_kv:.2f} GB")
print(f"GQA KV Cache: {gqa_kv:.2f} GB")
print(f"Saved: {(1 - gqa_kv/mha_kv)*100:.1f}%")
```

---

## 26.4 在现有模型中替换 Attention | Replacing Attention in Existing Models

### 代码案例 | Code Example

```python
import torch
from transformers import AutoModelForCausalLM

def replace_attention_with_gqa(model, num_kv_groups=4):
    """
    将模型中的 Attention 替换为 GQA | Replace Attention with GQA in model
    """
    for name, module in model.named_modules():
        # 找到 Attention 模块 | Find Attention modules
        if "self_attn" in name.lower() or "attention" in name.lower():
            # 获取配置 | Get config
            config = model.config
            
            # 创建 GQA 替换 | Create GQA replacement
            # 注意：实际替换需要匹配接口 | Note: actual replacement needs interface matching
            print(f"Found attention module: {name}")
    
    return model

# 加载模型并修改 | Load and modify model
model = AutoModelForCausalLM.from_pretrained("gpt2")
print(f"Original params: {sum(p.numel() for p in model.parameters()):,}")

# 修改后的模型需要重新训练或转换 | Modified model needs retraining or conversion
```

---

## 本章总结 | Chapter Summary

**中文：**
- Attention 修改方向：效率、内存、长上下文、表达能力
- Linear Attention：O(n²) → O(n)，适合长序列
- GQA：共享 K/V，显著减少 KV Cache
- 修改现有模型需要理解其内部结构

**English:**
- Attention modification directions: efficiency, memory, long context, expressiveness
- Linear Attention: O(n²) → O(n), suitable for long sequences
- GQA: shared K/V, significantly reduces KV Cache
- Modifying existing models requires understanding their internal structure

---

## 课后练习 | Homework

1. **Linear Attention**：完整实现 Linear Attention，与标准 Attention 对比速度
2. **GQA 实现**：在已有模型中加入 GQA，比较内存节省
3. **注意力替换**：写一个函数，自动将模型中的 Attention 替换为指定类型
4. **长序列测试**：用 Linear Attention 测试 16K+ 序列长度的推理
5. **论文阅读**：阅读 Linformer、Performer 论文，理解它们的近似方法
