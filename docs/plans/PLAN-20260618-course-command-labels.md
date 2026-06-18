# PLAN-20260618-course-command-labels

## Scope

- Make study code blocks visibly show their execution context when a language is provided.
- Prefer short labels such as `PowerShell`, `cmd`, and `Git Bash / macOS / Linux`.
- Reduce native PowerShell-only commands in the recently updated Git/Godot/Unity/Unreal tutorial sections.
- Keep edits limited to course rendering and tutorial Markdown content.

## Non-Scope

- No new dependencies.
- No changes to course routing, database, auth, deployment, or generated engine projects.
- No broad rewrite of non-terminal code samples such as GDScript, C#, Blueprint pseudo-steps, `.gitignore`, or `.gitattributes`.

## Implementation Plan

1. Update `MarkdownRenderer` so code fences display a small label above the code block when `lang` is present.
2. Map common terminal fence names to learner-facing labels:
   - `bash` -> `Git Bash / macOS / Linux`
   - `powershell` -> `PowerShell`
   - `bat` or `cmd` -> `cmd`
3. Replace native PowerShell examples like `New-Item`, `Set-Location`, `Get-Location`, and `Get-ChildItem` where simpler `mkdir`, `cd`, `dir`, `git`, or `py` examples are enough.
4. Update progress, agent context, and acceptance docs.
5. Run typecheck, focused ESLint, tests, and build.

## Acceptance

- Course pages display a clear short label above command/code blocks.
- Windows tutorial sections avoid native PowerShell commands unless there is a strong reason.
- `cmd` examples remain available for Windows users.
- Static build succeeds.
