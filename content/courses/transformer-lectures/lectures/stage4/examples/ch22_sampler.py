"""
第22章案例：Diffusion Sampler
Chapter 22 Example: Diffusion Samplers

运行方式: python ch22_sampler.py
"""

import torch


def demo_euler_sampler():
    """Euler 采样器"""
    print("=" * 50)
    print("1. Euler Sampler")
    print("=" * 50)

    # 模拟简单采样过程
    timesteps = 50
    x = torch.randn(1, 784)

    print(f"从纯噪声开始 | Starting from pure noise: mean={x.mean():.3f}, std={x.std():.3f}")

    for i, t in enumerate(reversed(range(timesteps))):
        # 模拟去噪一步
        predicted_noise = torch.randn_like(x) * 0.5
        x = x - predicted_noise * 0.02
        if i % 10 == 0:
            print(f"  Step {i:2d} (t={t:2d}): mean={x.mean():.3f}, std={x.std():.3f}")

    print(f"最终 | Final: mean={x.mean():.3f}, std={x.std():.3f}")


def demo_ddim_vs_ddpm():
    """DDIM vs DDPM"""
    print("\n" + "=" * 50)
    print("2. DDIM vs DDPM")
    print("=" * 50)

    # DDPM: 每步都加随机噪声
    # DDIM: eta=0, 完全确定性
    # DDIM: eta=1, 等价于 DDPM

    for eta, name in [(0.0, "DDIM (deterministic)"), (1.0, "DDPM (stochastic)")]:
        x = torch.randn(1, 784)
        noise_trace = []
        for step in range(10):
            noise = torch.randn_like(x)
            x = x * 0.9 + noise * eta * 0.1
            noise_trace.append(noise.abs().mean().item())

        avg_noise = sum(noise_trace) / len(noise_trace)
        print(f"{name:25s}: avg injected noise = {avg_noise:.4f}")


def demo_step_quality_tradeoff():
    """步数与质量权衡"""
    print("\n" + "=" * 50)
    print("3. 步数与质量权衡")
    print("=" * 50)

    for steps in [5, 10, 20, 50, 100]:
        # 模拟：步数越多，去噪越精细
        quality = min(1.0, steps / 50.0 + 0.3)
        time_cost = steps / 100.0
        print(f"Steps={steps:3d}: estimated quality={quality:.2f}, time={time_cost:.2f}")


if __name__ == "__main__":
    demo_euler_sampler()
    demo_ddim_vs_ddpm()
    demo_step_quality_tradeoff()
