# 第 10 章：调试、报错与版本控制

## 学习目标

- 会读 Output 和 Debugger。
- 用断点和 print 排查逻辑。
- 知道 Godot 项目应该如何使用 Git。
- 设置适合 Godot 的 `.gitignore`。

## 10.1 先读错误位置

Godot 报错通常会告诉你脚本路径和行号。例如：

```txt
Invalid get index 'text' on base: 'Nil'
res://scripts/hud.gd:12
```

这表示 `hud.gd` 第 12 行访问了一个空对象。常见原因是节点路径错、节点还没 ready、变量没有赋值。

排查顺序：

1. 打开报错脚本和行号。
2. 看这一行访问了哪个变量。
3. 在上一行 `print(variable)`。
4. 检查节点路径和 Inspector 引用。
5. 修完后重新运行。

## 10.2 print 和断点

`print` 适合快速看值：

```gdscript
print("health:", health)
print("enemy scene:", enemy_scene)
```

断点适合暂停运行。点击脚本编辑器行号旁边可以设置断点，运行后 Godot 会在那一行停住。你可以在 Debugger 里查看变量。

不要把大量临时 print 留在最终项目里。调试完成后删掉或改成有意义的日志。

## 10.3 常见 Godot 报错

| 报错方向 | 常见原因 |
|----------|----------|
| Null instance | 节点路径错或导出变量没填 |
| Parser Error | 语法、缩进、冒号、类型写错 |
| Method not found | 方法名拼错或对象类型不对 |
| Signal already connected | 重复连接信号 |
| Cannot instantiate null | PackedScene 没有赋值 |

## 10.4 Godot 项目使用 Git

Godot 场景和资源大多是文本文件，适合 Git 管理。应该提交：

- `project.godot`
- `scenes/**/*.tscn`
- `scripts/**/*.gd`
- 自己创建的 `assets`、`audio`、`ui` 资源

通常不提交：

- `.godot/`
- 导出的构建包
- 临时截图和录屏
- 平台生成的缓存

`.gitignore` 示例：

```gitignore
.godot/
export/
build/
*.tmp
.DS_Store
```

## 10.5 提交节奏

Godot 新手也要小步提交。建议节点结构调整、脚本逻辑、素材导入分开提交。

示例：

```bash
git add scenes/player.tscn scripts/player.gd
git commit -m "Add player movement"
git add scenes/enemy.tscn scripts/enemy.gd
git commit -m "Add enemy spawn behavior"
```

如果一次修改了很多 `.tscn`，提交前打开 diff 看看是否误改了不相关场景。

## 本章练习

1. 故意让 `enemy_scene` 为空运行，阅读错误。
2. 用 `print` 输出玩家生命值变化。
3. 设置一个断点，观察 `_on_enemy_hit_player`。
4. 初始化 Git 仓库并添加 Godot `.gitignore`。
5. 创建一次 “Add player movement” 提交。

## 检查点

- 你会根据报错路径和行号定位问题。
- 你知道 `.godot/` 不应该提交。
- 你会用小提交保护项目进度。
