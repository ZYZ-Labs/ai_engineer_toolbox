# 第 9 章：.gitignore、stash 与 tag

## 学习目标

- 知道哪些文件不应该进入 Git。
- 会写基础 `.gitignore`。
- 用 `stash` 临时收起未完成修改。
- 理解 tag 适合标记版本点。

## 9.1 为什么需要 .gitignore

项目里有些文件是机器生成的、个人环境相关的或包含秘密信息，不应该进入仓库。例如：

- `node_modules/`
- `dist/`、`build/`、`.next/`
- `.env`
- 操作系统临时文件
- 编辑器本地配置

创建 `.gitignore`：

```bash
touch .gitignore
```

示例内容：

```gitignore
node_modules/
dist/
build/
.env
.DS_Store
```

然后提交：

```bash
git add .gitignore
git commit -m "Add Git ignore rules"
```

## 9.2 已经提交的文件不会被自动忽略

如果一个文件已经被 Git 跟踪，后来写进 `.gitignore` 不会自动停止跟踪。需要：

```bash
git rm --cached .env
git commit -m "Stop tracking local env file"
```

`--cached` 表示只从 Git 跟踪中移除，不删除工作区文件。

## 9.3 stash 临时收起修改

场景：你正在改功能，突然要切分支修一个紧急问题，但当前修改还没到能提交的程度。

```bash
git stash push -m "WIP study card layout"
```

查看 stash：

```bash
git stash list
```

恢复最近一个 stash：

```bash
git stash pop
```

`pop` 会恢复并删除 stash。如果想保留 stash 记录，用：

```bash
git stash apply
```

## 9.4 tag 标记版本

tag 常用于给发布点打标签：

```bash
git tag v1.0.0
git push origin v1.0.0
```

查看 tag：

```bash
git tag
```

带说明的 tag：

```bash
git tag -a v1.0.0 -m "First stable release"
```

## 9.5 常见错误

- 把 `.env` 提交后再加 `.gitignore`，秘密仍然留在历史里。
- 用 stash 长期保存工作，不如及时拆成小提交。
- tag 打错位置时不要急着删远端 tag，先确认是否有人已经使用。

## 本章练习

1. 创建 `.gitignore`，忽略 `tmp/` 和 `.env`。
2. 创建 `tmp/cache.txt`，确认 `git status` 不显示它。
3. 修改 README，用 `git stash push -m` 收起。
4. 切换分支再回来，用 `git stash pop` 恢复。
5. 给当前提交打一个本地 tag。

## 检查点

- 你知道 `.gitignore` 应该尽早写。
- 你知道 `git rm --cached` 可以停止跟踪但保留本地文件。
- 你知道 stash 是临时工具，不是长期任务管理系统。
