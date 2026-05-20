"""
第25章案例：HuggingFace Transformers 使用
Chapter 25 Example: HuggingFace Transformers Usage

运行方式: python ch25_huggingface.py
注意: 需要安装 transformers 库
"""

import torch


def demo_basic_usage():
    """基础使用"""
    print("=" * 50)
    print("1. HuggingFace 基础使用")
    print("=" * 50)

    try:
        from transformers import AutoModelForCausalLM, AutoTokenizer

        model_name = "gpt2"
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(model_name)

        text = "Hello, how are you?"
        tokens = tokenizer(text, return_tensors="pt")
        print(f"Text: '{text}'")
        print(f"Tokens: {tokens['input_ids'][0].tolist()}")
        print(f"Decoded: {tokenizer.decode(tokens['input_ids'][0])}")

        with torch.no_grad():
            outputs = model(**tokens)
        print(f"Logits shape: {outputs.logits.shape}")

    except ImportError:
        print("请先安装 transformers: pip install transformers")
        print("Please install transformers: pip install transformers")


def demo_model_inspection():
    """模型结构查看"""
    print("\n" + "=" * 50)
    print("2. 模型结构查看")
    print("=" * 50)

    try:
        from transformers import AutoModelForCausalLM

        model = AutoModelForCausalLM.from_pretrained("gpt2")
        print("Top-level modules:")
        for name, module in model.named_children():
            print(f"  {name}: {module.__class__.__name__}")

        # 查看第一层 transformer
        first_block = model.transformer.h[0]
        print(f"\nFirst block:")
        for name, module in first_block.named_children():
            print(f"  {name}: {module.__class__.__name__}")

        # 参数量
        total = sum(p.numel() for p in model.parameters())
        print(f"\nTotal params: {total:,}")

    except ImportError:
        print("需要安装 transformers")


def demo_generation():
    """文本生成"""
    print("\n" + "=" * 50)
    print("3. 文本生成")
    print("=" * 50)

    try:
        from transformers import AutoModelForCausalLM, AutoTokenizer

        tokenizer = AutoTokenizer.from_pretrained("gpt2")
        model = AutoModelForCausalLM.from_pretrained("gpt2")

        inputs = tokenizer("The future of AI is", return_tensors="pt")

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_length=30,
                num_return_sequences=1,
                do_sample=True,
                temperature=0.8,
                top_k=50,
            )

        text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print(f"Prompt: 'The future of AI is'")
        print(f"Generated: '{text}'")

    except ImportError:
        print("需要安装 transformers")


def demo_save_load():
    """保存与加载"""
    print("\n" + "=" * 50)
    print("4. 保存与加载")
    print("=" * 50)

    try:
        import tempfile
        from transformers import AutoModelForCausalLM

        model = AutoModelForCausalLM.from_pretrained("gpt2")

        with tempfile.TemporaryDirectory() as tmpdir:
            model.save_pretrained(tmpdir)
            loaded = AutoModelForCausalLM.from_pretrained(tmpdir)
            print(f"保存到 {tmpdir}")
            print(f"加载成功 | Loaded successfully")
            print(f"参数量一致? {sum(p.numel() for p in model.parameters()) == sum(p.numel() for p in loaded.parameters())}")

    except ImportError:
        print("需要安装 transformers")


if __name__ == "__main__":
    demo_basic_usage()
    demo_model_inspection()
    demo_generation()
    demo_save_load()
