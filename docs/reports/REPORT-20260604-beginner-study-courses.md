# REPORT-20260604-beginner-study-courses

## Background

The Study section needed two detailed beginner tutorials: Git and Godot. The Godot course was later narrowed to Godot 4.6.3 specifically.

## Scope

- Add Git beginner course pages.
- Add Godot 4.6.3 beginner course pages.
- Register both courses in the Study index.
- Add English and Chinese study card and changelog metadata.
- Keep content static-export compatible.
- Update agent handoff and acceptance documentation.

## Operations

- Added shared beginner-course metadata and Markdown reader at `apps/web/src/lib/courses/beginner-courses.ts`.
- Added static routes:
  - `/study/[course]`
  - `/study/[course]/[stage]/[chapter]`
- Added 22 Markdown chapters under `content/courses/beginner-courses`.
- Updated:
  - `apps/web/src/lib/study-registry.ts`
  - `apps/web/src/lib/i18n/dict.ts`
  - `apps/web/src/lib/i18n/study.ts`
  - `apps/web/src/app/changelog/page.tsx`
  - `README.md`
  - `docs/agent-context.md`
  - `docs/templates/TEMPLATE-20260520-acceptance.md`

## Conclusion

- Git course is available at `/study/git-basics`.
- Godot 4.6.3 course is available at `/study/godot-basics`.
- Static export succeeds and includes all new beginner course pages.
- The Godot course explicitly states Godot 4.6.3 stable as the version baseline and requires matching 4.6.3 export templates.

## Evidence

```txt
npm run typecheck
@ai-engineer-toolbox/web tsc --noEmit
@ai-engineer-toolbox/utils tsc --noEmit
```

```txt
npm run build
Generating static pages using 11 workers (104/104)
/study/[course]
  /study/git-basics
  /study/godot-basics
/study/[course]/[stage]/[chapter]
  /study/git-basics/stage1/chapter01_install_setup
  [+19 more paths]
```

```txt
find apps/web/out/study/git-basics apps/web/out/study/godot-basics -name index.html
24 generated index.html files
```

```txt
npm run test
Test Files 1 passed (1)
Tests 4 passed (4)
```

```txt
npm --workspace @ai-engineer-toolbox/web exec eslint -- \
  src/lib/courses/beginner-courses.ts \
  src/app/study/[course]/page.tsx \
  src/app/study/[course]/[stage]/[chapter]/page.tsx \
  src/lib/study-registry.ts \
  src/lib/i18n/study.ts
passed
```

## Remaining Risks

- Full `npm run lint` still fails on unrelated pre-existing AI Chat lint issues.
- Browser manual verification was not performed.
- No runnable Godot sample project is included; the course is text/code-snippet based.

## Follow-Up

- Deploy and manually verify `/study/git-basics` and `/study/godot-basics`.
- Fix the existing AI Chat lint issues separately if full-repo lint must pass.
