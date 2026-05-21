"""
第9章：决策树与集成学习（XGBoost）
Chapter 9: Decision Trees & Ensemble Learning
"""
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.ensemble import RandomForestClassifier
import matplotlib.pyplot as plt

# 数据
X, y = make_classification(n_samples=1000, n_features=4, n_redundant=0,
                           n_informative=4, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 单棵决策树（容易过拟合）
tree = DecisionTreeClassifier(max_depth=5, random_state=42)
tree.fit(X_train, y_train)
print(f"单棵决策树 (max_depth=5) 准确率: {tree.score(X_test, y_test):.4f}")

# 随机森林
rf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
rf.fit(X_train, y_train)
print(f"随机森林 (100 trees) 准确率: {rf.score(X_test, y_test):.4f}")

# 特征重要性
print(f"\n随机森林特征重要性: {rf.feature_importances_.round(3)}")

# 可视化单棵树（限制深度）
fig, ax = plt.subplots(figsize=(16, 8))
plot_tree(tree, max_depth=3, fontsize=8, ax=ax, filled=True,
          feature_names=[f'F{i}' for i in range(4)])
plt.title('Decision Tree Structure (depth=3 shown)')
plt.tight_layout()
plt.savefig('ch09_decision_tree.png')
print("\n树结构可视化已保存到 ch09_decision_tree.png")
