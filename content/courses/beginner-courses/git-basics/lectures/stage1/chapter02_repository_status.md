# 第 2 章：仓库、工作区与状态

## 学习目标

- 理解 `.git` 目录、工作区、暂存区、提交历史。
- 能初始化一个本地仓库。
- 能用 `git status` 判断文件处于什么状态。
- 知道新文件、已修改文件、已暂存文件分别是什么意思。

## 2.1 初始化仓库

进入上一章创建的练习目录：

```bash
cd git-lab
git init
```

Git 会创建一个隐藏目录 `.git`。这个目录保存仓库历史、分支指针、配置和内部对象。你的项目文件仍然放在普通目录里。

```bash
ls -a
```

如果看到 `.git`，说明当前目录已经是仓库。不要手动改 `.git` 里的内容，新手阶段只通过 Git 命令操作它。

## 2.2 四个常见区域

| 区域 | 新手理解 | 常见命令 |
|------|----------|----------|
| 工作区 | 你正在编辑的真实文件 | `git status` |
| 暂存区 | 准备放进下一次提交的清单 | `git add` |
| 本地仓库 | 已经提交的历史快照 | `git commit` |
| 远端仓库 | 团队共享的仓库副本 | `git push`、`git pull` |

Git 不会自动把所有修改都提交。你需要先选择哪些修改进入暂存区，再提交。这个设计让一次提交可以表达一个清晰意图。

## 2.3 观察状态

创建一个文件：

```bash
echo "# Git Lab" > README.md
git status
```

你会看到 `README.md` 是 untracked file。意思是这个文件在工作区存在，但 Git 还没有开始跟踪它。

把文件加入暂存区：

```bash
git add README.md
git status
```

此时状态会变成 changes to be committed。意思是下一次 `git commit` 会包含这个文件。

## 2.4 修改已暂存文件

继续修改文件：

```bash
echo "first note" >> README.md
git status
```

你可能同时看到 staged 和 not staged。原因是 Git 暂存的是你执行 `git add` 时的文件内容快照，不是文件名。之后又修改的内容不会自动进入暂存区。

如果希望下一次提交包含最新内容，再运行：

```bash
git add README.md
git status
```

## 2.5 常见错误

- 看到 `nothing to commit` 不代表没有文件，代表没有需要提交的新变化。
- `git status` 不会改任何文件，可以频繁运行。
- `git add .` 会加入当前目录下很多文件，新手更适合先用明确文件名。
- 不要把密码、`.env`、构建产物加入暂存区。

## 本章练习

1. 初始化 `git-lab` 仓库。
2. 创建 `README.md`。
3. 运行 `git status`，观察 untracked。
4. 运行 `git add README.md`，观察 staged。
5. 修改文件后再次运行 `git status`，理解为什么同一文件可能出现两次。

## 检查点

- 你知道 `.git` 是仓库数据库，不是普通源码目录。
- 你能解释工作区和暂存区的区别。
- 你遇到不确定状态时会先运行 `git status`。
