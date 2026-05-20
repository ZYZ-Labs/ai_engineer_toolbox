"""
第30章案例：RLHF 三阶段流程
Chapter 30 Example: RLHF Three-Stage Pipeline

运行方式: python ch30_rlhf.py
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


def demo_reward_model_loss():
    """奖励模型 Loss"""
    print("=" * 50)
    print("1. Reward Model Loss (Bradley-Terry)")
    print("=" * 50)

    # 模拟同一问题的两个回答的奖励分数
    chosen_rewards = torch.tensor([2.5, 3.0, 1.8])   # 人类偏好
    rejected_rewards = torch.tensor([1.0, 1.5, 2.0])  # 人类不喜欢

    # Bradley-Terry loss
    loss = -torch.log(torch.sigmoid(chosen_rewards - rejected_rewards)).mean()

    print(f"Chosen rewards:   {chosen_rewards.tolist()}")
    print(f"Rejected rewards: {rejected_rewards.tolist()}")
    print(f"Loss: {loss.item():.4f}")

    # 验证：chosen 应该都大于 rejected
    for i in range(len(chosen_rewards)):
        better = chosen_rewards[i] > rejected_rewards[i]
        print(f"  Pair {i}: chosen={chosen_rewards[i]:.2f}, rejected={rejected_rewards[i]:.2f}, correct={better}")


def demo_ppo_clip():
    """PPO Clip"""
    print("\n" + "=" * 50)
    print("2. PPO Clip Objective")
    print("=" * 50)

    # 模拟策略更新
    old_logprobs = torch.tensor([-1.0, -2.0, -1.5])
    new_logprobs = torch.tensor([-0.8, -2.5, -1.2])
    advantages = torch.tensor([1.0, 0.5, -0.5])

    ratio = torch.exp(new_logprobs - old_logprobs)
    epsilon = 0.2

    surr1 = ratio * advantages
    surr2 = torch.clamp(ratio, 1 - epsilon, 1 + epsilon) * advantages
    ppo_loss = -torch.min(surr1, surr2).mean()

    print(f"Ratio:     {ratio.round(3).tolist()}")
    print(f"Surr1:     {surr1.round(3).tolist()}")
    print(f"Surr2:     {surr2.round(3).tolist()}")
    print(f"PPO Loss:  {ppo_loss.item():.4f}")


def demo_dpo_loss():
    """DPO Loss"""
    print("\n" + "=" * 50)
    print("3. DPO Loss (Direct Preference Optimization)")
    print("=" * 50)

    beta = 0.1

    # 策略模型对 chosen/rejected 的 log prob
    policy_chosen_logp = torch.tensor([-0.5, -0.3, -1.0])
    policy_rejected_logp = torch.tensor([-1.2, -1.5, -0.8])

    # 参考模型的 log prob
    ref_chosen_logp = torch.tensor([-0.6, -0.4, -1.1])
    ref_rejected_logp = torch.tensor([-1.1, -1.4, -0.9])

    chosen_reward = beta * (policy_chosen_logp - ref_chosen_logp)
    rejected_reward = beta * (policy_rejected_logp - ref_rejected_logp)

    dpo_loss = -F.logsigmoid(chosen_reward - rejected_reward).mean()

    print(f"Chosen reward:   {chosen_reward.round(3).tolist()}")
    print(f"Rejected reward: {rejected_reward.round(3).tolist()}")
    print(f"DPO Loss:        {dpo_loss.item():.4f}")


def demo_kl_penalty():
    """KL 惩罚"""
    print("\n" + "=" * 50)
    print("4. KL Divergence Penalty")
    print("=" * 50)

    # 策略模型和参考模型的概率分布
    policy_logits = torch.tensor([[1.0, 2.0, 3.0]])
    ref_logits = torch.tensor([[1.5, 1.5, 3.5]])

    policy_probs = F.softmax(policy_logits, dim=-1)
    ref_probs = F.softmax(ref_logits, dim=-1)

    kl = F.kl_div(F.log_softmax(policy_logits, dim=-1), ref_probs, reduction='batchmean')
    print(f"Policy probs: {policy_probs[0].round(3).tolist()}")
    print(f"Ref probs:    {ref_probs[0].round(3).tolist()}")
    print(f"KL Divergence: {kl.item():.4f}")


if __name__ == "__main__":
    demo_reward_model_loss()
    demo_ppo_clip()
    demo_dpo_loss()
    demo_kl_penalty()
