# 第 6 章：碰撞、Overlap 与交互

## 学习目标

- 理解 Blocking 和 Overlap 的区别。
- 让玩家收集 Pickup。
- 用 Blueprint Interface 或 Cast 处理交互。
- 更新分数。

## 6.1 Blocking 与 Overlap

Blocking 会阻挡移动。Overlap 不阻挡，但会触发事件。

| 场景 | 推荐 |
|------|------|
| 墙挡住玩家 | Blocking |
| 玩家进入道具范围 | Overlap |
| 伤害区域 | Overlap |
| 地板承载角色 | Blocking |

## 6.2 Pickup Overlap

打开 `BP_Pickup`，选中 SphereCollision，添加事件：

```txt
OnComponentBeginOverlap
```

逻辑：

```txt
Other Actor -> Cast To ThirdPersonCharacter
  Success -> Print String("Pickup collected")
  Success -> Destroy Actor(Self)
```

运行后，玩家碰到 Pickup，应打印文字并销毁 Pickup。

## 6.3 避免过度 Cast

Cast 对新手最直观，但项目变大后到处 Cast 会耦合。后续可以用 Blueprint Interface：

- `BPI_CollectReceiver`
- 函数 `AddScore(Value)`

新手阶段先用 Cast，理解流程后再重构。

## 6.4 分数放在哪里

分数可以先放在 GameMode 或 PlayerController。单机关卡中，GameMode 管规则；UI 和玩家本地显示常由 PlayerController 管。

本课程为了简单，可以先在 `BP_DodgeGameMode` 创建变量：

```txt
Score: Integer
```

Pickup 被收集时：

```txt
Get GameMode -> Cast To BP_DodgeGameMode -> Add ScoreValue
```

## 常见错误

- Collision 没勾 Generate Overlap Events。
- Collision Preset 不允许 Pawn Overlap。
- Destroy Actor 接错对象，把玩家销毁了。
- Cast 失败但没有调试输出。

## 本章练习

1. 给 Pickup 添加 Overlap 事件。
2. 玩家碰到 Pickup 后销毁它。
3. 在 GameMode 中增加 Score。
4. 打印当前 Score。
5. 调整 Pickup 的 Collision 半径。

## 检查点

- 你知道 Blocking 和 Overlap 的区别。
- 你会用 BeginOverlap 做收集逻辑。
- 你知道 Cast 是直接但会增加耦合的方案。
