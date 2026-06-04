# 第 11 章：打包发布与平台设置

## 学习目标

- 理解 Play In Editor 和 Package 的区别。
- 设置项目默认地图。
- 创建 Windows 或目标平台包。
- 做发布前检查。

## 11.1 打包不是保存项目

Play In Editor 只是编辑器内运行。Package 是把项目烹饪、编译并输出为玩家可运行的版本。

Unreal 打包前会进行 Cook。资源引用断裂、默认地图错误、插件问题都可能在打包阶段暴露。

## 11.2 项目设置

检查 Project Settings：

| 设置 | 建议 |
|------|------|
| Maps & Modes | Game Default Map = Main |
| Project Description | 项目名、版本 |
| Supported Platforms | 只启用目标平台 |
| Packaging | 开发期先 Development，发布再 Shipping |

## 11.3 打包流程

菜单：

```txt
Platforms -> Windows -> Package Project
```

选择项目外目录，例如：

```txt
Builds/UnrealDodgeStarter-Windows
```

不要把构建输出放进 Content。

## 11.4 发布前检查

1. 没有 Blueprint 编译错误。
2. Output Log 没有关键错误。
3. 默认地图正确。
4. UI 能显示。
5. Game Over 能触发。
6. 打包输出可以在新目录启动。
7. 构建目录不提交到 Git。

## 11.5 版本命名

```txt
UnrealDodgeStarter-v0.1.0-windows.zip
```

README 写清楚：

- Unreal Engine 版本：5.7。
- 操作方式。
- 硬件要求。
- 已知问题。

## 常见错误

- 默认地图还是模板地图。
- Blueprint 有编译错误但只在编辑器里没注意。
- 打包目录被 Git 跟踪。
- 使用了未启用平台模块或插件。

## 本章练习

1. 设置默认地图。
2. 清理 Blueprint 编译错误。
3. 打包 Windows Development 版本。
4. 从输出目录运行。
5. 写一份试玩 README。

## 检查点

- 你知道打包会 Cook 资源。
- 你知道默认地图影响包启动结果。
- 你有发布前检查清单。
