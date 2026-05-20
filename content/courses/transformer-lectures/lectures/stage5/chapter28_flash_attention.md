# 第28章：FlashAttention — IO-Aware 优化 | Chapter 28: FlashAttention — IO-Aware Optimization

> **阶段定位** | **Stage**: 第五阶段 — 源码与魔改
> **预计学时** | **Duration**: 5~7 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 理解 FlashAttention 的核心思想：减少 HBM 访问
- 掌握 Tiling 和 Recomputation 技术
- 了解 FlashAttention 的加速效果
- 能够使用 FlashAttention 的 API

**English:**
- Understand core idea of FlashAttention: reduce HBM access
- Master Tiling and Recomputation techniques
- Understand acceleration effects of FlashAttention
- Be able to use FlashAttention APIs

---

## 28.1 Attention 的内存瓶颈 | Memory Bottleneck of Attention

### 中文解释

**标准 Attention 的内存问题：**

```
计算 Attention 时：
  1. 从 HBM（显存）读取 Q, K, V
  2. 在 SRAM（高速缓存）计算 S = QK^T
  3. 将 S 写回 HBM
  4. 从 HBM 读取 S
  5. 计算 P = softmax(S)
  6. 将 P 写回 HBM
  7. 从 HBM 读取 P 和 V
  8. 计算 O = PV
  9. 将 O 写回 HBM

问题：HBM 读写太慢！S 和 P 的 size 是 (seq, seq)，当 seq=4096 时：
  S = 4096 × 4096 × 4 bytes = 67MB
  每层的读写量巨大
```

### English Explanation

**Memory problems of standard Attention:**

```
When computing Attention:
  1. Read Q, K, V from HBM (GPU memory)
  2. Compute S = QK^T in SRAM (fast cache)
  3. Write S back to HBM
  4. Read S from HBM
  5. Compute P = softmax(S)
  6. Write P back to HBM
  7. Read P and V from HBM
  8. Compute O = PV
  9. Write O back to HBM

Problem: HBM read/write is too slow! S and P size is (seq, seq), when seq=4096:
  S = 4096 × 4096 × 4 bytes = 67MB
  Huge read/write per layer
```

---

## 28.2 FlashAttention 核心思想 | FlashAttention Core Idea

### 中文解释

**核心洞察：不要让中间结果（S, P）回到 HBM**

方法：
1. **Tiling（分块）**：将 Q, K, V 分成小块，一次只处理一小块
2. **Softmax 的 online 计算**：不需要完整的 S 矩阵就能计算 softmax
3. **Recomputation（重计算）**：反向传播时不保存 S 和 P，而是重新计算

### English Explanation

**Core insight: Don't let intermediate results (S, P) go back to HBM**

Methods:
1. **Tiling**: Split Q, K, V into small blocks, process one block at a time
2. **Online softmax computation**: Can compute softmax without complete S matrix
3. **Recomputation**: Don't save S and P during backward, recompute instead

---

## 28.3 Online Softmax | Online Softmax

### 中文解释

**标准 softmax 需要完整的输入向量：**
```
softmax(x_i) = exp(x_i) / Σ exp(x_j)
需要先算所有 exp(x_j) 的 sum
```

**Online softmax 可以增量计算：**
```
m_1 = x_1
m_2 = max(m_1, x_2)
l_2 = exp(m_1 - m_2) + exp(x_2 - m_2)

这样只需要维护 running max 和 running sum
```

### English Explanation

**Standard softmax needs complete input vector:**
```
softmax(x_i) = exp(x_i) / Σ exp(x_j)
Need to compute sum of all exp(x_j) first
```

**Online softmax can compute incrementally:**
```
m_1 = x_1
m_2 = max(m_1, x_2)
l_2 = exp(m_1 - m_2) + exp(x_2 - m_2)

Only need to maintain running max and running sum
```

### 代码案例 | Code Example

```python
import torch

def online_softmax(blocks):
    """
    Online softmax 演示 | Online softmax demonstration
    blocks: 分块的输入 | Blocked inputs
    """
    m = float('-inf')   # running max
    l = 0.0             # running sum
    
    for block in blocks:
        m_new = torch.max(m, block.max())
        l = l * torch.exp(m - m_new) + torch.sum(torch.exp(block - m_new))
        m = m_new
    
    # 最终结果 | Final result
    # softmax(x_i) = exp(x_i - m) / l
    return m, l

# 验证 | Verification
x = torch.randn(100)
m, l = online_softmax([x[:50], x[50:]])

# 标准 softmax | Standard softmax
std_softmax = torch.softmax(x, dim=0)

# 用 online 结果计算 | Compute with online result
online_result = torch.exp(x - m) / l

print(f"Standard softmax sum: {std_softmax.sum():.6f}")
print(f"Online softmax sum: {online_result.sum():.6f}")
print(f"Match: {torch.allclose(std_softmax, online_result, atol=1e-5)}")
```

---

## 28.4 FlashAttention 的加速效果 | FlashAttention Acceleration Effects

| 指标 | 标准 Attention | FlashAttention | 提升 |
|------|-------------|---------------|------|
| 内存访问 | O(N²) HBM | O(N) HBM | 大幅减少 |
| 内存占用 | O(N²) | O(N) | 大幅减少 |
| 速度（长序列）| 慢 | 快 2-4× | 显著 |

| Metric | Standard Attention | FlashAttention | Improvement |
|--------|-------------------|---------------|-------------|
| Memory access | O(N²) HBM | O(N) HBM | Greatly reduced |
| Memory usage | O(N²) | O(N) | Greatly reduced |
| Speed (long seq) | Slow | 2-4× faster | Significant |

### 使用 FlashAttention | Using FlashAttention

```python
# 安装 | Install
# pip install flash-attn --no-build-isolation

import torch
from flash_attn import flash_attn_func

# FlashAttention API
# q, k, v: (batch, seq_len, num_heads, head_dim)
q = torch.randn(2, 2048, 12, 128, device='cuda', dtype=torch.float16)
k = torch.randn(2, 2048, 12, 128, device='cuda', dtype=torch.float16)
v = torch.randn(2, 2048, 12, 128, device='cuda', dtype=torch.float16)

# 使用 FlashAttention | Use FlashAttention
output = flash_attn_func(q, k, v, causal=True)
print(f"Output shape: {output.shape}")

# 在 PyTorch 模型中使用 | Use in PyTorch model
class FlashAttention(nn.Module):
    def __init__(self):
        super().__init__()
    
    def forward(self, q, k, v, causal=False):
        # q, k, v: (batch, seq, num_heads, head_dim)
        return flash_attn_func(q, k, v, causal=causal)
```

---

## 本章总结 | Chapter Summary

**中文：**
- FlashAttention 的核心：减少 HBM 访问
- Tiling + Online Softmax + Recomputation = IO-aware 优化
- 长序列加速 2-4 倍，内存大幅减少
- 现代 LLM 训练/推理的标配优化

**English:**
- FlashAttention core: reduce HBM access
- Tiling + Online Softmax + Recomputation = IO-aware optimization
- 2-4× speedup for long sequences, greatly reduced memory
- Standard optimization for modern LLM training/inference

---

## 课后练习 | Homework

1. **Online Softmax**：完整实现 Online Softmax，验证正确性
2. **Tiling 模拟**：模拟 FlashAttention 的 Tiling 过程
3. **速度测试**：比较标准 Attention 和 FlashAttention 的速度（长序列）
4. **内存测试**：测量两种方法的峰值内存占用
5. **论文阅读**：阅读 FlashAttention-2 论文，理解进一步优化的点
