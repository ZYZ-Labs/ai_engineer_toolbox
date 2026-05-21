"""
第13章：优化算法对比（SGD / Momentum / Adam）
Chapter 13: Optimization Algorithms Comparison
"""
import numpy as np
import matplotlib.pyplot as plt

# 简单凸函数: f(x,y) = x^2 + 10*y^2
# 最小值在 (0,0)，但不同方向曲率差异大（椭圆等高线）

def grad(x, y):
    return np.array([2*x, 20*y])

# 优化器实现
class Optimizer:
    def __init__(self, lr=0.01):
        self.lr = lr
        self.path = []

class SGD(Optimizer):
    def step(self, params):
        g = grad(*params)
        params -= self.lr * g
        self.path.append(params.copy())
        return params

class Momentum(Optimizer):
    def __init__(self, lr=0.01, beta=0.9):
        super().__init__(lr)
        self.beta = beta
        self.v = np.zeros(2)

    def step(self, params):
        g = grad(*params)
        self.v = self.beta * self.v + (1 - self.beta) * g
        params -= self.lr * self.v
        self.path.append(params.copy())
        return params

class Adam(Optimizer):
    def __init__(self, lr=0.1, beta1=0.9, beta2=0.999, eps=1e-8):
        super().__init__(lr)
        self.beta1, self.beta2 = beta1, beta2
        self.eps = eps
        self.m = np.zeros(2)
        self.v = np.zeros(2)
        self.t = 0

    def step(self, params):
        self.t += 1
        g = grad(*params)
        self.m = self.beta1 * self.m + (1 - self.beta1) * g
        self.v = self.beta2 * self.v + (1 - self.beta2) * (g ** 2)
        m_hat = self.m / (1 - self.beta1 ** self.t)
        v_hat = self.v / (1 - self.beta2 ** self.t)
        params -= self.lr * m_hat / (np.sqrt(v_hat) + self.eps)
        self.path.append(params.copy())
        return params

# 运行对比
init = np.array([4.0, 3.0])
optimizers = {
    'SGD': SGD(lr=0.05),
    'Momentum': Momentum(lr=0.02),
    'Adam': Adam(lr=0.2)
}

fig, ax = plt.subplots(figsize=(8, 8))
x_range = np.linspace(-5, 5, 100)
y_range = np.linspace(-4, 4, 100)
X, Y = np.meshgrid(x_range, y_range)
Z = X**2 + 10*Y**2
ax.contour(X, Y, Z, levels=np.logspace(-1, 3, 15), cmap='viridis')

colors = {'SGD': 'red', 'Momentum': 'blue', 'Adam': 'green'}
for name, opt in optimizers.items():
    params = init.copy()
    opt.path = [params.copy()]
    for _ in range(50):
        params = opt.step(params)
    path = np.array(opt.path)
    ax.plot(path[:,0], path[:,1], '-o', color=colors[name], label=name, markersize=3)

ax.plot(init[0], init[1], 'k*', markersize=15, label='Start')
ax.plot(0, 0, 'rX', markersize=15, label='Minima')
ax.legend()
ax.set_title('Optimization Paths on f(x,y)=x²+10y²')
ax.set_xlabel('x')
ax.set_ylabel('y')
plt.savefig('ch13_optimization.png')
print("优化路径对比已保存到 ch13_optimization.png")
