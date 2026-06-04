# PROGRESS-20260520-ai-engineer-toolbox-v1

## Current Status

- Static Next.js monorepo implementation is complete.
- GitHub repository `ZYZ-Labs/ai_engineer_toolbox` is populated on `master`.
- GitHub Pages workflow and custom domain file have been added and pushed.

## Recent Key Conclusions

- The site should default to custom-domain root deployment rather than a repository subpath.
- Processing remains browser-side for v1.
- `Donate` exists as a route but is intentionally omitted from primary navigation.
- `npm run build` exports 26 static pages to `apps/web/out`.
- `apps/web/out/CNAME` contains `toolbox.silvericekey.fun`.
- Remote commit `5190914` contains the v1 source implementation.
- Remote commit `7516358` contains `.github/workflows/pages.yml`.
- Remote commit `90be6e5` contains the root `CNAME` from GitHub Pages custom domain configuration.
- Client-side i18n is integrated with English default and Chinese toggle.
- `/usr/local/project/study` course content is copied into `content/courses/transformer-lectures` and exposed as static routes.
- `npm run build` now exports 53 static pages, including 30 Transformer lecture chapter pages.
- Original placeholder roadmap study pages are removed from the active study index and static export.
- Git and Godot beginner courses are now available under `/study/git-basics` and `/study/godot-basics`.
- Godot beginner course baseline is fixed to Godot 4.6.3 stable.
- Unity and Unreal beginner courses are now available under `/study/unity-basics` and `/study/unreal-basics`.
- Unity course baseline is fixed to Unity 6.3 LTS; Unreal course baseline is fixed to Unreal Engine 5.7.
- Beginner course integration validation passed for typecheck, build, tests, and targeted ESLint on 2026-06-04.

## Next Actions

- Enable GitHub Pages with GitHub Actions source after push.
- Configure DNS CNAME for `toolbox.silvericekey.fun`.
- Push the Git/Godot beginner course integration changes.

## Blockers

- `gh` CLI is not installed, so the GitHub plugin draft PR workflow could not be used locally.

## Unverified Risks

- DNS and GitHub Pages repository settings still need external configuration.
- Browser-level crypto behavior needs real browser verification beyond static build.
- `npm audit` reports a moderate PostCSS advisory from Next.js 16.2.6's nested dependency. High severity advisories were resolved by upgrading Next.js and `sm-crypto`.
