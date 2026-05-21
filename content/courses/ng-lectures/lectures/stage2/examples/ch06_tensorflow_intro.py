"""
第6章：TensorFlow/Keras 实现神经网络
Chapter 6: Neural Network with TensorFlow/Keras
"""
import numpy as np
import tensorflow as tf
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Dense
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

# 数据
X, y = make_classification(n_samples=1000, n_features=20, n_classes=2, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Keras 模型
model = Sequential([
    Dense(25, activation='relu', input_shape=(20,), name='hidden1'),
    Dense(15, activation='relu', name='hidden2'),
    Dense(1, activation='sigmoid', name='output')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
model.summary()

print("\n开始训练...")
history = model.fit(X_train, y_train, epochs=20, batch_size=32,
                    validation_split=0.1, verbose=0)

loss, acc = model.evaluate(X_test, y_test, verbose=0)
print(f"\n测试集准确率: {acc:.4f}")

# 对比：不用框架时参数量
print(f"\n模型总参数量: {model.count_params()}")
print("对比 NumPy 手写：你需要手动管理 W1,b1,W2,b2 的维度和更新")
