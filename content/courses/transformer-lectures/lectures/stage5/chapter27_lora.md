# 第27章：LoRA — 低秩微调 | Chapter 27: LoRA — Low-Rank Adaptation

> **阶段定位** | **Stage**: 第五阶段 — 源码与魔改
> **预计学时** | **Duration**: 5~7 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 理解 LoRA 的核心思想：低秩分解
- 掌握 LoRA 的实现和训练
- 理解为什么 LoRA 能显著减少微调参数量
- 能够使用 peft 库进行 LoRA 微调

**English:**
- Understand core idea of LoRA: low-rank decomposition
- Master LoRA implementation and training
- Understand why LoRA significantly reduces fine-tuning parameters
- Be able to use peft library for LoRA fine-tuning

---

## 27.1 为什么需要 LoRA？| Why LoRA?

### 中文解释

**全量微调的问题：**
- LLaMA-7B 有 70 亿参数
- 全量微调需要 140GB 显存（FP16 × 2 for Adam）
- 大多数人没有这样的硬件

**LoRA 的解决：**
- 只训练少量"适配器"参数
- 冻结原始模型权重
- 7B 模型可能只需要训练 1000 万参数（0.1%）

### English Explanation

**Problems with full fine-tuning:**
- LLaMA-7B has 7 billion parameters
- Full fine-tuning needs 140GB VRAM (FP16 × 2 for Adam)
- Most people don't have such hardware

**LoRA solution:**
- Only train a small number of "adapter" parameters
- Freeze original model weights
- 7B model may only need 10M parameters (0.1%)

---

## 27.2 LoRA 核心公式 | LoRA Core Formula

### 中文解释

**核心思想：权重更新是低秩的**

```
原始权重：W_0 (d × k)
微调后的权重：W = W_0 + ΔW

LoRA 假设：ΔW 是低秩的，可以分解为两个矩阵的乘积
LoRA assumes: ΔW is low-rank, can be factorized into two matrices

ΔW = B × A
其中：| where:
  B: (d × r) — r << min(d, k)
  A: (r × k)
  
训练时：W_0 冻结，只训练 A 和 B
During training: W_0 frozen, only A and B trained
```

### English Explanation

**Core idea: Weight updates are low-rank**

```
Original weight: W_0 (d × k)
Fine-tuned weight: W = W_0 + ΔW

LoRA assumes: ΔW is low-rank, can be factorized into two matrices

ΔW = B × A
where:
  B: (d × r) — r << min(d, k)
  A: (r × k)
  
During training: W_0 frozen, only A and B trained
```

---

## 27.3 LoRA 完整实现 | Complete LoRA Implementation

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn
import math

class LoRALayer(nn.Module):
    """LoRA 层 | LoRA layer"""
    
    def __init__(self, in_features, out_features, rank=8, lora_alpha=16):
        super().__init__()
        self.rank = rank
        self.lora_alpha = lora_alpha
        self.scaling = lora_alpha / rank
        
        # 低秩分解矩阵 | Low-rank decomposition matrices
        self.lora_A = nn.Parameter(torch.zeros(in_features, rank))
        self.lora_B = nn.Parameter(torch.zeros(rank, out_features))
        
        # 初始化：A 用高斯，B 用零 | Initialize: A with Gaussian, B with zeros
        nn.init.kaiming_uniform_(self.lora_A, a=math.sqrt(5))
        nn.init.zeros_(self.lora_B)
    
    def forward(self, x):
        """
        x @ (B @ A) * scaling
        """
        # x: (B, seq, in_features)
        # lora_A: (in_features, rank)
        # lora_B: (rank, out_features)
        return (x @ self.lora_A @ self.lora_B) * self.scaling

class LinearWithLoRA(nn.Module):
    """带 LoRA 的线性层 | Linear layer with LoRA"""
    
    def __init__(self, linear_layer, rank=8, lora_alpha=16):
        super().__init__()
        self.linear = linear_layer
        self.lora = LoRALayer(
            linear_layer.in_features,
            linear_layer.out_features,
            rank=rank,
            lora_alpha=lora_alpha,
        )
        
        # 冻结原始权重 | Freeze original weights
        for param in self.linear.parameters():
            param.requires_grad = False
    
    def forward(self, x):
        # 原始输出 + LoRA 适配 | Original output + LoRA adaptation
        return self.linear(x) + self.lora(x)

# ========== 应用到 Transformer | Apply to Transformer ==========

def add_lora_to_model(model, target_modules=["q_proj", "v_proj"], rank=8):
    """
    给模型的指定模块添加 LoRA | Add LoRA to specified modules of model
    """
    lora_layers = []
    
    for name, module in model.named_modules():
        if any(target in name for target in target_modules):
            if isinstance(module, nn.Linear):
                # 找到父模块 | Find parent module
                parent_name = ".".join(name.split(".")[:-1])
                child_name = name.split(".")[-1]
                
                if parent_name:
                    parent = model.get_submodule(parent_name)
                else:
                    parent = model
                
                # 替换为 LoRA 版本 | Replace with LoRA version
                lora_layer = LinearWithLoRA(module, rank=rank)
                setattr(parent, child_name, lora_layer)
                lora_layers.append(lora_layer)
    
    return model, lora_layers

# 测试 | Test
linear = nn.Linear(768, 768)
linear_lora = LinearWithLoRA(linear, rank=8)

x = torch.randn(2, 10, 768)
output = linear_lora(x)

print(f"Input: {x.shape}")
print(f"Output: {output.shape}")

# 参数量对比 | Parameter comparison
orig_params = sum(p.numel() for p in linear.parameters())
lora_params = sum(p.numel() for p in linear_lora.lora.parameters())
print(f"\nOriginal params: {orig_params:,}")
print(f"LoRA params: {lora_params:,}")
print(f"Ratio: {lora_params/orig_params*100:.2f}%")
```

---

## 27.4 使用 PEFT 库 | Using PEFT Library

### 代码案例 | Code Example

```python
# pip install peft

from peft import LoraConfig, get_peft_model, TaskType
from transformers import AutoModelForCausalLM

# 加载基础模型 | Load base model
model = AutoModelForCausalLM.from_pretrained("gpt2")

# 配置 LoRA | Configure LoRA
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,                    # rank
    lora_alpha=32,           # scaling = alpha / r
    lora_dropout=0.05,
    target_modules=["c_attn", "c_proj"],   # 要添加 LoRA 的模块 | Modules to add LoRA
    bias="none",
)

# 应用 LoRA | Apply LoRA
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# 输出示例：| Output example:
# trainable params: 294,912 || all params: 124,734,720 || trainable%: 0.2364

# 训练（只训练 LoRA 参数）| Train (only LoRA parameters)
# optimizer = torch.optim.AdamW(filter(lambda p: p.requires_grad, model.parameters()), lr=1e-4)
```

---

## 27.5 合并 LoRA 权重 | Merging LoRA Weights

### 代码案例 | Code Example

```python
# 训练完成后，可以将 LoRA 合并到原始权重 | After training, can merge LoRA into original weights

def merge_lora_weights(linear_lora):
    """
    将 LoRA 权重合并到原始线性层 | Merge LoRA weights into original linear layer
    """
    # ΔW = B @ A * scaling
    delta_W = (linear_lora.lora.lora_B @ linear_lora.lora.lora_A.t()) * linear_lora.lora.scaling
    
    # W_merged = W_0 + ΔW
    linear_lora.linear.weight.data += delta_W.t()
    
    return linear_lora.linear

# PEFT 库中的合并 | Merge in PEFT
# model = model.merge_and_unload()
```

---

## 本章总结 | Chapter Summary

**中文：**
- LoRA = 低秩分解 + 冻结原权重
- rank 控制参数量，通常 4-64
- alpha 控制缩放，通常 2×rank
- PEFT 库让 LoRA 微调极其简单
- 训练后可合并权重，推理无额外开销

**English:**
- LoRA = low-rank decomposition + freeze original weights
- rank controls parameter count, typically 4-64
- alpha controls scaling, typically 2×rank
- PEFT library makes LoRA fine-tuning extremely simple
- Weights can be merged after training, no inference overhead

---

## 课后练习 | Homework

1. **LoRA 实现**：完整实现 LoRA 层，验证低秩假设
2. **参数计算**：计算不同 rank 下 LoRA 的参数量和压缩比
3. **PEFT 微调**：用 PEFT 对 GPT-2 进行指令微调
4. **权重合并**：实现 LoRA 权重合并，验证合并后输出一致
5. **对比实验**：对比 LoRA rank=4/8/16/64 的微调效果
