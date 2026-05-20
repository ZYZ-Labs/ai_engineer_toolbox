# 第8章：Gradient 与 Optimizer — 下山的人 | Chapter 8: Gradient and Optimizer — The Person Going Downhill

> **阶段定位** | **Stage**: 第二阶段 — PyTorch 与训练系统
> **预计学时** | **Duration**: 6~8 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 真正理解 loss、gradient、learning rate 和 optimizer 的本质
- 掌握 SGD、Adam、AdamW 的核心原理和区别
- 理解为什么 learning rate 常见 `1e-4`
- 理解梯度爆炸、梯度消失、过拟合的原因

**English:**
- Truly understand the essence of loss, gradient, learning rate, and optimizer
- Master core principles and differences of SGD, Adam, AdamW
- Understand why learning rate is commonly `1e-4`
- Understand causes of gradient explosion, vanishing gradients, and overfitting

---

## 8.1 Loss — 模型犯了多少错 | Loss — How Wrong Is the Model?

### 中文解释

**Loss = 衡量模型预测与真实答案差距的函数**

目标：让 loss 越来越小（趋近于0）

常见 Loss 函数：
- MSE（均方误差）：回归问题 | Mean Squared Error: regression
- CrossEntropy（交叉熵）：分类问题 | Cross Entropy: classification

### English Explanation

**Loss = A function measuring the gap between model predictions and true answers**

Goal: Make loss smaller and smaller (approaching 0)

Common Loss Functions:
- MSE (Mean Squared Error): regression problems
- Cross Entropy: classification problems

### 代码案例 | Code Example

```python
import torch
import torch.nn.functional as F

# MSE Loss — 回归 | MSE Loss — Regression
predictions = torch.tensor([2.5, 0.0, 2.1, 1.6])
targets = torch.tensor([3.0, -0.5, 2.0, 1.5])

mse_loss = F.mse_loss(predictions, targets)
print(f"MSE: {mse_loss.item():.4f}")
# 计算：((2.5-3)^2 + (0-(-0.5))^2 + (2.1-2)^2 + (1.6-1.5)^2) / 4 = 0.0775

# Cross Entropy Loss — 分类 | Cross Entropy Loss — Classification
# 模型输出 logits（未归一化分数）| Model outputs logits (unnormalized scores)
logits = torch.tensor([[2.0, 1.0, 0.1]])   # 3 类分类 | 3-class classification
labels = torch.tensor([0])                  # 真实标签是第0类 | True label is class 0

ce_loss = F.cross_entropy(logits, labels)
print(f"CrossEntropy: {ce_loss.item():.4f}")

# 手动验证 CrossEntropy | Manual verification of CrossEntropy
# CE = -log(softmax(logits)[true_class])
probs = F.softmax(logits, dim=-1)
print(f"Probabilities: {probs}")
print(f"-log(p[0]): {(-torch.log(probs[0, 0])).item():.4f}")
```

---

## 8.2 Gradient — 下山最快的方向 | Gradient — The Fastest Way Downhill

### 中文解释

**Gradient（梯度）= 函数在某一点上升最快的方向**

训练时我们要求：**负梯度方向** = loss 下降最快的方向

想象你在山上，梯度指向山顶（上升最快），负梯度指向山脚（下降最快）。

### English Explanation

**Gradient = The direction in which a function increases fastest at a point**

During training we want: **Negative gradient direction** = fastest way for loss to decrease

Imagine you're on a mountain; gradient points to the peak (fastest ascent), negative gradient points to the valley (fastest descent).

### 可视化 | Visualization

```
Loss Landscape（损失地形）:

     Loss
      ↑
      |    \      /
      |     \    /
      |      \  /
      |       \/    ← 最低点 = 最优参数 | Minimum = optimal parameters
      |________________→ 参数空间 | Parameter space

梯度指向"上坡"方向 | Gradient points "uphill"
更新方向 = -梯度（下坡）| Update direction = -gradient (downhill)
```

### 代码案例 | Code Example

```python
import torch

# 模拟一个简单的 loss 地形 | Simulate a simple loss landscape
# f(w) = (w - 5)^2, 最小值在 w=5 | f(w) = (w - 5)^2, minimum at w=5

w = torch.tensor(0.0, requires_grad=True)   # 初始在 w=0 | Start at w=0
learning_rate = 0.1

print("梯度下降过程 | Gradient descent process:")
for step in range(10):
    loss = (w - 5) ** 2
    loss.backward()
    
    grad = w.grad.item()
    print(f"Step {step}: w={w.item():.3f}, loss={loss.item():.3f}, grad={grad:.3f}")
    
    # 参数更新：w = w - lr * grad | Parameter update
    with torch.no_grad():
        w -= learning_rate * w.grad
    w.grad.zero_()

print(f"\n最终 w: {w.item():.3f} (目标: 5.0)")
```

---

## 8.3 Learning Rate — 步长多大？| Learning Rate — How Big Is the Step?

### 中文解释

**Learning Rate（学习率）= 每次更新参数迈多大步**

类比：
- LR 太大：步子太大，错过最低点，甚至发散
- LR 太小：步子太小，收敛极慢
- LR 合适：稳步走向最低点

为什么常见 `1e-4`？
- 经验值，适合大多数 Transformer 训练
- 实际会根据 warmup、decay 动态调整

### English Explanation

**Learning Rate = How big a step to take when updating parameters**

Analogy:
- LR too large: Step too big, overshoot minimum, may diverge
- LR too small: Step too small, extremely slow convergence
- LR appropriate: Steady progress toward minimum

Why commonly `1e-4`?
- Empirical value suitable for most Transformer training
- Actually dynamically adjusted with warmup, decay schedules

### 代码案例：LR 的影响 | Code Example: Effect of LR

```python
import torch
import matplotlib.pyplot as plt

def train_with_lr(lr, steps=20):
    """用指定 LR 训练，返回 loss 历史 | Train with specified LR, return loss history"""
    w = torch.tensor(0.0, requires_grad=True)
    losses = []
    for _ in range(steps):
        loss = (w - 5) ** 2
        loss.backward()
        with torch.no_grad():
            w -= lr * w.grad
        w.grad.zero_()
        losses.append(loss.item())
    return losses

lrs = [0.01, 0.1, 0.5, 1.0]
for lr in lrs:
    losses = train_with_lr(lr)
    print(f"LR={lr}: final loss={losses[-1]:.4f}, losses={losses[:5]}")

# LR=0.01: 收敛慢 | Slow convergence
# LR=0.1:  收敛快 | Fast convergence
# LR=0.5:  震荡 | Oscillation
# LR=1.0:  发散！| Divergence!
```

---

## 8.4 Optimizer — 怎么下山 | Optimizer — How to Go Downhill

### 中文解释

**Optimizer = 决定怎么下山的策略**

不是简单地 `w = w - lr * grad`，而是更聪明的更新规则。

### English Explanation

**Optimizer = The strategy for how to go downhill**

Not simply `w = w - lr * grad`, but smarter update rules.

### SGD（随机梯度下降）| SGD (Stochastic Gradient Descent)

```python
import torch
import torch.optim as optim

# 参数 | Parameters
w = torch.tensor([0.0], requires_grad=True)

# SGD 优化器 | SGD optimizer
optimizer = optim.SGD([w], lr=0.1)

# 训练循环 | Training loop
for step in range(10):
    optimizer.zero_grad()
    loss = (w - 5) ** 2
    loss.backward()
    optimizer.step()   # w = w - lr * grad
    
    print(f"Step {step}: w={w.item():.3f}")

# SGD 公式：| SGD formula:
# w_{t+1} = w_t - lr * grad_t
```

### Momentum（动量）| Momentum

```python
import torch
import torch.optim as optim

w = torch.tensor([0.0], requires_grad=True)

# SGD + Momentum | SGD with Momentum
optimizer = optim.SGD([w], lr=0.1, momentum=0.9)

# Momentum 公式：| Momentum formula:
# v_t = momentum * v_{t-1} + grad_t    # 速度 | velocity
# w_{t+1} = w_t - lr * v_t             # 更新 | update

# 直觉：像滚雪球，保持之前的运动方向 | Intuition: like a snowball, maintains previous direction
# 好处：加速收敛，减少震荡 | Benefits: faster convergence, less oscillation
```

### Adam（自适应矩估计）| Adam (Adaptive Moment Estimation)

```python
import torch
import torch.optim as optim

w = torch.tensor([0.0], requires_grad=True)

# Adam 优化器 | Adam optimizer
optimizer = optim.Adam([w], lr=1e-3)

# Adam 核心思想：| Adam core idea:
# 1. 维护梯度的一阶矩（均值）| Maintain first moment (mean) of gradients
# 2. 维护梯度的二阶矩（方差）| Maintain second moment (variance) of gradients
# 3. 自动调整每个参数的学习率 | Automatically adjust learning rate per parameter

# Adam 公式：| Adam formulas:
# m_t = beta1 * m_{t-1} + (1-beta1) * g_t     # 一阶矩 | first moment
# v_t = beta2 * v_{t-1} + (1-beta2) * g_t^2   # 二阶矩 | second moment
# w_{t+1} = w_t - lr * m_t_hat / (sqrt(v_t_hat) + eps)
```

### AdamW（Adam + 权重衰减）| AdamW (Adam + Weight Decay)

```python
import torch
import torch.optim as optim

w = torch.tensor([0.0], requires_grad=True)

# AdamW 优化器 — Transformer 的标准选择 | AdamW — standard for Transformers
optimizer = optim.AdamW([w], lr=1e-4, weight_decay=0.01)

# AdamW vs Adam 的区别：| AdamW vs Adam difference:
# Adam: 权重衰减施加在梯度上 | Weight decay applied to gradient
# AdamW: 权重衰减直接施加在参数上 | Weight decay directly applied to parameters
# AdamW 在理论上更正确，实践中效果更好 | AdamW is theoretically more correct and works better
```

### Optimizer 对比总结 | Optimizer Comparison Summary

| Optimizer | 优点 | 缺点 | 适用场景 |
|-----------|------|------|----------|
| SGD | 简单，泛化好 | 收敛慢，需调 LR | 大规模数据 |
| SGD+Momentum | 收敛快 | 需调超参 | 计算机视觉 |
| Adam | 自适应，易用 | 可能泛化差 | 默认选择 |
| AdamW | 正确衰减，效果好 | 略复杂 | Transformer |

| Optimizer | Pros | Cons | Use Case |
|-----------|------|------|----------|
| SGD | Simple, good generalization | Slow convergence, needs LR tuning | Large-scale data |
| SGD+Momentum | Faster convergence | Needs hyperparameter tuning | Computer vision |
| Adam | Adaptive, easy to use | May generalize poorly | Default choice |
| AdamW | Correct decay, good results | Slightly complex | Transformers |

---

## 8.5 为什么 Loss 太低也可能崩？| Why Can Low Loss Also Cause Collapse?

### 中文解释

**过拟合（Overfitting）= 模型记住了训练数据，但没学会泛化**

迹象：
- 训练 loss 很低
- 验证 loss 很高
- 两者差距越来越大

### English Explanation

**Overfitting = Model memorizes training data but doesn't learn to generalize**

Signs:
- Training loss is very low
- Validation loss is high
- Gap between them keeps increasing

### 代码案例 | Code Example

```python
import torch

# 过拟合的极端例子：| Extreme overfitting example:
# 用一个巨大模型拟合少量数据 | Use huge model to fit small dataset

# 少量数据 | Small dataset
X_train = torch.randn(10, 100)
y_train = torch.randint(0, 2, (10,))

# 巨大模型 | Huge model
model = torch.nn.Sequential(
    torch.nn.Linear(100, 500),
    torch.nn.ReLU(),
    torch.nn.Linear(500, 500),
    torch.nn.ReLU(),
    torch.nn.Linear(500, 2),
)

optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
criterion = torch.nn.CrossEntropyLoss()

# 训练 | Train
for epoch in range(100):
    optimizer.zero_grad()
    logits = model(X_train)
    loss = criterion(logits, y_train)
    loss.backward()
    optimizer.step()
    
    if epoch % 20 == 0:
        # 训练准确率 | Training accuracy
        pred = logits.argmax(dim=-1)
        acc = (pred == y_train).float().mean()
        print(f"Epoch {epoch}: loss={loss.item():.4f}, train_acc={acc:.2f}")

# 现象：loss → 0，训练准确率 → 100%
# 但这模型在测试数据上会很差！
# Phenomenon: loss → 0, training accuracy → 100%
# But this model will perform poorly on test data!
```

---

## 8.6 梯度爆炸与梯度消失 | Gradient Explosion and Vanishing

### 中文解释

**梯度爆炸 = 梯度变得极大 → 参数更新过大 → 模型发散**

**梯度消失 = 梯度变得极小 → 参数几乎不更新 → 模型学不动**

在深层网络（如 Transformer）中尤其常见。

### English Explanation

**Gradient Explosion = Gradients become extremely large → parameter updates too big → model diverges**

**Gradient Vanishing = Gradients become extremely small → parameters barely update → model can't learn**

Especially common in deep networks (like Transformers).

### 代码案例：梯度爆炸演示 | Code Example: Gradient Explosion Demo

```python
import torch

# 梯度爆炸演示 | Gradient explosion demo
# 用一个很深的网络 | Use a very deep network

x = torch.tensor([1.0], requires_grad=True)

# 模拟 50 层，每层乘以 2 | Simulate 50 layers, multiply by 2 each
h = x
for _ in range(50):
    h = h * 2

h.backward()
print(f"梯度 | Gradient: {x.grad.item():.2e}")
# 2^50 ≈ 1e15 — 梯度爆炸！| 2^50 ≈ 1e15 — gradient explosion!

# 解决方法：梯度裁剪 | Solution: gradient clipping
torch.nn.utils.clip_grad_norm_([x], max_norm=1.0)
```

### Transformer 中的解决方案 | Solutions in Transformers

| 问题 | 解决方案 | 实现 |
|------|----------|------|
| 梯度爆炸 | 梯度裁剪 | `clip_grad_norm_` |
| 梯度消失 | Residual Connection | `x + sublayer(x)` |
| 梯度消失 | Layer Normalization | 稳定每层的分布 |
| 学习不稳定 | Learning Rate Warmup | 从小 LR 开始 |

| Problem | Solution | Implementation |
|---------|----------|----------------|
| Gradient explosion | Gradient clipping | `clip_grad_norm_` |
| Gradient vanishing | Residual Connection | `x + sublayer(x)` |
| Gradient vanishing | Layer Normalization | Stabilize per-layer distribution |
| Unstable learning | Learning Rate Warmup | Start from small LR |

---

## 本章总结 | Chapter Summary

**中文：**
- Loss = 错误程度，Gradient = 修正方向
- Learning Rate = 步长，Optimizer = 下山策略
- SGD 简单但慢，Adam 自适应，AdamW 是 Transformer 标配
- 梯度爆炸用裁剪，梯度消失用 Residual + LayerNorm
- 过拟合 = 训练 loss 低但验证 loss 高

**English:**
- Loss = degree of error, Gradient = correction direction
- Learning Rate = step size, Optimizer = downhill strategy
- SGD is simple but slow, Adam is adaptive, AdamW is standard for Transformers
- Gradient explosion → clipping, vanishing → Residual + LayerNorm
- Overfitting = low training loss but high validation loss

---

## 课后练习 | Homework

1. **Loss 比较**：实现 MSE 和 CrossEntropy 的 PyTorch 版本，用相同数据比较结果
2. **LR 实验**：用不同 LR（1e-5, 1e-4, 1e-3, 1e-2）训练同一个模型，绘制 loss 曲线
3. **Optimizer 对比**：分别用 SGD、Adam、AdamW 训练，比较收敛速度
4. **梯度裁剪**：实现一个深网络，观察梯度爆炸现象，然后用 `clip_grad_norm_` 解决
5. **过拟合演示**：用小数据+大模型演示过拟合，观察训练 acc 和验证 acc 的差距
