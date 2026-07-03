# 第 21 章：AI 辅助代码审查：模式、安全与风格

## 学习目标

- 掌握用 AI 做代码审查的 prompt 模式。
- 学会让 AI 专注安全、性能、可维护性等不同审查维度。
- 理解 AI 审查的边界：哪些能交给 AI，哪些必须人工把关。
- 能把 AI 审查集成到 CI 或 pre-commit 流程。

## 21.1 为什么需要 AI 辅助审查

人工审查的瓶颈：

- 大型 PR 阅读耗时。
- 容易漏掉重复性模式问题（如未处理错误、硬编码密钥）。
- 团队规范靠记忆，执行不一致。

AI 审查的优势：

- 快速扫描大量代码。
- 对已知模式敏感（SQL 注入、XSS、未校验输入）。
- 能按给定清单逐项检查。

AI 审查的局限：

- 不理解业务语义。
- 可能误报或漏报。
- 无法判断设计决策的长期影响。

## 21.2 审查维度与 Prompt 模式

| 维度 | 关注点 | Prompt 关键词 |
|------|--------|---------------|
| 安全 | 注入、认证、敏感信息、越权 | “找出安全风险，按 CVSS 评分” |
| 性能 | 循环、查询、并发、内存 | “找出性能瓶颈，给出复杂度分析” |
| 可维护性 | 命名、重复、圈复杂度 | “指出需要重构的函数” |
| 风格 | 规范、格式、一致性 | “检查是否违反项目风格指南” |
| 正确性 | 边界条件、并发、幂等 | “找出逻辑错误和边界漏洞” |

## 21.3 安全审查 Prompt 示例

```text
你是一名安全工程师。请审查下面的代码片段，找出潜在安全风险。

要求：
1. 只输出安全问题，不输出风格建议。
2. 每个问题包含：风险类型、涉及行号、风险说明、修复建议。
3. 如果代码安全，明确输出“未发现明显安全风险”。
4. 输出为 JSON 数组格式。

代码：
{{ code }}
```

预期输出：

```json
[
  {
    "risk_type": "SQL 注入",
    "line": 15,
    "description": "用户输入直接拼接到 SQL 查询中",
    "fix": "使用参数化查询或 ORM"
  }
]
```

## 21.4 多语言安全审查示例

### Python：SQL 注入风险

```python
# 原始代码
@app.get("/users/{name}")
def get_user(name: str, db: Session = Depends(get_db)):
    result = db.execute(f"SELECT * FROM users WHERE name = '{name}'")
    return result.fetchone()
```

AI 审查应指出：
- 第 4 行存在 SQL 注入风险。
- 应使用参数化查询：`db.execute("SELECT * FROM users WHERE name = :name", {"name": name})`。

### Node.js：未校验输入

```typescript
// 原始代码
app.post("/orders", (req, res) => {
  const order = req.body;
  db.orders.create(order);
  res.json(order);
});
```

AI 审查应指出：
- 未校验 `req.body` 结构。
- 应使用 Zod 或 Joi 做 schema 校验。

### Go：错误处理缺失

```go
// 原始代码
func loadConfig(path string) Config {
    data, _ := os.ReadFile(path)
    var cfg Config
    json.Unmarshal(data, &cfg)
    return cfg
}
```

AI 审查应指出：
- `os.ReadFile` 和 `json.Unmarshal` 的错误被忽略。
- 应返回 `error` 或至少记录日志。

### Java：硬编码凭据

```java
// 原始代码
public class ApiConfig {
    public static final String API_KEY = "sk-1234567890abcdef";
}
```

AI 审查应指出：
- 硬编码 API key 属于严重安全风险。
- 应使用环境变量或密钥管理服务。

## 21.5 风格一致性审查

```text
你是一名代码风格审查助手。请检查下面代码是否符合项目规范：
1. 函数使用 camelCase。
2. 类名使用 PascalCase。
3. 常量使用 UPPER_SNAKE_CASE。
4. 不使用 var 声明可推导类型之外的变量。

输出不符合规范的具体位置和修改建议。
```

## 21.6 把 AI 审查集成到 CI

### Python：GitHub Actions 示例

```yaml
name: AI Code Review
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Run AI Security Review
        run: |
          pip install -r scripts/requirements.txt
          python scripts/ai_review.py --diff origin/main...HEAD --focus security
```

```python
# scripts/ai_review.py
import subprocess
import sys
import openai

def get_diff(base: str, head: str) -> str:
    return subprocess.check_output(
        ["git", "diff", f"{base}...{head}"],
        text=True,
    )

def review(diff: str, focus: str) -> str:
    prompt = f"""
你是一名代码审查助手。请重点审查 {focus} 方面的问题。
只输出具体问题，包含文件、行号、风险说明、修复建议。

{diff}
"""
    client = openai.OpenAI()
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=2000,
    )
    return resp.choices[0].message.content

if __name__ == "__main__":
    diff = get_diff(sys.argv[1], sys.argv[2])
    print(review(diff, "security"))
```

### Node.js：pre-commit hook 示例

```javascript
// scripts/ai-review.mjs
import { execSync } from "child_process";
import OpenAI from "openai";

const diff = execSync("git diff --cached").toString();
if (!diff.trim()) process.exit(0);

const client = new OpenAI();
const prompt = `你是一名安全审查助手。请审查以下 git diff，找出安全风险：\n\n${diff}`;

const resp = await client.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.2,
  max_tokens: 2000,
});

console.log(resp.choices[0].message.content);
```

## 21.7 AI 审查的输出格式约定

无论哪个维度，统一输出格式都能降低人工处理成本：

```json
{
  "findings": [
    {
      "file": "src/orders/service.py",
      "line": 42,
      "severity": "high",
      "category": "security",
      "message": "用户输入直接拼接到 SQL 查询中",
      "suggestion": "使用参数化查询"
    }
  ]
}
```

| 字段 | 说明 |
|------|------|
| severity | high / medium / low |
| category | security / performance / style / correctness |
| line | 尽量精确到行号 |
| suggestion | 可执行的修复建议 |

## 21.8 常见错误

- **错误 1**：让 AI 同时审查所有维度。结果：输出冗长，重点不突出。
- **错误 2**：把 AI 审查结果直接当结论。结果：误报被合并，漏报被忽视。
- **错误 3**：不给 AI 提供项目上下文。结果：风格建议与团队规范冲突。
- **错误 4**：AI 审查只跑在 PR 创建时，不在每次提交前。结果：问题发现太晚。
- **错误 5**：审查 prompt 里没有输出格式要求。结果：每次输出结构不同。

## 21.9 本章练习

1. 选一个你最近写的 PR，用 AI 做安全审查，记录它找出的 3 个问题和 2 个误报。
2. 为团队制定一个 AI 审查输出格式标准，并写脚本把 AI 输出解析成 JSON。
3. 在 CI 中添加一个 AI 安全审查步骤，让它只评论 high severity 问题。
4. 对比 AI 审查和人工审查：各花多少时间，各漏掉什么问题。

## 检查点

- 你能为不同审查维度写出清晰的 prompt。
- 你知道如何让 AI 输出结构化审查结果。
- 你能把 AI 审查集成到 CI 或 pre-commit 流程。
- 你理解 AI 审查的边界，不会盲目采信。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\16-ai-code-review`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/16-ai-code-review`
