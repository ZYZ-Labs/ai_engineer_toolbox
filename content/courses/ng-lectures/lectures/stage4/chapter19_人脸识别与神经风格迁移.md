# 第19章 人脸识别与神经风格迁移

## 目标

理解CNN的高级应用。

---

## 必学内容

### 人脸识别 vs 人脸验证

```
验证(Verification): 1对1比对
识别(Recognition): 1对K查找
```

### Siamese Network

```python
# 双塔结构，比较两张图的编码距离
# 相同人距离小，不同人距离大
```

### Triplet Loss

```python
L = max(||f(A)-f(P)||² - ||f(A)-f(N)||² + α, 0)
```

### 神经风格迁移

```python
# 内容损失 + 风格损失
# 用 Gram Matrix 捕捉风格
```

---

# 第五阶段：序列模型与Attention

预计：4~5周

来源：

Deep Learning Specialization - Course 5

Sequence Models

---

