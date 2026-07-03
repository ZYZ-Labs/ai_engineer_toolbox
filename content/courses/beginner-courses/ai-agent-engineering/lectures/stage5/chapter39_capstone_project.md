# 第 39 章：综合项目：后端开发助手

## 学习目标

- 完整经历“需求 → 设计 → 代码 → 评审 → 部署”的 Agent 项目周期。
- 能设计一个多工具 Agent 的工作流与安全边界。
- 掌握把 Agent 包装成可部署服务的完整链路。
- 理解“人在回路”对危险操作的重要性。

## 39.1 项目概述

做一个“后端开发助手” Agent：用户用自然语言描述需求，Agent 自动完成数据库建模、API 接口、单元测试，并在人工确认后部署到预发环境。

## 39.2 需求拆解

| 用户故事 | 验收标准 |
|----------|----------|
| 用户输入需求 | Agent 能解析并澄清歧义 |
| 自动生成数据模型 | 输出 SQL / ORM 模型，通过 schema 校验 |
| 自动生成 API 代码 | 输出可运行的 FastAPI / Express / Spring 代码 |
| 自动运行测试 | 测试通过才进入下一步 |
| 人工确认后部署 | 危险操作必须等人审批 |

约束：
- 只能操作指定项目目录。
- 所有写入文件前需备份。
- 部署只能到 staging。

## 39.3 架构设计

```text
用户输入
   │
   ▼
需求澄清（LLM）
   │
   ▼
设计阶段：生成数据模型 + API 草案
   │
   ▼
代码阶段：写入文件（带备份）
   │
   ▼
测试阶段：运行 lint / unit test
   │
   ▼
评审阶段：生成 diff 摘要，等待人工确认
   │
   ▼
部署阶段：推送 staging 并冒烟测试
```

## 39.4 工具设计

```python
TOOLS = {
    "clarify_requirements": {...},
    "design_schema": {...},
    "generate_code": {...},
    "write_file": {"dangerous": True, "requires_backup": True},
    "run_tests": {},
    "generate_diff_summary": {},
    "deploy_staging": {"dangerous": True, "requires_approval": True},
}
```

每个工具声明：
- 输入 schema
- 是否危险
- 是否需要人工确认
- 权限级别

## 39.5 核心代码骨架

```python
import json
from pathlib import Path
from agent import AgentLoop

class BackendDevAssistant:
    def __init__(self, project_dir: str):
        self.project_dir = Path(project_dir)
        self.agent = AgentLoop(tools=self.build_tools())

    def build_tools(self):
        return {
            "write_file": self.write_file,
            "run_tests": self.run_tests,
            "deploy_staging": self.deploy_staging,
        }

    def write_file(self, path: str, content: str):
        target = self.project_dir / path
        if not target.resolve().is_relative_to(self.project_dir.resolve()):
            return {"ok": False, "error": "path outside project"}
        # 备份
        if target.exists():
            backup = target.with_suffix(target.suffix + ".bak")
            backup.write_text(target.read_text(), encoding="utf-8")
        target.write_text(content, encoding="utf-8")
        return {"ok": True}

    def run_tests(self):
        import subprocess
        result = subprocess.run(
            ["pytest", "tests/"], cwd=self.project_dir, capture_output=True, text=True
        )
        return {"ok": result.returncode == 0, "stdout": result.stdout, "stderr": result.stderr}

    def deploy_staging(self):
        if not self.human_approved:
            return {"ok": False, "error": "requires human approval"}
        # 实际部署逻辑
        return {"ok": True, "deployed_to": "staging"}
```

## 39.6 人在回路设计

对 `write_file`、`deploy_staging` 等危险操作，Agent 不直接执行，而是生成“待确认操作”并暂停，等待外部系统或用户确认。

```python
class PendingApproval(Exception):
    def __init__(self, action):
        self.action = action

# 在 AgentLoop 中
if tool.dangerous and not tool.approved:
    raise PendingApproval(tool_call)
```

## 39.7 部署与冒烟测试

部署后必须运行冒烟测试，验证服务健康。

```yaml
# .github/workflows/staging.yml
name: Deploy Staging
on:
  workflow_dispatch:
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build & Deploy
        run: ./scripts/deploy-staging.sh
      - name: Smoke Test
        run: |
          sleep 10
          curl -sf http://staging.api/health
```

## 39.8 本章练习

1. 为“后端开发助手”补充一个 `generate_migration` 工具，并设计其 schema 与安全规则。
2. 实现 `write_file` 的路径校验与备份逻辑，并写单元测试。
3. 设计一个状态机：需求 → 设计 → 编码 → 测试 → 评审 → 部署，要求能暂停等待人工确认。
4. 为部署阶段写 GitHub Actions 工作流，包含构建、部署、冒烟测试三步。

## 检查点

- 你能把端到端 Agent 项目拆成多个阶段和工具。
- 你知道如何为危险操作设计“人在回路”。
- 你能实现路径安全校验与文件备份。
- 你知道如何把 Agent 接入 CI/CD。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\31-capstone-project`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/31-capstone-project`
