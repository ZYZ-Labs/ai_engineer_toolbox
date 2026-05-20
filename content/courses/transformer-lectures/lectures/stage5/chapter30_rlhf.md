# 第30章：RLHF — 对齐人类偏好 | Chapter 30: RLHF — Aligning with Human Preferences

> **阶段定位** | **Stage**: 第五阶段 — 源码与魔改
> **预计学时** | **Duration**: 6~8 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 理解 RLHF 的三阶段流程：SFT → Reward Model → PPO
- 掌握 Reward Model 的训练方法
- 理解 PPO 在 LLM 中的应用
- 了解 DPO 等替代方案

**English:**
- Understand three-stage RLHF process: SFT → Reward Model → PPO
- Master Reward Model training methods
- Understand PPO application in LLMs
- Learn about alternatives like DPO

---

## 30.1 为什么需要 RLHF？| Why RLHF?

### 中文解释

**预训练模型的问题：**

1. **有害内容**：可能生成危险信息
2. **不真实**：可能编造事实
3. **无帮助**：回答不符合用户意图

**RLHF = 用人类反馈来微调模型，使其更有用、更真实、更安全**

### English Explanation

**Problems with pretrained models:**

1. **Harmful content**: May generate dangerous information
2. **Untruthful**: May fabricate facts
3. **Unhelpful**: Answers don't match user intent

**RLHF = Use human feedback to fine-tune model to be more helpful, truthful, and safe**

---

## 30.2 三阶段流程 | Three-Stage Process

```
阶段 1: SFT（监督微调）| Stage 1: SFT (Supervised Fine-Tuning)
  数据：高质量指令-回答对 | Data: high-quality instruction-response pairs
  方法：标准监督学习 | Method: standard supervised learning
  输出：SFT 模型 | Output: SFT model
  
阶段 2: Reward Model（奖励模型）| Stage 2: Reward Model
  数据：同一问题的多个回答，人类排序 | Data: multiple answers to same question, human ranked
  方法：训练模型预测人类偏好 | Method: train model to predict human preference
  输出：Reward Model | Output: Reward Model
  
阶段 3: PPO（强化学习优化）| Stage 3: PPO (Proximal Policy Optimization)
  数据：使用 SFT 模型生成回答 | Data: generate responses using SFT model
  方法：用 Reward Model 作为奖励信号，PPO 优化策略 | Method: use Reward Model as reward signal, PPO optimizes policy
  输出：RLHF 模型 | Output: RLHF model
```

---

## 30.3 Reward Model | Reward Model

### 中文解释

**核心思想：训练一个模型来预测人类会更喜欢哪个回答**

训练数据：
```
问题 Q
回答 A_1（人类偏好）
回答 A_2（人类不喜欢）

目标：Reward(Q, A_1) > Reward(Q, A_2)
```

Loss（Bradley-Terry 模型）：
```
Loss = -log σ(r(Q, A_w) - r(Q, A_l))

其中 A_w 是赢的回答，A_l 是输的回答
Where A_w is winning answer, A_l is losing answer
```

### English Explanation

**Core idea: Train a model to predict which answer humans prefer**

Training data:
```
Question Q
Answer A_1 (human preference)
Answer A_2 (human dislike)

Goal: Reward(Q, A_1) > Reward(Q, A_2)
```

Loss (Bradley-Terry model):
```
Loss = -log σ(r(Q, A_w) - r(Q, A_l))

Where A_w is winning answer, A_l is losing answer
```

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

class RewardModel(nn.Module):
    """奖励模型 | Reward Model"""
    
    def __init__(self, base_model):
        super().__init__()
        self.base = base_model   # 通常用 SFT 模型初始化 | Usually initialized from SFT model
        
        # 替换 LM head 为奖励头 | Replace LM head with reward head
        self.reward_head = nn.Linear(base_model.config.hidden_size, 1)
    
    def forward(self, input_ids):
        """
        返回标量奖励值 | Returns scalar reward value
        """
        hidden = self.base(input_ids, output_hidden_states=True).hidden_states[-1]
        # 取最后一个 token 的 hidden state | Take last token's hidden state
        last_hidden = hidden[:, -1, :]   # (batch, hidden_size)
        reward = self.reward_head(last_hidden).squeeze(-1)   # (batch,)
        return reward

def reward_model_loss(reward_model, chosen_ids, rejected_ids):
    """
    奖励模型的 loss | Reward model loss
    chosen_ids: 人类偏好的回答 | Human-preferred answer
    rejected_ids: 人类不喜欢的回答 | Human-disliked answer
    """
    chosen_rewards = reward_model(chosen_ids)
    rejected_rewards = reward_model(rejected_ids)
    
    # Bradley-Terry loss
    loss = -torch.log(torch.sigmoid(chosen_rewards - rejected_rewards)).mean()
    return loss
```

---

## 30.4 PPO 在 LLM 中的应用 | PPO Application in LLMs

### 中文解释

**PPO = Proximal Policy Optimization**

在 LLM 中：
- **策略（Policy）**：LLM 本身，生成 token 的概率分布
- **奖励（Reward）**：Reward Model 的打分 + KL 惩罚
- **价值函数（Value）**：估计当前状态的期望累计奖励

**目标**：
```
最大化：E[Reward(response)] - β × KL(π_RL || π_SFT)

- Reward(response): Reward Model 的分数
- KL 惩罚：防止 RL 模型偏离 SFT 模型太远
```

### English Explanation

**PPO = Proximal Policy Optimization**

In LLMs:
- **Policy**: The LLM itself, probability distribution of generating tokens
- **Reward**: Score from Reward Model + KL penalty
- **Value function**: Estimates expected cumulative reward of current state

**Objective**:
```
Maximize: E[Reward(response)] - β × KL(π_RL || π_SFT)

- Reward(response): Score from Reward Model
- KL penalty: prevent RL model from deviating too far from SFT model
```

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn

class PPOTrainer:
    """简化版 PPO 训练器 | Simplified PPO trainer"""
    
    def __init__(self, policy_model, ref_model, reward_model, value_model):
        self.policy = policy_model      # 当前策略 | Current policy
        self.ref = ref_model            # 参考策略（SFT 模型，冻结）| Reference policy (SFT model, frozen)
        self.reward = reward_model      # 奖励模型 | Reward model
        self.value = value_model        # 价值模型 | Value model
        
        self.kl_coef = 0.1              # KL 惩罚系数 | KL penalty coefficient
    
    def compute_rewards(self, responses, input_ids):
        """计算奖励 | Compute rewards"""
        # 奖励模型打分 | Reward model score
        reward_scores = self.reward(responses)
        
        # KL 惩罚 | KL penalty
        with torch.no_grad():
            ref_logits = self.ref(responses).logits
        policy_logits = self.policy(responses).logits
        
        kl_div = torch.nn.functional.kl_div(
            torch.nn.functional.log_softmax(policy_logits, dim=-1),
            torch.nn.functional.softmax(ref_logits, dim=-1),
            reduction='batchmean'
        )
        
        rewards = reward_scores - self.kl_coef * kl_div
        return rewards
    
    def ppo_loss(self, old_logprobs, logprobs, advantages, epsilon=0.2):
        """
        PPO clipped loss
        """
        ratio = torch.exp(logprobs - old_logprobs)
        
        surr1 = ratio * advantages
        surr2 = torch.clamp(ratio, 1 - epsilon, 1 + epsilon) * advantages
        
        loss = -torch.min(surr1, surr2).mean()
        return loss
```

---

## 30.5 DPO — 更简单的替代方案 | DPO — A Simpler Alternative

### 中文解释

**DPO = Direct Preference Optimization**

**核心洞察：不需要显式训练 Reward Model 和 PPO**

直接用偏好数据优化策略：
```
Loss = -log σ(β × log(π(A_w|Q) / π_ref(A_w|Q)) - β × log(π(A_l|Q) / π_ref(A_l|Q)))
```

优势：
- 更简单，不需要训练 Reward Model
- 更稳定，没有强化学习的训练不稳定性
- 效果与 RLHF 相当

### English Explanation

**DPO = Direct Preference Optimization**

**Core insight: No need to explicitly train Reward Model and PPO**

Directly optimize policy with preference data:
```
Loss = -log σ(β × log(π(A_w|Q) / π_ref(A_w|Q)) - β × log(π(A_l|Q) / π_ref(A_l|Q)))
```

Advantages:
- Simpler, no need to train Reward Model
- More stable, no RL training instability
- Comparable performance to RLHF

### 代码案例 | Code Example

```python
import torch
import torch.nn.functional as F

def dpo_loss(policy_model, ref_model, chosen_ids, rejected_ids, beta=0.1):
    """
    DPO loss — 直接偏好优化 | Direct Preference Optimization
    """
    # 策略模型的 log prob | Policy model log prob
    policy_chosen_logits = policy_model(chosen_ids).logits
    policy_rejected_logits = policy_model(rejected_ids).logits
    
    # 参考模型的 log prob | Reference model log prob
    with torch.no_grad():
        ref_chosen_logits = ref_model(chosen_ids).logits
        ref_rejected_logits = ref_model(rejected_ids).logits
    
    # 计算 log ratios | Compute log ratios
    policy_chosen_logps = F.log_softmax(policy_chosen_logits, dim=-1)
    policy_rejected_logps = F.log_softmax(policy_rejected_logits, dim=-1)
    ref_chosen_logps = F.log_softmax(ref_chosen_logits, dim=-1)
    ref_rejected_logps = F.log_softmax(ref_rejected_logits, dim=-1)
    
    # 简化计算（实际应取对应 token 的 prob）| Simplified (should take corresponding token probs)
    chosen_reward = (policy_chosen_logps - ref_chosen_logps).mean()
    rejected_reward = (policy_rejected_logps - ref_rejected_logps).mean()
    
    # DPO loss
    loss = -F.logsigmoid(beta * (chosen_reward - rejected_reward)).mean()
    return loss
```

---

## 本章总结 | Chapter Summary

**中文：**
- RLHF = SFT + Reward Model + PPO
- Reward Model 学习预测人类偏好
- PPO 用奖励信号优化生成策略
- DPO 是更简单有效的替代方案
- 对齐是 LLM 从"能说话"到"会说话"的关键

**English:**
- RLHF = SFT + Reward Model + PPO
- Reward Model learns to predict human preference
- PPO optimizes generation policy with reward signal
- DPO is a simpler and effective alternative
- Alignment is key for LLMs to go from "can speak" to "speaks well"

---

## 课后练习 | Homework

1. **Reward Model**：实现一个简化版 Reward Model，在对比数据上训练
2. **PPO 理解**：用简单的 bandit 环境理解 PPO 的核心机制
3. **DPO 实现**：完整实现 DPO loss，与 RLHF 对比复杂度
4. **数据构造**：构造指令偏好数据，理解人类标注的过程
5. **论文阅读**：阅读 InstructGPT 和 DPO 论文，理解两种方法的优劣
