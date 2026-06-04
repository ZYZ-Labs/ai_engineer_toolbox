# 第 8 章：Pull Request 协作流程

## 学习目标

- 理解 Pull Request 是代码评审和合并请求。
- 会从主分支创建功能分支。
- 会保持分支小而清晰。
- 知道 review 修改后如何继续推送。

## 8.1 PR 的基本路线

Pull Request 不是 Git 的核心命令，而是托管平台提供的协作流程。它通常表示：我在一个分支上完成了一组改动，请团队检查后合并到目标分支。

常见路线：

1. 更新本地主分支。
2. 从主分支创建功能分支。
3. 在功能分支提交小步改动。
4. 推送功能分支。
5. 在平台创建 PR。
6. 根据 review 修改并继续推送。
7. CI 通过后合并。

## 8.2 从最新 main 开始

```bash
git switch main
git pull
git switch -c feature/add-study-card
```

分支名最好表达意图。常见前缀：

| 前缀 | 用途 |
|------|------|
| feature | 新功能 |
| fix | 缺陷修复 |
| docs | 文档 |
| chore | 工程杂项 |

## 8.3 提交时保持可 review

一个 PR 可以包含多条提交，但每条提交仍应清晰。不要把无关格式化、临时调试、真实功能混在一起。

提交前检查：

```bash
git status
git diff
git diff --staged
```

推送分支：

```bash
git push -u origin feature/add-study-card
```

## 8.4 根据 review 修改

别人评论后，你继续在同一个分支上修改、提交、推送即可：

```bash
git add .
git commit -m "Address study card review"
git push
```

PR 页面会自动更新。通常不需要关闭重开。

## 8.5 PR 描述怎么写

好的 PR 描述帮助 reviewer 快速判断风险。建议包含：

- 改了什么。
- 为什么改。
- 怎么验证。
- 有什么未覆盖风险。

示例：

```md
## Summary
- Add beginner Git course to Study.
- Register static course routes.

## Verification
- npm run typecheck
- npm run build
```

## 8.6 合并后清理

PR 合并后，回到本地更新主分支：

```bash
git switch main
git pull
git branch -d feature/add-study-card
```

如果远端分支没有自动删除，可以在平台删除，或运行：

```bash
git push origin --delete feature/add-study-card
```

## 本章练习

1. 从 `main` 创建一个 `docs/add-note` 分支。
2. 修改 README 并提交。
3. 推送分支并创建 PR。
4. 在 PR 描述中写明改动和验证。
5. 合并后删除本地分支。

## 检查点

- 你知道 PR 是协作流程，不是本地 Git 的必需步骤。
- 你会从最新主分支创建功能分支。
- 你知道 review 修改继续推到同一分支。
