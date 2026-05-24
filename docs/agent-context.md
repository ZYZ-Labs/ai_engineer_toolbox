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
- **I18n added**: Client-side i18n with `en` as the default first paint language and `zh` support.
- **Auth system**: Hidden admin login at `/login`, session cookies, detailed stats protected by admin session.
- **Visit tracking**: `VisitTracker` component + `POST /api/visit` with daily IP deduplication.
- **Analytics API**: `GET /api/stats` (admin-only).

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
- Cloudflare deploy command from repo root: `npm run worker:deploy` or `npm run pages:deploy` (compat alias); both run `wrangler deploy`.

## Current Risks

- GitHub Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` must be configured.
- DNS for `toolbox.silvericekey.fun` must point to the Cloudflare Worker route/custom domain.
- Client-side protection means course content is still present in static HTML (acceptable for personal use).
- `npm audit` still reports a moderate PostCSS advisory from Next.js 16.2.6's nested `postcss@8.4.31`.
- Cloudflare dashboard must build before deploy so `apps/web/out` exists for Workers Static Assets.
