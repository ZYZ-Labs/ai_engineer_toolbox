# 第 18 章：Context Engineering：让 AI 真正读懂你的代码库

## 学习目标

- 理解上下文工程的核心问题：模型窗口有限，如何选择和组织上下文。
- 掌握 `.cursorrules`、`AGENTS.md`、`CLAUDE.md` 等配置文件的用途和写法。
- 学会用代码结构摘要、符号索引、embeddings 检索提升 AI 对代码库的理解。
- 避免“把整仓代码贴进 prompt”这种低效的上下文策略。

## 18.1 为什么上下文比 Prompt 更重要

再精妙的 prompt，如果喂给模型的上下文是错的、碎的、过量的，结果也会很差。

AI 编码助手的典型失败场景：

- 模型不知道你的代码风格，生成与现有代码不一致的实现。
- 模型只看到当前文件，忽略了跨模块依赖。
- 模型被塞了过多无关文件，关键信息被淹没。
- 模型不理解你的业务术语，把 `Order` 当成普通单词处理。

Context Engineering 解决的就是：**在有限窗口内，把最相关、最准确的信息，以模型最能理解的形式组织好。**

## 18.2 项目级上下文文件

| 文件 | 工具生态 | 作用 | 内容重点 |
|------|----------|------|----------|
| `.cursorrules` | Cursor | 项目级规则 | 代码风格、框架约定、禁用模式 |
| `AGENTS.md` | 通用 Agent | 智能体协作指南 | 目标、边界、阅读顺序、验证方式 |
| `CLAUDE.md` | Claude Code | Claude 专属上下文 | 项目结构、常用命令、测试入口 |
| `.github/copilot-instructions.md` | GitHub Copilot | Copilot 工作区指令 | 编码规范、测试要求 |

这些文件不是装饰品。它们把“项目常识”从人脑转移到文件，让 AI 每次对话都能自动加载。

## 18.3 `.cursorrules` 示例

```text
# 项目：AI Agent Engineering Toolbox
# 技术栈：Next.js + TypeScript + Cloudflare Workers + D1

## 通用规则
- 所有新代码使用 TypeScript，不使用 any。
- 优先使用函数组件，React 组件默认导出。
- API 路由统一放在 app/api/[...]/route.ts。
- 数据库操作统一封装到 lib/db.ts，不在 route 里直接写 SQL。

## 命名约定
- 文件使用 kebab-case。
- React 组件使用 PascalCase。
- 工具函数使用 camelCase。

## 禁止项
- 不要在代码中硬编码 API key。
- 不要在路由中直接解析用户输入的 JSON，使用 Zod 校验。
- 不要引入新的运行时依赖而不说明理由。
```

## 18.4 `AGENTS.md` 示例

```markdown
# AGENTS.md

## 目标
让后续智能体快速确认当前主任务、系统入口和验证方式。

## 阅读顺序
1. `docs/agent-context.md`
2. `README.md`
3. 当前任务相关的 `docs/plans/*` 和 `docs/progress/*`
4. 入口层、业务层、数据层、测试层

## 代码边界
- `apps/web`：前端 Next.js 应用
- `packages/ui`：共享组件库
- `packages/utils`：共享工具函数
- `content/courses`：课程内容 Markdown

## 验证方式
- 前端改动：npm run dev + 浏览器人工检查
- 后端改动：npm run test
- 文档改动：检查路径和链接
```

## 18.5 `CLAUDE.md` 示例

```markdown
# CLAUDE.md

## 项目结构
- `apps/web`：Next.js 应用
- `packages/ui`：共享 UI 组件
- `packages/utils`：共享工具函数

## 常用命令
- 安装依赖：`npm install`
- 本地开发：`npm run dev`
- 运行测试：`npm run test`
- 构建：`npm run build`

## 测试入口
- 单元测试：`packages/utils/**/*.test.ts`
- 集成测试：`apps/web/tests/integration/**/*.test.ts`

## 注意事项
- 所有 API 调用必须经过 `lib/api-client.ts` 封装。
- 环境变量通过 `process.env` 读取，开发环境使用 `.env.local`。
```

## 18.6 代码库结构摘要

不要直接把 100 个文件贴进 prompt。先让模型看到“地图”。

```text
项目：ai_engineer_toolbox
├── apps/web/           # Next.js 前端
│   ├── app/            # 路由与页面
│   ├── components/     # 业务组件
│   └── lib/            # 工具与 API 客户端
├── packages/ui/        # 共享 UI 组件
├── packages/utils/     # 共享工具函数
├── content/courses/    # 课程 Markdown 内容
├── docs/               # 项目文档
└── scripts/            # 脚本

关键约定：
- API 路由统一在 apps/web/app/api/...
- 共享组件通过 @repo/ui 引入
- 课程章节统一放在 content/courses/beginner-courses/ai-agent-engineering/lectures/
```

## 18.7 符号索引与引用图

对于大型代码库，可以预先构建符号索引：

```python
# symbol_index.py
{
    "create_order": {
        "type": "function",
        "file": "apps/web/app/api/orders/route.ts",
        "line": 23,
        "references": ["lib/order-service.ts", "lib/db.ts"],
        "summary": "创建订单的 API 入口，校验输入并调用 order-service"
    },
    "OrderService": {
        "type": "class",
        "file": "lib/order-service.ts",
        "line": 10,
        "references": ["apps/web/app/api/orders/route.ts"],
        "summary": "订单业务逻辑封装"
    }
}
```

构建索引的方式：

- TypeScript：用 `ts-morph` 解析 AST。
- Python：用 `jedi`、`ast` 或 `tree-sitter`。
- Go：用 `go/ast` 或 `golang.org/x/tools`。
- Java：用 `JavaParser`。

## 18.8 Embeddings 检索上下文

当代码库很大时，用向量检索找到最相关的代码片段。

### Python 示例

```python
from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

def embed(text: str) -> np.ndarray:
    return model.encode(text)

def search(query: str, chunks: list[str], top_k: int = 5):
    query_vec = embed(query)
    chunk_vecs = np.array([embed(c) for c in chunks])
    scores = chunk_vecs @ query_vec
    top_indices = np.argsort(scores)[::-1][:top_k]
    return [chunks[i] for i in top_indices]
```

### Node.js 示例

```typescript
import { pipeline } from "@xenova/transformers";

const embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");

async function embed(text: string): Promise<number[]> {
  const result = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(result.data);
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}
```

### Go 示例

```go
package main

import (
    "context"
    "fmt"

    "github.com/tmc/langchaingo/embeddings"
    "github.com/tmc/langchaingo/llms/openai"
)

func main() {
    llm, err := openai.New()
    if err != nil {
        panic(err)
    }

    embedder, err := embeddings.NewEmbedder(llm)
    if err != nil {
        panic(err)
    }

    vectors, err := embedder.EmbedQuery(context.Background(), "订单创建流程")
    if err != nil {
        panic(err)
    }

    fmt.Printf("向量维度：%d\n", len(vectors))
}
```

### Java 示例

```java
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.embedding.onnx.allminilml6v2.AllMiniLmL6V2EmbeddingModel;

public class CodeSearch {
    public static void main(String[] args) {
        EmbeddingModel model = new AllMiniLmL6V2EmbeddingModel();
        var response = model.embed("订单创建流程");
        System.out.println("向量维度：" + response.content().vector().length);
    }
}
```

## 18.9 上下文组织策略

| 策略 | 适用场景 | 优点 | 缺点 |
|------|----------|------|------|
| 全量代码 | 小项目（<10 文件） | 信息完整 | 窗口占用大、噪音高 |
| 结构摘要 + 相关文件 | 中型项目 | 平衡全面与精炼 | 需要人工挑选相关文件 |
| 符号索引 + 引用追踪 | 大型项目 | 定位精确 | 需要预处理 |
| Embeddings 检索 | 超大型项目 | 自动化、可扩展 | 检索质量依赖分块和模型 |

实际工作中，通常是多种策略组合使用：

1. 先加载项目级上下文文件（`.cursorrules`、`AGENTS.md`）。
2. 再加载当前任务相关的结构摘要。
3. 最后用符号索引或 embeddings 检索定位具体代码片段。

## 18.10 常见错误

- **错误 1**：把整个代码库贴进 prompt。结果：关键信息被稀释，模型漏掉重点。
- **错误 2**：上下文文件写得太长。结果：模型忽略或混淆规则。
- **错误 3**：只给代码不给业务背景。结果：模型生成 technically correct 但业务错误的代码。
- **错误 4**：不同工具的上下文文件互相矛盾。结果：AI 行为不一致。
- **错误 5**：从不更新上下文文件。结果：文件逐渐失效，AI 按旧规则生成代码。

## 18.11 本章练习

1. 为你的项目写一份 `.cursorrules` 或 `AGENTS.md`，限制在 50 行以内。
2. 用 `tree` 命令生成项目结构摘要，挑选 5 个与当前任务最相关的文件。
3. 尝试用 embeddings 检索找到与“订单创建流程”最相关的 3 个代码片段。
4. 对比“全量代码”和“摘要+检索”两种上下文策略下，AI 生成代码的质量差异。

## 检查点

- 你能解释 `.cursorrules`、`AGENTS.md`、`CLAUDE.md` 的区别。
- 你会根据项目规模选择合适的上下文组织策略。
- 你能用代码摘要和符号索引帮助 AI 理解代码库。
- 你了解 embeddings 检索在代码库问答中的基本流程。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\14-prompt-first-dev`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/14-prompt-first-dev`
