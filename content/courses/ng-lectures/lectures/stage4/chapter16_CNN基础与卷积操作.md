# 第16章 CNN基础与卷积操作

## 目标

掌握计算机视觉的核心工具。

---

## 必学内容

### 卷积操作

```python
# 滤波器在图像上滑动，提取局部特征
output[i,j] = ΣΣ filter[m,n] * input[i+m, j+n]
```

###  padding 与 stride

```python
# Valid convolution: 不填充
# Same convolution: 填充使输出尺寸不变
# Stride: 步长，控制下采样速度
```

### 通道维度

```python
# 彩色图像: (height, width, channels=3)
# 卷积核: (f, f, c_in, c_out)
```

### 池化层

```python
# Max Pooling: 保留最显著特征
# Average Pooling: 保留整体信息
```

---

## 必须真正理解

### 为什么卷积有效

```
参数共享：同一个滤波器扫完整张图
稀疏连接：每个输出只连局部输入
平移等变：物体移动，特征跟着移动
```

---

