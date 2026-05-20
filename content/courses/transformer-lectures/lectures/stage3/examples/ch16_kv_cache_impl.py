"""
第16章案例：KV Cache 完整实现
Chapter 16 Example: Complete KV Cache Implementation

运行方式: python ch16_kv_cache_impl.py
"""

import torch
import torch.nn as nn
import math


class KVCacheAttention(nn.Module):
    """带 KV Cache 的 Attention"""

    def __init__(self, d_model, num_heads):
        super().__init__()
        self.num_heads = num_heads
        self.d_head = d_model // num_heads
        self.qkv = nn.Linear(d_model, d_model * 3)
        self.out = nn.Linear(d_model, d_model)

    def forward(self, x, kv_cache=None):
        B, S, _ = x.shape
        qkv = self.qkv(x).view(B, S, 3, self.num_heads, self.d_head).permute(2, 0, 3, 1, 4)
        Q, K, V = qkv[0], qkv[1], qkv[2]

        if kv_cache is not None:
            past_K, past_V = kv_cache
            K = torch.cat([past_K, K], dim=2)
            V = torch.cat([past_V, V], dim=2)

        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_head)
        weights = torch.softmax(scores, dim=-1)
        out = torch.matmul(weights, V)
        out = out.transpose(1, 2).contiguous().view(B, S, -1)

        return self.out(out), (K, V)


def demo_kv_cache_memory():
    """KV Cache 内存计算"""
    print("=" * 50)
    print("1. KV Cache 内存占用")
    print("=" * 50)

    configs = [
        ("LLaMA-7B", 32, 32, 128, 4096),
        ("LLaMA-13B", 40, 40, 128, 4096),
        ("LLaMA-70B", 80, 8, 128, 4096),  # GQA
    ]

    for name, layers, heads, d_head, seq_len in configs:
        kv_per_token = 2 * layers * heads * d_head * 2 / 1024**3  # float16
        total = kv_per_token * seq_len
        print(f"{name:12s}: 每层 {kv_per_token*1024**3/seq_len/1024**2:.2f} MB/token, "
              f"seq={seq_len} 时总缓存={total:.2f} GB")


def demo_with_without_kv_cache():
    """有/无 KV Cache 对比"""
    print("\n" + "=" * 50)
    print("2. 有/无 KV Cache 计算量对比")
    print("=" * 50)

    seq_len = 4096
    d_model = 4096
    num_heads = 32

    # 无 KV Cache: 每步重新计算所有 K, V
    ops_no_cache = seq_len * d_model * 2  # K + V 投影
    print(f"无 KV Cache 每步计算: {ops_no_cache:,} ops")

    # 有 KV Cache: 只计算新的 K, V
    ops_with_cache = 1 * d_model * 2
    print(f"有 KV Cache 每步计算: {ops_with_cache:,} ops")

    print(f"加速比 | Speedup: {ops_no_cache / ops_with_cache:.0f}x")


def demo_gqa_memory_save():
    """GQA 内存节省"""
    print("\n" + "=" * 50)
    print("3. GQA 内存节省")
    print("=" * 50)

    layers, d_head, seq_len = 32, 128, 8192
    num_heads = 32

    for num_kv_groups in [32, 8, 4, 1]:
        kv_size = 2 * layers * (num_heads // num_kv_groups) * d_head * seq_len * 2 / 1024**3
        ratio = num_kv_groups / num_heads
        print(f"  {num_kv_groups:2d} KV groups: {kv_size:.2f} GB ({ratio*100:.0f}% of MHA)")


if __name__ == "__main__":
    demo_kv_cache_memory()
    demo_with_without_kv_cache()
    demo_gqa_memory_save()
