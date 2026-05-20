# 第14章：Transformer Block — 拼完整 | Chapter 14: Transformer Block — Putting It All Together

> **阶段定位** | **Stage**: 第三阶段 — Transformer 核心
> **预计学时** | **Duration**: 6~8 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 将 Attention、FFN、Residual、LayerNorm 拼成一个完整的 Block
- 理解 Encoder-only、Decoder-only、Encoder-Decoder 三种架构
- 能手写完整的 Transformer Block
- 能够追踪数据在 Block 中的完整流动

**English:**
- Combine Attention, FFN, Residual, LayerNorm into a complete Block
- Understand Encoder-only, Decoder-only, Encoder-Decoder architectures
- Be able to write a complete Transformer Block by hand
- Be able to trace complete data flow through the Block

---

## 14.1 Transformer Block 的组成 | Transformer Block Components

### 中文解释

一个标准的 Transformer Block（Pre-Norm）：

```
输入 x
  ↓
[LayerNorm]
  ↓
[Multi-Head Attention]
  ↓
[Residual: x + Attention(...)]
  ↓
[LayerNorm]
  ↓
[FFN]
  ↓
[Residual: x + FFN(...)]
  ↓
输出 output
```

### English Explanation

A standard Transformer Block (Pre-Norm):

```
Input x
  ↓
[LayerNorm]
  ↓
[Multi-Head Attention]
  ↓
[Residual: x + Attention(...)]
  ↓
[LayerNorm]
  ↓
[FFN]
  ↓
[Residual: x + FFN(...)]
  ↓
Output output
```

---

## 14.2 完整 Block 实现 | Complete Block Implementation

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn
import math

class MultiHeadAttention(nn.Module):
    """复用第10章的实现 | Reuse Chapter 10 implementation"""
    
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
        
    def forward(self, Q, K, V, mask=None):
        batch_size = Q.size(0)
        
        # 投影和分头 | Project and split heads
        Q = self.W_q(Q).view(batch_size, -1, self.num_heads, self.d_head).transpose(1, 2)
        K = self.W_k(K).view(batch_size, -1, self.num_heads, self.d_head).transpose(1, 2)
        V = self.W_v(V).view(batch_size, -1, self.num_heads, self.d_head).transpose(1, 2)
        
        # Attention | Attention
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_head)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float('-inf'))
        weights = torch.softmax(scores, dim=-1)
        attn_out = torch.matmul(weights, V)
        
        # 合并头 | Combine heads
        attn_out = attn_out.transpose(1, 2).contiguous().view(batch_size, -1, self.d_model)
        return self.W_o(attn_out), weights

class TransformerBlock(nn.Module):
    """完整的 Transformer Block | Complete Transformer Block"""
    
    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super().__init__()
        
        # 1. 自注意力 | Self-attention
        self.attention = MultiHeadAttention(d_model, num_heads)
        
        # 2. FFN
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_ff),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(d_ff, d_model),
        )
        
        # 3. 归一化 | Normalization
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        
        # 4. Dropout
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x, mask=None):
        """
        x: (batch, seq, d_model)
        mask: (batch, 1, 1, seq) or (batch, 1, seq, seq)
        """
        # ---- 子层1: Attention + Residual ----
        # Pre-Norm: 先归一化，再计算 | Pre-Norm: normalize first, then compute
        attn_out, weights = self.attention(self.norm1(x), self.norm1(x), self.norm1(x), mask)
        x = x + self.dropout(attn_out)   # Residual + Dropout
        
        # ---- 子层2: FFN + Residual ----
        ffn_out = self.ffn(self.norm2(x))
        x = x + self.dropout(ffn_out)    # Residual + Dropout
        
        return x, weights

# ========== 测试 | Test ==========
batch = 2
seq = 10
d_model = 512
num_heads = 8
d_ff = 2048

block = TransformerBlock(d_model, num_heads, d_ff)
x = torch.randn(batch, seq, d_model)

output, attn_weights = block(x)

print(f"Input shape:  {x.shape}")
print(f"Output shape: {output.shape}")
print(f"Attention weights shape: {attn_weights.shape}")
```

---

## 14.3 三种 Transformer 架构 | Three Transformer Architectures

### Encoder-Only（BERT）| Encoder-Only (BERT)

```python
class EncoderOnlyTransformer(nn.Module):
    """Encoder-only: 双向注意力，用于理解 | Bidirectional attention, for understanding"""
    
    def __init__(self, vocab_size, d_model, num_heads, d_ff, num_layers):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.blocks = nn.ModuleList([
            TransformerBlock(d_model, num_heads, d_ff)
            for _ in range(num_layers)
        ])
        self.norm = nn.LayerNorm(d_model)
        
    def forward(self, x):
        """
        x: (batch, seq) — token IDs
        """
        x = self.embedding(x)
        
        for block in self.blocks:
            x, _ = block(x)   # 双向注意力，无需 mask | Bidirectional, no mask needed
        
        return self.norm(x)

# 特点：| Features:
# - 每个 token 可以看到所有其他 token
# - 用于：分类、填空、理解 | Classification, fill-in-blank, understanding
# - 代表：BERT, RoBERTa
```

### Decoder-Only（GPT）| Decoder-Only (GPT)

```python
def create_causal_mask(seq_len):
    """创建因果掩码（下三角矩阵）| Create causal mask (lower triangular matrix)"""
    mask = torch.tril(torch.ones(seq_len, seq_len))   # 下三角 | Lower triangular
    return mask.unsqueeze(0).unsqueeze(0)   # (1, 1, seq, seq)

class DecoderOnlyTransformer(nn.Module):
    """Decoder-only: 因果注意力，用于生成 | Causal attention, for generation"""
    
    def __init__(self, vocab_size, d_model, num_heads, d_ff, num_layers, max_seq_len=512):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.pos_embedding = nn.Embedding(max_seq_len, d_model)
        self.blocks = nn.ModuleList([
            TransformerBlock(d_model, num_heads, d_ff)
            for _ in range(num_layers)
        ])
        self.norm = nn.LayerNorm(d_model)
        self.lm_head = nn.Linear(d_model, vocab_size, bias=False)
        
    def forward(self, x):
        """
        x: (batch, seq) — token IDs
        """
        batch, seq = x.shape
        
        # Token embedding + Position embedding
        positions = torch.arange(seq, device=x.device)
        x = self.embedding(x) + self.pos_embedding(positions)
        
        # Causal mask | Causal mask
        mask = create_causal_mask(seq).to(x.device)
        
        for block in self.blocks:
            x, _ = block(x, mask)   # 带因果掩码 | With causal mask
        
        x = self.norm(x)
        logits = self.lm_head(x)    # (batch, seq, vocab_size)
        
        return logits

# 特点：| Features:
# - 每个 token 只能看到自己和之前的 token
# - 用于：文本生成 | Text generation
# - 代表：GPT, LLaMA, Qwen
```

### Encoder-Decoder（T5）| Encoder-Decoder (T5)

```python
class EncoderDecoderTransformer(nn.Module):
    """Encoder-Decoder: 编码器+解码器 | Encoder + Decoder"""
    
    def __init__(self, vocab_size, d_model, num_heads, d_ff, num_layers):
        super().__init__()
        self.encoder_embedding = nn.Embedding(vocab_size, d_model)
        self.decoder_embedding = nn.Embedding(vocab_size, d_model)
        
        self.encoder_blocks = nn.ModuleList([
            TransformerBlock(d_model, num_heads, d_ff)
            for _ in range(num_layers)
        ])
        self.decoder_blocks = nn.ModuleList([
            TransformerBlock(d_model, num_heads, d_ff)
            for _ in range(num_layers)
        ])
        
        self.lm_head = nn.Linear(d_model, vocab_size)
        
    def forward(self, src, tgt):
        """
        src: (batch, src_seq) — 源序列 | Source sequence
        tgt: (batch, tgt_seq) — 目标序列 | Target sequence
        """
        # Encoder | Encoder
        src_emb = self.encoder_embedding(src)
        for block in self.encoder_blocks:
            src_emb, _ = block(src_emb)
        
        # Decoder | Decoder
        tgt_emb = self.decoder_embedding(tgt)
        tgt_mask = create_causal_mask(tgt.size(1)).to(tgt.device)
        
        for block in self.decoder_blocks:
            # Decoder 有 Cross-Attention（这里简化了）
            tgt_emb, _ = block(tgt_emb, tgt_mask)
        
        return self.lm_head(tgt_emb)

# 特点：| Features:
# - Encoder: 双向理解源序列 | Bidirectional understanding of source
# - Decoder: 自回归生成目标序列 | Autoregressive generation of target
# - 用于：翻译、摘要 | Translation, summarization
# - 代表：T5, BART, original Transformer
```

---

## 14.4 架构对比总结 | Architecture Comparison

| 特性 | Encoder-Only | Decoder-Only | Encoder-Decoder |
|------|-------------|--------------|-----------------|
| 注意力方向 | 双向 | 单向（因果）| Encoder双向 Decoder因果 |
| 主要用途 | 理解 | 生成 | 翻译/转换 |
| 代表模型 | BERT | GPT, LLaMA | T5 |
| Mask | 无 | Causal Mask | Encoder无 Decoder因果 |
| 预训练任务 | MLM | Next Token Prediction | Span Corruption |

| Feature | Encoder-Only | Decoder-Only | Encoder-Decoder |
|---------|-------------|--------------|-----------------|
| Attention direction | Bidirectional | Unidirectional (causal) | Enc: bidirectional, Dec: causal |
| Primary use | Understanding | Generation | Translation/Transformation |
| Representative models | BERT | GPT, LLaMA | T5 |
| Mask | None | Causal Mask | Enc: none, Dec: causal |
| Pretraining task | MLM | Next Token Prediction | Span Corruption |

---

## 14.5 完整 GPT 风格模型 | Complete GPT-Style Model

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

class GPTModel(nn.Module):
    """简化版 GPT 模型 | Simplified GPT model"""
    
    def __init__(self, vocab_size, d_model=768, num_heads=12, 
                 d_ff=3072, num_layers=12, max_seq_len=512, dropout=0.1):
        super().__init__()
        
        self.vocab_size = vocab_size
        self.d_model = d_model
        
        # Embedding
        self.token_embedding = nn.Embedding(vocab_size, d_model)
        self.position_embedding = nn.Embedding(max_seq_len, d_model)
        self.dropout = nn.Dropout(dropout)
        
        # Transformer Blocks
        self.blocks = nn.ModuleList([
            TransformerBlock(d_model, num_heads, d_ff, dropout)
            for _ in range(num_layers)
        ])
        
        # Final norm + LM head
        self.norm = nn.LayerNorm(d_model)
        self.lm_head = nn.Linear(d_model, vocab_size, bias=False)
        
        # 权重共享（可选但常用）| Weight sharing (optional but common)
        self.lm_head.weight = self.token_embedding.weight
        
        self.apply(self._init_weights)
    
    def _init_weights(self, module):
        """初始化 | Initialization"""
        if isinstance(module, nn.Linear):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                torch.nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
    
    def forward(self, idx):
        """
        idx: (batch, seq) — token indices
        返回 logits: (batch, seq, vocab_size)
        """
        batch, seq = idx.shape
        
        # 位置编码 | Position encoding
        pos = torch.arange(0, seq, dtype=torch.long, device=idx.device)
        
        # Embedding | Embedding
        tok_emb = self.token_embedding(idx)       # (B, S, D)
        pos_emb = self.position_embedding(pos)     # (S, D)
        x = self.dropout(tok_emb + pos_emb)        # (B, S, D)
        
        # Causal mask | Causal mask
        mask = torch.tril(torch.ones(seq, seq, device=idx.device))
        mask = mask.unsqueeze(0).unsqueeze(0)      # (1, 1, S, S)
        
        # Transformer blocks
        for block in self.blocks:
            x, _ = block(x, mask)
        
        # Final projection | Final projection
        x = self.norm(x)
        logits = self.lm_head(x)   # (B, S, vocab_size)
        
        return logits
    
    @torch.no_grad()
    def generate(self, idx, max_new_tokens, temperature=1.0):
        """
        自回归生成 | Autoregressive generation
        idx: (batch, seq) — 起始 token
        """
        self.eval()
        
        for _ in range(max_new_tokens):
            # 只取最后 max_seq_len 个 token | Only take last max_seq_len tokens
            idx_cond = idx[:, -512:]
            
            # 前向传播 | Forward
            logits = self(idx_cond)
            
            # 只关注最后一个位置 | Focus on last position only
            logits = logits[:, -1, :] / temperature   # (batch, vocab_size)
            
            # 采样 | Sample
            probs = torch.softmax(logits, dim=-1)
            idx_next = torch.multinomial(probs, num_samples=1)   # (batch, 1)
            
            # 拼接 | Concatenate
            idx = torch.cat([idx, idx_next], dim=1)
        
        return idx

# 测试 | Test
vocab_size = 50257
model = GPTModel(vocab_size, d_model=768, num_layers=12)

# 统计参数量 | Count parameters
total_params = sum(p.numel() for p in model.parameters())
print(f"Total parameters: {total_params:,}")
print(f"≈ {total_params / 1e6:.1f}M")

# 测试生成 | Test generation
input_ids = torch.randint(0, vocab_size, (1, 10))
output = model(input_ids)
print(f"\nOutput logits shape: {output.shape}")
```

---

## 本章总结 | Chapter Summary

**中文：**
- Transformer Block = Attention + FFN + Residual × 2 + LayerNorm × 2
- 三种架构：Encoder-only（理解）、Decoder-only（生成）、Encoder-Decoder（翻译）
- 现代大模型（GPT, LLaMA）都是 Decoder-only
- Causal Mask 是 Decoder-only 的核心
- 完整的 GPT 模型 ≈ Embedding + N×Block + LM Head

**English:**
- Transformer Block = Attention + FFN + Residual × 2 + LayerNorm × 2
- Three architectures: Encoder-only (understanding), Decoder-only (generation), Encoder-Decoder (translation)
- Modern LLMs (GPT, LLaMA) are all Decoder-only
- Causal Mask is the core of Decoder-only
- Complete GPT model ≈ Embedding + N×Block + LM Head

---

## 课后练习 | Homework

1. **Block 实现**：不看示例，独立手写一个完整的 TransformerBlock
2. **架构对比**：实现 Encoder-only 和 Decoder-only 两种架构，比较它们的 attention mask
3. **GPT 训练**：用一个小数据集（如莎士比亚文本）训练一个小 GPT
4. **生成测试**：实现 greedy decoding 和 temperature sampling 两种生成策略
5. **参数量分析**：计算 GPT-2 small（124M）各部分的参数量占比
