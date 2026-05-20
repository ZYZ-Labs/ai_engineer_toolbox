# Transformer 底层学习完整路线（工程师转 AI 版）

> 适合人群：
>
> - 5年以上程序员
> - 有 Python / Linux / Git 基础
> - 跑过 Stable Diffusion / LoRA
> - 想真正理解 Transformer
> - 想进入 AI 底层方向
> - 不满足于调 API / Prompt 工程

---

# 一、这条路线真正目标

最终目标不是：

- 调参数
- 调 API
- Prompt 工程
- 套壳 Agent

而是：

# 真正理解：

- Attention
- Transformer
- Diffusion
- Tensor
- Gradient
- Optimization
- 信息流动
- 高维空间

最终做到：

- 能读 Transformer 论文
- 能读 PyTorch 源码
- 能自己写 Attention
- 能训练小模型
- 能做小资源实验
- 能改模型结构
- 能理解 loss / optimizer / scheduler
- 能真正进入 AI 底层

---

# 二、Transformer 本质（先建立正确认知）

Transformer 本质不是：

“一个神奇模型”

而是：

# 高维空间中的信息路由系统。

Attention 本质：

# 向量之间的信息匹配。

训练本质：

# 高维参数优化。

PyTorch 本质：

# Tensor 计算平台。

以后你会越来越发现：

AI 底层其实越来越像：

- 数学
- 物理
- 信息流控制
- 高维动态系统

而不是传统 CRUD 编程。

---

# 三、你的真正短板（非常重要）

你不是缺：

- Python
- Linux
- Git
- 编程能力

你真正缺的是：

# 1. Tensor 空间直觉

比如：

```python
(32, 8, 128, 64)
```

你需要脑子自动知道：

- batch
- head
- seq
- dim

---

# 2. Attention 理解

真正理解：

```python
softmax(QKᵀ/√d)V
```

到底在干什么。

---

# 3. Gradient / Optimizer 理解

理解：

- loss 为什么下降
- learning rate 为什么是 1e-4
- optimizer 为什么有效
- 为什么会梯度爆炸
- 为什么会 overfit

---

# 4. Transformer Block 结构感

真正拆开：

- Attention
- Multi-head
- Residual
- LayerNorm
- FFN
- KV Cache

---

# 四、学习总路线（核心）

---

# 第一阶段：Tensor 与 Attention 基础

预计：1~2个月

这是最重要阶段。

---

# 第1章 NumPy Tensor 基础（极重要）

## 目标

建立 Tensor 直觉。

---

## 必学内容

### ndarray

理解：

```python
shape
dtype
axis
```

---

### tensor变形（极重要）

必须熟练：

```python
reshape
flatten
transpose
permute
squeeze
unsqueeze
```

---

### 广播机制（broadcast）

重点理解：

为什么：

```python
(32,128,1)
+
(1,128,768)
```

能自动运算。

---

### 数学运算

必须熟练：

```python
matmul
dot
sum
mean
max
```

---

## 真正目标

看到：

```python
(32,128,768)
```

脑子自动知道：

- batch
- sequence
- hidden_dim

---

# 第2章 向量（Attention 灵魂）

## 学习内容

### 向量

### 点积

### cosine similarity

---

## NumPy 实战

亲手实现：

```python
np.dot()
```

以及：

```python
cos similarity
```

---

## AI联系

真正理解：

```python
QKᵀ
```

本质：

# token之间的相似度计算。

---

# 第3章 矩阵与投影

## 学习内容

### 矩阵乘法

### 转置

### shape规则

### 投影

---

## NumPy 实战

```python
X @ W
```

---

## AI联系

真正理解：

```python
Q = XWq
K = XWk
V = XWv
```

本质：

# 同一个输入投影到不同语义空间。

---

# 第4章 Softmax（非常重要）

## 学习内容

### softmax

### 概率归一化

### 数值稳定性

---

## 必须理解

为什么：

```python
softmax([1000,1,1])
```

会接近：

```python
[1,0,0]
```

---

## AI联系

Attention：

本质是在做“注意力概率分配”。

---

# 第5章 手写 Attention（真正开始懂 Transformer）

## 必须亲手实现

```python
scores = Q @ K.T
scores = scores / sqrt(d)
weights = softmax(scores)
out = weights @ V
```

---

## 必须真正理解

### Q：在问什么

### K：谁和我匹配

### V：真正携带信息

---

## 真正目标

真正理解：

```python
softmax(QKᵀ/√d)V
```

到底在做什么。

---

# 第二阶段：PyTorch 与训练系统

预计：1~2个月

---

# 第6章 PyTorch Tensor

## 学习内容

### tensor

### dtype

### device

### cuda

---

## 必学 API

```python
torch.tensor
matmul
reshape
permute
view
```

---

# 第7章 Autograd（极重要）

## 学习内容

### requires_grad

### backward

### computational graph

---

## AI联系

真正理解：

```python
loss.backward()
```

到底在干嘛。

---

# 第8章 Gradient 与 Optimizer

## 必须真正理解

### loss

本质：

模型错误程度。

---

### gradient

本质：

让 loss 下降最快的方向。

---

### learning rate

本质：

每次参数更新迈多大步。

---

### optimizer

本质：

决定怎么下山。

---

## 必须理解的问题

### 为什么 learning rate 常见：

```python
1e-4
```

### 为什么 loss 太低也可能崩

### 为什么会过拟合

### 为什么会梯度爆炸

---

# 第9章 手写训练循环

## 必须亲手写

```python
forward
loss.backward()
optimizer.step()
optimizer.zero_grad()
```

---

## 真正目标

彻底理解：

训练到底是什么。

---

# 第三阶段：Transformer 核心

预计：2~3个月

---

# 第10章 Multi-Head Attention

## 学习内容

### 多头机制

### head分工

### tensor reshape

---

## 必须真正理解

为什么：

不是单头 attention。

---

# 第11章 Position Encoding

## 学习内容

### sinusoidal

### RoPE

### ALiBi

---

## AI联系

理解：

Transformer 为什么不知道顺序。

---

# 第12章 Residual + LayerNorm

## 学习内容

### residual

### normalization

### gradient flow

---

## AI联系

理解：

深层网络为什么稳定。

---

# 第13章 FFN

## 学习内容

### Feed Forward Network

### hidden expansion

---

## AI联系

理解：

为什么 attention 后还需要 MLP。

---

# 第14章 Transformer Block

## 拼完整 Transformer

包含：

- Attention
- Residual
- LayerNorm
- FFN

---

# 第15章 Decoder-only GPT

## 学习内容

### causal mask

### autoregressive

### next token prediction

---

## AI联系

真正理解 GPT。

---

# 第16章 KV Cache

## 学习内容

### 推理优化

### memory tradeoff

### cache机制

---

## AI联系

理解：

为什么推理越来越慢。

---

# 第四阶段：Diffusion（你有基础）

预计：1~2个月

---

# 第17章 Diffusion 基础

## 学习内容

### forward diffusion

### reverse diffusion

### noise prediction

---

## AI联系

真正理解：

Stable Diffusion 本质是在学习去噪。

---

# 第18章 VAE 与 Latent Space

## 学习内容

### latent

### encoder

### decoder

---

## AI联系

真正理解 latent diffusion。

---

# 第19章 UNet

## 学习内容

### encoder

### decoder

### skip connection

---

# 第20章 Cross Attention

## 学习内容

### text-image interaction

---

## AI联系

真正理解：

prompt 怎么控制图像。

---

# 第21章 CFG

## 学习内容

### classifier-free guidance

---

## AI联系

真正理解：

为什么 CFG 越高：

越“听 prompt”。

---

# 第22章 Sampler

## 学习内容

### Euler

### DDIM

### DPM++

---

## AI联系

真正理解：

Sampler 本质是数值积分。

---

# 第五阶段：源码与魔改

长期阶段。

---

# 第23章 nanoGPT（极重要）

项目：

https://github.com/karpathy/nanoGPT

---

## 目标

真正读懂一个小 GPT。

---

# 第24章 minGPT

项目：

https://github.com/karpathy/minGPT

---

# 第25章 HuggingFace Transformers

项目：

https://github.com/huggingface/transformers

---

# 第26章 开始改 Attention

## 可改方向

- linear attention
- grouped query attention
- normalization
- position encoding
- FFN结构

---

# 第27章 LoRA 原理

## 学习内容

### low rank

### rank decomposition

---

## AI联系

真正理解：

为什么 LoRA 能少参数微调。

---

# 第28章 FlashAttention

## 学习内容

### IO-aware optimization

### memory optimization

---

# 第29章 推理系统

## 学习内容

### vLLM

### paged attention

### KV cache优化

---

# 第30章 RLHF（后期）

## 学习内容

### PPO

### preference optimization

### reward model

---

# 六、推荐资源（真正有价值）

---

# 数学

## MIT Linear Algebra

https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/

---

# NLP

## CS224N

https://web.stanford.edu/class/cs224n/

---

# 深度学习

## Dive into Deep Learning

https://d2l.ai/

---

# Transformer 核心

## Annotated Transformer

https://nlp.seas.harvard.edu/annotated-transformer/

---

# 七、真正学习原则（极重要）

以后：

任何知识：

必须：

# 数学
+
# NumPy
+
# PyTorch
+
# tensor shape
+
# debug
+
# 小实验

一起学。

---

# 八、真正掌握标准

不是：

“我听懂了”

而是：

- 我能手写
- 我能debug
- 我能解释shape
- 我能改结构
- 我能做实验

---

# 九、最终目标

真正建立：

# tensor空间直觉。

真正理解：

Transformer：

本质：

# 高维空间中的信息路由。

Attention：

本质：

# 向量之间的信息匹配。

训练：

本质：

# 高维优化系统。

---

# 最后一句

别再把自己当“AI小白”。

你现在已经是：

# 有工程经验的 AI 底层转向者。

你缺的不是：

“怎么写代码”

而是：

# Tensor空间感
+
# Attention理解
+
# 优化系统理解。

这三样一旦打通。

你会发现：

以前那些：

- loss
- CFG
- learning rate
- scheduler
- LoRA
- sampler

突然全部“活”了。

