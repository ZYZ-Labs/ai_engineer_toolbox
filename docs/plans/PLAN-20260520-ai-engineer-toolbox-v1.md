# PLAN-20260520-ai-engineer-toolbox-v1

## Scope

- Build a static, local-first toolbox website from `AI_Engineer_Toolbox_Spec_v1.md`.
- Include `/tools`, `/study`, `/about`, `/changelog`, and hidden `/donate`.
- Implement v1 browser tools across crypto, data, and AI engineering categories.
- Add MDX study content.
- Support GitHub Pages and the custom domain `toolbox.silvericekey.fun`.

## Non-Scope

- User accounts.
- Database.
- Backend API.
- Comments, community, memberships, ads, or cloud storage.
- Server-side secret operations.

## Implementation Plan

1. Create monorepo structure with `apps/web`, `packages/ui`, `packages/utils`, and `content/study`.
2. Implement Next.js static export and Tailwind UI.
3. Implement tool registry and client-side tool workbench.
4. Add study MDX content and static study pages.
5. Add GitHub Pages workflow and `CNAME`.
6. Run lint, tests, typecheck, and static build.
7. Commit and push to `ZYZ-Labs/ai_engineer_toolbox`.

## Acceptance

- `npm run build` produces `apps/web/out`.
- GitHub Pages artifact includes `CNAME`.
- Tool pages render without backend dependencies.
- Study pages are generated statically.
- No account, database, or backend code is introduced.
