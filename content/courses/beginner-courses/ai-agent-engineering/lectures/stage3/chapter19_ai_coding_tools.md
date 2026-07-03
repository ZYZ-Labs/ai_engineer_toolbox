# 第 19 章：AI 编码工具链对比与选型

## 学习目标

- 了解当前主流 AI 编码工具的能力边界和适用场景。
- 能根据任务类型选择 Cursor、Windsurf、Claude Code、Kimi Code 或 GitHub Copilot。
- 理解“编辑器内补全”与“Agent 式任务执行”两种交互范式的差异。
- 知道如何组合多种工具完成复杂开发任务。

## 19.1 工具分类

| 类型 | 代表工具 | 核心交互 | 适合任务 |
|------|----------|----------|----------|
| 代码补全 | GitHub Copilot、Codeium | 行内/函数级补全 | 日常编码、重复代码、样板代码 |
| 编辑器 Agent | Cursor、Windsurf | 多文件编辑、命令执行、终端集成 | 功能开发、重构、Bug 修复 |
| CLI Agent | Claude Code、Kimi Code、Aider | 命令行对话、批量修改、git 集成 | 大型重构、复杂查询、自动化任务 |

## 19.2 各工具特点

### Cursor

- 基于 VS Code 分支，迁移成本低。
- Composer 支持多文件编辑和上下文引用。
- 支持 `.cursorrules` 项目规则。
- 强项：前端开发、全栈功能迭代、快速原型。

### Windsurf

- 强调“Flow”体验，上下文感知较强。
- 对终端和命令执行支持较好。
- 强项：需要频繁运行命令的脚本和后端任务。

### Claude Code

- Anthropic 官方 CLI 工具。
- 擅长长上下文推理和复杂代码库理解。
- 支持 `CLAUDE.md` 项目上下文。
- 强项：大型代码库分析、复杂重构、深度代码审查。

### Kimi Code

- 长上下文窗口是核心卖点（支持超长文件和代码库）。
- 对中文理解和中文代码库支持较好。
- 强项：阅读超长日志、长文档、大规模代码总结。

### GitHub Copilot

- 集成在 VS Code、JetBrains、Vim 等编辑器中。
- 补全速度快，对日常编码提效最明显。
- Agent 能力相对较弱，但 Copilot Chat 和 Copilot Edits 在持续增强。
- 强项：日常编码、单文件补全、测试生成。

## 19.3 选型决策表

| 任务 | 推荐工具 | 理由 |
|------|----------|------|
| 写一个新 API 接口 | Cursor / Windsurf | 多文件编辑，自动生成 schema、handler、test |
| 大型代码库重构 | Claude Code / Kimi Code | 长上下文，能跨模块分析 |
| 快速补全一行代码 | GitHub Copilot | 响应快，打断少 |
| 修复安全漏洞 | Claude Code / Cursor | 推理能力强，可做静态分析 |
| 阅读遗留项目 | Kimi Code / Claude Code | 超长上下文，适合先整体后局部 |
| 前端组件开发 | Cursor | 对 React/TS 生态支持成熟 |
| 写脚本和自动化 | Windsurf / Claude Code | 终端集成好，命令执行自然 |

## 19.4 编辑器内补全 vs Agent 任务执行

### 代码补全模式

```python
def calculate_total_price(items: list[dict]) -> float:
    # 用户输入注释或函数签名，Copilot 自动补全
    total = sum(item["price"] * item["quantity"] for item in items)
    return round(total, 2)
```

特点：
- 被动触发
- 单文件为主
- 适合确定性强的局部代码

### Agent 任务执行模式

```text
用户：帮我在项目中添加一个用户认证中间件，要求：
1. 使用 JWT
2. 保护 /api/admin/* 路由
3. 返回 401 时附带 JSON 错误信息

Agent：
- 读取项目结构
- 创建 middleware/auth.ts
- 修改相关路由
- 运行测试
- 报告结果
```

特点：
- 主动规划和执行
- 跨文件操作
- 适合复杂、多步骤任务

## 19.5 多语言示例：让不同工具做什么

### Python：用 AI 生成 FastAPI 项目

```python
# 提示：使用 FastAPI 创建一个用户 CRUD 服务，包含 Pydantic schema、SQLAlchemy ORM、pytest 测试
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, crud
from .database import SessionLocal

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)
```

### Node.js：用 AI 生成 Express 路由

```typescript
// 提示：为订单服务生成 Express 路由，包含参数校验和错误处理
import { Router } from "express";
import { z } from "zod";
import * as orderService from "../services/orderService";

const router = Router();

const createOrderSchema = z.object({
  userId: z.string().uuid(),
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })),
});

router.post("/", async (req, res, next) => {
  try {
    const dto = createOrderSchema.parse(req.body);
    const order = await orderService.create(dto);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

export default router;
```

### Go：用 AI 生成 HTTP Handler

```go
package handlers

import (
    "encoding/json"
    "net/http"

    "github.com/example/api/services"
)

type CreateUserRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

func CreateUser(svc services.UserService) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        var req CreateUserRequest
        if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
        }
        user, err := svc.Create(r.Context(), req.Email, req.Password)
        if err != nil {
            http.Error(w, err.Error(), http.StatusInternalServerError)
            return
        }
        json.NewEncoder(w).Encode(user)
    }
}
```

### Java：用 AI 生成 Spring Boot Controller

```java
package com.example.demo.controller;

import com.example.demo.dto.CreateUserRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        var user = userService.create(request);
        return ResponseEntity.ok(user);
    }
}
```

## 19.6 工具组合策略

没有一款工具适合所有场景。推荐组合：

- **日常编码**：GitHub Copilot 做补全，Cursor 做功能开发。
- **大型重构**：Claude Code 做整体分析，Cursor 做具体修改。
- **阅读代码**：Kimi Code 做长文档/长代码总结，Cursor 做跳转和修改。
- **自动化脚本**：Claude Code 或 Windsurf 写脚本，CI 运行。

## 19.7 常见错误

- **错误 1**：在大型重构时只用代码补全工具。结果：顾头不顾尾，改漏依赖。
- **错误 2**：对 AI 工具言听计从。结果：引入不必要的依赖或架构风险。
- **错误 3**：不配置项目上下文文件。结果：每次都要重复解释项目规则。
- **错误 4**：在同一个项目里同时使用多个工具的冲突规则。结果：代码风格混乱。
- **错误 5**：把 Agent 工具当成黑箱，不检查中间步骤。结果：误删文件、改错配置。

## 19.8 本章练习

1. 列出你常用的开发任务，为每个任务选择一款最合适的 AI 工具并说明理由。
2. 在你常用的编辑器中配置一个项目级规则文件（`.cursorrules` 或 `CLAUDE.md`）。
3. 用两款不同工具完成同一个简单功能（如生成一个 CRUD 接口），对比输出质量。
4. 记录一次 AI 工具执行失败的经历，分析是人机协作哪一步出了问题。

## 检查点

- 你能说出 Cursor、Windsurf、Claude Code、Kimi Code、GitHub Copilot 的主要差异。
- 你能根据任务类型选择合适的 AI 工具或组合。
- 你理解代码补全和 Agent 任务执行的本质区别。
- 你知道项目级上下文文件对工具表现的重要性。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\14-prompt-first-dev`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/14-prompt-first-dev`
