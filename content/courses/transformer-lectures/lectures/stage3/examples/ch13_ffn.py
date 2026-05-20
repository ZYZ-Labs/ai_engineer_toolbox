"""
第13章案例：FFN 与激活函数
Chapter 13 Example: FFN and Activation Functions

运行方式: python ch13_ffn.py
"""

import torch
import torch.nn as nn


def demo_activation_comparison():
    """激活函数对比"""
    print("=" * 50)
    print("1. ReLU vs GELU vs SiLU")
    print("=" * 50)

    relu = nn.ReLU()
    gelu = nn.GELU()
    silu = nn.SiLU()

    x = torch.linspace(-3, 3, 7)
    print(f"{'x':>6s} {'ReLU':>8s} {'GELU':>8s} {'SiLU':>8s}")
    print("-" * 35)
    for i in range(len(x)):
        print(f"{x[i].item():6.2f} {relu(x)[i].item():8.3f} {gelu(x)[i].item():8.3f} {silu(x)[i].item():8.3f}")


def demo_ffn_variants():
    """FFN 变体对比"""
    print("\n" + "=" * 50)
    print("2. FFN 参数量对比")
    print("=" * 50)

    class StandardFFN(nn.Module):
        def __init__(self, d_model):
            super().__init__()
            self.fc1 = nn.Linear(d_model, d_model * 4)
            self.fc2 = nn.Linear(d_model * 4, d_model)

        def forward(self, x):
            return self.fc2(torch.relu(self.fc1(x)))

    class SwiGLU(nn.Module):
        def __init__(self, d_model):
            super().__init__()
            d_ff = int(8 / 3 * d_model)
            self.gate = nn.Linear(d_model, d_ff, bias=False)
            self.up = nn.Linear(d_model, d_ff, bias=False)
            self.down = nn.Linear(d_ff, d_model, bias=False)

        def forward(self, x):
            return self.down(torch.nn.functional.silu(self.gate(x)) * self.up(x))

    d_model = 512
    for name, cls in [("Standard", StandardFFN), ("SwiGLU", SwiGLU)]:
        model = cls(d_model)
        params = sum(p.numel() for p in model.parameters())
        x = torch.randn(2, 10, d_model)
        out = model(x)
        print(f"{name:10s}: params={params:,}, output={out.shape}")


def demo_ffn_vs_attention_params():
    """FFN vs Attention 参数量对比"""
    print("\n" + "=" * 50)
    print("3. FFN vs Attention 参数量")
    print("=" * 50)

    d_model, num_heads = 768, 12
    attn = nn.MultiheadAttention(d_model, num_heads, batch_first=True)
    ffn = nn.Sequential(nn.Linear(d_model, d_model * 4), nn.GELU(), nn.Linear(d_model * 4, d_model))

    attn_p = sum(p.numel() for p in attn.parameters())
    ffn_p = sum(p.numel() for p in ffn.parameters())
    print(f"Attention: {attn_p:,}")
    print(f"FFN:       {ffn_p:,}")
    print(f"FFN/Attn:  {ffn_p / attn_p:.2f}x")


if __name__ == "__main__":
    demo_activation_comparison()
    demo_ffn_variants()
    demo_ffn_vs_attention_params()
