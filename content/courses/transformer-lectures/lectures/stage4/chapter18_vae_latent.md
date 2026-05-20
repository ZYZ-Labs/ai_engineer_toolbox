# 第18章：VAE 与 Latent Space — 在压缩空间中扩散 | Chapter 18: VAE and Latent Space — Diffusing in Compressed Space

> **阶段定位** | **Stage**: 第四阶段 — Diffusion
> **预计学时** | **Duration**: 4~6 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 理解为什么 Stable Diffusion 不在像素空间而在潜空间（Latent Space）扩散
- 掌握 VAE 的 Encoder/Decoder 结构
- 理解 Latent Diffusion 的优势
- 能够计算 Latent Space 的维度节省

**English:**
- Understand why Stable Diffusion diffuses in latent space instead of pixel space
- Master VAE Encoder/Decoder structure
- Understand advantages of Latent Diffusion
- Be able to compute dimension savings of Latent Space

---

## 18.1 像素空间的问题 | Problems with Pixel Space

### 中文解释

**在像素空间直接做 Diffusion 的问题：**

1. **维度太高**：512×512×3 = 786,432 维
2. **计算量大**：每步都要处理这么多像素
3. **冗余信息多**：相邻像素高度相关

**解决：先在潜空间压缩，再在潜空间做 Diffusion**

### English Explanation

**Problems with doing Diffusion directly in pixel space:**

1. **Too high dimensionality**: 512×512×3 = 786,432 dimensions
2. **Too much computation**: Must process so many pixels every step
3. **Too much redundancy**: Adjacent pixels are highly correlated

**Solution: First compress into latent space, then do Diffusion in latent space**

---

## 18.2 VAE — 变分自编码器 | VAE — Variational Autoencoder

### 中文解释

**VAE = Encoder + Decoder**

```
图片 x ──Encoder──→ 潜变量 z ──Decoder──→ 重建图片 x'
       (压缩)           (低维)           (解压)
```

Stable Diffusion 的 VAE：
- 下采样倍数：8×（512×512 → 64×64）
- 通道数：4
- 潜空间维度：64×64×4 = 16,384（vs 像素 786,432，压缩 48 倍）

### English Explanation

**VAE = Encoder + Decoder**

```
Image x ──Encoder──→ Latent z ──Decoder──→ Reconstructed image x'
         (compress)     (low-dim)          (decompress)
```

Stable Diffusion's VAE:
- Downsampling factor: 8× (512×512 → 64×64)
- Channels: 4
- Latent dimension: 64×64×4 = 16,384 (vs pixel 786,432, compressed 48×)

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

class VAEEncoder(nn.Module):
    """VAE 编码器 — 将图片压缩到潜空间 | VAE Encoder — compress image to latent space"""
    
    def __init__(self, in_channels=3, latent_channels=4):
        super().__init__()
        # 下采样卷积层 | Downsampling convolution layers
        self.encoder = nn.Sequential(
            # 512x512 → 256x256 | 512x512 → 256x256
            nn.Conv2d(in_channels, 128, 3, stride=2, padding=1),
            nn.SiLU(),
            # 256x256 → 128x128
            nn.Conv2d(128, 256, 3, stride=2, padding=1),
            nn.SiLU(),
            # 128x128 → 64x64
            nn.Conv2d(256, 512, 3, stride=2, padding=1),
            nn.SiLU(),
            # 64x64 → 64x64 (调整通道) | 64x64 → 64x64 (adjust channels)
            nn.Conv2d(512, latent_channels * 2, 3, padding=1),   # ×2 for mean and logvar
        )
    
    def forward(self, x):
        """
        x: (batch, 3, 512, 512)
        返回: mean, logvar (用于采样 z) | Returns: mean, logvar (for sampling z)
        """
        h = self.encoder(x)
        # 分成 mean 和 logvar | Split into mean and logvar
        mean, logvar = h.chunk(2, dim=1)
        return mean, logvar

class VAEDecoder(nn.Module):
    """VAE 解码器 — 从潜空间恢复图片 | VAE Decoder — recover image from latent space"""
    
    def __init__(self, latent_channels=4, out_channels=3):
        super().__init__()
        self.decoder = nn.Sequential(
            # 64x64 → 64x64 | 64x64 → 64x64
            nn.Conv2d(latent_channels, 512, 3, padding=1),
            nn.SiLU(),
            # 64x64 → 128x128 | 64x64 → 128x128
            nn.ConvTranspose2d(512, 256, 4, stride=2, padding=1),
            nn.SiLU(),
            # 128x128 → 256x256
            nn.ConvTranspose2d(256, 128, 4, stride=2, padding=1),
            nn.SiLU(),
            # 256x256 → 512x512
            nn.ConvTranspose2d(128, out_channels, 4, stride=2, padding=1),
        )
    
    def forward(self, z):
        """
        z: (batch, 4, 64, 64)
        返回: (batch, 3, 512, 512)
        """
        return self.decoder(z)

class VAE(nn.Module):
    """完整 VAE | Complete VAE"""
    
    def __init__(self):
        super().__init__()
        self.encoder = VAEEncoder()
        self.decoder = VAEDecoder()
    
    def reparameterize(self, mean, logvar):
        """重参数化技巧 | Reparameterization trick"""
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mean + eps * std
    
    def encode(self, x):
        """编码到潜空间 | Encode to latent space"""
        mean, logvar = self.encoder(x)
        z = self.reparameterize(mean, logvar)
        return z, mean, logvar
    
    def decode(self, z):
        """从潜空间解码 | Decode from latent space"""
        return self.decoder(z)
    
    def forward(self, x):
        z, mean, logvar = self.encode(x)
        x_recon = self.decode(z)
        return x_recon, mean, logvar

# 测试维度变化 | Test dimension changes
vae = VAE()
x = torch.randn(1, 3, 512, 512)

z, mean, logvar = vae.encode(x)
print(f"Input:  {x.shape} = {x.numel():,} elements")
print(f"Latent: {z.shape} = {z.numel():,} elements")
print(f"Compression ratio: {x.numel() / z.numel():.1f}x")

x_recon = vae.decode(z)
print(f"Output: {x_recon.shape} = {x_recon.numel():,} elements")
```

---

## 18.3 Latent Diffusion — 潜空间扩散 | Latent Diffusion

### 中文解释

**Latent Diffusion = VAE + Diffusion in Latent Space**

流程：
```
1. 训练 VAE（Encoder + Decoder）
2. 用 Encoder 将所有图片编码到潜空间 z
3. 在 z 上做 Diffusion（而不是像素 x 上）
4. 生成时，从潜空间采样 z，再用 Decoder 解码成图片
```

### English Explanation

**Latent Diffusion = VAE + Diffusion in Latent Space**

Process:
```
1. Train VAE (Encoder + Decoder)
2. Encode all images to latent space z using Encoder
3. Do Diffusion on z (not on pixel x)
4. During generation, sample z from latent space, then decode to image using Decoder
```

### 代码案例 | Code Example

```python
import torch

class LatentDiffusion:
    """潜空间扩散 | Latent Diffusion"""
    
    def __init__(self, vae, unet, diffusion):
        self.vae = vae
        self.unet = unet
        self.diffusion = diffusion
    
    def train_step(self, x_0):
        """
        训练一步 | One training step
        x_0: (batch, 3, 512, 512) — 原始图片 | Original image
        """
        with torch.no_grad():
            # 编码到潜空间 | Encode to latent space
            z_0, _, _ = self.vae.encode(x_0)
        
        # 在潜空间做 Diffusion | Do Diffusion in latent space
        batch_size = z_0.size(0)
        t = torch.randint(0, self.diffusion.num_timesteps, (batch_size,))
        
        z_t, noise = self.diffusion.add_noise(z_0, t)
        predicted_noise = self.unet(z_t, t)
        
        loss = torch.nn.functional.mse_loss(predicted_noise, noise)
        return loss
    
    @torch.no_grad()
    def generate(self, batch_size=1):
        """生成图片 | Generate image"""
        # 在潜空间采样 | Sample in latent space
        z_shape = (batch_size, 4, 64, 64)
        z = self.diffusion.sample(self.unet, z_shape)
        
        # 解码到像素空间 | Decode to pixel space
        x = self.vae.decode(z)
        return x

# 维度对比 | Dimension comparison
print("\n维度对比 | Dimension comparison:")
print("Pixel Diffusion:")
print("  输入: (3, 512, 512) = 786,432 维")
print("  Input: (3, 512, 512) = 786,432 dims")
print("\nLatent Diffusion (Stable Diffusion):")
print("  输入: (4, 64, 64) = 16,384 维")
print("  Input: (4, 64, 64) = 16,384 dims")
print("  压缩比: 48x")
print("  Compression: 48x")
```

---

## 18.4 为什么 Latent Diffusion 更好？| Why Is Latent Diffusion Better?

| 优势 | 说明 |
|------|------|
| 计算效率 | 潜空间维度低 48 倍，每步计算快很多 |
| 内存效率 | 存储和传输更少 |
| 训练稳定 | 潜空间更紧凑，学习更容易 |
| 语义丰富 | VAE 编码器已经提取了语义特征 |

| Advantage | Explanation |
|-----------|-------------|
| Computation efficiency | Latent space is 48× smaller, much faster per step |
| Memory efficiency | Less storage and transfer |
| Training stability | Latent space is more compact, easier to learn |
| Semantic richness | VAE encoder already extracted semantic features |

---

## 本章总结 | Chapter Summary

**中文：**
- VAE 将图片从像素空间压缩到潜空间
- Stable Diffusion 的压缩比约为 48x
- Latent Diffusion = VAE + 潜空间 Diffusion
- 潜空间扩散显著提升了计算效率

**English:**
- VAE compresses images from pixel space to latent space
- Stable Diffusion's compression ratio is about 48×
- Latent Diffusion = VAE + diffusion in latent space
- Latent space diffusion significantly improves computational efficiency

---

## 课后练习 | Homework

1. **VAE 实现**：实现一个简化版 VAE，训练 MNIST 数据集
2. **压缩比计算**：计算不同输入分辨率下的潜空间维度
3. **重建质量**：比较 VAE 重建图片与原始图片的 MSE
4. **Latent 可视化**：将 MNIST 的潜变量降到 2D，观察分布
5. **思考题**：为什么 VAE 的潜变量通常用 4 通道，而不是 3 通道？
