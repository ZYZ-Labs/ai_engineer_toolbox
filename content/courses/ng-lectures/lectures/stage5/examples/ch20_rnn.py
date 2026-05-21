"""
第20章：RNN / LSTM 前向传播
Chapter 20: RNN & LSTM Forward Propagation
"""
import numpy as np

# --- 单步 RNN ---
def rnn_step(x_t, a_prev, parameters):
    Wax = parameters['Wax']
    Waa = parameters['Waa']
    ba = parameters['ba']

    a_next = np.tanh(np.dot(Wax, x_t) + np.dot(Waa, a_prev) + ba)
    return a_next

# 测试单步
np.random.seed(1)
n_x, n_a = 10, 5
x_t = np.random.randn(n_x, 1)
a_prev = np.random.randn(n_a, 1)
params = {
    'Wax': np.random.randn(n_a, n_x) * 0.01,
    'Waa': np.random.randn(n_a, n_a) * 0.01,
    'ba': np.zeros((n_a, 1))
}
a_next = rnn_step(x_t, a_prev, params)
print(f"RNN 单步: a_prev {a_prev.shape} + x_t {x_t.shape} -> a_next {a_next.shape}")

# --- LSTM 单步 ---
def lstm_step(x_t, a_prev, c_prev, parameters):
    n_a = a_prev.shape[0]
    concat = np.vstack((a_prev, x_t))

    # 门
    ft = sigmoid(np.dot(parameters['Wf'], concat) + parameters['bf'])  # 遗忘门
    it = sigmoid(np.dot(parameters['Wi'], concat) + parameters['bi'])  # 更新门
    cct = np.tanh(np.dot(parameters['Wc'], concat) + parameters['bc']) # 候选值
    ot = sigmoid(np.dot(parameters['Wo'], concat) + parameters['bo'])  # 输出门

    c_next = ft * c_prev + it * cct
    a_next = ot * np.tanh(c_next)
    return a_next, c_next

def sigmoid(z):
    return 1 / (1 + np.exp(-np.clip(z, -500, 500)))

# LSTM 参数
n_concat = n_a + n_x
lstm_params = {
    'Wf': np.random.randn(n_a, n_concat) * 0.01, 'bf': np.zeros((n_a, 1)),
    'Wi': np.random.randn(n_a, n_concat) * 0.01, 'bi': np.zeros((n_a, 1)),
    'Wc': np.random.randn(n_a, n_concat) * 0.01, 'bc': np.zeros((n_a, 1)),
    'Wo': np.random.randn(n_a, n_concat) * 0.01, 'bo': np.zeros((n_a, 1)),
}
c_prev = np.zeros((n_a, 1))
a_lstm, c_lstm = lstm_step(x_t, a_prev, c_prev, lstm_params)
print(f"LSTM 单步: a {a_lstm.shape}, c {c_lstm.shape}")
print("\nLSTM 核心: 记忆单元 c 直接传递，梯度可通过加法路径流动")
