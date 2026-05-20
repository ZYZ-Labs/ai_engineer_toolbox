"""
第18章案例：VAE 压缩与重建
Chapter 18 Example: VAE Compression and Reconstruction

运行方式: python ch18_vae.py
"""

import torch
import torch.nn as nn


class SimpleVAE(nn.Module):
    """简化 VAE"""

    def __init__(self, in_channels=3, latent_channels=4):
        super().__init__()
        # Encoder: 512x512 -> 64x64
        self.encoder = nn.Sequential(
            nn.Conv2d(in_channels, 128, 3, stride=2, padding=1),  # 256
            nn.SiLU(),
            nn.Conv2d(128, 256, 3, stride=2, padding=1),  # 128
            nn.SiLU(),
            nn.Conv2d(256, 512, 3, stride=2, padding=1),  # 64
            nn.SiLU(),
            nn.Conv2d(512, latent_channels * 2, 3, padding=1),  # 64
        )

        # Decoder: 64x64 -> 512x512
        self.decoder = nn.Sequential(
            nn.Conv2d(latent_channels, 512, 3, padding=1),
            nn.SiLU(),
            nn.ConvTranspose2d(512, 256, 4, stride=2, padding=1),  # 128
            nn.SiLU(),
            nn.ConvTranspose2d(256, 128, 4, stride=2, padding=1),  # 256
            nn.SiLU(),
            nn.ConvTranspose2d(128, in_channels, 4, stride=2, padding=1),  # 512
        )

    def encode(self, x):
        h = self.encoder(x)
        mean, logvar = h.chunk(2, dim=1)
        return mean, logvar

    def reparameterize(self, mean, logvar):
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mean + eps * std

    def decode(self, z):
        return self.decoder(z)

    def forward(self, x):
        mean, logvar = self.encode(x)
        z = self.reparameterize(mean, logvar)
        return self.decode(z), mean, logvar


def demo_compression_ratio():
    """压缩比计算"""
    print("=" * 50)
    print("1. VAE 压缩比")
    print("=" * 50)

    resolutions = [256, 512, 1024]
    for res in resolutions:
        pixel = res * res * 3
        latent = (res // 8) * (res // 8) * 4
        ratio = pixel / latent
        print(f"  {res}x{res}: 像素={pixel:,}, 潜空间={latent:,}, 压缩比={ratio:.1f}x")


def demo_vae_forward():
    """VAE 前向传播"""
    print("\n" + "=" * 50)
    print("2. VAE 前向传播")
    print("=" * 50)

    vae = SimpleVAE()
    x = torch.randn(1, 3, 512, 512)

    z, mean, logvar = vae.encode(x)
    x_recon = vae.decode(z)

    print(f"Input:  {x.shape} = {x.numel():,} elements")
    print(f"Latent: {z.shape} = {z.numel():,} elements")
    print(f"Output: {x_recon.shape} = {x_recon.numel():,} elements")
    print(f"Compression: {x.numel() / z.numel():.1f}x")


def demo_latent_diffusion():
    """Latent Diffusion 流程"""
    print("\n" + "=" * 50)
    print("3. Latent Diffusion 流程")
    print("=" * 50)

    vae = SimpleVAE()
    x = torch.randn(1, 3, 512, 512)

    # 1. 编码到潜空间
    z, _, _ = vae.encode(x)
    print(f"1. Encode: {x.shape} -> {z.shape}")

    # 2. 在潜空间做 Diffusion (简化为加噪声)
    noise = torch.randn_like(z)
    z_noisy = z * 0.8 + noise * 0.2
    print(f"2. Diffuse in latent: {z_noisy.shape}")

    # 3. 去噪 (简化为直接预测 z)
    z_pred = z_noisy  # 假设网络完美去噪

    # 4. 解码回像素
    x_gen = vae.decode(z_pred)
    print(f"3. Decode: {z_pred.shape} -> {x_gen.shape}")


if __name__ == "__main__":
    demo_compression_ratio()
    demo_vae_forward()
    demo_latent_diffusion()
