# PLAN-20260717-qr-decode-and-tool-i18n

## 背景

用户对 2026-07-17 上线的 17 个新工具提出 4 项反馈：

1. 缺少**二维码解码**工具，且要支持**选择图片 + 粘贴图片**（截图场景）。
2. 工具**输出内容需要中英双语**（如进制转换的输出标签目前只有英文）。
3. 进制转换应改为**选择输入进制 + 目标进制**，输出目标进制结果（现状是选源进制、输出全部四种）。
4. 日期计算器加减时长应改为**数字输入 + 单位选择**，**正数为加、负数为减**（现状是输入 "2w 3d" 时长串）。

## 范围与方案

### 1. 二维码解码（新工具）

- 路径 `/tools/qr/decode`，分类 `Data`，自定义组件 `QrDecodeWorkbench.tsx`（注册进 `components/tools/custom/index.ts`）。
- 引入依赖 `jsqr`（MIT，约 30KB，零传递依赖，自带 TS 类型）：canvas `getImageData` → `jsQR()` → 文本。
- 输入方式：按钮选择图片（`accept="image/*"`）+ `window` paste 事件读取剪贴板图片（截图直接 Ctrl/Cmd+V）。组件卸载时移除监听、revoke objectURL。
- 输出：图片预览 + 解码文本 + 复制按钮；未识别到二维码 / 非图片文件给出 i18n 错误提示。

### 2. 工具输出双语

`packages/utils` 新增 `export type Lang = "en" | "zh"`，以下函数增加可选 `lang` 参数（默认 `"en"`，行为不变）：

| 函数 | zh 输出变化 |
|------|-------------|
| `diffText` | `（无差异）` |
| `runRegex` | `匹配 N: [s, e) ...`、`分组 N:`、`无匹配。` |
| `parseUrl` | `协议/主机/端口/路径/查询参数/锚点`，`（默认）`、`（无）` |
| `calcDate` | `X 天，Y 小时，Z 分钟，W 秒`、`总秒数：N`、`本地时间：` |
| `parseCron` | 字段名 `分钟/小时/日/月/星期`，`每`、`每 N`，`未来 5 次执行时间：` |
| `convertBase` | 标签 `二进制/八进制/十进制/十六进制` |

workbench 从 `useI18n()` 取 `lang` 透传给这些函数。utils 抛出的**错误信息保持英文**（属异常路径，本轮不做，已记入风险）。

### 3. 进制转换：源/目标双选择

- `ToolConfig` 新增通用可选字段：`secondaryAlgorithms?: string[]`、`defaultSecondaryAlgorithm?: string`；workbench 渲染第二个下拉框。
- `convertBase` 签名变更为 `convertBase(input, fromBase, toBase, lang?)`：`fromBase: "Auto"|"2"|"8"|"10"|"16"`（Auto 保留前缀嗅探），`toBase: "2"|"8"|"10"|"16"`，输出单行 `标签: 值`。
- registry：`/tools/convert/base` 增加 `secondaryAlgorithms: ["2","8","10","16"]`，默认目标 16。
- 下拉标签走 dict：`workbench.fromBase`（源进制/From base）、`workbench.toBase`（目标进制/To base）。

### 4. 日期计算器：数字 + 单位，负数为减

- `calcDate` 签名变更为 `calcDate(operation, input, secondary, options?: { zone?: string; unit?: DateUnit; lang?: Lang })`，`DateUnit = "seconds"|"minutes"|"hours"|"days"|"weeks"`。删除 `parseDurationMs` 与 "2w 3d" 时长串格式（同日引入的内部契约，直接替换）。
  - `add`：secondary 为有符号数字（支持小数、负数），unit 默认 days；负数即减。
  - `diff`、`toZone` 语义不变，仅适配 options 传参。
- registry：`/tools/time/date-calc` 增加 `secondaryAlgorithms: ["seconds","minutes","hours","days","weeks"]`（默认 days），仅 `add` 操作时显示；单位选项文案走 dict `unit.*`。
- date-calc 的时区下拉（toZone）标签由硬编码 "Algorithm" 改为 dict `workbench.timezone`。

### 不做

- 不做拖拽上传（用户只提选择+粘贴）。
- 不做 utils 错误信息双语。
- 不改动旧工具（AES/DES 等）的输出内容。

## 改动文件

- `packages/utils/src/index.ts`（上述函数 + Lang 类型）、`index.test.ts`（旧用例适配新签名 + 中文断言）。
- `apps/web/src/lib/tool-registry.ts`（新字段、3 个条目）、`lib/i18n/dict.ts`（新 key 双语）、`lib/i18n/tool.ts`（qrDecode keymap）。
- `apps/web/src/components/tools/ToolWorkbench.tsx`（第二下拉框、lang/unit 透传、标签）。
- `apps/web/src/components/tools/custom/QrDecodeWorkbench.tsx`（新建）+ `custom/index.ts`。
- `apps/web/package.json`：+ `jsqr`。

## 验收

- `npm run test`（含新签名与中文输出断言）、`npm run typecheck`、`npm run lint`、`npm run build` 全部通过。
- 构建产物存在 `/tools/qr/decode/index.html`。
- 文档：PROGRESS 追加、agent-context（29 工具、jsqr 依赖）、README/AGENTS.md 工具数 28 → 29。
