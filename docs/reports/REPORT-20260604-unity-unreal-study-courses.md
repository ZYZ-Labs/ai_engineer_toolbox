# REPORT-20260604-unity-unreal-study-courses

## Background

The Study section already had shared beginner-course routing for Git and Godot. The next request was to add Unity and Unreal beginner courses and push the completed work.

## Scope

- Add Unity 6.3 LTS beginner course pages.
- Add Unreal Engine 5.7 beginner course pages.
- Register both courses in the Study index.
- Add English and Chinese study card and changelog metadata.
- Keep content static-export compatible.
- Update agent handoff, progress, plan, report, and acceptance documentation.

## Operations

- Added Unity and Unreal course metadata to `apps/web/src/lib/courses/beginner-courses.ts`.
- Added 24 Markdown chapters:
  - 12 under `content/courses/beginner-courses/unity-basics`.
  - 12 under `content/courses/beginner-courses/unreal-basics`.
- Updated:
  - `apps/web/src/lib/study-registry.ts`
  - `apps/web/src/lib/i18n/dict.ts`
  - `apps/web/src/lib/i18n/study.ts`
  - `apps/web/src/app/changelog/page.tsx`
  - `README.md`
  - `docs/agent-context.md`
  - `docs/templates/TEMPLATE-20260520-acceptance.md`
  - `docs/progress/PROGRESS-20260604-beginner-study-courses.md`

## Version Basis

- Unity course targets **Unity 6.3 LTS (6000.3)**.
- Unreal course targets **Unreal Engine 5.7**.
- Official sources checked:
  - Unity release support page and Unity 6.3 Manual.
  - Unreal Engine 5.7 documentation and release notes.

## Conclusion

- Unity course is available at `/study/unity-basics`.
- Unreal course is available at `/study/unreal-basics`.
- Static export succeeds and includes all beginner course pages.
- New courses use the same shared static route as Git/Godot.

## Evidence

```txt
npm run typecheck
@ai-engineer-toolbox/web tsc --noEmit
@ai-engineer-toolbox/utils tsc --noEmit
```

```txt
npm run build
Generating static pages using 11 workers (130/130)
/study/[course]
  /study/git-basics
  /study/godot-basics
  /study/unity-basics
  /study/unreal-basics
/study/[course]/[stage]/[chapter]
  /study/git-basics/stage1/chapter01_install_setup
  [+43 more paths]
```

```txt
find apps/web/out/study/git-basics apps/web/out/study/godot-basics apps/web/out/study/unity-basics apps/web/out/study/unreal-basics -name index.html
50 generated beginner-course index.html files
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
- No runnable Unity or Unreal sample project is included; both courses are text/code/Blueprint-guidance based.

## Follow-Up

- Deploy and manually verify `/study/unity-basics` and `/study/unreal-basics`.
- Fix the existing AI Chat lint issues separately if full-repo lint must pass.
