# 第27章 微调、LoRA与RLHF

## 目标

掌握大模型适配技术。

---

## 必学内容

### 微调策略

```python
# Full fine-tuning: 更新全部参数
# 需要大量计算资源
```

### PEFT / LoRA

```python
# 低秩适应：W = W₀ + ΔW = W₀ + BA
# B, A 是小矩阵，参数量大幅减少
# 只训练 B 和 A
```

### Prompt Tuning

```python
# 在输入前加可学习的 soft prompt
# 冻结模型参数
```

### RLHF 流程

```python
# Step 1: SFT (监督微调)
# Step 2: 训练 Reward Model (人类偏好排序)
# Step 3: PPO 强化学习优化策略
```

---

## AI联系

LoRA 本质：

# 权重更新是低秩的，不需要更新全部参数。

这是让大模型在消费级 GPU 上微调的关键。

---

