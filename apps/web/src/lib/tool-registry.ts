import {
  Binary,
  Braces,
  Code2,
  FileCode2,
  FileJson2,
  Fingerprint,
  Hash,
  Image,
  KeyRound,
  LockKeyhole,
  MessageSquareText,
  Network,
  ScanText,
  ShieldCheck,
  type LucideIcon
} from "lucide-react";

export type ToolCategory = "Crypto" | "Data" | "AI Engineering";

export type ToolConfig = {
  title: string;
  path: string;
  category: ToolCategory;
  summary: string;
  icon: LucideIcon;
  inputLabel: string;
  secondaryInputLabel?: string;
  placeholder: string;
  secondaryPlaceholder?: string;
  defaultInput: string;
  defaultSecondaryInput?: string;
  operations: string[];
  algorithms?: string[];
  defaultOperation: string;
  defaultAlgorithm?: string;
  paddings?: string[];
  defaultPadding?: string;
  secretLabel?: string;
  ivLabel?: string;
  defaultSecret?: string;
  defaultIv?: string;
  acceptsFile?: boolean;
  explanation: string;
  notice?: string;
};

export type ToolWorkbenchConfig = Omit<ToolConfig, "icon">;

export const tools: ToolConfig[] = [
  {
    title: "AES Encryptor",
    path: "/tools/crypto/aes",
    category: "Crypto",
    summary: "Encrypt and decrypt text with AES-GCM or AES-CBC in Web Crypto.",
    icon: LockKeyhole,
    inputLabel: "Plaintext or ciphertext",
    placeholder: "Paste text to encrypt, or Base64 ciphertext to decrypt.",
    defaultInput: "The model output should be deterministic for this replay.",
    operations: ["encrypt", "decrypt"],
    algorithms: ["AES-GCM", "AES-CBC", "AES-ECB"],
    paddings: ["PKCS7", "NoPadding", "ZeroPadding", "Iso97971", "AnsiX923", "Iso10126"],
    defaultPadding: "PKCS7",
    defaultOperation: "encrypt",
    defaultAlgorithm: "AES-GCM",
    secretLabel: "Passphrase",
    ivLabel: "IV for decrypt, optional for encrypt",
    defaultSecret: "local-first-toolbox",
    explanation: "AES-GCM is authenticated encryption and is the default. AES-CBC is included for compatibility with older systems."
  },
  {
    title: "DES Compatibility Tool",
    path: "/tools/crypto/des",
    category: "Crypto",
    summary: "Handle DES-CBC and DES-ECB payloads when legacy integration requires it.",
    icon: KeyRound,
    inputLabel: "Plaintext or ciphertext",
    placeholder: "Paste text to encrypt, or Base64 ciphertext to decrypt.",
    defaultInput: "legacy payload",
    operations: ["encrypt", "decrypt"],
    algorithms: ["DES-CBC", "DES-ECB"],
    defaultOperation: "encrypt",
    defaultAlgorithm: "DES-CBC",
    secretLabel: "8-byte key",
    ivLabel: "8-byte IV for CBC",
    defaultSecret: "12345678",
    defaultIv: "87654321",
    explanation: "DES exists here for compatibility checks only. It is not recommended for new systems."
  },
  {
    title: "SM4 Compatibility Tool",
    path: "/tools/crypto/sm4",
    category: "Crypto",
    summary: "Encrypt and decrypt SM4-CBC or SM4-ECB strings for integration checks.",
    icon: ShieldCheck,
    inputLabel: "Plaintext or ciphertext",
    placeholder: "Paste text to encrypt, or Base64 ciphertext to decrypt.",
    defaultInput: "SM4 integration payload",
    operations: ["encrypt", "decrypt"],
    algorithms: ["SM4-CBC", "SM4-ECB"],
    defaultOperation: "encrypt",
    defaultAlgorithm: "SM4-CBC",
    secretLabel: "16-byte key",
    ivLabel: "16-byte IV for CBC",
    defaultSecret: "0123456789abcdef",
    defaultIv: "fedcba9876543210",
    explanation: "SM4 is provided for teams that integrate with systems requiring the Chinese commercial block cipher standard."
  },
  {
    title: "Hash Generator",
    path: "/tools/crypto/hash",
    category: "Crypto",
    summary: "Generate MD5, SHA-1, SHA-256, and SHA-512 digests.",
    icon: Hash,
    inputLabel: "Input",
    placeholder: "Paste text to hash.",
    defaultInput: "rag:chunk:42",
    operations: ["hash"],
    algorithms: ["MD5", "SHA-1", "SHA-256", "SHA-512"],
    defaultOperation: "hash",
    defaultAlgorithm: "SHA-256",
    explanation: "SHA-256 or SHA-512 is appropriate for fingerprints. MD5 and SHA-1 are included for compatibility checks."
  },
  {
    title: "HMAC Generator",
    path: "/tools/crypto/hmac",
    category: "Crypto",
    summary: "Generate keyed digests with HMAC-MD5, HMAC-SHA256, or HMAC-SHA512.",
    icon: Fingerprint,
    inputLabel: "Message",
    placeholder: "Paste message text.",
    defaultInput: "timestamp=1779264000&event=tool-run",
    operations: ["hmac"],
    algorithms: ["HMAC-MD5", "HMAC-SHA256", "HMAC-SHA512"],
    defaultOperation: "hmac",
    defaultAlgorithm: "HMAC-SHA256",
    secretLabel: "Secret",
    defaultSecret: "webhook-secret",
    explanation: "HMAC is useful for webhook signatures and request verification where both sides share a secret."
  },
  {
    title: "JSON Formatter",
    path: "/tools/json/formatter",
    category: "Data",
    summary: "Format, minify, and validate JSON without uploading it.",
    icon: FileJson2,
    inputLabel: "JSON",
    placeholder: "{\"message\":\"paste JSON here\"}",
    defaultInput: "{\"model\":\"gpt\",\"messages\":[{\"role\":\"user\",\"content\":\"Summarize this.\"}]}",
    operations: ["format", "minify"],
    defaultOperation: "format",
    explanation: "A focused JSON formatter for payload inspection, API debugging, and prompt fixture cleanup."
  },
  {
    title: "JSON Diff",
    path: "/tools/json/diff",
    category: "Data",
    summary: "Compare two JSON documents and show structural changes.",
    icon: Braces,
    inputLabel: "Left JSON",
    secondaryInputLabel: "Right JSON",
    placeholder: "{\"temperature\":0.2,\"stream\":true}",
    secondaryPlaceholder: "{\"temperature\":0.3,\"stream\":true,\"seed\":7}",
    defaultInput: "{\"temperature\":0.2,\"stream\":true}",
    defaultSecondaryInput: "{\"temperature\":0.3,\"stream\":true,\"seed\":7}",
    operations: ["diff"],
    defaultOperation: "diff",
    explanation: "The diff output is path-based, which makes it useful for checking config and API response drift."
  },
  {
    title: "Base64 Text",
    path: "/tools/base64/text",
    category: "Data",
    summary: "Encode and decode UTF-8 text as Base64.",
    icon: Binary,
    inputLabel: "Text or Base64",
    placeholder: "Paste UTF-8 text or Base64.",
    defaultInput: "local-first processing",
    operations: ["encode", "decode"],
    defaultOperation: "encode",
    explanation: "UTF-8 safe Base64 conversion for small strings, tokens, and request fixtures."
  },
  {
    title: "Base64 Image",
    path: "/tools/base64/image",
    category: "Data",
    summary: "Convert an image file to a Data URL in the browser.",
    icon: Image,
    inputLabel: "Image file",
    placeholder: "Select an image file.",
    defaultInput: "",
    operations: ["encode"],
    defaultOperation: "encode",
    acceptsFile: true,
    explanation: "Image conversion uses the browser FileReader API. The selected file is not uploaded by this app."
  },
  {
    title: "URL Encoder",
    path: "/tools/url/encode",
    category: "Data",
    summary: "Encode or decode URL components.",
    icon: ScanText,
    inputLabel: "URL component",
    placeholder: "Paste text to encode or decode.",
    defaultInput: "model=gpt&query=AI engineering tools",
    operations: ["encode", "decode"],
    defaultOperation: "encode",
    explanation: "Encodes individual URL components with percent escaping and decodes them back to readable text."
  },
  {
    title: "Messages Formatter",
    path: "/tools/ai/messages-formatter",
    category: "AI Engineering",
    summary: "Turn chat message arrays into readable Markdown transcripts.",
    icon: MessageSquareText,
    inputLabel: "Messages JSON",
    placeholder: "[{\"role\":\"system\",\"content\":\"Be precise.\"}]",
    defaultInput:
      "[{\"role\":\"system\",\"content\":\"Be precise.\"},{\"role\":\"user\",\"content\":\"Explain RAG evaluation.\"}]",
    operations: ["format"],
    defaultOperation: "format",
    explanation: "Useful for reviewing logged chat payloads, prompt fixtures, and replay samples."
  },
  {
    title: "Prompt Escape",
    path: "/tools/ai/prompt-escape",
    category: "AI Engineering",
    summary: "Escape prompt snippets for Markdown and template-safe embedding.",
    icon: Code2,
    inputLabel: "Prompt text",
    placeholder: "Paste prompt text.",
    defaultInput: "Use `${tool}` only when <context> is complete.",
    operations: ["escape"],
    defaultOperation: "escape",
    explanation: "Escapes template-sensitive characters while keeping the text readable for code review."
  },
  {
    title: "SSE Parser",
    path: "/tools/ai/sse-parser",
    category: "AI Engineering",
    summary: "Inspect server-sent event streams from AI APIs.",
    icon: Network,
    inputLabel: "SSE payload",
    placeholder: "event: message\ndata: {\"delta\":\"hello\"}",
    defaultInput: "event: message\ndata: {\"delta\":\"hello\"}\n\nevent: done\ndata: [DONE]\n",
    operations: ["parse"],
    defaultOperation: "parse",
    explanation: "Splits SSE blocks and formats event fields so streaming API traces are easier to inspect."
  },
  {
    title: "Token Estimator",
    path: "/tools/ai/token-estimator",
    category: "AI Engineering",
    summary: "Estimate token counts for English and Chinese mixed prompts.",
    icon: FileCode2,
    inputLabel: "Prompt or document",
    placeholder: "Paste prompt or document text.",
    defaultInput: "Design a RAG evaluation flow for 多语言知识库 retrieval.",
    operations: ["estimate"],
    defaultOperation: "estimate",
    explanation: "This is a rough local estimate for planning. Use provider tokenizers when exact billing or context limits matter."
  }
];

export const featuredTools = [
  "/tools/ai/messages-formatter",
  "/tools/ai/sse-parser",
  "/tools/json/formatter",
  "/tools/crypto/aes"
];

export function findToolByPath(path: string) {
  return tools.find((tool) => tool.path === path);
}

export function getToolsByCategory(category: ToolCategory) {
  return tools.filter((tool) => tool.category === category);
}

export function getToolStaticParams() {
  return tools.map((tool) => ({
    slug: tool.path.replace(/^\/tools\//, "").split("/")
  }));
}
