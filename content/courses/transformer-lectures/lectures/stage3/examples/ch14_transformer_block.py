"""
第14章案例：完整 Transformer Block 与 GPT
Chapter 14 Example: Complete Transformer Block and GPT

运行方式: python ch14_transformer_block.py
"""

import torch
import torch.nn as nn
import math


class TransformerBlock(nn.Module):
    """标准 Transformer Block (Pre-Norm)"""

    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super().__init__()
        self.norm1 = nn.LayerNorm(d_model)
        self.attn = nn.MultiheadAttention(d_model, num_heads, batch_first=True, dropout=dropout)
        self.norm2 = nn.LayerNorm(d_model)
        self.ffn = nn.Sequential(
            nn.Linear(d_model, d_ff), nn.GELU(), nn.Dropout(dropout), nn.Linear(d_ff, d_model)
        )
        self.dropout = nn.Dropout(dropout)

    def forward(self, x, mask=None):
        # Attention
        h, _ = self.attn(self.norm1(x), self.norm1(x), self.norm1(x), attn_mask=mask)
        x = x + self.dropout(h)
        # FFN
        x = x + self.dropout(self.ffn(self.norm2(x)))
        return x


class GPT(nn.Module):
    """简化 GPT 模型"""

    def __init__(self, vocab_size, d_model=768, num_heads=12, num_layers=12, max_len=512):
        super().__init__()
        self.token_emb = nn.Embedding(vocab_size, d_model)
        self.pos_emb = nn.Embedding(max_len, d_model)
        self.blocks = nn.ModuleList(
            [TransformerBlock(d_model, num_heads, d_model * 4) for _ in range(num_layers)]
        )
        self.norm = nn.LayerNorm(d_model)
        self.head = nn.Linear(d_model, vocab_size)
        self.head.weight = self.token_emb.weight  # 权重共享

    def forward(self, idx):
        B, T = idx.shape
        tok = self.token_emb(idx)
        pos = self.pos_emb(torch.arange(T, device=idx.device))
        x = tok + pos

        mask = torch.triu(torch.ones(T, T, device=idx.device) * float("-inf"), diagonal=1)
        for block in self.blocks:
            x = block(x, mask)

        return self.head(self.norm(x))


def demo_block():
    print("=" * 50)
    print("1. Transformer Block")
    print("=" * 50)

    block = TransformerBlock(d_model=512, num_heads=8, d_ff=2048)
    x = torch.randn(2, 10, 512)
    out = block(x)
    print(f"Input:  {x.shape}")
    print(f"Output: {out.shape}")


def demo_gpt():
    print("\n" + "=" * 50)
    print("2. GPT 模型")
    print("=" * 50)

    model = GPT(vocab_size=50257, d_model=768, num_layers=12)
    x = torch.randint(0, 50257, (2, 128))
    logits = model(x)

    total = sum(p.numel() for p in model.parameters())
    print(f"Input:  {x.shape}")
    print(f"Logits: {logits.shape}")
    print(f"Params: {total:,} ({total / 1e6:.1f}M)")


def demo_architectures():
    print("\n" + "=" * 50)
    print("3. 三种架构对比")
    print("=" * 50)

    print("Encoder-only (BERT):")
    print("  - 双向注意力 | Bidirectional attention")
    print("  - 无 mask")
    print("  - 用途：理解 | Usage: understanding")

    print("\nDecoder-only (GPT):")
    print("  - 因果注意力 | Causal attention")
    print("  - Causal mask")
    print("  - 用途：生成 | Usage: generation")

    print("\nEncoder-Decoder (T5):")
    print("  - Encoder 双向 | Encoder: bidirectional")
    print("  - Decoder 因果 | Decoder: causal")
    print("  - 用途：翻译 | Usage: translation")


if __name__ == "__main__":
    demo_block()
    demo_gpt()
    demo_architectures()
