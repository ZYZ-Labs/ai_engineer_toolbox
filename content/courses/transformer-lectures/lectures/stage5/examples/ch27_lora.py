"""
第27章案例：LoRA 低秩微调
Chapter 27 Example: LoRA Low-Rank Adaptation

运行方式: python ch27_lora.py
"""

import torch
import torch.nn as nn
import math


class LoRALayer(nn.Module):
    """LoRA 层"""

    def __init__(self, in_features, out_features, rank=8, lora_alpha=16):
        super().__init__()
        self.rank = rank
        self.scaling = lora_alpha / rank
        self.lora_A = nn.Parameter(torch.zeros(in_features, rank))
        self.lora_B = nn.Parameter(torch.zeros(rank, out_features))
        nn.init.kaiming_uniform_(self.lora_A, a=math.sqrt(5))
        nn.init.zeros_(self.lora_B)

    def forward(self, x):
        return (x @ self.lora_A @ self.lora_B) * self.scaling


def demo_lora_parameters():
    """LoRA 参数量"""
    print("=" * 50)
    print("1. LoRA 参数量对比")
    print("=" * 50)

    d_model = 768
    ranks = [4, 8, 16, 32, 64]

    orig_params = d_model * d_model  # 原始线性层

    for rank in ranks:
        lora_params = d_model * rank + rank * d_model
        ratio = lora_params / orig_params * 100
        print(f"  rank={rank:2d}: {lora_params:,} params ({ratio:.2f}% of original)")

    print(f"  Original: {orig_params:,} params (100%)")


def demo_lora_forward():
    """LoRA 前向传播"""
    print("\n" + "=" * 50)
    print("2. LoRA 前向传播")
    print("=" * 50)

    # 原始线性层
    linear = nn.Linear(64, 64)
    lora = LoRALayer(64, 64, rank=8)

    x = torch.randn(2, 10, 64)

    # W' = W_0 + B @ A * scaling
    orig_out = linear(x)
    lora_out = lora(x)
    combined = orig_out + lora_out

    print(f"Input:           {x.shape}")
    print(f"Original output: {orig_out.shape}")
    print(f"LoRA output:     {lora_out.shape}")
    print(f"Combined output: {combined.shape}")
    print(f"LoRA 影响程度: {(lora_out.abs().mean() / orig_out.abs().mean()):.4f}")


def demo_freeze_base():
    """冻结基座权重"""
    print("\n" + "=" * 50)
    print("3. 冻结基座权重")
    print("=" * 50)

    linear = nn.Linear(64, 64)
    lora = LoRALayer(64, 64, rank=8)

    # 冻结原始权重
    for p in linear.parameters():
        p.requires_grad = False

    # 只训练 LoRA
    trainable = sum(p.numel() for p in lora.parameters() if p.requires_grad)
    frozen = sum(p.numel() for p in linear.parameters() if not p.requires_grad)

    print(f"Trainable (LoRA): {trainable:,}")
    print(f"Frozen (base):    {frozen:,}")
    print(f"训练比例: {trainable / (trainable + frozen) * 100:.2f}%")


def demo_merge_weights():
    """合并权重"""
    print("\n" + "=" * 50)
    print("4. 合并 LoRA 权重")
    print("=" * 50)

    d_model = 64
    linear = nn.Linear(d_model, d_model)
    lora = LoRALayer(d_model, d_model, rank=8)

    # 保存合并前输出
    x = torch.randn(2, 5, d_model)
    with torch.no_grad():
        out_before = linear(x) + lora(x)

    # 合并: W = W_0 + B @ A * scaling
    delta_W = (lora.lora_B @ lora.lora_A.t()) * lora.scaling
    linear.weight.data += delta_W.t()

    # 合并后输出
    with torch.no_grad():
        out_after = linear(x)

    print(f"合并前输出 | Before merge: mean={out_before.mean():.4f}")
    print(f"合并后输出 | After merge:  mean={out_after.mean():.4f}")
    print(f"输出一致?   | Match: {torch.allclose(out_before, out_after, atol=1e-5)}")


if __name__ == "__main__":
    demo_lora_parameters()
    demo_lora_forward()
    demo_freeze_base()
    demo_merge_weights()
