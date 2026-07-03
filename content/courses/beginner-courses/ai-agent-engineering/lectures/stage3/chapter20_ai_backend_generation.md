# 第 20 章：AI 生成后端代码：从接口到测试

## 学习目标

- 掌握用 AI 生成后端代码的完整流程：需求 → Schema → API → 测试。
- 学会用 prompt 约束输出，让模型生成可直接落地的代码。
- 理解 OpenAPI、Pydantic、Prisma、SQLAlchemy 等常见后端 schema 工具与 AI 的协作方式。
- 知道 AI 生成后端代码时的典型陷阱和验证方法。

## 20.1 AI 生成后端代码的标准流程

1. **定义需求**：用自然语言描述业务目标、输入输出、异常场景。
2. **生成数据模型 / Schema**：让 AI 输出数据库表、DTO、验证模型。
3. **生成 API 接口**：基于 schema 生成路由、handler、service。
4. **生成测试**：为正常路径和边界路径生成单元测试、集成测试。
5. **人工审查与集成**：把生成代码合并到项目，运行测试，修复问题。

## 20.2 生成 Schema 的 Prompt 模板

```text
你是一名后端工程师。请根据下面的业务描述，生成 Pydantic 模型和 SQLAlchemy ORM 模型。

业务：
- 订单系统需要记录订单号、用户 ID、商品列表、总价、状态、创建时间、更新时间。
- 状态包括：pending（待支付）、paid（已支付）、shipped（已发货）、completed（已完成）、cancelled（已取消）。
- 商品列表是 JSON 数组，包含 product_id、quantity、unit_price。

要求：
1. Pydantic 模型用于请求/响应校验，字段必须带 description。
2. SQLAlchemy 模型用于数据库映射。
3. 所有金额使用 Decimal。
4. 输出为完整 Python 文件，可直接保存为 models.py。
```

## 20.3 多语言 Schema 生成示例

### Python + Pydantic / SQLAlchemy

```python
from decimal import Decimal
from datetime import datetime
from typing import List, Literal
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Numeric, DateTime, JSON, create_engine
from sqlalchemy.orm import declarative_base

Base = declarative_base()

OrderStatus = Literal["pending", "paid", "shipped", "completed", "cancelled"]

class OrderItem(BaseModel):
    product_id: str = Field(..., description="商品 ID")
    quantity: int = Field(..., ge=1, description="数量")
    unit_price: Decimal = Field(..., gt=0, description="单价")

class OrderCreateRequest(BaseModel):
    user_id: str = Field(..., description="用户 ID")
    items: List[OrderItem] = Field(..., min_length=1, description="商品列表")

class OrderResponse(BaseModel):
    order_no: str = Field(..., description="订单号")
    user_id: str = Field(..., description="用户 ID")
    total_amount: Decimal = Field(..., description="总价")
    status: OrderStatus = Field(..., description="订单状态")
    created_at: datetime = Field(..., description="创建时间")

class OrderORM(Base):
    __tablename__ = "orders"

    order_no = Column(String(32), primary_key=True)
    user_id = Column(String(64), nullable=False)
    items = Column(JSON, nullable=False)
    total_amount = Column(Numeric(18, 2), nullable=False)
    status = Column(String(16), nullable=False, default="pending")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### Node.js + Zod + Prisma

```typescript
// schema.prisma
model Order {
  orderNo     String   @id @map("order_no")
  userId      String   @map("user_id")
  items       Json     @map("items")
  totalAmount Decimal  @map("total_amount") @db.Decimal(18, 2)
  status      String   @map("status") @default("pending")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("orders")
}
```

```typescript
// dto.ts
import { z } from "zod";

export const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

export const OrderCreateSchema = z.object({
  userId: z.string().uuid(),
  items: z.array(OrderItemSchema).min(1),
});

export type OrderCreateRequest = z.infer<typeof OrderCreateSchema>;
```

### Go + Struct Tags

```go
package models

import (
    "time"

    "github.com/shopspring/decimal"
)

type OrderItem struct {
    ProductID string          `json:"product_id" validate:"required,uuid"`
    Quantity  int             `json:"quantity" validate:"required,min=1"`
    UnitPrice decimal.Decimal `json:"unit_price" validate:"required,gt=0"`
}

type Order struct {
    OrderNo     string          `json:"order_no" db:"order_no" validate:"required"`
    UserID      string          `json:"user_id" db:"user_id" validate:"required,uuid"`
    Items       []OrderItem     `json:"items" db:"items" validate:"required,min=1,dive"`
    TotalAmount decimal.Decimal `json:"total_amount" db:"total_amount" validate:"required,gt=0"`
    Status      string          `json:"status" db:"status" validate:"required,oneof=pending paid shipped completed cancelled"`
    CreatedAt   time.Time       `json:"created_at" db:"created_at"`
    UpdatedAt   time.Time       `json:"updated_at" db:"updated_at"`
}
```

### Java + Jakarta Validation

```java
package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @Size(max = 32)
    private String orderNo;

    @NotBlank
    @Size(max = 64)
    private String userId;

    @NotEmpty
    @ElementCollection
    private List<OrderItem> items;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal totalAmount;

    @NotBlank
    @Pattern(regexp = "pending|paid|shipped|completed|cancelled")
    private String status = "pending";

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();
}
```

## 20.4 生成 OpenAPI 规范

```text
你是一名 API 设计师。请根据下面的 Pydantic 模型，生成 OpenAPI 3.0 路径定义。
要求：
1. 使用 YAML 格式。
2. 包含 /orders POST 接口。
3. 为请求体引用 components/schemas/OrderCreateRequest。
4. 响应包含 201 和 422 两种状态码。
5. 不要输出 YAML 以外的文字。
```

```yaml
openapi: 3.0.0
paths:
  /orders:
    post:
      summary: 创建订单
      operationId: createOrder
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OrderCreateRequest'
      responses:
        '201':
          description: 创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrderResponse'
        '422':
          description: 参数校验失败
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationError'
components:
  schemas:
    OrderCreateRequest:
      type: object
      required: [user_id, items]
      properties:
        user_id:
          type: string
          format: uuid
        items:
          type: array
          minItems: 1
          items:
            $ref: '#/components/schemas/OrderItem'
    OrderItem:
      type: object
      required: [product_id, quantity, unit_price]
      properties:
        product_id:
          type: string
          format: uuid
        quantity:
          type: integer
          minimum: 1
        unit_price:
          type: number
          minimum: 0
```

## 20.5 生成测试的 Prompt 模板

```text
你是一名测试工程师。请为下面的 create_order 函数生成 pytest 单元测试。

要求：
1. 使用 pytest 和 unittest.mock。
2. 覆盖正常路径、空商品列表、价格为负、数据库异常。
3. 每个测试函数名称以 test_ 开头。
4. 输出完整 Python 文件，可直接保存为 test_orders.py。
```

```python
import pytest
from unittest.mock import MagicMock, patch
from decimal import Decimal
from services.order_service import create_order

def test_create_order_success():
    db = MagicMock()
    items = [{"product_id": "p1", "quantity": 2, "unit_price": "10.00"}]
    order = create_order(db, user_id="u1", items=items)
    assert order.status == "pending"
    assert order.total_amount == Decimal("20.00")
    db.add.assert_called_once()
    db.commit.assert_called_once()

def test_create_order_empty_items():
    db = MagicMock()
    with pytest.raises(ValueError, match="items cannot be empty"):
        create_order(db, user_id="u1", items=[])

def test_create_order_negative_price():
    db = MagicMock()
    items = [{"product_id": "p1", "quantity": 1, "unit_price": "-5.00"}]
    with pytest.raises(ValueError, match="price must be positive"):
        create_order(db, user_id="u1", items=items)

def test_create_order_db_error():
    db = MagicMock()
    db.commit.side_effect = Exception("DB error")
    items = [{"product_id": "p1", "quantity": 1, "unit_price": "10.00"}]
    with pytest.raises(Exception, match="DB error"):
        create_order(db, user_id="u1", items=items)
```

## 20.6 生成流程中的关键检查点

| 阶段 | AI 输出 | 必须人工检查 |
|------|---------|--------------|
| Schema | 字段、类型、约束 | 业务规则是否完整、枚举值是否正确 |
| API | 路由、状态码、错误处理 | 权限、幂等、并发、日志 |
| 测试 | 用例结构 | 覆盖率、断言强度、mock 是否合理 |
| 集成 | 多文件修改 | 依赖关系、配置变更、迁移脚本 |

## 20.7 常见错误

- **错误 1**：让 AI 直接生成完整项目而不给 schema 约束。结果：输出自由发挥，难以落地。
- **错误 2**：接受 AI 生成的默认字段名而不检查命名规范。结果：与现有代码风格不一致。
- **错误 3**：忽略错误处理。结果：生成的代码只有 happy path。
- **错误 4**：不验证生成的 OpenAPI 是否合法。结果：文档与实现不一致。
- **错误 5**：把 AI 生成的测试当真理。结果：测试可能不触发真实断言。

## 20.8 本章练习

1. 为你的一个业务接口写一段 schema 生成 prompt，并运行至少 3 次对比输出稳定性。
2. 用 AI 生成一个 OpenAPI YAML，然后用 swagger-codegen 或类似工具生成客户端代码。
3. 让 AI 为一个已有函数生成测试，然后运行测试，统计通过率和覆盖率。
4. 对比“一次生成全部文件”和“分阶段生成 schema → API → 测试”两种策略的质量差异。

## 检查点

- 你能用 prompt 让 AI 生成结构化的后端 schema。
- 你知道如何验证 AI 生成的 OpenAPI 规范。
- 你能为 AI 生成的代码设计补充测试和审查清单。
- 你理解 AI 生成后端代码的分阶段验收方法。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\15-ai-backend-generation`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/15-ai-backend-generation`
