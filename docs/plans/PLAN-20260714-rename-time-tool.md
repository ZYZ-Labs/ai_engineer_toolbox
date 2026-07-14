# PLAN-20260714-rename-time-tool

## 背景

项目原名 **AI Engineer Toolbox**，现已重命名为 **SilverIce Toolbox / 银冰工具箱**。站点主体工具（加密、编码、JSON、URL、时间戳等）和学习内容已远超“AI 工程”范畴。用户希望：
1. 重新命名项目，淡化 AI 色彩。
2. 新增一个**时间/时间戳转换工具**。

## 命名候选

候选名兼顾英文展示和中文语境，按中性、简短、可品牌化排序：

| # | 英文名 | 中文名 | 说明 |
|---|--------|--------|------|
| 1 | **DevToolbox** | 开发者工具箱 | 直白、通用，现有域名 `toolbox.silvericekey.fun` 仍可自然对应。 |
| 2 | **ByteKit** | 字节工具箱 | 短、有技术感，突出字节/编码/数据类工具。 |
| 3 | **LocalForge** | 本地工坊 | 强调 local-first，适合工具集合与课程内容。 |
| 4 | **SilverIce Toolbox** | 银冰工具箱 | 直接借用现有域名品牌 `silvericekey`，迁移成本低。 |
| 5 | **Payload Workshop** | 负载工坊 | 偏向请求体/数据调试，但学习课程（Git、Godot 等）关联度稍弱。 |
| 6 | **CraftBin** | 工匠箱 | 简洁、有品牌感，不绑定具体技术。 |

> 已选定 **SilverIce Toolbox / 银冰工具箱**。正在替换 `README.md`、站点文案、`package.json` 描述、`AGENTS.md` 等。

## 时间戳工具设计

### 功能

- **当前时间（now）**：输出当前时间戳（秒 / 毫秒 / 微秒）及本地、UTC 时间。
- **转日期（toDate）**：输入 Unix 时间戳，输出本地与 UTC 可读时间。
- **转时间戳（toTimestamp）**：输入日期字符串，输出对应时间戳。
- **单位选择**：Auto / Seconds / Milliseconds / Microseconds。

### 路径

`/tools/time/timestamp`

### 分类

`Data`

### 涉及文件

- `packages/utils/src/index.ts`：新增 `convertTimestamp` 及辅助函数。
- `packages/utils/src/index.test.ts`：新增单元测试。
- `apps/web/src/lib/tool-registry.ts`：注册工具，使用 `Clock` 图标。
- `apps/web/src/lib/i18n/dict.ts`：新增 `tool.timeConverter.*` 与 `op.toDate` / `op.toTimestamp` / `op.now`。
- `apps/web/src/lib/i18n/tool.ts`：在 `toolKeyMap` 中映射新工具。
- `apps/web/src/components/tools/ToolWorkbench.tsx`：在 `executeTool` 中处理 `/tools/time/timestamp` 分支。

### 验收

- `npm run test` 通过。
- `npm run typecheck` 通过。
- `npm run build` 成功。
- 访问 `/tools/time/timestamp` 可看到“当前时间 / 转日期 / 转时间戳”三种模式并正常输出。
