"""
第3章案例：矩阵乘法与投影
Chapter 3 Example: Matrix Multiplication and Projection

运行方式: python ch03_matrix.py
"""

import numpy as np


def demo_matrix_multiplication():
    """演示矩阵乘法 | Demo matrix multiplication"""
    print("=" * 50)
    print("1. 矩阵乘法与 Shape 规则")
    print("=" * 50)

    A = np.array([[1, 2], [3, 4]])  # (2, 2)
    B = np.array([[5, 6], [7, 8]])  # (2, 2)

    print(f"A ({A.shape}):\n{A}")
    print(f"B ({B.shape}):\n{B}")
    print(f"A @ B ({A.shape} @ {B.shape} -> {A.shape}):\n{A @ B}")

    # 不同 shape
    C = np.random.randn(3, 4)
    D = np.random.randn(4, 5)
    print(f"\nC @ D: {C.shape} @ {D.shape} -> {(C @ D).shape}")


def demo_batch_matmul():
    """演示 Batch 矩阵乘法 | Demo batch matrix multiplication"""
    print("\n" + "=" * 50)
    print("2. Batch 矩阵乘法")
    print("=" * 50)

    batch, seq, dim = 4, 128, 64
    Q = np.random.randn(batch, seq, dim)
    K = np.random.randn(batch, seq, dim)

    # 逐个 batch
    scores_manual = np.zeros((batch, seq, seq))
    for b in range(batch):
        scores_manual[b] = Q[b] @ K[b].T

    # einsum 方式
    scores_einsum = np.einsum('bsd,btd->bst', Q, K)

    print(f"Q: {Q.shape}, K: {K.shape}")
    print(f"Q @ K.T: {scores_manual.shape}")
    print(f"结果一致? {np.allclose(scores_manual, scores_einsum)}")


def demo_qkv_projection():
    """演示 QKV 投影 | Demo QKV projection"""
    print("\n" + "=" * 50)
    print("3. Attention 中的 Q/K/V 投影")
    print("=" * 50)

    seq_len, d_model = 3, 8
    X = np.random.randn(seq_len, d_model)

    W_q = np.random.randn(d_model, d_model) * 0.1
    W_k = np.random.randn(d_model, d_model) * 0.1
    W_v = np.random.randn(d_model, d_model) * 0.1

    Q = X @ W_q
    K = X @ W_k
    V = X @ W_v

    print(f"Input X: {X.shape}")
    print(f"Q: {Q.shape}, K: {K.shape}, V: {V.shape}")
    print("注意：Q/K/V shape 相同但内容完全不同!")

    # QK^T
    scores = Q @ K.T
    print(f"\nQ @ K.T: {scores.shape}")
    print(scores.round(3))


if __name__ == "__main__":
    demo_matrix_multiplication()
    demo_batch_matmul()
    demo_qkv_projection()
