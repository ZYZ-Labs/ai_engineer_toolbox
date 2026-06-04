# 第 9 章：资源、Autoload 与状态管理

## 学习目标

- 理解 Resource 适合保存可复用数据。
- 理解 Autoload 适合保存跨场景状态或服务。
- 不把所有全局变量都塞进一个脚本。
- 给小游戏整理基本状态管理。

## 9.1 Resource 是什么

Resource 是 Godot 中可保存、可复用的数据对象。场景是节点树，Resource 更像数据配置。

敌人属性可以做成 Resource：

```gdscript
extends Resource
class_name EnemyStats

@export var speed: float = 140.0
@export var score_value: int = 10
```

保存为：

```txt
res://scripts/enemy_stats.gd
```

然后在 FileSystem 里创建一个新的 `EnemyStats` 资源，保存到：

```txt
res://assets/basic_enemy_stats.tres
```

## 9.2 在敌人中使用 Resource

```gdscript
extends Area2D

@export var stats: EnemyStats

func _process(delta: float) -> void:
    var speed := 140.0
    if stats != null:
        speed = stats.speed
    position.y += speed * delta
```

这样你可以在 Inspector 里换不同敌人数据，而不是复制多个敌人脚本。

## 9.3 Autoload 是什么

Autoload 会在项目启动时自动加载一个脚本或场景，并作为全局单例访问。它适合放真正跨场景的状态，例如当前分数、全局设置、音量配置。

创建：

```txt
res://scripts/game_state.gd
```

内容：

```gdscript
extends Node

var score: int = 0
var best_score: int = 0

func reset_run() -> void:
    score = 0

func add_score(value: int) -> void:
    score += value
    best_score = max(best_score, score)
```

在 Project Settings 的 Autoload 中添加 `game_state.gd`，名字填 `GameState`。

## 9.4 不要滥用全局状态

Autoload 很方便，也很容易变成垃圾桶。判断是否应该放进去：

| 应该放 | 不应该放 |
|--------|----------|
| 音量设置 | 某个敌人的当前位置 |
| 当前玩家存档 | 某个按钮的临时颜色 |
| 跨场景分数 | 某个关卡内部计时器 |
| 全局事件总线 | 单个节点能自己管理的状态 |

能放在场景内部的状态，就不要全局化。

## 9.5 常见错误

- Autoload 名字和脚本类名混淆。
- 在编辑器里忘了启用 Autoload，代码里访问 `GameState` 报错。
- 所有脚本都直接读写全局变量，导致 bug 难定位。
- Resource 为空时没有检查 null。

## 本章练习

1. 创建 `EnemyStats` Resource。
2. 给敌人添加 `stats` 导出变量。
3. 创建 `GameState` Autoload。
4. 把分数累加逻辑移动到 `GameState.add_score`。
5. 保留 UI 更新在 HUD 或主场景，不要让 Autoload 直接操作 UI。

## 检查点

- 你知道 Resource 适合数据，场景适合对象结构。
- 你知道 Autoload 是跨场景单例，不是所有变量的归宿。
- 你会为可能为空的导出资源写保护逻辑。
