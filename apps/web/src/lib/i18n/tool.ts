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
  "/tools/ai/chat": {
    title: "tool.aiChat.title",
    summary: "tool.aiChat.summary",
    inputLabel: "tool.aiChat.inputLabel",
    placeholder: "tool.aiChat.placeholder",
    explanation: "tool.aiChat.explanation",
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
