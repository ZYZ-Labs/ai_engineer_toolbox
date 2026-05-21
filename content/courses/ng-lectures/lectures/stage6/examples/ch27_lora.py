"""
第27章：LoRA (Low-Rank Adaptation) 实现
Chapter 27: LoRA Implementation
"""
import torch
import torch.nn as nn
import math

class LoRALinear(nn.Module):
    """带 LoRA 适配的线性层: W = W₀ + BA/r"""
    def __init__(self, in_features, out_features, rank=4, lora_alpha=1):
        super().__init__()
        self.rank = rank
        self.scaling = lora_alpha / rank

        # 预训练权重（冻结）
        self.weight = nn.Parameter(torch.zeros(out_features, in_features), requires_grad=False)
        self.bias = nn.Parameter(torch.zeros(out_features), requires_grad=False) if False else None

        # LoRA 可训练参数
        self.lora_A = nn.Parameter(torch.randn(in_features, rank) / math.sqrt(in_features))
        self.lora_B = nn.Parameter(torch.zeros(rank, out_features))  # 零初始化确保训练初期不干扰

    def forward(self, x):
        # 原始输出 + LoRA 分支
        original = torch.nn.functional.linear(x, self.weight, self.bias)
        lora = torch.nn.functional.linear(x, (self.lora_A @ self.lora_B).T * self.scaling)
        return original + lora

    def num_lora_params(self):
        return self.lora_A.numel() + self.lora_B.numel()

    def num_original_params(self):
        return self.weight.numel()

# 对比参数量
in_f, out_f = 768, 768
rank = 8

lora_layer = LoRALinear(in_f, out_f, rank=rank)
original = nn.Linear(in_f, out_f)

print(f"原始线性层参数: {sum(p.numel() for p in original.parameters()):,}")
print(f"LoRA 新增参数:  {lora_layer.num_lora_params():,}")
print(f"参数减少比例:   {lora_layer.num_lora_params() / sum(p.numel() for p in original.parameters()):.2%}")

# 验证前向传播
x = torch.randn(2, 10, 768)
out = lora_layer(x)
print(f"\n输入 shape: {x.shape}")
print(f"输出 shape: {out.shape}")
