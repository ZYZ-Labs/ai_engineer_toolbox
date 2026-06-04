# 第 3 章：暂存、提交与历史

## 学习目标

- 用 `git diff` 查看未暂存修改。
- 用 `git diff --staged` 查看将要提交的修改。
- 创建第一条清晰提交。
- 用 `git log` 和 `git show` 阅读历史。

## 3.1 提交前先看差异

提交不是“保存文件”。文件保存由编辑器完成，Git 提交是保存一个项目快照。提交前先看差异，能避免把调试代码、误删内容或无关文件放进历史。

查看工作区中还没暂存的变化：

```bash
git diff
```

查看暂存区中准备提交的变化：

```bash
git diff --staged
```

如果命令没有输出，通常表示对应区域没有差异。

## 3.2 创建提交

把文件暂存后提交：

```bash
git add README.md
git commit -m "Add project readme"
```

提交信息要回答“这次改变做了什么”。新手常写 `update`、`fix`、`test`，这些信息以后几乎没用。更好的写法是：

| 不推荐 | 推荐 |
|--------|------|
| update | Add project readme |
| fix bug | Fix login redirect after logout |
| change file | Document Git setup steps |

## 3.3 阅读历史

查看简短历史：

```bash
git log --oneline
```

查看最近一次提交的具体内容：

```bash
git show --stat
git show
```

`git show --stat` 适合先看哪些文件变了，`git show` 适合看具体每一行怎么变。

## 3.4 一次提交应该多大

一次提交最好对应一个完整的小意图。太小会让历史碎片化，太大则很难 review 和回退。

合适的提交：

- 添加 README。
- 修复一个登录错误。
- 新增一个工具入口和对应文案。
- 更新一组同源的测试样本。

不合适的提交：

- 同时改登录、样式、数据库、课程文案。
- 把格式化全仓库和业务修复混在一起。
- 为了省事把一天所有改动一次性提交。

## 3.5 提交后继续修改

提交后再改文件，历史不会自动变化。你需要重新 `git add` 和 `git commit`。

```bash
echo "second note" >> README.md
git diff
git add README.md
git diff --staged
git commit -m "Add second readme note"
```

## 本章练习

1. 为 `README.md` 创建第一次提交。
2. 修改 `README.md`，先运行 `git diff`。
3. 暂存后运行 `git diff --staged`。
4. 创建第二次提交。
5. 用 `git log --oneline` 确认现在有两条历史。

## 检查点

- 你知道提交前看 diff，而不是盲目 commit。
- 你能写出描述行为的提交信息。
- 你知道提交历史是项目沟通材料，不只是备份。
