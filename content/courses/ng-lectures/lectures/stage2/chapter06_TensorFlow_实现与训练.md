# 第6章 TensorFlow 实现与训练

## 目标

用框架实现神经网络。

---

## 必学内容

### TensorFlow/Keras 基础

```python
model = Sequential([
    Dense(25, activation='relu'),
    Dense(15, activation='relu'),
    Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy')
model.fit(X, y, epochs=100)
```

### NumPy 手写前向传播

```python
def forward(x, W1, b1, W2, b2):
    z1 = np.dot(W1, x) + b1
    a1 = np.maximum(0, z1)  # ReLU
    z2 = np.dot(W2, a1) + b2
    a2 = sigmoid(z2)
    return a2
```

---

## 必须真正理解

### 每一层在做什么

```
层1：提取低级特征
层2：提取中级特征
层3：组合成最终判断
```

---

