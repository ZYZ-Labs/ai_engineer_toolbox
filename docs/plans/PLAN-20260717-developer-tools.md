# PLAN-20260717-developer-tools

## 背景

站点已从"AI 应用工程师工具箱"重新定位为面向通用开发者的 local-first 工具箱（SilverIce Toolbox / 银冰工具箱）。现有 11 个工具集中在 Crypto / Data 两类。本轮按已确认的三批建议新增 **17 个工具**，覆盖文本处理、生成器、转换器等通用开发者高频场景。

定位约束（来自 2026-07-17 用户确认）：

- 淡化 AI 色彩，不做 Token 估算、SSE 解析等 AI 专属工具。
- 保持 local-first：全部处理在浏览器完成，不上传用户数据。
- 保持轻量：仅引入 2 个小型第三方依赖（见"依赖评估"）。

## 范围

### 第一批（7 个）

| 工具 | 路径 | 分类 | 实现方式 |
|------|------|------|----------|
| UUID Generator | `/tools/generator/uuid` | Generator | 自定义组件 |
| Password Generator | `/tools/generator/password` | Generator | 自定义组件 |
| Text Diff | `/tools/text/diff` | Text | 通用 workbench |
| Case Converter | `/tools/text/case` | Text | 通用 workbench |
| String Escape | `/tools/text/escape` | Text | 通用 workbench |
| JWT Decoder | `/tools/crypto/jwt` | Crypto | 通用 workbench |
| Markdown Preview | `/tools/text/markdown` | Text | 自定义组件 |

### 第二批（7 个）

| 工具 | 路径 | 分类 | 实现方式 |
|------|------|------|----------|
| Regex Tester | `/tools/text/regex` | Text | 通用 workbench |
| File Hash | `/tools/crypto/file-hash` | Crypto | 通用 workbench（扩展文件分支） |
| Color Converter | `/tools/convert/color` | Converter | 通用 workbench + 色板预览分支 |
| RSA/EC Key Generator | `/tools/crypto/keygen` | Crypto | 自定义组件 |
| URL Parser | `/tools/url/parser` | Data | 通用 workbench |
| Date Calculator | `/tools/time/date-calc` | Data | 通用 workbench |
| Number Base Converter | `/tools/convert/base` | Converter | 通用 workbench |

### 第三批（3 个）

| 工具 | 路径 | 分类 | 实现方式 |
|------|------|------|----------|
| YAML ↔ JSON | `/tools/convert/yaml-json` | Converter | 通用 workbench（js-yaml） |
| QR Code Generator | `/tools/generator/qr` | Generator | 自定义组件（qrcode-generator） |
| Cron Parser | `/tools/time/cron` | Data | 通用 workbench（自实现解析器） |

### 不做

- Token 估算、SSE 解析、Prompt 模板等 AI 专属工具。
- 时区数据库、图片格式转换、CSV 工具等未列入清单的功能。
- 不改动现有 11 个工具的路径、分类与行为。

## 架构决策

1. **分类扩展**：`ToolCategory` 从 `"Crypto" | "Data"` 扩展为 `"Crypto" | "Data" | "Text" | "Generator" | "Converter"`。`/tools` 列表页 `categories` 数组同步扩展。dict 新增 `category.Text / category.Generator / category.Converter` 双语条目。
2. **纯逻辑下沉 `packages/utils`**：所有可测纯逻辑（diff、命名转换、转义、正则、JWT、哈希、URL、进制、颜色、YAML、cron、日期、UUID、密码）放在 `packages/utils/src/index.ts`，并在 `index.test.ts` 配 Vitest 单测。浏览器专属逻辑（canvas、WebCrypto 密钥生成、FileReader）放 web 端组件。
3. **通用 workbench 优先**：12 个工具走现有 `ToolWorkbench` + `executeTool` 分支，复用 operations/algorithms/secondaryInput/acceptsFile/meta 机制。
4. **自定义组件按路径注册**：5 个不适合输入→输出模式的工具使用自定义组件。新增 `apps/web/src/components/tools/custom/index.ts`，导出 `customWorkbenches: Record<string, ComponentType<{ tool: ToolWorkbenchConfig }>>`；`ToolPageClient` 优先渲染自定义组件，否则回退 `ToolWorkbench`。
5. **i18n 全覆盖**：每个工具在 `dict.ts` 增加 `tool.<name>.{title,summary,inputLabel,placeholder,explanation}` 双语条目，`lib/i18n/tool.ts` 的 `toolKeyMap` 同步注册。自定义组件的界面文案一律走 `t()`，禁止硬编码英文字符串。

## utils 函数契约

以下签名固定，web 端按此调用（实现细节可变，签名不可变）：

```ts
// 文本
export function diffText(left: string, right: string): string;
// 基于行的 LCS diff。输出行前缀："  " 相同 / "- " 删除 / "+ " 新增；无差异返回 "(no differences)"。

export type CaseStyle = "camel" | "pascal" | "snake" | "kebab" | "constant" | "lower" | "upper";
export function convertCase(input: string, target: CaseStyle): string;
// 逐行转换；按非字母数字与 camel 边界拆词。

export function escapeString(input: string): string;   // \ " \n \t \r 转义；非 ASCII 保留原样
export function unescapeString(input: string): string; // 反向还原，支持 \uXXXX

export function runRegex(pattern: string, text: string): string;
// pattern 支持 (?ims) 内联标志。输出每个匹配的区间、内容与捕获组；无匹配返回 "No matches."；非法模式抛 Error。

// 加密类
export function decodeJwt(token: string, secret?: string): { output: string; meta: Record<string, string | number> };
// output = JSON.stringify({header, payload, signature}, null, 2)；meta 含 alg、verified("yes"/"no"/"not checked")、expired("yes"/"no"/"unknown")。
// 提供 secret 时用 crypto-js 重算 HMAC-SHA256/384/512 签名并 base64url 比对。畸形 token 抛 Error。

export function hashBuffer(data: ArrayBuffer, algorithm: "MD5" | "SHA-1" | "SHA-256" | "SHA-512"): Promise<string>;
// MD5 走 CryptoJS WordArray；SHA 系列走 crypto.subtle。

// 数据/时间
export function parseUrl(input: string): string;
// 输出 Protocol/Host/Port/Path/Query 参数列表/Hash 的文本。非法 URL 抛 Error。

export function calcDate(operation: "diff" | "add" | "toZone", input: string, secondary: string, zone?: string): string;
// diff：两个日期差（天/时/分/秒分解 + 总秒数）；add：日期 + 时长串（如 "2w 3d 4h 30m"）；toZone：按 IANA 时区名用 Intl 格式化。

export function parseCron(input: string): string;
// 标准 5 段（分 时 日 月 周），支持 * , - / 与三位英文月/周缩写。输出字段描述 + 未来 5 次执行时间（本地时区）。扫描上限 366 天。

// 转换器
export function convertBase(input: string, fromBase: "Auto" | "2" | "8" | "10" | "16"): string;
// BigInt 实现；Auto 识别 0x/0b/0o 前缀，默认十进制。输出 Binary/Octal/Decimal/Hex 四行。非法字符抛 Error。

export function convertColor(input: string): { output: string; meta: { hex: string } };
// 接受 #rgb、#rrggbb、rgb(r,g,b)、hsl(h,s%,l%)。输出 HEX/RGB/HSL 三行；meta.hex 供色板预览。

export function yamlToJson(input: string): string; // js-yaml load → JSON 2 空格缩进
export function jsonToYaml(input: string): string; // JSON.parse → yaml.dump

// 生成器
export type UuidOptions = { count: number; version: "v4" | "v7"; uppercase: boolean; hyphens: boolean };
export function generateUuids(options: UuidOptions): string[];

export type PasswordOptions = { count: number; length: number; lowercase: boolean; uppercase: boolean; digits: boolean; symbols: boolean; excludeAmbiguous: boolean };
export function generatePasswords(options: PasswordOptions): string[];
```

## Web 集成点

1. `apps/web/src/lib/tool-registry.ts`：`ToolCategory` 扩展 + 17 条注册。图标用 lucide-react（首选：Barcode/Dices/QrCode/Diff/CaseSensitive/TextQuote/Regex/FileText/Ticket/FileDigit/KeySquare/Link/CalendarDays/Timer/Calculator/Palette/ArrowLeftRight；若当前版本缺某个图标，选最接近的现有图标）。
2. `apps/web/src/components/tools/ToolWorkbench.tsx`：
   - `executeTool` 新增 12 个分支（按上面契约调用 utils）。
   - 文件分支扩展：`/tools/crypto/file-hash` 时文件选择接受任意类型，`handleFile` 读 ArrayBuffer 调 `hashBuffer`；上传区显示条件从 `operation === "encode"` 泛化（base64/image 保持原行为，file-hash 始终显示上传区）。
   - 输出区为 `/tools/convert/color` 增加色板预览小块（用 `meta.hex`）。
   - operations 新增：`diff(已有)`、`match`、`convert`、`escape(已有)`、`unescape`、`camel`、`pascal`、`snake`、`kebab`、`constant`、`lower`、`upper`、`toJSON`、`toYAML`、`add`、`toZone`、`parse(已有)`、`generate`、`hash(已有)`、`decode(已有)`。
3. `apps/web/src/components/tools/custom/`：5 个自定义组件（UuidWorkbench、PasswordWorkbench、MarkdownWorkbench、QrWorkbench、KeygenWorkbench）+ `index.ts` 注册表。样式沿用现有 panel 类名（`rounded-xl border-line bg-panel` 等）。
   - MarkdownWorkbench 复用 `src/lib/markdown.ts` 的 `parseMarkdown` 与 `components/study/MarkdownRenderer.tsx`，左侧输入右侧实时预览。
   - QrWorkbench 用 qrcode-generator 生成矩阵后绘制 canvas，支持尺寸（128/256/512）与纠错级别（L/M/Q/H）选择、PNG 下载。
   - KeygenWorkbench 用 WebCrypto 生成 RSA-OAEP(2048/4096)、ECDSA(P-256)、ECDH(P-256)，导出 JWK 公私钥分栏展示 + 复制。
4. `apps/web/src/app/tools/[...slug]/ToolPageClient.tsx`：按 `customWorkbenches` 注册表路由。
5. `apps/web/src/app/tools/page.tsx`：`categories` 扩展为 5 类。
6. `apps/web/src/lib/i18n/dict.ts` + `lib/i18n/tool.ts`：全部新条目（双语）。

## 依赖评估

| 包 | 版本 | 用途 | 体积(约) | 许可 | 传递依赖 |
|----|------|------|----------|------|----------|
| `js-yaml` | ^4.1.0 | YAML↔JSON（packages/utils） | 45KB | MIT | 仅 argparse |
| `@types/js-yaml` | ^4 | 类型 | - | MIT | 无 |
| `qrcode-generator` | ^2.0.4 | QR 矩阵生成（apps/web，自带 TypeScript 类型） | 15KB | MIT | 无 |

二者均为成熟小包，无原生模块、无 Node.js 专属 API，符合浏览器安全与轻量要求。不引入其他新依赖。

## 执行步骤

1. 写本计划文档。
2. 修改 `packages/utils/package.json` 与 `apps/web/package.json` 加入上述依赖，根目录 `npm install` 一次。
3. 并行实施两个互不重叠的分片：
   - 分片 A：`packages/utils`（全部契约函数 + 单测）。
   - 分片 B：`apps/web`（registry、i18n、workbench 分支、5 个自定义组件、列表页）。
4. 集中验证并修复问题。
5. 文档同步（见下）。
6. git commit + push（用户已明确授权）。

## 验收标准

- `npm run test`（packages/utils Vitest）全部通过，覆盖所有新函数的正常/边界/异常路径。
- `npm run typecheck` 全部 workspace 通过。
- `npm run lint` 通过（`--max-warnings=0`）。
- `npm run build` 静态导出成功，生成全部 17 个新工具页面。
- 页面冒烟（构建产物含以下路由 HTML）：/tools/generator/uuid、/tools/generator/password、/tools/generator/qr、/tools/text/diff、/tools/text/case、/tools/text/escape、/tools/text/regex、/tools/text/markdown、/tools/crypto/jwt、/tools/crypto/file-hash、/tools/crypto/keygen、/tools/url/parser、/tools/time/date-calc、/tools/time/cron、/tools/convert/base、/tools/convert/color、/tools/convert/yaml-json。
- 全站工具数 11 → 28。

## 文档同步清单

- `README.md`：工具数量与分类描述。
- `AGENTS.md`：registry 条目（11 → 28 工具、5 分类）、依赖说明补充。
- `docs/agent-context.md`：主任务、分类变化、验证入口更新。
- 新建 `docs/progress/PROGRESS-20260717-developer-tools.md`。

## 风险

- lucide-react 版本（0.468）可能缺个别首选图标 → 构建期 typecheck 可发现，替换为现有图标即可。
- cron 自实现解析器边界（如 `L`、`W`、`#` 等扩展语法）不支持 → 在工具 explanation 中明确仅支持标准 5 段语法。
- Ed25519 浏览器支持度不一 → KeygenWorkbench 仅保留 RSA-OAEP / ECDSA / ECDH。
- 大文件 MD5 全量读入内存 → explanation 注明建议文件小于 500MB。
