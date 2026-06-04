# 第 4 章：分支是怎么工作的

## 学习目标

- 理解分支是指向提交的可移动名字。
- 能创建、切换和删除本地分支。
- 知道 `HEAD` 表示当前所在位置。
- 用分支隔离实验性改动。

## 4.1 为什么需要分支

如果所有人都直接在 `main` 上改代码，未完成的功能、临时试验和线上修复会混在一起。分支让你在不影响主线的情况下工作。

可以把分支理解为一张便签，贴在某个提交上。你在分支上继续提交时，这张便签会移动到最新提交。

```txt
main  -> A -- B
feature -> A -- B -- C
```

这里 `feature` 比 `main` 多一个提交 `C`。

## 4.2 查看和创建分支

查看当前分支：

```bash
git branch
```

创建分支：

```bash
git branch notes
```

切换分支：

```bash
git switch notes
```

创建并立即切换：

```bash
git switch -c experiment
```

旧教程常用 `git checkout -b experiment`。它仍然可用，但 `git switch` 对新手更直观，因为它专门负责切换分支。

## 4.3 HEAD 是什么

`HEAD` 表示你当前站在哪个提交或分支上。通常 `HEAD` 指向当前分支，当前分支再指向某个提交。

```bash
git status
```

输出里的 `On branch notes` 就是在告诉你 `HEAD` 当前跟着 `notes` 分支。

## 4.4 在分支上提交

```bash
git switch -c notes
echo "branch note" >> README.md
git add README.md
git commit -m "Add branch note"
git log --oneline --decorate --graph --all
```

最后一条命令能看到分支图。新手学习分支时建议经常看图，不要只背命令。

## 4.5 删除分支

分支合并完成后可以删除本地分支：

```bash
git branch -d notes
```

如果 Git 提示分支尚未合并，不要立刻用 `-D` 强删。先确认这个分支上的提交是否还需要。

## 本章练习

1. 创建 `notes` 分支。
2. 在 `notes` 上修改 README 并提交。
3. 切回 `main`，观察 README 是否包含刚才的修改。
4. 运行 `git log --oneline --decorate --graph --all`。

## 检查点

- 你能解释分支不是复制整个项目，而是指向提交的名字。
- 你知道新功能、实验和修复应该放在独立分支上。
- 你删除分支前会确认它是否已经合并。
