# REPORT-20260520-i18n-course-integration

## Background

The site needed English and Chinese UI support, while keeping English as the default language. The Transformer lecture course from `/usr/local/project/study` also needed to be available after GitHub Pages deployment.

## Scope

- Reviewed existing uncommitted i18n and tool changes made by another model.
- Kept English as the default first paint language.
- Fixed hydration-sensitive language and recently-used-tool initialization.
- Copied `/usr/local/project/study` lecture content into `content/courses/transformer-lectures`.
- Added static course routes under `/study/transformer-lectures`.
- Added Markdown table rendering for lecture readability.
- Removed the original placeholder study roadmaps from the active study index and static export.

## Operation And Verification

- Ran `npm run lint`.
- Ran `npm run test`.
- Ran `npm run typecheck`.
- Ran `npm run build` with elevated permissions because Next.js 16 Turbopack needs a CSS worker that the local sandbox blocks.
- Checked that `apps/web/out/study/transformer-lectures/index.html` exists.
- Checked that `apps/web/out/study/transformer-lectures/stage1/chapter01_numpy_tensor/index.html` exists.
- Counted 31 static course `index.html` files.
- Checked `apps/web/out/CNAME`.

## Conclusion

- Lint passed with zero warnings.
- Unit tests passed: 1 test file, 4 tests.
- Typecheck passed for web and utils workspaces.
- Static build passed and generated 53 pages after removing placeholder study routes.
- Transformer lecture course is statically exportable for GitHub Pages.
- `apps/web/out/CNAME` still contains `toolbox.silvericekey.fun`.

## Evidence

```txt
npm run build
✓ Generating static pages using 11 workers (53/53)
○ /study/transformer-lectures
● /study/transformer-lectures/[stage]/[chapter]
  ├ /study/transformer-lectures/stage1/chapter01_numpy_tensor
  └ [+27 more paths]
```

```txt
find apps/web/out/study/transformer-lectures -maxdepth 3 -name 'index.html' | wc -l
31
```

## Remaining Risks

- Browser-level manual acceptance on GitHub Pages is still needed after deployment.
- Course Python examples are rendered for reading; running them still requires a local Python environment.
- `npm audit` still reports the known moderate PostCSS advisory from Next.js 16.2.6's nested dependency.

## Follow-Up

- Push changes to `master`.
- Confirm GitHub Actions Pages deployment succeeds.
- Open `https://toolbox.silvericekey.fun/study/transformer-lectures` after deployment.
