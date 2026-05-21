# 第12章 正则化与 Dropout

## 目标

掌握深度网络的过拟合控制。

---

## 必学内容

### L2 正则化

```python
J = cross_entropy + (λ/2m) * Σ||W||²
```

### Dropout

```python
# 训练时随机关闭部分神经元
D = np.random.rand(A.shape[0], A.shape[1]) < keep_prob
A = A * D / keep_prob
```

为什么除以 keep_prob：

保证期望值不变。

### 早停 Early Stopping

```
验证集 loss 不再下降时停止训练
```

---

## AI联系

Dropout 本质：

# 每次训练用一个子网络，最终集成所有子网络。

---

