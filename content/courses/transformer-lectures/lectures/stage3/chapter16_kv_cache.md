# 第16章：KV Cache — 推理优化的核心 | Chapter 16: KV Cache — Core of Inference Optimization

> **阶段定位** | **Stage**: 第三阶段 — Transformer 核心
> **预计学时** | **Duration**: 4~6 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 深入理解 KV Cache 的机制和必要性
- 掌握 KV Cache 的完整实现
- 理解 KV Cache 的内存开销和优化方向
- 了解 PagedAttention 等进阶优化

**English:**
- Deeply understand KV Cache mechanism and necessity
- Master complete KV Cache implementation
- Understand KV Cache memory overhead and optimization directions
- Learn about advanced optimizations like PagedAttention

---

## 16.1 为什么推理越来越慢？| Why Does Inference Get Slower?

### 中文解释

**Decoder-only 模型的推理分为两个阶段：**

1. **Prefill（预填充）**：处理输入 prompt，计算所有 token 的 KV
   - 计算量：O(seq²)
   - 可以并行

2. **Decoding（解码）**：逐个生成新 token
   - 每步只生成 1 个 token
   - 但需要计算当前 token 与所有历史 token 的 Attention
   - 如果没有 KV Cache，每步都要重新计算所有 KV

### English Explanation

**Decoder-only model inference has two stages:**

1. **Prefill**: Process input prompt, compute KV for all tokens
   - Computation: O(seq²)
   - Can be parallelized

2. **Decoding**: Generate new tokens one by one
   - Only 1 token generated per step
   - But need to compute attention between current token and all history
   - Without KV Cache, must recompute all KV at each step

### 复杂度分析 | Complexity Analysis

```
生成第 N 个 token：

无 KV Cache：| Without KV Cache:
  需要重新计算 K_1...K_N, V_1...V_N
  计算量: O(N × d_model) 每步，但累积 O(N²)

有 KV Cache：| With KV Cache:
  只需计算 K_N, V_N
  从缓存读取 K_1...K_{N-1}, V_1...V_{N-1}
  计算量: O(d_model) 每步
```

---

## 16.2 KV Cache 完整实现 | Complete KV Cache Implementation

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn
import math

class KVCacheAttention(nn.Module):
    """带 KV Cache 的多头注意力 | Multi-head attention with KV Cache"""
    
    def __init__(self, d_model, num_heads):
        super().__init__()
        assert d_model % num_heads == 0
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_head = d_model // num_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
    
    def forward(self, x, kv_cache=None, layer_idx=0):
        """
        x: (batch, seq_len, d_model)
        kv_cache: dict or None
        """
        batch_size, seq_len, _ = x.shape
        
        # 计算 Q/K/V | Compute Q/K/V
        Q = self.W_q(x)
        K = self.W_k(x)
        V = self.W_v(x)
        
        # 分头 | Split heads
        Q = Q.view(batch_size, seq_len, self.num_heads, self.d_head).transpose(1, 2)
        K = K.view(batch_size, seq_len, self.num_heads, self.d_head).transpose(1, 2)
        V = V.view(batch_size, seq_len, self.num_heads, self.d_head).transpose(1, 2)
        
        # KV Cache 处理 | KV Cache handling
        if kv_cache is not None:
            if layer_idx in kv_cache:
                # 有缓存：拼接 | Has cache: concatenate
                past_K, past_V = kv_cache[layer_idx]
                K = torch.cat([past_K, K], dim=2)   # (B, H, past_seq + seq, D)
                V = torch.cat([past_V, V], dim=2)
            
            # 更新缓存 | Update cache
            kv_cache[layer_idx] = (K, V)
        
        # Attention 计算 | Attention computation
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_head)
        
        # Causal mask（只在训练/预填充时需要）| Causal mask (only needed during training/prefill)
        if seq_len > 1 and kv_cache is None:
            mask = torch.tril(torch.ones(seq_len, seq_len, device=x.device))
            scores = scores.masked_fill(mask.unsqueeze(0).unsqueeze(0) == 0, float('-inf'))
        
        weights = torch.softmax(scores, dim=-1)
        attn_out = torch.matmul(weights, V)
        
        # 合并头 | Combine heads
        attn_out = attn_out.transpose(1, 2).contiguous().view(batch_size, seq_len, self.d_model)
        return self.W_o(attn_out)

# ========== 推理流程演示 | Inference Pipeline Demo ==========

def inference_with_kv_cache(model, prompt_ids, max_new_tokens=20):
    """
    使用 KV Cache 的完整推理流程 | Complete inference with KV Cache
    """
    kv_cache = {}
    
    # Phase 1: Prefill | 预填充
    print("=== Prefill Phase ===")
    _ = model(prompt_ids, kv_cache=kv_cache)
    print(f"KV Cache 状态 | KV Cache status:")
    for layer_idx in kv_cache:
        K, V = kv_cache[layer_idx]
        print(f"  Layer {layer_idx}: K shape {K.shape}, V shape {V.shape}")
    
    # Phase 2: Decoding | 解码
    print("\n=== Decoding Phase ===")
    generated = prompt_ids.clone()
    
    for step in range(max_new_tokens):
        # 只输入最后一个 token | Only input last token
        last_token = generated[:, -1:]
        
        # 前向传播（使用 KV Cache）| Forward (with KV Cache)
        logits = model(last_token, kv_cache=kv_cache)
        
        # 采样下一个 token | Sample next token
        next_token = torch.argmax(logits[:, -1, :], dim=-1, keepdim=True)
        generated = torch.cat([generated, next_token], dim=1)
        
        if step < 3:
            print(f"Step {step}: generated token {next_token.item()}")
    
    return generated

# 简化模型用于演示 | Simplified model for demo
class SimpleDecoder(nn.Module):
    def __init__(self, vocab_size, d_model, num_heads, num_layers):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.layers = nn.ModuleList([
            KVCacheAttention(d_model, num_heads)
            for _ in range(num_layers)
        ])
        self.head = nn.Linear(d_model, vocab_size)
    
    def forward(self, x, kv_cache=None):
        x = self.embedding(x)
        for idx, layer in enumerate(self.layers):
            x = x + layer(x, kv_cache=kv_cache, layer_idx=idx)
        return self.head(x)

# 测试 | Test
vocab_size = 100
d_model = 64
num_heads = 4
num_layers = 2

model = SimpleDecoder(vocab_size, d_model, num_heads, num_layers)
prompt = torch.randint(0, vocab_size, (1, 5))

output = inference_with_kv_cache(model, prompt, max_new_tokens=5)
print(f"\nFinal output shape: {output.shape}")
```

---

## 16.3 KV Cache 的内存分析 | KV Cache Memory Analysis

### 中文解释

**KV Cache 的内存开销是巨大的：**

```
内存 = 2 (K+V) × num_layers × num_heads × seq_len × d_head × batch_size × sizeof(dtype)

示例：LLaMA-7B
- layers = 32
- heads = 32
- d_head = 128
- batch = 1
- seq_len = 4096
- dtype = float16 (2 bytes)

内存 = 2 × 32 × 32 × 4096 × 128 × 1 × 2 = 2,147,483,648 bytes ≈ 2 GB

对于 batch_size=32：64 GB！
```

### English Explanation

**KV Cache memory overhead is enormous:**

```
Memory = 2 (K+V) × num_layers × num_heads × seq_len × d_head × batch_size × sizeof(dtype)

Example: LLaMA-7B
- layers = 32
- heads = 32
- d_head = 128
- batch = 1
- seq_len = 4096
- dtype = float16 (2 bytes)

Memory = 2 × 32 × 32 × 4096 × 128 × 1 × 2 = 2,147,483,648 bytes ≈ 2 GB

For batch_size=32: 64 GB!
```

### 内存优化方向 | Memory Optimization Directions

| 技术 | 方法 | 效果 |
|------|------|------|
| Multi-Query Attention | 所有 head 共享 K/V | 减少 num_heads 倍 |
| Grouped Query Attention | K/V 分组共享 | 减少 num_heads/k 倍 |
| KV Cache 量化 | int8/int4 存储 | 减少 2~4 倍 |
| PagedAttention | 分页管理 | 减少碎片和重复 |

| Technique | Method | Effect |
|-----------|--------|--------|
| Multi-Query Attention | All heads share K/V | Reduce by num_heads |
| Grouped Query Attention | K/V shared in groups | Reduce by num_heads/k |
| KV Cache quantization | int8/int4 storage | Reduce by 2~4× |
| PagedAttention | Paged management | Reduce fragmentation and duplication |

---

## 16.4 PagedAttention 简介 | PagedAttention Introduction

### 中文解释

**PagedAttention = 操作系统分页思想应用于 KV Cache**

问题：
- 每个请求的序列长度不同
- 传统方法预分配最大长度，浪费大量内存
- 内存碎片严重

解决：
- 将 KV Cache 分成固定大小的 "块"（block）
- 按需分配块，不连续存储
- 类似虚拟内存分页

### English Explanation

**PagedAttention = Apply OS paging concepts to KV Cache**

Problems:
- Each request has different sequence length
- Traditional method pre-allocates maximum length, wasting memory
- Severe memory fragmentation

Solution:
- Divide KV Cache into fixed-size "blocks"
- Allocate blocks on demand, non-contiguous storage
- Similar to virtual memory paging

### 代码概念 | Code Concept

```python
# 传统方式 | Traditional way:
# 预分配 (max_seq_len, d_head) 的连续内存
# Pre-allocate contiguous memory of (max_seq_len, d_head)

# PagedAttention 方式 | PagedAttention way:
class PagedKVCache:
    """分页 KV Cache 概念 | Paged KV Cache concept"""
    
    def __init__(self, block_size, num_blocks):
        self.block_size = block_size
        self.num_blocks = num_blocks
        # 预分配所有 block | Pre-allocate all blocks
        self.blocks = [None] * num_blocks   # 每个 block 是实际存储 | Each block is actual storage
        self.block_table = {}   # 请求 ID → block 列表映射 | Request ID → block list mapping
    
    def allocate(self, request_id, num_tokens):
        """为请求分配 block | Allocate blocks for request"""
        num_blocks_needed = (num_tokens + self.block_size - 1) // self.block_size
        # 分配空闲 block | Allocate free blocks
        # ...
        self.block_table[request_id] = allocated_blocks
    
    def get_kv(self, request_id, position):
        """获取指定位置的 KV | Get KV at specified position"""
        block_idx = position // self.block_size
        offset = position % self.block_size
        block = self.block_table[request_id][block_idx]
        return block[offset]
```

---

## 16.5 vLLM 的核心思想 | Core Idea of vLLM

### 中文解释

**vLLM 的创新点：**

1. **PagedAttention**：解决内存碎片和重复
2. **Continuous Batching**：动态 batching，不等待慢请求
3. **调度优化**：优先处理快的请求

效果：
- 吞吐量提升 2-4 倍
- 支持更大的 batch size
- 支持更长的上下文

### English Explanation

**vLLM innovations:**

1. **PagedAttention**: Solves memory fragmentation and duplication
2. **Continuous Batching**: Dynamic batching, don't wait for slow requests
3. **Scheduling optimization**: Prioritize fast requests

Effects:
- Throughput improved by 2-4×
- Supports larger batch size
- Supports longer context

---

## 本章总结 | Chapter Summary

**中文：**
- KV Cache 是 Decoder-only 模型推理的必需优化
- 将每步的计算量从 O(seq²) 降到 O(seq)
- 内存开销巨大：长序列 × 多层 × 多头的积
- GQA 和量化是减少 KV Cache 内存的主要方法
- PagedAttention/vLLM 是现代推理系统的标配

**English:**
- KV Cache is an essential optimization for Decoder-only model inference
- Reduces per-step computation from O(seq²) to O(seq)
- Huge memory overhead: product of long sequence × many layers × many heads
- GQA and quantization are main methods to reduce KV Cache memory
- PagedAttention/vLLM is standard in modern inference systems

---

## 课后练习 | Homework

1. **KV Cache 实现**：在已有 Attention 基础上完整实现 KV Cache
2. **内存计算**：计算 LLaMA-7B/13B/70B 在不同 batch_size 和 seq_len 下的 KV Cache 内存
3. **有无对比**：实现同一个模型有/无 KV Cache 的推理，测量时间差异
4. **GQA 对比**：将标准 MHA 改为 GQA，比较内存节省比例
5. **思考题**：为什么 Encoder-only 模型（如 BERT）不需要 KV Cache？
