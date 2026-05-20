"""
第29章案例：推理系统优化
Chapter 29 Example: Inference System Optimization

运行方式: python ch29_inference.py
"""

import torch


def demo_kv_cache_size():
    """KV Cache 大小计算"""
    print("=" * 50)
    print("1. KV Cache 内存占用")
    print("=" * 50)

    configs = [
        ("LLaMA-7B", 32, 32, 128, 4096, 1),
        ("LLaMA-7B batch=32", 32, 32, 128, 4096, 32),
        ("LLaMA-70B (GQA)", 80, 8, 128, 4096, 1),
    ]

    for name, layers, kv_heads, d_head, seq, batch in configs:
        size = 2 * layers * kv_heads * d_head * seq * batch * 2 / 1024**3  # float16
        print(f"  {name:20s}: {size:6.2f} GB")


def demo_continuous_batching():
    """Continuous Batching"""
    print("\n" + "=" * 50)
    print("2. Continuous Batching")
    print("=" * 50)

    print("传统 Batching:")
    print("  等待所有请求完成 -> 下一批")
    print("  长请求阻塞短请求")

    print("\nContinuous Batching:")
    print("  请求完成一个 -> 立即加入新请求")
    print("  GPU 始终满载")
    print("  吞吐量提升 10-20x")

    # 模拟
    requests = [("短", 10), ("长", 50), ("短", 15), ("短", 12)]
    print(f"\n请求队列: {requests}")
    print("传统 batching: 等 50+15+10+12=87 steps")
    print("Continuous: 10 步后短请求完成，可加入新请求")


def demo_quantization():
    """量化对比"""
    print("\n" + "=" * 50)
    print("3. 量化对比")
    print("=" * 50)

    d_model = 4096
    params = d_model * d_model * 12  # 12 layers

    for dtype_name, bytes_per_param in [("FP32", 4), ("FP16", 2), ("INT8", 1), ("INT4", 0.5)]:
        memory = params * bytes_per_param / 1024**3
        print(f"  {dtype_name:6s}: {memory:6.2f} GB")


def demo_paged_attention_concept():
    """PagedAttention 概念"""
    print("\n" + "=" * 50)
    print("4. PagedAttention")
    print("=" * 50)

    block_size = 16
    seq_len = 100

    num_blocks = (seq_len + block_size - 1) // block_size
    waste = num_blocks * block_size - seq_len

    print(f"Sequence length: {seq_len}")
    print(f"Block size: {block_size}")
    print(f"Blocks used: {num_blocks}")
    print(f"Wasted tokens in last block: {waste}")
    print(f"Memory waste: {waste / (num_blocks * block_size) * 100:.1f}%")
    print("\n传统: 预分配 max_seq_len，浪费巨大")
    print("PagedAttention: 按需分配 block，减少浪费")


if __name__ == "__main__":
    demo_kv_cache_size()
    demo_continuous_batching()
    demo_quantization()
    demo_paged_attention_concept()
