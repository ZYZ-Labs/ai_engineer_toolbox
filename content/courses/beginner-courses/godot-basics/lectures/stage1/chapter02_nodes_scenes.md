# 第 2 章：节点、场景与项目结构

## 学习目标

- 理解节点是功能积木，场景是节点树保存成文件。
- 知道组合优先于把所有逻辑塞进一个脚本。
- 能创建玩家场景并实例化到主场景。
- 理解为什么 Godot 项目会有很多 `.tscn` 文件。

## 2.1 节点是什么

Godot 的项目由节点组成。一个节点负责一类功能：`Node2D` 负责 2D 位置，`Sprite2D` 负责显示图片，`CollisionShape2D` 负责碰撞形状，`Timer` 负责计时。

新手可以把节点理解成积木。不要期待一个节点解决所有事情。Godot 的核心思路是把小节点组合成一个能工作的对象。

## 2.2 场景是什么

场景是保存起来的节点树。它可以是一个完整关卡，也可以是玩家、敌人、子弹、UI 面板这样的小对象。

推荐拆分：

| 场景 | 根节点 | 作用 |
|------|--------|------|
| `main.tscn` | `Node2D` | 游戏主入口 |
| `player.tscn` | `CharacterBody2D` | 玩家 |
| `enemy.tscn` | `Area2D` | 敌人 |
| `hud.tscn` | `CanvasLayer` | UI |

这样做的好处是每个场景可以独立运行、调试和复用。

## 2.3 创建玩家场景

新建场景，根节点选择 `CharacterBody2D`，命名为 `Player`。

添加子节点：

```txt
Player (CharacterBody2D)
  ColorRect
  CollisionShape2D
```

`ColorRect` 用来临时代替美术素材。设置大小为 32 x 32，颜色选一个明显的颜色。`CollisionShape2D` 添加 `RectangleShape2D`，大小也设为 32 x 32。

保存：

```txt
res://scenes/player.tscn
```

## 2.4 实例化玩家到主场景

打开 `main.tscn`，把 `player.tscn` 从 FileSystem 拖到 2D 视图或 Scene 树里。你会看到主场景下出现一个 `Player` 实例。

实例的含义是：主场景引用玩家场景。修改 `player.tscn` 的结构，主场景里的玩家实例也会跟着更新。

## 2.5 节点命名

好名字能降低脚本错误：

- 用 `Player`，不要用 `CharacterBody2D` 默认名。
- 用 `SpawnTimer`，不要用 `Timer2`。
- 用 `ScoreLabel`，不要用 `Label3`。

脚本里经常按节点路径找子节点，名字混乱会让错误变多。

## 2.6 常见错误

- 把所有节点都堆在 `main.tscn`，后期无法复用。
- 场景实例化后直接改实例结构，却忘了原始场景没有改。
- 删除子节点后脚本还在访问旧路径。
- 碰撞形状没设置大小，结果物体看得见但碰不到。

## 本章练习

1. 创建 `player.tscn`。
2. 玩家根节点使用 `CharacterBody2D`。
3. 添加 `ColorRect` 和 `CollisionShape2D`。
4. 把玩家实例放到 `main.tscn`。
5. 运行主场景，确认能看到色块玩家。

## 检查点

- 你能解释节点和场景的区别。
- 你知道场景可以作为更大场景的组成部分。
- 你开始用清晰节点名，而不是保留默认名字。
