"""
第2章案例：向量、点积与相似度
Chapter 2 Example: Vectors, Dot Product and Similarity

运行方式: python ch02_vectors.py
"""

import numpy as np


def demo_dot_product():
    """演示点积 | Demo dot product"""
    print("=" * 50)
    print("1. 点积（Dot Product）")
    print("=" * 50)

    a = np.array([1, 2, 3])
    b = np.array([4, 5, 6])
    c = np.array([-1, -2, -3])

    dot_ab = np.dot(a, b)
    dot_ac = np.dot(a, c)

    print(f"a = {a}")
    print(f"b = {b}")
    print(f"c = {c}")
    print(f"\na · b = {dot_ab} (同向/相似)")
    print(f"a · c = {dot_ac} (反向/相反)")

    # 手动实现
    manual = sum(a[i] * b[i] for i in range(len(a)))
    print(f"手动计算 | Manual: {manual}")


def demo_cosine_similarity():
    """演示余弦相似度 | Demo cosine similarity"""
    print("\n" + "=" * 50)
    print("2. 余弦相似度（Cosine Similarity）")
    print("=" * 50)

    def cosine(a, b):
        dot = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        return dot / (norm_a * norm_b + 1e-8)

    v1 = np.array([1, 1])
    v2 = np.array([2, 2])       # 同向，更长
    v3 = np.array([1, -1])      # 正交

    print(f"v1 = {v1}")
    print(f"v2 = {v2} (同向 | same direction)")
    print(f"v3 = {v3} (正交 | orthogonal)")

    print(f"\nv1·v2 = {np.dot(v1, v2):.2f}, cosine = {cosine(v1, v2):.3f}")
    print(f"v1·v3 = {np.dot(v1, v3):.2f}, cosine = {cosine(v1, v3):.3f}")

    # 点积 vs 余弦的区别
    print("\n点积受长度影响，余弦只看方向")
    print("Dot product affected by length, cosine only looks at direction")


def demo_attention_simulation():
    """演示注意力分数计算 | Demo attention score computation"""
    print("\n" + "=" * 50)
    print("3. 模拟 Attention 中的 QK^T")
    print("=" * 50)

    # 3 个 token: "猫 抓 老鼠"
    dim = 4
    X = np.array([
        [0.8, 0.2, 0.1, 0.5],   # 猫
        [0.3, 0.9, 0.1, 0.2],   # 抓
        [0.9, 0.1, 0.8, 0.3],   # 老鼠
    ])

    # 随机权重（实际是学习得到的）
    np.random.seed(42)
    W_q = np.random.randn(dim, dim) * 0.1
    W_k = np.random.randn(dim, dim) * 0.1

    Q = X @ W_q
    K = X @ W_k

    scores = Q @ K.T
    print("注意力分数矩阵 | Attention score matrix:")
    print(scores.round(3))

    print("\n解读 | Interpretation:")
    for i, token in enumerate(["猫", "抓", "老鼠"]):
        best_j = np.argmax(scores[i])
        print(f"  '{token}' 最关注 '{['猫', '抓', '老鼠'][best_j]}' (分数: {scores[i, best_j]:.3f})")


def demo_similarity_matrix():
    """计算相似度矩阵 | Compute similarity matrix"""
    print("\n" + "=" * 50)
    print("4. 批量余弦相似度矩阵")
    print("=" * 50)

    # 5 个向量
    vectors = np.random.randn(5, 10)

    # 归一化
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    normalized = vectors / (norms + 1e-8)

    # 相似度矩阵
    sim_matrix = normalized @ normalized.T

    print("5 个向量之间的余弦相似度矩阵:")
    print(sim_matrix.round(3))
    print(f"\n对角线应为 1: {np.diag(sim_matrix).round(3)}")


if __name__ == "__main__":
    demo_dot_product()
    demo_cosine_similarity()
    demo_attention_simulation()
    demo_similarity_matrix()
