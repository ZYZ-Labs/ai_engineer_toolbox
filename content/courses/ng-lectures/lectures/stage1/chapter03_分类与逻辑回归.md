# 第3章 分类与逻辑回归

## 目标

从回归过渡到分类。

---

## 必学内容

### Sigmoid 函数

```python
g(z) = 1 / (1 + e^(-z))
```

输出范围：(0, 1)

本质：将实数映射为概率。

### 逻辑回归模型

```python
f(x) = g(w·x + b)
```

### 决策边界

```python
w·x + b = 0
```

### 逻辑损失函数

```python
L = -y*log(f(x)) - (1-y)*log(1-f(x))
```

为什么不用 MSE：

非凸，梯度下降会卡住。

---

## 必须真正理解

### Sigmoid 的导数

```python
g'(z) = g(z) * (1 - g(z))
```

### 为什么逻辑损失是凸函数

---

## 实战

用 scikit-learn 实现：

```python
from sklearn.linear_model import LogisticRegression
model = LogisticRegression()
model.fit(X_train, y_train)
```

同时手写 NumPy 版本对比。

---

## 真正目标

理解：

分类问题的核心不是"预测数值"，而是"估计概率"。

---

