# 第 7 章：分数、生命值与 UI

## 学习目标

- 创建 CanvasLayer UI。
- 用 Label 显示分数。
- 用 ProgressBar 或 Label 显示生命值。
- 让玩家碰到敌人时扣血。

## 7.1 创建 HUD 场景

新建场景，根节点选择 `CanvasLayer`，命名为 `HUD`。

节点结构：

```txt
HUD (CanvasLayer)
  ScoreLabel (Label)
  HealthLabel (Label)
  MessageLabel (Label)
```

保存：

```txt
res://scenes/hud.tscn
```

把 `HUD` 实例拖进 `main.tscn`。

## 7.2 HUD 脚本

创建 `res://scripts/hud.gd`：

```gdscript
extends CanvasLayer

@onready var score_label: Label = $ScoreLabel
@onready var health_label: Label = $HealthLabel
@onready var message_label: Label = $MessageLabel

func set_score(value: int) -> void:
    score_label.text = "Score: %d" % value

func set_health(value: int) -> void:
    health_label.text = "Health: %d" % value

func show_message(text: String) -> void:
    message_label.text = text
```

运行前先在 Inspector 调整三个 Label 的位置，避免重叠。

## 7.3 主场景记录状态

在 `main.gd` 中添加：

```gdscript
var score: int = 0
var health: int = 3

@onready var hud: CanvasLayer = $HUD

func _ready() -> void:
    randomize()
    hud.set_score(score)
    hud.set_health(health)
    hud.show_message("")
```

## 7.4 碰撞扣血

需要让敌人碰到玩家时通知主场景。简单做法是把敌人的 `body_entered` 信号连接到敌人脚本，再判断碰到的是不是玩家。

在 `Enemy` 的 Node 面板连接 `body_entered(body)` 到 `enemy.gd`：

```gdscript
signal hit_player

func _on_body_entered(body: Node2D) -> void:
    if body.name == "Player":
        hit_player.emit()
        queue_free()
```

生成敌人后连接这个自定义信号：

```gdscript
func _on_spawn_timer_timeout() -> void:
    var enemy := enemy_scene.instantiate()
    var width := get_viewport_rect().size.x
    enemy.position = Vector2(randf_range(30.0, width - 30.0), -30.0)
    enemy.hit_player.connect(_on_enemy_hit_player)
    add_child(enemy)

func _on_enemy_hit_player() -> void:
    health -= 1
    hud.set_health(health)
    if health <= 0:
        hud.show_message("Game Over")
        $SpawnTimer.stop()
```

## 7.5 加分逻辑

最简单的分数可以按时间增长：

```gdscript
func _process(delta: float) -> void:
    score += int(delta * 10.0)
    hud.set_score(score)
```

这段有一个问题：`int(delta * 10.0)` 很可能长期是 0。更好的做法是累积浮点数：

```gdscript
var score_time: float = 0.0

func _process(delta: float) -> void:
    score_time += delta
    if score_time >= 1.0:
        score_time = 0.0
        score += 10
        hud.set_score(score)
```

## 常见错误

- UI 节点放在 `Node2D` 下，摄像机或坐标变化导致位置不稳定。
- Label 没有足够宽度，文字被截断。
- 信号连接到错误节点。
- 用 `body.name == "Player"` 可以练习，但正式项目更推荐 group 或类型判断。

## 本章练习

1. 创建 `hud.tscn` 并放入主场景。
2. 显示初始分数和生命值。
3. 敌人碰到玩家时扣 1 点生命。
4. 生命为 0 时停止生成敌人。
5. 每秒给玩家加 10 分。

## 检查点

- 你知道 UI 通常放在 `CanvasLayer`。
- 你会用函数更新 UI，而不是让主场景直接改所有 Label。
- 你能让敌人通过信号通知主场景。
