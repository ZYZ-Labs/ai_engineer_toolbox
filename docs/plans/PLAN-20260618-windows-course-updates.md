# PLAN-20260618-windows-course-updates

## Scope

- Add Windows-oriented Command Prompt and PowerShell guidance to beginner course chapters where learners need terminal commands.
- Prioritize Git, Godot, Unity, and Unreal beginner courses because these are the current game/toolchain tutorials most likely to be followed on Windows.
- Add lightweight local visual diagrams to the Godot course if they improve understanding.
- Extend the existing Markdown renderer only as needed to support local course images.

## Non-Scope

- No new third-party dependencies.
- No executable Godot, Unity, or Unreal sample projects.
- No changes to course routing, authentication, database schema, or deployment configuration.
- No external screenshot capture from editor UIs; any added visuals are static local diagrams, not official product screenshots.

## Implementation Plan

1. Add Markdown image block parsing and rendering for `![alt](src)` lines.
2. Add local SVG diagrams under `apps/web/public/course-assets/godot-basics/`.
3. Insert Godot diagrams into setup, nodes/scenes, and export/release chapters.
4. Add Windows Command Prompt and PowerShell command variants to Git setup and `.gitignore` chapters.
5. Add Windows terminal notes to Godot setup, Godot Git/debugging, and Godot export chapters.
6. Add Windows terminal notes to Unity and Unreal setup/version-control related chapters.
7. Update acceptance, progress, and agent-context documentation.
8. Run focused validation for Markdown parsing/rendering, typecheck, tests, and build if feasible.

## Acceptance

- Godot chapter pages render local diagrams with alt text and responsive sizing.
- Git tutorial includes explicit PowerShell and Command Prompt examples for directory creation/navigation and `.gitignore` creation.
- Godot, Unity, and Unreal tutorials include Windows terminal guidance for common setup, project folder, export/build, and Git/LFS checks.
- Existing study routes continue to statically build.
- Documentation records the changed course scope and validation result.

## Assumptions

- The user request allows generated/local diagrams instead of product screenshots because they asked for images "if possible" without requiring official screenshots.
- The main audience is Windows users, but macOS/Linux commands should remain present for non-Windows learners.
