"""
第7章：激活函数与多分类
Chapter 7: Activation Functions & Multiclass Classification
"""
import numpy as np
import matplotlib.pyplot as plt

# --- 激活函数可视化 ---
x = np.linspace(-5, 5, 200)

fig, axes = plt.subplots(2, 2, figsize=(10, 8))

# Sigmoid
axes[0,0].plot(x, 1/(1+np.exp(-x)))
axes[0,0].set_title('Sigmoid: g(z)=1/(1+e^-z)')
axes[0,0].axhline(0.5, color='r', linestyle='--', alpha=0.5)

# Tanh
axes[0,1].plot(x, np.tanh(x))
axes[0,1].set_title('Tanh: (-1, 1), zero-centered')

# ReLU
axes[1,0].plot(x, np.maximum(0, x))
axes[1,0].set_title('ReLU: max(0, z)')

# Leaky ReLU
axes[1,1].plot(x, np.where(x > 0, x, 0.01*x))
axes[1,1].set_title('Leaky ReLU')

plt.tight_layout()
plt.savefig('ch07_activations.png')

# --- Softmax 多分类 ---
logits = np.array([2.0, 1.0, 0.1])  # 3个类别的原始分数

def softmax(z):
    exp_z = np.exp(z - np.max(z))  # 数值稳定性
    return exp_z / np.sum(exp_z)

probs = softmax(logits)
print(f"Logits: {logits}")
print(f"Softmax 概率: {probs.round(4)}")
print(f"概率之和: {probs.sum():.4f}")
print(f"预测类别: {np.argmax(probs)}")
