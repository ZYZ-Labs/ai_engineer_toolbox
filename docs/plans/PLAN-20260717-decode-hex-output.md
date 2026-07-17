# PLAN-20260717-decode-hex-output

## 背景

用户反馈：解码类操作需要支持"byte 转 hex"的特殊输出类型。当前所有解码/解密操作只输出 UTF-8 文本，遇到二进制结果（非文本字节）会产生乱码，无法查看原始字节。

## 现状分析

- `packages/utils` 已完整支持解码输出编码，**无需改动**：
  - `aesDecrypt` / `desDecrypt` / `sm4Decrypt` 的 `outputEncoding` 均支持 `"text" | "base64" | "hex"`。
  - `base64ToBytes` + `bytesToHex` 已导出，可组合出 Base64 → hex。
- 限制在 UI 层（`ToolWorkbench.tsx`）：
  - Output Encoding 下拉框仅在 `operation === "encrypt"` 时渲染。
  - `executeTool` 的 `cryptoOptions` 强制 `operation === "decrypt" ? "text" : outputEncoding`。

## 范围

涉及 4 个已有工具的解码方向：

| 工具 | 操作 | 新增输出选项 |
|------|------|--------------|
| `/tools/crypto/aes` | decrypt | text（默认）/ base64 / hex |
| `/tools/crypto/des` | decrypt | text（默认）/ base64 / hex |
| `/tools/crypto/sm4` | decrypt | text（默认）/ base64 / hex |
| `/tools/base64/text` | decode | text（默认）/ hex |

不改变默认行为（解码默认仍为 text），只增加可选输出类型。加密/编码方向选项不变。

## 改动点（仅 `apps/web/src/components/tools/ToolWorkbench.tsx`）

1. 计算 `outputOptions`：encrypt → registry 的 `outputEncodings`；decrypt → `["text", ...outputEncodings]`；`/tools/base64/text` 的 decode → `["text", "hex"]`。
2. Output Encoding 下拉框在 encrypt / decrypt / base64-decode 时均渲染，选项按上一条；`value` 使用回退保护（当前状态不在选项内时取第一项），避免切换操作后残留非法值。
3. `executeTool`：`cryptoOptions.outputEncoding` 直接透传所选值，移除 decrypt 强制 text 的逻辑；`/tools/base64/text` 分支在 decode 且选 hex 时输出 `bytesToHex(base64ToBytes(input))`。
4. 新增 import：`bytesToHex`、`base64ToBytes`。

不改 registry、不改 utils、不改 i18n（Output Encoding 标签与 Key/IV Encoding 一样本就是英文硬编码）。

## 验收

- `npm run typecheck`、`npm run lint`、`npm run build` 通过。
- `npm run test` 不回归（utils 无改动）。
- 行为确认：AES decrypt 选 hex 输出十六进制；Base64 decode 选 hex 输出十六进制；默认 text 行为与改动前一致。
