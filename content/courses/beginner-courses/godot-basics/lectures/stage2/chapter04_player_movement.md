# 第 4 章：玩家角色与移动

## 学习目标

- 设置输入动作。
- 用 `Input.get_vector` 读取方向。
- 用 `CharacterBody2D` 和 `move_and_slide` 移动玩家。
- 把玩家限制在屏幕内。

## 4.1 设置输入

Godot 默认有 `ui_left`、`ui_right`、`ui_up`、`ui_down`。练习项目可以先使用它们。正式项目建议在 Project Settings 的 Input Map 中创建自己的动作名，例如：

| 动作 | 按键 |
|------|------|
| `move_left` | A、Left |
| `move_right` | D、Right |
| `move_up` | W、Up |
| `move_down` | S、Down |

本章先使用默认 `ui_*`，减少配置步骤。

## 4.2 玩家移动脚本

打开 `player.gd`：

```gdscript
extends CharacterBody2D

@export var speed: float = 260.0

func _physics_process(delta: float) -> void:
    var direction := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
    velocity = direction * speed
    move_and_slide()
```

运行场景，玩家色块应该能用方向键移动。

## 4.3 为什么不用 position 直接加

你可以直接写：

```gdscript
position += direction * speed * delta
```

但 `CharacterBody2D` 的优势是和物理、碰撞一起工作。`move_and_slide` 会根据 `velocity` 处理移动和滑动。后面加入墙、敌人、障碍时，这种方式更稳定。

## 4.4 限制屏幕边界

如果玩家能飞出屏幕，新手会以为对象消失。可以把位置夹在视口范围内：

```gdscript
func _physics_process(delta: float) -> void:
    var direction := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
    velocity = direction * speed
    move_and_slide()

    var viewport_size := get_viewport_rect().size
    position.x = clamp(position.x, 16.0, viewport_size.x - 16.0)
    position.y = clamp(position.y, 16.0, viewport_size.y - 16.0)
```

这里 `16` 是玩家方块半径，因为色块大小是 32 x 32。

## 4.5 调手感

在 Inspector 中修改 `speed`，试试 120、260、480 的差异。调手感时不要直接写死多个数字，优先用导出变量。

如果移动斜向速度过快，`Input.get_vector` 已经帮你做了方向归一化，比手动加四个按键更省心。

## 常见错误

- 忘了把脚本挂在 `Player` 根节点上。
- 在 `_process` 里改 `velocity`，导致物理行为不稳定。
- 忘了调用 `move_and_slide()`。
- `ColorRect` 的原点和碰撞形状对不齐，视觉和碰撞感觉错位。

## 本章练习

1. 让玩家能上下左右移动。
2. 把速度调成 200，再调成 420，感受差异。
3. 加入屏幕边界限制。
4. 运行当前玩家场景和主场景，确认都能工作。

## 检查点

- 你知道输入动作和具体按键是两层概念。
- 你能用 `velocity` 和 `move_and_slide` 移动玩家。
- 你会把可调数值暴露到 Inspector。
