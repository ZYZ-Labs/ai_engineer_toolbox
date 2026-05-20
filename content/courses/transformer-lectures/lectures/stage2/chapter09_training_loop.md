# 第9章：手写训练循环 — 训练到底是什么 | Chapter 9: Writing Training Loop — What Is Training?

> **阶段定位** | **Stage**: 第二阶段 — PyTorch 与训练系统
> **预计学时** | **Duration**: 6~8 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 完整手写一个训练循环（forward → loss → backward → step → zero_grad）
- 理解每个步骤的精确含义和数据流
- 掌握训练/验证/测试的划分和数据流
- 能够独立搭建一个完整的训练 pipeline

**English:**
- Write a complete training loop by hand (forward → loss → backward → step → zero_grad)
- Understand the exact meaning and data flow of each step
- Master train/validation/test split and data flow
- Be able to independently build a complete training pipeline

---

## 9.1 训练循环的五个核心步骤 | Five Core Steps of Training Loop

### 中文解释

```
for each batch:
    1. forward:   模型预测 → 输出 logits
    2. loss:      计算预测与真实的差距
    3. backward:  计算梯度（反向传播）
    4. step:      用梯度更新参数
    5. zero_grad: 清零梯度（为下一轮准备）
```

### English Explanation

```
for each batch:
    1. forward:   Model prediction → output logits
    2. loss:      Compute gap between prediction and ground truth
    3. backward:  Compute gradients (backpropagation)
    4. step:      Update parameters using gradients
    5. zero_grad: Clear gradients (prepare for next round)
```

### 代码案例：最简训练循环 | Code Example: Minimal Training Loop

```python
import torch
import torch.nn as nn
import torch.optim as optim

# 1. 定义模型 | Define model
model = nn.Linear(10, 2)   # 输入10维，输出2维 | Input 10-dim, output 2-dim

# 2. 定义损失函数 | Define loss function
criterion = nn.CrossEntropyLoss()

# 3. 定义优化器 | Define optimizer
optimizer = optim.Adam(model.parameters(), lr=1e-3)

# 模拟数据 | Simulated data
batch_size = 4
X = torch.randn(batch_size, 10)      # 4个样本，每个10维 | 4 samples, 10 dims
y = torch.randint(0, 2, (batch_size,))  # 二分类标签 | Binary classification labels

# ========== 训练循环 | Training Loop ==========
num_epochs = 5

for epoch in range(num_epochs):
    # ---- Step 5: 清零梯度（放这里或循环开头）| Clear gradients ----
    optimizer.zero_grad()
    
    # ---- Step 1: 前向传播 | Forward pass ----
    logits = model(X)    # (4, 2)
    
    # ---- Step 2: 计算损失 | Compute loss ----
    loss = criterion(logits, y)
    
    # ---- Step 3: 反向传播 | Backward pass ----
    loss.backward()
    
    # ---- Step 4: 更新参数 | Update parameters ----
    optimizer.step()
    
    print(f"Epoch {epoch}: loss = {loss.item():.4f}")
```

---

## 9.2 完整训练 Pipeline | Complete Training Pipeline

### 代码案例 | Code Example

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

# ========== 1. 数据准备 | Data Preparation ==========
def prepare_data():
    """准备训练/验证/测试数据 | Prepare train/val/test data"""
    # 生成模拟数据 | Generate simulated data
    n_samples = 1000
    n_features = 20
    n_classes = 3
    
    X = torch.randn(n_samples, n_features)
    y = torch.randint(0, n_classes, (n_samples,))
    
    # 划分数据集 | Split dataset
    train_size = 700
    val_size = 150
    
    X_train, y_train = X[:train_size], y[:train_size]
    X_val, y_val = X[train_size:train_size+val_size], y[train_size:train_size+val_size]
    X_test, y_test = X[train_size+val_size:], y[train_size+val_size:]
    
    # 创建 DataLoader | Create DataLoader
    train_loader = DataLoader(
        TensorDataset(X_train, y_train),
        batch_size=32,
        shuffle=True          # 训练时打乱 | Shuffle during training
    )
    val_loader = DataLoader(
        TensorDataset(X_val, y_val),
        batch_size=32,
        shuffle=False         # 验证时不打乱 | No shuffle during validation
    )
    
    return train_loader, val_loader, (X_test, y_test)

# ========== 2. 模型定义 | Model Definition ==========
class SimpleModel(nn.Module):
    def __init__(self, input_dim, hidden_dim, num_classes):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(hidden_dim, num_classes)
        )
    
    def forward(self, x):
        return self.net(x)

# ========== 3. 训练函数 | Training Function ==========
def train_epoch(model, dataloader, criterion, optimizer, device):
    """训练一个 epoch | Train one epoch"""
    model.train()   # 训练模式 | Training mode
    total_loss = 0
    correct = 0
    total = 0
    
    for batch_idx, (X_batch, y_batch) in enumerate(dataloader):
        X_batch = X_batch.to(device)
        y_batch = y_batch.to(device)
        
        # 核心5步 | Core 5 steps
        optimizer.zero_grad()
        logits = model(X_batch)
        loss = criterion(logits, y_batch)
        loss.backward()
        optimizer.step()
        
        # 统计 | Statistics
        total_loss += loss.item()
        pred = logits.argmax(dim=-1)
        correct += (pred == y_batch).sum().item()
        total += y_batch.size(0)
    
    avg_loss = total_loss / len(dataloader)
    accuracy = correct / total
    return avg_loss, accuracy

# ========== 4. 验证函数 | Validation Function ==========
def validate(model, dataloader, criterion, device):
    """验证 | Validation"""
    model.eval()   # 评估模式 | Evaluation mode
    total_loss = 0
    correct = 0
    total = 0
    
    with torch.no_grad():   # 不计算梯度 | No gradient computation
        for X_batch, y_batch in dataloader:
            X_batch = X_batch.to(device)
            y_batch = y_batch.to(device)
            
            logits = model(X_batch)
            loss = criterion(logits, y_batch)
            
            total_loss += loss.item()
            pred = logits.argmax(dim=-1)
            correct += (pred == y_batch).sum().item()
            total += y_batch.size(0)
    
    avg_loss = total_loss / len(dataloader)
    accuracy = correct / total
    return avg_loss, accuracy

# ========== 5. 主训练流程 | Main Training Loop ==========
def main():
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # 准备数据 | Prepare data
    train_loader, val_loader, (X_test, y_test) = prepare_data()
    
    # 创建模型 | Create model
    model = SimpleModel(input_dim=20, hidden_dim=64, num_classes=3)
    model = model.to(device)
    
    # 损失和优化器 | Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.01)
    
    # 训练循环 | Training loop
    best_val_loss = float('inf')
    num_epochs = 10
    
    print(f"\n{'='*50}")
    print("开始训练 | Start training")
    print(f"{'='*50}")
    
    for epoch in range(num_epochs):
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        
        print(f"Epoch {epoch+1}/{num_epochs}:")
        print(f"  Train: loss={train_loss:.4f}, acc={train_acc:.4f}")
        print(f"  Val:   loss={val_loss:.4f}, acc={val_acc:.4f}")
        
        # 保存最佳模型 | Save best model
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            torch.save(model.state_dict(), 'best_model.pth')
            print(f"  ✓ Saved best model")
    
    print(f"\n{'='*50}")
    print("训练完成 | Training complete")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
```

---

## 9.3 关键细节解析 | Key Details Explained

### model.train() vs model.eval()

```python
import torch.nn as nn

# train() 模式：| train() mode:
# - Dropout 启用 | Dropout enabled
# - BatchNorm 使用 batch 统计 | BatchNorm uses batch statistics
model.train()

# eval() 模式：| eval() mode:
# - Dropout 关闭 | Dropout disabled
# - BatchNorm 使用 running statistics | BatchNorm uses running statistics
model.eval()

# 不调用 eval() 就推理，结果会随机！| Inference without eval() gives random results!
```

### torch.no_grad()

```python
import torch

# with torch.no_grad() 内部：| Inside with torch.no_grad():
# - 不构建计算图 | No computation graph built
# - 不计算梯度 | No gradients computed
# - 节省显存和计算 | Saves memory and computation

with torch.no_grad():
    predictions = model(X_test)

# 等价写法 | Equivalent:
# @torch.no_grad()
# def inference(x):
#     return model(x)
```

### 梯度裁剪 | Gradient Clipping

```python
import torch.nn as nn

# 在 optimizer.step() 之前 | Before optimizer.step()
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

# 作用：防止梯度爆炸 | Purpose: prevent gradient explosion
# 如果梯度范数 > 1.0，就缩放到 1.0 | If gradient norm > 1.0, scale to 1.0
```

---

## 9.4 训练中的调试技巧 | Debugging Techniques in Training

### 代码案例 | Code Example

```python
import torch

# 技巧1：打印梯度范数 | Tip 1: Print gradient norms
def check_gradients(model):
    """检查所有参数的梯度 | Check gradients of all parameters"""
    total_norm = 0
    for p in model.parameters():
        if p.grad is not None:
            param_norm = p.grad.data.norm(2)
            total_norm += param_norm.item() ** 2
    total_norm = total_norm ** 0.5
    print(f"Gradient norm: {total_norm:.4f}")
    return total_norm

# 技巧2：检查 loss 是否为 NaN | Tip 2: Check if loss is NaN
def safe_loss(loss):
    """安全的 loss 检查 | Safe loss check"""
    if torch.isnan(loss) or torch.isinf(loss):
        raise ValueError(f"Loss is abnormal: {loss.item()}")
    return loss

# 技巧3：学习率调度 | Tip 3: Learning rate scheduling
from torch.optim.lr_scheduler import StepLR

optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
scheduler = StepLR(optimizer, step_size=10, gamma=0.1)
# 每 10 个 epoch，LR 乘以 0.1 | Every 10 epochs, LR *= 0.1

for epoch in range(100):
    # ... 训练 ... | ... training ...
    scheduler.step()   # 更新学习率 | Update learning rate
    print(f"LR: {scheduler.get_last_lr()[0]:.6f}")
```

---

## 9.5 保存与加载模型 | Saving and Loading Models

### 代码案例 | Code Example

```python
import torch

# 保存完整模型 | Save complete model
torch.save(model, 'model_complete.pth')

# 保存参数（推荐）| Save parameters (recommended)
torch.save(model.state_dict(), 'model_params.pth')

# 加载完整模型 | Load complete model
model = torch.load('model_complete.pth')

# 加载参数（推荐）| Load parameters (recommended)
model = MyModel()   # 先创建模型结构 | Create model structure first
model.load_state_dict(torch.load('model_params.pth'))

# 保存 checkpoint（含优化器状态）| Save checkpoint (with optimizer state)
checkpoint = {
    'epoch': epoch,
    'model_state_dict': model.state_dict(),
    'optimizer_state_dict': optimizer.state_dict(),
    'loss': loss,
}
torch.save(checkpoint, 'checkpoint.pth')

# 加载 checkpoint | Load checkpoint
checkpoint = torch.load('checkpoint.pth')
model.load_state_dict(checkpoint['model_state_dict'])
optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
start_epoch = checkpoint['epoch'] + 1
```

---

## 本章总结 | Chapter Summary

**中文：**
- 训练循环 = forward + loss + backward + step + zero_grad
- 训练用 `train()`，推理用 `eval()` + `no_grad()`
- 验证集用于调参和早停，测试集用于最终评估
- 梯度裁剪防止爆炸，学习率调度优化收敛
- 保存参数比保存整个模型更灵活

**English:**
- Training loop = forward + loss + backward + step + zero_grad
- Use `train()` for training, `eval()` + `no_grad()` for inference
- Validation set for tuning and early stopping, test set for final evaluation
- Gradient clipping prevents explosion, LR scheduling optimizes convergence
- Saving parameters is more flexible than saving the entire model

---

## 课后练习 | Homework

1. **手写训练循环**：不参考示例，从零写一个完整的训练 pipeline
2. **断点续训**：实现保存和加载 checkpoint 的功能
3. **早停机制**：当验证 loss 连续 3 个 epoch 不下降时，自动停止训练
4. **学习率调度**：实现 warmup + cosine decay 的学习率策略
5. **过拟合监控**：记录每轮的训练 loss 和验证 loss，画出曲线观察过拟合
