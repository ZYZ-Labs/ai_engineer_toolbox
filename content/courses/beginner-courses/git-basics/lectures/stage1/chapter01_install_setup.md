# 第 1 章：安装、配置与第一条命令

## 学习目标

- 明白 Git 是本地版本控制工具，不等于 GitHub。
- 完成姓名、邮箱、默认分支名和编辑器配置。
- 能用 `git --version`、`git config --list` 检查环境。
- 建立第一条安全习惯：命令执行前先看当前目录。

## 1.1 Git 到底解决什么问题

新手常把 Git 理解成“代码上传工具”。这个理解会带来很多误操作。Git 的核心任务是记录项目文件在不同时间点的快照，让你能回答三个问题：我改了什么，为什么改，能不能回到以前。

GitHub、GitLab、Gitea 是远端托管平台。Git 本身在你的电脑上也能完整工作。即使没有网络，你也可以初始化仓库、提交历史、创建分支和回退错误。

| 名词 | 新手解释 | 是否必须联网 |
|------|----------|--------------|
| Git | 本地版本控制程序 | 否 |
| repository | 一个被 Git 管理的项目仓库 | 否 |
| commit | 一次可追溯的项目快照 | 否 |
| remote | 远端仓库地址 | 是，协作时需要 |
| GitHub | 常见的远端托管平台 | 是 |

## 1.2 安装检查

安装完成后先打开终端。Windows 可以用 Git Bash、PowerShell、Command Prompt 或 VS Code 终端；macOS 和 Linux 可以用系统终端。

```bash
git --version
```

看到类似下面的输出，说明 Git 可用：

```txt
git version 2.x.x
```

如果提示找不到命令，优先检查安装时是否把 Git 加入 PATH。Windows 新手建议重新运行安装程序，选择让 Git 可从命令行访问。PowerShell 和 Command Prompt 都应该能运行 `git --version`；如果只有 Git Bash 能运行，通常说明 PATH 没配好。

Windows 终端选择建议：

| 终端 | 适合场景 | 注意点 |
|------|----------|--------|
| Git Bash | 跟随 Linux/macOS 风格教程 | 支持 `pwd`、`ls`、`touch` |
| PowerShell | Windows 日常开发和 VS Code 默认终端 | 命令别名多，但脚本语法不同 |
| Command Prompt | 老项目、批处理脚本、部分工具文档 | 用 `dir`、`cd`、`type` 等命令 |

## 1.3 第一次全局配置

Git 每次提交都会记录作者信息。这里不是登录账号，只是写入提交历史的名字和邮箱。

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
```

如果你使用 VS Code，可以把默认编辑器配置为：

```bash
git config --global core.editor "code --wait"
```

检查配置：

```bash
git config --global --list
```

你至少应该看到 `user.name`、`user.email`、`init.defaultbranch`。大小写显示不同不是问题。

## 1.4 新手必须养成的目录习惯

Git 命令通常作用于“当前目录所在仓库”。执行命令前先确认自己在哪里。

Git Bash / macOS / Linux：

```bash
pwd
ls
```

PowerShell：

```powershell
cd
dir
```

cmd：

```bat
cd
dir
```

创建练习目录时，不同终端可以这样写：

Git Bash / macOS / Linux：

```bash
mkdir -p ~/Projects/git-lab
cd ~/Projects/git-lab
```

PowerShell：

```powershell
mkdir "$HOME\Projects\git-lab"
cd "$HOME\Projects\git-lab"
```

cmd：

```bat
mkdir "%USERPROFILE%\Projects\git-lab"
cd /d "%USERPROFILE%\Projects\git-lab"
```

如果你在错误目录执行 `git init`，Git 会把不该管理的目录变成仓库。发现误操作时不要急着删除文件，先确认只删除 `.git` 目录会有什么影响。

## 1.5 本章练习

1. 打开终端，运行 `git --version`。
2. 配置 `user.name`、`user.email`、`init.defaultBranch`。
3. 运行 `git config --global --list`，确认配置存在。
4. 新建一个空文件夹 `git-lab`，进入它，运行 `pwd`、`cd` 或 `dir` 确认位置。

## 检查点

- 你能说清楚 Git 和 GitHub 的区别。
- 你知道提交记录里的姓名邮箱来自哪里。
- 你知道在执行 Git 命令前先确认当前目录。
