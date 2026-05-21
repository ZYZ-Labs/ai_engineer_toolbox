"""
第4章：正则化与过拟合（L1/L2 对比可视化）
Chapter 4: Regularization & Overfitting
"""
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import Ridge, Lasso
from sklearn.pipeline import make_pipeline

np.random.seed(42)

# 生成带噪声的非线性数据
m = 30
x = np.linspace(0, 5, m)
y = np.sin(x) + np.random.randn(m) * 0.3
X = x.reshape(-1, 1)

# 高阶多项式特征（容易过拟合）
poly = PolynomialFeatures(degree=15)
X_poly = poly.fit_transform(X)

# 不同正则化强度的 Ridge (L2)
alphas = [0, 0.001, 0.1, 10]
fig, axes = plt.subplots(2, 2, figsize=(12, 8))
axes = axes.ravel()

x_plot = np.linspace(0, 5, 200).reshape(-1, 1)

for idx, alpha in enumerate(alphas):
    model = make_pipeline(PolynomialFeatures(degree=15),
                          Ridge(alpha=alpha))
    model.fit(X, y)
    y_plot = model.predict(x_plot)

    axes[idx].scatter(x, y, color='blue', alpha=0.5, label='Training Data')
    axes[idx].plot(x_plot, np.sin(x_plot), 'g--', label='True Function')
    axes[idx].plot(x_plot, y_plot, 'r-', label=f'Ridge α={alpha}')
    axes[idx].set_ylim(-2, 2)
    axes[idx].legend()
    axes[idx].set_title(f'Regularization Strength α={alpha}')

plt.tight_layout()
plt.savefig('ch04_regularization.png')
print("可视化已保存到 ch04_regularization.png")
print("\n观察：α=0 时过拟合严重（红色曲线剧烈震荡）")
print("α 越大，模型越平滑，越不容易过拟合")
