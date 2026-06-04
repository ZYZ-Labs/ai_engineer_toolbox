# 第 9 章：生成敌人、关卡规则与数据

## 学习目标

- 用 Spawner Blueprint 生成对象。
- 用 Timer 替代每帧手动计时。
- 让关卡规则集中到 GameMode。
- 初步理解 Data Asset。

## 9.1 创建敌人 Blueprint

创建 Actor Blueprint：

```txt
BP_Danger
```

组件：

```txt
StaticMesh
SphereCollision
```

Danger 使用红色材质，SphereCollision 设置 Overlap Pawn。玩家碰到它时扣血并 Destroy Actor。

## 9.2 创建 Spawner

创建 Actor Blueprint：

```txt
BP_DangerSpawner
```

变量：

| 变量 | 类型 | 默认值 |
|------|------|--------|
| DangerClass | BP_Danger Class Reference | BP_Danger |
| SpawnInterval | Float | 1.0 |
| SpawnRange | Float | 800 |

BeginPlay：

```txt
Set Timer by Event
  Time = SpawnInterval
  Looping = true
  Event -> SpawnDanger
```

SpawnDanger：

```txt
GetActorLocation
Random Float in Range(-SpawnRange, SpawnRange)
SpawnActorFromClass(DangerClass)
```

## 9.3 Timer 比 Tick 更清晰

不是所有逻辑都该放 Tick。定时生成、倒计时、延迟执行适合 Timer。Tick 适合每帧移动、持续检测和视觉变化。

## 9.4 规则放 GameMode

GameMode 可以控制：

- 是否开始生成。
- 当前分数。
- 当前生命值。
- 游戏是否结束。

Spawner 只负责生成，不负责判断玩家是否死亡。

## 9.5 Data Asset

更复杂时，可以创建 Data Asset 存敌人参数。新手阶段先用 Blueprint 变量即可。等出现多种敌人、多种关卡规则，再抽数据。

## 常见错误

- 用 Tick 每帧 Spawn，瞬间生成大量对象。
- SpawnActor 的 Class 为空。
- 生成位置太靠近玩家，开局直接死亡。
- GameMode、Spawner、UI 互相乱改状态。

## 本章练习

1. 创建 `BP_Danger`。
2. 创建 `BP_DangerSpawner`。
3. 用 Timer 每秒生成危险物。
4. 玩家碰到危险物扣血。
5. Game Over 后停止生成。

## 检查点

- 你知道 Timer 适合定时事件。
- 你会用 SpawnActorFromClass。
- 你知道 Spawner 不应该承担所有游戏规则。
