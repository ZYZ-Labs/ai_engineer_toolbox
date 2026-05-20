"""
第12章案例：Residual + LayerNorm
Chapter 12 Example: Residual + LayerNorm

运行方式: python ch12_residual_layernorm.py
"""

import torch
import torch.nn as nn


def demo_residual_effect():
    """残差连接效果对比"""
    print("=" * 50)
    print("1. 残差连接 vs 无残差")
    print("=" * 50)

    class NoResidualBlock(nn.Module):
        def __init__(self, dim):
            super().__init__()
            self.net = nn.Sequential(nn.Linear(dim, dim), nn.ReLU(), nn.Linear(dim, dim))

        def forward(self, x):
            return self.net(x)

    class ResidualBlock(nn.Module):
        def __init__(self, dim):
            super().__init__()
            self.net = nn.Sequential(nn.Linear(dim, dim), nn.ReLU(), nn.Linear(dim, dim))

        def forward(self, x):
            return x + self.net(x)

    dim, depth = 64, 30
    x = torch.randn(1, dim, requires_grad=True)

    # 无残差
    model_no = nn.Sequential(*[NoResidualBlock(dim) for _ in range(depth)])
    out = model_no(x)
    out.sum().backward()
    grad_no = x.grad.norm().item()
    print(f"无残差 {depth} 层: 输入梯度范数 = {grad_no:.6f}")

    # 有残差
    x2 = torch.randn(1, dim, requires_grad=True)
    model_res = nn.Sequential(*[ResidualBlock(dim) for _ in range(depth)])
    out2 = model_res(x2)
    out2.sum().backward()
    grad_res = x2.grad.norm().item()
    print(f"有残差 {depth} 层: 输入梯度范数 = {grad_res:.4f}")


def demo_layernorm():
    """LayerNorm 演示"""
    print("\n" + "=" * 50)
    print("2. LayerNorm")
    print("=" * 50)

    ln = nn.LayerNorm(512)
    x = torch.randn(2, 10, 512)

    out = ln(x)
    print(f"Input mean/std: {x.mean(dim=-1)[0,0]:.3f}, {x.std(dim=-1)[0,0]:.3f}")
    print(f"Output mean/std: {out.mean(dim=-1)[0,0]:.6f}, {out.std(dim=-1)[0,0]:.3f}")

    # 手写验证
    mean = x.mean(dim=-1, keepdim=True)
    var = x.var(dim=-1, unbiased=False, keepdim=True)
    manual = (x - mean) / torch.sqrt(var + 1e-6)
    print(f"手写验证一致? {torch.allclose(out, manual, atol=1e-5)}")


def demo_prenorm_vs_postnorm():
    """Pre-Norm vs Post-Norm"""
    print("\n" + "=" * 50)
    print("3. Pre-Norm vs Post-Norm")
    print("=" * 50)

    class PreNormBlock(nn.Module):
        def __init__(self, dim):
            super().__init__()
            self.norm1 = nn.LayerNorm(dim)
            self.norm2 = nn.LayerNorm(dim)
            self.attn = nn.Linear(dim, dim)
            self.ffn = nn.Sequential(nn.Linear(dim, dim * 4), nn.GELU(), nn.Linear(dim * 4, dim))

        def forward(self, x):
            x = x + self.attn(self.norm1(x))
            x = x + self.ffn(self.norm2(x))
            return x

    class PostNormBlock(nn.Module):
        def __init__(self, dim):
            super().__init__()
            self.norm1 = nn.LayerNorm(dim)
            self.norm2 = nn.LayerNorm(dim)
            self.attn = nn.Linear(dim, dim)
            self.ffn = nn.Sequential(nn.Linear(dim, dim * 4), nn.GELU(), nn.Linear(dim * 4, dim))

        def forward(self, x):
            x = self.norm1(x + self.attn(x))
            x = self.norm2(x + self.ffn(x))
            return x

    dim, depth = 512, 32
    x_pre = torch.randn(2, 10, dim, requires_grad=True)
    x_post = torch.randn(2, 10, dim, requires_grad=True)

    model_pre = nn.Sequential(*[PreNormBlock(dim) for _ in range(depth)])
    model_post = nn.Sequential(*[PostNormBlock(dim) for _ in range(depth)])

    out_pre = model_pre(x_pre)
    out_pre.sum().backward()
    print(f"Pre-Norm  {depth} 层: 输入梯度 = {x_pre.grad.norm().item():.4f}")

    out_post = model_post(x_post)
    out_post.sum().backward()
    print(f"Post-Norm {depth} 层: 输入梯度 = {x_post.grad.norm().item():.4f}")


if __name__ == "__main__":
    demo_residual_effect()
    demo_layernorm()
    demo_prenorm_vs_postnorm()
