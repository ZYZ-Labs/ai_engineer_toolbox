# 第 1 章：安装 Godot 4.6.3、版本选择与编辑器

## 学习目标

- 知道本课程固定基于 Godot 4.6.3 stable。
- 能创建一个空项目并运行默认场景。
- 认识 Project Manager、2D、3D、Script、AssetLib、Inspector、Scene、FileSystem。
- 建立保存、运行、查看错误输出的基本习惯。

## 1.1 本课程的版本基线

本课程固定使用 **Godot 4.6.3 stable**。截至本课程编写时，Godot 4.6.3 是 4.6 稳定分支的维护版本，官方发布于 2026-05-20。后续截图、节点名、导出模板和 GDScript 示例都按 Godot 4.6.3 编写。

如果你使用的是 4.5、4.7 beta、dev snapshot 或 Godot 3.x，界面、默认设置、节点行为或导出模板可能不同。为了减少新手排错成本，先安装 4.6.3，完成课程后再考虑升级或迁移。

## 1.2 版本怎么选

新手不要从 beta、dev、master 版本开始。本课程直接选择 **Godot 4.6.3 stable**。维护版本通常用于修复 bug 和平台支持问题，但升级或打开旧项目之前仍应备份项目，或者先用 Git 提交当前状态。

如果你跟随旧教程发现节点名、方法名对不上，很可能是教程基于 Godot 3.x。新项目除非必须兼容旧平台，否则不要为了旧教程退回 3.x。

## 1.3 下载和启动

从官方 Godot 4.6.3 stable 下载页选择你的系统版本。Godot 编辑器通常是一个独立可执行文件，不需要复杂安装。下载后启动，你会看到 Project Manager。

创建项目：

1. 点击 New Project。
2. 项目名填写 `DodgeStarter`。
3. 选择一个空文件夹。
4. Renderer 新手 2D 项目可选择 Compatibility 或 Mobile，普通桌面也可以用 Forward+。
5. 点击 Create & Edit。

不要把项目建在下载目录、桌面临时目录或云同步冲突严重的目录。推荐放在一个固定工作目录里，例如 `Projects/godot/DodgeStarter`。

## 1.4 认识编辑器界面

| 区域 | 用途 |
|------|------|
| Scene | 当前场景的节点树 |
| FileSystem | 项目文件和资源 |
| Inspector | 选中节点的属性 |
| 2D/3D/Script | 不同工作视图 |
| Output | 普通输出和错误 |
| Debugger | 运行时错误、断点、监视 |

新手最常用的是 Scene、Inspector、FileSystem、2D、Script、Output。

## 1.5 创建第一个场景

在 Scene 面板点击 2D Scene，Godot 会创建一个 `Node2D` 根节点。把它重命名为 `Main`。

保存场景：

```txt
res://scenes/main.tscn
```

如果没有 `scenes` 文件夹，先在 FileSystem 里创建。Godot 路径 `res://` 表示项目根目录。

运行当前场景可以点右上角播放按钮。如果提示没有 main scene，选择当前 `main.tscn` 作为主场景。

## 1.6 新手项目目录建议

```txt
res://
  scenes/
  scripts/
  assets/
  ui/
  audio/
```

现在先创建 `scenes` 和 `scripts`。后续再按需要添加 `ui`、`audio`。

## 1.7 常见错误

- 场景没有保存就运行，修改看起来消失。
- 运行项目而不是当前场景，结果 Godot 打开了旧主场景。
- 把脚本、场景、图片都堆在根目录，后面很难找。
- 看到红字直接关闭，应该先读 Output 和 Debugger。
- 用 4.7 beta 或 3.x 跟做 4.6.3 课程，遇到差异后误以为自己操作错了。

## 本章练习

1. 创建 `DodgeStarter` 项目。
2. 创建 `scenes/main.tscn`。
3. 把根节点命名为 `Main`。
4. 设置当前场景为主场景并运行。
5. 在项目里创建 `scripts` 文件夹。

## 检查点

- 你能说出 `res://` 代表项目根目录。
- 你知道主场景决定点击运行项目时先打开什么。
- 你知道本课程固定使用 Godot 4.6.3 stable。
