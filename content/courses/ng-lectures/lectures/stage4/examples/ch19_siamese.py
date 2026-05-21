"""
第19章：Siamese Network 与 Triplet Loss
Chapter 19: Siamese Network & Triplet Loss
"""
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

class EmbeddingNet(nn.Module):
    """共享权重的编码网络"""
    def __init__(self, input_dim=128, embed_dim=64):
        super().__init__()
        self.fc = nn.Sequential(
            nn.Linear(input_dim, 256),
            nn.ReLU(),
            nn.Linear(256, embed_dim)
        )

    def forward(self, x):
        return self.fc(x)

# Triplet Loss
def triplet_loss(anchor, positive, negative, margin=0.2):
    """
    L = max(||f(A)-f(P)||² - ||f(A)-f(N)||² + margin, 0)
    """
    d_pos = F.pairwise_distance(anchor, positive, p=2)
    d_neg = F.pairwise_distance(anchor, negative, p=2)
    loss = torch.relu(d_pos**2 - d_neg**2 + margin)
    return loss.mean()

# 模拟训练
net = EmbeddingNet()
optimizer = torch.optim.Adam(net.parameters(), lr=1e-3)

for epoch in range(100):
    anchor = torch.randn(16, 128)
    positive = anchor + torch.randn(16, 128) * 0.1  # 相似样本（同一人）
    negative = torch.randn(16, 128)  # 不同样本（不同人）

    emb_a = net(anchor)
    emb_p = net(positive)
    emb_n = net(negative)

    loss = triplet_loss(emb_a, emb_p, emb_n)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if epoch % 20 == 0:
        print(f"Epoch {epoch}: Loss={loss.item():.4f}")

# 验证
with torch.no_grad():
    test_a = net(torch.randn(1, 128))
    test_p = net(test_a + torch.randn(1, 128) * 0.1)
    test_n = net(torch.randn(1, 128))

    d_pos = torch.dist(test_a, test_p).item()
    d_neg = torch.dist(test_a, test_n).item()

print(f"\n验证距离:")
print(f"  同一人距离 (A-P): {d_pos:.4f}")
print(f"  不同人距离 (A-N): {d_neg:.4f}")
print(f"  距离差: {d_neg - d_pos:.4f} (应 > 0)")
