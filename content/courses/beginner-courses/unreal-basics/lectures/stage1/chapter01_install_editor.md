# 第 1 章：安装 Unreal Engine 5.7 与编辑器

## 学习目标

- 知道本课程固定基于 **Unreal Engine 5.7**。
- 会通过 Epic Games Launcher 安装引擎。
- 能创建第三人称模板项目。
- 认识 Level Editor、Viewport、Outliner、Details、Content Browser、Output Log。

## 1.1 版本基线

本课程固定使用 **Unreal Engine 5.7**。Epic 官方文档有 Unreal Engine 5.7 文档分支和 5.7 Release Notes。本课程的界面、Blueprint、Gameplay Framework 说明都以 5.7 为基线。

不要用 Preview 版跟做本课程。Unreal 大版本之间编辑器、模板、插件和默认设置可能变化，新手先锁定一个版本更容易排错。

## 1.2 安装

安装路线：

1. 安装 Epic Games Launcher。
2. 打开 Unreal Engine 标签。
3. 在 Library 中安装 Unreal Engine 5.7。
4. 确认有足够磁盘空间。

Unreal 安装体积较大。建议把引擎和项目放在空间充足的 SSD 上。

## 1.3 创建项目

创建项目：

| 设置 | 建议 |
|------|------|
| Template | Games -> Third Person |
| Blueprint/C++ | Blueprint |
| Starter Content | On |
| Raytracing | Off |
| Project name | `UnrealDodgeStarter` |

本课程先用 Blueprint，不要求你一开始写 C++。

## 1.4 认识编辑器

| 区域 | 用途 |
|------|------|
| Viewport | 查看和编辑关卡 |
| Outliner | 当前 Level 中的 Actor 列表 |
| Details | 选中 Actor 或 Component 的属性 |
| Content Browser | 资源、Blueprint、材质、地图 |
| Output Log | 日志和错误 |
| Toolbar | Play、Build、Save、Modes |

Unreal 中，一个可放进 Level 的对象通常叫 Actor。

## 1.5 保存地图

创建目录：

```txt
Content/
  Blueprints/
  Maps/
  UI/
  Materials/
  Audio/
```

保存当前地图：

```txt
Content/Maps/Main.umap
```

在 Project Settings -> Maps & Modes 中把 Editor Startup Map 和 Game Default Map 设置为 `Main`。

## 常见错误

- 用 5.6 或 5.8 Preview 跟做 5.7 课程，模板和选项不同。
- 没保存 Map，重开项目后改动消失。
- 把资源全放在 Content 根目录，后面很难管理。
- Output Log 有红色错误但继续做。

## 本章练习

1. 安装 Unreal Engine 5.7。
2. 创建 Blueprint Third Person 项目。
3. 创建 `Content/Maps` 和 `Content/Blueprints`。
4. 保存 `Main.umap`。
5. 点击 Play，确认角色能移动。

## 检查点

- 你知道课程固定使用 Unreal Engine 5.7。
- 你知道 Level 中可放置对象通常叫 Actor。
- 你知道默认地图要在 Maps & Modes 中设置。
