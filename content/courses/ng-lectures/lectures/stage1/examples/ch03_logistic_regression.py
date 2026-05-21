"""
第3章：分类与逻辑回归（NumPy + scikit-learn 对比）
Chapter 3: Classification & Logistic Regression
"""
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

# 生成二分类数据
X, y = make_classification(n_samples=500, n_features=2, n_redundant=0,
                           n_clusters_per_class=1, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# --- NumPy 手写逻辑回归 ---
def sigmoid(z):
    return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

w = np.zeros(X_train.shape[1])
b = 0.0
alpha = 0.1
m = len(y_train)

for i in range(2000):
    z = X_train @ w + b
    a = sigmoid(z)

    # 交叉熵损失的梯度
    dj_dw = (1/m) * X_train.T @ (a - y_train)
    dj_db = np.mean(a - y_train)

    w -= alpha * dj_dw
    b -= alpha * dj_db

    if i % 500 == 0:
        loss = -np.mean(y_train * np.log(a + 1e-8) + (1-y_train) * np.log(1-a + 1e-8))
        print(f"[NumPy] Iter {i}: loss={loss:.4f}")

# NumPy 预测
z_test = X_test @ w + b
y_pred_numpy = (sigmoid(z_test) >= 0.5).astype(int)
acc_numpy = np.mean(y_pred_numpy == y_test)

# --- scikit-learn 逻辑回归 ---
model = LogisticRegression(max_iter=2000)
model.fit(X_train, y_train)
y_pred_sklearn = model.predict(X_test)
acc_sklearn = np.mean(y_pred_sklearn == y_test)

print(f"\nNumPy 手写准确率: {acc_numpy:.4f}")
print(f"scikit-learn 准确率: {acc_sklearn:.4f}")
print(f"NumPy 学习到的 w={w}, b={b:.4f}")
print(f"sklearn 学习到的 w={model.coef_[0]}, b={model.intercept_[0]:.4f}")
