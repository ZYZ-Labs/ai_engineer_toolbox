"""
第17章：ResNet 残差块（PyTorch）
Chapter 17: ResNet Residual Block
"""
import torch
import torch.nn as nn

class ResidualBlock(nn.Module):
    """基础残差块: x -> [Conv-BN-ReLU-Conv-BN] -> (+x) -> ReLU"""
    def __init__(self, in_channels, out_channels, stride=1):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels, out_channels, 3, stride=stride, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)
        self.conv2 = nn.Conv2d(out_channels, out_channels, 3, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_channels)

        # Shortcut: 维度不匹配时做 1x1 卷积
        self.shortcut = nn.Sequential()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, 1, stride=stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )

    def forward(self, x):
        out = self.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        out += self.shortcut(x)  # 残差连接
        out = self.relu(out)
        return out

# 测试
block = ResidualBlock(64, 64)
x = torch.randn(4, 64, 32, 32)
y = block(x)
print(f"输入: {x.shape}")
print(f"输出: {y.shape}")
print(f"残差连接保持空间维度: {x.shape == y.shape}")

# 下采样块
down_block = ResidualBlock(64, 128, stride=2)
x2 = torch.randn(4, 64, 32, 32)
y2 = down_block(x2)
print(f"\n下采样块:")
print(f"输入: {x2.shape}")
print(f"输出: {y2.shape}")
print("stride=2 使 H,W 减半，同时 1x1 shortcut 调整通道数")
