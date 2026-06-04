# 第 7 章：UMG UI、分数与生命值

## 学习目标

- 创建 Widget Blueprint。
- 显示分数和生命值。
- 在 PlayerController 中创建 UI。
- 游戏数据变化后刷新 UI。

## 7.1 创建 Widget

在 `Content/UI` 创建 Widget Blueprint：

```txt
WBP_HUD
```

添加：

```txt
Canvas Panel
  TextBlock_Score
  TextBlock_Health
  TextBlock_Message
```

把 TextBlock 放在屏幕左上角和上方中央。命名清楚，方便蓝图访问。

## 7.2 暴露更新函数

在 `WBP_HUD` 中创建函数：

```txt
SetScore(NewScore)
SetHealth(NewHealth)
ShowMessage(Text)
```

函数里设置对应 TextBlock 的 Text。

不要每帧绑定 Text。新手常用 Binding，但它每帧执行，项目大了可能难维护。数据变化时主动刷新更清晰。

## 7.3 创建 UI

在 PlayerController 或 Character 的 BeginPlay 中：

```txt
Create Widget(WBP_HUD)
Add To Viewport
保存引用到 HUDRef
```

更推荐 PlayerController 管 UI，因为它代表本地玩家。

## 7.4 更新分数和生命

简单流程：

1. GameMode 修改 Score。
2. GameMode 或 PlayerController 调用 HUD 的 SetScore。
3. 玩家受伤时调用 SetHealth。

为了课程简单，可以先让 GameMode 保存 HUDRef；正式项目更建议通过 Controller 或事件分发器解耦。

## 7.5 Game Over

Health 小于等于 0 时：

- ShowMessage("Game Over")
- 禁用玩家输入。
- 停止生成敌人。

## 常见错误

- Widget 创建了但没 Add To Viewport。
- TextBlock 没勾 Is Variable，蓝图里拿不到。
- 每帧绑定 UI 导致逻辑分散。
- 多次 Create Widget，屏幕上叠了多个 HUD。

## 本章练习

1. 创建 WBP_HUD。
2. 显示 Score 和 Health。
3. BeginPlay 添加到 Viewport。
4. 收集 Pickup 后刷新 Score。
5. Health 为 0 时显示 Game Over。

## 检查点

- 你知道 UMG 用 Widget Blueprint 做 UI。
- 你知道 UI 创建后需要 Add To Viewport。
- 你知道数据变化时主动刷新 UI 更清晰。
