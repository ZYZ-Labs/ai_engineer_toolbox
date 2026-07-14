# PROGRESS-20260714-rename-time-tool

## 当前状态

- 新增 **Timestamp Converter（时间戳转换器）** 工具已完成。
- 项目已重命名为 **SilverIce Toolbox / 银冰工具箱**，相关文案已同步更新。
- **AI Chat 工具已移除**：`AiChatWorkbench.tsx`、`lib/ai-providers.ts`、注册表条目、i18n key 与分类均已清理。
- 工具分类简化为 `Crypto` 和 `Data`。

## 本轮改动

- 在 `packages/utils/src/index.ts` 新增 `convertTimestamp` 及辅助函数，支持：
  - `now`：输出当前秒/毫秒/微秒时间戳及本地/UTC 时间。
  - `toDate`：将 Unix 时间戳（自动识别秒/毫秒/微秒）转为可读日期。
  - `toTimestamp`：将日期字符串转为秒/毫秒/微秒时间戳。
- 在 `packages/utils/src/index.test.ts` 补充时间戳转换单元测试。
- 在 `apps/web/src/lib/tool-registry.ts` 注册新工具 `/tools/time/timestamp`，分类 `Data`，图标 `Clock`。
- 在 `apps/web/src/lib/i18n/dict.ts` 补充中英文文案与操作翻译（`op.now` / `op.toDate` / `op.toTimestamp`）。
- 在 `apps/web/src/lib/i18n/tool.ts` 添加工具 key 映射。
- 在 `apps/web/src/components/tools/ToolWorkbench.tsx` 的 `executeTool` 中处理新工具路径。
- 移除 `apps/web/src/components/tools/AiChatWorkbench.tsx`、`apps/web/src/lib/ai-providers.ts` 及相关的工具注册、i18n 文案和首页分类展示。

## 验证结果

- `npm run test`：5 个测试全部通过。
- `npm run typecheck`：全部 workspace 通过。
- `npm run build`：静态导出成功，生成 131 个页面，包含 `/tools/time/timestamp`，不包含 `/tools/ai/chat`。
- `npm run lint`：已通过（AI Chat 相关历史 lint 问题随文件删除一并消失）。

## 风险与限制

- 新工具默认打开 `now` 模式，输入框空置不影响输出。
- 单位选择复用了现有的 `algorithms` 下拉框，UI 标签仍显示为 "Algorithm"；后续如改名或增加通用 "Unit" 字段可再优化。

## 下一步

- 已按用户选择完成重命名、时间戳工具添加与 AI Chat 移除。
- 准备提交并推送。
