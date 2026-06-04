# 第 2 章：Level、Actor 与 Component

## 学习目标

- 理解 Level 是关卡，Actor 是关卡中的对象。
- 理解 Component 给 Actor 提供能力。
- 会创建一个简单收集物 Actor。
- 区分 Static Mesh、Collision、Audio、Scene Component。

## 2.1 Level 是什么

Level 是 Unreal 中的关卡文件，扩展名通常是 `.umap`。一个游戏可以有多个 Level，例如菜单、主关卡、测试关卡。

本课程先使用一个 `Main` Level，后续再讲打包和项目结构。

## 2.2 Actor 是什么

Actor 是能放进 Level 的基本对象。灯光、相机、玩家出生点、静态网格、触发器、Blueprint 对象都可以是 Actor。

Actor 可以有 Transform：

- Location
- Rotation
- Scale

## 2.3 Component 是什么

Component 是 Actor 的组成部分。

| Component | 用途 |
|-----------|------|
| Scene Component | 位置层级 |
| Static Mesh Component | 显示静态模型 |
| Collision Component | 碰撞或触发 |
| Audio Component | 播放声音 |
| Camera Component | 相机 |
| Spring Arm Component | 相机臂 |

Actor 是容器，Component 是能力。

## 2.4 创建收集物 Blueprint

在 `Content/Blueprints` 中创建 Blueprint Class，选择 Actor，命名：

```txt
BP_Pickup
```

打开后添加组件：

```txt
BP_Pickup
  StaticMesh
  SphereCollision
```

StaticMesh 可以先选 Engine BasicShapes 的 Sphere 或 Starter Content 中的 Shape。SphereCollision 勾选 Generate Overlap Events。

## 2.5 放入 Level

把 `BP_Pickup` 拖到 Level 中，复制几个。点击 Play，先确认场景里能看到这些对象。

暂时不写逻辑，先建立结构。Unreal 新手不要一上来就写蓝图节点，先看清 Actor 和 Component 层级。

## 常见错误

- 在 Level 里直接放 Static Mesh，后面想复用时才发现没有 Blueprint。
- Collision 没启用 Overlap，事件不触发。
- Component 命名混乱，蓝图里很难找。
- 修改了 Blueprint 但没 Compile / Save。

## 本章练习

1. 创建 `BP_Pickup`。
2. 添加 StaticMesh 和 SphereCollision。
3. 把它放入 Level。
4. 复制 3 个收集物。
5. 保存 Blueprint 和 Level。

## 检查点

- 你知道 Actor 是 Level 中的对象。
- 你知道 Component 给 Actor 增加功能。
- 你知道复用对象应优先做成 Blueprint。
