# 第13章 优化算法

## 目标

让梯度下降更快更稳。

---

## 必学内容

### Mini-batch 梯度下降

```python
# batch_size = m:   Batch GD（稳定但慢）
# batch_size = 1:   SGD（噪声大）
# batch_size = 64~512: Mini-batch（平衡）
```

### Momentum

```python
V_dW = β * V_dW + (1-β) * dW
W := W - α * V_dW
```

本质：累积动量，平滑更新方向。

### RMSprop

```python
S_dW = β * S_dW + (1-β) * dW²
W := W - α * dW / (√S_dW + ε)
```

本质：自适应学习率，陡坡小步，缓坡大步。

### Adam

```python
# Momentum + RMSprop
```

默认超参：

```python
β1 = 0.9, β2 = 0.999, ε = 1e-8
```

---

## 必须真正理解

### 为什么 Adam 是默认选择

### 学习率衰减

```python
α = α₀ / (1 + decay_rate * epoch)
```

---

