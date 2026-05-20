# 第6章：PyTorch Tensor — 从 NumPy 到 GPU | Chapter 6: PyTorch Tensor — From NumPy to GPU

> **阶段定位** | **Stage**: 第二阶段 — PyTorch 与训练系统
> **预计学时** | **Duration**: 5~7 小时

---

## 学习目标 | Learning Objectives

**中文：**
- 理解 PyTorch Tensor 与 NumPy ndarray 的关系和区别
- 掌握 GPU/CUDA 张量的创建和运算
- 熟悉 PyTorch 核心 API：tensor, matmul, reshape, view, permute
- 建立设备（device）意识：CPU vs GPU

**English:**
- Understand the relationship and differences between PyTorch Tensor and NumPy ndarray
- Master GPU/CUDA tensor creation and operations
- Familiarize with core PyTorch APIs: tensor, matmul, reshape, view, permute
- Build device awareness: CPU vs GPU

---

## 6.1 PyTorch vs NumPy | PyTorch vs NumPy

### 中文解释

| 特性 | NumPy | PyTorch |
|------|-------|---------|
| 计算设备 | 仅 CPU | CPU + GPU |
| 自动求导 | 不支持 | Autograd 支持 |
| 深度学习 | 不适合 | 原生支持 |
| GPU 加速 | 不支持 | CUDA 原生支持 |
| 数据类型 | ndarray | Tensor |

**核心关系**：PyTorch Tensor 几乎完全兼容 NumPy API，但增加了 GPU 和自动求导能力。

### English Explanation

| Feature | NumPy | PyTorch |
|---------|-------|---------|
| Compute device | CPU only | CPU + GPU |
| Auto differentiation | Not supported | Autograd supported |
| Deep learning | Not suitable | Native support |
| GPU acceleration | Not supported | Native CUDA support |
| Data type | ndarray | Tensor |

**Core relationship**: PyTorch Tensor is almost fully compatible with NumPy API, but adds GPU and autograd capabilities.

### 代码案例 | Code Example

```python
import numpy as np
import torch

# NumPy 方式 | NumPy way
np_array = np.array([[1, 2, 3], [4, 5, 6]])
np_result = np_array @ np_array.T
print(f"NumPy result: {np_result.shape}")

# PyTorch 方式（几乎相同）| PyTorch way (almost identical)
torch_tensor = torch.tensor([[1, 2, 3], [4, 5, 6]])
torch_result = torch_tensor @ torch_tensor.T
print(f"PyTorch result: {torch_result.shape}")

# 互相转换 | Mutual conversion
np_from_torch = torch_result.numpy()           # Tensor → NumPy
# torch_from_np = torch.from_numpy(np_array)     # NumPy → Tensor

print(f"\n转换验证 | Conversion check: {type(np_from_torch)}")
```

---

## 6.2 Tensor 创建与基本属性 | Tensor Creation and Basic Properties

### 代码案例 | Code Example

```python
import torch

# 创建方式 | Creation methods
t1 = torch.tensor([1, 2, 3])                        # 从列表 | From list
t2 = torch.zeros(2, 3)                              # 全零 | All zeros
t3 = torch.ones(3, 3)                               # 全一 | All ones
t4 = torch.randn(2, 3)                              # 标准正态 | Standard normal
t5 = torch.arange(0, 10, 2)                         # 等差数列 | Arithmetic sequence
t6 = torch.linspace(0, 1, 5)                        # 线性插值 | Linear interpolation

# 查看属性 | Check properties
x = torch.randn(2, 3, 4)
print(f"Shape: {x.shape}")           # torch.Size([2, 3, 4])
print(f"Dtype: {x.dtype}")           # torch.float32
print(f"Device: {x.device}")         # cpu
print(f"Numel: {x.numel()}")         # 24 (元素总数 | total elements)
print(f"NDim: {x.ndim}")             # 3

# 指定数据类型 | Specify data type
x_float64 = torch.randn(2, 3, dtype=torch.float64)
x_int32 = torch.tensor([1, 2, 3], dtype=torch.int32)
print(f"\nfloat64: {x_float64.dtype}")
print(f"int32: {x_int32.dtype}")
```

### PyTorch vs NumPy API 对照 | PyTorch vs NumPy API Comparison

| NumPy | PyTorch | 功能 | Function |
|-------|---------|------|----------|
| `np.array` | `torch.tensor` | 创建张量 | Create tensor |
| `np.zeros` | `torch.zeros` | 全零 | All zeros |
| `np.ones` | `torch.ones` | 全一 | All ones |
| `np.random.randn` | `torch.randn` | 正态分布 | Normal distribution |
| `np.reshape` | `torch.reshape` | 变形 | Reshape |
| `np.transpose` | `torch.permute` | 维度交换 | Permute dimensions |
| `np.dot` | `torch.matmul`/`@` | 矩阵乘法 | Matrix multiplication |

---

## 6.3 GPU/CUDA 张量 | GPU/CUDA Tensors

### 中文解释

**GPU 加速是深度学习的核心**。PyTorch 让 GPU 计算变得极其简单。

关键概念：
- `device`: 张量所在的计算设备
- `.to(device)`: 将张量移动到指定设备
- `.cuda()`: 快捷移动到 GPU
- `.cpu()`: 移动到 CPU

### English Explanation

**GPU acceleration is the core of deep learning**. PyTorch makes GPU computation extremely simple.

Key concepts:
- `device`: The computing device where the tensor resides
- `.to(device)`: Move tensor to specified device
- `.cuda()`: Shortcut to move to GPU
- `.cpu()`: Move to CPU

### 代码案例 | Code Example

```python
import torch

# 检查 GPU 可用性 | Check GPU availability
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU count: {torch.cuda.device_count()}")
    print(f"GPU name: {torch.cuda.get_device_name(0)}")

# 创建 CPU 张量 | Create CPU tensor
cpu_tensor = torch.randn(3, 4)
print(f"\nCPU tensor device: {cpu_tensor.device}")

# 创建 GPU 张量 | Create GPU tensor
if torch.cuda.is_available():
    gpu_tensor = torch.randn(3, 4, device='cuda')
    print(f"GPU tensor device: {gpu_tensor.device}")
    
    # CPU → GPU | CPU to GPU
    cpu_to_gpu = cpu_tensor.to('cuda')
    print(f"Moved to GPU: {cpu_to_gpu.device}")
    
    # GPU → CPU | GPU to CPU
    gpu_to_cpu = gpu_tensor.to('cpu')
    print(f"Moved to CPU: {gpu_to_cpu.device}")
    
    # 快捷方式 | Shortcuts
    # cpu_tensor.cuda()    # 同 .to('cuda')
    # gpu_tensor.cpu()     # 同 .to('cpu')

# 最佳实践：动态选择设备 | Best practice: dynamically select device
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"\nUsing device: {device}")

x = torch.randn(3, 4, device=device)   # 自动使用最佳设备 | Auto-use best device
```

### GPU 运算加速对比 | GPU Acceleration Comparison

```python
import torch
import time

if not torch.cuda.is_available():
    print("GPU not available, skipping benchmark")
else:
    # 大矩阵乘法测试 | Large matrix multiplication test
    size = 5000
    
    # CPU | CPU
    a_cpu = torch.randn(size, size)
    b_cpu = torch.randn(size, size)
    
    start = time.time()
    c_cpu = a_cpu @ b_cpu
    cpu_time = time.time() - start
    print(f"CPU time: {cpu_time:.3f}s")
    
    # GPU | GPU
    a_gpu = a_cpu.cuda()
    b_gpu = b_cpu.cuda()
    
    # 预热（GPU 首次调用较慢）| Warmup (first GPU call is slower)
    _ = a_gpu @ b_gpu
    torch.cuda.synchronize()
    
    start = time.time()
    c_gpu = a_gpu @ b_gpu
    torch.cuda.synchronize()   # 等待 GPU 完成 | Wait for GPU to finish
    gpu_time = time.time() - start
    print(f"GPU time: {gpu_time:.3f}s")
    print(f"Speedup: {cpu_time / gpu_time:.1f}x")
```

---

## 6.4 核心 API：变形与维度操作 | Core APIs: Reshape and Dimension Operations

### 代码案例 | Code Example

```python
import torch

x = torch.arange(24)
print(f"Original: {x.shape}")   # torch.Size([24])

# reshape: 改变形状 | Reshape: change shape
x2 = x.reshape(4, 6)
print(f"reshape(4,6): {x2.shape}")   # torch.Size([4, 6])

# view: 共享内存的 reshape | View: memory-sharing reshape
x3 = x.view(2, 3, 4)
print(f"view(2,3,4): {x3.shape}")    # torch.Size([2, 3, 4])

# permute: 维度重排 | Permute: dimension reordering
x4 = x3.permute(2, 0, 1)   # (2,3,4) → (4,2,3)
print(f"permute(2,0,1): {x4.shape}")  # torch.Size([4, 2, 3])

# unsqueeze: 增加维度 | Unsqueeze: add dimension
x5 = x.unsqueeze(0)         # (24,) → (1, 24)
x6 = x.unsqueeze(1)         # (24,) → (24, 1)
print(f"unsqueeze(0): {x5.shape}")   # torch.Size([1, 24])
print(f"unsqueeze(1): {x6.shape}")   # torch.Size([24, 1])

# squeeze: 去除大小为1的维度 | Squeeze: remove size-1 dimensions
x7 = x5.squeeze()           # (1, 24) → (24,)
print(f"squeeze: {x7.shape}")        # torch.Size([24])

# flatten: 展平 | Flatten: flatten
x8 = x3.flatten()           # (2,3,4) → (24,)
print(f"flatten: {x8.shape}")        # torch.Size([24])

# 按维度展平 | Flatten by dimension
x9 = x3.flatten(start_dim=1)  # (2,3,4) → (2, 12)
print(f"flatten(start_dim=1): {x9.shape}")  # torch.Size([2, 12])
```

### reshape vs view | Reshape vs View

| 特性 | reshape | view |
|------|---------|------|
| 内存共享 | 可能 | 总是 |
| 连续性要求 | 无 | 需要连续内存 |
| 使用场景 | 通用 | 确定连续时使用 |
| 性能 | 略慢（可能拷贝）| 更快 |

| Feature | reshape | view |
|---------|---------|------|
| Memory sharing | Maybe | Always |
| Contiguity requirement | No | Requires contiguous memory |
| Use case | General | When certain it's contiguous |
| Performance | Slightly slower (may copy) | Faster |

---

## 6.5 广播机制 | Broadcasting

### 代码案例 | Code Example

```python
import torch

# PyTorch 广播与 NumPy 完全相同 | PyTorch broadcasting is identical to NumPy

# 标量广播 | Scalar broadcasting
a = torch.tensor([[1, 2, 3], [4, 5, 6]])
result = a + 10
print("Scalar broadcast:", result)

# 向量广播 | Vector broadcasting
b = torch.tensor([10, 20, 30])
result = a + b
print("Vector broadcast:", result)

# Transformer 中的典型广播 | Typical broadcasting in Transformer
scores = torch.randn(32, 8, 128, 128)   # (batch, heads, seq, seq)
mask = torch.ones(1, 1, 128, 128) * -1e9  # 掩码 | mask
# 自动广播到 (32, 8, 128, 128) | Auto-broadcasted to (32, 8, 128, 128)
masked_scores = scores + mask
print(f"Masked scores shape: {masked_scores.shape}")

# 显式扩展 | Explicit expansion
b_expanded = b.unsqueeze(0).expand(2, -1)   # (3,) → (1,3) → (2,3)
print(f"Expanded shape: {b_expanded.shape}")
```

---

## 6.6 类型转换与设备一致性 | Type Conversion and Device Consistency

### 代码案例 | Code Example

```python
import torch

# 类型转换 | Type conversion
x = torch.tensor([1, 2, 3])          # int64
x_float = x.float()                   # float32
x_double = x.double()                 # float64
x_int = x_float.int()                 # int32

print(f"Original: {x.dtype}")
print(f"Float: {x_float.dtype}")
print(f"Double: {x_double.dtype}")

# 设备一致性错误（常见 bug）| Device consistency error (common bug)
if torch.cuda.is_available():
    a = torch.randn(3, 3, device='cpu')
    b = torch.randn(3, 3, device='cuda')
    
    try:
        c = a + b   # 错误！CPU + GPU | Error! CPU + GPU
    except RuntimeError as e:
        print(f"\nDevice error: {e}")
    
    # 修复：统一设备 | Fix: unify devices
    a_gpu = a.to('cuda')
    c = a_gpu + b   # ✓
    print(f"Fixed: {c.device}")

# 混合精度（推理加速）| Mixed precision (inference acceleration)
x_fp16 = torch.randn(3, 3, dtype=torch.float16)
print(f"\nFP16: {x_fp16.dtype}")
# 现代 GPU 支持 FP16/BF16/INT8 加速
# Modern GPUs support FP16/BF16/INT8 acceleration
```

---

## 本章总结 | Chapter Summary

**中文：**
- PyTorch Tensor = NumPy + GPU + Autograd
- `device` 是 PyTorch 的核心概念，必须时刻注意
- `view`/`reshape`/`permute` 是操作 shape 的核心 API
- GPU 加速是大模型训练的基础
- 类型和设备不一致是常见 bug 来源

**English:**
- PyTorch Tensor = NumPy + GPU + Autograd
- `device` is a core PyTorch concept that must always be considered
- `view`/`reshape`/`permute` are core APIs for shape manipulation
- GPU acceleration is the foundation of large model training
- Type and device mismatches are common sources of bugs

---

## 课后练习 | Homework

1. **设备练习**：创建一个随机张量，依次移动到 CPU、GPU（如有）、再移回 CPU
2. **形状变换**：将一个 `(2, 3, 4, 5)` 的张量通过 `permute` 变为 `(5, 2, 4, 3)`
3. **广播练习**：用 PyTorch 实现 `(32, 8, 128, 64) @ (32, 8, 64, 128)` 的 batch 矩阵乘法
4. **性能测试**：比较 `float32` 和 `float16` 矩阵乘法的速度和精度差异（GPU 上）
