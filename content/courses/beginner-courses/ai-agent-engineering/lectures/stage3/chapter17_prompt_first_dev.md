# 第 17 章：Prompt-First Development：把 Prompt 当作规格说明书

## 学习目标

- 理解 Prompt-First Development 的核心理念：先写 prompt，再写实现。
- 掌握 prompt 模板化技术，避免在代码里硬拼接字符串。
- 学会给 prompt 打版本、做回归测试，像管理代码一样管理 prompt。
- 区分 system prompt、user prompt、few-shot example 的适用场景。

## 17.1 为什么 Prompt 就是 Spec

传统开发流程：

1. 产品经理写 PRD
2. 后端工程师写接口实现
3. 测试工程师写用例

AI 时代的新流程：

1. 用自然语言描述任务目标
2. 用 prompt 约束输入、输出、边界、异常
3. 让模型生成代码 / 数据 / 决策
4. 人做审查、集成、回归

一个写清楚的 prompt 本身就是一份可执行的规格说明：

```text
你是一名严谨的后端工程师。请根据下面的 JSON Schema 生成对应的 Pydantic 模型代码。
要求：
1. 所有字段必须添加 Field(description=...)。
2. 必填字段不加默认值，可选字段使用 Optional[...]。
3. 枚举类型使用 Python Literal。
4. 只输出代码，不要解释。
```

当 prompt 足够清晰时，模型产出的可预测性会大幅提升。

## 17.2 Prompt 模板的三种层级

| 层级 | 示例 | 适用场景 |
|------|------|----------|
| 纯字符串拼接 | `"请总结以下文本：" + text` | 一次性脚本、原型 |
| 模板引擎 | Jinja2、Handlebars、Mustache | 多字段、多语言、可维护项目 |
| 结构化对象 | Pydantic、dataclass、TypeScript interface | 强类型项目、需要校验输入变量 |

**推荐原则**：只要 prompt 里超过两个变量，就应当使用模板引擎或结构化对象。

## 17.3 模板化代码示例

### Python + Jinja2

```python
from jinja2 import Environment, BaseLoader

TEMPLATE = """
你是一名 API 文档生成助手。
请根据下面的函数签名，生成一段 OpenAPI 路径描述。

函数名：{{ function_name }}
参数：{% for p in params %}
- {{ p.name }} ({{ p.type }}): {{ p.description }}
{% endfor %}

输出要求：
1. 使用 YAML 格式。
2. 包含 summary、parameters、responses。
3. 不要添加 YAML 以外的文字。
"""

env = Environment(loader=BaseLoader())
template = env.from_string(TEMPLATE)

prompt = template.render(
    function_name="create_order",
    params=[
        {"name": "user_id", "type": "string", "description": "用户 ID"},
        {"name": "items", "type": "array", "description": "商品列表"},
    ]
)
```

### Node.js + Handlebars

```typescript
import Handlebars from "handlebars";

const template = Handlebars.compile(`
你是一名 API 文档生成助手。
请根据下面的函数签名，生成一段 OpenAPI 路径描述。

函数名：{{functionName}}
参数：{{#each params}}
- {{name}} ({{type}}): {{description}}
{{/each}}

输出要求：
1. 使用 YAML 格式。
2. 包含 summary、parameters、responses。
3. 不要添加 YAML 以外的文字。
`);

const prompt = template({
  functionName: "createOrder",
  params: [
    { name: "userId", type: "string", description: "用户 ID" },
    { name: "items", type: "array", description: "商品列表" },
  ],
});
```

### Go + text/template

```go
package main

import (
    "bytes"
    "text/template"
)

const tmpl = `
你是一名 API 文档生成助手。
请根据下面的函数签名，生成一段 OpenAPI 路径描述。

函数名：{{ .FunctionName }}
参数：{{ range .Params }}
- {{ .Name }} ({{ .Type }}): {{ .Description }}
{{ end }}

输出要求：
1. 使用 YAML 格式。
2. 包含 summary、parameters、responses。
3. 不要添加 YAML 以外的文字。
`

type Param struct {
    Name        string
    Type        string
    Description string
}

func renderPrompt(functionName string, params []Param) (string, error) {
    t := template.Must(template.New("prompt").Parse(tmpl))
    var buf bytes.Buffer
    err := t.Execute(&buf, map[string]any{
        "FunctionName": functionName,
        "Params":       params,
    })
    return buf.String(), err
}
```

### Java + Mustache

```java
import com.github.mustachejava.Mustache;
import com.github.mustachejava.MustacheFactory;
import com.github.mustachejava.DefaultMustacheFactory;

import java.io.StringWriter;
import java.util.List;
import java.util.Map;

public class PromptTemplate {
    public static void main(String[] args) {
        MustacheFactory mf = new DefaultMustacheFactory();
        Mustache mustache = mf.compile("prompt-template.mustache");

        StringWriter writer = new StringWriter();
        mustache.execute(writer, Map.of(
            "functionName", "createOrder",
            "params", List.of(
                Map.of("name", "userId", "type", "string", "description", "用户 ID"),
                Map.of("name", "items", "type", "array", "description", "商品列表")
            )
        ));

        String prompt = writer.toString();
    }
}
```

## 17.4 System Prompt、User Prompt、Few-Shot 的分工

| 类型 | 作用 | 建议长度 |
|------|------|----------|
| System Prompt | 设定角色、全局约束、输出格式 | 稳定、可复用 |
| User Prompt | 具体任务、当前输入 | 每次不同 |
| Few-Shot Examples | 用输入/输出对展示期望行为 | 3-5 个典型例子 |

```python
messages = [
    {
        "role": "system",
        "content": "你是一名后端代码审查助手。只输出安全风险，不输出风格建议。"
    },
    {
        "role": "user",
        "content": template.render(code_snippet=snippet)
    },
    {
        "role": "user",
        "content": "示例：\n输入：user_input = request.GET['name']\n输出：{\"risk\": \"SQL 注入\", \"line\": 1}"
    }
]
```

## 17.5 Prompt 版本管理

Prompt 变更必须可追踪、可回滚。推荐做法：

1. **文件化管理**：每个 prompt 一个 `.md` 或 `.txt` 文件，纳入 git。
2. **版本号命名**：`prompt-v1.md`、`prompt-v1.2.md` 或按 git hash 引用。
3. **回归测试**：为每个 prompt 保存输入/期望输出样本，CI 中运行。
4. **A/B 指标**：同时运行新旧 prompt，对比准确率、成本、延迟。

```python
# prompt_registry.py
PROMPTS = {
    "generate_api": {
        "version": "1.2.0",
        "path": "prompts/generate_api/v1.2.0.md",
        "tests": [
            {"input": "create_order_schema.json", "expected_contains": "class CreateOrderRequest"},
        ],
    }
}

def load_prompt(name: str) -> str:
    meta = PROMPTS[name]
    with open(meta["path"], "r", encoding="utf-8") as f:
        return f.read()
```

## 17.6 Prompt 回归测试

```python
import json
from pathlib import Path

def test_prompt_regression():
    cases = json.loads(Path("tests/prompt_cases.json").read_text())
    prompt = load_prompt("generate_api")
    for case in cases:
        output = llm.call(prompt, case["input"])
        for check in case["assertions"]:
            assert check in output, f"Missing {check} in {case['name']}"
```

把 prompt 测试放进 CI，每次 prompt 改动都能自动验证核心行为是否回归。

## 17.7 常见错误

- **错误 1**：在业务代码里用 `f-string` 拼超长 prompt。结果：可读性差、难维护、难测试。
- **错误 2**：只改 prompt 不改版本号。结果：线上行为变了，却不知道是哪次改动导致的。
- **错误 3**：prompt 里同时塞太多约束。结果：模型漏掉关键要求，输出不稳定。
- **错误 4**：不给输出格式样例。结果：每次输出结构都不一样，下游解析失败。
- **错误 5**：把 system prompt 和 user prompt 混成一条。结果：角色定位模糊，模型容易跑题。

## 17.8 本章练习

1. 选一个你最近写过的 AI 调用，把它的 prompt 抽成 Jinja2/Handlebars/text.template 模板。
2. 为同一个任务写 3 个 system prompt 变体，用固定样本做 A/B 测试。
3. 给某个 prompt 添加版本号、测试用例和加载函数，提交到 git。
4. 尝试把 prompt 中的约束拆分成“必须遵守”和“尽量满足”两类，观察模型表现差异。

## 检查点

- 你能在代码中识别出哪些字符串应该改成 prompt 模板。
- 你能为 prompt 设计 system/user/few-shot 的分层结构。
- 你知道如何给 prompt 做版本管理和回归测试。
- 你理解“prompt 即 spec”对团队协作的意义。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\14-prompt-first-dev`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/14-prompt-first-dev`
