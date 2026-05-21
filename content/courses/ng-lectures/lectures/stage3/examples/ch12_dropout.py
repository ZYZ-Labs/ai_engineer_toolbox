"""
第12章：Dropout 正则化实现
Chapter 12: Dropout Regularization Implementation
"""
import numpy as np

def relu(z):
    return np.maximum(0, z)

np.random.seed(1)

# 单层前向传播 + Dropout
def forward_with_dropout(A_prev, W, b, keep_prob):
    Z = np.dot(W, A_prev) + b
    A = relu(Z)

    # Dropout 掩码
    D = (np.random.rand(*A.shape) < keep_prob).astype(float)
    A = A * D / keep_prob  # Inverted dropout

    cache = (Z, D, W)
    return A, cache

# 反向传播 + Dropout
def backward_with_dropout(dA, cache, keep_prob):
    Z, D, W = cache
    dA = dA * D / keep_prob  # 只传播未丢弃的神经元梯度
    dZ = dA * (Z > 0)
    A_prev = cache[0] if len(cache) > 3 else None  # simplified
    return dZ

# 测试
A_prev = np.random.randn(3, 5)
W = np.random.randn(4, 3)
b = np.zeros((4, 1))

A_out, cache = forward_with_dropout(A_prev, W, b, keep_prob=0.8)
print(f"Dropout (keep_prob=0.8):")
print(f"  原始激活均值: {np.mean(A_prev):.4f}")
print(f"  Dropout 后激活均值: {np.mean(A_out):.4f}")
print(f"  关闭的神经元比例: {1 - np.mean(cache[1]):.2%}")
print(f"  期望值保持不变（Inverted Dropout）")
