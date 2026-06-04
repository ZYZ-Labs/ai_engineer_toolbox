# 第 8 章：材质、音效与反馈

## 学习目标

- 创建简单 Material。
- 给 Pickup 和伤害物添加视觉区分。
- 播放音效。
- 用反馈提升可玩性。

## 8.1 创建 Material

在 `Content/Materials` 创建：

```txt
M_Pickup
M_Danger
```

设置 Base Color：

- Pickup：黄色或绿色。
- Danger：红色。

把 Material 应用到对应 Static Mesh。

## 8.2 动态反馈

Pickup 可以旋转和上下浮动。

在 `BP_Pickup` Event Tick 中：

```txt
AddActorLocalRotation
SetActorLocation(基于 Sine 的上下偏移)
```

新手可以先只做旋转。不要让视觉效果影响碰撞位置太多。

## 8.3 播放音效

导入短音效到 `Content/Audio`。在收集时调用：

```txt
Play Sound at Location
```

Location 使用 Pickup 的 Actor Location。播放后再 Destroy Actor。

## 8.4 受伤反馈

玩家受伤时可以：

- Print String 临时提示。
- UI Health 变化。
- 播放受伤音效。
- 角色材质闪红。

新手先做 UI 和音效，再做复杂材质动态变化。

## 8.5 反馈原则

| 动作 | 反馈 |
|------|------|
| 收集 | 音效、分数增加、对象消失 |
| 受伤 | 音效、生命降低、短提示 |
| 游戏结束 | 中央文字、禁用输入 |
| 开始游戏 | UI 清空、计时开始 |

反馈不是装饰，它告诉玩家规则是否生效。

## 常见错误

- 音效资源太长，连续播放混乱。
- Destroy Actor 在 Play Sound 前执行，位置或引用丢失。
- 材质全靠默认灰色，玩家分不清对象用途。
- 视觉动效太强，影响判断碰撞。

## 本章练习

1. 给 Pickup 创建 Material。
2. 给危险物创建 Material。
3. 收集时播放音效。
4. 受伤时播放音效。
5. 写一个反馈清单，列出每个玩家动作对应反馈。

## 检查点

- 你知道 Material 控制对象外观。
- 你会用 Play Sound at Location。
- 你知道反馈要服务玩法理解。
