# 第7章 激活函数与多分类

## 目标

掌握非线性选择和输出设计。

---

## 必学内容

### ReLU

```python
f(x) = max(0, x)
```

优点：计算快，缓解梯度消失

### Sigmoid / Tanh

```python
sigmoid: (0,1)    # 输出层二分类
tanh: (-1,1)      # 隐藏层中心化
```

### Softmax

```python
a_i = e^(z_i) / Σe^(z_j)
```

本质：多分类的概率归一化。

### 多分类交叉熵损失

```python
L = -Σ y_i * log(a_i)
```

---

## AI联系

激活函数选择 = 工程直觉：

- 隐藏层默认 ReLU
- 二分类输出 sigmoid
- 多分类输出 softmax

---

