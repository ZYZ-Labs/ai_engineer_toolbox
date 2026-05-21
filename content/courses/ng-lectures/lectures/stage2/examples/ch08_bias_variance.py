"""
第8章：偏差 vs 方差诊断（学习曲线可视化）
Chapter 8: Bias vs Variance — Learning Curves
"""
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import learning_curve
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

np.random.seed(42)

# 生成非线性数据
m = 100
X = np.sort(np.random.rand(m, 1) * 6 - 3, axis=0)
y = np.sin(X).ravel() + np.random.randn(m) * 0.2

def plot_learning_curve(model, title):
    train_sizes, train_scores, val_scores = learning_curve(
        model, X, y, cv=5,
        train_sizes=np.linspace(0.1, 1.0, 10),
        scoring='neg_mean_squared_error'
    )
    train_mean = -np.mean(train_scores, axis=1)
    val_mean = -np.mean(val_scores, axis=1)

    plt.plot(train_sizes, train_mean, 'o-', label='Training Error')
    plt.plot(train_sizes, val_mean, 'o-', label='Validation Error')
    plt.xlabel('Training Set Size')
    plt.ylabel('MSE')
    plt.title(title)
    plt.legend()
    plt.ylim(0, 1.5)

# 高偏差（欠拟合）: 线性模型
plt.figure(figsize=(14, 4))
plt.subplot(1, 3, 1)
plot_learning_curve(LinearRegression(), 'High Bias (Underfitting)')

# 高方差（过拟合）: 高阶多项式
plt.subplot(1, 3, 2)
plot_learning_curve(make_pipeline(PolynomialFeatures(15), LinearRegression()),
                    'High Variance (Overfitting)')

# 刚好: 适中复杂度
plt.subplot(1, 3, 3)
plot_learning_curve(make_pipeline(PolynomialFeatures(3), LinearRegression()),
                    'Just Right')

plt.tight_layout()
plt.savefig('ch08_bias_variance.png')
print("可视化已保存到 ch08_bias_variance.png")
print("\n诊断要点:")
print("- 高偏差: 训练误差和验证误差都很高，且接近")
print("- 高方差: 训练误差低，但验证误差高，差距大")
