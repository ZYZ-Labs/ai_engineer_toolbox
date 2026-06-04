# 第 10 章：调试、日志、性能与引用

## 学习目标

- 用 Print String 和 Output Log 排查问题。
- 理解 Blueprint 断点。
- 识别常见引用错误。
- 初步使用统计命令观察性能。

## 10.1 Print String

Print String 是最快的调试方式。适合确认：

- 事件有没有触发。
- Cast 是否成功。
- 分数变量是多少。
- Overlap 的 Other Actor 是谁。

不要把大量 Print 留在最终项目里。

## 10.2 Blueprint 断点

在 Blueprint 节点上右键 Add Breakpoint。运行后，执行到节点时会暂停。你可以查看变量值和执行路径。

断点适合排查复杂逻辑，特别是 Cast、Branch、Timer、UI 更新不按预期执行时。

## 10.3 常见错误

| 问题 | 常见原因 |
|------|----------|
| Accessed None | 引用为空 |
| Cast Failed | 对象不是目标类型 |
| UI 不显示 | 没 Add To Viewport |
| Overlap 不触发 | Collision 设置错 |
| Spawn 不生成 | Class 变量为空 |

## 10.4 引用管理

不要让每个 Blueprint 到处 `Get All Actors Of Class`。这个节点方便但容易滥用。

更好的方式：

- 生成时保存引用。
- 通过 GameMode 或 PlayerController 管理全局对象。
- 用 Event Dispatcher 通知变化。
- 用 Blueprint Interface 降低耦合。

## 10.5 性能初步观察

常用控制台命令：

```txt
stat fps
stat unit
stat game
```

新手先关注：

- FPS 是否稳定。
- Game Thread 是否过高。
- 对象是否无限生成。
- Tick 逻辑是否太多。

## 常见错误

- 看到 Accessed None 后只加 Delay 掩盖问题。
- Overlap 不触发时不检查 Collision Preset。
- 每帧 Get All Actors。
- 不保存引用，靠名字硬找对象。

## 本章练习

1. 在 Pickup Overlap 上加 Print String。
2. 给 Cast Failed 加调试输出。
3. 给一个节点加断点。
4. 运行 `stat fps`。
5. 检查场景对象数量是否持续上升。

## 检查点

- 你知道 Accessed None 通常是空引用。
- 你会用断点看 Blueprint 执行路径。
- 你知道不要滥用 Get All Actors Of Class。
