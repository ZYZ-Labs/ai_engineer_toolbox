# 第19章：UNet — Diffusion 的骨干网络 | Chapter 19: UNet — The Backbone of Diffusion

> **阶段定位** | **Stage**: 第四阶段 — Diffusion
> **预计学时** | **Duration**: 5~7 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 理解 UNet 的 Encoder-Decoder 结构和 Skip Connection 的作用
- 掌握 UNet 中时间步条件的注入方式
- 理解 UNet 为什么在 Diffusion 中如此有效
- 能够手写一个简化版 UNet

**English:**
- Understand UNet's Encoder-Decoder structure and role of Skip Connections
- Master timestep conditioning injection in UNet
- Understand why UNet is so effective in Diffusion
- Be able to write a simplified UNet by hand

---

## 19.1 UNet 结构概览 | UNet Structure Overview

### 中文解释

**UNet = Encoder + Bottleneck + Decoder + Skip Connections**

形状像字母 "U"：
```
输入 (64x64)
    ↓ [Conv + Down]
  32x32 ────────┐
    ↓ [Conv + Down]  │
  16x16 ────────┐    │ Skip Connections
    ↓ [Conv + Down]  │    │
   8x8  ────────┘    │    │
    ↓ [Bottleneck]   │    │
   8x8              │    │
    ↑ [Conv + Up]   │    │
  16x16 ←───────────┘    │
    ↑ [Conv + Up]        │
  32x32 ←────────────────┘
    ↑ [Conv + Up]
输出 (64x64)
```

### English Explanation

**UNet = Encoder + Bottleneck + Decoder + Skip Connections**

Shape like letter "U":
```
Input (64x64)
    ↓ [Conv + Down]
  32x32 ────────┐
    ↓ [Conv + Down]  │
  16x16 ────────┐    │ Skip Connections
    ↓ [Conv + Down]  │    │
   8x8  ────────┘    │    │
    ↓ [Bottleneck]   │    │
   8x8              │    │
    ↑ [Conv + Up]   │    │
  16x16 ←───────────┘    │
    ↑ [Conv + Up]        │
  32x32 ←────────────────┘
    ↑ [Conv + Up]
Output (64x64)
```

---

## 19.2 Skip Connection 的作用 | Role of Skip Connection

### 中文解释

**Skip Connection 解决的问题：**

1. **信息丢失**：Encoder 下采样时丢失细节
2. **梯度消失**：深层网络的梯度传播问题
3. **细节恢复**：Decoder 需要细节来生成高质量图片

**在 Diffusion 中尤其重要：**
- 去噪需要精确定位噪声位置
- Skip Connection 保留了不同分辨率的信息

### English Explanation

**Problems solved by Skip Connection:**

1. **Information loss**: Details lost during Encoder downsampling
2. **Gradient vanishing**: Gradient propagation in deep networks
3. **Detail recovery**: Decoder needs details to generate high-quality images

**Especially important in Diffusion:**
- Denoising needs precise noise location
- Skip Connection preserves information at different resolutions

---

## 19.3 简化 UNet 实现 | Simplified UNet Implementation

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

class TimeEmbedding(nn.Module):
    """时间步嵌入 | Timestep embedding"""
    
    def __init__(self, dim):
        super().__init__()
        self.dim = dim
        self.mlp = nn.Sequential(
            nn.Linear(dim, dim * 4),
            nn.SiLU(),
            nn.Linear(dim * 4, dim * 4),
        )
    
    def forward(self, t):
        """
        t: (batch,) — 时间步 | Timestep
        """
        # Sinusoidal 位置编码的变体 | Variant of sinusoidal position encoding
        half_dim = self.dim // 2
        emb = torch.log(torch.tensor(10000.0)) / (half_dim - 1)
        emb = torch.exp(torch.arange(half_dim, device=t.device) * -emb)
        emb = t[:, None] * emb[None, :]
        emb = torch.cat([torch.sin(emb), torch.cos(emb)], dim=-1)
        
        return self.mlp(emb)

class ResBlock(nn.Module):
    """残差块 + 时间条件 | Residual block + time conditioning"""
    
    def __init__(self, in_channels, out_channels, time_emb_dim):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3, padding=1)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, padding=1)
        
        self.time_mlp = nn.Linear(time_emb_dim, out_channels)
        
        if in_channels != out_channels:
            self.skip = nn.Conv2d(in_channels, out_channels, 1)
        else:
            self.skip = nn.Identity()
        
        self.norm1 = nn.GroupNorm(8, in_channels)
        self.norm2 = nn.GroupNorm(8, out_channels)
    
    def forward(self, x, t_emb):
        """
        x: (batch, C, H, W)
        t_emb: (batch, time_emb_dim) — 时间嵌入 | Time embedding
        """
        h = self.conv1(torch.relu(self.norm1(x)))
        
        # 注入时间信息 | Inject time information
        t = self.time_mlp(t_emb)[:, :, None, None]
        h = h + t
        
        h = self.conv2(torch.relu(self.norm2(h)))
        
        return h + self.skip(x)

class DownBlock(nn.Module):
    """下采样块 | Downsampling block"""
    
    def __init__(self, in_channels, out_channels, time_emb_dim):
        super().__init__()
        self.res = ResBlock(in_channels, out_channels, time_emb_dim)
        self.down = nn.Conv2d(out_channels, out_channels, 3, stride=2, padding=1)
    
    def forward(self, x, t_emb):
        h = self.res(x, t_emb)
        return self.down(h), h   # 返回下采样后的结果和 skip 连接 | Return downsampled and skip

class UpBlock(nn.Module):
    """上采样块 | Upsampling block"""
    
    def __init__(self, in_channels, out_channels, time_emb_dim):
        super().__init__()
        self.up = nn.ConvTranspose2d(in_channels, out_channels, 4, stride=2, padding=1)
        self.res = ResBlock(out_channels * 2, out_channels, time_emb_dim)   # ×2 for skip concat
    
    def forward(self, x, skip, t_emb):
        h = self.up(x)
        h = torch.cat([h, skip], dim=1)   # Skip connection
        return self.res(h, t_emb)

class SimpleUNet(nn.Module):
    """简化 UNet | Simplified UNet"""
    
    def __init__(self, in_channels=4, out_channels=4, base_channels=64):
        super().__init__()
        time_emb_dim = base_channels * 4
        
        self.time_embed = TimeEmbedding(base_channels)
        
        # Encoder | Encoder
        self.down1 = DownBlock(in_channels, base_channels, time_emb_dim)
        self.down2 = DownBlock(base_channels, base_channels * 2, time_emb_dim)
        
        # Bottleneck
        self.bottleneck = ResBlock(base_channels * 2, base_channels * 2, time_emb_dim)
        
        # Decoder | Decoder
        self.up1 = UpBlock(base_channels * 2, base_channels, time_emb_dim)
        self.up2 = UpBlock(base_channels, base_channels, time_emb_dim)
        
        # Output
        self.out = nn.Conv2d(base_channels, out_channels, 1)
    
    def forward(self, x, t):
        """
        x: (batch, C, H, W) — 加噪潜变量 | Noisy latent
        t: (batch,) — 时间步 | Timestep
        """
        # 时间嵌入 | Time embedding
        t_emb = self.time_embed(t)
        
        # Encoder | Encoder
        h1, skip1 = self.down1(x, t_emb)    # h1: downsampled, skip1: for skip
        h2, skip2 = self.down2(h1, t_emb)
        
        # Bottleneck
        h = self.bottleneck(h2, t_emb)
        
        # Decoder | Decoder
        h = self.up1(h, skip2, t_emb)
        h = self.up2(h, skip1, t_emb)
        
        return self.out(h)

# 测试 | Test
unet = SimpleUNet(in_channels=4, out_channels=4, base_channels=64)
x = torch.randn(2, 4, 64, 64)
t = torch.randint(0, 1000, (2,))

output = unet(x, t)
print(f"Input shape:  {x.shape}")
print(f"Output shape: {output.shape}")
print(f"Parameters: {sum(p.numel() for p in unet.parameters()):,}")
```

---

## 19.4 UNet 的注意力升级 | UNet Attention Upgrade

### 中文解释

**现代 Diffusion UNet（如 Stable Diffusion）在 UNet 中加入了 Self-Attention：**

- 在较低分辨率的层加入 Self-Attention
- 让模型关注图片的全局结构
- 同时加入 Cross-Attention 来融合文本条件

### English Explanation

**Modern Diffusion UNet (like Stable Diffusion) adds Self-Attention inside UNet:**

- Add Self-Attention at lower-resolution layers
- Let model attend to global structure of image
- Also add Cross-Attention to fuse text conditioning

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

class SelfAttention(nn.Module):
    """空间自注意力 | Spatial self-attention"""
    
    def __init__(self, channels):
        super().__init__()
        self.channels = channels
        self.norm = nn.GroupNorm(8, channels)
        self.qkv = nn.Conv2d(channels, channels * 3, 1)
        self.out = nn.Conv2d(channels, channels, 1)
    
    def forward(self, x):
        """
        x: (batch, C, H, W)
        """
        B, C, H, W = x.shape
        h = self.norm(x)
        
        qkv = self.qkv(h)
        q, k, v = qkv.chunk(3, dim=1)
        
        # Reshape for attention | (B, C, H*W)
        q = q.view(B, C, H * W).transpose(1, 2)   # (B, HW, C)
        k = k.view(B, C, H * W).transpose(1, 2)
        v = v.view(B, C, H * W).transpose(1, 2)
        
        # Attention
        scores = torch.matmul(q, k.transpose(-2, -1)) / (C ** 0.5)
        weights = torch.softmax(scores, dim=-1)
        attn = torch.matmul(weights, v)   # (B, HW, C)
        
        # Reshape back
        attn = attn.transpose(1, 2).view(B, C, H, W)
        
        return x + self.out(attn)

# 加入 Self-Attention 的 ResBlock
class AttnResBlock(nn.Module):
    """带注意力的残差块 | Residual block with attention"""
    
    def __init__(self, channels, time_emb_dim):
        super().__init__()
        self.res = ResBlock(channels, channels, time_emb_dim)
        self.attn = SelfAttention(channels)
    
    def forward(self, x, t_emb):
        h = self.res(x, t_emb)
        return self.attn(h)
```

---

## 19.5 为什么 UNet 适合 Diffusion？| Why Is UNet Suitable for Diffusion?

| 特性 | UNet 优势 |
|------|----------|
| 多尺度处理 | Encoder-Decoder 同时处理多种分辨率 |
| 细节保留 | Skip Connection 保留细节信息 |
| 条件注入 | 时间步和文本条件容易嵌入 |
| 计算效率 | 相比纯 Transformer 更高效处理图片 |

| Feature | UNet Advantage |
|---------|---------------|
| Multi-scale processing | Encoder-Decoder handles multiple resolutions |
| Detail preservation | Skip Connection preserves detail info |
| Conditioning injection | Timestep and text conditions easily embedded |
| Computation efficiency | More efficient than pure Transformer for images |

---

## 本章总结 | Chapter Summary

**中文：**
- UNet = Encoder + Decoder + Skip Connection
- Skip Connection 保留细节，对去噪至关重要
- 时间条件通过 embedding + 广播注入
- Self-Attention 提升全局理解能力
- UNet 是多尺度图片处理的经典架构

**English:**
- UNet = Encoder + Decoder + Skip Connection
- Skip Connection preserves details, crucial for denoising
- Time condition injected via embedding + broadcasting
- Self-Attention improves global understanding
- UNet is a classic architecture for multi-scale image processing

---

## 课后练习 | Homework

1. **UNet 实现**：完整实现一个 UNet，验证各层的 shape 变化
2. **Skip Connection 实验**：对比有/无 Skip Connection 的重建质量
3. **时间条件**：可视化不同时间步的 embedding，观察变化规律
4. **注意力可视化**：实现 Self-Attention，可视化 attention map
5. **参数量分析**：计算 UNet 各部分的参数量占比
