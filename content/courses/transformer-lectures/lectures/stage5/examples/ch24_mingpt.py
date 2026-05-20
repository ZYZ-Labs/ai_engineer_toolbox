"""
第24章案例：minGPT 对比
Chapter 24 Example: minGPT Comparison

运行方式: python ch24_mingpt.py
"""

import torch
import torch.nn as nn


def demo_naming_comparison():
    """nanoGPT vs minGPT 命名对比"""
    print("=" * 50)
    print("1. nanoGPT vs minGPT 命名对比")
    print("=" * 50)

    comparisons = [
        ("c_attn (合并 QKV)", "key, query, value (分开)"),
        ("c_proj (输出投影)", "proj (输出投影)"),
        ("mlp.c_fc / mlp.c_proj", "mlp[0] / mlp[2]"),
        ("ln_1 / ln_2", "ln1 / ln2"),
        ("h (block 列表)", "blocks (block 列表)"),
    ]

    print(f"{'nanoGPT':25s} | {'minGPT':25s}")
    print("-" * 55)
    for n, m in comparisons:
        print(f"{n:25s} | {m:25s}")


def demo_adder():
    """模拟 minGPT adder 项目"""
    print("\n" + "=" * 50)
    print("2. Adder 项目 (GPT 学加法)")
    print("=" * 50)

    # 将加法问题编码为 token 序列
    # "12+34=46$" -> token sequence
    chars = "0123456789+= $"
    vocab_size = len(chars)
    stoi = {c: i for i, c in enumerate(chars)}

    def encode(s):
        return [stoi[c] for c in s]

    examples = ["12+34=46$", "99+01=100$", "5+5=10$"]
    for ex in examples:
        tokens = encode(ex)
        print(f"'{ex}' -> tokens: {tokens}")

    print("\nGPT 学习: 给定 '12+34=' 预测下一个 token")
    print("逐步生成: '4' -> '6' -> '$'")


def demo_project_structure():
    """项目结构对比"""
    print("\n" + "=" * 50)
    print("3. 项目结构")
    print("=" * 50)

    print("nanoGPT (简洁):")
    print("  model.py   - 模型")
    print("  train.py   - 训练")
    print("  sample.py  - 采样")
    print("  data/      - 数据")

    print("\nminGPT (模块化):")
    print("  mingpt/")
    print("    model.py    - 模型")
    print("    trainer.py  - 训练器")
    print("    utils.py    - 工具")
    print("  projects/")
    print("    adder/      - 加法器")
    print("    chargpt/    - 字符 GPT")


if __name__ == "__main__":
    demo_naming_comparison()
    demo_adder()
    demo_project_structure()
