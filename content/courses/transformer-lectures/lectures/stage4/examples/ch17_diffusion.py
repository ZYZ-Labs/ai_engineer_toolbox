"""
第17章案例：Diffusion 加噪与去噪
Chapter 17 Example: Diffusion Forward and Reverse

运行方式: python ch17_diffusion.py
"""

import torch
import numpy as np


def linear_beta_schedule(timesteps):
    return torch.linspace(1e-4, 0.02, timesteps)


def forward_diffusion(x_0, t, betas):
    """前向扩散 | Forward diffusion"""
    alphas = 1.0 - betas
    alphas_cumprod = torch.cumprod(alphas, dim=0)

    sqrt_alpha = torch.sqrt(alphas_cumprod[t])
    sqrt_one_minus = torch.sqrt(1.0 - alphas_cumprod[t])

    noise = torch.randn_like(x_0)
    x_t = sqrt_alpha.view(-1, 1) * x_0 + sqrt_one_minus.view(-1, 1) * noise
    return x_t, noise


def demo_forward_diffusion():
    """演示加噪过程"""
    print("=" * 50)
    print("1. Forward Diffusion (加噪)")
    print("=" * 50)

    timesteps = 1000
    betas = linear_beta_schedule(timesteps)

    # 模拟图片 (flattened)
    x_0 = torch.randn(4, 784)  # 4张 28x28 图片

    for t_val in [0, 250, 500, 750, 999]:
        t = torch.tensor([t_val] * 4)
        x_t, _ = forward_diffusion(x_0, t, betas)
        print(f"t={t_val:4d}: mean={x_t.mean():.3f}, std={x_t.std():.3f}")


def demo_noise_prediction():
    """噪声预测训练目标"""
    print("\n" + "=" * 50)
    print("2. Noise Prediction Loss")
    print("=" * 50)

    timesteps = 1000
    betas = linear_beta_schedule(timesteps)
    batch_size = 4

    # 模拟训练一步
    x_0 = torch.randn(batch_size, 784)
    t = torch.randint(0, timesteps, (batch_size,))

    x_t, true_noise = forward_diffusion(x_0, t, betas)

    # 模拟噪声预测网络 (用随机噪声代替)
    predicted_noise = torch.randn_like(true_noise)

    loss = torch.nn.functional.mse_loss(predicted_noise, true_noise)
    print(f"True noise:  mean={true_noise.mean():.3f}, std={true_noise.std():.3f}")
    print(f"Pred noise:  mean={predicted_noise.mean():.3f}, std={predicted_noise.std():.3f}")
    print(f"MSE Loss:    {loss.item():.4f}")


def demo_reverse_step():
    """单步去噪"""
    print("\n" + "=" * 50)
    print("3. Reverse Diffusion (单步去噪)")
    print("=" * 50)

    timesteps = 1000
    betas = linear_beta_schedule(timesteps)
    alphas = 1.0 - betas
    alphas_cumprod = torch.cumprod(alphas, dim=0)

    # 从纯噪声开始
    x_t = torch.randn(1, 784)

    # 假设最后一步 t=999
    t = 999
    # 假设网络预测噪声
    pred_noise = torch.randn(1, 784)

    # 计算 x_0 预测
    alpha_cumprod = alphas_cumprod[t]
    x_0_pred = (x_t - torch.sqrt(1 - alpha_cumprod) * pred_noise) / torch.sqrt(alpha_cumprod)

    print(f"x_t (噪声):   mean={x_t.mean():.3f}, std={x_t.std():.3f}")
    print(f"x_0 (预测):   mean={x_0_pred.mean():.3f}, std={x_0_pred.std():.3f}")


if __name__ == "__main__":
    demo_forward_diffusion()
    demo_noise_prediction()
    demo_reverse_step()
