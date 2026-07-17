export type Lang = "en" | "zh";

export const defaultLang: Lang = "en";

export const dict = {
  en: {
    // Header
    "nav.tools": "Tools",
    "nav.study": "Study",
    "nav.about": "About",
    "nav.changelog": "Changelog",
    "site.name": "SilverIce Toolbox",

    // Footer
    "footer.line1": "SilverIce Toolbox is open source, local-first, and intentionally minimal on server-side features.",
    "footer.line2": "All processing happens locally in your browser whenever possible. Your data is not uploaded unless explicitly stated.",

    // Home
    "home.badge": "Local-first engineering workstation",
    "home.title": "SilverIce Toolbox",
    "home.description": "A focused collection of browser-side tools and study pages for developers who work with payloads, APIs, data transforms, and integration security.",
    "home.search.placeholder": "Search AES, JSON, Base64, URL...",
    "home.section.recentlyUsed": "Recently Used",
    "home.section.cryptoTools": "Crypto Tools",
    "home.section.study": "Study",
    "home.viewAll": "View all",
    "home.updates.title": "Recent Updates",
    "home.updates.v1": "v1 implementation with static export, Cloudflare Worker deployment, and custom domain support.",
    "home.updates.tools": "Added local browser tools for crypto, JSON, Base64, URL, timestamps, and more.",
    "home.stats.title": "Site traffic",
    "home.stats.description": "Public aggregate traffic from D1. IP addresses are hashed before storage and never shown here.",
    "home.stats.total": "Total visits",
    "home.stats.today": "Today",
    "home.stats.visitors": "Unique visitors",
    "home.stats.last7": "Last 7 days",
    "home.stats.dailyUnit": "daily visits",
    "home.stats.noData": "No visit data yet.",

    // About
    "about.label": "About",
    "about.title": "A small toolbox for real engineering work",
    "about.p1": "SilverIce Toolbox keeps v1 intentionally simple: browser-side tools, practical study pages, no public accounts, no ads, and only minimal D1-backed aggregate analytics.",
    "about.p2": "The goal is to help engineers inspect payloads, debug APIs, validate signatures, and study the systems that matter around modern applications.",

    // Changelog
    "changelog.label": "Changelog",
    "changelog.title": "Project updates",
    "changelog.workerAuth.date": "2026-05-24 / Cloudflare Worker deployment and auth",
    "changelog.workerAuth.l1": "Moved deployment to Cloudflare Workers Static Assets with a Worker entry for API routes.",
    "changelog.workerAuth.l2": "Added D1-backed visit tracking, public aggregate traffic cards, hidden admin login, and admin stats API.",
    "changelog.workerAuth.l3": "Kept courses public and changed successful login to return to the homepage instead of automatically opening Study.",
    "changelog.base64image.date": "2026-05-20 / Base64 Image decode",
    "changelog.base64image.l1": "Added decode mode to Base64 Image tool. Accepts Base64 with or without data URL prefix.",
    "changelog.base64image.l2": "Auto-detects image format (PNG/JPEG/GIF/WebP/BMP/SVG) from file headers when decoding.",
    "changelog.crypto_v2.date": "2026-05-20 / crypto encoding and modes",
    "changelog.crypto_v2.l1": "Added key/IV/input/output encoding support (text, Base64, Hex) for AES, DES, SM4, Hash, and HMAC.",
    "changelog.crypto_v2.l2": "Fixed SM4 by converting key/IV to 32-char hex and bridging base64/hex input-output.",
    "changelog.crypto_v2.l3": "Expanded DES to CBC, ECB, CFB, OFB, and CTR modes with configurable padding.",
    "changelog.crypto_v2.l4": "Added Padding selection for AES-CBC, AES-ECB, DES, and SM4.",
    "changelog.crypto_v2.l5": "Updated all crypto tool descriptions to reflect new encoding and mode capabilities.",
    "changelog.crypto.date": "2026-05-20 / crypto and usage tracking",
    "changelog.crypto.l1": "Added AES-ECB support and configurable padding (PKCS7, NoPadding, ZeroPadding, etc.).",
    "changelog.crypto.l2": "Fixed IV state not resetting when switching AES/SM4 algorithms.",
    "changelog.crypto.l3": "Fixed SM4 CBC IV validation and ECB/SM4 key empty-string detection.",
    "changelog.crypto.l4": "Replaced Featured Tools with Recently Used, sorted by usage frequency via localStorage.",
    "changelog.i18n.date": "2026-05-20 / i18n support",
    "changelog.i18n.l1": "Added client-side i18n with English and Chinese language support. Language preference is cached in localStorage.",
    "changelog.cryptoHistory.date": "2026-05-22 / Crypto key and IV history",
    "changelog.cryptoHistory.l1": "Added history dropdown for secret key and IV inputs in crypto tools.",
    "changelog.cryptoHistory.l2": "History is stored in localStorage and deduplicated (max 10 entries per field).",
    "changelog.aiChat.date": "2026-05-21 / AI Chat multi-provider",
    "changelog.aiChat.l1": "Replaced AI utility tools with a unified AI Chat supporting OpenAI, Anthropic, Gemini, DeepSeek, OpenRouter, SiliconFlow, and custom OpenAI-compatible providers.",
    "changelog.aiChat.l2": "Added provider selection, model fetching, streaming responses, temperature and max tokens controls.",
    "changelog.aiChat.l3": "API keys are stored in localStorage only, never sent to backend servers.",
    "changelog.ngLectures.date": "2026-05-21 / Andrew Ng Deep Learning course",
    "changelog.ngLectures.l1": "Added ng-lectures: a 28-chapter bilingual course covering ML fundamentals, neural networks, CNN, RNN, and generative AI.",
    "changelog.ngLectures.l2": "Registered alongside transformer-lectures in the study section with full i18n support.",
    "changelog.beginnerCourses.date": "2026-06-04 / Beginner Git and Godot courses",
    "changelog.beginnerCourses.l1": "Added git-basics: a 10-chapter beginner course covering Git setup, commits, branches, remotes, conflicts, and safe collaboration.",
    "changelog.beginnerCourses.l2": "Added godot-basics: a 12-chapter Godot 4.6.3 beginner course covering editor concepts, GDScript, a 2D game project, debugging, version control, and export.",
    "changelog.engineCourses.date": "2026-06-04 / Beginner Unity and Unreal courses",
    "changelog.engineCourses.l1": "Added unity-basics: a 12-chapter Unity 6.3 LTS beginner course covering editor concepts, C# scripting, a 2D project, UI, data, debugging, Git, and builds.",
    "changelog.engineCourses.l2": "Added unreal-basics: a 12-chapter Unreal Engine 5.7 beginner course covering editor concepts, Blueprints, gameplay framework, a 3D prototype, UMG, packaging, and Git LFS.",
    "changelog.v010.date": "2026-05-20 / v0.1.0",
    "changelog.v010.l1": "Implemented the static Next.js frontend for GitHub Pages and custom domain deployment.",
    "changelog.v010.l2": "Added local-first tools for crypto, data, and online workflows.",
    "changelog.v010.l3": "Added MDX study roadmaps and project handoff documentation.",

    // Donate
    "donate.label": "Donate",
    "donate.title": "Support page reserved",
    "donate.description": "The v1 product keeps donation entry points hidden from navigation until the project has meaningful traffic and a clear maintenance need.",

    // Study index
    "study.label": "Study",
    "study.title": "Roadmaps for practical engineering",
    "study.description": "Study notes focus on design decisions, implementation traps, and production habits for real engineering work.",

    // Tools index
    "tools.label": "Tools",
    "tools.title": "Local browser tools for engineering work",
    "tools.description": "Focused utilities for payload inspection, API debugging, compatibility checks, and privacy-preserving data transforms.",

    // Tool detail
    "tool.explanation": "Explanation",
    "tool.securityNotice": "Security Notice",
    "tool.defaultNotice": "All processing happens locally in your browser whenever possible. Your data is not uploaded unless explicitly stated.",

    // Tool workbench
    "workbench.algorithmSettings": "Algorithm Settings",
    "workbench.mode": "Mode",
    "workbench.algorithm": "Algorithm",
    "workbench.run": "Run",
    "workbench.reset": "Reset",
    "workbench.select": "Select",
    "workbench.output": "Output",
    "workbench.copy": "Copy",
    "workbench.copied": "Copied",
    "workbench.error.generic": "Unable to process the input.",

    // Search
    "search.aria": "Global search",

    // Language switcher
    "lang.en": "English",
    "lang.zh": "中文",

    // Tool: AES
    "tool.aes.title": "AES Encryptor",
    "tool.aes.summary": "Encrypt and decrypt with AES-GCM, AES-CBC, or AES-ECB. Supports multiple paddings and key/IV/input/output encodings.",
    "tool.aes.inputLabel": "Plaintext or ciphertext",
    "tool.aes.placeholder": "Paste text to encrypt, or ciphertext to decrypt.",
    "tool.aes.secretLabel": "Passphrase / Key",
    "tool.aes.ivLabel": "IV",
    "tool.aes.explanation": "AES-GCM uses Web Crypto with SHA-256 key derivation. AES-CBC and AES-ECB use CryptoJS with configurable padding. Key, IV, input, and output all support text, Base64, or Hex encoding.",

    // Tool: DES
    "tool.des.title": "DES Compatibility Tool",
    "tool.des.summary": "DES with CBC, ECB, CFB, OFB, and CTR modes. Supports padding and multiple encodings for key, IV, input, and output.",
    "tool.des.inputLabel": "Plaintext or ciphertext",
    "tool.des.placeholder": "Paste text to encrypt, or ciphertext to decrypt.",
    "tool.des.secretLabel": "Key",
    "tool.des.ivLabel": "IV",
    "tool.des.explanation": "DES with CBC, ECB, CFB, OFB, and CTR modes via CryptoJS. Padding is configurable for block modes. Key, IV, input, and output support text, Base64, or Hex encoding. DES is not recommended for new systems.",

    // Tool: SM4
    "tool.sm4.title": "SM4 Compatibility Tool",
    "tool.sm4.summary": "SM4-CBC and SM4-ECB with configurable padding and encoding support for key, IV, input, and output.",
    "tool.sm4.inputLabel": "Plaintext or ciphertext",
    "tool.sm4.placeholder": "Paste text to encrypt, or ciphertext to decrypt.",
    "tool.sm4.secretLabel": "Key",
    "tool.sm4.ivLabel": "IV",
    "tool.sm4.explanation": "SM4 with CBC and ECB modes. Key and IV are internally converted to 32-character hex. Supports text, Base64, or Hex encoding for key, IV, input, and output.",

    // Tool: Hash
    "tool.hash.title": "Hash Generator",
    "tool.hash.summary": "Generate MD5, SHA-1, SHA-256, and SHA-512 digests. Input supports text, Base64, or Hex encoding.",
    "tool.hash.inputLabel": "Input",
    "tool.hash.placeholder": "Paste text to hash.",
    "tool.hash.explanation": "SHA-256 or SHA-512 is appropriate for fingerprints. MD5 and SHA-1 are included for compatibility checks. Input can be text, Base64, or Hex.",

    // Tool: HMAC
    "tool.hmac.title": "HMAC Generator",
    "tool.hmac.summary": "Generate keyed digests with HMAC-MD5, HMAC-SHA256, or HMAC-SHA512. Key and message support multiple encodings.",
    "tool.hmac.inputLabel": "Message",
    "tool.hmac.placeholder": "Paste message text.",
    "tool.hmac.secretLabel": "Secret",
    "tool.hmac.explanation": "HMAC is useful for webhook signatures and request verification. Key and message support text, Base64, or Hex encoding.",

    // Tool: JSON Formatter
    "tool.jsonFormatter.title": "JSON Formatter",
    "tool.jsonFormatter.summary": "Format, minify, and validate JSON without uploading it.",
    "tool.jsonFormatter.inputLabel": "JSON",
    "tool.jsonFormatter.placeholder": '{"message":"paste JSON here"}',
    "tool.jsonFormatter.explanation": "A focused JSON formatter for payload inspection, API debugging, and prompt fixture cleanup.",

    // Tool: JSON Diff
    "tool.jsonDiff.title": "JSON Diff",
    "tool.jsonDiff.summary": "Compare two JSON documents and show structural changes.",
    "tool.jsonDiff.inputLabel": "Left JSON",
    "tool.jsonDiff.secondaryInputLabel": "Right JSON",
    "tool.jsonDiff.placeholder": '{"temperature":0.2,"stream":true}',
    "tool.jsonDiff.secondaryPlaceholder": '{"temperature":0.3,"stream":true,"seed":7}',
    "tool.jsonDiff.explanation": "The diff output is path-based, which makes it useful for checking config and API response drift.",

    // Tool: Base64 Text
    "tool.base64Text.title": "Base64 Text",
    "tool.base64Text.summary": "Encode and decode UTF-8 text as Base64.",
    "tool.base64Text.inputLabel": "Text or Base64",
    "tool.base64Text.placeholder": "Paste UTF-8 text or Base64.",
    "tool.base64Text.explanation": "UTF-8 safe Base64 conversion for small strings, tokens, and request fixtures.",

    // Tool: Base64 Image
    "tool.base64Image.title": "Base64 Image",
    "tool.base64Image.summary": "Convert an image file to Base64, or decode Base64 back to an image with auto-detected format.",
    "tool.base64Image.inputLabel": "Image file or Base64",
    "tool.base64Image.placeholder": "Select an image file, or paste Base64 here.",
    "tool.base64Image.explanation": "Encode: converts an image file to a Base64 Data URL via FileReader. Decode: accepts Base64 with or without a data URL prefix, auto-detects PNG/JPEG/GIF/WebP/BMP/SVG from file headers, and renders the image.",

    // Tool: URL Encoder
    "tool.urlEncoder.title": "URL Encoder",
    "tool.urlEncoder.summary": "Encode or decode URL components.",
    "tool.urlEncoder.inputLabel": "URL component",
    "tool.urlEncoder.placeholder": "Paste text to encode or decode.",
    "tool.urlEncoder.explanation": "Encodes individual URL components with percent escaping and decodes them back to readable text.",

    // Tool: Timestamp Converter
    "tool.timeConverter.title": "Timestamp Converter",
    "tool.timeConverter.summary": "Convert between Unix timestamps and human-readable dates.",
    "tool.timeConverter.inputLabel": "Timestamp or date",
    "tool.timeConverter.placeholder": "Paste a Unix timestamp or ISO date.",
    "tool.timeConverter.explanation": "Get the current time, convert a Unix timestamp to local/UTC date, or convert a date string to a timestamp. Supports seconds, milliseconds, and microseconds.",

    // Tool: UUID Generator
    "tool.uuid.title": "UUID Generator",
    "tool.uuid.summary": "Generate UUID v4 or time-ordered UUID v7 in bulk, with uppercase and hyphen options.",
    "tool.uuid.inputLabel": "UUIDs",
    "tool.uuid.placeholder": "Generated UUIDs appear here.",
    "tool.uuid.explanation": "UUID v4 is fully random; UUID v7 embeds a Unix timestamp so values sort roughly by creation time. All UUIDs are generated locally with crypto.getRandomValues.",
    "tool.uuid.option.version": "Version",
    "tool.uuid.option.count": "Count",
    "tool.uuid.option.uppercase": "Uppercase",
    "tool.uuid.option.hyphens": "Include hyphens",

    // Tool: Password Generator
    "tool.password.title": "Password Generator",
    "tool.password.summary": "Generate random passwords with configurable length, character sets, and ambiguity filtering.",
    "tool.password.inputLabel": "Passwords",
    "tool.password.placeholder": "Generated passwords appear here.",
    "tool.password.explanation": "Passwords are generated locally with crypto.getRandomValues. Nothing is stored or uploaded. Excluding ambiguous characters removes lookalikes such as 0/O and 1/l/I.",
    "tool.password.option.length": "Length",
    "tool.password.option.count": "Count",
    "tool.password.option.lowercase": "Lowercase (a-z)",
    "tool.password.option.uppercase": "Uppercase (A-Z)",
    "tool.password.option.digits": "Digits (0-9)",
    "tool.password.option.symbols": "Symbols",
    "tool.password.option.excludeAmbiguous": "Exclude ambiguous characters",
    "tool.password.error.noCharset": "Select at least one character set.",

    // Tool: Text Diff
    "tool.textDiff.title": "Text Diff",
    "tool.textDiff.summary": "Compare two texts line by line and show additions and removals.",
    "tool.textDiff.inputLabel": "Left text",
    "tool.textDiff.placeholder": "Paste the original text.",
    "tool.textDiff.explanation": "Line-based diff: unchanged lines are prefixed with two spaces, removals with -, and additions with +. Returns (no differences) when the texts match.",

    // Tool: Case Converter
    "tool.caseConverter.title": "Case Converter",
    "tool.caseConverter.summary": "Convert text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and plain lower/upper case.",
    "tool.caseConverter.inputLabel": "Text",
    "tool.caseConverter.placeholder": "Paste text to convert.",
    "tool.caseConverter.explanation": "Each line is converted independently. Words are split on non-alphanumeric characters and camelCase boundaries.",

    // Tool: String Escape
    "tool.stringEscape.title": "String Escape",
    "tool.stringEscape.summary": "Escape or unescape strings with backslash sequences like \\n, \\t, and \\uXXXX.",
    "tool.stringEscape.inputLabel": "Text",
    "tool.stringEscape.placeholder": "Paste text to escape or unescape.",
    "tool.stringEscape.explanation": "Escape converts backslashes, quotes, newlines, tabs, and carriage returns to escape sequences; non-ASCII characters stay as-is. Unescape reverses the process and supports \\uXXXX.",

    // Tool: JWT Decoder
    "tool.jwt.title": "JWT Decoder",
    "tool.jwt.summary": "Decode JWT header and payload locally, with optional HMAC signature verification.",
    "tool.jwt.inputLabel": "JWT",
    "tool.jwt.placeholder": "Paste a JWT (header.payload.signature).",
    "tool.jwt.secretLabel": "HMAC Secret (optional)",
    "tool.jwt.explanation": "Decodes the header and payload and shows algorithm, expiry, and verification status. The signature is only checked when you provide an HMAC secret (HS256/384/512). Decoding is not verification — never trust unverified claims.",

    // Tool: Markdown Preview
    "tool.markdownPreview.title": "Markdown Preview",
    "tool.markdownPreview.summary": "Write markdown on the left and see it rendered live on the right.",
    "tool.markdownPreview.inputLabel": "Markdown",
    "tool.markdownPreview.placeholder": "Type or paste markdown here.",
    "tool.markdownPreview.explanation": "The preview uses the same lightweight renderer as the study pages. It supports headings, lists, tables, quotes, code blocks, and images. Everything renders locally in your browser.",
    "tool.markdownPreview.previewLabel": "Preview",

    // Tool: Regex Tester
    "tool.regex.title": "Regex Tester",
    "tool.regex.summary": "Test a regular expression against text and inspect matches and capture groups.",
    "tool.regex.inputLabel": "Text",
    "tool.regex.placeholder": "Paste text to search.",
    "tool.regex.explanation": "Supports inline flags like (?i), (?m), and (?s). Output lists each match with its range, matched text, and capture groups.",

    // Tool: File Hash
    "tool.fileHash.title": "File Hash",
    "tool.fileHash.summary": "Compute MD5, SHA-1, SHA-256, or SHA-512 digests of a local file.",
    "tool.fileHash.inputLabel": "File",
    "tool.fileHash.placeholder": "Select a file to hash.",
    "tool.fileHash.explanation": "The file is read into memory and hashed entirely in your browser — it is never uploaded. Because the whole file is held in memory, files under 500 MB are recommended.",

    // Tool: Color Converter
    "tool.colorConverter.title": "Color Converter",
    "tool.colorConverter.summary": "Convert colors between HEX, RGB, and HSL with a live swatch preview.",
    "tool.colorConverter.inputLabel": "Color",
    "tool.colorConverter.placeholder": "#3b82f6, rgb(59,130,246), or hsl(217,91%,60%)",
    "tool.colorConverter.explanation": "Accepts #rgb, #rrggbb, rgb(r,g,b), and hsl(h,s%,l%). Outputs HEX, RGB, and HSL values with a swatch preview.",

    // Tool: Key Pair Generator
    "tool.keygen.title": "Key Pair Generator",
    "tool.keygen.summary": "Generate RSA-OAEP or elliptic-curve (ECDSA/ECDH) key pairs and export them as JWK.",
    "tool.keygen.inputLabel": "Key pair",
    "tool.keygen.placeholder": "Generated keys appear here.",
    "tool.keygen.explanation": "Keys are generated with Web Crypto (crypto.subtle) and exported as JWK. RSA-OAEP supports 2048/4096-bit keys for encryption; ECDSA and ECDH use the P-256 curve.",
    "tool.keygen.option.algorithm": "Algorithm",
    "tool.keygen.publicKey": "Public Key (JWK)",
    "tool.keygen.privateKey": "Private Key (JWK)",
    "tool.keygen.localNote": "Keys are generated locally in your browser and never uploaded. Save the private key somewhere safe — it cannot be recovered.",

    // Tool: URL Parser
    "tool.urlParser.title": "URL Parser",
    "tool.urlParser.summary": "Break a URL into protocol, host, port, path, query parameters, and fragment.",
    "tool.urlParser.inputLabel": "URL",
    "tool.urlParser.placeholder": "Paste a full URL.",
    "tool.urlParser.explanation": "Parses absolute URLs and lists every query parameter. Invalid URLs are rejected with an error.",

    // Tool: Date Calculator
    "tool.dateCalc.title": "Date Calculator",
    "tool.dateCalc.summary": "Diff two dates, add a duration to a date, or convert a date to another timezone.",
    "tool.dateCalc.inputLabel": "Date",
    "tool.dateCalc.placeholder": "2026-07-17T09:00:00Z",
    "tool.dateCalc.explanation": "diff shows the gap between two dates broken down to days/hours/minutes/seconds. add applies a duration like \"2w 3d 4h 30m\". toZone formats the date in the selected timezone.",

    // Tool: Number Base Converter
    "tool.baseConverter.title": "Number Base Converter",
    "tool.baseConverter.summary": "Convert integers between binary, octal, decimal, and hexadecimal with arbitrary precision.",
    "tool.baseConverter.inputLabel": "Number",
    "tool.baseConverter.placeholder": "0xFF, 0b1010, 0o17, or 255",
    "tool.baseConverter.explanation": "Auto mode detects 0x/0b/0o prefixes and defaults to decimal. Implemented with BigInt, so very large integers are exact.",

    // Tool: YAML ↔ JSON
    "tool.yamlJson.title": "YAML ↔ JSON",
    "tool.yamlJson.summary": "Convert YAML documents to JSON and JSON back to YAML.",
    "tool.yamlJson.inputLabel": "YAML or JSON",
    "tool.yamlJson.placeholder": "Paste YAML or JSON.",
    "tool.yamlJson.explanation": "to JSON parses YAML and prints JSON with 2-space indentation. to YAML parses JSON and dumps YAML. Invalid input is rejected with a parser error.",

    // Tool: QR Code Generator
    "tool.qr.title": "QR Code Generator",
    "tool.qr.summary": "Generate QR codes locally with selectable size and error-correction level, and download as PNG.",
    "tool.qr.inputLabel": "Text",
    "tool.qr.placeholder": "Text or URL to encode.",
    "tool.qr.explanation": "Text is encoded as UTF-8 and rendered to a canvas entirely in your browser. Higher error-correction levels (Q/H) tolerate more damage but produce denser codes.",
    "tool.qr.option.size": "Size",
    "tool.qr.option.errorCorrection": "Error correction",
    "tool.qr.download": "Download PNG",

    // Tool: Cron Parser
    "tool.cron.title": "Cron Parser",
    "tool.cron.summary": "Parse a standard 5-field cron expression and preview the next run times.",
    "tool.cron.inputLabel": "Cron expression",
    "tool.cron.placeholder": "*/15 9-18 * * 1-5",
    "tool.cron.explanation": "Standard 5-field cron only: minute hour day-of-month month day-of-week. Supports * , - / and three-letter English month/weekday names. Extended syntax like L, W, #, @daily, and seconds fields is not supported. Next runs are shown in your local timezone.",

    // Study pages
    "study.transformerLectures.title": "Transformer Lectures",
    "study.transformerLectures.summary": "A 30-chapter bilingual course from tensor basics to Transformer internals, diffusion, and source hacking.",
    "study.ngLectures.title": "Andrew Ng Deep Learning",
    "study.ngLectures.summary": "A 28-chapter bilingual course covering ML fundamentals, neural networks, CNN, RNN, and generative AI.",
    "study.gitBasics.title": "Git Beginner Course",
    "study.gitBasics.summary": "A detailed beginner course for Git concepts, command-line workflow, branches, remotes, conflicts, and safe collaboration.",
    "study.godotBasics.title": "Godot 4.6.3 Beginner Course",
    "study.godotBasics.summary": "A detailed Godot 4.6.3 course for new game makers, from editor basics to a playable 2D project and export workflow.",
    "study.unityBasics.title": "Unity 6.3 LTS Beginner Course",
    "study.unityBasics.summary": "A detailed Unity 6.3 LTS course for new game makers, from editor basics to a playable 2D project and build workflow.",
    "study.unrealBasics.title": "Unreal Engine 5.7 Beginner Course",
    "study.unrealBasics.summary": "A detailed Unreal Engine 5.7 course for new users, from editor basics and Blueprints to a playable 3D prototype.",

    // Levels
    "level.Foundation": "Foundation",
    "level.Intermediate": "Intermediate",
    "level.Advanced": "Advanced",

    // Categories
    "category.Crypto": "Crypto",
    "category.Data": "Data",
    "category.Text": "Text",
    "category.Generator": "Generator",
    "category.Converter": "Converter",

    // Operations
    "op.encrypt": "encrypt",
    "op.decrypt": "decrypt",
    "op.hash": "hash",
    "op.hmac": "hmac",
    "op.format": "format",
    "op.minify": "minify",
    "op.diff": "diff",
    "op.encode": "encode",
    "op.decode": "decode",
    "op.escape": "escape",
    "op.parse": "parse",
    "op.estimate": "estimate",
    "op.toDate": "to date",
    "op.toTimestamp": "to timestamp",
    "op.now": "now",
    "op.camel": "camel",
    "op.pascal": "pascal",
    "op.snake": "snake",
    "op.kebab": "kebab",
    "op.constant": "constant",
    "op.lower": "lower",
    "op.upper": "upper",
    "op.unescape": "unescape",
    "op.match": "match",
    "op.convert": "convert",
    "op.toJSON": "to JSON",
    "op.toYAML": "to YAML",
    "op.add": "add",
    "op.toZone": "to timezone",
    "op.generate": "generate",

    // Workbench errors
    "error.aes.secretRequired": "Passphrase is required.",
    "error.aes.ivRequired": "IV is required for AES CBC decrypt.",
    "error.des.secretRequired": "DES key is required.",
    "error.sm4.secretRequired": "SM4 key is required.",
    "error.sm4.ivRequired": "SM4 IV is required for CBC mode.",
    "error.hmac.secretRequired": "Secret is required.",
    "error.unsupportedTool": "Unsupported tool.",
  },
  zh: {
    // Header
    "nav.tools": "工具",
    "nav.study": "学习",
    "nav.about": "关于",
    "nav.changelog": "更新日志",
    "site.name": "SilverIce Toolbox",

    // Footer
    "footer.line1": "SilverIce Toolbox 是开源的、本地优先的，并刻意保持最小化服务端能力。",
    "footer.line2": "所有处理尽可能在浏览器本地完成。除非另有说明，您的数据不会被上传。",

    // Home
    "home.badge": "本地优先的工程工作站",
    "home.title": "SilverIce Toolbox",
    "home.description": "为开发者精心整理的浏览器端工具和学习页面，涵盖请求体、流式 API、检索系统和集成安全。",
    "home.search.placeholder": "搜索 AES、JSON、Base64、URL...",
    "home.section.recentlyUsed": "最近使用",
    "home.section.cryptoTools": "加密工具",
    "home.section.study": "学习",
    "home.viewAll": "查看全部",
    "home.updates.title": "最近更新",
    "home.updates.v1": "v1 实现：静态导出、Cloudflare Worker 部署和自定义域名支持。",
    "home.updates.tools": "新增本地浏览器工具：加密、JSON、Base64、URL、时间戳等。",
    "home.stats.title": "站点访问量",
    "home.stats.description": "来自 D1 的公开聚合访问统计。IP 会先哈希再存储，这里不会展示任何 IP 信息。",
    "home.stats.total": "总访问量",
    "home.stats.today": "今日访问",
    "home.stats.visitors": "独立访客",
    "home.stats.last7": "最近 7 天",
    "home.stats.dailyUnit": "每日访问",
    "home.stats.noData": "暂无访问数据。",

    // About
    "about.label": "关于",
    "about.title": "为真实工程工作准备的小工具箱",
    "about.p1": "SilverIce Toolbox 的 v1 版本刻意保持简单：浏览器端工具、实用的学习页面、无公开账号、没有广告，只保留最小化的 D1 聚合访问统计。",
    "about.p2": "目标是帮助工程师检查请求体、调试 API、验证签名，并学习现代应用周围重要的系统知识。",

    // Changelog
    "changelog.label": "更新日志",
    "changelog.title": "项目更新",
    "changelog.workerAuth.date": "2026-05-24 / Cloudflare Worker 部署与登录",
    "changelog.workerAuth.l1": "部署迁移到 Cloudflare Workers Static Assets，并通过 Worker 入口处理 API 路由。",
    "changelog.workerAuth.l2": "新增基于 D1 的访问统计、首页公开聚合访问卡片、隐藏管理员登录和管理员统计接口。",
    "changelog.workerAuth.l3": "学习内容保持公开，登录成功后返回首页，不再自动跳转到学习页。",
    "changelog.crypto_v2.date": "2026-05-20 / crypto encoding and modes",
    "changelog.crypto_v2.l1": "Added key/IV/input/output encoding support (text, Base64, Hex) for AES, DES, SM4, Hash, and HMAC.",
    "changelog.crypto_v2.l2": "Fixed SM4 by converting key/IV to 32-char hex and bridging base64/hex input-output.",
    "changelog.crypto_v2.l3": "Expanded DES to CBC, ECB, CFB, OFB, and CTR modes with configurable padding.",
    "changelog.crypto_v2.l4": "Added Padding selection for AES-CBC, AES-ECB, DES, and SM4.",
    "changelog.base64image.date": "2026-05-20 / Base64 图片解码",
    "changelog.base64image.l1": "Base64 图片工具新增解码模式，接受带或不带 data URL 前缀的 Base64。",
    "changelog.base64image.l2": "解码时从文件头自动检测图片格式（PNG/JPEG/GIF/WebP/BMP/SVG）。",
    "changelog.crypto_v2.l5": "更新所有加密工具说明，反映新的编码和模式能力。",
    "changelog.crypto.date": "2026-05-20 / 加密与使用统计",
    "changelog.crypto.l1": "新增 AES-ECB 支持，可配置 Padding（PKCS7、NoPadding、ZeroPadding 等）。",
    "changelog.crypto.l2": "修复切换 AES/SM4 算法时 IV 状态未重置的问题。",
    "changelog.crypto.l3": "修复 SM4 CBC IV 校验和 ECB/SM4 密钥空字符串检测问题。",
    "changelog.crypto.l4": "首页精选工具改为最近使用，按 localStorage 统计的使用频率排序。",
    "changelog.i18n.date": "2026-05-20 / 国际化支持",
    "changelog.i18n.l1": "新增客户端国际化，支持英文和中文切换。语言偏好缓存在 localStorage 中。",
    "changelog.cryptoHistory.date": "2026-05-22 / 加密密钥与 IV 历史记录",
    "changelog.cryptoHistory.l1": "加密工具的密钥和 IV 输入框新增历史记录下拉选择。",
    "changelog.cryptoHistory.l2": "历史记录存储在 localStorage 中，自动去重，每字段最多保留 10 条。",
    "changelog.aiChat.date": "2026-05-21 / AI 对话多供应商支持",
    "changelog.aiChat.l1": "替换 AI 实用工具为统一的 AI 对话，支持 OpenAI、Anthropic、Gemini、DeepSeek、OpenRouter、SiliconFlow 和自定义 OpenAI 兼容供应商。",
    "changelog.aiChat.l2": "新增供应商选择、模型获取、流式响应、Temperature 和 Max Tokens 调节。",
    "changelog.aiChat.l3": "API 密钥仅存储在 localStorage 中，不会发送到后端服务器。",
    "changelog.ngLectures.date": "2026-05-21 / 吴恩达深度学习课程",
    "changelog.ngLectures.l1": "新增 ng-lectures：28 章中英双语课程，涵盖机器学习基础、神经网络、CNN、RNN 与生成式 AI。",
    "changelog.ngLectures.l2": "与 transformer-lectures 一起注册到学习板块，支持完整国际化。",
    "changelog.beginnerCourses.date": "2026-06-04 / Git 与 Godot 新手课程",
    "changelog.beginnerCourses.l1": "新增 git-basics：10 章 Git 新手课程，覆盖安装配置、提交、分支、远端、冲突处理和安全协作。",
    "changelog.beginnerCourses.l2": "新增 godot-basics：12 章 Godot 4.6.3 新手课程，覆盖编辑器概念、GDScript、2D 小游戏、调试、版本控制和导出。",
    "changelog.engineCourses.date": "2026-06-04 / Unity 与 Unreal 新手课程",
    "changelog.engineCourses.l1": "新增 unity-basics：12 章 Unity 6.3 LTS 新手课程，覆盖编辑器概念、C# 脚本、2D 小项目、UI、数据、调试、Git 与构建。",
    "changelog.engineCourses.l2": "新增 unreal-basics：12 章 Unreal Engine 5.7 新手课程，覆盖编辑器概念、Blueprint、Gameplay Framework、3D 原型、UMG、打包与 Git LFS。",
    "changelog.v010.date": "2026-05-20 / v0.1.0",
    "changelog.v010.l1": "实现了静态 Next.js 前端，支持 GitHub Pages 和自定义域名部署。",
    "changelog.v010.l2": "新增了本地优先的加密、数据和在线工作流工具。",
    "changelog.v010.l3": "新增了 MDX 学习路线图和项目交接文档。",

    // Donate
    "donate.label": "捐赠",
    "donate.title": "支持页面预留",
    "donate.description": "v1 产品在项目具有实质性流量和明确的维护需求之前，不会在导航中展示捐赠入口。",

    // Study index
    "study.label": "学习",
    "study.title": "实用工程学习路线",
    "study.description": "学习笔记聚焦于设计决策、实现陷阱和生产习惯。",

    // Tools index
    "tools.label": "工具",
    "tools.title": "本地浏览器工程工具",
    "tools.description": "专注于请求体检查、API 调试、兼容性检查和隐私保护的数据转换工具。",

    // Tool detail
    "tool.explanation": "说明",
    "tool.securityNotice": "安全提示",
    "tool.defaultNotice": "所有处理尽可能在浏览器本地完成。除非另有说明，您的数据不会被上传。",

    // Tool workbench
    "workbench.algorithmSettings": "算法设置",
    "workbench.mode": "模式",
    "workbench.algorithm": "算法",
    "workbench.run": "运行",
    "workbench.reset": "重置",
    "workbench.select": "选择",
    "workbench.output": "输出",
    "workbench.copy": "复制",
    "workbench.copied": "已复制",
    "workbench.error.generic": "无法处理输入内容。",

    // Search
    "search.aria": "全局搜索",

    // Language switcher
    "lang.en": "English",
    "lang.zh": "中文",

    // Tool: AES
    "tool.aes.title": "AES 加密器",
    "tool.aes.summary": "使用 AES-GCM、AES-CBC 或 AES-ECB 加密和解密。支持多种 Padding 和密钥/IV/输入/输出编码。",
    "tool.aes.inputLabel": "明文或密文",
    "tool.aes.placeholder": "粘贴要加密的文本，或要解密的密文。",
    "tool.aes.secretLabel": "密码 / 密钥",
    "tool.aes.ivLabel": "IV",
    "tool.aes.explanation": "AES-GCM 使用 Web Crypto 配合 SHA-256 密钥派生。AES-CBC 和 AES-ECB 使用 CryptoJS，支持可配置 Padding。密钥、IV、输入和输出均支持文本、Base64 或 Hex 编码。",

    // Tool: DES
    "tool.des.title": "DES 兼容工具",
    "tool.des.summary": "DES 支持 CBC、ECB、CFB、OFB、CTR 模式，支持 Padding 和密钥/IV/输入/输出编码。",
    "tool.des.inputLabel": "明文或密文",
    "tool.des.placeholder": "粘贴要加密的文本，或要解密的密文。",
    "tool.des.secretLabel": "密钥",
    "tool.des.ivLabel": "IV",
    "tool.des.explanation": "DES 支持 CBC、ECB、CFB、OFB、CTR 模式（通过 CryptoJS）。块模式支持可配置 Padding。密钥、IV、输入和输出支持文本、Base64 或 Hex 编码。不推荐在新系统中使用 DES。",

    // Tool: SM4
    "tool.sm4.title": "SM4 兼容工具",
    "tool.sm4.summary": "SM4-CBC 和 SM4-ECB，支持可配置 Padding 以及密钥/IV/输入/输出编码。",
    "tool.sm4.inputLabel": "明文或密文",
    "tool.sm4.placeholder": "粘贴要加密的文本，或要解密的密文。",
    "tool.sm4.secretLabel": "密钥",
    "tool.sm4.ivLabel": "IV",
    "tool.sm4.explanation": "SM4 支持 CBC 和 ECB 模式。密钥和 IV 在内部转换为 32 字符 hex。支持文本、Base64 或 Hex 编码用于密钥、IV、输入和输出。",

    // Tool: Hash
    "tool.hash.title": "哈希生成器",
    "tool.hash.summary": "生成 MD5、SHA-1、SHA-256 和 SHA-512 摘要。输入支持文本、Base64 或 Hex 编码。",
    "tool.hash.inputLabel": "输入",
    "tool.hash.placeholder": "粘贴要哈希的文本。",
    "tool.hash.explanation": "SHA-256 或 SHA-512 适合指纹用途。MD5 和 SHA-1 包含在内用于兼容性检查。输入可以是文本、Base64 或 Hex。",

    // Tool: HMAC
    "tool.hmac.title": "HMAC 生成器",
    "tool.hmac.summary": "使用 HMAC-MD5、HMAC-SHA256 或 HMAC-SHA512 生成带密钥的摘要。密钥和消息支持多种编码。",
    "tool.hmac.inputLabel": "消息",
    "tool.hmac.placeholder": "粘贴消息文本。",
    "tool.hmac.secretLabel": "密钥",
    "tool.hmac.explanation": "HMAC 适用于 Webhook 签名和请求验证。密钥和消息支持文本、Base64 或 Hex 编码。",

    // Tool: JSON Formatter
    "tool.jsonFormatter.title": "JSON 格式化",
    "tool.jsonFormatter.summary": "格式化、压缩和验证 JSON，无需上传。",
    "tool.jsonFormatter.inputLabel": "JSON",
    "tool.jsonFormatter.placeholder": '{"message":"在此粘贴 JSON"}',
    "tool.jsonFormatter.explanation": "专注于请求体检查、API 调试和提示词模板清理的 JSON 格式化工具。",

    // Tool: JSON Diff
    "tool.jsonDiff.title": "JSON 对比",
    "tool.jsonDiff.summary": "比较两个 JSON 文档并展示结构差异。",
    "tool.jsonDiff.inputLabel": "左侧 JSON",
    "tool.jsonDiff.secondaryInputLabel": "右侧 JSON",
    "tool.jsonDiff.placeholder": '{"temperature":0.2,"stream":true}',
    "tool.jsonDiff.secondaryPlaceholder": '{"temperature":0.3,"stream":true,"seed":7}',
    "tool.jsonDiff.explanation": "差异输出基于路径，适合检查配置和 API 响应漂移。",

    // Tool: Base64 Text
    "tool.base64Text.title": "Base64 文本",
    "tool.base64Text.summary": "将 UTF-8 文本编码和解码为 Base64。",
    "tool.base64Text.inputLabel": "文本或 Base64",
    "tool.base64Text.placeholder": "粘贴 UTF-8 文本或 Base64。",
    "tool.base64Text.explanation": "适用于小字符串、token 和请求模板的 UTF-8 安全 Base64 转换。",

    // Tool: Base64 Image
    "tool.base64Image.title": "Base64 图片",
    "tool.base64Image.summary": "将图片文件转为 Base64，或将 Base64 解码回图片并自动检测格式。",
    "tool.base64Image.inputLabel": "图片文件或 Base64",
    "tool.base64Image.placeholder": "选择一张图片文件，或在此粘贴 Base64。",
    "tool.base64Image.explanation": "编码：通过 FileReader 将图片文件转为 Base64 Data URL。解码：接受带或不带 data URL 前缀的 Base64，从文件头自动检测 PNG/JPEG/GIF/WebP/BMP/SVG 格式并渲染图片。",

    // Tool: URL Encoder
    "tool.urlEncoder.title": "URL 编码器",
    "tool.urlEncoder.summary": "编码或解码 URL 组件。",
    "tool.urlEncoder.inputLabel": "URL 组件",
    "tool.urlEncoder.placeholder": "粘贴要编码或解码的文本。",
    "tool.urlEncoder.explanation": "使用百分号转义对单个 URL 组件进行编码，并将其解码回可读文本。",

    // Tool: Timestamp Converter
    "tool.timeConverter.title": "时间戳转换器",
    "tool.timeConverter.summary": "在 Unix 时间戳与可读日期之间转换。",
    "tool.timeConverter.inputLabel": "时间戳或日期",
    "tool.timeConverter.placeholder": "粘贴 Unix 时间戳或 ISO 日期。",
    "tool.timeConverter.explanation": "获取当前时间、将 Unix 时间戳转换为本地/UTC 日期，或将日期字符串转换为时间戳。支持秒、毫秒和微秒。",

    // Tool: UUID Generator
    "tool.uuid.title": "UUID 生成器",
    "tool.uuid.summary": "批量生成随机 UUID v4 或按时间排序的 UUID v7，支持大写与连字符选项。",
    "tool.uuid.inputLabel": "UUID",
    "tool.uuid.placeholder": "生成的 UUID 会显示在这里。",
    "tool.uuid.explanation": "UUID v4 完全随机；UUID v7 内嵌 Unix 时间戳，值大致按生成时间排序。所有 UUID 均通过 crypto.getRandomValues 在本地生成。",
    "tool.uuid.option.version": "版本",
    "tool.uuid.option.count": "数量",
    "tool.uuid.option.uppercase": "大写",
    "tool.uuid.option.hyphens": "包含连字符",

    // Tool: Password Generator
    "tool.password.title": "密码生成器",
    "tool.password.summary": "生成随机密码，可配置长度、字符集，并可排除易混淆字符。",
    "tool.password.inputLabel": "密码",
    "tool.password.placeholder": "生成的密码会显示在这里。",
    "tool.password.explanation": "密码通过 crypto.getRandomValues 在本地生成，不会存储或上传。排除易混淆字符会移除 0/O、1/l/I 等形近字符。",
    "tool.password.option.length": "长度",
    "tool.password.option.count": "数量",
    "tool.password.option.lowercase": "小写字母 (a-z)",
    "tool.password.option.uppercase": "大写字母 (A-Z)",
    "tool.password.option.digits": "数字 (0-9)",
    "tool.password.option.symbols": "符号",
    "tool.password.option.excludeAmbiguous": "排除易混淆字符",
    "tool.password.error.noCharset": "请至少选择一种字符集。",

    // Tool: Text Diff
    "tool.textDiff.title": "文本对比",
    "tool.textDiff.summary": "逐行比较两段文本，展示新增与删除。",
    "tool.textDiff.inputLabel": "左侧文本",
    "tool.textDiff.placeholder": "粘贴原始文本。",
    "tool.textDiff.explanation": "基于行的 diff：相同行以两个空格开头，删除行以 - 开头，新增行以 + 开头。两段文本一致时返回 (no differences)。",

    // Tool: Case Converter
    "tool.caseConverter.title": "命名风格转换",
    "tool.caseConverter.summary": "在 camelCase、PascalCase、snake_case、kebab-case、CONSTANT_CASE 以及纯小写/大写之间转换。",
    "tool.caseConverter.inputLabel": "文本",
    "tool.caseConverter.placeholder": "粘贴要转换的文本。",
    "tool.caseConverter.explanation": "逐行独立转换。按非字母数字字符和 camelCase 边界拆词。",

    // Tool: String Escape
    "tool.stringEscape.title": "字符串转义",
    "tool.stringEscape.summary": "使用 \\n、\\t、\\uXXXX 等反斜杠序列转义或还原字符串。",
    "tool.stringEscape.inputLabel": "文本",
    "tool.stringEscape.placeholder": "粘贴要转义或还原的文本。",
    "tool.stringEscape.explanation": "转义会把反斜杠、引号、换行、制表符和回车转换为转义序列，非 ASCII 字符保持原样；还原执行反向操作，支持 \\uXXXX。",

    // Tool: JWT Decoder
    "tool.jwt.title": "JWT 解码器",
    "tool.jwt.summary": "在本地解码 JWT 的 header 和 payload，可选 HMAC 签名校验。",
    "tool.jwt.inputLabel": "JWT",
    "tool.jwt.placeholder": "粘贴 JWT（header.payload.signature）。",
    "tool.jwt.secretLabel": "HMAC 密钥（可选）",
    "tool.jwt.explanation": "解码 header 与 payload，并显示算法、过期与校验状态。只有提供 HMAC 密钥（HS256/384/512）时才会校验签名。解码不等于验证——不要信任未校验的声明。",

    // Tool: Markdown Preview
    "tool.markdownPreview.title": "Markdown 预览",
    "tool.markdownPreview.summary": "左侧编写 Markdown，右侧实时渲染预览。",
    "tool.markdownPreview.inputLabel": "Markdown",
    "tool.markdownPreview.placeholder": "在此输入或粘贴 Markdown。",
    "tool.markdownPreview.explanation": "预览使用与学习页面相同的轻量渲染器，支持标题、列表、表格、引用、代码块和图片。所有渲染均在浏览器本地完成。",
    "tool.markdownPreview.previewLabel": "预览",

    // Tool: Regex Tester
    "tool.regex.title": "正则测试器",
    "tool.regex.summary": "对文本测试正则表达式，查看匹配区间与捕获组。",
    "tool.regex.inputLabel": "文本",
    "tool.regex.placeholder": "粘贴要搜索的文本。",
    "tool.regex.explanation": "支持 (?i)、(?m)、(?s) 等内联标志。输出列出每个匹配的区间、内容与捕获组。",

    // Tool: File Hash
    "tool.fileHash.title": "文件哈希",
    "tool.fileHash.summary": "计算本地文件的 MD5、SHA-1、SHA-256 或 SHA-512 摘要。",
    "tool.fileHash.inputLabel": "文件",
    "tool.fileHash.placeholder": "选择要计算哈希的文件。",
    "tool.fileHash.explanation": "文件读入内存后完全在浏览器本地计算哈希，不会上传。由于整个文件会驻留内存，建议文件小于 500MB。",

    // Tool: Color Converter
    "tool.colorConverter.title": "颜色转换器",
    "tool.colorConverter.summary": "在 HEX、RGB、HSL 之间转换颜色，并实时显示色板预览。",
    "tool.colorConverter.inputLabel": "颜色",
    "tool.colorConverter.placeholder": "#3b82f6、rgb(59,130,246) 或 hsl(217,91%,60%)",
    "tool.colorConverter.explanation": "接受 #rgb、#rrggbb、rgb(r,g,b) 和 hsl(h,s%,l%) 格式，输出 HEX、RGB、HSL 值并显示色板预览。",

    // Tool: Key Pair Generator
    "tool.keygen.title": "密钥对生成器",
    "tool.keygen.summary": "生成 RSA-OAEP 或椭圆曲线（ECDSA/ECDH）密钥对，并导出为 JWK。",
    "tool.keygen.inputLabel": "密钥对",
    "tool.keygen.placeholder": "生成的密钥会显示在这里。",
    "tool.keygen.explanation": "密钥通过 Web Crypto（crypto.subtle）生成并导出为 JWK。RSA-OAEP 支持 2048/4096 位加密密钥；ECDSA 与 ECDH 使用 P-256 曲线。",
    "tool.keygen.option.algorithm": "算法",
    "tool.keygen.publicKey": "公钥 (JWK)",
    "tool.keygen.privateKey": "私钥 (JWK)",
    "tool.keygen.localNote": "密钥在浏览器本地生成，不会上传。请妥善保存私钥——丢失后无法找回。",

    // Tool: URL Parser
    "tool.urlParser.title": "URL 解析器",
    "tool.urlParser.summary": "将 URL 拆解为协议、主机、端口、路径、查询参数和片段。",
    "tool.urlParser.inputLabel": "URL",
    "tool.urlParser.placeholder": "粘贴完整 URL。",
    "tool.urlParser.explanation": "解析绝对 URL 并列出所有查询参数，非法 URL 会报错。",

    // Tool: Date Calculator
    "tool.dateCalc.title": "日期计算器",
    "tool.dateCalc.summary": "计算两个日期的差值、为日期加上时长，或将日期转换到其它时区。",
    "tool.dateCalc.inputLabel": "日期",
    "tool.dateCalc.placeholder": "2026-07-17T09:00:00Z",
    "tool.dateCalc.explanation": 'diff 展示两个日期之间的差值（天/时/分/秒）；add 支持 "2w 3d 4h 30m" 这样的时长；toZone 按所选时区格式化日期。',

    // Tool: Number Base Converter
    "tool.baseConverter.title": "进制转换器",
    "tool.baseConverter.summary": "在二进制、八进制、十进制、十六进制之间转换整数，支持任意精度。",
    "tool.baseConverter.inputLabel": "数值",
    "tool.baseConverter.placeholder": "0xFF、0b1010、0o17 或 255",
    "tool.baseConverter.explanation": "Auto 模式识别 0x/0b/0o 前缀，默认按十进制处理。基于 BigInt 实现，超大整数也能精确转换。",

    // Tool: YAML ↔ JSON
    "tool.yamlJson.title": "YAML ↔ JSON",
    "tool.yamlJson.summary": "YAML 与 JSON 互相转换。",
    "tool.yamlJson.inputLabel": "YAML 或 JSON",
    "tool.yamlJson.placeholder": "粘贴 YAML 或 JSON。",
    "tool.yamlJson.explanation": "转 JSON：解析 YAML 并以 2 空格缩进输出 JSON；转 YAML：解析 JSON 并输出 YAML。非法输入会返回解析错误。",

    // Tool: QR Code Generator
    "tool.qr.title": "二维码生成器",
    "tool.qr.summary": "在本地生成二维码，可选尺寸与纠错级别，并可下载 PNG。",
    "tool.qr.inputLabel": "文本",
    "tool.qr.placeholder": "要编码的文本或 URL。",
    "tool.qr.explanation": "文本按 UTF-8 编码并完全在浏览器中绘制到画布。更高的纠错级别（Q/H）容错更强，但图案更密。",
    "tool.qr.option.size": "尺寸",
    "tool.qr.option.errorCorrection": "纠错级别",
    "tool.qr.download": "下载 PNG",

    // Tool: Cron Parser
    "tool.cron.title": "Cron 表达式解析",
    "tool.cron.summary": "解析标准 5 段 cron 表达式，并预览接下来的执行时间。",
    "tool.cron.inputLabel": "Cron 表达式",
    "tool.cron.placeholder": "*/15 9-18 * * 1-5",
    "tool.cron.explanation": "仅支持标准 5 段 cron：分 时 日 月 周。支持 * , - / 以及三位英文月/周缩写。不支持 L、W、#、@daily、秒字段等扩展语法。执行时间按本地时区显示。",

    // Study pages
    "study.transformerLectures.title": "Transformer 系列课程",
    "study.transformerLectures.summary": "30 章中英双语课程，从 Tensor 基础到 Transformer 内核、Diffusion、源码阅读与模型魔改。",
    "study.ngLectures.title": "吴恩达深度学习",
    "study.ngLectures.summary": "28 章中英双语课程，涵盖机器学习基础、神经网络、CNN、RNN 与生成式 AI。",
    "study.gitBasics.title": "Git 新手教程",
    "study.gitBasics.summary": "面向新手的详细 Git 课程，覆盖概念、命令行流程、分支、远端、冲突和安全协作习惯。",
    "study.godotBasics.title": "Godot 4.6.3 新手教程",
    "study.godotBasics.summary": "面向游戏开发新手的 Godot 4.6.3 课程，从编辑器基础到可玩的 2D 项目和导出流程。",
    "study.unityBasics.title": "Unity 6.3 LTS 新手教程",
    "study.unityBasics.summary": "面向游戏开发新手的 Unity 6.3 LTS 课程，从编辑器基础到可玩的 2D 项目和构建流程。",
    "study.unrealBasics.title": "Unreal Engine 5.7 新手教程",
    "study.unrealBasics.summary": "面向新手的 Unreal Engine 5.7 课程，从编辑器基础、Blueprint 到可玩的 3D 原型。",

    // Levels
    "level.Foundation": "基础",
    "level.Intermediate": "进阶",
    "level.Advanced": "高级",

    // Categories
    "category.Crypto": "加密",
    "category.Data": "数据",
    "category.Text": "文本",
    "category.Generator": "生成器",
    "category.Converter": "转换器",

    // Operations
    "op.encrypt": "加密",
    "op.decrypt": "解密",
    "op.hash": "哈希",
    "op.hmac": "HMAC",
    "op.format": "格式化",
    "op.minify": "压缩",
    "op.diff": "对比",
    "op.encode": "编码",
    "op.decode": "解码",
    "op.escape": "转义",
    "op.parse": "解析",
    "op.estimate": "估算",
    "op.toDate": "转日期",
    "op.toTimestamp": "转时间戳",
    "op.now": "当前时间",
    "op.camel": "小驼峰",
    "op.pascal": "大驼峰",
    "op.snake": "下划线",
    "op.kebab": "短横线",
    "op.constant": "常量",
    "op.lower": "小写",
    "op.upper": "大写",
    "op.unescape": "还原",
    "op.match": "匹配",
    "op.convert": "转换",
    "op.toJSON": "转 JSON",
    "op.toYAML": "转 YAML",
    "op.add": "加时长",
    "op.toZone": "转时区",
    "op.generate": "生成",

    // Workbench errors
    "error.aes.secretRequired": "密码是必填项。",
    "error.aes.ivRequired": "AES CBC 解密需要 IV。",
    "error.des.secretRequired": "DES 密钥是必填项。",
    "error.sm4.secretRequired": "SM4 密钥是必填项。",
    "error.sm4.ivRequired": "SM4 CBC 模式需要 IV。",
    "error.hmac.secretRequired": "密钥是必填项。",
    "error.unsupportedTool": "不支持的工具。",
  },
} as const;

export type Dict = typeof dict.en;
export type DictKey = keyof Dict;
