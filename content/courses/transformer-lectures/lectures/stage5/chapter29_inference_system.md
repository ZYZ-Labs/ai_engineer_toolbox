# 第29章：推理系统 — vLLM 与 PagedAttention | Chapter 29: Inference Systems — vLLM and PagedAttention

> **阶段定位** | **Stage**: 第五阶段 — 源码与魔改
> **预计学时** | **Duration**: 4~6 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 理解大模型推理系统的核心挑战
- 掌握 vLLM 的核心创新：PagedAttention + Continuous Batching
- 了解推理优化的主要方向
- 能够部署和使用 vLLM

**English:**
- Understand core challenges of LLM inference systems
- Master vLLM's core innovations: PagedAttention + Continuous Batching
- Learn main directions of inference optimization
- Be able to deploy and use vLLM

---

## 29.1 大模型推理的挑战 | Challenges of LLM Inference

### 中文解释

**主要挑战：**

1. **内存瓶颈**：KV Cache 占用巨大
2. **计算瓶颈**：Prefill 阶段计算密集
3. **调度复杂**：不同请求的序列长度差异大
4. **吞吐量 vs 延迟**：难以同时优化

### English Explanation

**Main challenges:**

1. **Memory bottleneck**: KV Cache takes huge space
2. **Computation bottleneck**: Prefill phase is compute-intensive
3. **Scheduling complexity**: Different requests have different sequence lengths
4. **Throughput vs latency**: Hard to optimize both simultaneously

---

## 29.2 PagedAttention 深入 | Deep Dive into PagedAttention

### 中文解释

**核心思想：操作系统虚拟内存 → GPU KV Cache**

```
传统方式：| Traditional way:
  预分配 max_seq_len 的连续内存
  浪费严重，碎片化
  Pre-allocate contiguous memory of max_seq_len
  Severe waste, fragmentation

PagedAttention：
  将 KV Cache 分成固定大小的 block（如 16 tokens）
  按需分配 block
  block 不需要连续
  类似虚拟内存分页
  
  Divide KV Cache into fixed-size blocks (e.g., 16 tokens)
  Allocate blocks on demand
  Blocks don't need to be contiguous
  Similar to virtual memory paging
```

### English Explanation

**Core idea: OS virtual memory → GPU KV Cache**

```
Traditional way:
  Pre-allocate contiguous memory of max_seq_len
  Severe waste, fragmentation

PagedAttention:
  Divide KV Cache into fixed-size blocks (e.g., 16 tokens)
  Allocate blocks on demand
  Blocks don't need to be contiguous
  Similar to virtual memory paging
```

### 代码案例 | Code Example

```python
# vLLM 使用示例 | vLLM usage example

# 安装 | Install
# pip install vllm

from vllm import LLM, SamplingParams

# 加载模型 | Load model
llm = LLM(model="gpt2", dtype="float16")

# 配置采样参数 | Configure sampling parameters
sampling_params = SamplingParams(
    temperature=0.8,
    top_p=0.95,
    max_tokens=100,
)

# 批量推理 | Batch inference
prompts = [
    "The future of AI is",
    "Once upon a time",
    "In the year 2050,",
]

outputs = llm.generate(prompts, sampling_params)

for output in outputs:
    print(f"Prompt: {output.prompt}")
    print(f"Output: {output.outputs[0].text}")
    print()

# vLLM 自动处理：| vLLM automatically handles:
# - PagedAttention 内存管理 | PagedAttention memory management
# - Continuous Batching | Continuous batching
# - KV Cache 共享（对于同一个 prompt 的多个生成）| KV Cache sharing
```

---

## 29.3 Continuous Batching | Continuous Batching

### 中文解释

**传统 Batching：等待一批请求都完成才处理下一批**

问题：
- 一个长请求会阻塞整批短请求
- GPU 利用率低

**Continuous Batching：请求完成一个就加入新请求**

优势：
- GPU 始终满载
- 吞吐量提升 10-20 倍

### English Explanation

**Traditional Batching: Wait for all requests in a batch to complete**

Problem:
- One long request blocks all short requests in batch
- Low GPU utilization

**Continuous Batching: Add new request as soon as one completes**

Advantage:
- GPU always fully utilized
- Throughput improved by 10-20×

---

## 29.4 推理优化方向总结 | Inference Optimization Directions Summary

| 优化方向 | 技术 | 效果 |
|---------|------|------|
| 内存优化 | GQA, MQA, PagedAttention | 减少 KV Cache |
| 计算优化 | FlashAttention, Kernel Fusion | 加速 Attention |
| 量化优化 | INT8, INT4, GPTQ, AWQ | 减少显存，加速 |
| 调度优化 | Continuous Batching | 提高吞吐量 |
| 投机采样 | Speculative Decoding | 减少解码步数 |

| Optimization | Technology | Effect |
|-------------|-----------|--------|
| Memory | GQA, MQA, PagedAttention | Reduce KV Cache |
| Computation | FlashAttention, Kernel Fusion | Accelerate Attention |
| Quantization | INT8, INT4, GPTQ, AWQ | Reduce VRAM, faster |
| Scheduling | Continuous Batching | Increase throughput |
| Speculative | Speculative Decoding | Reduce decoding steps |

---

## 本章总结 | Chapter Summary

**中文：**
- 大模型推理的核心挑战是内存和调度
- vLLM 通过 PagedAttention + Continuous Batching 大幅提升吞吐量
- 推理优化是多维度的：内存、计算、量化、调度
- 生产环境部署 LLM 必备 vLLM 或同类系统

**English:**
- Core challenges of LLM inference are memory and scheduling
- vLLM significantly improves throughput via PagedAttention + Continuous Batching
- Inference optimization is multi-dimensional: memory, computation, quantization, scheduling
- Essential to use vLLM or equivalent for production LLM deployment

---

## 课后练习 | Homework

1. **vLLM 部署**：部署一个 vLLM 服务，测试吞吐量
2. **对比实验**：对比 vLLM 和 HuggingFace 原生推理的速度
3. **内存监控**：监控 vLLM 的 KV Cache 内存使用情况
4. **量化推理**：结合 GPTQ/AWQ 和 vLLM 做量化推理
5. **论文阅读**：阅读 vLLM 论文，理解 PagedAttention 的细节
