"""
第25章：Deep Q-Network (DQN) 概念实现
Chapter 25: Deep Q-Network Conceptual Implementation
"""
import numpy as np
import torch
import torch.nn as nn

class DQN(nn.Module):
    """简单的 DQN 网络"""
    def __init__(self, state_dim, action_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 64),
            nn.ReLU(),
            nn.Linear(64, action_dim)
        )

    def forward(self, x):
        return self.net(x)

# 模拟 CartPole 环境: state=[位置, 速度, 角度, 角速度], action=[左, 右]
state_dim, action_dim = 4, 2
policy_net = DQN(state_dim, action_dim)
target_net = DQN(state_dim, action_dim)
target_net.load_state_dict(policy_net.state_dict())

optimizer = torch.optim.Adam(policy_net.parameters(), lr=1e-3)

# 模拟经验回放
def train_step(batch_size=32):
    """从回放缓冲区采样并训练"""
    # 模拟数据: (state, action, reward, next_state, done)
    states = torch.randn(batch_size, state_dim)
    actions = torch.randint(0, action_dim, (batch_size,))
    rewards = torch.randn(batch_size)
    next_states = torch.randn(batch_size, state_dim)
    dones = torch.rand(batch_size) < 0.1

    # 当前 Q 值
    q_values = policy_net(states)
    q_values = q_values.gather(1, actions.unsqueeze(1)).squeeze()

    # 目标 Q 值 (Bellman Equation)
    with torch.no_grad():
        next_q = target_net(next_states).max(1)[0]
        targets = rewards + 0.99 * next_q * (~dones).float()

    loss = nn.MSELoss()(q_values, targets)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    return loss.item()

# 训练几轮
for episode in range(100):
    loss = train_step()
    if episode % 20 == 0:
        print(f"Episode {episode}: Loss={loss:.4f}")

print("\nDQN 核心要素:")
print("1. 经验回放: 打破数据相关性")
print("2. 目标网络: 稳定训练目标")
print("3. Bellman 方程: Q(s,a) = r + γ*max(Q(s',a'))")
