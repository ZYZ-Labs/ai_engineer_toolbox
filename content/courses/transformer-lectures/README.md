# Transformer-Lectures

> 从零开始理解 Transformer 的完整学习路线讲义（中英双语 + 可运行 Python 案例）
>
> Complete learning path lectures for understanding Transformer from scratch (Bilingual + Runnable Python Examples)

---

## 项目简介 | Project Overview

本项目是一套面向工程师的 Transformer 底层学习讲义，包含：

- **30 章完整讲义**（Markdown，中英双语）
- **30 个可独立运行的 Python 案例**
- 覆盖 NumPy → PyTorch → Attention → Transformer → Diffusion → 源码魔改 的完整链路

---

## 目录结构 | Directory Structure

```
.
├── README.md                          # 本文件
├── transformer_complete_learning_path_markdown.md  # 原始学习路线文档
├── AGENTS.md                          # 项目协作规范
└── lectures/                          # 讲义主目录
    ├── README.md                      # 讲义索引目录
    ├── stage1/                        # 第一阶段：Tensor 与 Attention 基础
    │   ├── chapter01_numpy_tensor.md
    │   ├── chapter02_vectors.md
    │   ├── chapter03_matrix_projection.md
    │   ├── chapter04_softmax.md
    │   ├── chapter05_attention_from_scratch.md
    │   └── examples/                  # 配套 Python 案例
    │       ├── ch01_numpy_tensor.py
    │       ├── ch02_vectors.py
    │       ├── ch03_matrix.py
    │       ├── ch04_softmax.py
    │       └── ch05_attention.py
    ├── stage2/                        # 第二阶段：PyTorch 与训练系统
    │   ├── chapter06_pytorch_tensor.md
    │   ├── chapter07_autograd.md
    │   ├── chapter08_gradient_optimizer.md
    │   ├── chapter09_training_loop.md
    │   └── examples/
    │       ├── ch06_pytorch_tensor.py
    │       ├── ch07_autograd.py
    │       ├── ch08_optimizer.py
    │       └── ch09_training_loop.py
    ├── stage3/                        # 第三阶段：Transformer 核心
    │   ├── chapter10_multihead_attention.md
    │   ├── chapter11_position_encoding.md
    │   ├── chapter12_residual_layernorm.md
    │   ├── chapter13_ffn.md
    │   ├── chapter14_transformer_block.md
    │   ├── chapter15_decoder_only_gpt.md
    │   ├── chapter16_kv_cache.md
    │   └── examples/
    │       ├── ch10_multihead_attention.py
    │       ├── ch11_position_encoding.py
    │       ├── ch12_residual_layernorm.py
    │       ├── ch13_ffn.py
    │       ├── ch14_transformer_block.py
    │       ├── ch15_gpt_generation.py
    │       └── ch16_kv_cache_impl.py
    ├── stage4/                        # 第四阶段：Diffusion
    │   ├── chapter17_diffusion_basics.md
    │   ├── chapter18_vae_latent.md
    │   ├── chapter19_unet.md
    │   ├── chapter20_cross_attention.md
    │   ├── chapter21_cfg.md
    │   ├── chapter22_sampler.md
    │   └── examples/
    │       ├── ch17_diffusion.py
    │       ├── ch18_vae.py
    │       ├── ch19_unet.py
    │       ├── ch20_cross_attention.py
    │       ├── ch21_cfg.py
    │       └── ch22_sampler.py
    └── stage5/                        # 第五阶段：源码与魔改
        ├── chapter23_nanogpt.md
        ├── chapter24_mingpt.md
        ├── chapter25_huggingface.md
        ├── chapter26_modify_attention.md
        ├── chapter27_lora.md
        ├── chapter28_flash_attention.md
        ├── chapter29_inference_system.md
        ├── chapter30_rlhf.md
        └── examples/
            ├── ch23_nanogpt.py
            ├── ch24_mingpt.py
            ├── ch25_huggingface.py
            ├── ch26_modify_attention.py
            ├── ch27_lora.py
            ├── ch28_flash_attention.py
            ├── ch29_inference.py
            └── ch30_rlhf.py
```

---

## 快速开始 | Quick Start

### 阅读讲义 | Read Lectures

按顺序阅读 `lectures/stage{1-5}/chapter{01-30}.md`，建议从 `lectures/README.md` 开始。

### 运行案例 | Run Examples

```bash
# 第5章：手写 Attention
cd lectures/stage1/examples
python ch05_attention.py

# 第14章：Transformer Block
cd lectures/stage3/examples
python ch14_transformer_block.py

# 第23章：nanoGPT
cd lectures/stage5/examples
python ch23_nanogpt.py
```

### 环境要求 | Requirements

- Python 3.8+
- NumPy
- PyTorch
- transformers (可选，第25章)
- flash-attn (可选，第28章)

```bash
pip install numpy torch transformers
```

---

## 学习路线 | Learning Path

| 阶段 | 主题 | 预计学时 | 章节 |
|------|------|---------|------|
| Stage 1 | Tensor 与 Attention 基础 | 1~2 个月 | Ch01~Ch05 |
| Stage 2 | PyTorch 与训练系统 | 1~2 个月 | Ch06~Ch09 |
| Stage 3 | Transformer 核心 | 2~3 个月 | Ch10~Ch16 |
| Stage 4 | Diffusion | 1~2 个月 | Ch17~Ch22 |
| Stage 5 | 源码与魔改 | 长期 | Ch23~Ch30 |

---

## 讲义特色 | Lecture Features

- **中英双语**：每章核心概念均提供中英文对照
- **代码案例**：每章配套可独立运行的 Python 脚本
- **Shape 追踪**：强调 Tensor 维度变化，培养空间直觉
- **可视化图解**：ASCII/文字图解辅助理解
- **课后练习**：每章5道动手练习题

---

## 适用人群 | Target Audience

- 有 Python / Linux / Git 基础的工程师
- 跑过 Stable Diffusion / LoRA，想深入理解底层
- 不满足于调 API / Prompt 工程
- 想真正进入 AI 底层方向

---

## 许可证 | License

MIT License

---

## 致谢 | Acknowledgments

- 原始学习路线由社区贡献
- nanoGPT / minGPT by Andrej Karpathy
- HuggingFace Transformers
