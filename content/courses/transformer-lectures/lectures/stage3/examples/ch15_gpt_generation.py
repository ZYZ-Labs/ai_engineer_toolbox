"""
第15章案例：GPT 自回归生成
Chapter 15 Example: GPT Autoregressive Generation

运行方式: python ch15_gpt_generation.py
"""

import torch
import torch.nn as nn


def create_causal_mask(seq_len):
    return torch.triu(torch.ones(seq_len, seq_len) * float("-inf"), diagonal=1)


def demo_causal_mask():
    """因果掩码可视化"""
    print("=" * 50)
    print("1. Causal Mask")
    print("=" * 50)

    mask = create_causal_mask(8)
    print(mask)
    print("\n含义: 上三角为 -inf (不可见), 下三角为 0 (可见)")


def demo_generation_strategies():
    """不同生成策略"""
    print("\n" + "=" * 50)
    print("2. 生成策略对比")
    print("=" * 50)

    # 模拟 logits
    torch.manual_seed(42)
    logits = torch.randn(5)

    # Greedy
    greedy = torch.argmax(logits)
    print(f"Logits: {logits.round(3)}")
    print(f"Greedy: 选第 {greedy.item()} 个 (最大)")

    # Temperature sampling
    for T in [0.5, 1.0, 2.0]:
        probs = torch.softmax(logits / T, dim=-1)
        print(f"Temperature={T}: probs = {probs.round(3)}")

    # Top-k
    k = 3
    top_k_logits, top_k_idx = torch.topk(logits, k)
    print(f"\nTop-{k}: indices = {top_k_idx.tolist()}, logits = {top_k_logits.round(3)}")


def demo_kv_cache():
    """KV Cache 演示"""
    print("\n" + "=" * 50)
    print("3. KV Cache 原理")
    print("=" * 50)

    # 模拟推理过程
    seq_len = 8
    dim = 64
    kv_cache = torch.zeros(seq_len, dim)

    print("逐步生成 token，KV Cache 增长:")
    for step in range(seq_len):
        # 新 token 的 K
        new_k = torch.randn(dim)
        kv_cache[step] = new_k
        print(f"  Step {step}: KV Cache 使用了 {step + 1} / {seq_len} 位置")

    print(f"\n最终 KV Cache: {kv_cache.shape}")
    print(f"无 KV Cache 时，Step {seq_len - 1} 需要计算 {seq_len} 个 K")
    print(f"有 KV Cache 时，Step {seq_len - 1} 只需计算 1 个新 K")


def demo_next_token_prediction():
    """Next Token Prediction Loss"""
    print("\n" + "=" * 50)
    print("4. Next Token Prediction")
    print("=" * 50)

    vocab_size = 100
    seq_len = 10

    # 模拟模型输出
    logits = torch.randn(1, seq_len, vocab_size)
    input_ids = torch.randint(0, vocab_size, (1, seq_len))

    # 目标: input_ids 右移一位
    targets = input_ids[:, 1:]
    pred_logits = logits[:, :-1, :]

    loss = nn.functional.cross_entropy(pred_logits.reshape(-1, vocab_size), targets.reshape(-1))
    print(f"Logits: {logits.shape}")
    print(f"Targets: {targets.shape} (input_ids 右移 | shifted right)")
    print(f"CrossEntropy Loss: {loss.item():.4f}")


if __name__ == "__main__":
    demo_causal_mask()
    demo_generation_strategies()
    demo_kv_cache()
    demo_next_token_prediction()
