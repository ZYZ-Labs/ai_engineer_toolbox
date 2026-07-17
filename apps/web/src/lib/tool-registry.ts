import {
  ArrowLeftRight,
  Barcode,
  Binary,
  Braces,
  Calculator,
  CalendarDays,
  CaseSensitive,
  Clock,
  Dices,
  Diff,
  FileDigit,
  FileJson2,
  FileText,
  Fingerprint,
  Hash,
  Image,
  KeyRound,
  KeySquare,
  Link,
  LockKeyhole,
  Palette,
  QrCode,
  Regex,
  ScanText,
  ShieldCheck,
  TextQuote,
  Ticket,
  Timer,
  type LucideIcon
} from "lucide-react";

export type ToolCategory = "Crypto" | "Data" | "Text" | "Generator" | "Converter";

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
    placeholder: '{"message":"paste JSON here"}',
    defaultInput: '{"model":"gpt","messages":[{"role":"user","content":"Summarize this."}]}',
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
    placeholder: '{"temperature":0.2,"stream":true}',
    secondaryPlaceholder: '{"temperature":0.3,"stream":true,"seed":7}',
    defaultInput: '{"temperature":0.2,"stream":true}',
    defaultSecondaryInput: '{"temperature":0.3,"stream":true,"seed":7}',
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
    title: "Timestamp Converter",
    path: "/tools/time/timestamp",
    category: "Data",
    summary: "Convert between Unix timestamps and human-readable dates.",
    icon: Clock,
    inputLabel: "Timestamp or date",
    placeholder: "Paste a Unix timestamp or ISO date.",
    defaultInput: "",
    operations: ["now", "toDate", "toTimestamp"],
    defaultOperation: "now",
    algorithms: ["Auto", "Seconds", "Milliseconds", "Microseconds"],
    defaultAlgorithm: "Auto",
    explanation: "Get the current time, convert a Unix timestamp to local/UTC date, or convert a date string to a timestamp. Supports seconds, milliseconds, and microseconds."
  },
  {
    title: "UUID Generator",
    path: "/tools/generator/uuid",
    category: "Generator",
    summary: "Generate UUID v4 or time-ordered UUID v7 in bulk, with uppercase and hyphen options.",
    icon: Barcode,
    inputLabel: "UUIDs",
    placeholder: "Generated UUIDs appear here.",
    defaultInput: "",
    operations: ["generate"],
    defaultOperation: "generate",
    explanation: "UUID v4 is fully random; UUID v7 embeds a Unix timestamp so values sort roughly by creation time. All UUIDs are generated locally with crypto.getRandomValues."
  },
  {
    title: "Password Generator",
    path: "/tools/generator/password",
    category: "Generator",
    summary: "Generate random passwords with configurable length, character sets, and ambiguity filtering.",
    icon: Dices,
    inputLabel: "Passwords",
    placeholder: "Generated passwords appear here.",
    defaultInput: "",
    operations: ["generate"],
    defaultOperation: "generate",
    explanation: "Passwords are generated locally with crypto.getRandomValues. Nothing is stored or uploaded. Excluding ambiguous characters removes lookalikes such as 0/O and 1/l/I."
  },
  {
    title: "Text Diff",
    path: "/tools/text/diff",
    category: "Text",
    summary: "Compare two texts line by line and show additions and removals.",
    icon: Diff,
    inputLabel: "Left text",
    secondaryInputLabel: "Right text",
    placeholder: "Paste the original text.",
    secondaryPlaceholder: "Paste the text to compare.",
    defaultInput: "const timeout = 3000;\nconst retries = 2;\nconsole.log('start');",
    defaultSecondaryInput: "const timeout = 5000;\nconst retries = 2;\nconsole.log('boot');",
    operations: ["diff"],
    defaultOperation: "diff",
    explanation: "Line-based diff: unchanged lines are prefixed with two spaces, removals with -, and additions with +. Returns (no differences) when the texts match."
  },
  {
    title: "Case Converter",
    path: "/tools/text/case",
    category: "Text",
    summary: "Convert text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and plain lower/upper case.",
    icon: CaseSensitive,
    inputLabel: "Text",
    placeholder: "Paste text to convert.",
    defaultInput: "hello world from silverice",
    operations: ["camel", "pascal", "snake", "kebab", "constant", "lower", "upper"],
    defaultOperation: "camel",
    explanation: "Each line is converted independently. Words are split on non-alphanumeric characters and camelCase boundaries."
  },
  {
    title: "String Escape",
    path: "/tools/text/escape",
    category: "Text",
    summary: "Escape or unescape strings with backslash sequences like \\n, \\t, and \\uXXXX.",
    icon: TextQuote,
    inputLabel: "Text",
    placeholder: "Paste text to escape or unescape.",
    defaultInput: "line one\nline two with \"quotes\"",
    operations: ["escape", "unescape"],
    defaultOperation: "escape",
    explanation: "Escape converts backslashes, quotes, newlines, tabs, and carriage returns to escape sequences; non-ASCII characters stay as-is. Unescape reverses the process and supports \\uXXXX."
  },
  {
    title: "JWT Decoder",
    path: "/tools/crypto/jwt",
    category: "Crypto",
    summary: "Decode JWT header and payload locally, with optional HMAC signature verification.",
    icon: Ticket,
    inputLabel: "JWT",
    placeholder: "Paste a JWT (header.payload.signature).",
    defaultInput: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    operations: ["decode"],
    defaultOperation: "decode",
    secretLabel: "HMAC Secret (optional)",
    explanation: "Decodes the header and payload and shows algorithm, expiry, and verification status. The signature is only checked when you provide an HMAC secret (HS256/384/512). Decoding is not verification — never trust unverified claims."
  },
  {
    title: "Markdown Preview",
    path: "/tools/text/markdown",
    category: "Text",
    summary: "Write markdown on the left and see it rendered live on the right.",
    icon: FileText,
    inputLabel: "Markdown",
    placeholder: "Type or paste markdown here.",
    defaultInput: "# Markdown Preview\n\nType **markdown** on the left and see it rendered live.\n\n- Local-first\n- No uploads\n\n`inline code` works too.",
    operations: ["parse"],
    defaultOperation: "parse",
    explanation: "The preview uses the same lightweight renderer as the study pages. It supports headings, lists, tables, quotes, code blocks, and images. Everything renders locally in your browser."
  },
  {
    title: "Regex Tester",
    path: "/tools/text/regex",
    category: "Text",
    summary: "Test a regular expression against text and inspect matches and capture groups.",
    icon: Regex,
    inputLabel: "Text",
    secondaryInputLabel: "Pattern",
    placeholder: "Paste text to search.",
    secondaryPlaceholder: "(?i)error\\s+\\d+",
    defaultInput: "2026-07-17 10:00:01 INFO startup complete\n2026-07-17 10:00:02 ERROR 500 upstream timeout\n2026-07-17 10:00:03 warn retrying request\n2026-07-17 10:00:04 error 503 backend unavailable",
    defaultSecondaryInput: "(?i)error\\s+\\d+",
    operations: ["match"],
    defaultOperation: "match",
    explanation: "Supports inline flags like (?i), (?m), and (?s). Output lists each match with its range, matched text, and capture groups."
  },
  {
    title: "File Hash",
    path: "/tools/crypto/file-hash",
    category: "Crypto",
    summary: "Compute MD5, SHA-1, SHA-256, or SHA-512 digests of a local file.",
    icon: FileDigit,
    inputLabel: "File",
    placeholder: "Select a file to hash.",
    defaultInput: "",
    operations: ["hash"],
    algorithms: ["MD5", "SHA-1", "SHA-256", "SHA-512"],
    defaultOperation: "hash",
    defaultAlgorithm: "SHA-256",
    acceptsFile: true,
    explanation: "The file is read into memory and hashed entirely in your browser — it is never uploaded. Because the whole file is held in memory, files under 500 MB are recommended."
  },
  {
    title: "Color Converter",
    path: "/tools/convert/color",
    category: "Converter",
    summary: "Convert colors between HEX, RGB, and HSL with a live swatch preview.",
    icon: Palette,
    inputLabel: "Color",
    placeholder: "#3b82f6, rgb(59,130,246), or hsl(217,91%,60%)",
    defaultInput: "#3b82f6",
    operations: ["convert"],
    defaultOperation: "convert",
    explanation: "Accepts #rgb, #rrggbb, rgb(r,g,b), and hsl(h,s%,l%). Outputs HEX, RGB, and HSL values with a swatch preview."
  },
  {
    title: "Key Pair Generator",
    path: "/tools/crypto/keygen",
    category: "Crypto",
    summary: "Generate RSA-OAEP or elliptic-curve (ECDSA/ECDH) key pairs and export them as JWK.",
    icon: KeySquare,
    inputLabel: "Key pair",
    placeholder: "Generated keys appear here.",
    defaultInput: "",
    operations: ["generate"],
    defaultOperation: "generate",
    explanation: "Keys are generated with Web Crypto (crypto.subtle) and exported as JWK. RSA-OAEP supports 2048/4096-bit keys for encryption; ECDSA and ECDH use the P-256 curve."
  },
  {
    title: "URL Parser",
    path: "/tools/url/parser",
    category: "Data",
    summary: "Break a URL into protocol, host, port, path, query parameters, and fragment.",
    icon: Link,
    inputLabel: "URL",
    placeholder: "Paste a full URL.",
    defaultInput: "https://user:pass@example.com:8080/path/to/page?q=tools&lang=en#section-2",
    operations: ["parse"],
    defaultOperation: "parse",
    explanation: "Parses absolute URLs and lists every query parameter. Invalid URLs are rejected with an error."
  },
  {
    title: "Date Calculator",
    path: "/tools/time/date-calc",
    category: "Data",
    summary: "Diff two dates, add a duration to a date, or convert a date to another timezone.",
    icon: CalendarDays,
    inputLabel: "Date",
    secondaryInputLabel: "Second date / duration",
    placeholder: "2026-07-17T09:00:00Z",
    secondaryPlaceholder: "7d or another ISO date",
    defaultInput: "2026-07-17T09:00:00Z",
    defaultSecondaryInput: "2026-07-24T09:00:00Z",
    operations: ["diff", "add", "toZone"],
    defaultOperation: "diff",
    algorithms: ["UTC", "Asia/Shanghai", "Asia/Tokyo", "Europe/London", "Europe/Berlin", "America/New_York", "America/Los_Angeles"],
    defaultAlgorithm: "UTC",
    explanation: "diff shows the gap between two dates broken down to days/hours/minutes/seconds. add applies a duration like \"2w 3d 4h 30m\". toZone formats the date in the selected timezone."
  },
  {
    title: "Number Base Converter",
    path: "/tools/convert/base",
    category: "Converter",
    summary: "Convert integers between binary, octal, decimal, and hexadecimal with arbitrary precision.",
    icon: Calculator,
    inputLabel: "Number",
    placeholder: "0xFF, 0b1010, 0o17, or 255",
    defaultInput: "0xFF",
    operations: ["convert"],
    algorithms: ["Auto", "2", "8", "10", "16"],
    defaultOperation: "convert",
    defaultAlgorithm: "Auto",
    explanation: "Auto mode detects 0x/0b/0o prefixes and defaults to decimal. Implemented with BigInt, so very large integers are exact."
  },
  {
    title: "YAML ↔ JSON",
    path: "/tools/convert/yaml-json",
    category: "Converter",
    summary: "Convert YAML documents to JSON and JSON back to YAML.",
    icon: ArrowLeftRight,
    inputLabel: "YAML or JSON",
    placeholder: "Paste YAML or JSON.",
    defaultInput: "name: silverice\ntools:\n  - crypto\n  - data",
    operations: ["toJSON", "toYAML"],
    defaultOperation: "toJSON",
    explanation: "to JSON parses YAML and prints JSON with 2-space indentation. to YAML parses JSON and dumps YAML. Invalid input is rejected with a parser error."
  },
  {
    title: "QR Code Generator",
    path: "/tools/generator/qr",
    category: "Generator",
    summary: "Generate QR codes locally with selectable size and error-correction level, and download as PNG.",
    icon: QrCode,
    inputLabel: "Text",
    placeholder: "Text or URL to encode.",
    defaultInput: "SilverIce Toolbox — local-first developer tools",
    operations: ["generate"],
    defaultOperation: "generate",
    explanation: "Text is encoded as UTF-8 and rendered to a canvas entirely in your browser. Higher error-correction levels (Q/H) tolerate more damage but produce denser codes."
  },
  {
    title: "Cron Parser",
    path: "/tools/time/cron",
    category: "Data",
    summary: "Parse a standard 5-field cron expression and preview the next run times.",
    icon: Timer,
    inputLabel: "Cron expression",
    placeholder: "*/15 9-18 * * 1-5",
    defaultInput: "*/15 9-18 * * 1-5",
    operations: ["parse"],
    defaultOperation: "parse",
    explanation: "Standard 5-field cron only: minute hour day-of-month month day-of-week. Supports * , - / and three-letter English month/weekday names. Extended syntax like L, W, #, @daily, and seconds fields is not supported. Next runs are shown in your local timezone."
  }
];

export const featuredTools = [
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
