# 第 3 章：C# 与 MonoBehaviour 基础

## 学习目标

- 创建并挂载 C# 脚本。
- 理解 `Start`、`Update`、`FixedUpdate`。
- 会定义字段、公开参数和组件引用。
- 能读 Console 错误。

## 3.1 创建脚本

在 `Assets/Scripts` 中创建 C# Script：

```txt
PlayerController.cs
```

脚本类名必须和文件名一致：

```csharp
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    void Start()
    {
        Debug.Log("Player ready");
    }
}
```

把脚本拖到 `Player` 对象上。运行后 Console 应显示 `Player ready`。

## 3.2 MonoBehaviour 是什么

`MonoBehaviour` 是 Unity 脚本最常见的基类。继承它之后，脚本可以作为组件挂到 GameObject 上，并接收 Unity 生命周期回调。

| 方法 | 何时执行 | 适合做什么 |
|------|----------|------------|
| `Awake` | 对象加载时 | 初始化内部数据 |
| `Start` | 第一帧前 | 获取其他对象、初始化状态 |
| `Update` | 每帧 | 输入、非物理逻辑 |
| `FixedUpdate` | 固定物理步长 | Rigidbody 物理移动 |

2D 物理移动优先放在 `FixedUpdate`。

## 3.3 字段和 Inspector 参数

公开字段会显示在 Inspector：

```csharp
public float moveSpeed = 6f;
```

更推荐使用序列化私有字段：

```csharp
[SerializeField] private float moveSpeed = 6f;
```

这样 Inspector 可以调参数，但其他脚本不能随便改内部字段。

## 3.4 获取组件

如果脚本要控制 Rigidbody2D，需要拿到组件引用：

```csharp
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    [SerializeField] private float moveSpeed = 6f;

    private Rigidbody2D rb;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
    }
}
```

如果 Player 上没有 Rigidbody2D，`rb` 会是 null。后续访问时会报 `NullReferenceException`。

## 3.5 Console 错误怎么读

Unity 错误通常包含：

- 错误类型。
- 文件名。
- 行号。
- 调用堆栈。

遇到错误先双击 Console 条目跳到代码行。不要只看最后一句，也不要把红色错误留到后面。

## 常见错误

- 文件名和类名不一致。
- 忘了把脚本挂到对象上。
- 脚本编译错误导致所有新脚本都不能运行。
- `GetComponent` 找不到组件还继续使用。

## 本章练习

1. 创建 `PlayerController.cs`。
2. 在 `Start` 输出日志。
3. 添加 `moveSpeed` 序列化字段。
4. 在 `Awake` 获取 Rigidbody2D。
5. 故意删除 Rigidbody2D，观察错误，再恢复。

## 检查点

- 你知道脚本类名必须匹配文件名。
- 你知道物理相关逻辑优先放在 `FixedUpdate`。
- 你会从 Console 跳到报错行。
