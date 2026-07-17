import type { ToolConfig, ToolCategory } from "@/lib/tool-registry";
import type { DictKey } from "./dict";

type T = (key: DictKey) => string;

const toolKeyMap: Record<string, { title: DictKey; summary: DictKey; inputLabel: DictKey; placeholder: DictKey; explanation: DictKey; secretLabel?: DictKey; ivLabel?: DictKey }> = {
  "/tools/crypto/aes": {
    title: "tool.aes.title",
    summary: "tool.aes.summary",
    inputLabel: "tool.aes.inputLabel",
    placeholder: "tool.aes.placeholder",
    explanation: "tool.aes.explanation",
    secretLabel: "tool.aes.secretLabel",
    ivLabel: "tool.aes.ivLabel",
  },
  "/tools/crypto/des": {
    title: "tool.des.title",
    summary: "tool.des.summary",
    inputLabel: "tool.des.inputLabel",
    placeholder: "tool.des.placeholder",
    explanation: "tool.des.explanation",
    secretLabel: "tool.des.secretLabel",
    ivLabel: "tool.des.ivLabel",
  },
  "/tools/crypto/sm4": {
    title: "tool.sm4.title",
    summary: "tool.sm4.summary",
    inputLabel: "tool.sm4.inputLabel",
    placeholder: "tool.sm4.placeholder",
    explanation: "tool.sm4.explanation",
    secretLabel: "tool.sm4.secretLabel",
    ivLabel: "tool.sm4.ivLabel",
  },
  "/tools/crypto/hash": {
    title: "tool.hash.title",
    summary: "tool.hash.summary",
    inputLabel: "tool.hash.inputLabel",
    placeholder: "tool.hash.placeholder",
    explanation: "tool.hash.explanation",
  },
  "/tools/crypto/hmac": {
    title: "tool.hmac.title",
    summary: "tool.hmac.summary",
    inputLabel: "tool.hmac.inputLabel",
    placeholder: "tool.hmac.placeholder",
    explanation: "tool.hmac.explanation",
    secretLabel: "tool.hmac.secretLabel",
  },
  "/tools/json/formatter": {
    title: "tool.jsonFormatter.title",
    summary: "tool.jsonFormatter.summary",
    inputLabel: "tool.jsonFormatter.inputLabel",
    placeholder: "tool.jsonFormatter.placeholder",
    explanation: "tool.jsonFormatter.explanation",
  },
  "/tools/json/diff": {
    title: "tool.jsonDiff.title",
    summary: "tool.jsonDiff.summary",
    inputLabel: "tool.jsonDiff.inputLabel",
    placeholder: "tool.jsonDiff.placeholder",
    explanation: "tool.jsonDiff.explanation",
  },
  "/tools/base64/text": {
    title: "tool.base64Text.title",
    summary: "tool.base64Text.summary",
    inputLabel: "tool.base64Text.inputLabel",
    placeholder: "tool.base64Text.placeholder",
    explanation: "tool.base64Text.explanation",
  },
  "/tools/base64/image": {
    title: "tool.base64Image.title",
    summary: "tool.base64Image.summary",
    inputLabel: "tool.base64Image.inputLabel",
    placeholder: "tool.base64Image.placeholder",
    explanation: "tool.base64Image.explanation",
  },
  "/tools/url/encode": {
    title: "tool.urlEncoder.title",
    summary: "tool.urlEncoder.summary",
    inputLabel: "tool.urlEncoder.inputLabel",
    placeholder: "tool.urlEncoder.placeholder",
    explanation: "tool.urlEncoder.explanation",
  },
  "/tools/time/timestamp": {
    title: "tool.timeConverter.title",
    summary: "tool.timeConverter.summary",
    inputLabel: "tool.timeConverter.inputLabel",
    placeholder: "tool.timeConverter.placeholder",
    explanation: "tool.timeConverter.explanation",
  },
  "/tools/generator/uuid": {
    title: "tool.uuid.title",
    summary: "tool.uuid.summary",
    inputLabel: "tool.uuid.inputLabel",
    placeholder: "tool.uuid.placeholder",
    explanation: "tool.uuid.explanation",
  },
  "/tools/generator/password": {
    title: "tool.password.title",
    summary: "tool.password.summary",
    inputLabel: "tool.password.inputLabel",
    placeholder: "tool.password.placeholder",
    explanation: "tool.password.explanation",
  },
  "/tools/text/diff": {
    title: "tool.textDiff.title",
    summary: "tool.textDiff.summary",
    inputLabel: "tool.textDiff.inputLabel",
    placeholder: "tool.textDiff.placeholder",
    explanation: "tool.textDiff.explanation",
  },
  "/tools/text/case": {
    title: "tool.caseConverter.title",
    summary: "tool.caseConverter.summary",
    inputLabel: "tool.caseConverter.inputLabel",
    placeholder: "tool.caseConverter.placeholder",
    explanation: "tool.caseConverter.explanation",
  },
  "/tools/text/escape": {
    title: "tool.stringEscape.title",
    summary: "tool.stringEscape.summary",
    inputLabel: "tool.stringEscape.inputLabel",
    placeholder: "tool.stringEscape.placeholder",
    explanation: "tool.stringEscape.explanation",
  },
  "/tools/crypto/jwt": {
    title: "tool.jwt.title",
    summary: "tool.jwt.summary",
    inputLabel: "tool.jwt.inputLabel",
    placeholder: "tool.jwt.placeholder",
    explanation: "tool.jwt.explanation",
    secretLabel: "tool.jwt.secretLabel",
  },
  "/tools/text/markdown": {
    title: "tool.markdownPreview.title",
    summary: "tool.markdownPreview.summary",
    inputLabel: "tool.markdownPreview.inputLabel",
    placeholder: "tool.markdownPreview.placeholder",
    explanation: "tool.markdownPreview.explanation",
  },
  "/tools/text/regex": {
    title: "tool.regex.title",
    summary: "tool.regex.summary",
    inputLabel: "tool.regex.inputLabel",
    placeholder: "tool.regex.placeholder",
    explanation: "tool.regex.explanation",
  },
  "/tools/crypto/file-hash": {
    title: "tool.fileHash.title",
    summary: "tool.fileHash.summary",
    inputLabel: "tool.fileHash.inputLabel",
    placeholder: "tool.fileHash.placeholder",
    explanation: "tool.fileHash.explanation",
  },
  "/tools/convert/color": {
    title: "tool.colorConverter.title",
    summary: "tool.colorConverter.summary",
    inputLabel: "tool.colorConverter.inputLabel",
    placeholder: "tool.colorConverter.placeholder",
    explanation: "tool.colorConverter.explanation",
  },
  "/tools/crypto/keygen": {
    title: "tool.keygen.title",
    summary: "tool.keygen.summary",
    inputLabel: "tool.keygen.inputLabel",
    placeholder: "tool.keygen.placeholder",
    explanation: "tool.keygen.explanation",
  },
  "/tools/url/parser": {
    title: "tool.urlParser.title",
    summary: "tool.urlParser.summary",
    inputLabel: "tool.urlParser.inputLabel",
    placeholder: "tool.urlParser.placeholder",
    explanation: "tool.urlParser.explanation",
  },
  "/tools/time/date-calc": {
    title: "tool.dateCalc.title",
    summary: "tool.dateCalc.summary",
    inputLabel: "tool.dateCalc.inputLabel",
    placeholder: "tool.dateCalc.placeholder",
    explanation: "tool.dateCalc.explanation",
  },
  "/tools/convert/base": {
    title: "tool.baseConverter.title",
    summary: "tool.baseConverter.summary",
    inputLabel: "tool.baseConverter.inputLabel",
    placeholder: "tool.baseConverter.placeholder",
    explanation: "tool.baseConverter.explanation",
  },
  "/tools/convert/yaml-json": {
    title: "tool.yamlJson.title",
    summary: "tool.yamlJson.summary",
    inputLabel: "tool.yamlJson.inputLabel",
    placeholder: "tool.yamlJson.placeholder",
    explanation: "tool.yamlJson.explanation",
  },
  "/tools/generator/qr": {
    title: "tool.qr.title",
    summary: "tool.qr.summary",
    inputLabel: "tool.qr.inputLabel",
    placeholder: "tool.qr.placeholder",
    explanation: "tool.qr.explanation",
  },
  "/tools/time/cron": {
    title: "tool.cron.title",
    summary: "tool.cron.summary",
    inputLabel: "tool.cron.inputLabel",
    placeholder: "tool.cron.placeholder",
    explanation: "tool.cron.explanation",
  },
};

export function translateTool(tool: ToolConfig, t: T): ToolConfig {
  const keys = toolKeyMap[tool.path];
  if (!keys) return tool;

  return {
    ...tool,
    title: t(keys.title),
    summary: t(keys.summary),
    inputLabel: t(keys.inputLabel),
    placeholder: t(keys.placeholder),
    explanation: t(keys.explanation),
    secretLabel: keys.secretLabel ? t(keys.secretLabel) : tool.secretLabel,
    ivLabel: keys.ivLabel ? t(keys.ivLabel) : tool.ivLabel,
    secondaryInputLabel: tool.secondaryInputLabel,
    secondaryPlaceholder: tool.secondaryPlaceholder,
  };
}

export function translateCategory(category: ToolCategory, t: T): string {
  const key = `category.${category}` as DictKey;
  const translated = t(key);
  return translated === key ? category : translated;
}

export function translateOperation(op: string, t: T): string {
  const key = `op.${op}` as DictKey;
  const translated = t(key);
  return translated === key ? op : translated;
}
