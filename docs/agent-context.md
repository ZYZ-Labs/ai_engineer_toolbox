# Agent Context

## Current Status

- Main task: implement AI Engineer Toolbox v1 from `AI_Engineer_Toolbox_Spec_v1.md`.
- **New feature**: D1 database + visit tracking + auth system integrated.
- Deployment target: **Cloudflare Workers** with Workers Static Assets + D1.
- Main entry: `apps/web/src/app/page.tsx`.
- Tool registry: `apps/web/src/lib/tool-registry.ts`.
- Tool execution: `apps/web/src/components/tools/ToolWorkbench.tsx`.
- Study content:
  - Transformer lecture course: `content/courses/transformer-lectures`.
  - Andrew Ng course: `content/courses/lectures-source/course_ng`.
  - Git beginner course: `content/courses/beginner-courses/git-basics`.
  - Godot 4.6.3 beginner course: `content/courses/beginner-courses/godot-basics`.
  - Unity 6.3 LTS beginner course: `content/courses/beginner-courses/unity-basics`.
  - Unreal Engine 5.7 beginner course: `content/courses/beginner-courses/unreal-basics`.
- **I18n added**: Client-side i18n with `en` as the default first paint language and `zh` support.
- **Auth system**: Hidden admin login at `/login`, session cookies, detailed stats protected by admin session.
- **Visit tracking**: `VisitTracker` component + `POST /api/visit` with daily IP deduplication.
- **Analytics API**: `GET /api/stats` (admin-only).
- **Beginner study courses**: `/study/git-basics`, `/study/godot-basics`, `/study/unity-basics`, and `/study/unreal-basics` use the shared static beginner-course route under `apps/web/src/app/study/[course]`.
- Latest beginner-course content update: on 2026-06-18, Git/Godot/Unity/Unreal lessons received Windows PowerShell and Command Prompt guidance; Godot lessons received local SVG diagrams rendered through Markdown image support.
- Follow-up content update: command/code blocks now render visible short labels such as `PowerShell`, `cmd`, and `Git Bash / macOS / Linux`; Windows examples avoid native PowerShell-only commands where simple `cmd` or Git Bash equivalents are clearer.
- Latest beginner-course validation before this update: `npm run typecheck`, `npm run build`, `npm run test`, and targeted ESLint for new course files passed on 2026-06-04 after adding Git, Godot, Unity, and Unreal courses.

## Deployment Context

- Target repository: `https://github.com/ZYZ-Labs/ai_engineer_toolbox.git`.
- Target hosting: **Cloudflare Workers** (with D1 + Workers Static Assets).
- Custom domain: `toolbox.silvericekey.fun` (DNS must point to Cloudflare).
- Static output: `apps/web/out`.
- Worker entry: `apps/web/functions/worker.ts`.
- API handlers reused from: `apps/web/functions/api/`.
- Workers workflow: `.github/workflows/pages.yml`.
- D1 config: `wrangler.jsonc`.
- Setup guide: `docs/guides/D1_SETUP.md`.

## Key Files for Auth/Analytics

- API handlers: `apps/web/functions/api/` (visit, stats, auth/*)
- Auth utilities: `apps/web/src/lib/auth.ts`
- Login page: `apps/web/src/app/login/page.tsx`
- DB schema: `scripts/init-db.sql`
- Admin creation: `scripts/create-admin.mjs`

## Validation Entry

- Install: `npm install` or `npm ci`.
- Development server: `npm run dev` (frontend only) or `npm run pages:dev` (with Functions).
- Checks: `npm run lint`, `npm run test`, `npm run typecheck`, `npm run build`.
- New beginner-course sample routes:
  - `/study/git-basics/stage1/chapter01_install_setup`
  - `/study/godot-basics/stage1/chapter01_install_editor`
  - `/study/godot-basics/stage1/chapter02_nodes_scenes`
  - `/study/godot-basics/stage3/chapter11_export_release`
  - `/study/unity-basics/stage1/chapter01_install_editor`
  - `/study/unreal-basics/stage1/chapter01_install_editor`
- Cloudflare deploy command from repo root: `npm run worker:deploy` or `npm run pages:deploy` (compat alias); both run `wrangler deploy`.

## Current Risks

- GitHub Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` must be configured.
- DNS for `toolbox.silvericekey.fun` must point to the Cloudflare Worker route/custom domain.
- Client-side protection means course content is still present in static HTML (acceptable for personal use).
- `npm audit` still reports a moderate PostCSS advisory from Next.js 16.2.6's nested `postcss@8.4.31`.
- Cloudflare dashboard must build before deploy so `apps/web/out` exists for Workers Static Assets.
- Full `npm run lint` currently fails on pre-existing AI Chat lint issues in `AiChatWorkbench.tsx` and `ai-providers.ts`; targeted lint for the new beginner-course files passes.
- Markdown image rendering is intentionally simple and supports standalone `![alt](src)` lines for trusted course content.
