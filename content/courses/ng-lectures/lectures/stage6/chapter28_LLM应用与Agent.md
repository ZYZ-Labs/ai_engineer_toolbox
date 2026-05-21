# 第28章 LLM应用与Agent

## 目标

把大模型落地到实际应用。

---

## 必学内容

### 推理策略

```python
# Greedy Decoding: 每次都选概率最高的
# Beam Search: 保留 top-k 序列
# Sampling: 按概率随机采样（temperature 控制）
```

### RAG (Retrieval-Augmented Generation)

```python
# 1. 用户查询 → 向量检索
# 2. 召回相关文档
# 3. 文档 + 查询 → LLM 生成回答
```

### Chain-of-Thought

```python
# 让模型"一步一步想"
# 显著提升推理能力
```

### Agent 基础

```python
# LLM + 工具调用 (Tool Use)
# LLM + 规划 (Planning)
# ReAct: Reasoning + Acting 交替
```

---

## 真正目标

掌握 LLM 不是：

# 只会调 API

而是：

- 理解预训练原理
- 会选择微调策略
- 能设计 RAG 系统
- 能构建简单 Agent

---

