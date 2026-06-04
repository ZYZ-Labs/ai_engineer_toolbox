# PROGRESS-20260604-beginner-study-courses

## Current Status

- Git beginner course is implemented under `/study/git-basics`.
- Godot beginner course is implemented under `/study/godot-basics`.
- Godot course baseline is fixed to **Godot 4.6.3 stable**.
- Shared beginner-course static routes are implemented at:
  - `apps/web/src/app/study/[course]/page.tsx`
  - `apps/web/src/app/study/[course]/[stage]/[chapter]/page.tsx`

## Recent Key Conclusions

- New course Markdown lives in `content/courses/beginner-courses`, outside the existing course submodule.
- Git course includes 10 chapters across setup, local workflow, branches, conflicts, undo, remotes, PRs, ignore rules, stash, tags, and troubleshooting.
- Godot course includes 12 chapters across Godot 4.6.3 setup, nodes/scenes, GDScript, a 2D game loop, UI, animation/audio, resources, Autoload, debugging, Git, export, and next steps.
- Study index and changelog now include both beginner courses with English and Chinese card/changelog metadata.
- Official Godot basis checked:
  - Godot 4.6.3 maintenance release published on 2026-05-20.
  - Godot 4.6 documentation branch is the course documentation baseline.

## Validation Results

- `npm run typecheck`: passed.
- `npm run build`: passed and generated 104 static pages.
- New static outputs confirmed:
  - `/study/git-basics`
  - `/study/godot-basics`
  - 22 beginner course chapter pages.
- `npm run test`: passed, 1 Vitest file and 4 tests.
- Targeted ESLint for new/changed course route and registry files: passed.
- `npm run lint`: failed on pre-existing AI Chat lint issues in:
  - `apps/web/src/components/tools/AiChatWorkbench.tsx`
  - `apps/web/src/lib/ai-providers.ts`

## Blockers

- None for the Git/Godot beginner course integration.

## Unverified Risks

- No browser screenshot/manual click-through was performed in this turn.
- Godot lessons provide reproducible editor steps and code snippets, but no executable Godot project asset was added.
- Full repo lint remains blocked by unrelated pre-existing AI Chat lint errors.

## Next Actions

1. Manually open `/study/git-basics` and `/study/godot-basics` in a browser after deployment.
2. Fix the unrelated AI Chat lint issues in a separate change if full `npm run lint` needs to be green.
3. Consider adding downloadable Godot 4.6.3 sample project assets in a later scoped task.
