"""
第1章：线性回归与梯度下降（NumPy 实现）
Chapter 1: Linear Regression with Gradient Descent (NumPy Implementation)
"""
import numpy as np
import matplotlib.pyplot as plt

# 生成模拟数据：房屋面积(x) vs 价格(y)
np.random.seed(42)
m = 100  # 样本数
x = np.random.rand(m) * 200  # 0~200 平米
y = 50 + 0.8 * x + np.random.randn(m) * 10  # 基础价格50万，每平0.8万，噪声

# 归一化特征（加速收敛）
x_mean, x_std = np.mean(x), np.std(x)
x_norm = (x - x_mean) / x_std

# 初始化参数
w, b = 0.0, 0.0
alpha = 0.01  # 学习率
iterations = 1000

# 梯度下降
loss_history = []
for i in range(iterations):
    # 前向：预测
    y_pred = w * x_norm + b

    # 计算损失 (MSE)
    loss = np.mean((y_pred - y) ** 2) / 2
    loss_history.append(loss)

    # 反向：计算梯度
    dj_dw = np.mean((y_pred - y) * x_norm)
    dj_db = np.mean(y_pred - y)

    # 更新参数
    w -= alpha * dj_dw
    b -= alpha * dj_db

    if i % 100 == 0:
        print(f"Iter {i}: loss={loss:.4f}, w={w:.4f}, b={b:.4f}")

# 还原到原始尺度
w_original = w / x_std
b_original = b - w * x_mean / x_std
print(f"\n最终参数: w={w_original:.4f}, b={b_original:.4f}")
print(f"真实参数约为: w=0.8, b=50")

# 可视化
fig, axes = plt.subplots(1, 2, figsize=(12, 4))
axes[0].scatter(x, y, alpha=0.5, label='Data')
axes[0].plot(x, w_original * x + b_original, 'r-', label='Fitted Line')
axes[0].set_xlabel('Area (sqm)')
axes[0].set_ylabel('Price (10k)')
axes[0].legend()
axes[0].set_title('Linear Regression Fit')

axes[1].plot(loss_history)
axes[1].set_xlabel('Iteration')
axes[1].set_ylabel('Loss')
axes[1].set_title('Loss Curve')
plt.tight_layout()
plt.savefig('ch01_output.png')
print("\n可视化已保存到 ch01_output.png")
