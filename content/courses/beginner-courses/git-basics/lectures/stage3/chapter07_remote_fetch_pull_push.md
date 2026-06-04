# 第 7 章：remote、fetch、pull、push

## 学习目标

- 理解 remote 是远端仓库地址的别名。
- 区分 `fetch` 和 `pull`。
- 能把本地分支推送到远端。
- 知道推送被拒绝时先拉取和理解差异。

## 7.1 remote 是什么

远端仓库通常叫 `origin`，但 `origin` 只是一个名字。它指向一个 URL。

```bash
git remote -v
```

如果没有远端，可以添加：

```bash
git remote add origin https://github.com/your-name/git-lab.git
```

这一步只记录地址，不会自动上传代码。

## 7.2 第一次推送

把当前分支推送到远端，并建立上游关系：

```bash
git push -u origin main
```

`-u` 的意思是把本地 `main` 和远端 `origin/main` 关联起来。以后在这个分支上可以直接运行：

```bash
git push
git pull
```

## 7.3 fetch 和 pull 的区别

`fetch` 只下载远端变化，不自动改你的当前分支：

```bash
git fetch origin
```

下载后可以看远端分支：

```bash
git log --oneline --decorate --graph --all
```

`pull` 等于先 fetch，再把远端变化整合进当前分支：

```bash
git pull
```

新手在不确定远端发生了什么时，可以先 `fetch`，看清楚再决定 merge 或 rebase。

## 7.4 推送被拒绝

如果别人已经推送了新提交，你的 `git push` 可能被拒绝。不要立刻强推。先运行：

```bash
git fetch origin
git status
git log --oneline --decorate --graph --all
```

如果只是需要整合远端变化：

```bash
git pull
git push
```

如果产生冲突，按第 5 章处理。

## 7.5 不要随便 force push

`git push --force` 会改写远端分支历史，可能让队友的本地仓库混乱。团队项目中，如果确实需要强推，至少使用：

```bash
git push --force-with-lease
```

它会在远端不是你预期状态时拒绝覆盖，比普通 `--force` 安全。但新手阶段最好先找人确认。

## 本章练习

1. 用托管平台创建一个空远端仓库。
2. 给本地 `git-lab` 添加 `origin`。
3. 运行 `git push -u origin main`。
4. 在网页端编辑 README 并提交。
5. 回到本地运行 `git fetch origin`，观察远端变化。
6. 运行 `git pull` 同步。

## 检查点

- 你知道 remote 是 URL 别名，不是另一个 Git 程序。
- 你能解释 fetch 不改当前分支，pull 会整合变化。
- 你不会在推送失败后直接强推。
