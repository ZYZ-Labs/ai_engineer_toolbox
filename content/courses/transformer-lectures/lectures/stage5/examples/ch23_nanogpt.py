"""
第23章案例：nanoGPT 风格模型
Chapter 23 Example: nanoGPT-style Model

运行方式: python ch23_nanogpt.py
"""

import torch
import torch.nn as nn
from torch.nn import functional as F


class CausalSelfAttention(nn.Module):
    """nanoGPT 风格的 Causal Self Attention"""

    def __init__(self, n_embd, n_head, block_size, dropout=0.1):
        super().__init__()
        assert n_embd % n_head == 0
        self.n_head = n_head
        self.n_embd = n_embd
        self.c_attn = nn.Linear(n_embd, 3 * n_embd)  # QKV 合并
        self.c_proj = nn.Linear(n_embd, n_embd)
        self.attn_dropout = nn.Dropout(dropout)
        self.resid_dropout = nn.Dropout(dropout)
        self.register_buffer("bias", torch.tril(torch.ones(block_size, block_size))
                             .view(1, 1, block_size, block_size))

    def forward(self, x):
        B, T, C = x.size()
        q, k, v = self.c_attn(x).split(self.n_embd, dim=2)
        k = k.view(B, T, self.n_head, C // self.n_head).transpose(1, 2)
        q = q.view(B, T, self.n_head, C // self.n_head).transpose(1, 2)
        v = v.view(B, T, self.n_head, C // self.n_head).transpose(1, 2)

        att = (q @ k.transpose(-2, -1)) * (1.0 / (k.size(-1) ** 0.5))
        att = att.masked_fill(self.bias[:, :, :T, :T] == 0, float("-inf"))
        att = F.softmax(att, dim=-1)
        att = self.attn_dropout(att)
        y = att @ v
        y = y.transpose(1, 2).contiguous().view(B, T, C)
        return self.resid_dropout(self.c_proj(y))


class GPT(nn.Module):
    """nanoGPT 风格 GPT"""

    def __init__(self, vocab_size, n_embd=768, n_head=12, n_layer=12, block_size=1024, dropout=0.1):
        super().__init__()
        self.block_size = block_size
        self.transformer = nn.ModuleDict(dict(
            wte=nn.Embedding(vocab_size, n_embd),
            wpe=nn.Embedding(block_size, n_embd),
            drop=nn.Dropout(dropout),
            h=nn.ModuleList([self._make_block(n_embd, n_head, block_size, dropout) for _ in range(n_layer)]),
            ln_f=nn.LayerNorm(n_embd),
        ))
        self.lm_head = nn.Linear(n_embd, vocab_size, bias=False)
        self.transformer.wte.weight = self.lm_head.weight  # 权重共享
        self.apply(self._init_weights)

    def _make_block(self, n_embd, n_head, block_size, dropout):
        return nn.ModuleDict({
            'ln_1': nn.LayerNorm(n_embd),
            'attn': CausalSelfAttention(n_embd, n_head, block_size, dropout),
            'ln_2': nn.LayerNorm(n_embd),
            'mlp': nn.Sequential(
                nn.Linear(n_embd, 4 * n_embd), nn.GELU(), nn.Linear(4 * n_embd, n_embd), nn.Dropout(dropout)
            ),
        })

    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                torch.nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)

    def forward(self, idx, targets=None):
        device = idx.device
        b, t = idx.size()
        tok_emb = self.transformer.wte(idx)
        pos_emb = self.transformer.wpe(torch.arange(t, device=device))
        x = self.transformer.drop(tok_emb + pos_emb)

        for block in self.transformer.h:
            x = x + block['attn'](block['ln_1'](x))
            x = x + block['mlp'](block['ln_2'](x))

        x = self.transformer.ln_f(x)
        logits = self.lm_head(x)

        loss = None
        if targets is not None:
            loss = F.cross_entropy(logits.view(-1, logits.size(-1)), targets.view(-1))
        return logits, loss


def demo_nanogpt():
    print("=" * 50)
    print("nanoGPT 风格模型")
    print("=" * 50)

    model = GPT(vocab_size=50257, n_embd=768, n_head=12, n_layer=12)
    x = torch.randint(0, 50257, (2, 128))

    logits, loss = model(x, x)  # 自回归训练目标
    total = sum(p.numel() for p in model.parameters())

    print(f"Input:  {x.shape}")
    print(f"Logits: {logits.shape}")
    print(f"Loss:   {loss.item():.4f}")
    print(f"Params: {total:,} ({total / 1e6:.1f}M)")


def demo_generation():
    """自回归生成"""
    print("\n" + "=" * 50)
    print("自回归生成")
    print("=" * 50)

    model = GPT(vocab_size=100, n_embd=64, n_head=4, n_layer=2, block_size=32)
    model.eval()

    idx = torch.randint(0, 100, (1, 5))
    print(f"起始 tokens: {idx[0].tolist()}")

    for _ in range(5):
        with torch.no_grad():
            logits, _ = model(idx)
            next_token = logits[:, -1, :].argmax(dim=-1, keepdim=True)
            idx = torch.cat([idx, next_token], dim=1)
            print(f"生成 token {next_token.item()}: 序列 -> {idx[0].tolist()}")


def demo_weight_sharing():
    """权重共享"""
    print("\n" + "=" * 50)
    print("权重共享 (Weight Tying)")
    print("=" * 50)

    model = GPT(vocab_size=1000, n_embd=128, n_head=4, n_layer=2)

    emb_weight = model.transformer.wte.weight
    head_weight = model.lm_head.weight

    print(f"Embedding weight: {emb_weight.shape}")
    print(f"LM Head weight:   {head_weight.shape}")
    print(f"共享同一内存? {emb_weight.data_ptr() == head_weight.data_ptr()}")


if __name__ == "__main__":
    demo_nanogpt()
    demo_generation()
    demo_weight_sharing()
