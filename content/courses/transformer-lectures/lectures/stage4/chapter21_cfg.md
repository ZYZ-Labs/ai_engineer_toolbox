# 第21章：CFG — Classifier-Free Guidance | Chapter 21: CFG — Classifier-Free Guidance

> **阶段定位** | **Stage**: 第四阶段 — Diffusion
> **预计学时** | **Duration**: 3~5 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 理解 CFG 的核心思想：用"有条件"减去"无条件"
- 掌握 CFG 的公式和实现
- 理解为什么 CFG 越高越"听 prompt"
- 了解 CFG 的副作用和最佳实践

**English:**
- Understand core idea of CFG: "conditional" minus "unconditional"
- Master CFG formula and implementation
- Understand why higher CFG means more "prompt-following"
- Learn about CFG side effects and best practices

---

## 21.1 为什么需要 CFG？| Why CFG?

### 中文解释

**问题：模型生成的图片不够"听"prompt**

原因：
- 训练时模型学了各种图片，不只是 prompt 对应的图片
- 生成时会走"平均"路线，导致图片模糊、不精确

**CFG 解决：放大条件的影响**

### English Explanation

**Problem: Generated images don't "follow" prompt closely enough**

Reason:
- During training, model learns all kinds of images, not just prompt-matching ones
- During generation, it takes an "average" route, causing blurry, imprecise images

**CFG solution: Amplify the effect of conditioning**

---

## 21.2 CFG 公式 | CFG Formula

### 中文解释

```
原始预测：| Original prediction:
  ε_cond — 有条件（有 prompt）的噪声预测 | with prompt

无条件预测：| Unconditional prediction:
  ε_uncond — 无条件（空 prompt）的噪声预测 | with empty prompt

CFG 后的预测：| CFG-adjusted prediction:
  ε_cfg = ε_uncond + scale × (ε_cond - ε_uncond)
        = (1 - scale) × ε_uncond + scale × ε_cond
```

当 scale = 1：就是有条件预测 | When scale = 1: just conditional prediction
当 scale > 1：放大条件的影响 | When scale > 1: amplify conditioning effect

### English Explanation

```
Original prediction:
  ε_cond — noise prediction with prompt

Unconditional prediction:
  ε_uncond — noise prediction with empty prompt

CFG-adjusted prediction:
  ε_cfg = ε_uncond + scale × (ε_cond - ε_uncond)
        = (1 - scale) × ε_uncond + scale × ε_cond
```

When scale = 1: just conditional prediction
When scale > 1: amplify conditioning effect

---

## 21.3 CFG 实现 | CFG Implementation

### 代码案例 | Code Example

```python
import torch

def apply_cfg(noise_cond, noise_uncond, scale=7.5):
    """
    应用 Classifier-Free Guidance | Apply Classifier-Free Guidance
    
    noise_cond: 有条件预测的噪声 | Conditional noise prediction
    noise_uncond: 无条件预测的噪声 | Unconditional noise prediction
    scale: guidance scale
    """
    # CFG 公式 | CFG formula
    noise_cfg = noise_uncond + scale * (noise_cond - noise_uncond)
    return noise_cfg

# 在采样循环中使用 | Use in sampling loop
@torch.no_grad()
def sample_with_cfg(model, prompt_embeds, uncond_embeds, shape, scale=7.5):
    """
    使用 CFG 的采样 | Sampling with CFG
    """
    x = torch.randn(shape, device=prompt_embeds.device)
    
    for t in reversed(range(num_timesteps)):
        t_batch = torch.full((shape[0],), t, device=x.device)
        
        # 有条件预测 | Conditional prediction
        noise_cond = model(x, t_batch, prompt_embeds)
        
        # 无条件预测 | Unconditional prediction
        noise_uncond = model(x, t_batch, uncond_embeds)
        
        # CFG
        noise_pred = apply_cfg(noise_cond, noise_uncond, scale)
        
        # 去噪一步 | Denoise one step
        x = denoise_step(x, noise_pred, t)
    
    return x

# 直观理解 | Intuitive understanding:
# scale = 0:  完全无条件生成 | Fully unconditional
# scale = 1:  正常条件生成 | Normal conditional
# scale = 7.5: 强烈遵循 prompt | Strongly follow prompt (SD default)
# scale = 15: 极强遵循，但可能过饱和 | Very strong, but may oversaturate
```

---

## 21.4 为什么 CFG 越高越"听 prompt"？| Why Higher CFG Means More "Prompt-Following"?

### 中文解释

```
ε_cfg = ε_uncond + scale × (ε_cond - ε_uncond)

(ε_cond - ε_uncond) = 条件带来的"方向"
                      = 从无条件指向有条件的方向

scale 越大，这个方向的步长越大：
  - 模型会更坚定地朝 prompt 描述的方向走
  - 但也会更远离"平均"图片
  - 过高会导致过饱和、不自然
```

### English Explanation

```
ε_cfg = ε_uncond + scale × (ε_cond - ε_uncond)

(ε_cond - ε_uncond) = "direction" brought by conditioning
                      = direction from unconditional to conditional

Larger scale means larger step in this direction:
  - Model more firmly walks toward prompt-described direction
  - But also farther from "average" images
  - Too high causes oversaturation, unnatural results
```

### 可视化 | Visualization

```
噪声预测空间（简化 2D）| Noise prediction space (simplified 2D):

         ε_uncond（无条件 | unconditional）
           ↓
           ●
           │
           │ scale=1
           │
           ● ← ε_cond（有条件 | conditional）
           │
           │ scale=7.5
           │
           ★ ← ε_cfg（CFG 后 | after CFG）
           
★ 离 ε_uncond 更远，离 prompt 方向更近
★ is farther from ε_uncond, closer to prompt direction
```

---

## 21.5 CFG 的副作用 | Side Effects of CFG

### 中文解释

| Scale | 效果 | 问题 |
|-------|------|------|
| 1-3 | 较自然 | 可能不够精确 |
| 4-7 | 平衡 | SD 推荐范围 |
| 8-12 | 精确 | 可能过饱和 |
| 15+ | 极强 | 颜色失真、不自然 |

### English Explanation

| Scale | Effect | Problem |
|-------|--------|---------|
| 1-3 | Natural | May not be precise enough |
| 4-7 | Balanced | SD recommended range |
| 8-12 | Precise | May oversaturate |
| 15+ | Very strong | Color distortion, unnatural |

### 训练时的 CFG | CFG During Training

```python
# 训练时需要同时学习有条件和无条件 | Training needs to learn both conditional and unconditional

def train_step_with_cfg(model, x_0, prompt_embeds):
    """
    训练时随机丢弃条件 | Randomly drop conditioning during training
    """
    batch_size = x_0.size(0)
    
    # 随机丢弃条件（概率 10%）| Randomly drop conditioning (10% probability)
    mask = torch.rand(batch_size) > 0.1
    
    # 被丢弃的用空 embedding | Use empty embedding for dropped ones
    context = prompt_embeds.clone()
    context[~mask] = 0   # 空条件 | Empty conditioning
    
    # 正常训练 | Normal training
    t = torch.randint(0, num_timesteps, (batch_size,))
    x_t, noise = diffusion.add_noise(x_0, t)
    pred_noise = model(x_t, t, context)
    
    loss = torch.nn.functional.mse_loss(pred_noise, noise)
    return loss
```

---

## 本章总结 | Chapter Summary

**中文：**
- CFG = ε_uncond + scale × (ε_cond - ε_uncond)
- scale 控制 prompt 的影响强度
- 训练时随机丢弃条件（10%）来学习无条件生成
- scale 默认 7.5，过高会导致过饱和

**English:**
- CFG = ε_uncond + scale × (ε_cond - ε_uncond)
- Scale controls prompt influence strength
- Randomly drop conditioning during training (10%) to learn unconditional generation
- Default scale is 7.5, too high causes oversaturation

---

## 课后练习 | Homework

1. **CFG 实现**：实现 CFG，对比不同 scale（1, 3, 7.5, 15）的输出差异
2. **丢弃训练**：在训练时实现条件丢弃机制
3. **负向 Prompt**：理解负向 prompt 的本质（也是 CFG）
4. **动态 CFG**：实现随时间步变化的 CFG scale
5. **思考题**：为什么 CFG 只在推理时用，训练时不用？
