"""
第21章案例：CFG 分类器自由引导
Chapter 21 Example: CFG Classifier-Free Guidance

运行方式: python ch21_cfg.py
"""

import torch
import torch.nn as nn


def demo_cfg_formula():
    """CFG 公式演示"""
    print("=" * 50)
    print("1. CFG 公式")
    print("=" * 50)

    # 模拟噪声预测
    torch.manual_seed(42)
    eps_uncond = torch.randn(5)  # 无条件
    eps_cond = torch.randn(5)    # 有条件

    print(f"eps_uncond: {eps_uncond.round(3)}")
    print(f"eps_cond:   {eps_cond.round(3)}")

    for scale in [1.0, 3.0, 7.5, 15.0]:
        eps_cfg = eps_uncond + scale * (eps_cond - eps_uncond)
        print(f"\nscale={scale:4.1f}:")
        print(f"  eps_cfg = {eps_cfg.round(3)}")
        print(f"  与无条件距离 | dist from uncond: {(eps_cfg - eps_uncond).norm():.3f}")


def demo_cfg_on_distribution():
    """CFG 对概率分布的影响"""
    print("\n" + "=" * 50)
    print("2. CFG 对 Softmax 分布的影响")
    print("=" * 50)

    logits = torch.tensor([1.0, 2.0, 3.0, 4.0, 5.0])
    uncond = torch.tensor([2.0, 2.0, 2.0, 2.0, 2.0])  # 无条件更均匀

    for scale in [1.0, 3.0, 7.5]:
        cfg_logits = uncond + scale * (logits - uncond)
        probs = torch.softmax(cfg_logits, dim=-1)
        print(f"scale={scale:4.1f}: probs = {probs.round(4)}, max = {probs.max():.4f}")


def demo_training_dropout():
    """训练时条件丢弃"""
    print("\n" + "=" * 50)
    print("3. 训练时条件丢弃")
    print("=" * 50)

    batch_size = 8
    prompt_embeds = torch.randn(batch_size, 77, 768)

    # 10% 概率丢弃条件
    mask = torch.rand(batch_size) > 0.1
    context = prompt_embeds.clone()
    context[~mask] = 0  # 被丢弃的用空 embedding

    dropped = (~mask).sum().item()
    print(f"Batch size: {batch_size}")
    print(f"Dropped conditions: {dropped} ({dropped / batch_size * 100:.0f}%)")
    print(f"保留的 conditions: {mask.sum().item()}")


if __name__ == "__main__":
    demo_cfg_formula()
    demo_cfg_on_distribution()
    demo_training_dropout()
