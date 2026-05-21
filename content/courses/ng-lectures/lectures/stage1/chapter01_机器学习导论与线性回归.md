# 第1章 机器学习导论与线性回归

## 目标

建立机器学习基本框架。

---

## 必学内容

### 监督学习 vs 无监督学习

理解：

```
监督学习：有标签 (x, y)
无监督学习：无标签 (x)
```

### 线性回归模型

```python
f(x) = wx + b
```

### 代价函数 Cost Function

```python
J(w,b) = (1/2m) * Σ(f(x_i) - y_i)²
```

### 梯度下降

```python
w := w - α * ∂J/∂w
b := b - α * ∂J/∂b
```

---

## 必须真正理解

### 为什么梯度下降能收敛

### learning rate α 的影响

太大：震荡或发散

太小：收敛极慢

---

## 实战

用 NumPy 实现：

```python
# 线性回归梯度下降
for i in range(iterations):
    dj_dw = (1/m) * np.sum((f(x) - y) * x)
    dj_db = (1/m) * np.sum(f(x) - y)
    w = w - alpha * dj_dw
    b = b - alpha * dj_db
```

---

## 真正目标

看到：

```python
J(w,b)
```

脑子自动知道：

- 这是凸函数
- 梯度下降能到达全局最小
- 每一步在往最陡下坡走

---

