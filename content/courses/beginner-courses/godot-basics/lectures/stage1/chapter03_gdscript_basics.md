# 第 3 章：GDScript 基础语法

## 学习目标

- 给节点挂载脚本。
- 理解 `_ready`、`_process`、`_physics_process`。
- 会定义变量、导出变量和函数。
- 能读懂缩进错误、空引用错误和节点路径错误。

## 3.1 创建脚本

打开 `player.tscn`，选中根节点 `Player`，点击 Attach Script。

保存到：

```txt
res://scripts/player.gd
```

Godot 会生成类似脚本：

```gdscript
extends CharacterBody2D

func _ready() -> void:
    pass
```

`extends CharacterBody2D` 表示这个脚本挂在 `CharacterBody2D` 节点上，可以使用它的属性和方法。

## 3.2 缩进很重要

GDScript 用缩进表示代码块。函数里的内容必须缩进。

```gdscript
func say_hello() -> void:
    print("hello")
```

错误示例：

```gdscript
func say_hello() -> void:
print("hello")
```

看到缩进错误时，先检查代码块内部是否统一使用空格或 Tab。Godot 默认会帮你处理缩进，尽量不要手动混用。

## 3.3 常用生命周期

| 函数 | 什么时候执行 | 适合做什么 |
|------|--------------|------------|
| `_ready` | 节点进入场景树并准备好后一次 | 获取子节点、初始化 |
| `_process(delta)` | 每帧执行 | 非物理的动画、倒计时 |
| `_physics_process(delta)` | 固定物理帧执行 | 移动、碰撞、物理逻辑 |

玩家移动使用 `_physics_process` 更合适。

## 3.4 变量和导出变量

普通变量：

```gdscript
var health: int = 3
var score: int = 0
```

导出变量会显示在 Inspector，方便不用改代码就调数值：

```gdscript
@export var speed: float = 260.0
```

新手做游戏时，把速度、生命值、生成间隔这类需要调手感的数值做成导出变量。

## 3.5 获取子节点

假设玩家下面有 `ColorRect`：

```gdscript
@onready var body: ColorRect = $ColorRect
```

`$ColorRect` 是节点路径简写。节点改名后，这里也要改。

更长路径：

```gdscript
@onready var label: Label = $"../HUD/ScoreLabel"
```

路径越长越脆弱。能通过信号或导出引用解决时，不要让脚本到处跨层找节点。

## 3.6 常见错误

- `Invalid get index` 常见原因是变量为 null 或节点路径错。
- `Parser Error` 常见原因是拼写、冒号、缩进错误。
- 函数名写成 `_physic_process` 不会报错，但不会被 Godot 自动调用。
- 脚本挂在错误类型节点上，`extends` 和节点能力不匹配。

## 本章练习

1. 给 `Player` 挂载 `player.gd`。
2. 添加 `@export var speed: float = 260.0`。
3. 在 `_ready` 里 `print("player ready")`。
4. 运行场景，查看 Output。
5. 故意改错节点路径，观察错误信息，再修复。

## 检查点

- 你知道脚本的 `extends` 要匹配节点类型。
- 你知道移动逻辑应该放进 `_physics_process`。
- 你会读 Output 中的脚本错误位置。
