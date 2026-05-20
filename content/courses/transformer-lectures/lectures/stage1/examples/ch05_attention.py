"""
第5章案例：从零实现 Attention
Chapter 5 Example: Attention from Scratch

运行方式: python ch05_attention.py
"""

import numpy as np


def softmax(x):
    """稳定 Softmax"""
    x_max = np.max(x, axis=-1, keepdims=True)
    exp_x = np.exp(x - x_max)
    return exp_x / np.sum(exp_x, axis=-1, keepdims=True)


def attention(Q, K, V, mask=None, verbose=False):
    """
    单头 Attention 实现
    Q, K, V: (seq_len, dim)
    """
    d_k = Q.shape[-1]

    # 1. Q @ K.T
    scores = Q @ K.T
    if verbose:
        print(f"  scores ({Q.shape} @ {K.T.shape}): {scores.shape}")

    # 2. Scale
    scores = scores / np.sqrt(d_k)

    # 3. Mask (if provided)
    if mask is not None:
        scores = scores + mask

    # 4. Softmax
    weights = softmax(scores)
    if verbose:
        print(f"  weights:\n{weights.round(4)}")
        print(f"  每行和 | Row sums: {weights.sum(axis=-1).round(6)}")

    # 5. @ V
    output = weights @ V

    return output, weights


def demo_simple_attention():
    """简单 Attention 演示"""
    print("=" * 50)
    print("1. 简单 Attention (3 tokens, dim=4)")
    print("=" * 50)

    seq_len, dim = 3, 4
    X = np.random.randn(seq_len, dim)

    # 简化：直接用 X 作为 Q, K, V
    W_q = np.random.randn(dim, dim) * 0.1
    W_k = np.random.randn(dim, dim) * 0.1
    W_v = np.random.randn(dim, dim) * 0.1

    Q = X @ W_q
    K = X @ W_k
    V = X @ W_v

    output, weights = attention(Q, K, V, verbose=True)
    print(f"\n输出 | Output: {output.shape}")


def demo_causal_attention():
    """因果 Attention 演示"""
    print("\n" + "=" * 50)
    print("2. Causal Attention (Decoder)")
    print("=" * 50)

    seq_len, dim = 4, 8
    X = np.random.randn(seq_len, dim)

    W_q = np.random.randn(dim, dim) * 0.1
    W_k = np.random.randn(dim, dim) * 0.1
    W_v = np.random.randn(dim, dim) * 0.1

    Q, K, V = X @ W_q, X @ W_k, X @ W_v

    # Causal mask: 下三角矩阵
    mask = np.triu(np.ones((seq_len, seq_len)) * -1e9, k=1)

    output, weights = attention(Q, K, V, mask=mask, verbose=True)

    print("\n因果掩码效果: 每个位置只能看到前面的位置")
    print("Causal mask effect: each position can only see previous positions")
    for i in range(seq_len):
        valid = weights[i, :i+1].sum()
        print(f"  位置 {i}: 注意力在前 {i+1} 个位置的占比和 = {valid:.4f}")


def demo_attention_class():
    """面向对象的 Attention"""
    print("\n" + "=" * 50)
    print("3. Attention 类 (面向对象)")
    print("=" * 50)

    class AttentionScratch:
        def __init__(self, d_model):
            self.d_model = d_model
            self.W_q = np.random.randn(d_model, d_model) * 0.01
            self.W_k = np.random.randn(d_model, d_model) * 0.01
            self.W_v = np.random.randn(d_model, d_model) * 0.01

        def forward(self, X):
            Q = X @ self.W_q
            K = X @ self.W_k
            V = X @ self.W_v
            return attention(Q, K, V)

    attn = AttentionScratch(d_model=16)
    X = np.random.randn(5, 16)
    out, w = attn.forward(X)
    print(f"Input: {X.shape} -> Output: {out.shape}, Weights: {w.shape}")


if __name__ == "__main__":
    demo_simple_attention()
    demo_causal_attention()
    demo_attention_class()
