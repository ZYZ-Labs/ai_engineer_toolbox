# 第 4 章：玩家移动与输入

## 学习目标

- 用键盘输入控制玩家。
- 用 Rigidbody2D 移动对象。
- 区分输入读取和物理移动。
- 把速度做成可调参数。

## 4.1 读取输入

先使用 Unity 兼容输入轴，减少新手安装输入包的复杂度：

```csharp
private Vector2 moveInput;

private void Update()
{
    moveInput.x = Input.GetAxisRaw("Horizontal");
    moveInput.y = Input.GetAxisRaw("Vertical");
    moveInput = moveInput.normalized;
}
```

`Horizontal` 默认对应 A/D 和左右方向键，`Vertical` 默认对应 W/S 和上下方向键。

## 4.2 物理移动

在 `FixedUpdate` 中移动：

```csharp
private void FixedUpdate()
{
    rb.linearVelocity = moveInput * moveSpeed;
}
```

如果你的 Unity API 中仍显示 `velocity`，按编辑器提示使用对应属性。本课程基于 Unity 6.3 LTS，优先使用 `linearVelocity`。

## 4.3 完整脚本

```csharp
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    [SerializeField] private float moveSpeed = 6f;

    private Rigidbody2D rb;
    private Vector2 moveInput;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
    }

    private void Update()
    {
        moveInput.x = Input.GetAxisRaw("Horizontal");
        moveInput.y = Input.GetAxisRaw("Vertical");
        moveInput = moveInput.normalized;
    }

    private void FixedUpdate()
    {
        rb.linearVelocity = moveInput * moveSpeed;
    }
}
```

## 4.4 为什么不直接改 Transform

直接改 `transform.position` 能移动，但会绕开部分物理计算。玩家有 Rigidbody2D 和 Collider2D 时，用 Rigidbody2D 移动更符合物理系统预期。

## 4.5 调手感

在 Inspector 中测试：

| moveSpeed | 感受 |
|-----------|------|
| 3 | 很慢 |
| 6 | 适中 |
| 10 | 偏快 |

不要在代码里到处写死速度。保持一个可调字段。

## 常见错误

- 在 `Update` 里设置 Rigidbody2D 速度，物理表现不稳定。
- 忘了 `normalized`，斜向移动更快。
- Rigidbody2D 的 Gravity Scale 没设为 0，玩家会下落。
- 输入没响应时没有先检查 Console。

## 本章练习

1. 让 Player 能用 WASD 或方向键移动。
2. 测试三个不同速度。
3. 确认斜向移动不会明显更快。
4. 运行时撞墙，确认不会穿出边界。

## 检查点

- 你知道输入读取和物理移动分开。
- 你会用 Rigidbody2D 控制 2D 玩家。
- 你会通过 Inspector 调速度。
