# AI Engineer Toolbox - Project Spec v1

## Project Overview

A modern tool and study aggregation website designed for AI application engineers.

Core philosophy:

- Local-first processing
- No user accounts
- No unnecessary backend
- Privacy-focused
- Small number of high-quality tools
- Beautiful light-theme UI
- Open source and transparent

---

# 1. Project Goals

Build a website focused on:

- Developer tools
- AI engineering workflows
- Learning resources
- Privacy-first browser tools

The project should feel like:

> A clean and modern engineering workstation.

Not:

> A random SEO tool landfill with 300 useless buttons.

---

# 2. Core Principles

## 2.1 Local First

All processing should happen in the browser whenever possible.

Examples:

- JSON formatting
- Base64 conversion
- AES encryption
- SM4 encryption
- JWT parsing
- Markdown preview
- Hash generation

User data should not be uploaded unless explicitly stated.

---

## 2.2 Minimal Backend

Version 1 should avoid backend services entirely unless absolutely necessary.

Backend should only exist for:

- Third-party API integrations
- Large file processing
- Features impossible in browser
- Secret-protected operations

---

## 2.3 Quality Over Quantity

Version 1 target:

- 10 high-quality tools
- 5–10 high-quality study pages

Avoid becoming a “100-button utility cemetery”.

---

# 3. Site Structure

```txt
/
├── tools
├── study
├── about
├── changelog
└── donate
```

Donate remains hidden until traffic reaches meaningful levels.

---

# 4. Tool Categories

# 4.1 Crypto Tools

```txt
/tools/crypto/aes
/tools/crypto/des
/tools/crypto/sm4
/tools/crypto/hash
/tools/crypto/hmac
```

## AES

Supported modes:

- AES-GCM
- AES-CBC

Default:

- AES-GCM

Implementation:

- Web Crypto API

---

## DES

Supported modes:

- DES-CBC
- DES-ECB

Notes:

- Compatibility only
- Not recommended for new systems

Implementation:

- crypto-js

---

## SM4

Supported modes:

- SM4-CBC
- SM4-ECB

Implementation:

- sm-crypto

---

## Hash

Supported:

- MD5
- SHA-1
- SHA-256
- SHA-512

---

## HMAC

Supported:

- HMAC-MD5
- HMAC-SHA256
- HMAC-SHA512

---

# 4.2 Data Tools

```txt
/tools/json/formatter
/tools/json/diff
/tools/base64/text
/tools/base64/image
/tools/url/encode
```

---

# 4.3 AI Engineering Tools

```txt
/tools/ai/messages-formatter
/tools/ai/prompt-escape
/tools/ai/sse-parser
/tools/ai/token-estimator
```

---

# 5. Study Section

```txt
/study/transformer-roadmap
/study/rag-roadmap
/study/agent-roadmap
/study/ai-app-engineering
```

Content format:

- MDX

Study pages should include:

- Learning paths
- Engineering practices
- Pitfalls
- Real-world experience
- Tooling recommendations

Avoid generic AI-generated filler content.

---

# 6. UI Design Spec

## Theme

- Light theme first
- Minimal
- Professional
- Calm and readable

No cyberpunk or esports aesthetics.

---

## Style Keywords

- Clean
- Soft
- Modern
- Developer-oriented
- Minimal
- Readable

---

## Colors

### Background

```txt
#f8f9fb
#fafafa
```

### Cards

```txt
Background: #ffffff
Border: #ececec
```

### Primary Color

```txt
#4F46E5
```

---

## Radius

```txt
16px
```

---

## Shadow

Use:

- Soft subtle shadows

Avoid:

- Heavy glow
- Neon effects
- Oversaturated UI

---

## Typography

### Chinese

- MiSans
- HarmonyOS Sans
- Noto Sans SC

### English

- Inter

---

# 7. Homepage Layout

## Hero Section

Contains:

- Title
- Description
- Global Search

---

## Main Sections

```txt
Featured Tools
AI Tools
Crypto Tools
Study
Recent Updates
```

---

# 8. Tool Page Layout

```txt
Header
Config Panel
Input
Output
Explanation
Security Notice
```

Recommended layout:

```txt
┌────────────────────┐
│ Algorithm Settings │
├─────────┬──────────┤
│ Input   │ Output   │
│         │          │
└─────────┴──────────┘
```

---

# 9. Security Principles

Every tool page should display:

```txt
All processing happens locally in your browser whenever possible.
Your data is not uploaded unless explicitly stated.
```

---

# 10. Analytics

Recommended:

- Umami

Track:

- PV
- UV
- Top Pages
- Referrer
- Search Keywords

Avoid overly complex analytics systems.

---

# 11. Deployment

## Frontend

Recommended:

- GitHub Pages
- Cloudflare Pages

---

## CDN

Recommended:

- Cloudflare

---

# 12. Tech Stack

## Recommended

```txt
Next.js
Tailwind CSS
shadcn/ui
MDX
Framer Motion
```

---

## Alternative

```txt
Astro
```

Suitable when:

- More content-focused
- Less interactive

---

# 13. Repository Structure

```txt
/apps/web
/content/study
/packages/ui
/packages/utils
```

---

# 14. Open Source

Recommended license:

- MIT

The project should remain fully transparent and inspectable.

---

# 15. Non-Goals

Version 1 intentionally excludes:

- User accounts
- Database systems
- Comments
- Community features
- AI chatbots
- Cloud storage
- Membership systems
- Ads
- Complex backend architecture

The goal is to stay focused and maintainable.

---

# 16. Product Positioning

The website should feel like:

> A real toolbox built by an AI engineer for actual engineering work.

Not:

> A generic SEO-driven utility website.

