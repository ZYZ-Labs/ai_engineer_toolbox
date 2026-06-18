# PROGRESS-20260604-beginner-study-courses

## Current Status

- Git beginner course is implemented under `/study/git-basics`.
- Godot beginner course is implemented under `/study/godot-basics`.
- Unity beginner course is implemented under `/study/unity-basics`.
- Unreal beginner course is implemented under `/study/unreal-basics`.
- 2026-06-18 content update complete: Git/Godot/Unity/Unreal lessons now include Windows PowerShell and Command Prompt guidance, and Godot lessons include local SVG diagrams.
- 2026-06-18 follow-up update complete: course code blocks render visible short execution labels, and Windows examples reduce native PowerShell-only commands.
- Godot course baseline is fixed to **Godot 4.6.3 stable**.
- Unity course baseline is fixed to **Unity 6.3 LTS (6000.3)**.
- Unreal course baseline is fixed to **Unreal Engine 5.7**.
- Shared beginner-course static routes are implemented at:
  - `apps/web/src/app/study/[course]/page.tsx`
  - `apps/web/src/app/study/[course]/[stage]/[chapter]/page.tsx`

## Recent Key Conclusions

- New course Markdown lives in `content/courses/beginner-courses`, outside the existing course submodule.
- Git course includes 10 chapters across setup, local workflow, branches, conflicts, undo, remotes, PRs, ignore rules, stash, tags, and troubleshooting.
- Godot course includes 12 chapters across Godot 4.6.3 setup, nodes/scenes, GDScript, a 2D game loop, UI, animation/audio, resources, Autoload, debugging, Git, export, and next steps.
- Unity course includes 12 chapters across Unity 6.3 LTS setup, GameObjects/components, C# scripting, a 2D game loop, UI, ScriptableObject, scene flow, debugging, Git, builds, and next steps.
- Unreal course includes 12 chapters across Unreal Engine 5.7 setup, Actors/components, Blueprint, Gameplay Framework, a third-person prototype, UMG, packaging, Git LFS, and next steps.
- Standalone Markdown image lines are now parsed and rendered for study content.
- Godot visuals added:
  - `apps/web/public/course-assets/godot-basics/editor-layout.svg`
  - `apps/web/public/course-assets/godot-basics/scene-instance-flow.svg`
  - `apps/web/public/course-assets/godot-basics/export-flow.svg`
- Windows command guidance added to Git setup and ignore rules, Godot setup/debug/export, Unity setup/Git, and Unreal setup/Git LFS chapters.
- Code block rendering now maps common fence languages to learner-facing labels: `PowerShell`, `cmd`, and `Git Bash / macOS / Linux`.
- Windows examples now prefer `cmd`, Git Bash, or simple cross-terminal commands over native PowerShell commands like `New-Item`, `Set-Location`, `Get-Location`, and `Get-ChildItem`.
- Study index and changelog now include all beginner courses with English and Chinese card/changelog metadata.
- Official Godot basis checked:
  - Godot 4.6.3 maintenance release published on 2026-05-20.
  - Godot 4.6 documentation branch is the course documentation baseline.
- Official Unity basis checked:
  - Unity 6.3 LTS is the latest LTS release in Unity's official release support page.
  - Unity 6.3 Manual (6000.3) is the course documentation baseline.
- Official Unreal basis checked:
  - Unreal Engine 5.7 release notes and documentation branch are the course documentation baseline.

## Validation Results

- `npm run typecheck`: passed.
- `npm run build`: passed and generated 130 static pages.
- New static outputs confirmed:
  - `/study/git-basics`
  - `/study/godot-basics`
  - `/study/unity-basics`
  - `/study/unreal-basics`
  - 46 beginner course chapter pages.
- `npm run test`: passed, 1 Vitest file and 4 tests.
- Targeted ESLint for new/changed course route and registry files: passed after Unity/Unreal additions.
- `npm run lint`: failed on pre-existing AI Chat lint issues in:
  - `apps/web/src/components/tools/AiChatWorkbench.tsx`
  - `apps/web/src/lib/ai-providers.ts`
- 2026-06-18 validation for Windows/course image update:
  - `npm run typecheck`: passed.
  - `npm run test`: passed, 1 Vitest file and 4 tests.
  - `npm --workspace @ai-engineer-toolbox/web exec eslint -- src/lib/markdown.ts src/components/study/MarkdownRenderer.tsx`: passed.
  - `npm run build`: passed and generated 130 static pages.
  - Static output check confirmed Godot SVG assets under `apps/web/out/course-assets/godot-basics/` and rendered course page references.
- 2026-06-18 validation for command-label follow-up:
  - `npm run typecheck`: passed.
  - `npm run test`: passed, 1 Vitest file and 4 tests.
  - `npm --workspace @ai-engineer-toolbox/web exec eslint -- src/components/study/MarkdownRenderer.tsx`: passed.
  - `npm run build`: passed and generated 130 static pages.
  - Static output check confirmed visible `PowerShell / cmd / Git Bash`, `cmd`, and `Git Bash / macOS / Linux` code-block labels.
  - Source check confirmed no `New-Item`, `Set-Location`, `Get-Location`, or `Get-ChildItem` remains in beginner Git/Godot/Unity/Unreal course Markdown.

## Blockers

- None for the beginner course integration.

## Unverified Risks

- No browser screenshot/manual click-through was performed in this turn.
- Godot, Unity, and Unreal lessons provide reproducible editor steps and code snippets, but no executable engine project assets were added.
- Added Godot images are local SVG diagrams, not official editor screenshots.
- Full repo lint remains blocked by unrelated pre-existing AI Chat lint errors.

## Next Actions

1. Manually open `/study/git-basics`, `/study/godot-basics`, `/study/unity-basics`, and `/study/unreal-basics` in a browser after deployment.
2. Fix the unrelated AI Chat lint issues in a separate change if full `npm run lint` needs to be green.
3. Consider adding downloadable Godot 4.6.3, Unity 6.3 LTS, or Unreal Engine 5.7 sample project assets in later scoped tasks.
