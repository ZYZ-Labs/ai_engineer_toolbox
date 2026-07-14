# 第 24 章：实战：AI 辅助重构后端服务

## 学习目标

- 通过一次完整重构练习，把前面章节的 prompt-first、上下文工程、AI 工具、审查、验证串起来。
- 掌握“小步快跑、频繁验证”的 AI 辅助重构节奏。
- 学会用 AI 生成重构计划、执行重构、补充测试、做回归验证。
- 建立重构前、中、后的 checkpoint 习惯。

## 24.1 重构目标：一个“典型遗留”订单服务

假设你负责一个老旧的订单服务，代码能跑，但债务累累：

```python
# orders.py（重构前）
import json
from datetime import datetime
from db import get_conn

def create_order(data):
    conn = get_conn()
    cur = conn.cursor()
    items = json.dumps(data['items'])
    total = 0
    for i in data['items']:
        total += i['price'] * i['qty']
    cur.execute(
        "INSERT INTO orders (user_id, items, total, status, created_at) VALUES (?, ?, ?, ?, ?)",
        (data['user_id'], items, total, 'pending', datetime.now())
    )
    conn.commit()
    order_id = cur.lastrowid
    cur.close()
    conn.close()
    return {'id': order_id, 'total': total}

def get_order(order_id):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else None
```

问题清单：

- 没有输入校验。
- 浮点数计算金额，有精度风险。
- 没有错误处理，数据库异常直接抛出。
- 没有事务回滚。
- 单元测试无法写，因为依赖真实数据库连接。
- 混合了数据访问和业务逻辑。

## 24.2 第一步：让 AI 做代码诊断

### Prompt

```text
你是一名资深后端工程师。请审查下面的 Python 代码，列出所有需要重构的问题。
要求：
1. 按严重程度排序。
2. 每个问题包含：位置、问题描述、影响、修复建议。
3. 输出为 Markdown 列表。
```

预期 AI 输出：

```markdown
1. **输入未校验**（create_order 第 8 行）
   - 影响：可能导致数据库插入异常或脏数据。
   - 修复：使用 Pydantic 模型校验输入。

2. **金额使用 float**（create_order 第 11 行）
   - 影响：浮点精度问题。
   - 修复：使用 Decimal。

3. **缺少事务回滚**（create_order 第 15 行）
   - 影响：异常时数据不一致。
   - 修复：使用 try/finally 或上下文管理器。

4. **数据库连接硬编码**（全局 get_conn）
   - 影响：无法单元测试。
   - 修复：依赖注入。

5. **数据访问与业务逻辑混合**
   - 影响：难以维护和测试。
   - 修复：拆分 Repository 和 Service。
```

## 24.3 第二步：与 AI 一起制定重构计划

```text
请为下面的订单服务制定一个分阶段重构计划。
要求：
1. 每个阶段只改一件事，保证可测试、可回滚。
2. 每个阶段列出：目标、改动文件、验证方式、风险。
3. 优先解决数据一致性和可测试性问题。
```

推荐计划：

| 阶段 | 目标 | 改动 | 验证 |
|------|------|------|------|
| 1 | 引入输入校验 | 添加 Pydantic schema | 单元测试校验边界 |
| 2 | 拆分 Repository | 抽离 orders/repository.py | mock repository 测试 service |
| 3 | 拆分 Service | 抽离 orders/service.py | 单元测试覆盖业务逻辑 |
| 4 | 修复金额精度 | float → Decimal | 断言精确值 |
| 5 | 添加事务与异常处理 | 上下文管理器、自定义异常 | 集成测试异常路径 |
| 6 | 补充 API 层 | FastAPI 路由、依赖注入 | API 测试 |

## 24.4 第三步：AI 生成新结构

### Prompt

```text
请根据下面的要求，生成重构后的订单服务代码结构。

要求：
1. 使用 FastAPI。
2. 使用 Pydantic 做输入校验。
3. 使用 Decimal 处理金额。
4. 拆分 Repository、Service、Router 三层。
5. Repository 依赖注入，便于测试 mock。
6. 输出文件：schemas.py、repository.py、service.py、router.py、exceptions.py。
```

AI 生成后，人工需要逐项检查：

- 字段命名是否与数据库一致？
- 异常类型是否覆盖业务场景？
- 依赖注入是否便于测试？
- 是否保留了原有行为？

## 24.5 第四步：分阶段验证

### 阶段 1：Schema 校验

```python
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator
from typing import List

class OrderItem(BaseModel):
    product_id: str = Field(..., min_length=1)
    price: Decimal = Field(..., gt=0, decimal_places=2)
    qty: int = Field(..., gt=0)

class OrderCreateRequest(BaseModel):
    user_id: str = Field(..., min_length=1)
    items: List[OrderItem] = Field(..., min_length=1)

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, v):
        if not v:
            raise ValueError("items cannot be empty")
        return v
```

### 阶段 2：Repository 层

```python
from decimal import Decimal
from typing import Optional
import json

class OrderRepository:
    def __init__(self, conn):
        self.conn = conn

    def create(self, user_id: str, items_json: str, total: Decimal) -> int:
        with self.conn:
            cur = self.conn.cursor()
            cur.execute(
                "INSERT INTO orders (user_id, items, total, status, created_at) VALUES (?, ?, ?, ?, datetime('now'))",
                (user_id, items_json, str(total), "pending"),
            )
            return cur.lastrowid

    def get_by_id(self, order_id: int) -> Optional[dict]:
        cur = self.conn.cursor()
        cur.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
        row = cur.fetchone()
        return dict(row) if row else None
```

### 阶段 3：Service 层

```python
from decimal import Decimal
import json
from .repository import OrderRepository
from .schemas import OrderCreateRequest
from .exceptions import OrderNotFoundError

class OrderService:
    def __init__(self, repo: OrderRepository):
        self.repo = repo

    def create_order(self, req: OrderCreateRequest) -> dict:
        total = sum(item.price * item.qty for item in req.items)
        items_json = json.dumps([item.model_dump() for item in req.items])
        order_id = self.repo.create(req.user_id, items_json, total)
        return {"id": order_id, "total": str(total), "status": "pending"}

    def get_order(self, order_id: int) -> dict:
        row = self.repo.get_by_id(order_id)
        if not row:
            raise OrderNotFoundError(f"Order {order_id} not found")
        return row
```

### 阶段 4：Router 层

```python
from fastapi import APIRouter, Depends, HTTPException
from .schemas import OrderCreateRequest
from .service import OrderService
from .repository import OrderRepository
from .database import get_db
from .exceptions import OrderNotFoundError

router = APIRouter(prefix="/orders", tags=["orders"])

def get_order_service(conn = Depends(get_db)):
    return OrderService(OrderRepository(conn))

@router.post("/", status_code=201)
def create_order(req: OrderCreateRequest, service: OrderService = Depends(get_order_service)):
    return service.create_order(req)

@router.get("/{order_id}")
def get_order(order_id: int, service: OrderService = Depends(get_order_service)):
    try:
        return service.get_order(order_id)
    except OrderNotFoundError:
        raise HTTPException(status_code=404, detail="Order not found")
```

## 24.6 第五步：补充测试

```python
from decimal import Decimal
from unittest.mock import MagicMock
import pytest
from service import OrderService
from schemas import OrderCreateRequest
from exceptions import OrderNotFoundError

def test_create_order_calculates_total():
    repo = MagicMock()
    repo.create.return_value = 1
    service = OrderService(repo)

    req = OrderCreateRequest(
        user_id="u1",
        items=[{"product_id": "p1", "price": "10.00", "qty": 2}],
    )
    result = service.create_order(req)

    assert result["id"] == 1
    assert result["total"] == "20.00"
    repo.create.assert_called_once()

def test_get_order_not_found():
    repo = MagicMock()
    repo.get_by_id.return_value = None
    service = OrderService(repo)

    with pytest.raises(OrderNotFoundError):
        service.get_order(999)
```

## 24.7 第六步：回归验证

```python
# regression_test.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_and_get_order():
    resp = client.post("/orders/", json={
        "user_id": "u1",
        "items": [{"product_id": "p1", "price": "10.00", "qty": 2}],
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["total"] == "20.00"

    get_resp = client.get(f"/orders/{data['id']}")
    assert get_resp.status_code == 200
    assert get_resp.json()["total"] == "20.00"
```

## 24.8 重构 Checklist

| 阶段 | 检查项 | 是否完成 |
|------|--------|----------|
| 重构前 | 是否有现成测试覆盖原有行为？ | |
| 重构前 | 是否备份了原代码或创建了新分支？ | |
| 重构中 | 每次改动是否都只改一个职责？ | |
| 重构中 | 是否运行测试并确保通过？ | |
| 重构后 | 原有 API 行为是否保持一致？ | |
| 重构后 | 是否有新增的边界测试？ | |
| 重构后 | 性能是否有明显退化？ | |

## 24.9 常见错误

- **错误 1**：一次性让 AI 重构所有文件。结果：错误难定位，回滚困难。
- **错误 2**：没有先写测试就重构。结果：无法判断新实现是否正确。
- **错误 3**：重构时改变接口行为。结果：上游调用方报错。
- **错误 4**：忽略异常路径。结果：新代码在异常时表现更差。
- **错误 5**：重构后不跑回归测试。结果：漏掉与原有行为的差异。

## 24.10 本章练习

1. 选一个你项目中的“遗留模块”，用本章方法做一次 AI 辅助重构。
2. 为重构前的模块写 3 个行为测试，确保它们能在重构后继续通过。
3. 让 AI 生成重构计划，然后人工筛选出合理的阶段顺序。
4. 记录重构过程中 AI 犯的 3 个错误，以及你是如何发现和修正的。

## 检查点

- 你能制定分阶段、可回滚的 AI 辅助重构计划。
- 你会在重构前建立测试基线。
- 你能用 AI 生成代码，但人工控制重构节奏。
- 你能在重构后做回归验证，确保行为一致。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\15-ai-backend-generation`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/15-ai-backend-generation`
