# 第21章 词嵌入与NLP基础

## 目标

理解语言表示学习。

---

## 必学内容

### One-hot 的问题

```python
# 维度灾难
# 无法表达语义相似性
```

### Word2Vec

```python
# Skip-gram: 用中心词预测周围词
# 目标：让相似词有相近向量
```

### 余弦相似度

```python
similarity = (u·v) / (||u|| * ||v||)
```

### 类比推理

```python
# king - man + woman ≈ queen
```

### GloVe

```python
# 全局统计 + 局部窗口
# 共现矩阵分解
```

---

## AI联系

词嵌入本质：

# 把离散符号映射到连续语义空间。

这是NLP从规则系统走向深度学习的关键一步。

---

