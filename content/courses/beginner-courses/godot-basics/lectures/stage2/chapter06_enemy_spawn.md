# 第 6 章：敌人、计时器与生成点

## 学习目标

- 创建简单敌人场景。
- 用 `Timer` 定期生成敌人。
- 用 `PackedScene` 在代码里实例化场景。
- 让敌人离开屏幕后自动删除。

## 6.1 创建敌人场景

新建场景，根节点选择 `Area2D`，命名为 `Enemy`。

节点结构：

```txt
Enemy (Area2D)
  ColorRect
  CollisionShape2D
```

设置 `ColorRect` 为 28 x 28，颜色红色。`CollisionShape2D` 使用 `RectangleShape2D`，大小 28 x 28。

保存：

```txt
res://scenes/enemy.tscn
```

敌人用 `Area2D`，因为它主要用于检测玩家碰到敌人，不需要像墙一样阻挡玩家。

## 6.2 敌人移动脚本

创建 `res://scripts/enemy.gd` 并挂到 `Enemy`：

```gdscript
extends Area2D

@export var speed: float = 140.0

func _process(delta: float) -> void:
    position.y += speed * delta
    if position.y > get_viewport_rect().size.y + 40.0:
        queue_free()
```

`queue_free()` 表示安全地把节点从场景中删除。敌人离开屏幕后不删除，会越来越多，影响性能。

## 6.3 给主场景添加 Timer

打开 `main.tscn`，给 `Main` 添加子节点 `Timer`，命名为 `SpawnTimer`。

Inspector 设置：

| 属性 | 值 |
|------|---|
| Wait Time | 1.0 |
| Autostart | On |
| One Shot | Off |

## 6.4 主场景脚本生成敌人

给 `Main` 挂脚本：

```txt
res://scripts/main.gd
```

脚本：

```gdscript
extends Node2D

@export var enemy_scene: PackedScene

func _ready() -> void:
    randomize()

func _on_spawn_timer_timeout() -> void:
    var enemy := enemy_scene.instantiate()
    var width := get_viewport_rect().size.x
    enemy.position = Vector2(randf_range(30.0, width - 30.0), -30.0)
    add_child(enemy)
```

在 Inspector 中把 `enemy.tscn` 拖到 `enemy_scene` 属性。

## 6.5 连接 Timer 信号

选中 `SpawnTimer`，打开 Node 面板，双击 `timeout()` 信号，连接到 `Main`，选择或创建方法 `_on_spawn_timer_timeout`。

运行后，红色敌人应该从上方随机出现并向下移动。

## 常见错误

- 忘了把 `enemy.tscn` 拖到 `enemy_scene`，运行时报 null。
- `timeout` 信号没有连接，计时器在跑但不会生成敌人。
- 敌人生成位置太靠边，部分在屏幕外。
- 忘了 `queue_free`，场景树里敌人越来越多。

## 本章练习

1. 创建 `enemy.tscn`。
2. 给敌人添加下落脚本。
3. 在主场景添加 `SpawnTimer`。
4. 连接 `timeout` 信号。
5. 调整 Wait Time 为 0.5，观察难度变化。

## 检查点

- 你知道 `PackedScene` 用于实例化场景。
- 你知道信号连接是节点通信方式之一。
- 你会删除离开屏幕的临时对象。
