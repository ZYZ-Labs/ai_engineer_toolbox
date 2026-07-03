# 第 31 章：实战：代码审查 Agent 流水线

## 学习目标

- 设计一条可落地的代码审查 Agent 流水线。
- 掌握需求解析、代码检索、多专家审查、聚合报告的完整链路。
- 能处理真实代码审查场景：diff 过大、多语言项目、评审标准冲突。
- 建立对审查结果可解释性和可追溯性的工程意识。

## 31.1 流水线总览

代码审查 Agent 的目标不是取代人，而是把“重复性检查”自动化，把“关键风险”高亮出来。

```text
需求/PR 描述 → 代码检索 → 多专家并行审查 → 聚合报告 → 人做最终决策
```

```python
class CodeReviewPipeline:
    def __init__(self, retriever, reviewers, aggregator):
        self.retriever = retriever
        self.reviewers = reviewers
        self.aggregator = aggregator

    def run(self, pr_description: str, repo: str, base: str, head: str) -> dict:
        context = self.retriever.fetch(pr_description, repo, base, head)
        reviews = [r.review(context) for r in self.reviewers]
        return self.aggregator.aggregate(reviews, context)
```

## 31.2 需求解析

从 PR 描述和提交信息中提取审查重点。

```python
def parse_pr_description(text: str) -> dict:
    prompt = f"""从以下 PR 描述中提取：
1. 变更目标
2. 影响范围
3. 需要重点审查的方面（安全、性能、兼容性等）

PR 描述：{text}
返回 JSON。"""
    return json.loads(llm_call(prompt))
```

如果 PR 描述为空，可以让 LLM 从 diff 中反向推断。

## 31.3 代码检索

检索不是简单拿整个仓库，而是聚焦变更和相关上下文。

| 检索策略 | 用途 | 实现方式 |
|----------|------|----------|
| Git diff | 获取本次变更 | `git diff base...head` |
| AST 解析 | 定位函数/类变更 | `tree-sitter`, `ast` |
| 依赖图 | 找到调用方 | `pydeps`, `jdeps` |
| 向量检索 | 找历史相似修改 | embedding + vector DB |

```python
class GitRetriever:
    def fetch(self, repo: str, base: str, head: str) -> list[str]:
        diff = subprocess.check_output(
            ["git", "-C", repo, "diff", f"{base}...{head}"],
            text=True,
        )
        return chunk_by_file(diff)

    def get_callers(self, repo: str, symbol: str) -> list[str]:
        # 简化：用 grep 近似，真实项目用 AST/索引
        return grep_symbol(repo, symbol)
```

## 31.4 多专家审查

每个专家只关注一个维度，输出结构化评审结果。

```python
class SecurityReviewer:
    def review(self, context: ReviewContext) -> Review:
        prompt = f"""你是一名安全专家，审查以下代码变更：
{context.diff}

输出 JSON：{{ "score": 1-10, "issues": [{{ "file", "line", "severity", "description", "suggestion" }}] }}"""
        return Review.parse(llm_call(prompt))

class StyleReviewer:
    def review(self, context: ReviewContext) -> Review:
        # 可结合 linter（flake8, eslint）结果，LLM 只做汇总
        lint_output = run_linter(context.files)
        return Review.parse(summarize_lint(lint_output))

class LogicReviewer:
    def review(self, context: ReviewContext) -> Review:
        prompt = f"""审查以下代码的业务逻辑正确性：...
{context.diff}"""
        return Review.parse(llm_call(prompt))
```

## 31.5 聚合报告

Aggregator 合并多个专家意见，去重、排序、生成最终报告。

```python
class ReportAggregator:
    def aggregate(self, reviews: list[Review], context: ReviewContext) -> dict:
        all_issues = []
        for r in reviews:
            all_issues.extend(r.issues)
        # 去重：按文件+行号+描述哈希
        seen = set()
        unique = []
        for issue in all_issues:
            key = (issue.file, issue.line, issue.description)
            if key not in seen:
                seen.add(key)
                unique.append(issue)
        unique.sort(key=lambda x: (x.severity != "high", x.severity != "medium"))
        return {
            "summary": self.summarize(unique),
            "issues": unique,
            "scores": {r.reviewer: r.score for r in reviews},
        }
```

## 31.6 专家与输出对照

| 专家 | 关注维度 | 输入 | 输出 | 常用工具 |
|------|----------|------|------|----------|
| Security | 注入、越权、敏感信息 | diff + 调用链 | 风险项与修复建议 | Semgrep, LLM |
| Style | 命名、格式、注释 | diff + linter 输出 | 风格问题列表 | flake8, eslint |
| Logic | 算法正确性、边界条件 | diff + 测试用例 | 逻辑缺陷与测试建议 | LLM, 测试框架 |
| Performance | 复杂度、IO、并发 | diff + 依赖分析 | 性能瓶颈 | profiling, LLM |

## 31.7 多语言代码审查示例

TypeScript 审查专家可用 ESLint + LLM：

```typescript
async function styleReview(files: string[]): Promise<Issue[]> {
  const lint = await runESLint(files);
  const summary = await llmSummarize(lint);
  return summary.issues;
}
```

Go 审查可结合 `go vet`：

```go
func runGoVet(paths []string) ([]byte, error) {
    cmd := exec.Command("go", append([]string{"vet"}, paths...)...)
    return cmd.CombinedOutput()
}
```

## 31.8 常见错误与注意事项

- **错误 1**：把整仓库 diff 一次性塞进 LLM，超出上下文窗口。
- **错误 2**：专家标准不统一，导致同一类问题被重复或矛盾地报告。
- **错误 3**：只依赖 LLM，不做静态分析，漏掉明确规则类问题。
- **错误 4**：报告没有定位到文件行号，开发者无法快速修复。
- **错误 5**：不对审查结果做去重，报告冗长，被人忽视。

## 31.9 本章练习

1. 为 SecurityReviewer 增加“敏感信息泄露”专项检查规则。
2. 实现一个按文件分块的 diff 切分策略，确保每块不超过 8k token。
3. 在聚合阶段加入“按严重程度过滤”：只输出 high/medium 级别问题。
4. 运行 Lab 23，完成代码检索、多专家审查与聚合报告。

## 检查点

- 你能画出代码审查 Agent 的完整流水线。
- 你知道代码检索的四种策略及其适用场景。
- 你能设计并行的 Security/Style/Logic 专家 Agent。
- 你能合并多专家输出，生成结构化的最终报告。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\23-code-review-agent`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/23-code-review-agent`
