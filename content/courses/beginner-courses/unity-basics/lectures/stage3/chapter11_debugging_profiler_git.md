# 第 11 章：调试、Profiler 与 Git

## 学习目标

- 用 Console 和断点排查问题。
- 初步使用 Profiler 观察性能。
- 设置 Unity 项目的 Git 忽略规则。
- 知道哪些 Unity 文件必须提交。

## 11.1 Console 排错顺序

遇到错误先看 Console：

1. 双击错误跳到代码行。
2. 看错误类型，例如 `NullReferenceException`。
3. 检查 Inspector 引用是否绑定。
4. 用 `Debug.Log` 输出关键变量。
5. 修复后清空 Console，再重新运行。

## 11.2 常见错误

| 错误 | 常见原因 |
|------|----------|
| NullReferenceException | 引用没拖、GetComponent 失败 |
| MissingReferenceException | 对象被 Destroy 后还访问 |
| CS0103 | 变量名或方法名拼错 |
| CS0246 | 类型不存在或缺少 using |

## 11.3 Profiler 初步使用

打开 Window -> Analysis -> Profiler。新手先看：

- CPU Usage
- Memory
- Rendering

如果敌人越来越多，CPU 和内存可能上升。先检查是否忘记 Destroy 离屏敌人。

Profiler 不是只给大项目用。小项目也能用它发现对象数量暴涨、脚本 Update 太重等问题。

## 11.4 Unity 项目的 Git

应该提交：

- `Assets/`
- `Packages/`
- `ProjectSettings/`

通常不提交：

- `Library/`
- `Temp/`
- `Obj/`
- `Build/`
- `Logs/`
- `.vs/`

`.gitignore` 示例：

```gitignore
Library/
Temp/
Obj/
Build/
Builds/
Logs/
UserSettings/
.vs/
*.csproj
*.sln
```

注意 `.meta` 文件必须提交。Unity 用 `.meta` 保存资源 GUID，丢失后引用可能断掉。

Windows 下创建 `.gitignore`：

```powershell
New-Item -ItemType File .gitignore
```

```bat
type nul > .gitignore
```

提交前在 PowerShell、Command Prompt 或 Git Bash 中运行：

```powershell
git status
git add .gitignore Assets Packages ProjectSettings
git commit -m "Add Unity project ignore rules"
```

## 11.5 提交节奏

合适的提交：

- Add player movement
- Add enemy prefab and spawner
- Add score UI
- Add Unity project ignore rules

不要把一天所有 Unity 修改一次性提交，尤其不要把资源导入、脚本逻辑、UI 调整混成一大坨。

## 本章练习

1. 故意清空 GameManager 引用，观察错误。
2. 用 Debug.Log 输出 health。
3. 打开 Profiler 看运行时对象变化。
4. 创建 Unity `.gitignore`。
5. 创建一次小提交。

## 检查点

- 你会读 Unity 常见错误。
- 你知道 `.meta` 文件必须提交。
- 你会用 Profiler 做基础观察。
