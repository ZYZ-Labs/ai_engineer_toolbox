# 第 12 章：Git、Git LFS 与下一步

## 学习目标

- 知道 Unreal 项目哪些文件应该提交。
- 理解为什么需要 Git LFS。
- 建立适合 Unreal 的目录和提交习惯。
- 规划下一步练习项目。

## 12.1 Unreal 项目应该提交什么

通常提交：

- `Config/`
- `Content/`
- `Source/`（如果有 C++）
- `.uproject`

通常不提交：

- `Binaries/`
- `DerivedDataCache/`
- `Intermediate/`
- `Saved/`
- 打包输出目录

`.gitignore` 示例：

```gitignore
Binaries/
DerivedDataCache/
Intermediate/
Saved/
Builds/
.vs/
*.sln
```

## 12.2 为什么需要 Git LFS

Unreal 资源很多是二进制文件，例如：

- `.uasset`
- `.umap`
- 贴图
- 音频
- 模型

普通 Git 不适合频繁管理大二进制文件。Git LFS 会把大文件内容放到 LFS 存储中，仓库里保留指针。

常见 LFS 规则：

```gitattributes
*.uasset filter=lfs diff=lfs merge=lfs -text
*.umap filter=lfs diff=lfs merge=lfs -text
*.fbx filter=lfs diff=lfs merge=lfs -text
*.wav filter=lfs diff=lfs merge=lfs -text
*.png filter=lfs diff=lfs merge=lfs -text
```

Windows 下先确认 Git LFS 可用：

```powershell
git lfs version
git lfs install
```

如果提示 `git: 'lfs' is not a git command`，说明 Git LFS 没安装或 PATH 没生效。重新安装 Git for Windows 时勾选 Git LFS，安装后重开 PowerShell、Command Prompt 或 VS Code 终端再检查。

创建 `.gitattributes`：

```powershell
New-Item -ItemType File .gitattributes
```

```bat
type nul > .gitattributes
```

## 12.3 提交习惯

推荐小步提交：

- Add pickup blueprint
- Add HUD widget
- Add danger spawner
- Configure Unreal Git LFS
- Package v0.1.0 prototype

不要把资源导入、蓝图重构、UI 调整、打包输出混成一次提交。

## 12.4 下一步项目

项目 1：第三人称收集游戏

- 多种 Pickup。
- 倒计时。
- 结束界面。
- 最高分。

项目 2：简单射击原型

- 发射 Projectile。
- 敌人 AI 追踪。
- 生命和伤害。
- 波次生成。

项目 3：小型关卡探索

- 门和钥匙。
- 触发器。
- 材质和灯光。
- 简单过场。

## 12.5 学习路线

继续学习顺序：

1. Blueprint Interface 和 Event Dispatcher。
2. Enhanced Input 深入。
3. AI Controller、Behavior Tree、Navigation。
4. Data Asset 和 Gameplay Tags。
5. C++ 基础。
6. 性能分析和打包优化。

## 常见错误

- 不使用 LFS 管理 `.uasset`，仓库快速膨胀。
- 把 `Saved/`、`Intermediate/` 提交进去。
- 多人同时改同一个 `.umap`，合并困难。
- 一开始就做超大开放世界，无法完成。

## 本章练习

1. 创建 Unreal `.gitignore`。
2. 创建 `.gitattributes` 并配置 LFS。
3. 提交项目配置和核心资源。
4. 给原型打 tag `v0.1.0`。
5. 写下一版计划。

## 检查点

- 你知道 Unreal 二进制资源适合 Git LFS。
- 你知道哪些目录不该提交。
- 你有三个后续练习项目方向。
