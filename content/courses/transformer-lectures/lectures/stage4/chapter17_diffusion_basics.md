# 第17章：Diffusion 基础 — 从噪声中学习 | Chapter 17: Diffusion Basics — Learning from Noise

> **阶段定位** | **Stage**: 第四阶段 — Diffusion
> **预计学时** | **Duration**: 6~8 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 理解 Diffusion 模型的核心思想：学习去噪
- 掌握 Forward Diffusion（加噪）和 Reverse Diffusion（去噪）的过程
- 理解 Noise Prediction Network 的训练目标
- 建立 Diffusion = 高维空间中的逐步去噪 的直觉

**English:**
- Understand core idea of Diffusion models: learning to denoise
- Master Forward Diffusion (adding noise) and Reverse Diffusion (denoising) processes
- Understand training objective of Noise Prediction Network
- Build intuition that Diffusion = gradual denoising in high-dimensional space

---

## 17.1 Diffusion 的本质 | The Essence of Diffusion

### 中文解释

**Diffusion 模型不是直接生成图片，而是学习"去噪"的过程。**

核心思想类比：
```
 sculptor（雕塑家）：不是从石头中"挖"出雕像，
 而是逐步打磨，从粗糙到精细。

 Diffusion：不是直接生成图片，
 而是从纯噪声中逐步"去噪"，恢复出图片。
```

### English Explanation

**Diffusion models don't directly generate images; they learn the "denoising" process.**

Core idea analogy:
```
 A sculptor doesn't "carve out" a statue from stone,
 but gradually polishes from rough to fine.

 Diffusion: doesn't directly generate an image,
 but gradually "denoises" from pure noise to recover an image.
```

### 与 Transformer 的对比 | Comparison with Transformer

| 特性 | Transformer (GPT) | Diffusion (SD) |
|------|-------------------|----------------|
| 生成方式 | 自回归（逐 token）| 并行（逐步去噪）|
| 输入 | 文本 token | 噪声图片 |
| 输出 | 下一个 token | 去噪后的图片 |
| 核心操作 | Attention | UNet 去噪 |
| 条件控制 | Prompt | Prompt via Cross-Attention |

| Feature | Transformer (GPT) | Diffusion (SD) |
|---------|-------------------|----------------|
| Generation | Autoregressive (token by token) | Parallel (gradual denoising) |
| Input | Text tokens | Noisy image |
| Output | Next token | Denoised image |
| Core operation | Attention | UNet denoising |
| Conditioning | Prompt | Prompt via Cross-Attention |

---

## 17.2 Forward Diffusion — 加噪过程 | Forward Diffusion — Adding Noise

### 中文解释

**Forward Diffusion = 给图片逐步添加高斯噪声，直到变成纯噪声**

公式：
```
x_t = √(1-β_t) × x_{t-1} + √β_t × ε

其中：| where:
- x_0: 原始图片 | original image
- x_T: 纯噪声（T 很大时）| pure noise (when T is large)
- β_t: 噪声调度（从小到大）| noise schedule (small to large)
- ε: 标准高斯噪声 | standard Gaussian noise
```

重参数化（更高效的计算）：
```
x_t = √(ᾱ_t) × x_0 + √(1-ᾱ_t) × ε

其中 ᾱ_t = ∏_{i=1}^t (1-β_i) | where ᾱ_t = product of (1-β_i)
```

### English Explanation

**Forward Diffusion = Gradually add Gaussian noise to image until it becomes pure noise**

Formula:
```
x_t = √(1-β_t) × x_{t-1} + √β_t × ε

where:
- x_0: original image
- x_T: pure noise (when T is large)
- β_t: noise schedule (small to large)
- ε: standard Gaussian noise
```

Reparameterization (more efficient computation):
```
x_t = √(ᾱ_t) × x_0 + √(1-ᾱ_t) × ε

where ᾱ_t = ∏_{i=1}^t (1-β_i)
```

### 代码案例 | Code Example

```python
import torch
import torch.nn.functional as F

class ForwardDiffusion:
    """前向扩散过程 | Forward diffusion process"""
    
    def __init__(self, num_timesteps=1000, beta_start=1e-4, beta_end=0.02):
        self.num_timesteps = num_timesteps
        
        # 线性噪声调度 | Linear noise schedule
        self.betas = torch.linspace(beta_start, beta_end, num_timesteps)
        
        # 预计算 ᾱ_t | Precompute ᾱ_t
        self.alphas = 1.0 - self.betas
        self.alphas_cumprod = torch.cumprod(self.alphas, dim=0)   # ᾱ_t
        self.alphas_cumprod_prev = F.pad(self.alphas_cumprod[:-1], (1, 0), value=1.0)
        
        # 预计算扩散过程需要的值 | Precompute values needed for diffusion
        self.sqrt_alphas_cumprod = torch.sqrt(self.alphas_cumprod)
        self.sqrt_one_minus_alphas_cumprod = torch.sqrt(1.0 - self.alphas_cumprod)
    
    def add_noise(self, x_0, t, noise=None):
        """
        在任意时刻 t 加噪 | Add noise at arbitrary timestep t
        x_0: (batch, channels, height, width) — 原始图片 | Original image
        t: (batch,) — 时间步 | Timestep
        """
        if noise is None:
            noise = torch.randn_like(x_0)
        
        # 获取对应时间步的系数 | Get coefficients for corresponding timestep
        sqrt_alpha = self.sqrt_alphas_cumprod[t].view(-1, 1, 1, 1)
        sqrt_one_minus_alpha = self.sqrt_one_minus_alphas_cumprod[t].view(-1, 1, 1, 1)
        
        # x_t = √(ᾱ_t) × x_0 + √(1-ᾱ_t) × ε
        x_t = sqrt_alpha * x_0 + sqrt_one_minus_alpha * noise
        
        return x_t, noise

# 测试 | Test
diffusion = ForwardDiffusion(num_timesteps=1000)

# 模拟一张图片 | Simulate an image
x_0 = torch.randn(4, 3, 32, 32)   # 4张 32x32 的 RGB 图片

# 不同时间步的加噪结果 | Noise addition at different timesteps
for t_val in [0, 250, 500, 750, 999]:
    t = torch.tensor([t_val] * 4)
    x_t, noise = diffusion.add_noise(x_0, t)
    print(f"t={t_val:4d}: mean={x_t.mean():.3f}, std={x_t.std():.3f}")

# 输出趋势：| Output trend:
# t=   0: 接近原始图片 | Close to original
# t= 999: 接近标准正态 | Close to standard normal
```

---

## 17.3 Reverse Diffusion — 去噪过程 | Reverse Diffusion — Denoising

### 中文解释

**Reverse Diffusion = 从纯噪声逐步恢复图片**

如果我们知道每步添加的噪声，就可以逆向去噪：
```
x_{t-1} = (x_t - √β_t × ε_θ(x_t, t)) / √(1-β_t)
```

但现实中我们不知道噪声，所以训练一个神经网络来预测：
```
ε_θ(x_t, t) ≈ ε（真实噪声）
```

### English Explanation

**Reverse Diffusion = Gradually recover image from pure noise**

If we knew the noise added at each step, we could reverse it:
```
x_{t-1} = (x_t - √β_t × ε_θ(x_t, t)) / √(1-β_t)
```

But in reality we don't know the noise, so we train a neural network to predict it:
```
ε_θ(x_t, t) ≈ ε (true noise)
```

### 代码案例：采样过程 | Code Example: Sampling Process

```python
import torch

class ReverseDiffusion:
    """反向扩散（采样）| Reverse diffusion (sampling)"""
    
    def __init__(self, diffusion_model, forward_diffusion):
        self.model = diffusion_model   # 噪声预测网络 | Noise prediction network
        self.fd = forward_diffusion
    
    @torch.no_grad()
    def sample(self, shape, device='cpu'):
        """
        从纯噪声生成图片 | Generate image from pure noise
        shape: (batch, channels, height, width)
        """
        # 从纯噪声开始 | Start from pure noise
        x_t = torch.randn(shape, device=device)
        
        # 逐步去噪 | Gradual denoising
        for t in reversed(range(self.fd.num_timesteps)):
            t_batch = torch.full((shape[0],), t, device=device, dtype=torch.long)
            
            # 预测噪声 | Predict noise
            predicted_noise = self.model(x_t, t_batch)
            
            # 计算去噪后的 x_{t-1} | Compute denoised x_{t-1}
            alpha = self.fd.alphas[t]
            alpha_cumprod = self.fd.alphas_cumprod[t]
            beta = self.fd.betas[t]
            
            # 去噪公式 | Denoising formula
            x_t = (x_t - beta / torch.sqrt(1 - alpha_cumprod) * predicted_noise) / torch.sqrt(alpha)
            
            # 添加少量噪声（最后一步除外）| Add small noise (except last step)
            if t > 0:
                noise = torch.randn_like(x_t)
                sigma = torch.sqrt(beta)
                x_t = x_t + sigma * noise
        
        return x_t
```

---

## 17.4 训练目标 — 噪声预测 | Training Objective — Noise Prediction

### 中文解释

**训练目标：让网络预测 Forward Diffusion 中添加的噪声**

```
Loss = MSE(ε_θ(x_t, t), ε)

其中：| where:
- ε_θ(x_t, t): 网络预测的噪声 | Network predicted noise
- ε: 实际添加的噪声（Forward 时使用）| Actually added noise (used in Forward)
- x_t: 加噪后的图片 | Noisy image
```

### English Explanation

**Training objective: Make network predict the noise added in Forward Diffusion**

```
Loss = MSE(ε_θ(x_t, t), ε)

where:
- ε_θ(x_t, t): noise predicted by network
- ε: actually added noise (used in Forward)
- x_t: noisy image
```

### 代码案例：训练循环 | Code Example: Training Loop

```python
import torch
import torch.nn as nn

class SimpleUNet(nn.Module):
    """简化的 UNet（噪声预测网络）| Simplified UNet (noise prediction network)"""
    
    def __init__(self, in_channels=3, time_emb_dim=256):
        super().__init__()
        # 时间步嵌入 | Time step embedding
        self.time_embed = nn.Sequential(
            nn.Linear(1, time_emb_dim),
            nn.SiLU(),
            nn.Linear(time_emb_dim, time_emb_dim),
        )
        
        # 简化的编码器-解码器 | Simplified encoder-decoder
        self.encoder = nn.Sequential(
            nn.Conv2d(in_channels, 64, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(64, 64, 3, padding=1),
        )
        
        self.decoder = nn.Sequential(
            nn.Conv2d(64, 64, 3, padding=1),
            nn.ReLU(),
            nn.Conv2d(64, in_channels, 3, padding=1),
        )
    
    def forward(self, x, t):
        """
        x: (batch, channels, H, W) — 加噪图片 | Noisy image
        t: (batch,) — 时间步 | Timestep
        """
        # 时间嵌入 | Time embedding
        t_emb = self.time_embed(t.float().unsqueeze(-1) / 1000)
        
        # 简化的前向（实际 UNet 更复杂）| Simplified forward (real UNet is more complex)
        h = self.encoder(x)
        # 这里应该融合时间嵌入 | Time embedding should be fused here
        out = self.decoder(h)
        
        return out

# ========== 训练循环 | Training Loop ==========
def train_diffusion_model(model, dataloader, diffusion, num_epochs=10):
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
    criterion = nn.MSELoss()
    
    for epoch in range(num_epochs):
        total_loss = 0
        
        for batch_idx, (x_0, _) in enumerate(dataloader):
            batch_size = x_0.size(0)
            
            # 随机选择时间步 | Randomly select timesteps
            t = torch.randint(0, diffusion.num_timesteps, (batch_size,))
            
            # 加噪 | Add noise
            x_t, noise = diffusion.add_noise(x_0, t)
            
            # 预测噪声 | Predict noise
            predicted_noise = model(x_t, t)
            
            # 计算 loss | Compute loss
            loss = criterion(predicted_noise, noise)
            
            # 优化 | Optimize
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
        
        avg_loss = total_loss / len(dataloader)
        print(f"Epoch {epoch}: Loss = {avg_loss:.4f}")

print("Diffusion 训练目标：| Training objective:")
print("  输入：加噪图片 x_t 和时间步 t")
print("  输出：预测的噪声 ε_θ")
print("  Loss: MSE(预测噪声, 真实噪声)")
print("  Input: noisy image x_t and timestep t")
print("  Output: predicted noise ε_θ")
print("  Loss: MSE(predicted noise, true noise)")
```

---

## 17.5 Diffusion 的直观理解 | Intuitive Understanding of Diffusion

### 中文解释

**Diffusion 可以看作高维空间中的梯度下降：**

```
高维空间中的"概率地形"：| "Probability landscape" in high-dimensional space:

噪声图片在概率低的地方（山谷外）| Noisy images are in low-probability areas (outside valleys)
真实图片在概率高的地方（山谷底）| Real images are in high-probability areas (valley bottom)

去噪过程 = 从随机位置向"真实图片流形"滑动
Denoising process = sliding from random positions toward "real image manifold"
```

### English Explanation

**Diffusion can be seen as gradient descent in high-dimensional space:**

```
"Probability landscape" in high-dimensional space:

Noisy images are in low-probability areas (outside valleys)
Real images are in high-probability areas (valley bottom)

Denoising process = sliding from random positions toward "real image manifold"
```

---

## 本章总结 | Chapter Summary

**中文：**
- Diffusion = 学习从噪声中恢复图片
- Forward：x_0 → x_T（加噪）| Forward: x_0 → x_T (add noise)
- Reverse：x_T → x_0（去噪）| Reverse: x_T → x_0 (denoise)
- 训练目标：预测 Forward 中添加的噪声
- UNet 是噪声预测网络的标准选择

**English:**
- Diffusion = learning to recover images from noise
- Forward: x_0 → x_T (add noise)
- Reverse: x_T → x_0 (denoise)
- Training objective: predict noise added in Forward
- UNet is the standard choice for noise prediction network

---

## 课后练习 | Homework

1. **Forward Diffusion**：实现加噪过程，可视化同一图片在不同 t 下的噪声程度
2. **噪声预测**：实现简化的噪声预测网络，训练一个小数据集
3. **采样过程**：实现完整的采样循环，从纯噪声生成图片
4. **调度器实验**：比较 linear 和 cosine 两种噪声调度器的差异
5. **思考题**：为什么 Diffusion 训练时只需要一步加噪，而不需要像推理那样循环 T 步？
