"""
第24章：协同过滤推荐系统
Chapter 24: Collaborative Filtering Recommender
"""
import numpy as np

# 用户-物品评分矩阵 (4用户 x 5物品), 0表示未评分
R = np.array([
    [5, 3, 0, 1, 0],
    [4, 0, 0, 1, 2],
    [1, 1, 0, 5, 0],
    [0, 0, 4, 4, 5],
])

num_users, num_items = R.shape
num_features = 2

# 初始化用户特征和物品特征
X = np.random.randn(num_items, num_features)  # 物品特征
W = np.random.randn(num_users, num_features)  # 用户特征
b = np.zeros((1, num_items))

# 训练 (梯度下降)
alpha = 0.01
iterations = 1000

for _ in range(iterations):
    # 只计算已评分的误差
    for i in range(num_users):
        for j in range(num_items):
            if R[i, j] > 0:
                pred = W[i] @ X[j] + b[0, j]
                error = pred - R[i, j]
                W[i] -= alpha * error * X[j]
                X[j] -= alpha * error * W[i]
                b[0, j] -= alpha * error

# 预测完整矩阵
predictions = W @ X.T + b
print("原始评分矩阵:")
print(R)
print("\n预测评分矩阵:")
print(np.round(predictions, 1))

# 为用户0推荐未评分物品
user = 0
unrated = np.where(R[user] == 0)[0]
recommendations = [(j, predictions[user, j]) for j in unrated]
recommendations.sort(key=lambda x: -x[1])
print(f"\n给用户 {user} 的推荐 (未评分物品按预测分排序):")
for item, score in recommendations:
    print(f"  物品 {item}: 预测评分 {score:.2f}")
