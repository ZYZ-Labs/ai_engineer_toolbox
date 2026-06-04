# 第 5 章：合并、冲突与解决顺序

## 学习目标

- 理解 merge 的目标是把另一个分支的提交带到当前分支。
- 能制造并解决一个简单冲突。
- 知道冲突标记的含义。
- 形成冲突处理顺序，而不是看到报错就乱改。

## 5.1 合并前先确认位置

合并命令作用于当前分支。要把 `notes` 合并进 `main`，必须先站在 `main` 上。

```bash
git switch main
git status
git merge notes
```

如果两边修改的是不同文件，Git 通常能自动合并。如果两边改了同一文件同一区域，Git 会暂停，让你人工决定保留哪部分。

## 5.2 制造一个冲突

在 `main` 修改 README 第一行并提交：

```bash
git switch main
echo "main line" > README.md
git add README.md
git commit -m "Change readme on main"
```

新建分支并修改同一行：

```bash
git switch -c conflict-demo HEAD~1
echo "feature line" > README.md
git add README.md
git commit -m "Change readme on feature"
```

回到 `main` 合并：

```bash
git switch main
git merge conflict-demo
```

## 5.3 阅读冲突标记

冲突文件会出现类似内容：

```txt
[current branch: HEAD]
main line
[incoming branch: conflict-demo]
feature line
```

真实文件里会用连续的小于号、等号和大于号标出两边内容。`HEAD` 区域是当前分支内容，下面区域是被合并分支内容。你要把冲突标记删除，并留下最终应该存在的内容。

例如决定保留两行：

```txt
main line
feature line
```

然后完成合并：

```bash
git add README.md
git commit
```

如果 Git 已经生成默认合并提交信息，保存退出即可。

## 5.4 冲突处理顺序

1. 运行 `git status`，确认哪些文件冲突。
2. 打开每个冲突文件，搜索 `<<<<<<<`。
3. 理解两边分别是什么意图。
4. 改成最终正确内容，删除所有冲突标记。
5. 运行测试或至少人工检查。
6. `git add` 已解决文件。
7. `git commit` 完成合并。

## 5.5 不想继续合并怎么办

如果你只是练习或发现方向错了，可以中止当前合并：

```bash
git merge --abort
```

中止前确保没有需要保留的手动修改。`merge --abort` 的目标是尽量回到合并前状态。

## 本章练习

1. 手动制造一次 README 冲突。
2. 用 `git status` 找到冲突文件。
3. 删除冲突标记，保留你认为正确的最终内容。
4. 完成合并提交。
5. 用 `git log --oneline --graph --all` 观察合并历史。

## 检查点

- 你知道合并前必须确认当前分支。
- 你能读懂 `<<<<<<<`、`=======`、`>>>>>>>`。
- 你不会用“全选删除”来逃避冲突，而是先理解两边意图。
