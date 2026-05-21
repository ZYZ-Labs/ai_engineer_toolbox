"""
第23章：K-Means 聚类
Chapter 23: K-Means Clustering
"""
import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)

# 生成3个簇的数据
cluster1 = np.random.randn(50, 2) + np.array([2, 2])
cluster2 = np.random.randn(50, 2) + np.array([-2, 2])
cluster3 = np.random.randn(50, 2) + np.array([0, -3])
X = np.vstack([cluster1, cluster2, cluster3])

# K-Means 算法
K = 3
m = X.shape[0]
centroids = X[np.random.choice(m, K, replace=False)]

for iteration in range(100):
    # 分配步骤
    distances = np.linalg.norm(X[:, None, :] - centroids[None, :, :], axis=2)
    labels = np.argmin(distances, axis=1)

    # 更新步骤
    new_centroids = np.array([X[labels == k].mean(axis=0) for k in range(K)])

    if np.allclose(centroids, new_centroids):
        print(f"收敛于第 {iteration} 轮")
        break
    centroids = new_centroids

# 可视化
plt.figure(figsize=(8, 6))
colors = ['red', 'blue', 'green']
for k in range(K):
    plt.scatter(X[labels == k, 0], X[labels == k, 1], c=colors[k], alpha=0.5, label=f'Cluster {k}')
plt.scatter(centroids[:, 0], centroids[:, 1], c='black', marker='X', s=200, label='Centroids')
plt.legend()
plt.title('K-Means Clustering (K=3)')
plt.savefig('ch23_kmeans.png')
print("可视化已保存到 ch23_kmeans.png")
