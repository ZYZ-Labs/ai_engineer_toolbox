"""
第21章：Word2Vec Skip-gram 简化实现
Chapter 21: Word2Vec Skip-gram Simplified
"""
import numpy as np
from collections import defaultdict

# 模拟小语料
corpus = [
    "the quick brown fox jumps over the lazy dog",
    "the dog sleeps",
    "the fox runs quick",
]

# 构建词汇表
words = set()
for sent in corpus:
    words.update(sent.split())
word_to_idx = {w: i for i, w in enumerate(sorted(words))}
vocab_size = len(word_to_idx)
print(f"词汇表大小: {vocab_size}")
print(f"词汇: {list(word_to_idx.keys())}")

# 生成 skip-gram 训练对 (窗口=1)
pairs = []
for sent in corpus:
    tokens = sent.split()
    for i, target in enumerate(tokens):
        for j in range(max(0, i-1), min(len(tokens), i+2)):
            if i != j:
                pairs.append((target, tokens[j]))

# 简化模型: 输入 one-hot -> 线性投影 -> softmax
embed_dim = 5
W = np.random.randn(vocab_size, embed_dim) * 0.01  # 词向量矩阵
W_out = np.random.randn(embed_dim, vocab_size) * 0.01

# 训练几轮
lr = 0.1
for epoch in range(500):
    total_loss = 0
    for target_word, context_word in pairs:
        x = np.zeros((vocab_size, 1))
        x[word_to_idx[target_word]] = 1

        h = W.T @ x  # embed_dim x 1
        u = W_out.T @ h  # vocab_size x 1
        y_pred = softmax(u)

        y_true = np.zeros((vocab_size, 1))
        y_true[word_to_idx[context_word]] = 1

        loss = -np.log(y_pred[word_to_idx[context_word]] + 1e-8)
        total_loss += loss

        # 反向
        du = y_pred - y_true
        dW_out = h @ du.T
        dW = x @ (W_out @ du).T

        W -= lr * dW.T
        W_out -= lr * dW_out.T

    if epoch % 100 == 0:
        print(f"Epoch {epoch}: Avg Loss={total_loss/len(pairs):.4f}")

def softmax(x):
    e = np.exp(x - np.max(x))
    return e / np.sum(e)

# 查看词向量相似度
def cosine(v1, v2):
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

the_vec = W[word_to_idx['the']]
fox_vec = W[word_to_idx['fox']]
dog_vec = W[word_to_idx['dog']]

print(f"\n词向量余弦相似度:")
print(f"  the - fox: {cosine(the_vec, fox_vec):.3f}")
print(f"  fox - dog: {cosine(fox_vec, dog_vec):.3f}")
