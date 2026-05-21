import {
  Binary,
  Braces,
  Bot,
  FileJson2,
  Fingerprint,
  Hash,
  Image,
  KeyRound,
  LockKeyhole,
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
  keyEncodings?: string[];
  defaultKeyEncoding?: string;
  ivEncodings?: string[];
  defaultIvEncoding?: string;
  inputEncodings?: string[];
  defaultInputEncoding?: string;
  outputEncodings?: string[];
  defaultOutputEncoding?: string;
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
    summary: "Encrypt and decrypt with AES-GCM, AES-CBC, or AES-ECB. Supports multiple paddings and key/IV/input/output encodings.",
    icon: LockKeyhole,
    inputLabel: "Plaintext or ciphertext",
    placeholder: "Paste text to encrypt, or ciphertext to decrypt.",
    defaultInput: "The model output should be deterministic for this replay.",
    operations: ["encrypt", "decrypt"],
    algorithms: ["AES-GCM", "AES-CBC", "AES-ECB"],
    paddings: ["PKCS7", "NoPadding", "ZeroPadding", "Iso97971", "AnsiX923", "Iso10126"],
    defaultPadding: "PKCS7",
    keyEncodings: ["text", "base64", "hex"],
    defaultKeyEncoding: "text",
    ivEncodings: ["text", "base64", "hex"],
    defaultIvEncoding: "text",
    inputEncodings: ["text", "base64", "hex"],
    defaultInputEncoding: "text",
    outputEncodings: ["base64", "hex"],
    defaultOutputEncoding: "base64",
    defaultOperation: "encrypt",
    defaultAlgorithm: "AES-GCM",
    secretLabel: "Passphrase / Key",
    ivLabel: "IV",
    defaultSecret: "local-first-toolbox",
    explanation: "AES-GCM uses Web Crypto with SHA-256 key derivation. AES-CBC and AES-ECB use CryptoJS with configurable padding. Key, IV, input, and output all support text, Base64, or Hex encoding."
  },
  {
    title: "DES Compatibility Tool",
    path: "/tools/crypto/des",
    category: "Crypto",
    summary: "DES with CBC, ECB, CFB, OFB, and CTR modes. Supports padding and multiple encodings for key, IV, input, and output.",
    icon: KeyRound,
    inputLabel: "Plaintext or ciphertext",
    placeholder: "Paste text to encrypt, or ciphertext to decrypt.",
    defaultInput: "legacy payload",
    operations: ["encrypt", "decrypt"],
    algorithms: ["DES-CBC", "DES-ECB", "DES-CFB", "DES-OFB", "DES-CTR"],
    paddings: ["PKCS7", "NoPadding", "ZeroPadding", "Iso97971", "AnsiX923", "Iso10126"],
    defaultPadding: "PKCS7",
    keyEncodings: ["text", "base64", "hex"],
    defaultKeyEncoding: "text",
    ivEncodings: ["text", "base64", "hex"],
    defaultIvEncoding: "text",
    inputEncodings: ["text", "base64", "hex"],
    defaultInputEncoding: "text",
    outputEncodings: ["base64", "hex"],
    defaultOutputEncoding: "base64",
    defaultOperation: "encrypt",
    defaultAlgorithm: "DES-CBC",
    secretLabel: "Key",
    ivLabel: "IV",
    defaultSecret: "12345678",
    defaultIv: "87654321",
    explanation: "DES with CBC, ECB, CFB, OFB, and CTR modes via CryptoJS. Padding is configurable for block modes. Key, IV, input, and output support text, Base64, or Hex encoding. DES is not recommended for new systems."
  },
  {
    title: "SM4 Compatibility Tool",
    path: "/tools/crypto/sm4",
    category: "Crypto",
    summary: "SM4-CBC and SM4-ECB with configurable padding and encoding support for key, IV, input, and output.",
    icon: ShieldCheck,
    inputLabel: "Plaintext or ciphertext",
    placeholder: "Paste text to encrypt, or ciphertext to decrypt.",
    defaultInput: "SM4 integration payload",
    operations: ["encrypt", "decrypt"],
    algorithms: ["SM4-CBC", "SM4-ECB"],
    paddings: ["PKCS7"],
    defaultPadding: "PKCS7",
    keyEncodings: ["text", "base64", "hex"],
    defaultKeyEncoding: "text",
    ivEncodings: ["text", "base64", "hex"],
    defaultIvEncoding: "text",
    inputEncodings: ["text", "base64", "hex"],
    defaultInputEncoding: "text",
    outputEncodings: ["base64", "hex"],
    defaultOutputEncoding: "base64",
    defaultOperation: "encrypt",
    defaultAlgorithm: "SM4-CBC",
    secretLabel: "Key",
    ivLabel: "IV",
    defaultSecret: "0123456789abcdef",
    defaultIv: "fedcba9876543210",
    explanation: "SM4 with CBC and ECB modes. Key and IV are internally converted to 32-character hex. Supports text, Base64, or Hex encoding for key, IV, input, and output."
  },
  {
    title: "Hash Generator",
    path: "/tools/crypto/hash",
    category: "Crypto",
    summary: "Generate MD5, SHA-1, SHA-256, and SHA-512 digests. Input supports text, Base64, or Hex encoding.",
    icon: Hash,
    inputLabel: "Input",
    placeholder: "Paste text to hash.",
    defaultInput: "rag:chunk:42",
    operations: ["hash"],
    algorithms: ["MD5", "SHA-1", "SHA-256", "SHA-512"],
    defaultOperation: "hash",
    defaultAlgorithm: "SHA-256",
    inputEncodings: ["text", "base64", "hex"],
    defaultInputEncoding: "text",
    explanation: "SHA-256 or SHA-512 is appropriate for fingerprints. MD5 and SHA-1 are included for compatibility checks. Input can be text, Base64, or Hex."
  },
  {
    title: "HMAC Generator",
    path: "/tools/crypto/hmac",
    category: "Crypto",
    summary: "Generate keyed digests with HMAC-MD5, HMAC-SHA256, or HMAC-SHA512. Key and message support multiple encodings.",
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
    keyEncodings: ["text", "base64", "hex"],
    defaultKeyEncoding: "text",
    inputEncodings: ["text", "base64", "hex"],
    defaultInputEncoding: "text",
    explanation: "HMAC is useful for webhook signatures and request verification. Key and message support text, Base64, or Hex encoding."
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
    summary: "Convert an image file to Base64, or decode Base64 back to an image with auto-detected format.",
    icon: Image,
    inputLabel: "Image file or Base64",
    placeholder: "Select an image file, or paste Base64 here.",
    defaultInput: "",
    operations: ["encode", "decode"],
    defaultOperation: "encode",
    acceptsFile: true,
    explanation: "Encode: converts an image file to a Base64 Data URL via FileReader. Decode: accepts Base64 with or without a data URL prefix, auto-detects PNG/JPEG/GIF/WebP/BMP/SVG from file headers, and renders the image."
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
    title: "AI Chat",
    path: "/tools/ai/chat",
    category: "AI Engineering",
    summary: "Multi-provider AI chat with OpenAI, Anthropic, Gemini, DeepSeek, OpenRouter, and more. API key stored locally.",
    icon: Bot,
    inputLabel: "Message",
    placeholder: "Type your message...",
    defaultInput: "",
    operations: ["chat"],
    defaultOperation: "chat",
    explanation: "Connect to multiple AI providers directly from your browser. Your API key is stored in localStorage and never sent to our servers. Supports streaming responses. Some providers require a CORS proxy for browser access."
  }
];

export const featuredTools = [
  "/tools/ai/chat",
  "/tools/json/formatter",
  "/tools/crypto/aes",
  "/tools/base64/text"
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
