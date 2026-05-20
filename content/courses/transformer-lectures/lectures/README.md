# Transformer 完整学习路线讲义目录
# Transformer Complete Learning Path — Lecture Index

> 基于原始文档 `transformer_complete_learning_path_markdown.md` 生成的完整讲义
> Generated from original document `transformer_complete_learning_path_markdown.md`

---

## 讲义结构 | Lecture Structure

每章讲义包含：| Each lecture includes:
- **学习目标** | **Learning Objectives**（中文 + English）
- **核心概念讲解** | **Core Concept Explanation**（中文 + English）
- **代码案例** | **Code Examples**（带详细注释，中英双语）
- **可视化图解** | **Visual Diagrams**
- **详细解释** | **Detailed Explanations**
- **课后练习** | **Homework**

---

## 第一阶段：Tensor 与 Attention 基础 | Stage 1: Tensor and Attention Fundamentals

预计总学时：1~2 个月 | Estimated: 1~2 months

| 章节 | 标题 | 文件 |
|------|------|------|
| 第1章 | NumPy Tensor 基础 / NumPy Tensor Fundamentals | [stage1/chapter01_numpy_tensor.md](stage1/chapter01_numpy_tensor.md) |
| 第2章 | 向量 — Attention 的灵魂 / Vectors — The Soul of Attention | [stage1/chapter02_vectors.md](stage1/chapter02_vectors.md) |
| 第3章 | 矩阵与投影 / Matrices and Projection | [stage1/chapter03_matrix_projection.md](stage1/chapter03_matrix_projection.md) |
| 第4章 | Softmax — 概率的艺术 / Softmax — The Art of Probability | [stage1/chapter04_softmax.md](stage1/chapter04_softmax.md) |
| 第5章 | 从零手写 Attention / Writing Attention from Scratch | [stage1/chapter05_attention_from_scratch.md](stage1/chapter05_attention_from_scratch.md) |

---

## 第二阶段：PyTorch 与训练系统 | Stage 2: PyTorch and Training System

预计总学时：1~2 个月 | Estimated: 1~2 months

| 章节 | 标题 | 文件 |
|------|------|------|
| 第6章 | PyTorch Tensor — 从 NumPy 到 GPU / PyTorch Tensor — From NumPy to GPU | [stage2/chapter06_pytorch_tensor.md](stage2/chapter06_pytorch_tensor.md) |
| 第7章 | Autograd — PyTorch 的灵魂 / Autograd — The Soul of PyTorch | [stage2/chapter07_autograd.md](stage2/chapter07_autograd.md) |
| 第8章 | Gradient 与 Optimizer — 下山的人 / Gradient and Optimizer — The Person Going Downhill | [stage2/chapter08_gradient_optimizer.md](stage2/chapter08_gradient_optimizer.md) |
| 第9章 | 手写训练循环 — 训练到底是什么 / Writing Training Loop — What Is Training? | [stage2/chapter09_training_loop.md](stage2/chapter09_training_loop.md) |

---

## 第三阶段：Transformer 核心 | Stage 3: Transformer Core

预计总学时：2~3 个月 | Estimated: 2~3 months

| 章节 | 标题 | 文件 |
|------|------|------|
| 第10章 | Multi-Head Attention — 多头注意力 / Multi-Head Attention | [stage3/chapter10_multihead_attention.md](stage3/chapter10_multihead_attention.md) |
| 第11章 | Position Encoding — 给模型顺序感 / Position Encoding — Giving the Model a Sense of Order | [stage3/chapter11_position_encoding.md](stage3/chapter11_position_encoding.md) |
| 第12章 | Residual + LayerNorm — 深层网络的稳定器 / Residual + LayerNorm — Stabilizers for Deep Networks | [stage3/chapter12_residual_layernorm.md](stage3/chapter12_residual_layernorm.md) |
| 第13章 | FFN — Feed Forward Network / FFN — Feed Forward Network | [stage3/chapter13_ffn.md](stage3/chapter13_ffn.md) |
| 第14章 | Transformer Block — 拼完整 / Transformer Block — Putting It All Together | [stage3/chapter14_transformer_block.md](stage3/chapter14_transformer_block.md) |
| 第15章 | Decoder-only GPT — 自回归生成 / Decoder-only GPT — Autoregressive Generation | [stage3/chapter15_decoder_only_gpt.md](stage3/chapter15_decoder_only_gpt.md) |
| 第16章 | KV Cache — 推理优化的核心 / KV Cache — Core of Inference Optimization | [stage3/chapter16_kv_cache.md](stage3/chapter16_kv_cache.md) |

---

## 第四阶段：Diffusion | Stage 4: Diffusion

预计总学时：1~2 个月 | Estimated: 1~2 months

| 章节 | 标题 | 文件 |
|------|------|------|
| 第17章 | Diffusion 基础 — 从噪声中学习 / Diffusion Basics — Learning from Noise | [stage4/chapter17_diffusion_basics.md](stage4/chapter17_diffusion_basics.md) |
| 第18章 | VAE 与 Latent Space / VAE and Latent Space — Diffusing in Compressed Space | [stage4/chapter18_vae_latent.md](stage4/chapter18_vae_latent.md) |
| 第19章 | UNet — Diffusion 的骨干网络 / UNet — The Backbone of Diffusion | [stage4/chapter19_unet.md](stage4/chapter19_unet.md) |
| 第20章 | Cross Attention — Prompt 如何控制图像 / Cross Attention — How Prompt Controls Image | [stage4/chapter20_cross_attention.md](stage4/chapter20_cross_attention.md) |
| 第21章 | CFG — Classifier-Free Guidance / CFG — Classifier-Free Guidance | [stage4/chapter21_cfg.md](stage4/chapter21_cfg.md) |
| 第22章 | Sampler — 数值积分的艺术 / Sampler — The Art of Numerical Integration | [stage4/chapter22_sampler.md](stage4/chapter22_sampler.md) |

---

## 第五阶段：源码与魔改 | Stage 5: Source Code and Hacking

长期阶段 | Long-term stage

| 章节 | 标题 | 文件 |
|------|------|------|
| 第23章 | nanoGPT — 读懂一个小 GPT / nanoGPT — Reading a Small GPT | [stage5/chapter23_nanogpt.md](stage5/chapter23_nanogpt.md) |
| 第24章 | minGPT — 更清晰的实现 / minGPT — A Cleaner Implementation | [stage5/chapter24_mingpt.md](stage5/chapter24_mingpt.md) |
| 第25章 | HuggingFace Transformers — 工业标准 / HuggingFace Transformers — Industry Standard | [stage5/chapter25_huggingface.md](stage5/chapter25_huggingface.md) |
| 第26章 | 开始改 Attention — 魔改入门 / Modifying Attention — Introduction to Model Hacking | [stage5/chapter26_modify_attention.md](stage5/chapter26_modify_attention.md) |
| 第27章 | LoRA — 低秩微调 / LoRA — Low-Rank Adaptation | [stage5/chapter27_lora.md](stage5/chapter27_lora.md) |
| 第28章 | FlashAttention — IO-Aware 优化 / FlashAttention — IO-Aware Optimization | [stage5/chapter28_flash_attention.md](stage5/chapter28_flash_attention.md) |
| 第29章 | 推理系统 — vLLM 与 PagedAttention / Inference Systems — vLLM and PagedAttention | [stage5/chapter29_inference_system.md](stage5/chapter29_inference_system.md) |
| 第30章 | RLHF — 对齐人类偏好 / RLHF — Aligning with Human Preferences | [stage5/chapter30_rlhf.md](stage5/chapter30_rlhf.md) |

---

## 学习建议 | Study Recommendations

1. **按顺序学习**：每个阶段建立在前一个阶段的基础上 | Study in order: each stage builds on the previous
2. **动手实践**：每章的代码案例都要自己跑一遍 | Practice hands-on: run every chapter's code examples yourself
3. **做课后练习**：练习是掌握知识的唯一途径 | Do homework: practice is the only way to mastery
4. **建立空间直觉**：时刻关注 tensor shape 的变化 | Build spatial intuition: always pay attention to tensor shape changes
5. **读源码**：第五阶段的源码阅读是关键转折点 | Read source code: Stage 5 source reading is the key turning point

---

## 文件统计 | File Statistics

- 总章节数：30 章
- 总阶段数：5 个阶段
- 文件位置：`lectures/stage{1-5}/chapter{01-30}.md`
- 所有文件均包含：中文讲解 + English Explanation + 代码案例 + 课后练习
