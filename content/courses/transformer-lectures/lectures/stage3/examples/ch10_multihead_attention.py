"""
第10章案例：Multi-Head Attention 实现
Chapter 10 Example: Multi-Head Attention Implementation

运行方式: python ch10_multihead_attention.py
"""

import torch
import torch.nn as nn
import math


class MultiHeadAttention(nn.Module):
    """完整多头注意力"""

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

    def forward(self, x, mask=None):
        B, S, _ = x.shape

        # 投影
        Q = self.W_q(x).view(B, S, self.num_heads, self.d_head).transpose(1, 2)
        K = self.W_k(x).view(B, S, self.num_heads, self.d_head).transpose(1, 2)
        V = self.W_v(x).view(B, S, self.num_heads, self.d_head).transpose(1, 2)

        # Attention
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_head)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, float("-inf"))
        weights = torch.softmax(scores, dim=-1)
        attn = torch.matmul(weights, V)

        # 合并
        attn = attn.transpose(1, 2).contiguous().view(B, S, self.d_model)
        return self.W_o(attn), weights


def demo_mha_shape():
    print("=" * 50)
    print("1. Multi-Head Attention Shape 追踪")
    print("=" * 50)

    d_model, num_heads = 512, 8
    mha = MultiHeadAttention(d_model, num_heads)
    x = torch.randn(2, 10, d_model)

    out, weights = mha(x)
    print(f"Input:  {x.shape}")
    print(f"Output: {out.shape}")
    print(f"Weights: {weights.shape} (batch, heads, seq, seq)")


def demo_head_specialization():
    print("\n" + "=" * 50)
    print("2. 不同 head 的注意力模式")
    print("=" * 50)

    d_model, num_heads = 64, 4
    mha = MultiHeadAttention(d_model, num_heads)
    x = torch.randn(1, 8, d_model)

    out, weights = mha(x)
    for h in range(num_heads):
        # 计算每个 head 的注意力熵 (越集中熵越低)
        w = weights[0, h]
        entropy = -(w * torch.log(w + 1e-8)).sum(dim=-1).mean()
        print(f"  Head {h}: 平均注意力熵 = {entropy:.3f}")


def demo_gqa():
    print("\n" + "=" * 50)
    print("3. Grouped Query Attention (GQA)")
    print("=" * 50)

    class GQA(nn.Module):
        def __init__(self, d_model, num_heads, num_kv_groups):
            super().__init__()
            self.num_heads = num_heads
            self.num_kv_groups = num_kv_groups
            self.d_head = d_model // num_heads
            self.head_per_group = num_heads // num_kv_groups

            self.q_proj = nn.Linear(d_model, d_model)
            self.k_proj = nn.Linear(d_model, num_kv_groups * self.d_head)
            self.v_proj = nn.Linear(d_model, num_kv_groups * self.d_head)
            self.o_proj = nn.Linear(d_model, d_model)

        def forward(self, x):
            B, S, _ = x.shape
            Q = self.q_proj(x).view(B, S, self.num_heads, self.d_head).transpose(1, 2)
            K = self.k_proj(x).view(B, S, self.num_kv_groups, self.d_head)
            V = self.v_proj(x).view(B, S, self.num_kv_groups, self.d_head)

            # 扩展 K/V
            K = K.repeat_interleave(self.head_per_group, dim=2).transpose(1, 2)
            V = V.repeat_interleave(self.head_per_group, dim=2).transpose(1, 2)

            scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_head)
            weights = torch.softmax(scores, dim=-1)
            out = torch.matmul(weights, V)
            out = out.transpose(1, 2).contiguous().view(B, S, -1)
            return self.o_proj(out)

    d_model, num_heads = 512, 8
    for num_kv_groups in [8, 4, 2, 1]:
        gqa = GQA(d_model, num_heads, num_kv_groups)
        params = sum(p.numel() for p in gqa.parameters())
        mha_params = sum(p.numel() for p in MultiHeadAttention(d_model, num_heads).parameters())
        print(f"  GQA ({num_kv_groups} groups): {params:,} params ({params/mha_params*100:.1f}% of MHA)")


if __name__ == "__main__":
    demo_mha_shape()
    demo_head_specialization()
    demo_gqa()
