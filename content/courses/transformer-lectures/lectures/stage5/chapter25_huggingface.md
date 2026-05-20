# 第25章：HuggingFace Transformers — 工业标准 | Chapter 25: HuggingFace Transformers — Industry Standard

> **阶段定位** | **Stage**: 第五阶段 — 源码与魔改
> **预计学时** | **Duration**: 6~8 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 掌握 HuggingFace Transformers 库的核心用法
- 理解 AutoModel、AutoTokenizer 的设计哲学
- 能够加载、推理、微调预训练模型
- 理解模型配置文件的作用

**English:**
- Master core usage of HuggingFace Transformers library
- Understand design philosophy of AutoModel, AutoTokenizer
- Be able to load, infer, and fine-tune pretrained models
- Understand role of model configuration files

---

## 25.1 HuggingFace 生态概览 | HuggingFace Ecosystem Overview

### 中文解释

**HuggingFace = AI 界的 GitHub**

核心组件：
- `transformers`：模型库和 API
- `datasets`：数据集库
- `tokenizers`：高效分词器
- `accelerate`：分布式训练
- `diffusers`：Diffusion 模型

### English Explanation

**HuggingFace = GitHub of AI**

Core components:
- `transformers`: Model library and API
- `datasets`: Dataset library
- `tokenizers`: Efficient tokenizers
- `accelerate`: Distributed training
- `diffusers`: Diffusion models

---

## 25.2 基础使用 | Basic Usage

### 代码案例 | Code Example

```python
# 安装 | Install
# pip install transformers datasets accelerate

from transformers import AutoModel, AutoTokenizer, AutoModelForCausalLM
import torch

# ========== 1. 加载模型和分词器 | Load model and tokenizer ==========
model_name = "gpt2"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

print(f"Model: {model_name}")
print(f"Vocab size: {tokenizer.vocab_size}")
print(f"Model params: {sum(p.numel() for p in model.parameters()):,}")

# ========== 2. Tokenize ==========
text = "Hello, how are you?"
tokens = tokenizer(text, return_tensors="pt")
print(f"\nTokens: {tokens['input_ids']}")
print(f"Token strings: {tokenizer.convert_ids_to_tokens(tokens['input_ids'][0])}")

# ========== 3. 推理 | Inference ==========
with torch.no_grad():
    outputs = model(**tokens)
    logits = outputs.logits

print(f"\nLogits shape: {logits.shape}")   # (1, seq_len, vocab_size)

# 预测下一个 token | Predict next token
next_token_logits = logits[0, -1, :]
next_token_id = torch.argmax(next_token_logits).item()
print(f"Predicted next token: '{tokenizer.decode([next_token_id])}'")

# ========== 4. 文本生成 | Text generation ==========
input_text = "Once upon a time"
input_ids = tokenizer.encode(input_text, return_tensors="pt")

output = model.generate(
    input_ids,
    max_length=50,
    num_return_sequences=1,
    temperature=0.8,
    do_sample=True,
    top_k=50,
    top_p=0.95,
)

generated_text = tokenizer.decode(output[0], skip_special_tokens=True)
print(f"\nGenerated: {generated_text}")
```

---

## 25.3 模型架构深入 | Deep Dive into Model Architecture

### 代码案例 | Code Example

```python
from transformers import GPT2LMHeadModel, GPT2Config

# 查看模型结构 | Inspect model structure
model = GPT2LMHeadModel.from_pretrained("gpt2")

print("模型结构 | Model structure:")
for name, module in model.named_children():
    print(f"  {name}: {module.__class__.__name__}")

# 访问具体层 | Access specific layers
print("\n第一层 Transformer | First transformer layer:")
first_block = model.transformer.h[0]
print(first_block)

# 访问注意力权重 | Access attention weights
print("\n注意力层 | Attention layer:")
attn = first_block.attn
print(f"  c_attn: {attn.c_attn}")
print(f"  c_proj: {attn.c_proj}")

# 查看配置 | Check configuration
config = model.config
print(f"\n配置 | Config:")
print(f"  n_layer: {config.n_layer}")
print(f"  n_head: {config.n_head}")
print(f"  n_embd: {config.n_embd}")
print(f"  vocab_size: {config.vocab_size}")
```

---

## 25.4 微调（Fine-tuning）| Fine-tuning

### 代码案例 | Code Example

```python
from transformers import AutoModelForCausalLM, AutoTokenizer, Trainer, TrainingArguments
from datasets import load_dataset

# 加载模型 | Load model
model = AutoModelForCausalLM.from_pretrained("gpt2")
tokenizer = AutoTokenizer.from_pretrained("gpt2")
tokenizer.pad_token = tokenizer.eos_token

# 准备数据 | Prepare data
dataset = load_dataset("wikitext", "wikitext-2-raw-v1", split="train")

def tokenize_function(examples):
    return tokenizer(examples["text"], truncation=True, max_length=128, padding="max_length")

tokenized_dataset = dataset.map(tokenize_function, batched=True, remove_columns=dataset.column_names)

# 训练参数 | Training arguments
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=1,
    per_device_train_batch_size=4,
    learning_rate=5e-5,
    logging_steps=100,
    save_steps=500,
)

# 训练器 | Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
)

# 开始训练 | Start training
# trainer.train()
```

---

## 25.5 保存和加载 | Saving and Loading

### 代码案例 | Code Example

```python
# 保存模型 | Save model
model.save_pretrained("./my_model")
tokenizer.save_pretrained("./my_model")

# 加载模型 | Load model
model = AutoModelForCausalLM.from_pretrained("./my_model")
tokenizer = AutoTokenizer.from_pretrained("./my_model")

# 保存为 safetensors 格式（更安全、更快）| Save as safetensors format (safer, faster)
# model.save_pretrained("./my_model", safe_serialization=True)
```

---

## 本章总结 | Chapter Summary

**中文：**
- HuggingFace Transformers 是工业标准
- AutoModel/AutoTokenizer 自动推断模型类型
- 支持加载、推理、微调、保存全套流程
- 模型 Hub 上有数十万个预训练模型

**English:**
- HuggingFace Transformers is the industry standard
- AutoModel/AutoTokenizer automatically infer model type
- Supports complete workflow: load, infer, fine-tune, save
- Model Hub has hundreds of thousands of pretrained models

---

## 课后练习 | Homework

1. **模型加载**：加载不同模型（BERT, GPT-2, LLaMA），比较它们的配置
2. **文本生成**：用 GPT-2 实现一个交互式文本生成器
3. **注意力提取**：从 GPT-2 中提取并可视化 attention weights
4. **LoRA 微调**：使用 peft 库对模型进行 LoRA 微调
5. **模型上传**：将自己微调的模型上传到 HuggingFace Hub
