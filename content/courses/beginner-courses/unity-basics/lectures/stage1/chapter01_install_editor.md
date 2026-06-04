# 第 1 章：安装 Unity 6.3 LTS 与编辑器

## 学习目标

- 知道本课程固定基于 **Unity 6.3 LTS (6000.3)**。
- 会用 Unity Hub 安装编辑器和模块。
- 能创建一个 2D 项目并运行空场景。
- 认识 Project、Hierarchy、Scene、Game、Inspector、Console。

## 1.1 版本基线

本课程固定使用 **Unity 6.3 LTS (6000.3)**。Unity 官方支持页说明 Unity 6.3 LTS 是 Unity 6 的最新 LTS 版本，LTS 适合准备锁定具体版本的项目。

不要用 beta 或 alpha 跟做本课程。不要用旧的 2021/2022 教程直接套到 Unity 6.3，因为输入系统、渲染管线、包版本和编辑器界面可能不同。

## 1.2 安装 Unity Hub 与编辑器

推荐通过 Unity Hub 管理编辑器版本：

1. 安装 Unity Hub。
2. 在 Installs 中添加 Unity 6.3 LTS。
3. 勾选你当前需要的平台模块。新手先选 Desktop Build Support。
4. 如果要做移动端，再额外安装 Android Build Support 或 iOS Build Support。

不要一开始安装所有平台模块。模块越多，占用空间越大，排错也更复杂。

## 1.3 创建 2D 项目

在 Unity Hub 中创建项目：

| 设置 | 建议 |
|------|------|
| Template | 2D |
| Project name | `UnityDodgeStarter` |
| Location | 固定项目目录 |
| Editor Version | Unity 6.3 LTS |

创建后打开项目。第一次导入资源会比较慢，等待底部进度条完成。

## 1.4 认识编辑器区域

| 区域 | 用途 |
|------|------|
| Hierarchy | 当前场景里的 GameObject 列表 |
| Scene | 编辑场景 |
| Game | 运行时玩家看到的画面 |
| Inspector | 当前选中对象的组件和属性 |
| Project | 项目资源文件 |
| Console | 日志、警告、错误 |

Unity 新手最常用的是 Hierarchy、Inspector、Project、Scene、Game、Console。

## 1.5 保存场景

在 Project 面板创建目录：

```txt
Assets/
  Scenes/
  Scripts/
  Prefabs/
  Art/
  Audio/
```

保存当前场景：

```txt
Assets/Scenes/Main.unity
```

Unity 场景文件类似 Godot 的场景文件，保存了当前场景里的对象、组件和引用。

## 1.6 第一次运行

点击顶部 Play 按钮。你应该看到 Game 视图运行起来。再次点击 Play 退出运行模式。

注意：运行模式下修改的很多值，退出运行后会恢复。新手常在 Play 模式里调好了数值，退出后发现全没了。养成习惯：确认不是 Play 模式再做长期配置。

## 常见错误

- 用错编辑器版本，导致教程里的菜单或组件对不上。
- 在 Play 模式里改参数，退出后以为 Unity 丢数据。
- 项目放在云同步目录，产生 `.meta` 冲突。
- Console 有红色错误但继续做，后面问题叠加。

## 本章练习

1. 安装 Unity 6.3 LTS。
2. 创建 `UnityDodgeStarter` 2D 项目。
3. 创建 `Assets/Scenes`、`Assets/Scripts`、`Assets/Prefabs`。
4. 保存 `Main.unity`。
5. 点击 Play，确认空场景可以运行。

## 检查点

- 你知道本课程固定使用 Unity 6.3 LTS。
- 你能解释 Hierarchy 和 Project 的区别。
- 你知道 Play 模式修改不一定会保留。
