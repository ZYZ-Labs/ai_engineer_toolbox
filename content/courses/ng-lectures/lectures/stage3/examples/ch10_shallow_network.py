"""
第10章：浅层神经网络（NumPy 完整前向传播）
Chapter 10: Shallow Neural Network — Full Forward Propagation
"""
import numpy as np

def relu(z):
    return np.maximum(0, z)

def sigmoid(z):
    return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

# 参数初始化
np.random.seed(1)
n_x, n_h, n_y = 3, 4, 1
m = 5

W1 = np.random.randn(n_h, n_x) * 0.01
b1 = np.zeros((n_h, 1))
W2 = np.random.randn(n_y, n_h) * 0.01
b2 = np.zeros((n_y, 1))

X = np.random.randn(n_x, m)
Y = np.random.randint(0, 2, (1, m))

# 前向传播
Z1 = np.dot(W1, X) + b1
A1 = relu(Z1)
Z2 = np.dot(W2, A1) + b2
A2 = sigmoid(Z2)

# 损失计算
loss = -np.mean(Y * np.log(A2 + 1e-8) + (1-Y) * np.log(1 - A2 + 1e-8))

print("浅层神经网络前向传播:")
print(f"  X shape: {X.shape} (n_x={n_x}, m={m})")
print(f"  W1 shape: {W1.shape}, b1 shape: {b1.shape}")
print(f"  Z1/A1 shape: {A1.shape}")
print(f"  W2 shape: {W2.shape}, b2 shape: {b2.shape}")
print(f"  A2 shape: {A2.shape} (输出概率)")
print(f"  交叉熵损失: {loss:.4f}")

# 维度检查
print("\n维度验证:")
print(f"  W1: (n_h, n_x) = ({n_h}, {n_x}) ✓")
print(f"  W2: (n_y, n_h) = ({n_y}, {n_h}) ✓")
