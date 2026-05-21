"""
第16章：CNN基础 — NumPy 实现卷积操作
Chapter 16: CNN Basics — Convolution from Scratch
"""
import numpy as np

def conv_single_step(a_slice_prev, W, b):
    """单步卷积"""
    return np.sum(a_slice_prev * W) + float(b)

def conv_forward(A_prev, W, b, hparameters):
    """
    A_prev: (m, n_H_prev, n_W_prev, n_C_prev)
    W: (f, f, n_C_prev, n_C)
    b: (1, 1, 1, n_C)
    """
    (m, n_H_prev, n_W_prev, n_C_prev) = A_prev.shape
    (f, f, n_C_prev, n_C) = W.shape
    stride = hparameters['stride']
    pad = hparameters['pad']

    n_H = int((n_H_prev + 2*pad - f) / stride) + 1
    n_W = int((n_W_prev + 2*pad - f) / stride) + 1

    A_prev_pad = np.pad(A_prev, ((0,0), (pad,pad), (pad,pad), (0,0)), mode='constant')
    Z = np.zeros((m, n_H, n_W, n_C))

    for i in range(m):
        for h in range(n_H):
            for w in range(n_W):
                for c in range(n_C):
                    v_start = h * stride
                    v_end = v_start + f
                    h_start = w * stride
                    h_end = h_start + f
                    a_slice = A_prev_pad[i, v_start:v_end, h_start:h_end, :]
                    Z[i, h, w, c] = conv_single_step(a_slice, W[:,:,:,c], b[:,:,:,c])

    return Z

# 测试
np.random.seed(1)
A_prev = np.random.randn(2, 5, 5, 3)  # 2张5x5 RGB图
W = np.random.randn(3, 3, 3, 8)       # 8个3x3滤波器
b = np.random.randn(1, 1, 1, 8)
hparameters = {"stride": 1, "pad": 1}

Z = conv_forward(A_prev, W, b, hparameters)
print(f"输入: {A_prev.shape}")
print(f"滤波器: {W.shape}")
print(f"输出: {Z.shape}")
print(f"\n输出高度计算: ({A_prev.shape[1]} + 2*{hparameters['pad']} - {W.shape[0]}) / {hparameters['stride']} + 1 = {Z.shape[1]}")
