"""
第4章案例：Softmax 实现与数值稳定性
Chapter 4 Example: Softmax Implementation and Numerical Stability

运行方式: python ch04_softmax.py
"""

import numpy as np


def softmax_naive(x):
    """朴素 Softmax（有数值问题）"""
    exp_x = np.exp(x)
    return exp_x / np.sum(exp_x)


def softmax_stable(x):
    """数值稳定 Softmax"""
    x_max = np.max(x)
    exp_x = np.exp(x - x_max)
    return exp_x / np.sum(exp_x)


def demo_softmax_basic():
    """演示基本 Softmax"""
    print("=" * 50)
    print("1. Softmax 基础")
    print("=" * 50)

    scores = np.array([1.0, 2.0, 3.0])
    result = softmax_stable(scores)

    print(f"输入 | Input: {scores}")
    print(f"Softmax: {result.round(4)}")
    print(f"总和 | Sum: {result.sum():.6f}")
    print(f"最大值索引 | Argmax: {np.argmax(result)} -> 概率 {result.max():.4f}")


def demo_numerical_stability():
    """演示数值稳定性"""
    print("\n" + "=" * 50)
    print("2. 数值稳定性对比")
    print("=" * 50)

    big_scores = np.array([1000.0, 1001.0, 1002.0])

    print(f"输入 | Input: {big_scores}")

    # 朴素版本可能溢出
    try:
        naive = softmax_naive(big_scores)
        print(f"朴素 Softmax: {naive}")
    except Exception as e:
        print(f"朴素 Softmax 溢出! | Naive overflow!")

    stable = softmax_stable(big_scores)
    print(f"稳定 Softmax: {stable.round(6)}")


def demo_temperature():
    """演示 Temperature"""
    print("\n" + "=" * 50)
    print("3. Temperature 效果")
    print("=" * 50)

    scores = np.array([1.0, 2.0, 3.0])

    for T in [0.1, 0.5, 1.0, 2.0, 10.0]:
        result = softmax_stable(scores / T)
        print(f"T={T:4.1f}: {result.round(4)} -> 最大值占比: {result.max():.4f}")


def demo_extreme_behavior():
    """演示极端化现象"""
    print("\n" + "=" * 50)
    print("4. Softmax 极端化")
    print("=" * 50)

    cases = [
        ("均匀", [1.0, 1.0, 1.0]),
        ("小差异", [1.0, 2.0, 3.0]),
        ("大差异", [1.0, 10.0, 20.0]),
        ("极大差异", [1.0, 100.0, 200.0]),
    ]

    for name, scores in cases:
        result = softmax_stable(np.array(scores))
        print(f"{name:8s}: {scores} -> {result.round(4)}")


if __name__ == "__main__":
    demo_softmax_basic()
    demo_numerical_stability()
    demo_temperature()
    demo_extreme_behavior()
