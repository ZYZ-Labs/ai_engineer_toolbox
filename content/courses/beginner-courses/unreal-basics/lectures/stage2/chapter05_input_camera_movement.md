# 第 5 章：输入、相机与角色移动

## 学习目标

- 理解第三人称模板的输入基础。
- 调整角色移动速度。
- 理解 Camera 和 SpringArm。
- 添加一个冲刺输入。

## 5.1 模板为什么能移动

第三人称模板已经创建了输入动作、角色蓝图、相机和移动组件。角色通常包含：

```txt
Character
  CapsuleComponent
  Mesh
  CharacterMovement
  SpringArm
  Camera
```

CharacterMovement 负责走路、跳跃、重力等基础移动。

## 5.2 调整速度

打开第三人称 Character Blueprint，选中 CharacterMovement Component。

常用属性：

| 属性 | 用途 |
|------|------|
| Max Walk Speed | 最大行走速度 |
| Jump Z Velocity | 跳跃初速度 |
| Gravity Scale | 重力倍率 |
| Rotation Rate | 转向速度 |

把 Max Walk Speed 从默认值改为 500 或 700，运行感受差异。

## 5.3 相机和 SpringArm

SpringArm 像一根相机杆，让 Camera 和角色保持距离，并能处理遮挡。

常用属性：

- Target Arm Length
- Use Pawn Control Rotation
- Camera Lag

相机跟随太硬，可以尝试开启 Camera Lag，但不要调得过大，否则操作会拖。

## 5.4 添加冲刺

在 Character Blueprint 中创建变量：

| 变量 | 类型 | 默认值 |
|------|------|--------|
| WalkSpeed | Float | 500 |
| SprintSpeed | Float | 850 |

添加输入动作 Sprint。按下时设置 CharacterMovement 的 Max Walk Speed 为 SprintSpeed，松开时改回 WalkSpeed。

蓝图结构：

```txt
InputAction Sprint Started -> Set Max Walk Speed(SprintSpeed)
InputAction Sprint Completed -> Set Max Walk Speed(WalkSpeed)
```

## 常见错误

- 改了 CharacterMovement 但运行的是另一个 Character Blueprint。
- Sprint 输入没有映射按键。
- 相机 Lag 太大导致眩晕。
- 把移动速度写死在多个地方。

## 本章练习

1. 调整 Max Walk Speed。
2. 调整 SpringArm 长度。
3. 添加 Sprint 输入。
4. 按 Shift 冲刺，松开恢复。
5. 保存并测试。

## 检查点

- 你知道 CharacterMovement 控制基础移动。
- 你知道 SpringArm 管理第三人称相机距离。
- 你会用输入事件改变角色参数。
