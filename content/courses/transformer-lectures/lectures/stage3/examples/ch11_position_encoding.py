"""
第11章案例：位置编码实现
Chapter 11 Example: Position Encoding Implementation

运行方式: python ch11_position_encoding.py
"""

import torch
import torch.nn as nn
import math


def sinusoidal_pe(seq_len, d_model):
    """Sinusoidal 位置编码"""
    pe = torch.zeros(seq_len, d_model)
    position = torch.arange(0, seq_len).unsqueeze(1).float()
    div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
    pe[:, 0::2] = torch.sin(position * div_term)
    pe[:, 1::2] = torch.cos(position * div_term)
    return pe


def demo_sinusoidal():
    print("=" * 50)
    print("1. Sinusoidal Position Encoding")
    print("=" * 50)

    pe = sinusoidal_pe(seq_len=10, d_model=16)
    print(f"PE shape: {pe.shape}")
    print(f"PE[0]: {pe[0].round(3)}")
    print(f"PE[1]: {pe[1].round(3)}")

    # 验证唯一性
    for i in range(1, 10):
        assert not torch.allclose(pe[0], pe[i]), f"位置 {i} 与位置 0 重复!"
    print("所有位置编码唯一 ✓")


def demo_rope():
    print("\n" + "=" * 50)
    print("2. RoPE (Rotary Position Embedding)")
    print("=" * 50)

    class RoPE(nn.Module):
        def __init__(self, d_head, max_len=512):
            super().__init__()
            inv_freq = 1.0 / (10000 ** (torch.arange(0, d_head, 2).float() / d_head))
            pos = torch.arange(max_len)
            angles = torch.einsum("i,j->ij", pos.float(), inv_freq)
            self.register_buffer("cos", torch.cos(angles))
            self.register_buffer("sin", torch.sin(angles))

        def forward(self, x, seq_len):
            x1 = x[..., ::2]
            x2 = x[..., 1::2]
            cos = self.cos[:seq_len]
            sin = self.sin[:seq_len]
            return torch.stack([x1 * cos - x2 * sin, x1 * sin + x2 * cos], dim=-1).flatten(-2)

    rope = RoPE(d_head=64)
    x = torch.randn(2, 8, 10, 64)
    x_rot = rope(x, seq_len=10)
    print(f"RoPE: {x.shape} -> {x_rot.shape}")

    # 验证模长不变
    print(f"旋转前模长 | Before norm: {x.norm(dim=-1).mean():.4f}")
    print(f"旋转后模长 | After norm: {x_rot.norm(dim=-1).mean():.4f}")


def demo_alibi():
    print("\n" + "=" * 50)
    print("3. ALiBi (Attention with Linear Biases)")
    print("=" * 50)

    def get_alibi_slopes(num_heads):
        closest = 2 ** (num_heads.bit_length() - 1)
        base = 2 ** (-(2 ** -(math.log2(closest) - 3)))
        slopes = []
        for i in range(1, num_heads + 1):
            if i <= closest:
                slopes.append(i * base)
            else:
                slopes.append(slopes[i - closest - 1] / 2)
        return torch.tensor(slopes)

    seq_len = 8
    num_heads = 4
    scores = torch.randn(1, num_heads, seq_len, seq_len)

    positions = torch.arange(seq_len)
    distance = (positions.unsqueeze(0) - positions.unsqueeze(1)).abs()
    slopes = get_alibi_slopes(num_heads).view(1, num_heads, 1, 1)
    bias = -slopes * distance.unsqueeze(0).unsqueeze(0)

    scores_alibi = scores + bias
    print(f"ALiBi bias shape: {bias.shape}")
    print(f"Original range: [{scores.min():.2f}, {scores.max():.2f}]")
    print(f"ALiBi range: [{scores_alibi.min():.2f}, {scores_alibi.max():.2f}]")


if __name__ == "__main__":
    demo_sinusoidal()
    demo_rope()
    demo_alibi()
