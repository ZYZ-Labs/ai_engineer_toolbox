"""
第2章：多元回归与特征工程（NumPy 向量化实现）
Chapter 2: Multivariate Regression & Feature Engineering
"""
import numpy as np

np.random.seed(42)

# 模拟数据：房价预测，3个特征
# x1: 面积, x2: 卧室数, x3: 房龄
m = 200
X = np.random.rand(m, 3)
X[:, 0] *= 200  # 面积 0-200
X[:, 1] = np.random.randint(1, 5, m)  # 卧室 1-4
X[:, 2] = np.random.randint(1, 30, m)  # 房龄 1-30

# 真实权重: 面积重要，卧室次要，房龄负相关
true_w = np.array([0.5, 10.0, -2.0])
true_b = 30.0
y = X @ true_w + true_b + np.random.randn(m) * 5

# 特征缩放 (Z-score)
X_mean = np.mean(X, axis=0)
X_std = np.std(X, axis=0)
X_scaled = (X - X_mean) / X_std

# 向量化梯度下降
w = np.zeros(3)
b = 0.0
alpha = 0.1
iterations = 1000

for i in range(iterations):
    y_pred = X_scaled @ w + b
    error = y_pred - y

    dj_dw = (1/m) * X_scaled.T @ error
    dj_db = np.mean(error)

    w -= alpha * dj_dw
    b -= alpha * dj_db

    if i % 200 == 0:
        loss = np.mean(error ** 2) / 2
        print(f"Iter {i}: loss={loss:.4f}")

# 还原权重到原始特征尺度
w_original = w / X_std
b_original = b - np.sum(w * X_mean / X_std)

print(f"\n学习到的参数:")
print(f"  w (面积, 卧室, 房龄) = {w_original}")
print(f"  b = {b_original:.4f}")
print(f"真实参数:")
print(f"  w = {true_w}, b = {true_b}")

# 预测示例
sample = np.array([[120, 3, 10]])
sample_scaled = (sample - X_mean) / X_std
pred = sample_scaled @ w + b
print(f"\n预测: 120平, 3卧室, 10年房龄 → 价格约 {pred[0]:.2f} 万")
