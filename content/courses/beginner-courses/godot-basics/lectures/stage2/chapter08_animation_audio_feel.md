# 第 8 章：动画、音效与手感

## 学习目标

- 用简单动画让游戏反馈更清楚。
- 知道音效节点如何播放。
- 理解手感来自速度、间隔、反馈和失败成本。
- 不依赖复杂素材也能提升体验。

## 8.1 为什么要做反馈

新手常把游戏做成“功能能跑”，但玩家不知道自己是否被打中、是否得分、是否接近失败。反馈让玩家理解游戏状态。

反馈可以很简单：

- 玩家受伤时闪烁。
- 得分时 Label 轻微变化。
- 敌人生成速度逐步加快。
- 撞到敌人时播放音效。
- Game Over 显示清楚。

## 8.2 受伤闪烁

在 `player.gd` 中添加一个函数。假设玩家有 `ColorRect` 子节点：

```gdscript
@onready var body: ColorRect = $ColorRect

func flash() -> void:
    body.modulate = Color(1.0, 0.4, 0.4)
    await get_tree().create_timer(0.12).timeout
    body.modulate = Color.WHITE
```

在主场景扣血时调用：

```gdscript
@onready var player: CharacterBody2D = $Player

func _on_enemy_hit_player() -> void:
    health -= 1
    hud.set_health(health)
    player.flash()
    if health <= 0:
        hud.show_message("Game Over")
        $SpawnTimer.stop()
```

## 8.3 用 AnimationPlayer

如果你想让 UI 信息淡入淡出，可以给 `HUD` 添加 `AnimationPlayer`。新建动画 `message_pop`：

| 属性 | 起始 | 结束 |
|------|------|------|
| `MessageLabel:scale` | `(1.2, 1.2)` | `(1, 1)` |
| `MessageLabel:modulate:a` | `0` | `1` |

脚本中播放：

```gdscript
@onready var animation_player: AnimationPlayer = $AnimationPlayer

func show_message(text: String) -> void:
    message_label.text = text
    animation_player.play("message_pop")
```

## 8.4 添加音效

添加节点：

```txt
Main
  HitSound (AudioStreamPlayer)
```

把音效文件拖到 `HitSound` 的 Stream 属性。没有素材时可以先跳过，或者用自己录制的短提示音。

脚本：

```gdscript
@onready var hit_sound: AudioStreamPlayer = $HitSound

func _on_enemy_hit_player() -> void:
    hit_sound.play()
    health -= 1
    hud.set_health(health)
    player.flash()
```

## 8.5 难度曲线

简单难度曲线可以逐步缩短生成间隔：

```gdscript
func _process(delta: float) -> void:
    score_time += delta
    if score_time >= 1.0:
        score_time = 0.0
        score += 10
        hud.set_score(score)
        $SpawnTimer.wait_time = max(0.25, $SpawnTimer.wait_time - 0.02)
```

这会让游戏越来越难，但不会低于 0.25 秒。

## 常见错误

- 动画还没播放完又重复播放，效果抖动。
- 音效太长，连续受伤时重叠混乱。
- 难度上升太快，新手玩家无法反应。
- 没有 Game Over 状态，游戏结束后敌人还在生成。

## 本章练习

1. 玩家受伤时闪烁。
2. Game Over 文案播放一个简单动画。
3. 加一个受伤音效节点。
4. 让敌人生成间隔随分数逐步缩短。
5. 请别人试玩 1 分钟，记录哪里不清楚。

## 检查点

- 你知道反馈不是装饰，而是让玩家理解状态。
- 你能用 `await create_timer` 做短暂效果。
- 你会把难度参数限制在合理范围内。
