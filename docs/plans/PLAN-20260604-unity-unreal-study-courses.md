# PLAN-20260604-unity-unreal-study-courses

## Scope

- Add two beginner-oriented study courses:
  - `unity-basics`: Unity 6.3 LTS beginner course for first-time Unity game developers.
  - `unreal-basics`: Unreal Engine 5.7 beginner course for first-time Unreal Engine users.
- Keep both courses static-export friendly under `/study`.
- Store new course Markdown in `content/courses/beginner-courses`, consistent with the Git/Godot beginner courses.
- Register both courses on the Study index with English and Chinese metadata.
- Reuse the shared beginner-course routes at `/study/[course]` and `/study/[course]/[stage]/[chapter]`.

## Non-Scope

- No database, auth, Worker API, or deployment configuration changes.
- No new dependencies.
- No executable Unity or Unreal project assets in this pass; lessons provide reproducible editor steps and code/Blueprint guidance.
- No changes to existing Git, Godot, Transformer, or Andrew Ng course content beyond shared registration/docs updates.

## Implementation Plan

1. Add Unity 6.3 LTS and Unreal Engine 5.7 course metadata to `beginner-courses.ts`.
2. Add 12 Unity Markdown chapters covering editor basics, GameObjects, C# scripting, Prefabs, physics/input/UI/audio, ScriptableObject, scenes, debugging, Git, and build workflow.
3. Add 12 Unreal Markdown chapters covering install/editor, Level/Actor/Component, Blueprint, gameplay framework, input, collision, UI, materials/audio, spawning, debugging, packaging, Git/LFS, and next steps.
4. Register both courses in `study-registry.ts` and i18n dictionaries.
5. Update changelog, README, agent context, progress docs, and acceptance template.
6. Run typecheck, build, tests, targeted ESLint, and staged diff checks where applicable.

## Acceptance

- `/study` shows Unity and Unreal course cards in addition to existing courses.
- `/study/unity-basics` and `/study/unreal-basics` render course outlines.
- Sample chapter pages render Markdown content and navigation:
  - `/study/unity-basics/stage1/chapter01_install_editor`
  - `/study/unreal-basics/stage1/chapter01_install_editor`
- `npm run typecheck` passes.
- `npm run build` generates static output for the new study routes.

## Assumptions

- Unity course targets **Unity 6.3 LTS (6000.3)**. Unity's official support page identifies Unity 6.3 LTS as the latest LTS release and states LTS releases are recommended for creators locking production on a specific version.
- Unreal course targets **Unreal Engine 5.7**. Epic's official Unreal Engine 5.7 release notes and documentation branch are the version baseline.
