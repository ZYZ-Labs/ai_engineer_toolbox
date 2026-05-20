"""
第26章案例：修改 Attention
Chapter 26 Example: Modifying Attention

运行方式: python ch26_modify_attention.py
"""

import torch
import torch.nn as nn
import math


def demo_linear_attention():
    """Linear Attention"""
    print("=" * 50)
    print("1. Linear Attention")
    print("=" * 50)

    seq_len, dim = 100, 64
    Q = torch.randn(1, seq_len, dim)
    K = torch.randn(1, seq_len, dim)
    V = torch.randn(1, seq_len, dim)

    # 标准 Attention 计算量
    std_ops = seq_len * seq_len * dim
    print(f"标准 Attention: {std_ops:,} ops (O(seq^2 * d))")

    # Linear Attention 计算量
    lin_ops = seq_len * dim * dim
    print(f"Linear Attention: {lin_ops:,} ops (O(seq * d^2))")
    print(f"加速比 | Speedup: {std_ops / lin_ops:.1f}x (当 seq={seq_len}, d={dim})")

    # 特征映射
    def elu_feature_map(x):
        return nn.functional.elu(x) + 1

    q = elu_feature_map(Q)
    k = elu_feature_map(K)

    # Linear Attention 核心
    kv = torch.einsum("bnd,bne->bde", k[0], V[0])
    z = torch.einsum("bnd,bde->bne", q[0], kv.unsqueeze(0))
    print(f"Output shape: {z.shape}")


def demo_gqa():
    """Grouped Query Attention"""
    print("\n" + "=" * 50)
    print("2. Grouped Query Attention")
    print("=" * 50)

    batch, seq, d_model = 2, 128, 512
    num_heads = 8

    for num_kv_groups in [8, 4, 2, 1]:
        # KV Cache 大小
        kv_size = 2 * (num_heads // num_kv_groups) * d_model // num_heads * seq * batch * 2 / 1024**2
        print(f"  {num_kv_groups} KV groups: KV Cache = {kv_size:.2f} MB")


def demo_attention_replacement():
    """Attention 替换"""
    print("\n" + "=" * 50)
    print("3. Attention 模块替换")
    print("=" * 50)

    # 原始模型
    model = nn.TransformerEncoder(
        nn.TransformerEncoderLayer(d_model=64, nhead=4, dim_feedforward=256, batch_first=True),
        num_layers=2,
    )

    original_params = sum(p.numel() for p in model.parameters())
    print(f"Original model: {original_params:,} params")

    print("\n替换策略:")
    print("  1. 找到所有 nn.MultiheadAttention 模块")
    print("  2. 用自定义 Attention (GQA/Linear) 替换")
    print("  3. 复制兼容的权重")
    print("  4. 重新训练或微调")


if __name__ == "__main__":
    demo_linear_attention()
    demo_gqa()
    demo_attention_replacement()
