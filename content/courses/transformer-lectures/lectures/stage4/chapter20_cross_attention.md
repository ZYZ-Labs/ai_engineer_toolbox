# 第20章：Cross Attention — Prompt 如何控制图像 | Chapter 20: Cross Attention — How Prompt Controls Image

> **阶段定位** | **Stage**: 第四阶段 — Diffusion
> **预计学时** | **Duration**: 4~6 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 理解 Cross Attention 在 Diffusion 中的作用
- 掌握文本条件（Prompt）如何注入到图像生成过程
- 理解 CLIP 文本编码器的作用
- 能够手写 Cross Attention 层

**English:**
- Understand role of Cross Attention in Diffusion
- Master how text conditions (Prompt) inject into image generation
- Understand role of CLIP text encoder
- Be able to write Cross Attention layer by hand

---

## 20.1 Cross Attention 的本质 | The Essence of Cross Attention

### 中文解释

**Cross Attention = 一个模态查询另一个模态**

在 Stable Diffusion 中：
```
Q: 来自图片（UNet 特征）| From image (UNet features)
K, V: 来自文本（CLIP 编码）| From text (CLIP encoding)

结果：图片特征 "关注" 文本特征，从而实现文本控制图像
Result: Image features "attend to" text features, achieving text control of images
```

### English Explanation

**Cross Attention = One modality queries another modality**

In Stable Diffusion:
```
Q: from image (UNet features)
K, V: from text (CLIP encoding)

Result: Image features "attend to" text features, achieving text control of images
```

---

## 20.2 完整数据流 | Complete Data Flow

```
文本 Prompt: "a cat sitting on a mat"
    ↓
[Tokenizer] → token IDs
    ↓
[CLIP Text Encoder] → text embeddings (77, 768)
    ↓
[Cross Attention in UNet]
    Q: image features (B, C, H, W) → (B, HW, C)
    K: text embeddings (77, 768) → (77, C)
    V: text embeddings (77, 768) → (77, C)
    ↓
    output = softmax(Q @ K.T) @ V
    ↓
[生成图片] → "a cat sitting on a mat"
```

---

## 20.3 Cross Attention 实现 | Cross Attention Implementation

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

class CrossAttention(nn.Module):
    """Cross Attention — 图片特征查询文本特征 | Image features query text features"""
    
    def __init__(self, query_dim, context_dim, num_heads=8):
        super().__init__()
        self.num_heads = num_heads
        self.d_head = query_dim // num_heads
        
        self.to_q = nn.Linear(query_dim, query_dim)
        self.to_k = nn.Linear(context_dim, query_dim)
        self.to_v = nn.Linear(context_dim, query_dim)
        self.to_out = nn.Linear(query_dim, query_dim)
    
    def forward(self, x, context):
        """
        x: (batch, seq_q, query_dim) — 图片特征 | Image features
        context: (batch, seq_kv, context_dim) — 文本特征 | Text features
        """
        batch_size = x.size(0)
        
        # 投影 | Project
        Q = self.to_q(x)       # (B, seq_q, query_dim)
        K = self.to_k(context) # (B, seq_kv, query_dim)
        V = self.to_v(context) # (B, seq_kv, query_dim)
        
        # 分头 | Split heads
        Q = Q.view(batch_size, -1, self.num_heads, self.d_head).transpose(1, 2)
        K = K.view(batch_size, -1, self.num_heads, self.d_head).transpose(1, 2)
        V = V.view(batch_size, -1, self.num_heads, self.d_head).transpose(1, 2)
        
        # Attention
        scores = torch.matmul(Q, K.transpose(-2, -1)) / (self.d_head ** 0.5)
        weights = torch.softmax(scores, dim=-1)
        attn = torch.matmul(weights, V)
        
        # 合并头 | Combine heads
        attn = attn.transpose(1, 2).contiguous().view(batch_size, -1, Q.size(-1) * self.num_heads)
        
        return self.to_out(attn)

# 在 UNet 中的应用 | Application in UNet
class CrossAttnResBlock(nn.Module):
    """带 Cross Attention 的残差块 | Residual block with Cross Attention"""
    
    def __init__(self, channels, time_emb_dim, context_dim, num_heads=8):
        super().__init__()
        self.res = ResBlock(channels, channels, time_emb_dim)
        self.cross_attn = CrossAttention(channels, context_dim, num_heads)
        self.norm = nn.GroupNorm(8, channels)
    
    def forward(self, x, t_emb, context):
        """
        x: (B, C, H, W)
        t_emb: (B, time_emb_dim)
        context: (B, seq, context_dim) — 文本编码 | Text encoding
        """
        h = self.res(x, t_emb)
        
        # 将空间维度展平为序列 | Flatten spatial dims to sequence
        B, C, H, W = h.shape
        h_seq = h.view(B, C, H * W).transpose(1, 2)   # (B, HW, C)
        
        # Cross Attention
        attn_out = self.cross_attn(h_seq, context)   # (B, HW, C)
        
        # 恢复空间维度 | Restore spatial dims
        attn_out = attn_out.transpose(1, 2).view(B, C, H, W)
        
        return h + attn_out

# 测试 | Test
cross_attn = CrossAttention(query_dim=512, context_dim=768, num_heads=8)

image_features = torch.randn(2, 64, 512)     # (batch, HW, C)
text_features = torch.randn(2, 77, 768)      # (batch, seq, context_dim)

output = cross_attn(image_features, text_features)
print(f"Image features: {image_features.shape}")
print(f"Text features: {text_features.shape}")
print(f"Output: {output.shape}")   # (2, 64, 512)
```

---

## 20.4 CLIP 文本编码 | CLIP Text Encoding

### 中文解释

**CLIP = Contrastive Language-Image Pre-training**

CLIP 文本编码器：
- 将文本 prompt 编码为语义向量
- 这些向量被 Diffusion UNet 用作条件
- 编码维度：通常 (77, 768) 或 (77, 1024)

### English Explanation

**CLIP = Contrastive Language-Image Pre-training**

CLIP text encoder:
- Encodes text prompt into semantic vectors
- These vectors are used as conditioning by Diffusion UNet
- Encoding dimension: typically (77, 768) or (77, 1024)

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

class SimplifiedCLIPTextEncoder(nn.Module):
    """简化版 CLIP 文本编码器 | Simplified CLIP text encoder"""
    
    def __init__(self, vocab_size=49408, max_length=77, d_model=768, num_layers=12):
        super().__init__()
        self.token_embedding = nn.Embedding(vocab_size, d_model)
        self.position_embedding = nn.Embedding(max_length, d_model)
        
        # Transformer Encoder
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=12, dim_feedforward=3072, batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        
        self.max_length = max_length
    
    def forward(self, text_tokens):
        """
        text_tokens: (batch, seq_len) — tokenized text
        返回: (batch, seq_len, d_model) | Returns: (batch, seq_len, d_model)
        """
        B, S = text_tokens.shape
        
        # Embedding
        tok_emb = self.token_embedding(text_tokens)
        pos = torch.arange(S, device=text_tokens.device)
        pos_emb = self.position_embedding(pos)
        x = tok_emb + pos_emb
        
        # Transformer
        x = self.transformer(x)
        
        return x

# 使用 | Usage
encoder = SimplifiedCLIPTextEncoder()
text_tokens = torch.randint(0, 49408, (2, 77))   # 2 个文本，每个 77 个 token
text_embeddings = encoder(text_tokens)
print(f"Text embeddings: {text_embeddings.shape}")   # (2, 77, 768)
```

---

## 20.5 Prompt 控制机制详解 | Detailed Prompt Control Mechanism

### 中文解释

**Prompt 如何影响图片生成：**

1. **Tokenizer**：将文本拆分为 token
2. **CLIP 编码**：每个 token 变成语义向量
3. **Cross Attention**：图片特征"查询"文本向量
   - "cat" 对应的文本向量会吸引图片中猫区域的特征
   - "mat" 对应的文本向量会吸引垫子区域的特征

### English Explanation

**How prompt affects image generation:**

1. **Tokenizer**: Split text into tokens
2. **CLIP encoding**: Each token becomes a semantic vector
3. **Cross Attention**: Image features "query" text vectors
   - Text vector for "cat" attracts cat region features in image
   - Text vector for "mat" attracts mat region features in image

### 可视化 | Visualization

```
文本特征矩阵 (77, 768):
         dim1  dim2  dim3 ... dim768
  "a"  [ 0.1   0.2  -0.3  ...  0.5 ]
  "cat"[ 0.8   0.1   0.9  ... -0.2 ]  ← 猫语义 | cat semantics
  "sit"[ 0.2   0.7  -0.1  ...  0.3 ]
  "mat"[-0.1   0.3   0.2  ...  0.8 ]  ← 垫子语义 | mat semantics
  ...

图片特征 (64×64=4096 个位置，每个 512 维):
位置 (i,j) 的 Cross Attention 权重:
  weights[i,j,k] = 位置(i,j) 对第 k 个文本 token 的注意力
  
如果 "cat" 是第 2 个 token：
  weights[:,:,2] 高的区域 → 模型会在那里画猫
  High weights[:,:,2] region → model will draw cat there
```

---

## 本章总结 | Chapter Summary

**中文：**
- Cross Attention = 图片特征查询文本特征
- CLIP 将 Prompt 编码为语义向量
- UNet 中的 Cross Attention 层实现文本控制图像
- 每个文本 token 对应一个语义方向，影响图片不同区域

**English:**
- Cross Attention = image features query text features
- CLIP encodes Prompt into semantic vectors
- Cross Attention layers in UNet achieve text control of images
- Each text token corresponds to a semantic direction, affecting different image regions

---

## 课后练习 | Homework

1. **Cross Attention**：实现 Cross Attention，验证 Q/K/V 的 shape 变化
2. **注意力可视化**：实现 attention map 可视化，观察不同 prompt 的影响
3. **CLIP 编码**：用 transformers 库加载真实 CLIP，编码不同 prompt 比较相似度
4. **条件注入**：在 UNet 中加入 Cross Attention，训练条件生成模型
5. **思考题**：如果去掉 Cross Attention，只用 class label 做条件，有什么问题？
