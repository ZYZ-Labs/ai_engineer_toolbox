"""
第19章案例：UNet 简化实现
Chapter 19 Example: Simplified UNet

运行方式: python ch19_unet.py
"""

import torch
import torch.nn as nn


class SimpleUNet(nn.Module):
    """简化 UNet"""

    def __init__(self, in_ch=4, out_ch=4, base_ch=64):
        super().__init__()
        # Encoder
        self.enc1 = nn.Sequential(nn.Conv2d(in_ch, base_ch, 3, padding=1), nn.ReLU())
        self.down1 = nn.Conv2d(base_ch, base_ch, 3, stride=2, padding=1)  # 1/2

        self.enc2 = nn.Sequential(nn.Conv2d(base_ch, base_ch * 2, 3, padding=1), nn.ReLU())
        self.down2 = nn.Conv2d(base_ch * 2, base_ch * 2, 3, stride=2, padding=1)  # 1/4

        # Bottleneck
        self.bottleneck = nn.Sequential(
            nn.Conv2d(base_ch * 2, base_ch * 2, 3, padding=1), nn.ReLU()
        )

        # Decoder
        self.up2 = nn.ConvTranspose2d(base_ch * 2, base_ch, 4, stride=2, padding=1)
        self.dec2 = nn.Sequential(nn.Conv2d(base_ch * 2, base_ch, 3, padding=1), nn.ReLU())

        self.up1 = nn.ConvTranspose2d(base_ch, base_ch, 4, stride=2, padding=1)
        self.dec1 = nn.Sequential(nn.Conv2d(base_ch * 2, base_ch, 3, padding=1), nn.ReLU())

        self.out = nn.Conv2d(base_ch, out_ch, 1)

    def forward(self, x):
        # Encoder
        e1 = self.enc1(x)
        d1 = self.down1(e1)

        e2 = self.enc2(d1)
        d2 = self.down2(e2)

        # Bottleneck
        b = self.bottleneck(d2)

        # Decoder with skip
        u2 = self.up2(b)
        u2 = torch.cat([u2, e2], dim=1)
        u2 = self.dec2(u2)

        u1 = self.up1(u2)
        u1 = torch.cat([u1, e1], dim=1)
        u1 = self.dec1(u1)

        return self.out(u1)


def demo_unet_shapes():
    """UNet shape 追踪"""
    print("=" * 50)
    print("1. UNet Shape 追踪")
    print("=" * 50)

    unet = SimpleUNet(in_ch=4, out_ch=4, base_ch=64)
    x = torch.randn(1, 4, 64, 64)

    print(f"Input:  {x.shape}")

    # 手动追踪
    e1 = unet.enc1(x)
    print(f"e1:     {e1.shape}")
    d1 = unet.down1(e1)
    print(f"d1:     {d1.shape}")

    e2 = unet.enc2(d1)
    print(f"e2:     {e2.shape}")
    d2 = unet.down2(e2)
    print(f"d2:     {d2.shape}")

    b = unet.bottleneck(d2)
    print(f"bottleneck: {b.shape}")

    u2 = unet.up2(b)
    print(f"up2:    {u2.shape} + skip {e2.shape} -> cat {(torch.cat([u2, e2], dim=1)).shape}")

    u1 = unet.up1(unet.dec2(torch.cat([u2, e2], dim=1)))
    print(f"up1:    {u1.shape} + skip {e1.shape}")

    out = unet(x)
    print(f"\nOutput: {out.shape}")


def demo_skip_connection():
    """Skip Connection 效果"""
    print("\n" + "=" * 50)
    print("2. Skip Connection 作用")
    print("=" * 50)

    print("有 Skip: 解码器能直接获取编码器的细节信息")
    print("无 Skip: 信息经过 bottleneck 可能丢失")
    print("Diffusion 中 Skip 对保留细节至关重要")


def demo_time_embedding():
    """时间嵌入"""
    print("\n" + "=" * 50)
    print("3. 时间步嵌入")
    print("=" * 50)

    def time_embed(t, dim=256):
        half = dim // 2
        emb = torch.log(torch.tensor(10000.0)) / (half - 1)
        emb = torch.exp(torch.arange(half) * -emb)
        emb = t[:, None] * emb[None, :]
        return torch.cat([torch.sin(emb), torch.cos(emb)], dim=-1)

    for t in [0, 250, 500, 750, 999]:
        emb = time_embed(torch.tensor([t]))
        print(f"t={t:4d}: embedding shape={emb.shape}, mean={emb.mean():.3f}")


if __name__ == "__main__":
    demo_unet_shapes()
    demo_skip_connection()
    demo_time_embedding()
