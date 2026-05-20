# 第24章：minGPT — 更清晰的实现 | Chapter 24: minGPT — A Cleaner Implementation

> **阶段定位** | **Stage**: 第五阶段 — 源码与魔改
> **预计学时** | **Duration**: 6~8 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 阅读并理解 minGPT 的代码结构
- 对比 minGPT 和 nanoGPT 的实现差异
- 理解项目代码组织的重要性

**English:**
- Read and understand minGPT's code structure
- Compare implementation differences between minGPT and nanoGPT
- Understand importance of project code organization

---

## 24.1 minGPT 概览 | minGPT Overview

### 中文解释

**minGPT = Karpathy 的另一个教学级 GPT 实现**

项目地址：https://github.com/karpathy/minGPT

与 nanoGPT 的区别：
- minGPT 更强调**可读性**和**模块化**
- nanoGPT 更强调**性能**和**简洁**
- minGPT 包含更多教学注释

### English Explanation

**minGPT = Another educational GPT implementation by Karpathy**

Project: https://github.com/karpathy/minGPT

Differences from nanoGPT:
- minGPT emphasizes **readability** and **modularity**
- nanoGPT emphasizes **performance** and **simplicity**
- minGPT includes more educational comments

---

## 24.2 minGPT 的核心设计 | minGPT Core Design

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn
from torch.nn import functional as F

class CausalSelfAttention(nn.Module):
    """
    minGPT 的注意力实现 — 更清晰的命名 | minGPT attention — clearer naming
    """
    
    def __init__(self, config):
        super().__init__()
        assert config.n_embd % config.n_head == 0
        
        # key, query, value projections | key, query, value projections
        self.key = nn.Linear(config.n_embd, config.n_embd)
        self.query = nn.Linear(config.n_embd, config.n_embd)
        self.value = nn.Linear(config.n_embd, config.n_embd)
        
        # regularization
        self.attn_drop = nn.Dropout(config.attn_pdrop)
        self.resid_drop = nn.Dropout(config.resid_pdrop)
        
        # output projection
        self.proj = nn.Linear(config.n_embd, config.n_embd)
        
        # causal mask
        self.register_buffer("mask", torch.tril(torch.ones(config.block_size, config.block_size))
                             .view(1, 1, config.block_size, config.block_size))
        
        self.n_head = config.n_head
    
    def forward(self, x):
        B, T, C = x.size()
        
        # calculate query, key, values for all heads in batch
        k = self.key(x).view(B, T, self.n_head, C // self.n_head).transpose(1, 2)
        q = self.query(x).view(B, T, self.n_head, C // self.n_head).transpose(1, 2)
        v = self.value(x).view(B, T, self.n_head, C // self.n_head).transpose(1, 2)
        
        # causal self-attention
        att = (q @ k.transpose(-2, -1)) * (1.0 / torch.sqrt(torch.tensor(k.size(-1))))
        att = att.masked_fill(self.mask[:, :, :T, :T] == 0, float('-inf'))
        att = F.softmax(att, dim=-1)
        att = self.attn_drop(att)
        y = att @ v
        
        # re-assemble all head outputs side by side
        y = y.transpose(1, 2).contiguous().view(B, T, C)
        
        # output projection
        y = self.resid_drop(self.proj(y))
        return y

class Block(nn.Module):
    """minGPT 的 Block — 更明确的结构 | minGPT Block — clearer structure"""
    
    def __init__(self, config):
        super().__init__()
        self.ln1 = nn.LayerNorm(config.n_embd)
        self.ln2 = nn.LayerNorm(config.n_embd)
        self.attn = CausalSelfAttention(config)
        self.mlp = nn.Sequential(
            nn.Linear(config.n_embd, 4 * config.n_embd),
            nn.GELU(),
            nn.Linear(4 * config.n_embd, config.n_embd),
            nn.Dropout(config.resid_pdrop),
        )
    
    def forward(self, x):
        x = x + self.attn(self.ln1(x))
        x = x + self.mlp(self.ln2(x))
        return x

# minGPT 和 nanoGPT 的主要区别 | Main differences between minGPT and nanoGPT:
print("minGPT vs nanoGPT:")
print("  1. QKV 投影分开 vs 合并 | Separate vs combined QKV projection")
print("  2. 命名更清晰 | Clearer naming")
print("  3. 项目结构更模块化 | More modular project structure")
print("  4. 包含更多示例项目 | Includes more example projects")
```

---

## 24.3 项目结构对比 | Project Structure Comparison

```
nanoGPT/
  model.py      — 模型定义 | Model definition
  train.py      — 训练脚本 | Training script
  sample.py     — 采样脚本 | Sampling script
  data/         — 数据 | Data
  
minGPT/
  mingpt/       — 核心库 | Core library
    model.py    — 模型定义 | Model definition
    trainer.py  — 训练器 | Trainer
    utils.py    — 工具 | Utilities
  projects/     — 示例项目 | Example projects
    adder/      — 加法器 | Adder
    chargpt/    — 字符 GPT | Char GPT
  demo.ipynb    — Jupyter 演示 | Jupyter demo
```

---

## 本章总结 | Chapter Summary

**中文：**
- minGPT 和 nanoGPT 都是教学级实现
- minGPT 更注重可读性和模块化
- 两者核心算法完全相同，只是代码风格不同
- 建议两个都读，对比学习

**English:**
- Both minGPT and nanoGPT are educational implementations
- minGPT focuses more on readability and modularity
- Core algorithms are identical, only coding style differs
- Recommend reading both for comparative learning

---

## 课后练习 | Homework

1. **对比阅读**：同时阅读 nanoGPT 和 minGPT 的 attention 实现，列出差异
2. **模块迁移**：将 minGPT 的 trainer 模块集成到 nanoGPT 中
3. **adder 项目**：运行 minGPT 的 adder 项目，理解如何将 GPT 用于非文本任务
4. **代码重构**：用 minGPT 的风格重构 nanoGPT 的代码
