# 第 23 章：验证 AI 生成的代码：静态分析、测试、人工审查与回归

## 学习目标

- 建立 AI 生成代码的多层验证体系。
- 掌握静态分析、自动化测试、人工审查、回归测试的协同方法。
- 学会设计针对 AI 输出的专项断言和回归样本。
- 理解为什么“AI 写的代码必须比人写的代码审查得更严”。

## 23.1 为什么 AI 代码需要更严的验证

AI 生成代码有三个特殊风险：

1. **看起来对**：代码格式正确、能编译，但业务逻辑 subtly wrong。
2. **不稳定**：同一 prompt 多次运行可能产生不同实现。
3. **隐藏依赖**：AI 可能引入你不需要的库或模式。

因此，AI 代码的验证不能止于“能跑”，必须覆盖静态分析、行为测试、回归对比。

## 23.2 验证四层模型

| 层级 | 工具/方法 | 验证什么 | 成本 |
|------|-----------|----------|------|
| 静态分析 | linter、type checker、SAST | 语法、类型、安全模式、风格 | 低 |
| 单元测试 | pytest、Jest、JUnit | 函数级行为 | 中 |
| 集成测试 | API 测试、DB 测试 | 模块协作、真实依赖 | 中 |
| 回归测试 | 固定样本、diff 对比 | 与基线行为一致 | 高 |

## 23.3 静态分析

### Python

```bash
ruff check .
mypy .
bandit -r src
```

```python
# 示例：bandit 会标记这行
password = "hardcoded_password"  # B105: hardcoded_password_string
```

### Node.js

```bash
npm run lint
npm run type-check
npm audit
```

### Go

```bash
gofmt -l .
golangci-lint run
go vet ./...
```

### Java

```bash
./mvnw spotbugs:check
./mvnw checkstyle:check
./mvnw dependency:check
```

## 23.4 自动化测试

### Python：pytest

```python
def test_create_order_calculates_total():
    items = [
        {"product_id": "p1", "quantity": 2, "unit_price": Decimal("10.00")},
        {"product_id": "p2", "quantity": 1, "unit_price": Decimal("5.50")},
    ]
    order = create_order(user_id="u1", items=items)
    assert order.total_amount == Decimal("25.50")
```

### Node.js：Jest

```typescript
import { calculateTotal } from "./order";

describe("calculateTotal", () => {
  it("calculates total with multiple items", () => {
    const items = [
      { productId: "p1", quantity: 2, unitPrice: 10.0 },
      { productId: "p2", quantity: 1, unitPrice: 5.5 },
    ];
    expect(calculateTotal(items)).toBe(25.5);
  });
});
```

### Go

```go
func TestCalculateTotal(t *testing.T) {
    items := []OrderItem{
        {ProductID: "p1", Quantity: 2, UnitPrice: decimal.NewFromFloat(10.0)},
        {ProductID: "p2", Quantity: 1, UnitPrice: decimal.NewFromFloat(5.5)},
    }
    total := CalculateTotal(items)
    if !total.Equal(decimal.NewFromFloat(25.5)) {
        t.Errorf("expected 25.5, got %s", total.String())
    }
}
```

### Java

```java
@Test
void calculateTotal_withMultipleItems_returnsSum() {
    var items = List.of(
        new OrderItem("p1", 2, new BigDecimal("10.00")),
        new OrderItem("p2", 1, new BigDecimal("5.50"))
    );
    var total = OrderCalculator.calculateTotal(items);
    assertEquals(new BigDecimal("25.50"), total);
}
```

## 23.5 集成测试

```python
import httpx
import pytest

def test_create_order_endpoint(client: httpx.Client):
    resp = client.post("/orders", json={
        "user_id": "u1",
        "items": [{"product_id": "p1", "quantity": 1, "unit_price": "10.00"}],
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "pending"
    assert data["total_amount"] == "10.00"
```

## 23.6 针对 AI 输出的专项断言

AI 输出容易格式不稳定，需要写“结构断言”而非“字符串断言”。

```python
import json

def test_ai_output_structure():
    output = ai_generate_summary(text)
    data = json.loads(output)

    # 结构断言
    assert "summary" in data
    assert isinstance(data["summary"], str)
    assert len(data["summary"]) <= 200

    # 避免脆弱断言
    # assert "xxx" in output  # 不推荐
```

## 23.7 回归测试：固定样本与 diff 对比

```python
from pathlib import Path
import json

REGRESSION_DIR = Path("tests/regression")

def test_prompt_output_regression():
    cases = json.loads((REGRESSION_DIR / "cases.json").read_text())
    for case in cases:
        output = ai_generate(case["input"])
        expected = (REGRESSION_DIR / case["expected_file"]).read_text()
        # 允许微小差异时，使用结构化比较
        assert json.loads(output) == json.loads(expected)
```

回归测试的核心是：**把 AI 输出当作一种需要版本控制的产物**。

## 23.8 人工审查清单

即使测试全过，以下问题仍需人工确认：

| 检查项 | 问题 |
|--------|------|
| 业务语义 | AI 是否误解了某个字段的业务含义？ |
| 权限边界 | 是否遗漏了用户权限、租户隔离？ |
| 并发安全 | 是否有竞态条件、重复提交？ |
| 资源泄漏 | 是否正确关闭连接、释放锁？ |
| 依赖风险 | 新增的依赖是否必要、许可证是否允许？ |
| 可观测性 | 是否添加了日志、指标、追踪？ |
| 回滚能力 | 变更是否能安全回滚？ |

## 23.9 把验证流程自动化

### GitHub Actions 示例

```yaml
name: Verify AI Code
on: [pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Lint
        run: ruff check .
      - name: Type check
        run: mypy .
      - name: Security scan
        run: bandit -r src
      - name: Unit tests
        run: pytest tests/unit
      - name: Integration tests
        run: pytest tests/integration
      - name: Regression tests
        run: pytest tests/regression
```

## 23.10 常见错误

- **错误 1**：只看 AI 输出是否编译通过。结果：逻辑错误被忽略。
- **错误 2**：测试用例全部由 AI 生成。结果：测试可能只覆盖 happy path。
- **错误 3**：用字符串精确匹配 AI 输出。结果：prompt 微调一点就失败。
- **错误 4**：不做回归测试。结果：prompt 或模型升级后行为漂移。
- **错误 5**：把静态分析通过当作品质保证。结果：类型对，业务错。

## 23.11 本章练习

1. 为最近一段 AI 生成的代码，补充至少 3 个单元测试和 1 个集成测试。
2. 配置一个静态分析工具链，并修复它报出的所有问题。
3. 建立一个 AI 输出回归样本库，包含 5 个固定输入和期望输出。
4. 设计一份“AI 代码人工审查清单”，并在团队内试用。

## 检查点

- 你能为 AI 生成代码设计多层验证流程。
- 你会写结构断言而不是脆弱的字符串断言。
- 你能建立并维护 AI 输出回归样本。
- 你理解人工审查在 AI 代码验证中的不可替代性。

## 配套代码

- 本地：`D:\Project\github\agent-labs\labs\16-ai-code-review`
- 在线：`https://github.com/ZYZ-Labs/agent-labs/tree/master/labs/16-ai-code-review`
