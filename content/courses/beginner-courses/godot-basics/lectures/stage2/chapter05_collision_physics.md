# 第 5 章：碰撞、物理与地图边界

## 学习目标

- 理解可见形状和碰撞形状不是一回事。
- 使用 `CollisionShape2D` 设置碰撞范围。
- 创建墙体边界。
- 认识 layer 和 mask 的基本用途。

## 5.1 看得见不代表碰得到

`ColorRect` 只负责显示。真正参与物理检测的是 `CollisionShape2D`。如果你看到玩家穿过墙，先检查两个问题：

- 双方有没有碰撞节点。
- 碰撞形状是否启用并覆盖了正确区域。

选中 `CollisionShape2D`，如果形状为空，Inspector 会提示需要设置 Shape。

## 5.2 创建墙体场景

新建场景，根节点选择 `StaticBody2D`，命名为 `Wall`。

节点结构：

```txt
Wall (StaticBody2D)
  ColorRect
  CollisionShape2D
```

设置 `ColorRect` 为 640 x 20，颜色灰色。`CollisionShape2D` 使用 `RectangleShape2D`，大小也设成 640 x 20。

保存：

```txt
res://scenes/wall.tscn
```

把墙实例拖进 `main.tscn`，放在画面上边缘。复制三份，分别放在下、左、右边缘。左右墙大小可改成 20 x 360。

## 5.3 layer 和 mask

Collision Layer 表示“我属于哪一层”。Collision Mask 表示“我检测哪一层”。

新手可以先使用默认层。等项目复杂后再规划：

| 层 | 对象 |
|----|------|
| 1 | 玩家 |
| 2 | 墙 |
| 3 | 敌人 |
| 4 | 道具 |

如果玩家穿过墙，可能是玩家的 mask 没有勾墙所在 layer。

## 5.4 测试碰撞

运行主场景，用方向键把玩家推向墙。预期结果是玩家停在墙边，不会穿过去。

如果还是穿墙：

1. 确认玩家是 `CharacterBody2D`。
2. 确认玩家移动用 `move_and_slide`。
3. 确认墙是 `StaticBody2D`。
4. 确认两边都有启用的 `CollisionShape2D`。
5. 确认 layer 和 mask 有交集。

## 5.5 常见错误

- 调整了 `ColorRect` 大小，却忘了调整碰撞形状。
- 碰撞形状偏移，导致看起来还没碰到就停住。
- 用 `Area2D` 当墙，却期待它阻挡玩家。`Area2D` 默认用于检测，不用于阻挡。
- 在代码里直接改 `position`，绕过了物理移动。

## 本章练习

1. 创建 `wall.tscn`。
2. 在主场景四周摆放墙。
3. 运行并确认玩家不能穿墙。
4. 故意关闭墙的 CollisionShape2D，观察现象，再打开。
5. 尝试给玩家和墙设置不同 layer/mask。

## 检查点

- 你能区分显示节点和碰撞节点。
- 你知道 `StaticBody2D` 适合静态墙体。
- 你知道 layer/mask 用于控制谁和谁发生碰撞。
