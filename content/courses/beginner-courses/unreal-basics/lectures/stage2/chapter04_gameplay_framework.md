# 第 4 章：Pawn、Character、Controller 与 GameMode

## 学习目标

- 理解 Unreal Gameplay Framework 的核心类。
- 区分 Pawn、Character、Controller、GameMode。
- 知道第三人称模板为什么能直接移动。
- 创建自己的 GameMode 蓝图。

## 4.1 为什么要学 Gameplay Framework

Unreal 的项目不是只靠一个脚本跑起来。Gameplay Framework 提供了一套模块化基础：谁是玩家，谁处理输入，谁定义规则，谁保存状态。

## 4.2 核心类

| 类 | 新手理解 |
|----|----------|
| Actor | 可放进 Level 的对象 |
| Pawn | 可被 Controller 控制的 Actor |
| Character | 带走路、跳跃、胶囊碰撞的 Pawn |
| PlayerController | 处理玩家输入和视角 |
| GameMode | 定义关卡规则和默认类 |
| GameState | 保存全局游戏状态 |
| PlayerState | 保存单个玩家状态 |

第三人称模板已经给你准备好了 Character、Controller 和 GameMode。

## 4.3 创建 GameMode

在 `Content/Blueprints` 创建 Blueprint Class，搜索 GameModeBase，命名：

```txt
BP_DodgeGameMode
```

打开 Project Settings -> Maps & Modes：

- Default GameMode 设置为 `BP_DodgeGameMode`。
- Default Pawn Class 保持第三人称模板角色。

## 4.4 GameMode 放什么

GameMode 适合放关卡规则：

- 游戏是否开始。
- 是否 Game Over。
- 玩家默认 Pawn。
- 胜利/失败条件。

不要把 UI 节点、Pickup 视觉、敌人移动都塞进 GameMode。

## 4.5 PlayerController 放什么

PlayerController 适合处理玩家控制、输入相关逻辑、HUD 创建。新手阶段可以先少改模板 Controller，等理解框架后再拆分。

## 常见错误

- 修改了 GameMode 蓝图，但 Maps & Modes 仍然使用旧 GameMode。
- 把所有逻辑都放进 Level Blueprint，后期无法复用。
- 不理解 Pawn 和 Controller，导致输入绑定到错误对象。

## 本章练习

1. 创建 `BP_DodgeGameMode`。
2. 设置为默认 GameMode。
3. 查看当前 Default Pawn Class。
4. 写一段说明：GameMode 和 Character 分别负责什么。

## 检查点

- 你知道 Character 是 Pawn 的一种。
- 你知道 Controller 负责控制 Pawn。
- 你知道 GameMode 定义关卡规则。
