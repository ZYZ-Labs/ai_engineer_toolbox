# PLAN-20260604-beginner-study-courses

## Scope

- Add two beginner-oriented study courses:
  - `git-basics`: Git tutorial for first-time command-line and team workflow users.
  - `godot-basics`: Godot 4.6.3 tutorial for first-time game development learners.
- Keep the courses static-export friendly under `/study`.
- Store new course Markdown in the main repository, not in the existing `content/courses/lectures-source` submodule.
- Register both courses on the Study index with English and Chinese card metadata.
- Reuse the existing Markdown renderer and visual course pattern.

## Non-Scope

- No database, auth, Worker API, or deployment configuration changes.
- No new dependencies.
- No changes to existing Transformer or Andrew Ng course content.
- No executable Godot project assets in this pass; lessons provide reproducible editor steps and code snippets.

## Implementation Plan

1. Add a generic beginner-course registry and static Markdown reader for Git/Godot courses.
2. Add shared static routes for beginner courses under `/study/[course]` and `/study/[course]/[stage]/[chapter]`.
3. Add Git course Markdown chapters with beginner labs, command examples, mistake recovery, and daily workflow guidance.
4. Add Godot course Markdown chapters based on Godot 4.6.3 stable concepts, with beginner 2D game steps and GDScript snippets.
5. Register both courses in the Study index and i18n dictionary.
6. Update changelog, README, agent context, progress docs, and acceptance template for the new learning entries.
7. Run lint, typecheck, and build validation.

## Acceptance

- `/study` shows Git and Godot course cards in addition to the existing courses.
- `/study/git-basics` and `/study/godot-basics` render course outlines.
- Sample chapter pages render Markdown content and navigation:
  - `/study/git-basics/stage1/chapter01_install_setup`
  - `/study/godot-basics/stage1/chapter01_install_editor`
- `npm run typecheck` passes.
- `npm run build` generates static output for the new study routes.

## Assumptions

- Godot course targets Godot 4.6.3 stable specifically. Official Godot 4.6.3 was published on 2026-05-20, and the course uses the Godot 4.6 documentation branch as its version baseline.
- Git course targets standard command-line Git and keeps GitHub usage as a collaboration example rather than a hard product dependency.
