# Agent Context

## Current Status

- Main task: implement AI Engineer Toolbox v1 from `AI_Engineer_Toolbox_Spec_v1.md`.
- Current phase: implementation pushed to GitHub, pending GitHub Pages and DNS configuration.
- Main entry: `apps/web/src/app/page.tsx`.
- Tool registry: `apps/web/src/lib/tool-registry.ts`.
- Tool execution: `apps/web/src/components/tools/ToolWorkbench.tsx`.
- Study content: `content/study/*.mdx`.
- **I18n added**: Client-side i18n with `en` (default) and `zh` support. Config cached in `localStorage` under key `aet-lang`. Language switcher in Header.

## Deployment Context

- Target repository: `https://github.com/ZYZ-Labs/ai_engineer_toolbox.git`.
- Target hosting: GitHub Pages.
- Custom domain: `toolbox.silvericekey.fun`.
- Static output: `apps/web/out`.
- Pages workflow: `.github/workflows/pages.yml`.
- Domain files:
  - `apps/web/public/CNAME` is copied into the Next.js static export artifact.
  - Root `CNAME` was created by the GitHub Pages custom domain setting.
- Remote commits:
  - `5190914` implements source code and project docs.
  - `7516358` adds the GitHub Pages deployment workflow.
  - `90be6e5` creates root `CNAME`.

## Validation Entry

- Install: `npm install` or `npm ci`.
- Development server: `npm run dev`.
- Checks: `npm run lint`, `npm run test`, `npm run typecheck`, `npm run build`.

## Current Risks

- GitHub Pages must be enabled in repository settings with GitHub Actions as the source.
- DNS for `toolbox.silvericekey.fun` must point to GitHub Pages outside this repository.
- Exact token counts remain rough estimates; provider-specific tokenizers are still required for billing-sensitive checks.
- `npm audit` still reports a moderate PostCSS advisory from Next.js 16.2.6's nested `postcss@8.4.31`; latest stable Next is 16.2.6, and the site is statically exported with no Next server runtime.
