# 第 2 章：场景、GameObject 与 Component

## 学习目标

- 理解 Unity 的基本模型：Scene 里放 GameObject，GameObject 由 Component 组成。
- 能创建玩家对象和基础可视形状。
- 知道 Transform 是每个 GameObject 的基础组件。
- 明白 Prefab 之前先要把场景对象搭清楚。

## 2.1 Scene 是什么

Scene 是一个关卡或界面。一个游戏通常有多个 Scene，例如：

| Scene | 用途 |
|------|------|
| MainMenu | 主菜单 |
| Game | 游戏主关卡 |
| Result | 结算页 |

本课程先只做一个 `Main` 场景，后面再讲场景切换。

## 2.2 GameObject 是什么

GameObject 本身只是一个容器。它真正的能力来自组件。

常见对象：

- Player
- Enemy
- Wall
- GameManager
- Main Camera
- Canvas

命名要表达职责。不要长期保留 `Square`、`GameObject (1)` 这种默认名字。

## 2.3 Component 是什么

Component 赋予 GameObject 能力。

| Component | 用途 |
|-----------|------|
| Transform | 位置、旋转、缩放 |
| SpriteRenderer | 显示 2D 图像 |
| Rigidbody2D | 2D 物理运动 |
| BoxCollider2D | 2D 碰撞形状 |
| AudioSource | 播放音频 |
| 自定义脚本 | 写游戏逻辑 |

不要把所有逻辑写进一个巨大脚本。Unity 的习惯是用多个组件组合行为。

## 2.4 创建玩家

在 Hierarchy 中创建：

```txt
2D Object -> Sprites -> Square
```

重命名为 `Player`。在 Inspector 中设置：

| 属性 | 值 |
|------|---|
| Position | `(0, -3, 0)` |
| Scale | `(0.6, 0.6, 1)` |
| Color | 选择蓝色或绿色 |

添加组件：

- `Rigidbody2D`
- `BoxCollider2D`

Rigidbody2D 设置：

| 属性 | 值 |
|------|---|
| Gravity Scale | 0 |
| Freeze Rotation Z | On |

## 2.5 创建墙

创建 4 个 Square，分别命名：

```txt
WallTop
WallBottom
WallLeft
WallRight
```

给每个墙添加 `BoxCollider2D`。墙不需要 `Rigidbody2D`，因为它们不移动。

建议位置：

| 对象 | Position | Scale |
|------|----------|-------|
| WallTop | `(0, 5, 0)` | `(10, 0.3, 1)` |
| WallBottom | `(0, -5, 0)` | `(10, 0.3, 1)` |
| WallLeft | `(-5, 0, 0)` | `(0.3, 10, 1)` |
| WallRight | `(5, 0, 0)` | `(0.3, 10, 1)` |

## 常见错误

- 只改了 Sprite 的视觉大小，忘了碰撞器大小。
- 给墙也加 Rigidbody2D，导致墙被物理推动。
- 玩家没有 Rigidbody2D，碰撞行为和预期不一致。
- 修改对象后忘记保存场景。

## 本章练习

1. 创建 Player。
2. 给 Player 添加 Rigidbody2D 和 BoxCollider2D。
3. 创建 4 面墙并添加 BoxCollider2D。
4. 保存场景。
5. 运行，确认玩家和墙都可见。

## 检查点

- 你知道 GameObject 是容器，Component 才是能力。
- 你知道 Transform 控制对象位置、旋转和缩放。
- 你知道静态墙通常不需要 Rigidbody2D。
