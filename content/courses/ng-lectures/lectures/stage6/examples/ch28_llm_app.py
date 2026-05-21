"""
第28章：LLM 应用 — 简单 RAG 流程模拟
Chapter 28: LLM Application — Simple RAG Pipeline
"""
import numpy as np

# 模拟文档库
documents = [
    "Transformer 是一种基于注意力机制的神经网络架构",
    "LLM 通过预训练和微调获得语言能力",
    "RAG 结合检索和生成以提高回答准确性",
    "梯度下降是优化神经网络参数的核心算法",
    "Attention 机制让模型关注输入的不同部分",
]

# 模拟向量化 (实际使用 sentence-transformers)
np.random.seed(42)
doc_embeddings = np.random.randn(len(documents), 128)

# 简单归一化
doc_embeddings = doc_embeddings / np.linalg.norm(doc_embeddings, axis=1, keepdims=True)

def retrieve(query_embedding, top_k=2):
    """向量检索：余弦相似度"""
    similarities = doc_embeddings @ query_embedding
    top_indices = np.argsort(similarities)[::-1][:top_k]
    return [(documents[i], similarities[i]) for i in top_indices]

def generate(prompt):
    """模拟 LLM 生成（实际调用 API）"""
    return f"[LLM 基于以下信息生成回答]\n{prompt}\n[生成内容...]"

# 用户查询
user_query = "Transformer 是怎么工作的？"
query_embedding = np.random.randn(128)  # 实际应编码用户查询
query_embedding = query_embedding / np.linalg.norm(query_embedding)

# RAG 流程
retrieved = retrieve(query_embedding)
prompt = f"基于以下文档回答问题：\n"
for doc, score in retrieved:
    prompt += f"- {doc} (相似度: {score:.3f})\n"
prompt += f"\n问题: {user_query}"

answer = generate(prompt)

print("=== RAG 流程演示 ===")
print(f"\n用户查询: {user_query}")
print(f"\n检索到的相关文档:")
for doc, score in retrieved:
    print(f"  [{score:.3f}] {doc}")
print(f"\n组合 Prompt:\n{prompt[:300]}...")
print(f"\n{answer}")

print("\n\n实际工程中 RAG 组件:")
print("1. Embedding 模型: 文本 → 向量")
print("2. 向量数据库: Milvus / Pinecone / FAISS")
print("3. LLM API: OpenAI / Claude / 本地模型")
print("4. 重排序 (Reranker): 提升检索精度")
