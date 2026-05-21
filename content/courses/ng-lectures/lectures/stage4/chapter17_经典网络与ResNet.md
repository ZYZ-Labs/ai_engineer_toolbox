# 第17章 经典网络与ResNet

## 目标

理解现代CNN架构演进。

---

## 必学内容

### LeNet-5 → AlexNet → VGG

```
趋势：网络越来越深，越来越规整
```

### ResNet 残差连接

```python
a[l+2] = g(z[l+2] + a[l])
```

为什么能解决梯度消失：

```
梯度可以直接从深层跳回浅层
```

### 1x1 卷积

```python
# 降维/升维，减少计算量
# Network in Network
```

### Inception 模块

```python
# 多尺度特征并行提取
# 1x1, 3x3, 5x5, max pooling 同时做
```

---

## AI联系

ResNet 核心洞察：

# 学习残差比学习完整映射更容易。

这是深度学习历史上最重要的架构创新之一。

---

