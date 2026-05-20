"""
第20章案例：Cross Attention 文本控制图像
Chapter 20 Example: Cross Attention Text-to-Image

运行方式: python ch20_cross_attention.py
"""

import torch
import torch.nn as nn


class CrossAttention(nn.Module):
    """Cross Attention"""

    def __init__(self, query_dim, context_dim, num_heads=8):
        super().__init__()
        self.num_heads = num_heads
        self.d_head = query_dim // num_heads

        self.to_q = nn.Linear(query_dim, query_dim)
        self.to_k = nn.Linear(context_dim, query_dim)
        self.to_v = nn.Linear(context_dim, query_dim)
        self.to_out = nn.Linear(query_dim, query_dim)

    def forward(self, x, context):
        B, N, C = x.shape
        _, M, _ = context.shape

        Q = self.to_q(x).view(B, N, self.num_heads, self.d_head).transpose(1, 2)
        K = self.to_k(context).view(B, M, self.num_heads, self.d_head).transpose(1, 2)
        V = self.to_v(context).view(B, M, self.num_heads, self.d_head).transpose(1, 2)

        scores = torch.matmul(Q, K.transpose(-2, -1)) / (self.d_head ** 0.5)
        weights = torch.softmax(scores, dim=-1)
        attn = torch.matmul(weights, V)

        attn = attn.transpose(1, 2).contiguous().view(B, N, -1)
        return self.to_out(attn), weights


def demo_cross_attn_shape():
    """Cross Attention shape 演示"""
    print("=" * 50)
    print("1. Cross Attention Shape")
    print("=" * 50)

    # 图像特征: (batch, 64*64, 512)
    image_features = torch.randn(2, 64, 512)
    # 文本特征: (batch, 77, 768)
    text_features = torch.randn(2, 77, 768)

    ca = CrossAttention(query_dim=512, context_dim=768, num_heads=8)
    out, weights = ca(image_features, text_features)

    print(f"Image features:  {image_features.shape}")
    print(f"Text features:   {text_features.shape}")
    print(f"Output:          {out.shape}")
    print(f"Attention:       {weights.shape} (batch, heads, image_pos, text_token)")


def demo_attention_interpretation():
    """注意力解释"""
    print("\n" + "=" * 50)
    print("2. Cross Attention 解释")
    print("=" * 50)

    image_features = torch.randn(1, 16, 512)  # 4x4 网格
    text_features = torch.randn(1, 5, 768)    # 5 个文本 token

    ca = CrossAttention(query_dim=512, context_dim=768, num_heads=4)
    out, weights = ca(image_features, text_features)

    # 分析每个文本 token 对图像位置的影响
    w = weights[0].mean(dim=0)  # (16, 5) 平均所有 heads
    print(f"每个图像位置对文本 token 的注意力 (16 image positions x 5 text tokens):")
    print(w.round(3))


def demo_text_encoder():
    """简化文本编码器"""
    print("\n" + "=" * 50)
    print("3. 文本编码器")
    print("=" * 50)

    class SimpleTextEncoder(nn.Module):
        def __init__(self, vocab_size=1000, d_model=768):
            super().__init__()
            self.emb = nn.Embedding(vocab_size, d_model)
            self.transformer = nn.TransformerEncoder(
                nn.TransformerEncoderLayer(d_model, 12, d_model * 4, batch_first=True),
                num_layers=6,
            )

        def forward(self, tokens):
            x = self.emb(tokens)
            return self.transformer(x)

    encoder = SimpleTextEncoder()
    tokens = torch.randint(0, 1000, (2, 77))
    text_emb = encoder(tokens)
    print(f"Tokens: {tokens.shape}")
    print(f"Text embeddings: {text_emb.shape}")


if __name__ == "__main__":
    demo_cross_attn_shape()
    demo_attention_interpretation()
    demo_text_encoder()
