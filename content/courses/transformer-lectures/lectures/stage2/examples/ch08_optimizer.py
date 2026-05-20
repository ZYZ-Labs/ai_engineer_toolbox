"""
第8章案例：Optimizer 与训练动态
Chapter 8 Example: Optimizer and Training Dynamics

运行方式: python ch08_optimizer.py
"""

import torch
import torch.nn as nn
import matplotlib.pyplot as plt


def demo_different_optimizers():
    """不同优化器对比"""
    print("=" * 50)
    print("1. SGD vs Adam vs AdamW")
    print("=" * 50)

    # 目标函数: f(w) = (w - 5)^2
    def train_with_optimizer(optimizer_name, lr, steps=50):
        w = torch.tensor([0.0], requires_grad=True)

        if optimizer_name == "SGD":
            opt = torch.optim.SGD([w], lr=lr)
        elif optimizer_name == "Adam":
            opt = torch.optim.Adam([w], lr=lr)
        elif optimizer_name == "AdamW":
            opt = torch.optim.AdamW([w], lr=lr, weight_decay=0.01)

        losses = []
        for _ in range(steps):
            opt.zero_grad()
            loss = (w - 5) ** 2
            loss.backward()
            opt.step()
            losses.append(loss.item())
        return losses, w.item()

    for name, lr in [("SGD", 0.1), ("Adam", 0.1), ("AdamW", 0.1)]:
        losses, final_w = train_with_optimizer(name, lr)
        print(f"{name:6s}: final w={final_w:.3f}, final loss={losses[-1]:.6f}")


def demo_lr_effect():
    """学习率影响"""
    print("\n" + "=" * 50)
    print("2. 学习率影响")
    print("=" * 50)

    for lr in [0.01, 0.05, 0.1, 0.5, 1.0]:
        w = torch.tensor([0.0], requires_grad=True)
        opt = torch.optim.SGD([w], lr=lr)

        losses = []
        for _ in range(20):
            opt.zero_grad()
            loss = (w - 5) ** 2
            loss.backward()
            opt.step()
            losses.append(loss.item())

        status = "收敛 | converge" if losses[-1] < 1 else ("发散! | diverge!" if losses[-1] > 100 else "震荡 | oscillate")
        print(f"LR={lr:.2f}: {status}, final loss={losses[-1]:.4f}")


def demo_gradient_clipping():
    """梯度裁剪"""
    print("\n" + "=" * 50)
    print("3. 梯度裁剪")
    print("=" * 50)

    # 模拟梯度爆炸
    w = torch.tensor([1.0], requires_grad=True)
    opt = torch.optim.SGD([w], lr=0.1)

    # 故意制造大梯度
    loss = w * 1000
    loss.backward()
    print(f"裁剪前梯度 | Before clip: {w.grad.item():.1f}")

    torch.nn.utils.clip_grad_norm_([w], max_norm=10.0)
    print(f"裁剪后梯度 | After clip: {w.grad.item():.1f}")


if __name__ == "__main__":
    demo_different_optimizers()
    demo_lr_effect()
    demo_gradient_clipping()
