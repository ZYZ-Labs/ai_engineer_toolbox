"""
第22章：Self-Attention 手写实现
Chapter 22: Self-Attention from Scratch
"""
import numpy as np

def softmax(x, axis=-1):
    e = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return e / np.sum(e, axis=axis, keepdims=True)

def scaled_dot_product_attention(Q, K, V):
    """
    Q, K, V: (seq_len, d_k)
    """
    d_k = Q.shape[1]
    scores = Q @ K.T / np.sqrt(d_k)
    weights = softmax(scores, axis=1)
    output = weights @ V
    return output, weights

# 模拟: 3个token, 每个4维
np.random.seed(1)
seq_len, d = 3, 4
X = np.random.randn(seq_len, d)

# 简单版本: Q=K=V=X (没有独立投影)
Q, K, V = X, X, X
out, attn_weights = scaled_dot_product_attention(Q, K, V)

print(f"输入 X shape: {X.shape}")
print(f"注意力权重矩阵:\n{attn_weights.round(3)}")
print(f"\n输出 shape: {out.shape}")
print("观察: 每个输出位置都是所有输入的加权平均")
print(f"权重和检查: {attn_weights.sum(axis=1).round(3)} (每行应≈1)")

# 带独立投影的完整版本
W_q = np.random.randn(d, d) * 0.01
W_k = np.random.randn(d, d) * 0.01
W_v = np.random.randn(d, d) * 0.01

Q_proj = X @ W_q
K_proj = X @ W_k
V_proj = X @ W_v

out_proj, attn_proj = scaled_dot_product_attention(Q_proj, K_proj, V_proj)
print(f"\n带投影的 Attention 输出 shape: {out_proj.shape}")
