# 第18章 目标检测与YOLO

## 目标

从分类扩展到定位与检测。

---

## 必学内容

### 目标定位

```python
# 输出：边界框 (bx, by, bh, bw) + 类别概率
```

### 滑动窗口 vs 卷积实现

```python
# 全卷积网络一次性计算所有位置
# 效率远高于滑动窗口
```

### YOLO

```python
# You Only Look Once
# 图像分成网格，每个网格预测多个框
# 单次前向传播完成检测
```

### Anchor Boxes

```python
# 预定义多种形状的候选框
# 一个网格检测多个不同形状的目标
```

---

## 必须真正理解

### IoU (Intersection over Union)

```python
IoU = 交集面积 / 并集面积
> 0.5 通常认为检测正确
```

### Non-max Suppression

```python
# 去掉重叠的冗余检测框
# 保留置信度最高的框
```

---

