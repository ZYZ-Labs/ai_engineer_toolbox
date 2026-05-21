"""
第14章：Batch Normalization 前向传播实现
Chapter 14: Batch Normalization Forward Pass
"""
import numpy as np

def batchnorm_forward(X, gamma, beta, eps=1e-8):
    """
    X: 输入 (n_features, m_samples)
    gamma, beta: 可学习参数
    """
    m = X.shape[1]

    # 1. 计算均值和方差
    mu = np.mean(X, axis=1, keepdims=True)
    var = np.var(X, axis=1, keepdims=True)

    # 2. 归一化
    X_norm = (X - mu) / np.sqrt(var + eps)

    # 3. 缩放和平移
    out = gamma * X_norm + beta

    cache = (X, X_norm, mu, var, gamma, eps)
    return out, cache

# 测试
np.random.seed(2)
n, m = 4, 16
X = np.random.randn(n, m)
gamma = np.ones((n, 1))
beta = np.zeros((n, 1))

out, cache = batchnorm_forward(X, gamma, beta)
print(f"输入 X 均值范围: [{np.mean(X, axis=1).min():.3f}, {np.mean(X, axis=1).max():.3f}]")
print(f"输入 X 方差范围: [{np.var(X, axis=1).min():.3f}, {np.var(X, axis=1).max():.3f}]")
print(f"BatchNorm 后均值: ~{np.mean(out):.6f} (≈0)")
print(f"BatchNorm 后方差: ~{np.var(out):.4f} (≈1)")

# 使用不同的 gamma/beta
gamma2 = np.array([[2], [0.5], [1], [3]])
beta2 = np.array([[1], [-1], [0], [2]])
out2, _ = batchnorm_forward(X, gamma2, beta2)
print(f"\n自定义 gamma/beta 后均值: {np.mean(out2, axis=1).ravel().round(3)}")
print(f"自定义 gamma/beta 后方差: {np.var(out2, axis=1).ravel().round(3)}")
