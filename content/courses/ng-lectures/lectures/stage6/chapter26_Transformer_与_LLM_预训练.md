# 第26章 Transformer 与 LLM 预训练

## 目标

进入大模型时代。

---

## 必学内容

### Transformer 架构

```python
# Encoder: 双向自注意力
# Decoder: 因果自注意力 + 交叉注意力
```

### Self-Attention 详细计算

```python
Q = XWq, K = XWk, V = XWv
attention = softmax(QK.T / √d_k)
output = attention @ V
```

### 位置编码

```python
# Transformer 没有序列顺序感
# 用正弦/余弦函数注入位置信息
```

### 预训练目标

```python
# GPT: 自回归预测下一个词
# BERT: 掩码语言模型 (MLM)
```

---

## 必须真正理解

### 为什么 Transformer 取代 RNN

```
并行计算：所有位置同时计算
长程依赖：任意两位置直接交互
可扩展性：堆叠层数和参数量效果持续提升
```

---

