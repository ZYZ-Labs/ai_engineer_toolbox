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

export const ngLectureStages: LectureStage[] = [
  {
    slug: "stage1",
    number: 1,
    title: "机器学习基础",
    titleEn: "Machine Learning Fundamentals",
    duration: "3-4 weeks",
    chapters: [
      chapter("stage1", 1, "机器学习导论与线性回归", "ML Intro & Linear Regression", "chapter01", "chapter01_机器学习导论与线性回归.md", "examples/ch01_linear_regression.py"),
      chapter("stage1", 2, "多元回归与特征工程", "Multivariate Regression & Feature Engineering", "chapter02", "chapter02_多元回归与特征工程.md", "examples/ch02_multivariate_regression.py"),
      chapter("stage1", 3, "分类与逻辑回归", "Classification & Logistic Regression", "chapter03", "chapter03_分类与逻辑回归.md", "examples/ch03_logistic_regression.py"),
      chapter("stage1", 4, "正则化与过拟合", "Regularization & Overfitting", "chapter04", "chapter04_正则化与过拟合.md", "examples/ch04_regularization.py")
    ]
  },
  {
    slug: "stage2",
    number: 2,
    title: "神经网络与进阶算法",
    titleEn: "Neural Networks & Advanced Algorithms",
    duration: "4-5 weeks",
    chapters: [
      chapter("stage2", 5, "神经网络直觉", "Neural Network Intuition", "chapter05", "chapter05_神经网络直觉.md", "examples/ch05_neural_network_numpy.py"),
      chapter("stage2", 6, "TensorFlow 实现与训练", "TensorFlow Implementation & Training", "chapter06", "chapter06_TensorFlow_实现与训练.md", "examples/ch06_tensorflow_intro.py"),
      chapter("stage2", 7, "激活函数与多分类", "Activation Functions & Multiclass", "chapter07", "chapter07_激活函数与多分类.md", "examples/ch07_activation_multiclass.py"),
      chapter("stage2", 8, "ML 实践建议与偏差方差", "ML Practice & Bias-Variance", "chapter08", "chapter08_ML_实践建议与偏差方差.md", "examples/ch08_bias_variance.py"),
      chapter("stage2", 9, "决策树与集成学习", "Decision Trees & Ensemble Learning", "chapter09", "chapter09_决策树与集成学习.md", "examples/ch09_decision_trees.py")
    ]
  },
  {
    slug: "stage3",
    number: 3,
    title: "深度学习核心",
    titleEn: "Deep Learning Core",
    duration: "5-6 weeks",
    chapters: [
      chapter("stage3", 10, "深度学习概论与浅层网络", "Deep Learning Basics & Shallow Networks", "chapter10", "chapter10_深度学习概论与浅层网络.md", "examples/ch10_shallow_network.py"),
      chapter("stage3", 11, "深层神经网络", "Deep Neural Networks", "chapter11", "chapter11_深层神经网络.md", "examples/ch11_deep_network.py"),
      chapter("stage3", 12, "正则化与 Dropout", "Regularization & Dropout", "chapter12", "chapter12_正则化与_Dropout.md", "examples/ch12_dropout.py"),
      chapter("stage3", 13, "优化算法", "Optimization Algorithms", "chapter13", "chapter13_优化算法.md", "examples/ch13_optimization.py"),
      chapter("stage3", 14, "Batch Normalization", "Batch Normalization", "chapter14", "chapter14_Batch_Normalization.md", "examples/ch14_batchnorm.py")
    ]
  },
  {
    slug: "stage4",
    number: 4,
    title: "ML 项目策略与 CNN",
    titleEn: "ML Strategy & CNN",
    duration: "5-6 weeks",
    chapters: [
      chapter("stage4", 15, "ML 项目策略", "ML Project Strategy", "chapter15", "chapter15_ML项目策略.md", "examples/ch15_ml_strategy.py"),
      chapter("stage4", 16, "CNN 基础与卷积操作", "CNN Basics & Convolution", "chapter16", "chapter16_CNN基础与卷积操作.md", "examples/ch16_cnn_basics.py"),
      chapter("stage4", 17, "经典网络与 ResNet", "Classic Networks & ResNet", "chapter17", "chapter17_经典网络与ResNet.md", "examples/ch17_resnet.py"),
      chapter("stage4", 18, "目标检测与 YOLO", "Object Detection & YOLO", "chapter18", "chapter18_目标检测与YOLO.md", "examples/ch18_yolo.py"),
      chapter("stage4", 19, "人脸识别与神经风格迁移", "Face Recognition & Neural Style Transfer", "chapter19", "chapter19_人脸识别与神经风格迁移.md", "examples/ch19_siamese.py")
    ]
  },
  {
    slug: "stage5",
    number: 5,
    title: "序列模型与 Attention",
    titleEn: "Sequence Models & Attention",
    duration: "4-5 weeks",
    chapters: [
      chapter("stage5", 20, "RNN 与序列建模", "RNN & Sequence Modeling", "chapter20", "chapter20_RNN与序列建模.md", "examples/ch20_rnn.py"),
      chapter("stage5", 21, "词嵌入与 NLP 基础", "Word Embeddings & NLP Basics", "chapter21", "chapter21_词嵌入与NLP基础.md", "examples/ch21_word2vec.py"),
      chapter("stage5", 22, "Attention 机制", "Attention Mechanism", "chapter22", "chapter22_Attention机制.md", "examples/ch22_attention.py")
    ]
  },
  {
    slug: "stage6",
    number: 6,
    title: "无监督学习与生成式 AI",
    titleEn: "Unsupervised Learning & Generative AI",
    duration: "5-6 weeks",
    chapters: [
      chapter("stage6", 23, "聚类与异常检测", "Clustering & Anomaly Detection", "chapter23", "chapter23_聚类与异常检测.md", "examples/ch23_kmeans.py"),
      chapter("stage6", 24, "推荐系统", "Recommender Systems", "chapter24", "chapter24_推荐系统.md", "examples/ch24_recommender.py"),
      chapter("stage6", 25, "强化学习基础", "Reinforcement Learning Basics", "chapter25", "chapter25_强化学习基础.md", "examples/ch25_dqn.py"),
      chapter("stage6", 26, "Transformer 与 LLM 预训练", "Transformer & LLM Pre-training", "chapter26", "chapter26_Transformer_与_LLM_预训练.md", "examples/ch26_transformer.py"),
      chapter("stage6", 27, "微调、LoRA 与 RLHF", "Fine-tuning, LoRA & RLHF", "chapter27", "chapter27_微调、LoRA与RLHF.md", "examples/ch27_lora.py"),
      chapter("stage6", 28, "LLM 应用与 Agent", "LLM Applications & Agents", "chapter28", "chapter28_LLM应用与Agent.md", "examples/ch28_llm_app.py")
    ]
  }
];

export const ngLectureChapters = ngLectureStages.flatMap((stage) => stage.chapters);

const contentRoot = path.join(process.cwd(), "../../content/courses/lectures-source/course_ng/lectures");

function chapter(stage: string, number: number, title: string, titleEn: string, slug: string, file: string, exampleFile?: string): LectureChapter {
  return {
    stage,
    slug,
    number,
    title,
    titleEn,
    file,
    exampleFile
  };
}

export function findLectureChapter(stageSlug: string, chapterSlug: string) {
  return ngLectureChapters.find((item) => item.stage === stageSlug && item.slug === chapterSlug);
}

export function getLectureStaticParams() {
  return ngLectureChapters.map((item) => ({
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
