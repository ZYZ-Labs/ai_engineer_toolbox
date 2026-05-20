"""
第9章案例：完整训练循环
Chapter 9 Example: Complete Training Loop

运行方式: python ch09_training_loop.py
"""

import torch
import torch.nn as nn
import torch.optim as optim


class SimpleModel(nn.Module):
    def __init__(self, input_dim=10, hidden_dim=32, num_classes=3):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_dim, num_classes),
        )

    def forward(self, x):
        return self.net(x)


def train_epoch(model, X, y, criterion, optimizer):
    """训练一个 epoch"""
    model.train()
    optimizer.zero_grad()
    logits = model(X)
    loss = criterion(logits, y)
    loss.backward()
    optimizer.step()
    return loss.item()


def evaluate(model, X, y, criterion):
    """评估"""
    model.eval()
    with torch.no_grad():
        logits = model(X)
        loss = criterion(logits, y)
        preds = logits.argmax(dim=-1)
        acc = (preds == y).float().mean().item()
    return loss.item(), acc


def demo_full_training():
    """完整训练演示"""
    print("=" * 50)
    print("完整训练循环演示")
    print("=" * 50)

    # 数据
    n_samples = 200
    X = torch.randn(n_samples, 10)
    y = torch.randint(0, 3, (n_samples,))

    # 划分
    split = 150
    X_train, y_train = X[:split], y[:split]
    X_val, y_val = X[split:], y[split:]

    # 模型
    model = SimpleModel()
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=1e-3)

    # 训练
    print(f"{'Epoch':>6s} {'Train Loss':>12s} {'Val Loss':>10s} {'Val Acc':>8s}")
    print("-" * 40)

    for epoch in range(20):
        train_loss = train_epoch(model, X_train, y_train, criterion, optimizer)
        val_loss, val_acc = evaluate(model, X_val, y_val, criterion)

        if epoch % 5 == 0:
            print(f"{epoch:6d} {train_loss:12.4f} {val_loss:10.4f} {val_acc:8.2%}")


def demo_checkpoint():
    """保存和加载模型"""
    print("\n" + "=" * 50)
    print("保存/加载 Checkpoint")
    print("=" * 50)

    model = SimpleModel()
    optimizer = optim.Adam(model.parameters(), lr=1e-3)

    # 保存
    checkpoint = {
        "model_state": model.state_dict(),
        "optimizer_state": optimizer.state_dict(),
        "epoch": 10,
    }
    torch.save(checkpoint, "/tmp/demo_checkpoint.pt")

    # 加载
    loaded = torch.load("/tmp/demo_checkpoint.pt")
    model.load_state_dict(loaded["model_state"])
    optimizer.load_state_dict(loaded["optimizer_state"])
    print(f"加载成功 | Loaded: epoch={loaded['epoch']}")


if __name__ == "__main__":
    demo_full_training()
    demo_checkpoint()
