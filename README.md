# SilverIce Toolbox

SilverIce Toolbox is a local-first toolbox and study site for developers.

The project follows the v1 spec in [`AI_Engineer_Toolbox_Spec_v1.md`](AI_Engineer_Toolbox_Spec_v1.md): browser-side processing whenever possible, no public accounts, and only minimal D1-backed aggregate analytics.

## What Is Included

- 11 browser tools across crypto, data, and online workflows
  - Crypto tools (AES, DES, SM4, Hash, HMAC) store key/IV history in localStorage for quick reuse
- 7 integrated study courses:
  - Transformer Lectures: 30 bilingual chapters with Python examples
  - Andrew Ng Deep Learning: 28 bilingual chapters with Python examples
  - Git Beginner Course: 10 beginner chapters for command-line Git and collaboration
  - Godot 4.6.3 Beginner Course: 12 beginner chapters for a playable 2D game workflow
  - Unity 6.3 LTS Beginner Course: 12 beginner chapters for a playable 2D game workflow
  - Unreal Engine 5.7 Beginner Course: 12 beginner chapters for a playable 3D prototype workflow
  - AI Agent Engineering: 40 bilingual chapters for backend engineers covering manual agents, MCP/LSP/A2A, AI-assisted development, orchestration, and production engineering, with runnable multi-language labs
- Static Next.js export served by Cloudflare Workers Static Assets
- Cloudflare D1-backed visit tracking and simple login protection for study content
- Monorepo structure with reusable utility packages

## Project Structure

```txt
apps/web          Next.js static frontend
content/courses   Long-form course content rendered into static study pages
packages/ui       Shared UI class helpers
packages/utils    Browser-safe utility functions and tests
docs              Agent handoff, plan, progress, and acceptance docs
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Validation

```bash
npm run lint
npm run test
npm run typecheck
npm run build
```

## Cloudflare Workers Deployment

The web app is configured with `output: "export"`. Cloudflare Workers serves the exported files from `apps/web/out` through Workers Static Assets, while `apps/web/functions/worker.ts` handles `/api/*` routes and D1 access.

Use these Cloudflare Worker build settings:

```bash
npm run build
npm run worker:deploy
```

The root `wrangler.jsonc` contains:

```txt
main: ./apps/web/functions/worker.ts
assets.directory: ./apps/web/out
D1 binding: DB
```

For direct local CLI deployment:

```bash
npm run build
npm run worker:deploy
```

## Privacy Model

Tool inputs are processed locally in the browser whenever possible. The deployed site includes D1-backed visit tracking and a simple session-cookie login for study content.

## Language

The UI supports English and Chinese. English is the default first paint language; the language switcher stores the user's preference in `localStorage`.
