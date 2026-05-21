# 第22章 Attention机制

## 目标

理解Transformer之前最重要的创新。

---

## 必学内容

### Encoder-Decoder 结构

```python
# Encoder: 把输入序列编码成上下文向量
# Decoder: 从上下文向量生成输出序列
```

### Attention 直觉

```python
# 不是只用一个固定向量
# 每一步都动态地"看"输入的不同部分
```

### Attention 计算

```python
# Query: decoder 当前状态
# Key/Value: encoder 所有状态

attention_weights = softmax(Q · K.T / √d_k)
context = attention_weights · V
```

### Self-Attention

```python
# Q, K, V 都来自同一个序列
# 每个位置都能看到其他所有位置
```

---

## 必须真正理解

### Attention 为什么有效

```
解决了信息瓶颈：
- RNN 把所有信息压缩到一个向量
- Attention 让 decoder 直接访问全部输入
```

### 为什么是 Q/K/V

```
Query: 我想查什么
Key: 我有什么
Value: 实际内容
```

---

## 真正目标

理解 Attention 是 Transformer 的基石。

下一阶段你将从这里进入：

# Transformer。

---

# 第六阶段：无监督学习与生成式AI

预计：5~6周

来源：

Machine Learning Specialization - Course 3
Unsupervised Learning, Recommenders, Reinforcement Learning

DeepLearning.AI - Generative AI with LLMs

---

