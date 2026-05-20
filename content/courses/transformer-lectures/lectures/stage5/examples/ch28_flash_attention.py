"""
第28章案例：FlashAttention 原理
Chapter 28 Example: FlashAttention Principles

运行方式: python ch28_flash_attention.py
注意: 需要 GPU 环境才能使用 flash-attn 库
"""

import torch


def demo_online_softmax():
    """Online Softmax"""
    print("=" * 50)
    print("1. Online Softmax")
    print("=" * 50)

    def online_softmax(values):
        m = float('-inf')  # running max
        l = 0.0            # running sum
        for v in values:
            m_new = max(m, v)
            l = l * (2.718 ** (m - m_new)) + (2.718 ** (v - m_new))
            m = m_new
        return m, l

    x = [1.0, 3.0, 2.0]
    m, l = online_softmax(x)
    result = [2.718 ** (v - m) / l for v in x]

    # 标准 softmax 验证
    import math
    std = [math.exp(v) / sum(math.exp(vi) for vi in x) for v in x]

    print(f"Input: {x}")
    print(f"Online:  {result}")
    print(f"Standard: {std}")
    print(f"Match: {all(abs(a - b) < 1e-5 for a, b in zip(result, std))}")


def demo_tiling_concept():
    """Tiling 概念"""
    print("\n" + "=" * 50)
    print("2. Tiling 概念")
    print("=" * 50)

    seq_len = 4096
    block_size = 128
    num_blocks = seq_len // block_size

    print(f"Sequence: {seq_len}")
    print(f"Block size: {block_size}")
    print(f"Number of blocks: {num_blocks}")

    # 标准 Attention 内存
    std_memory = seq_len * seq_len * 4 / 1024**2
    print(f"\n标准 Attention 中间矩阵: {std_memory:.1f} MB")

    # FlashAttention 内存
    flash_memory = block_size * block_size * 4 / 1024**2
    print(f"FlashAttention 块内矩阵: {flash_memory:.2f} MB")
    print(f"内存减少: {std_memory / flash_memory:.0f}x")


def demo_speedup():
    """速度对比"""
    print("\n" + "=" * 50)
    print("3. FlashAttention 加速效果")
    print("=" * 50)

    seq_lens = [512, 1024, 2048, 4096, 8192]
    for seq in seq_lens:
        # 标准 Attention FLOPs
        std_flops = 2 * seq * seq * 64  # 假设 head_dim=64
        # FlashAttention FLOPs 相同，但 HBM 访问大幅减少
        # 实际加速主要来自减少 HBM 访问
        speedup = seq / 64  # 近似加速比
        print(f"  seq={seq:5d}: 标准 HBM 访问={seq*seq:,}, Flash 块大小=64x64, 加速~{speedup:.1f}x")


def demo_flash_attn_api():
    """FlashAttention API"""
    print("\n" + "=" * 50)
    print("4. FlashAttention API (需要 GPU)")
    print("=" * 50)

    try:
        from flash_attn import flash_attn_func
        print("flash-attn 已安装 | flash-attn installed")

        if torch.cuda.is_available():
            q = torch.randn(2, 512, 8, 64, device='cuda', dtype=torch.float16)
            k = torch.randn(2, 512, 8, 64, device='cuda', dtype=torch.float16)
            v = torch.randn(2, 512, 8, 64, device='cuda', dtype=torch.float16)
            out = flash_attn_func(q, k, v, causal=True)
            print(f"FlashAttention output: {out.shape}")
        else:
            print("无 GPU 可用")

    except ImportError:
        print("flash-attn 未安装")
        print("安装: pip install flash-attn --no-build-isolation")


if __name__ == "__main__":
    demo_online_softmax()
    demo_tiling_concept()
    demo_speedup()
    demo_flash_attn_api()
