"""
第1章案例：NumPy Tensor 基础操作
Chapter 1 Example: NumPy Tensor Fundamental Operations

运行方式: python ch01_numpy_tensor.py
"""

import numpy as np


def demo_tensor_creation():
    """演示 Tensor 创建 | Demo Tensor creation"""
    print("=" * 50)
    print("1. Tensor 创建 | Tensor Creation")
    print("=" * 50)

    # 从列表创建
    a = np.array([1, 2, 3])
    print(f"一维向量 | 1D vector: {a}, shape={a.shape}")

    # 二维矩阵
    b = np.array([[1, 2, 3], [4, 5, 6]])
    print(f"二维矩阵 | 2D matrix:\n{b}, shape={b.shape}")

    # 特殊 Tensor
    zeros = np.zeros((2, 3))
    ones = np.ones((2, 3))
    rand = np.random.randn(2, 3)
    print(f"\nzeros:\n{zeros}")
    print(f"ones:\n{ones}")
    print(f"random (标准正态 | standard normal):\n{rand.round(3)}")


def demo_tensor_reshape():
    """演示 Tensor 变形 | Demo Tensor reshaping"""
    print("\n" + "=" * 50)
    print("2. Tensor 变形 | Tensor Reshaping")
    print("=" * 50)

    x = np.arange(24)
    print(f"原始 | Original: {x.shape} -> {x}")

    x2 = x.reshape(4, 6)
    print(f"reshape(4,6):\n{x2}")

    x3 = x.reshape(2, 3, 4)
    print(f"reshape(2,3,4): shape={x3.shape}")
    print(x3)

    # transpose
    x_t = x3.transpose(1, 0, 2)
    print(f"\ntranspose(1,0,2): shape {x3.shape} -> {x_t.shape}")

    # squeeze / unsqueeze
    y = np.array([[[1, 2, 3]]])
    print(f"\nsqueeze: {y.shape} -> {y.squeeze().shape}")

    z = np.array([1, 2, 3])
    z_u = z[np.newaxis, :]
    print(f"unsqueeze: {z.shape} -> {z_u.shape}")


def demo_broadcasting():
    """演示广播机制 | Demo broadcasting"""
    print("\n" + "=" * 50)
    print("3. 广播机制 | Broadcasting")
    print("=" * 50)

    # 标量广播
    a = np.array([[1, 2, 3], [4, 5, 6]])
    print(f"a + 10 =\n{a + 10}")

    # 向量广播
    b = np.array([10, 20, 30])
    print(f"\na + b =\n{a + b}")

    # 不同形状广播
    c = np.array([[10], [20]])  # (2, 1)
    print(f"\na + c = (2,3) + (2,1)\n{a + c}")

    # 典型 Transformer 场景
    scores = np.random.randn(2, 8, 4, 4)  # (batch, heads, seq, seq)
    mask = np.ones((1, 1, 4, 4)) * -1e9
    masked = scores + mask
    print(f"\nTransformer mask broadcast:")
    print(f"  scores: {scores.shape}")
    print(f"  mask: {mask.shape} -> broadcasted")
    print(f"  result: {masked.shape}")


def demo_math_operations():
    """演示数学运算 | Demo math operations"""
    print("\n" + "=" * 50)
    print("4. 数学运算 | Mathematical Operations")
    print("=" * 50)

    A = np.array([[1, 2], [3, 4]])
    B = np.array([[5, 6], [7, 8]])

    print(f"A =\n{A}")
    print(f"B =\n{B}")

    # 矩阵乘法
    C = A @ B
    print(f"\nA @ B =\n{C}")

    # 逐元素乘法
    D = A * B
    print(f"A * B (element-wise) =\n{D}")

    # 求和、均值
    print(f"\nA.sum() = {A.sum()}")
    print(f"A.mean() = {A.mean()}")
    print(f"A.sum(axis=0) = {A.sum(axis=0)}  (按列 | along columns)")
    print(f"A.sum(axis=1) = {A.sum(axis=1)}  (按行 | along rows)")

    # Softmax 预热
    scores = np.array([1.0, 2.0, 3.0])
    exp_scores = np.exp(scores - scores.max())
    softmax = exp_scores / exp_scores.sum()
    print(f"\nSoftmax of {scores}: {softmax.round(4)}")


def demo_spatial_intuition():
    """演示 Tensor 空间直觉 | Demo Tensor spatial intuition"""
    print("\n" + "=" * 50)
    print("5. Tensor 空间直觉 | Tensor Spatial Intuition")
    print("=" * 50)

    shapes = {
        "(32, 128, 768)": "batch=32, seq=128, hidden=768 (Transformer 输入 | input)",
        "(32, 8, 128, 64)": "batch=32, heads=8, seq=128, dim=64 (Multi-Head Attention)",
        "(50257, 768)": "vocab=50257, emb=768 (词嵌入矩阵 | embedding matrix)",
        "(1, 128)": "batch=1, seq=128 (单条推理 | single inference)",
    }

    for shape, meaning in shapes.items():
        print(f"  {shape:20s} -> {meaning}")

    # 实际模拟
    batch, seq, hidden = 2, 10, 512
    X = np.random.randn(batch, seq, hidden)
    print(f"\n模拟 Transformer 输入 | Simulated input:")
    print(f"  X shape: {X.shape}")
    print(f"  含义 | Meaning: {batch} 条序列，每条 {seq} 个 token，每个 {hidden} 维")


if __name__ == "__main__":
    demo_tensor_creation()
    demo_tensor_reshape()
    demo_broadcasting()
    demo_math_operations()
    demo_spatial_intuition()
