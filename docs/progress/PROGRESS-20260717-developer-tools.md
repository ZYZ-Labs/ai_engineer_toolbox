# PROGRESS-20260717-developer-tools

## 当前状态

- 当前主任务：按 `docs/plans/PLAN-20260717-developer-tools.md` 新增 17 个开发者工具（三批全量）。
- 当前阶段：已完成并验证通过。
- 当前结论：全站工具数 11 → 28，分类从 `Crypto | Data` 扩展为 `Crypto | Data | Text | Generator | Converter`。

## 本轮改动

- `packages/utils/src/index.ts`：新增 16 组契约函数（diffText、convertCase、escapeString/unescapeString、runRegex、decodeJwt、hashBuffer、parseUrl、calcDate、parseCron、convertBase、convertColor、yamlToJson/jsonToYaml、generateUuids、generatePasswords）。
- `packages/utils/src/index.test.ts`：新增 51 条 Vitest 用例（总 56 条）。
- `apps/web/src/lib/tool-registry.ts`：`ToolCategory` 扩展为 5 类；注册 17 个新工具。
- `apps/web/src/components/tools/ToolWorkbench.tsx`：`executeTool` 新增 12 个通用分支；file-hash 支持任意文件哈希（`hashBuffer`）；color 工具输出区新增色板预览。
- `apps/web/src/components/tools/custom/`：新建 UuidWorkbench、PasswordWorkbench、MarkdownWorkbench（复用 `src/lib/markdown.ts` + `MarkdownRenderer`）、QrWorkbench（qrcode-generator，UTF-8 安全编码）、KeygenWorkbench（WebCrypto RSA-OAEP/ECDSA/ECDH 导出 JWK）+ `index.ts` 注册表。
- `apps/web/src/app/tools/[...slug]/ToolPageClient.tsx`：按 `customWorkbenches` 路由自定义组件。
- `apps/web/src/app/tools/page.tsx`：分类列表扩展为 5 类。
- `apps/web/src/lib/i18n/dict.ts` + `lib/i18n/tool.ts`：17 个工具双语条目、3 个新分类名、15 个新操作名、自定义组件全部 UI 文案。
- 依赖：`js-yaml@^4.1.0`（packages/utils）、`qrcode-generator@^2.0.4`（apps/web，自带类型）。均为 MIT、零/极小传递依赖。
- 文档：README 工具数与分类、AGENTS.md registry/utils 描述、agent-context 主任务与验证入口同步更新。

## 验证结果

- 已执行（根目录）：
  - `npm run test` → Vitest 56/56 通过。
  - `npm run typecheck` → web + utils 全部通过，0 错误。
  - `npm run lint` → eslint `--max-warnings=0` 通过，0 错误 0 警告。
  - `npm run build` → 静态导出成功，188 页；`/tools/[...slug]` 共 28 条路径。
  - 路由冒烟：构建产物 `apps/web/out/tools/` 下 17 条新路由的 `index.html` 全部存在（17/17）。
- 未执行：浏览器人工逐页验收（17 个页面的交互未逐一手工点击）；Worker API 无改动未联调。
- 证据：上述命令输出、构建日志（`✓ Generating static pages (188/188)`）。

## 风险与限制

- QR 编码未设置 ECI：已用 TextEncoder 做 UTF-8 字节级编码，绝大多数扫码器默认 UTF-8 可正确解码中文，极端旧设备可能有乱码风险。
- cron 解析器仅支持标准 5 段语法（不支持 `L`/`W`/`#`），已在工具 explanation 中注明。
- File Hash 全量读入内存，explanation 已注明大文件限制；切换算法后需重新选择文件（与 base64/image 交互一致）。
- `translateTool` 不翻译 `secondaryInputLabel/secondaryPlaceholder`（沿用现有 jsonDiff 行为，未改动）。
- decodeJwt 的签名验证仅覆盖 HS256/384/512（crypto-js 可算），RS/ES 系列显示为 not checked。

## 下一步

- 如需人工验收：逐页打开 17 个新工具核对中英文案与交互。
- 后续可考虑：时区转换增强、CSV↔JSON、图片格式转换（本轮明确不做）。

## 追加（2026-07-17）：解码支持 bytes→hex 输出

- 起因：用户反馈解码需要支持 byte 转 hex 的特殊类型（二进制解码结果输出为文本会乱码）。
- 计划：`docs/plans/PLAN-20260717-decode-hex-output.md`。
- 改动：仅 `ToolWorkbench.tsx`。AES/DES/SM4 的 decrypt 新增输出编码选项 text（默认）/base64/hex；Base64 Text 的 decode 新增 text（默认）/hex。utils 层本就支持这些编码，未改动。
- 验证：`npm run typecheck` 0 错误、`npm run lint` 0 警告、`npm run test` 56/56、`npm run build` 188 页成功。
- 未执行：浏览器人工确认下拉框交互（逻辑路径复用已测试的 utils 函数）。

## 追加（2026-07-17 第二轮）：QR 解码 + 工具输出双语 + 交互改进

- 起因：用户 4 项反馈——缺 QR 解码（需选择+粘贴图片）、工具输出只有英文、进制转换要源/目标双选择、日期加减要数字+单位（负数为减）。
- 计划：`docs/plans/PLAN-20260717-qr-decode-and-tool-i18n.md`。
- 改动：
  - 新工具 `/tools/qr/decode`（Data 分类，第 29 个工具）：自定义 `QrDecodeWorkbench`，支持文件选择 + 剪贴板粘贴（截图 Ctrl/Cmd+V），jsQR 本地解码，图片预览 + 结果复制。新依赖 `jsqr@1.4.0`（MIT，自带类型）。
  - utils 新增 `Lang` 类型；`diffText`/`runRegex`/`parseUrl`/`calcDate`/`parseCron`/`convertBase` 增加可选 `lang` 参数，workbench 透传 UI 语言，输出标签中英双语。
  - `convertBase` 签名变更：`(input, fromBase, toBase, lang)`，输出单行目标进制结果；workbench 新增通用 `secondaryAlgorithms` 下拉（From/To base）。
  - `calcDate` 签名变更：`options { zone, unit, lang }` 对象；add 改为有符号数字 + 单位（seconds/minutes/hours/days/weeks），负数为减；删除 "2w 3d" 时长串格式。
  - date-calc 时区下拉标签改为 dict `workbench.timezone`（原硬编码 Algorithm）。
  - 新增 dict：`workbench.fromBase/toBase/unit/timezone`、`unit.*`（5 个单位）、`tool.qrDecode.*`（含组件 UI 文案），en+zh。
- 验证：`npm run test` 63/63（新增 7 条中文/新签名断言）、`npm run typecheck` 0 错误、`npm run lint` 0 警告、`npm run build` 189 页成功、`/tools/qr/decode` 路由产物存在。
- 未执行：浏览器人工验收（粘贴图片解码 QR 的实际交互未在浏览器中点击验证）；utils 抛出的错误信息仍为英文（计划内不做）。
