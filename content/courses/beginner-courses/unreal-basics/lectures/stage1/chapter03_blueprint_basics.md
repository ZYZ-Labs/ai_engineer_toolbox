# 第 3 章：Blueprint 基础与变量事件

## 学习目标

- 认识 Event Graph。
- 理解变量、节点、执行线和数据线。
- 用 BeginPlay 和 Print String 做第一个逻辑。
- 创建可编辑变量。

## 3.1 Blueprint 是什么

Blueprint 是 Unreal 的可视化脚本系统。它不是“玩具脚本”，很多实际项目会用 Blueprint 做原型、关卡逻辑、UI 和配置。

新手先掌握：

- Event
- Function
- Variable
- Branch
- Cast
- Timeline
- Custom Event

## 3.2 第一个事件

打开 `BP_Pickup` 的 Event Graph。添加：

```txt
Event BeginPlay -> Print String
```

Print 内容写：

```txt
Pickup ready
```

Compile、Save，运行游戏。屏幕或 Output Log 应显示文本。

## 3.3 执行线和数据线

白色线是执行顺序。彩色线是数据传递。新手常把数据线接对了，但没有接白色执行线，节点就不会运行。

判断节点是否会运行，先看有没有白色执行路径。

## 3.4 变量

在 `BP_Pickup` 创建变量：

| 变量 | 类型 | 默认值 |
|------|------|--------|
| ScoreValue | Integer | 10 |
| RotateSpeed | Float | 90 |

勾选 Instance Editable 后，每个放在 Level 里的 Pickup 都可以有不同值。

## 3.5 Tick 旋转

添加逻辑：

```txt
Event Tick
  -> AddActorLocalRotation
```

Yaw 连接：

```txt
RotateSpeed * Delta Seconds
```

这样收集物会随帧率独立地旋转。

## 常见错误

- 改完 Blueprint 没 Compile。
- 变量没设 Instance Editable，Level 中无法单独调整。
- 忘了乘 Delta Seconds，速度随帧率变化。
- 节点太乱，没有注释和分组。

## 本章练习

1. 在 BeginPlay 打印文本。
2. 创建 ScoreValue 和 RotateSpeed。
3. 让 Pickup 旋转。
4. 修改不同实例的 ScoreValue。
5. 给节点加 Comment。

## 检查点

- 你知道白色线控制执行顺序。
- 你会创建变量并暴露给实例。
- 你知道 Tick 中的速度要乘 Delta Seconds。
