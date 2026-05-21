# 第4章 正则化与过拟合

## 目标

掌握模型复杂度控制。

---

## 必学内容

### 过拟合 vs 欠拟合

```
欠拟合：高 bias，训练集都拟合不好
过拟合：高 variance，训练集好但泛化差
刚好：低 bias + 低 variance
```

### 正则化

L2 正则化（Ridge）：

```python
J = MSE + λ * Σw²
```

L1 正则化（Lasso）：

```python
J = MSE + λ * Σ|w|
```

### 正则化强度 λ

λ 太大：欠拟合

λ 太小：过拟合

---

## AI联系

正则化本质：

# 在拟合数据和保持模型简单之间做权衡。

这是所有深度学习模型的基本功。

---

# 第二阶段：神经网络与进阶算法

预计：4~5周

来源：

Machine Learning Specialization - Course 2

Advanced Learning Algorithms

---

