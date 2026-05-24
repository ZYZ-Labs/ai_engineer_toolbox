export type Lang = "en" | "zh";

export const defaultLang: Lang = "en";

export const dict = {
  en: {
    // Header
    "nav.tools": "Tools",
    "nav.study": "Study",
    "nav.about": "About",
    "nav.changelog": "Changelog",
    "site.name": "AI Engineer Toolbox",

    // Footer
    "footer.line1": "AI Engineer Toolbox is open source, local-first, and intentionally minimal on server-side features.",
    "footer.line2": "All processing happens locally in your browser whenever possible. Your data is not uploaded unless explicitly stated.",

    // Home
    "home.badge": "Local-first engineering workstation",
    "home.title": "AI Engineer Toolbox",
    "home.description": "A focused collection of browser-side tools and study pages for AI application engineers who work with prompts, payloads, streaming APIs, retrieval systems, and integration security.",
    "home.search.placeholder": "Search AES, JSON, SSE, RAG...",
    "home.section.recentlyUsed": "Recently Used",
    "home.section.aiTools": "AI Tools",
    "home.section.cryptoTools": "Crypto Tools",
    "home.section.study": "Study",
    "home.viewAll": "View all",
    "home.updates.title": "Recent Updates",
    "home.updates.v1": "v1 implementation with static export, Cloudflare Worker deployment, and custom domain support.",
    "home.updates.tools": "Added local browser tools for crypto, JSON, Base64, URL, SSE, messages, prompts, and token estimation.",
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
    "about.title": "A small toolbox for real AI application work",
    "about.p1": "AI Engineer Toolbox keeps v1 intentionally simple: browser-side tools, practical study pages, no public accounts, no ads, and only minimal D1-backed aggregate analytics.",
    "about.p2": "The goal is to help engineers inspect payloads, debug streaming APIs, prepare prompt fixtures, validate signatures, and study the systems that matter around modern AI applications.",

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
    "changelog.v010.date": "2026-05-20 / v0.1.0",
    "changelog.v010.l1": "Implemented the static Next.js frontend for GitHub Pages and custom domain deployment.",
    "changelog.v010.l2": "Added local-first tools for crypto, data, and AI engineering workflows.",
    "changelog.v010.l3": "Added MDX study roadmaps and project handoff documentation.",

    // Donate
    "donate.label": "Donate",
    "donate.title": "Support page reserved",
    "donate.description": "The v1 product keeps donation entry points hidden from navigation until the project has meaningful traffic and a clear maintenance need.",

    // Study index
    "study.label": "Study",
    "study.title": "Roadmaps for practical AI engineering",
    "study.description": "Study notes focus on design decisions, implementation traps, and production habits rather than generic AI summaries.",

    // Tools index
    "tools.label": "Tools",
    "tools.title": "Local browser tools for engineering work",
    "tools.description": "Focused utilities for payload inspection, AI API debugging, compatibility checks, and privacy-preserving data transforms.",

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

    // Tool: AI Chat
    "tool.aiChat.title": "AI Chat",
    "tool.aiChat.summary": "Multi-provider AI chat with OpenAI, Anthropic, Gemini, DeepSeek, OpenRouter, and more. API key stored locally.",
    "tool.aiChat.inputLabel": "Message",
    "tool.aiChat.placeholder": "Type your message...",
    "tool.aiChat.explanation": "Connect to multiple AI providers directly from your browser. Your API key is stored in localStorage and never sent to our servers. Supports streaming responses. Some providers require a CORS proxy for browser access.",

    // Study pages
    "study.transformerLectures.title": "Transformer Lectures",
    "study.transformerLectures.summary": "A 30-chapter bilingual course from tensor basics to Transformer internals, diffusion, and source hacking.",
    "study.ngLectures.title": "Andrew Ng Deep Learning",
    "study.ngLectures.summary": "A 28-chapter bilingual course covering ML fundamentals, neural networks, CNN, RNN, and generative AI.",

    // Levels
    "level.Foundation": "Foundation",
    "level.Intermediate": "Intermediate",
    "level.Advanced": "Advanced",

    // Categories
    "category.AI Engineering": "AI Engineering",
    "category.Crypto": "Crypto",
    "category.Data": "Data",

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
    "site.name": "AI Engineer Toolbox",

    // Footer
    "footer.line1": "AI Engineer Toolbox 是开源的、本地优先的，并刻意保持最小化服务端能力。",
    "footer.line2": "所有处理尽可能在浏览器本地完成。除非另有说明，您的数据不会被上传。",

    // Home
    "home.badge": "本地优先的工程工作站",
    "home.title": "AI Engineer Toolbox",
    "home.description": "为 AI 应用工程师精心整理的浏览器端工具和学习页面，涵盖提示词、请求体、流式 API、检索系统和集成安全。",
    "home.search.placeholder": "搜索 AES、JSON、SSE、RAG...",
    "home.section.recentlyUsed": "最近使用",
    "home.section.aiTools": "AI 工具",
    "home.section.cryptoTools": "加密工具",
    "home.section.study": "学习",
    "home.viewAll": "查看全部",
    "home.updates.title": "最近更新",
    "home.updates.v1": "v1 实现：静态导出、Cloudflare Worker 部署和自定义域名支持。",
    "home.updates.tools": "新增本地浏览器工具：加密、JSON、Base64、URL、SSE、消息、提示词和 token 估算。",
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
    "about.title": "为真实 AI 应用工作准备的小工具箱",
    "about.p1": "AI Engineer Toolbox 的 v1 版本刻意保持简单：浏览器端工具、实用的学习页面、无公开账号、没有广告，只保留最小化的 D1 聚合访问统计。",
    "about.p2": "目标是帮助工程师检查请求体、调试流式 API、准备提示词模板、验证签名，并学习现代 AI 应用周围重要的系统知识。",

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
    "changelog.v010.date": "2026-05-20 / v0.1.0",
    "changelog.v010.l1": "实现了静态 Next.js 前端，支持 GitHub Pages 和自定义域名部署。",
    "changelog.v010.l2": "新增了本地优先的加密、数据和 AI 工程工作流工具。",
    "changelog.v010.l3": "新增了 MDX 学习路线图和项目交接文档。",

    // Donate
    "donate.label": "捐赠",
    "donate.title": "支持页面预留",
    "donate.description": "v1 产品在项目具有实质性流量和明确的维护需求之前，不会在导航中展示捐赠入口。",

    // Study index
    "study.label": "学习",
    "study.title": "实用 AI 工程学习路线",
    "study.description": "学习笔记聚焦于设计决策、实现陷阱和生产习惯，而非泛泛的 AI 总结。",

    // Tools index
    "tools.label": "工具",
    "tools.title": "本地浏览器工程工具",
    "tools.description": "专注于请求体检查、AI API 调试、兼容性检查和隐私保护的数据转换工具。",

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

    // Tool: AI Chat
    "tool.aiChat.title": "AI 对话",
    "tool.aiChat.summary": "多供应商 AI 对话，支持 OpenAI、Anthropic、Gemini、DeepSeek、OpenRouter 等。API 密钥本地存储。",
    "tool.aiChat.inputLabel": "消息",
    "tool.aiChat.placeholder": "输入消息...",
    "tool.aiChat.explanation": "直接从浏览器连接多个 AI 供应商。您的 API 密钥存储在 localStorage 中，不会发送到我们的服务器。支持流式响应。部分供应商需要 CORS 代理才能在浏览器中访问。",

    // Study pages
    "study.transformerLectures.title": "Transformer 系列课程",
    "study.transformerLectures.summary": "30 章中英双语课程，从 Tensor 基础到 Transformer 内核、Diffusion、源码阅读与模型魔改。",
    "study.ngLectures.title": "吴恩达深度学习",
    "study.ngLectures.summary": "28 章中英双语课程，涵盖机器学习基础、神经网络、CNN、RNN 与生成式 AI。",

    // Levels
    "level.Foundation": "基础",
    "level.Intermediate": "进阶",
    "level.Advanced": "高级",

    // Categories
    "category.AI Engineering": "AI 工程",
    "category.Crypto": "加密",
    "category.Data": "数据",

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
