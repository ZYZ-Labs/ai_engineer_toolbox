# 第14章 Batch Normalization

## 目标

掌握训练稳定化的核心技术。

---

## 必学内容

### Batch Norm 前向

```python
μ = (1/m) * Σz_i
σ² = (1/m) * Σ(z_i - μ)²
z_norm = (z - μ) / √(σ² + ε)
z̃ = γ * z_norm + β
```

### 作用

- 减少内部协变量偏移
- 允许更大学习率
- 轻微正则化效果

### 位置

```python
# 通常放在线性层之后，激活函数之前
Z → BatchNorm → ReLU
```

---

## AI联系

Batch Norm 本质：

# 让每层输入分布更稳定，训练更顺畅。

在深层网络中几乎是标配。

---


# 第四阶段：ML项目策略与CNN

预计：5~6周

来源：

Deep Learning Specialization - Course 3 & 4

Structuring Machine Learning Projects
Convolutional Neural Networks

---

