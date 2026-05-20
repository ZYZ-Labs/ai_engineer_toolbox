"""
第7章案例：Autograd 自动求导
Chapter 7 Example: Autograd Automatic Differentiation

运行方式: python ch07_autograd.py
"""

import torch


def demo_basic_grad():
    """基本梯度计算"""
    print("=" * 50)
    print("1. 基本梯度计算")
    print("=" * 50)

    # f(x) = x^2, x=3 -> df/dx = 2x = 6
    x = torch.tensor(3.0, requires_grad=True)
    y = x ** 2
    y.backward()
    print(f"f(x)=x^2, x={x.item()}, df/dx={x.grad.item()} (期望=6)")


def demo_multivariable():
    """多元函数梯度"""
    print("\n" + "=" * 50)
    print("2. 多元函数梯度")
    print("=" * 50)

    x = torch.tensor(3.0, requires_grad=True)
    y = torch.tensor(4.0, requires_grad=True)
    z = x ** 2 + 2 * y

    z.backward()
    print(f"f=x^2+2y, ∂f/∂x={x.grad.item()} (期望=6), ∂f/∂y={y.grad.item()} (期望=2)")


def demo_gradient_accumulation():
    """梯度累积与清零"""
    print("\n" + "=" * 50)
    print("3. 梯度累积与清零")
    print("=" * 50)

    x = torch.tensor(2.0, requires_grad=True)

    # 第一次 backward
    y = x ** 2
    y.backward()
    print(f"第1次 backward: grad={x.grad.item()}")

    # 第二次 backward (不清零) -> 累积!
    y2 = x ** 2
    y2.backward()
    print(f"第2次 backward (不清零): grad={x.grad.item()} (累积了!)")

    # 正确做法
    x.grad.zero_()
    y3 = x ** 2
    y3.backward()
    print(f"清零后再 backward: grad={x.grad.item()} (正确)")


def demo_computation_graph():
    """计算图可视化"""
    print("\n" + "=" * 50)
    print("4. 计算图追踪")
    print("=" * 50)

    x = torch.tensor(2.0, requires_grad=True)
    a = x * 2
    b = a + 3
    c = b ** 2
    d = c / 2

    print(f"x.grad_fn: {x.grad_fn} (叶子节点 | leaf)")
    print(f"a.grad_fn: {a.grad_fn}")
    print(f"b.grad_fn: {b.grad_fn}")
    print(f"c.grad_fn: {c.grad_fn}")
    print(f"d.grad_fn: {d.grad_fn}")

    d.backward()
    print(f"\nd/dx = {x.grad.item()}")
    # d = (2x+3)^2 / 2
    # dd/dx = (2x+3)*2 = 7*2 = 14


if __name__ == "__main__":
    demo_basic_grad()
    demo_multivariable()
    demo_gradient_accumulation()
    demo_computation_graph()
