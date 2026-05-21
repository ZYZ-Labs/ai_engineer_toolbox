"""
第5章：神经网络直觉 — NumPy 手写两层神经网络前向传播
Chapter 5: Neural Network Intuition — Forward Propagation from Scratch
"""
import numpy as np

def relu(z):
    return np.maximum(0, z)

def sigmoid(z):
    return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

# 网络结构: 2输入 -> 4隐藏(ReLU) -> 1输出(Sigmoid)
np.random.seed(42)
n_x, n_h, n_y = 2, 4, 1

W1 = np.random.randn(n_h, n_x) * 0.01
b1 = np.zeros((n_h, 1))
W2 = np.random.randn(n_y, n_h) * 0.01
b2 = np.zeros((n_y, 1))

# 单个样本前向传播
def forward(X):
    Z1 = W1 @ X + b1
    A1 = relu(Z1)
    Z2 = W2 @ A1 + b2
    A2 = sigmoid(Z2)
    return A2, {"Z1": Z1, "A1": A1, "Z2": Z2, "A2": A2}

# 测试
X_sample = np.array([[0.5], [0.3]])  # 2x1
prediction, cache = forward(X_sample)
print(f"输入: {X_sample.ravel()}")
print(f"隐藏层激活后: {cache['A1'].ravel()}")
print(f"输出 (概率): {prediction[0,0]:.4f}")

# 批处理前向 (m个样本)
m = 5
X_batch = np.random.randn(n_x, m)
Z1 = W1 @ X_batch + b1
A1 = relu(Z1)
Z2 = W2 @ A1 + b2
A2 = sigmoid(Z2)
print(f"\n批处理: 输入 shape {X_batch.shape} -> 输出 shape {A2.shape}")
print(f"输出概率: {A2.round(3)}")
