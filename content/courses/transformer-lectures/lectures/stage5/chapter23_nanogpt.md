# 第23章：nanoGPT — 读懂一个小 GPT | Chapter 23: nanoGPT — Reading a Small GPT

> **阶段定位** | **Stage**: 第五阶段 — 源码与魔改
> **预计学时** | **Duration**: 8~10 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 完整阅读并理解 nanoGPT 的代码
- 掌握从原始 Transformer 论文到可运行代码的映射
- 理解数据加载、训练循环、模型定义的组织方式
- 能够运行并修改 nanoGPT

**English:**
- Read and fully understand nanoGPT code
- Master mapping from original Transformer paper to runnable code
- Understand organization of data loading, training loop, model definition
- Be able to run and modify nanoGPT

---

## 23.1 nanoGPT 概览 | nanoGPT Overview

### 中文解释

**nanoGPT = Andrej Karpathy 写的最简 GPT 实现**

项目地址：https://github.com/karpathy/nanoGPT

特点：
- 代码极简（核心约 300 行）
- 纯 PyTorch，无抽象
- 可以直接训练莎士比亚文本
- 是理解 GPT 的最佳入口

### English Explanation

**nanoGPT = Andrej Karpathy's minimal GPT implementation**

Project: https://github.com/karpathy/nanoGPT

Features:
- Minimal code (core ~300 lines)
- Pure PyTorch, no abstractions
- Can directly train on Shakespeare text
- Best entry point for understanding GPT

---

## 23.2 核心模型代码解析 | Core Model Code Analysis

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn
from torch.nn import functional as F

class CausalSelfAttention(nn.Module):
    """nanoGPT 的因果自注意力 | nanoGPT's causal self-attention"""
    
    def __init__(self, config):
        super().__init__()
        assert config.n_embd % config.n_head == 0
        
        # Q/K/V 投影合并为一个线性层 | Q/K/V projections combined into one linear layer
        self.c_attn = nn.Linear(config.n_embd, 3 * config.n_embd)
        
        # 输出投影 | Output projection
        self.c_proj = nn.Linear(config.n_embd, config.n_embd)
        
        # Dropout
        self.attn_dropout = nn.Dropout(config.dropout)
        self.resid_dropout = nn.Dropout(config.dropout)
        
        self.n_head = config.n_head
        self.n_embd = config.n_embd
        
        # 注册因果掩码为 buffer | Register causal mask as buffer
        self.register_buffer("bias", torch.tril(torch.ones(config.block_size, config.block_size))
                             .view(1, 1, config.block_size, config.block_size))
    
    def forward(self, x):
        B, T, C = x.size()   # batch, seq_len, n_embd
        
        # 计算 Q/K/V | Compute Q/K/V
        q, k, v = self.c_attn(x).split(self.n_embd, dim=2)
        
        # 分头 | Split heads
        k = k.view(B, T, self.n_head, C // self.n_head).transpose(1, 2)   # (B, H, T, D)
        q = q.view(B, T, self.n_head, C // self.n_head).transpose(1, 2)
        v = v.view(B, T, self.n_head, C // self.n_head).transpose(1, 2)
        
        # Attention | Attention (使用 manual 实现，非 flash attention)
        att = (q @ k.transpose(-2, -1)) * (1.0 / torch.sqrt(torch.tensor(k.size(-1))))
        att = att.masked_fill(self.bias[:, :, :T, :T] == 0, float('-inf'))
        att = F.softmax(att, dim=-1)
        att = self.attn_dropout(att)
        y = att @ v   # (B, H, T, D)
        
        # 合并头并投影 | Combine heads and project
        y = y.transpose(1, 2).contiguous().view(B, T, C)
        y = self.resid_dropout(self.c_proj(y))
        
        return y

class MLP(nn.Module):
    """nanoGPT 的 FFN | nanoGPT's FFN"""
    
    def __init__(self, config):
        super().__init__()
        self.c_fc = nn.Linear(config.n_embd, 4 * config.n_embd)
        self.c_proj = nn.Linear(4 * config.n_embd, config.n_embd)
        self.dropout = nn.Dropout(config.dropout)
    
    def forward(self, x):
        x = self.c_fc(x)
        x = F.gelu(x)   # GELU 激活 | GELU activation
        x = self.c_proj(x)
        x = self.dropout(x)
        return x

class Block(nn.Module):
    """nanoGPT 的 Transformer Block | nanoGPT's Transformer Block"""
    
    def __init__(self, config):
        super().__init__()
        self.ln_1 = nn.LayerNorm(config.n_embd)
        self.attn = CausalSelfAttention(config)
        self.ln_2 = nn.LayerNorm(config.n_embd)
        self.mlp = MLP(config)
    
    def forward(self, x):
        # Pre-Norm + Residual
        x = x + self.attn(self.ln_1(x))
        x = x + self.mlp(self.ln_2(x))
        return x

class GPT(nn.Module):
    """完整 GPT 模型 | Complete GPT model"""
    
    def __init__(self, config):
        super().__init__()
        self.config = config
        
        self.transformer = nn.ModuleDict(dict(
            wte = nn.Embedding(config.vocab_size, config.n_embd),      # Token embedding
            wpe = nn.Embedding(config.block_size, config.n_embd),      # Position embedding
            drop = nn.Dropout(config.dropout),
            h = nn.ModuleList([Block(config) for _ in range(config.n_layer)]),
            ln_f = nn.LayerNorm(config.n_embd),
        ))
        self.lm_head = nn.Linear(config.n_embd, config.vocab_size, bias=False)
        
        # 权重共享 | Weight tying
        self.transformer.wte.weight = self.lm_head.weight
        
        self.apply(self._init_weights)
    
    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                torch.nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
    
    def forward(self, idx, targets=None):
        """
        idx: (B, T) — token indices
        targets: (B, T) — target tokens for loss
        """
        device = idx.device
        b, t = idx.size()
        
        # Embedding + Position
        tok_emb = self.transformer.wte(idx)
        pos = torch.arange(0, t, dtype=torch.long, device=device)
        pos_emb = self.transformer.wpe(pos)
        x = self.transformer.drop(tok_emb + pos_emb)
        
        # Transformer blocks
        for block in self.transformer.h:
            x = block(x)
        
        x = self.transformer.ln_f(x)
        logits = self.lm_head(x)
        
        # Loss
        loss = None
        if targets is not None:
            loss = F.cross_entropy(logits.view(-1, logits.size(-1)), targets.view(-1))
        
        return logits, loss

# GPTConfig 示例 | GPTConfig example
class GPTConfig:
    block_size = 1024    # 最大序列长度 | Max sequence length
    vocab_size = 50257   # GPT-2 vocab size
    n_layer = 12         # Transformer 层数 | Number of layers
    n_head = 12          # 注意力头数 | Number of attention heads
    n_embd = 768         # 嵌入维度 | Embedding dimension
    dropout = 0.1

print("nanoGPT 核心结构：| nanoGPT core structure:")
print("  1. CausalSelfAttention — 合并 QKV 投影")
print("     Combined QKV projection")
print("  2. MLP — 标准 FFN (GELU)")
print("     Standard FFN (GELU)")
print("  3. Block — Pre-Norm + Residual")
print("     Pre-Norm + Residual")
print("  4. GPT — Embedding + N×Block + LM Head")
print("     Embedding + N×Block + LM Head")
```

---

## 23.3 与论文公式的映射 | Mapping to Paper Formulas

| 论文符号 | nanoGPT 代码 | 含义 |
|----------|-------------|------|
| d_model | n_embd | 模型维度 |
| h | n_head | 头数 |
| d_k | n_embd // n_head | 每头维度 |
| W_Q, W_K, W_V | c_attn (合并) | QKV 投影 |
| W_O | c_proj | 输出投影 |
| FFN | c_fc + c_proj | 前馈网络 |

| Paper Symbol | nanoGPT Code | Meaning |
|-------------|--------------|---------|
| d_model | n_embd | Model dimension |
| h | n_head | Number of heads |
| d_k | n_embd // n_head | Dimension per head |
| W_Q, W_K, W_V | c_attn (combined) | QKV projections |
| W_O | c_proj | Output projection |
| FFN | c_fc + c_proj | Feed-forward network |

---

## 23.4 训练循环解析 | Training Loop Analysis

```python
# nanoGPT 的训练循环核心 | nanoGPT training loop core

# 1. 数据准备 | Data preparation
#    - 文本 → token IDs | Text → token IDs
#    - 切分为 block_size 的块 | Split into block_size chunks

# 2. 训练循环 | Training loop
for iter in range(max_iters):
    # 采样 batch | Sample batch
    xb, yb = get_batch('train')
    
    # 前向传播 | Forward
    logits, loss = model(xb, yb)
    
    # 反向传播 | Backward
    optimizer.zero_grad(set_to_none=True)
    loss.backward()
    optimizer.step()
    
    # 学习率衰减 | LR decay
    lr = get_lr(iter)
    for param_group in optimizer.param_groups:
        param_group['lr'] = lr
```

---

## 本章总结 | Chapter Summary

**中文：**
- nanoGPT 是理解 GPT 的最佳代码教材
- 核心约 300 行，覆盖完整 GPT 结构
- CausalSelfAttention + MLP + Block = Transformer Block
- 训练循环极简：forward + backward + step

**English:**
- nanoGPT is the best code textbook for understanding GPT
- Core is about 300 lines, covering complete GPT structure
- CausalSelfAttention + MLP + Block = Transformer Block
- Training loop is minimal: forward + backward + step

---

## 课后练习 | Homework

1. **代码阅读**：完整阅读 nanoGPT 的 train.py 和 model.py
2. **训练运行**：在莎士比亚数据集上训练 nanoGPT
3. **参数修改**：修改 n_layer/n_head/n_embd，观察训练速度和效果
4. **生成测试**：用训练好的模型生成文本，调整 temperature
5. **添加功能**：给 nanoGPT 添加学习率 warmup
