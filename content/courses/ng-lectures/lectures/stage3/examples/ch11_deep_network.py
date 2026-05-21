"""
第11章：深层神经网络 — L层网络的前向与反向传播
Chapter 11: Deep Neural Network — L-Layer Forward & Backward Prop
"""
import numpy as np

def relu(z):
    return np.maximum(0, z)

def relu_derivative(z):
    return (z > 0).astype(float)

def sigmoid(z):
    return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

np.random.seed(3)

# 网络结构: [5, 4, 3, 1] -> 3 hidden layers
layer_dims = [5, 4, 3, 1]
L = len(layer_dims) - 1
m = 2

# 初始化参数
parameters = {}
for l in range(1, L+1):
    parameters[f'W{l}'] = np.random.randn(layer_dims[l], layer_dims[l-1]) * 0.01
    parameters[f'b{l}'] = np.zeros((layer_dims[l], 1))

X = np.random.randn(layer_dims[0], m)
Y = np.array([[1, 0]])

# 前向传播
caches = []
A = X
for l in range(1, L+1):
    W = parameters[f'W{l}']
    b = parameters[f'b{l}']
    Z = np.dot(W, A) + b
    A_prev = A
    A = relu(Z) if l < L else sigmoid(Z)
    caches.append((A_prev, W, b, Z))

# 反向传播
dA = - (np.divide(Y, A + 1e-8) - np.divide(1-Y, 1-A + 1e-8))

for l in reversed(range(1, L+1)):
    A_prev, W, b, Z = caches[l-1]
    m = A_prev.shape[1]

    if l == L:
        dZ = dA * (A * (1-A))  # sigmoid derivative
    else:
        dZ = dA * relu_derivative(Z)

    dW = (1/m) * np.dot(dZ, A_prev.T)
    db = (1/m) * np.sum(dZ, axis=1, keepdims=True)
    dA = np.dot(W.T, dZ)

    print(f"Layer {l}: dW shape={dW.shape}, db shape={db.shape}")

print("\n反向传播完成。每层梯度维度与参数维度匹配，可执行参数更新。")
