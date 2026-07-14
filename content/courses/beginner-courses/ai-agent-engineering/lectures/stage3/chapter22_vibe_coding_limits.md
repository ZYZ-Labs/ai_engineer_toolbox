# 第 22 章：Vibe Coding 的边界：何时让 AI 主导，何时接管

## 学习目标

- 理解 Vibe Coding 的核心含义和适用场景。
- 识别 AI 主导开发时的架构风险和质量风险。
- 建立“人机回环”意识：在关键节点必须人工介入。
- 制定自己的 Vibe Coding 决策 checklist。

## 22.1 什么是 Vibe Coding

Vibe Coding 指开发者用自然语言描述需求，让 AI 工具自动生成、修改、运行代码，人主要负责验证和把控方向。

典型流程：

1. 说需求
2. AI 生成代码
3. AI 运行测试
4. 人看结果
5. 不满意就继续“vibe”

它适合探索、原型、重复性任务，但不等于“不需要思考”。

## 22.2 Vibe Coding 适合做什么

| 任务 | 是否适合 Vibe Coding | 原因 |
|------|----------------------|------|
| 快速原型 | 适合 | 目标明确，失败成本低 |
| 样板代码 | 适合 | 模式固定，AI 出错率低 |
| 单元测试 | 较适合 | 边界条件需要人工补充 |
| API CRUD | 较适合 | 但权限、幂等需要人工检查 |
| 架构设计 | 不适合 | 影响长期可维护性 |
| 安全策略 | 不适合 | 一个错误可能导致严重漏洞 |
| 数据迁移 | 不适合 | 回滚困难，数据不可逆 |
| 核心算法 | 不适合 | 需要严格证明和测试 |

## 22.3 AI 主导时的隐性风险

### 架构风险

- **过度工程**：AI 倾向于引入不必要的抽象层或依赖。
- **一致性问题**：多次 Vibe 会话可能产生风格迥异的代码。
- **债务积累**：快速生成的代码容易形成“能跑但难看懂”的系统。

### 质量风险

- **幻觉测试**：生成的测试用例可能没有真正断言关键行为。
- **边界遗漏**：AI 对极端输入、并发、异常路径考虑不足。
- **安全盲区**：AI 不会主动质疑业务权限模型。

### 认知风险

- **开发者技能退化**：长期依赖 AI，可能失去对底层机制的理解。
- **调试能力下降**：不知道 AI 为什么这么写，出了问题无从修起。
- **责任感模糊**：代码是 AI 写的，但责任在人。

## 22.4 何时让人接管

出现以下情况时，应当暂停 Vibe Coding，人工接管：

1. **涉及持久化数据**：数据库 schema 变更、迁移脚本、核心事务。
2. **涉及安全边界**：认证、授权、加密、密钥管理。
3. **涉及系统级依赖**：引入新框架、中间件、网络拓扑变化。
4. **性能敏感路径**：高并发、大数据量、实时性要求高的代码。
5. **测试无法覆盖**：AI 生成的测试全部通过，但你心里没底。
6. **输出与预期有偏差**：连续三轮 Vibe 都没能收敛到目标。

## 22.5 人机回环的关键节点

```text
需求描述 → AI 生成 → 人工审查 → AI 修改 → 人工验证 → 合并/部署
              ↑_________________↓
```

每个节点的人工职责：

| 节点 | 人工职责 |
|------|----------|
| 需求描述 | 明确边界、约束、验收标准 |
| AI 生成 | 检查生成代码是否偏离目标 |
| 人工审查 | 安全、架构、风格、业务正确性 |
| AI 修改 | 给出具体、可执行的反馈 |
| 人工验证 | 运行测试、检查日志、做人工验收 |
| 合并/部署 | 确认变更范围、回滚方案、监控指标 |

## 22.6 Vibe Coding 决策 Checklist

在让 AI 主导之前，先回答这 5 个问题：

1. **失败成本有多高？** 高成本任务必须人工设计。
2. **能否用测试验证正确性？** 不能自动验证的不能交给 AI。
3. **我能否解释 AI 生成的每一行代码？** 不能解释的代码不应合并。
4. **这个改动是否可回滚？** 不可逆操作需要人工审批。
5. **是否有现成模式可以参考？** 模糊任务 AI 容易自由发挥。

## 22.7 代码示例：AI 生成的代码需要人工补强

### AI 生成版本

```python
@app.post("/orders")
def create_order(req: OrderRequest):
    order = Order(**req.dict())
    db.session.add(order)
    db.session.commit()
    return {"id": order.id}
```

问题：
- 没有幂等控制，重复提交会产生重复订单。
- 没有事务隔离说明。
- 没有权限校验。
- 没有返回完整订单信息。

### 人工接管后

```python
from fastapi import HTTPException, Depends
from sqlalchemy.exc import IntegrityError

@app.post("/orders", response_model=OrderResponse)
def create_order(
    req: OrderRequest,
    current_user: User = Depends(get_current_user),
):
    # 幂等：使用客户端传入的 idempotency_key
    existing = db.session.query(Order).filter_by(idempotency_key=req.idempotency_key).first()
    if existing:
        return existing

    if req.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        order = Order(**req.dict(), status="pending")
        db.session.add(order)
        db.session.commit()
        return order
    except IntegrityError:
        db.session.rollback()
        raise HTTPException(status_code=409, detail="Order already exists")
```

## 22.8 建立团队的 Vibe Coding 规范

建议写入 `AGENTS.md` 或团队 wiki：

```markdown
## Vibe Coding 规范

### 允许 AI 直接修改
- 纯函数实现
- 单元测试补充
- 日志、注释、文档
- 非核心 CRUD 接口

### 必须人工审查
- 数据库 schema 变更
- 认证/授权逻辑
- 外部依赖引入
- 涉及资金、数据安全的代码

### 禁止 AI 单独处理
- 生产环境配置修改
- 数据库迁移脚本执行
- 密钥、证书操作
- 跨服务架构调整
```

## 22.9 常见错误

- **错误 1**：对复杂系统全程 Vibe Coding。结果：架构腐烂，债台高筑。
- **错误 2**：把“测试通过”当作“代码正确”。结果：边界漏洞流入生产。
- **错误 3**：不审查 AI 引入的依赖。结果：项目体积膨胀，许可证风险。
- **错误 4**：让 AI 直接修改生产配置。结果：配置漂移，故障难定位。
- **错误 5**：团队没有统一的 Vibe 边界。结果：有人激进、有人保守，代码质量参差。

## 22.10 本章练习

1. 列出你最近 5 个开发任务，判断哪些适合 Vibe Coding，哪些不适合。
2. 为你的团队写一份 Vibe Coding 边界规范，包含允许、必须审查、禁止三类。
3. 找一段 AI 生成的代码，标记出需要人工接管和补强的 3 个位置。
4. 模拟一次“连续三轮 Vibe 都没收敛”的场景，写出你会如何切换到人工模式。

## 检查点

- 你能清晰定义 Vibe Coding 的适用范围。
- 你知道 AI 主导开发时的主要风险类型。
- 你能在关键节点判断是否需要人工接管。
- 你能制定团队级的 Vibe Coding 规范。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\15-ai-backend-generation`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/15-ai-backend-generation`
