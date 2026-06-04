# 第 5 章：碰撞、Rigidbody2D 与边界

## 学习目标

- 理解 Collider2D 与 Rigidbody2D 的配合。
- 知道 Trigger 和 Collision 的区别。
- 创建敌人与玩家碰撞检测。
- 会用 Tag 判断对象类型。

## 5.1 碰撞需要什么

两个对象要发生 2D 碰撞，通常需要：

- 双方都有 Collider2D。
- 至少一方有 Rigidbody2D。
- Layer Collision Matrix 没有禁用它们的碰撞。

玩家已经有 Rigidbody2D 和 BoxCollider2D，墙有 BoxCollider2D，因此玩家能被墙挡住。

## 5.2 Trigger 是什么

Collider2D 勾选 `Is Trigger` 后，不再阻挡对象，而是触发进入、停留、离开事件。敌人碰到玩家扣血，通常用 Trigger。

创建 Enemy：

1. 创建 Square。
2. 命名 `Enemy`。
3. 设置红色。
4. 添加 `Rigidbody2D`，Gravity Scale 设为 0。
5. 添加 `BoxCollider2D`，勾选 Is Trigger。
6. 给 Enemy 设置 Tag：`Enemy`。

如果没有 Enemy tag，先在 Tags 中添加。

## 5.3 玩家检测敌人

在 PlayerController 中添加：

```csharp
private void OnTriggerEnter2D(Collider2D other)
{
    if (other.CompareTag("Enemy"))
    {
        Debug.Log("Player hit enemy");
        Destroy(other.gameObject);
    }
}
```

`CompareTag` 比直接比较字符串更适合 Unity 的 Tag 系统。

## 5.4 物理设置检查

Enemy 的 Rigidbody2D 可以设置：

| 属性 | 值 |
|------|---|
| Gravity Scale | 0 |
| Collision Detection | Continuous 或 Discrete |
| Body Type | Dynamic |

如果敌人只是检测，不需要复杂物理，也可以把移动逻辑写得简单一点。

## 常见错误

- 忘了给 Enemy 设置 Tag，导致判断不进入。
- Trigger 和非 Trigger 混淆，想阻挡却勾了 Is Trigger。
- 两个对象都没有 Rigidbody2D，触发事件不稳定或不触发。
- 在 3D Collider 和 2D Collider 之间混用，事件不会匹配。

## 本章练习

1. 创建 Enemy。
2. 给 Enemy 添加 Trigger Collider2D。
3. 给 Enemy 设置 Tag。
4. 玩家碰到 Enemy 时输出日志。
5. 碰到后销毁 Enemy。

## 检查点

- 你知道 2D 物理必须使用 2D 组件。
- 你知道 Trigger 用于检测，不用于阻挡。
- 你会用 Tag 判断对象类型。
