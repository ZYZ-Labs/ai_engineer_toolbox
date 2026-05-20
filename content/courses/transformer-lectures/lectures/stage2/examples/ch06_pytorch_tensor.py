"""
第6章案例：PyTorch Tensor 基础
Chapter 6 Example: PyTorch Tensor Basics

运行方式: python ch06_pytorch_tensor.py
"""

import torch


def demo_creation():
    print("=" * 50)
    print("1. PyTorch Tensor 创建")
    print("=" * 50)

    a = torch.tensor([1, 2, 3])
    b = torch.zeros(2, 3)
    c = torch.ones(3, 3)
    d = torch.randn(2, 3)
    e = torch.arange(0, 10, 2)

    print(f"tensor: {a}, shape={a.shape}, dtype={a.dtype}")
    print(f"zeros: {b.shape}")
    print(f"ones: {c.shape}")
    print(f"randn: {d.shape}, mean={d.mean():.3f}, std={d.std():.3f}")
    print(f"arange: {e}")


def demo_reshape():
    print("\n" + "=" * 50)
    print("2. 变形操作")
    print("=" * 50)

    x = torch.arange(24)
    print(f"原始: {x.shape}")
    print(f"view(4,6): {x.view(4, 6).shape}")
    print(f"view(2,3,4): {x.view(2, 3, 4).shape}")

    y = torch.randn(2, 3, 4)
    print(f"\npermute: {y.shape} -> {y.permute(2, 0, 1).shape}")
    print(f"unsqueeze: {x.shape} -> {x.unsqueeze(0).shape}")


def demo_device():
    print("\n" + "=" * 50)
    print("3. GPU/CPU 设备")
    print("=" * 50)

    print(f"CUDA available: {torch.cuda.is_available()}")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    x = torch.randn(3, 3)
    print(f"默认设备: {x.device}")

    x_gpu = x.to(device)
    print(f"移动后: {x_gpu.device}")


def demo_broadcast():
    print("\n" + "=" * 50)
    print("4. 广播机制")
    print("=" * 50)

    a = torch.tensor([[1, 2, 3], [4, 5, 6]])
    b = torch.tensor([10, 20, 30])
    print(f"(2,3) + (3) =\n{a + b}")

    c = torch.tensor([[10], [20]])
    print(f"(2,3) + (2,1) =\n{a + c}")


if __name__ == "__main__":
    demo_creation()
    demo_reshape()
    demo_device()
    demo_broadcast()
