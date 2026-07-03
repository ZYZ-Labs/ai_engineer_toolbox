# 第 14 章：LSP + Tree-sitter 构建 Agent 代码能力

## 学习目标

- 理解 Tree-sitter 在代码解析中的作用。
- 掌握 LSP 与 Tree-sitter 的互补关系。
- 能用 Python 解析代码 AST 并提取函数、类、调用关系。
- 能设计一个结合 LSP 和 Tree-sitter 的 Agent 代码分析链路。

## 14.1 为什么 Tree-sitter 还不够

Tree-sitter 可以快速、增量地把源码解析成 AST，但它不知道：

- 某个函数在项目中哪里被调用
- 一个符号的真实类型是什么
- 跨文件的引用关系
- 当前代码是否有类型错误

这些需要 LSP / 类型检查器 / 索引工具来完成。

| 能力 | Tree-sitter | LSP |
|------|-------------|-----|
| 语法解析 | 强，支持多种语言 | 依赖具体 Language Server |
| 速度快 | 毫秒级 | 通常更慢 |
| 跨文件引用 | 弱 | 强 |
| 类型信息 | 无 | 有 |
| 诊断错误 | 无 | 有 |
| 依赖少 | 只需 parser | 需要安装语言 Server |

## 14.2 用 Tree-sitter 解析 Python

```python
from tree_sitter import Language, Parser
import tree_sitter_python as tspython


PY_LANGUAGE = Language(tspython.language())
parser = Parser(PY_LANGUAGE)

code = """
def add(a: int, b: int) -> int:
    return a + b

class Calculator:
    def multiply(self, x, y):
        return x * y
"""

tree = parser.parse(code.encode())
root = tree.root_node


def walk(node, depth=0):
    print("  " * depth + f"{node.type}: {node.text.decode()[:40]!r}")
    for child in node.children:
        walk(child, depth + 1)

walk(root)
```

## 14.3 提取函数和类

```python
def extract_functions_and_classes(tree):
    results = []
    root = tree.root_node

    for node in root.children:
        if node.type == "function_definition":
            name_node = node.child_by_field_name("name")
            results.append({
                "type": "function",
                "name": name_node.text.decode() if name_node else None,
                "start": node.start_point,
                "end": node.end_point,
            })
        elif node.type == "class_definition":
            name_node = node.child_by_field_name("name")
            results.append({
                "type": "class",
                "name": name_node.text.decode() if name_node else None,
                "start": node.start_point,
                "end": node.end_point,
            })
    return results


for item in extract_functions_and_classes(tree):
    print(item)
```

## 14.4 提取函数调用关系

```python
def extract_calls(tree):
    calls = []
    root = tree.root_node

    def walk(node):
        if node.type == "call":
            func = node.child_by_field_name("function")
            if func:
                calls.append(func.text.decode())
        for child in node.children:
            walk(child)

    walk(root)
    return calls

print(extract_calls(tree))
```

## 14.5 结合 LSP 获取跨文件引用

Tree-sitter 负责粗粒度结构，LSP 负责精确语义：

```python
async def analyze_symbol(file_path: str, line: int, character: int, lsp_client):
    # 1. Tree-sitter 快速判断当前节点类型
    code = open(file_path).read()
    tree = parser.parse(code.encode())
    node = tree.root_node.descendant_for_point_range((line, character), (line, character))

    # 2. LSP 获取定义和引用
    definition = await lsp_client.request("textDocument/definition", {
        "textDocument": {"uri": f"file://{file_path}"},
        "position": {"line": line, "character": character},
    })

    references = await lsp_client.request("textDocument/references", {
        "textDocument": {"uri": f"file://{file_path}"},
        "position": {"line": line, "character": character},
        "context": {"includeDeclaration": True},
    })

    return {
        "node_type": node.type if node else None,
        "definition": definition,
        "references": references,
    }
```

## 14.6 设计 Agent 代码分析链路

一个完整的 Agent 代码理解链路可以是：

```
用户问题
   │
   ▼
Tree-sitter 提取候选文件和函数
   │
   ▼
LSP 验证符号定义与引用
   │
   ▼
LLM 生成摘要 / 修改建议 / 测试用例
   │
   ▼
Tree-sitter 校验修改后的语法合法性
   │
   ▼
LSP 验证类型与诊断
```

## 14.7 常见错误

- **错误 1**：只用 Tree-sitter 做跨文件重构，忽略了真实引用关系。
- **错误 2**：用 LSP 做全文扫描，效率远低于 Tree-sitter。
- **错误 3**：Tree-sitter parser 版本与目标语言版本不匹配，导致解析错误。
- **错误 4**：直接信任 AST 节点位置，没有处理编码和换行差异。
- **错误 5**：Agent 修改代码后不做二次解析，提交语法错误的代码。

## 14.8 本章练习

1. 用 Tree-sitter 解析 Lab 11 的 LSP Server 代码，列出所有函数名和类名。
2. 提取某个 Python 文件中所有 `import` 语句，统计第三方依赖数量。
3. 对一个函数调用点，先用 Tree-sitter 找到调用表达式，再用 LSP 获取其定义位置。
4. 设计一个 prompt，让 LLM 根据提取出的函数列表和调用关系生成模块文档。

## 检查点

- 你知道 Tree-sitter 和 LSP 各自擅长什么。
- 你能用 Python 解析代码 AST 并提取函数、类、调用。
- 你能描述一个 Tree-sitter + LSP + LLM 的 Agent 代码分析链路。
- 你知道在 Agent 修改代码后需要再次做语法和类型校验。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\12-lsp-treesitter`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/12-lsp-treesitter`
