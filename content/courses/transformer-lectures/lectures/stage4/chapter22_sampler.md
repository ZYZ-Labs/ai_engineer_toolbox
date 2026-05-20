# 第22章：Sampler — 数值积分的艺术 | Chapter 22: Sampler — The Art of Numerical Integration

> **阶段定位** | **Stage**: 第四阶段 — Diffusion
> **预计学时** | **Duration**: 4~6 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 理解 Sampler 的本质：数值积分求解微分方程
- 掌握 Euler、DDIM、DPM++ 三种采样器的原理
- 理解采样步数与生成质量的权衡
- 能够实现简化版采样器

**English:**
- Understand essence of Sampler: numerically integrating differential equations
- Master principles of Euler, DDIM, DPM++ samplers
- Understand trade-off between sampling steps and generation quality
- Be able to implement simplified samplers

---

## 22.1 Sampler 的本质 | The Essence of Sampler

### 中文解释

**Sampler = 数值求解反向扩散过程的方法**

反向扩散是一个连续的随机微分方程（SDE）：
```
dx/dt = f(x, t) + g(t) × noise
```

Sampler 用**离散步**来近似这个连续过程：
```
x_{t-1} = x_t + step_size × (dx/dt)
```

### English Explanation

**Sampler = Method for numerically solving reverse diffusion process**

Reverse diffusion is a continuous stochastic differential equation (SDE):
```
dx/dt = f(x, t) + g(t) × noise
```

Sampler approximates this continuous process with **discrete steps**:
```
x_{t-1} = x_t + step_size × (dx/dt)
```

---

## 22.2 Euler Sampler — 最简单的采样器 | Euler Sampler — The Simplest Sampler

### 中文解释

**Euler = 一阶欧拉方法，最基础的数值积分**

```
x_{t-1} = x_t - (x_t - x_0_pred) / σ_t × step_size
```

特点：
- 实现最简单
- 步数需要较多（50-1000）
- 每步计算量最小

### English Explanation

**Euler = First-order Euler method, most basic numerical integration**

```
x_{t-1} = x_t - (x_t - x_0_pred) / σ_t × step_size
```

Characteristics:
- Simplest implementation
- Needs more steps (50-1000)
- Minimum computation per step

### 代码案例 | Code Example

```python
import torch

class EulerSampler:
    """Euler 采样器 | Euler sampler"""
    
    def __init__(self, num_steps=50):
        self.num_steps = num_steps
        # 线性时间步调度 | Linear timestep schedule
        self.timesteps = torch.linspace(999, 0, num_steps).long()
    
    @torch.no_grad()
    def sample(self, model, shape, device='cpu'):
        """采样 | Sample"""
        x = torch.randn(shape, device=device)
        
        for i in range(len(self.timesteps) - 1):
            t = self.timesteps[i]
            t_next = self.timesteps[i + 1]
            
            # 预测噪声 | Predict noise
            t_batch = torch.full((shape[0],), t, device=device)
            noise_pred = model(x, t_batch)
            
            # 计算 x_0 预测 | Compute x_0 prediction
            alpha = alphas_cumprod[t]
            x_0_pred = (x - torch.sqrt(1 - alpha) * noise_pred) / torch.sqrt(alpha)
            
            # Euler 步 | Euler step
            if t_next > 0:
                alpha_next = alphas_cumprod[t_next]
                x = torch.sqrt(alpha_next) * x_0_pred + torch.sqrt(1 - alpha_next) * noise_pred
            else:
                x = x_0_pred
        
        return x
```

---

## 22.3 DDIM — 确定性采样 | DDIM — Deterministic Sampling

### 中文解释

**DDIM = 去噪扩散隐式模型**

关键创新：
- 将随机过程变为确定性过程
- 可以用更少的步数（10-50）生成高质量图片
- 适合"图像编辑"（因为确定，可以插值）

### English Explanation

**DDIM = Denoising Diffusion Implicit Models**

Key innovation:
- Turn stochastic process into deterministic process
- Can generate high-quality images with fewer steps (10-50)
- Good for "image editing" (because deterministic, can interpolate)

### 代码案例 | Code Example

```python
import torch

class DDIMSampler:
    """DDIM 采样器 | DDIM sampler"""
    
    def __init__(self, num_steps=50, eta=0.0):
        """
        eta = 0: 完全确定性 | Fully deterministic
        eta = 1: 等价于 DDPM | Equivalent to DDPM
        """
        self.num_steps = num_steps
        self.eta = eta
        self.timesteps = torch.linspace(999, 0, num_steps).long()
    
    @torch.no_grad()
    def sample(self, model, shape, device='cpu'):
        x = torch.randn(shape, device=device)
        
        for i in range(len(self.timesteps) - 1):
            t = self.timesteps[i]
            t_next = self.timesteps[i + 1]
            
            # 预测噪声 | Predict noise
            t_batch = torch.full((shape[0],), t, device=device)
            noise_pred = model(x, t_batch)
            
            # 计算 x_0 | Compute x_0
            alpha = alphas_cumprod[t]
            x_0 = (x - torch.sqrt(1 - alpha) * noise_pred) / torch.sqrt(alpha)
            
            if t_next > 0:
                alpha_next = alphas_cumprod[t_next]
                
                # DDIM 方向 | DDIM direction
                sigma = self.eta * torch.sqrt((1 - alpha_next) / (1 - alpha)) * torch.sqrt(1 - alpha / alpha_next)
                
                # 确定性部分 | Deterministic part
                x = torch.sqrt(alpha_next) * x_0 + torch.sqrt(1 - alpha_next - sigma**2) * noise_pred
                
                # 随机部分（eta > 0 时）| Stochastic part (when eta > 0)
                if self.eta > 0:
                    x = x + sigma * torch.randn_like(x)
            else:
                x = x_0
        
        return x
```

---

## 22.4 DPM++ — 现代最佳采样器 | DPM++ — Modern Best Sampler

### 中文解释

**DPM++ = 高阶数值积分方法**

优势：
- 收敛更快（20-30 步即可）
- 质量更高
- 现代 Stable Diffusion 的默认选择

核心：使用多步历史信息来更准确地估计方向

### English Explanation

**DPM++ = Higher-order numerical integration method**

Advantages:
- Faster convergence (20-30 steps sufficient)
- Higher quality
- Default choice for modern Stable Diffusion

Core: Uses multi-step history to more accurately estimate direction

### 采样器对比 | Sampler Comparison

| Sampler | 步数 | 质量 | 速度 | 确定性 |
|---------|------|------|------|--------|
| Euler | 50-1000 | 中 | 快 | 否 |
| DDIM | 20-50 | 高 | 中 | 是（eta=0）|
| DPM++ 2M | 20-30 | 很高 | 中 | 否 |
| DPM++ SDE | 20-30 | 最高 | 慢 | 否 |

| Sampler | Steps | Quality | Speed | Deterministic |
|---------|-------|---------|-------|---------------|
| Euler | 50-1000 | Medium | Fast | No |
| DDIM | 20-50 | High | Medium | Yes (eta=0) |
| DPM++ 2M | 20-30 | Very high | Medium | No |
| DPM++ SDE | 20-30 | Highest | Slow | No |

---

## 22.5 步数与质量的权衡 | Step-Quality Trade-off

### 中文解释

```
步数 ↑ → 质量 ↑ → 时间 ↑

实际使用：| Practical usage:
- 快速预览：10-20 步 | Quick preview: 10-20 steps
- 正常生成：20-50 步 | Normal generation: 20-50 steps
- 高质量：50+ 步 | High quality: 50+ steps
```

### English Explanation

```
Steps ↑ → Quality ↑ → Time ↑

Practical usage:
- Quick preview: 10-20 steps
- Normal generation: 20-50 steps
- High quality: 50+ steps
```

---

## 本章总结 | Chapter Summary

**中文：**
- Sampler = 数值积分求解反向扩散 SDE
- Euler：最简单，需要更多步数
- DDIM：确定性，可以少步数
- DPM++：现代最佳，收敛快
- 步数与质量正相关，与时间也正相关

**English:**
- Sampler = numerical integration solving reverse diffusion SDE
- Euler: simplest, needs more steps
- DDIM: deterministic, can use fewer steps
- DPM++: modern best, fast convergence
- Steps positively correlated with both quality and time

---

## 课后练习 | Homework

1. **Euler 实现**：实现 Euler 采样器，测试不同步数的效果
2. **DDIM 实验**：对比 DDIM (eta=0) 和 DDPM (eta=1) 的差异
3. **步数测试**：用 10/20/50/100 步生成图片，比较质量
4. **插值实验**：用 DDIM 的确定性做 latent 空间插值
5. **思考题**：为什么 Diffusion 不能像 GAN 那样一步生成？
