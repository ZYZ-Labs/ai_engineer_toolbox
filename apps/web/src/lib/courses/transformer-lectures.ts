import { readFile } from "node:fs/promises";
import path from "node:path";

export type LectureStage = {
  slug: string;
  number: number;
  title: string;
  titleEn: string;
  duration: string;
  chapters: LectureChapter[];
};

export type LectureChapter = {
  stage: string;
  slug: string;
  number: number;
  title: string;
  titleEn: string;
  file: string;
  exampleFile?: string;
};

export const transformerLectureStages: LectureStage[] = [
  {
    slug: "stage1",
    number: 1,
    title: "Tensor 与 Attention 基础",
    titleEn: "Tensor and Attention Fundamentals",
    duration: "1-2 months",
    chapters: [
      chapter("stage1", 1, "NumPy Tensor 基础", "NumPy Tensor Fundamentals", "chapter01_numpy_tensor.md", "examples/ch01_numpy_tensor.py"),
      chapter("stage1", 2, "向量 - Attention 的灵魂", "Vectors - The Soul of Attention", "chapter02_vectors.md", "examples/ch02_vectors.py"),
      chapter("stage1", 3, "矩阵与投影", "Matrices and Projection", "chapter03_matrix_projection.md", "examples/ch03_matrix.py"),
      chapter("stage1", 4, "Softmax - 概率的艺术", "Softmax - The Art of Probability", "chapter04_softmax.md", "examples/ch04_softmax.py"),
      chapter("stage1", 5, "从零手写 Attention", "Writing Attention from Scratch", "chapter05_attention_from_scratch.md", "examples/ch05_attention.py")
    ]
  },
  {
    slug: "stage2",
    number: 2,
    title: "PyTorch 与训练系统",
    titleEn: "PyTorch and Training System",
    duration: "1-2 months",
    chapters: [
      chapter("stage2", 6, "PyTorch Tensor - 从 NumPy 到 GPU", "PyTorch Tensor - From NumPy to GPU", "chapter06_pytorch_tensor.md", "examples/ch06_pytorch_tensor.py"),
      chapter("stage2", 7, "Autograd - PyTorch 的灵魂", "Autograd - The Soul of PyTorch", "chapter07_autograd.md", "examples/ch07_autograd.py"),
      chapter("stage2", 8, "Gradient 与 Optimizer", "Gradient and Optimizer", "chapter08_gradient_optimizer.md", "examples/ch08_optimizer.py"),
      chapter("stage2", 9, "手写训练循环", "Writing Training Loop", "chapter09_training_loop.md", "examples/ch09_training_loop.py")
    ]
  },
  {
    slug: "stage3",
    number: 3,
    title: "Transformer 核心",
    titleEn: "Transformer Core",
    duration: "2-3 months",
    chapters: [
      chapter("stage3", 10, "Multi-Head Attention", "Multi-Head Attention", "chapter10_multihead_attention.md", "examples/ch10_multihead_attention.py"),
      chapter("stage3", 11, "Position Encoding - 给模型顺序感", "Position Encoding - Giving the Model a Sense of Order", "chapter11_position_encoding.md", "examples/ch11_position_encoding.py"),
      chapter("stage3", 12, "Residual + LayerNorm", "Residual + LayerNorm", "chapter12_residual_layernorm.md", "examples/ch12_residual_layernorm.py"),
      chapter("stage3", 13, "FFN - Feed Forward Network", "FFN - Feed Forward Network", "chapter13_ffn.md", "examples/ch13_ffn.py"),
      chapter("stage3", 14, "Transformer Block - 拼完整", "Transformer Block - Putting It All Together", "chapter14_transformer_block.md", "examples/ch14_transformer_block.py"),
      chapter("stage3", 15, "Decoder-only GPT", "Decoder-only GPT", "chapter15_decoder_only_gpt.md", "examples/ch15_gpt_generation.py"),
      chapter("stage3", 16, "KV Cache", "KV Cache", "chapter16_kv_cache.md", "examples/ch16_kv_cache_impl.py")
    ]
  },
  {
    slug: "stage4",
    number: 4,
    title: "Diffusion",
    titleEn: "Diffusion",
    duration: "1-2 months",
    chapters: [
      chapter("stage4", 17, "Diffusion 基础", "Diffusion Basics", "chapter17_diffusion_basics.md", "examples/ch17_diffusion.py"),
      chapter("stage4", 18, "VAE 与 Latent Space", "VAE and Latent Space", "chapter18_vae_latent.md", "examples/ch18_vae.py"),
      chapter("stage4", 19, "UNet", "UNet", "chapter19_unet.md", "examples/ch19_unet.py"),
      chapter("stage4", 20, "Cross Attention", "Cross Attention", "chapter20_cross_attention.md", "examples/ch20_cross_attention.py"),
      chapter("stage4", 21, "CFG", "Classifier-Free Guidance", "chapter21_cfg.md", "examples/ch21_cfg.py"),
      chapter("stage4", 22, "Sampler", "Sampler", "chapter22_sampler.md", "examples/ch22_sampler.py")
    ]
  },
  {
    slug: "stage5",
    number: 5,
    title: "源码与魔改",
    titleEn: "Source Code and Hacking",
    duration: "Long-term",
    chapters: [
      chapter("stage5", 23, "nanoGPT", "Reading a Small GPT", "chapter23_nanogpt.md", "examples/ch23_nanogpt.py"),
      chapter("stage5", 24, "minGPT", "A Cleaner Implementation", "chapter24_mingpt.md", "examples/ch24_mingpt.py"),
      chapter("stage5", 25, "HuggingFace Transformers", "Industry Standard", "chapter25_huggingface.md", "examples/ch25_huggingface.py"),
      chapter("stage5", 26, "开始改 Attention", "Modifying Attention", "chapter26_modify_attention.md", "examples/ch26_modify_attention.py"),
      chapter("stage5", 27, "LoRA", "Low-Rank Adaptation", "chapter27_lora.md", "examples/ch27_lora.py"),
      chapter("stage5", 28, "FlashAttention", "IO-Aware Optimization", "chapter28_flash_attention.md", "examples/ch28_flash_attention.py"),
      chapter("stage5", 29, "推理系统", "Inference Systems", "chapter29_inference_system.md", "examples/ch29_inference.py"),
      chapter("stage5", 30, "RLHF", "Aligning Human Preferences", "chapter30_rlhf.md", "examples/ch30_rlhf.py")
    ]
  }
];

export const transformerLectureChapters = transformerLectureStages.flatMap((stage) => stage.chapters);

const contentRoot = path.join(process.cwd(), "../../content/courses/transformer-lectures/lectures");

function chapter(stage: string, number: number, title: string, titleEn: string, file: string, exampleFile?: string): LectureChapter {
  return {
    stage,
    slug: file.replace(/\.md$/, ""),
    number,
    title,
    titleEn,
    file,
    exampleFile
  };
}

export function findLectureChapter(stageSlug: string, chapterSlug: string) {
  return transformerLectureChapters.find((item) => item.stage === stageSlug && item.slug === chapterSlug);
}

export function getLectureStaticParams() {
  return transformerLectureChapters.map((item) => ({
    stage: item.stage,
    chapter: item.slug
  }));
}

export async function readLectureMarkdown(item: LectureChapter) {
  return readFile(path.join(contentRoot, item.stage, item.file), "utf8");
}

export async function readLectureExample(item: LectureChapter) {
  if (!item.exampleFile) return "";
  try {
    return await readFile(path.join(contentRoot, item.stage, item.exampleFile), "utf8");
  } catch {
    return "";
  }
}
