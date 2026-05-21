"""
第15章：ML项目策略 — 误差分析模拟
Chapter 15: ML Strategy — Error Analysis Simulation
"""
import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

# 模拟分类任务
X, y = make_classification(n_samples=1000, n_features=20, random_state=42)
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

# 基线模型
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)
val_acc = model.score(X_val, y_val)
print(f"验证集准确率: {val_acc:.4f}")
print(f"验证集错误率: {1-val_acc:.2%}")

# 模拟：对 100 个错误样本进行误差分析
# 假设我们有额外的元数据来分类错误原因
np.random.seed(1)
n_errors = int((1 - val_acc) * len(y_val))
error_reasons = {
    '模糊边界样本': int(n_errors * 0.45),
    '噪声标签': int(n_errors * 0.25),
    '特征缺失': int(n_errors * 0.20),
    '其他': int(n_errors * 0.10)
}

print("\n误差分析（模拟 100 个错误样本）:")
print("-" * 40)
for reason, count in sorted(error_reasons.items(), key=lambda x: -x[1]):
    pct = count / sum(error_reasons.values()) * 100
    bar = "█" * int(pct / 2)
    print(f"{reason:12s}: {count:3d} ({pct:5.1f}%) {bar}")

print("\n结论：")
print("- 最大头因是 '模糊边界样本' (45%)")
print("- 策略：收集更多该类型数据，或换更复杂模型")
print("- 不要均匀用力，优先解决占比最高的错误类型")
