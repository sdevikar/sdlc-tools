## Why

The board file is at `docs/kanban.yaml`, but the generated `kanban.html` is at the project root. Users must look in two places, and `docs/` is a strange location for a file that every kanban tool reads and writes. Move the board file to `<project-root>/kanban.yaml`.

This is a hard migration. After this change, no tool reads or writes `docs/kanban.yaml`. There is no fallback and no automatic move of a legacy file.

## What Changes

- **BREAKING**: The board file path changes from `docs/kanban.yaml` to `kanban.yaml` at the project root.
- **BREAKING**: No component reads `docs/kanban.yaml`. A project that has only `docs/kanban.yaml` behaves as if it has no board.
- `kanban-core` CLIs (`cli.js` sync, `archive-sync`, `new-sync`, and `cli-view.js`) use `kanban.yaml` at the project root.
- The Claude mod (`register.tsx`) reads `kanban.yaml` at the project root for the pane, the `/init` observer (kanban-15), and the archive-sync and new-change-sync timers. The pane error text names the new path.
- Skills (`kanban`, `kanban-init`, `kanban-render`, `kanban-sync`) in `skills/` and `.opencode/skills/` name the new path.
- Agent instruction files (`AGENTS.md`, `CLAUDE.md`, `.kiro/`, `.clinerules/`, `.cursor/`, `.windsurf/`) name the new path.
- This repository moves its own board with `git mv docs/kanban.yaml kanban.yaml`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `kanban-core-yaml`: adds a requirement that fixes the board file location at the project root, with no legacy fallback.
- `kanban-core-sync`: CLI scenarios name `kanban.yaml` at the project root instead of `docs/kanban.yaml`.
- `claude-mod-archive-sync`: the gap scan compares against `kanban.yaml` at the project root.
- `claude-mod-new-change-sync`: the missing-entry scan compares against `kanban.yaml` at the project root.
- `claude-mod-init` (from kanban-15, assumed archived): init/sync mode detection and writes use `kanban.yaml` at the project root.

The `kanban-view` and `claude-mod-autosync` specs name `docs/kanban.yaml` only in their Purpose text. Their requirements do not change. A task edits the Purpose text directly in the main specs.

## Impact

- **Depends on**: `kanban-15-claude-mod-init`. This proposal assumes kanban-15 is implemented and archived, so `openspec/specs/claude-mod-init/spec.md` exists.
- **Code**: `libs/kanban-core/src/cli.ts`, `libs/kanban-core/src/cli-view.ts`, `mod/kanban-board/hooks/register.tsx`, and the installed dev-mod copy under `~/.claude/dev-mods/<uuid>/kanban-board/`.
- **Docs and skills**: files listed in What Changes. `docs/plans/` research report is not changed. It is a historical design record.
- **Users of other projects**: each project must run `git mv docs/kanban.yaml kanban.yaml` once. If they skip it, `/init` offers to create a new board, and the CLIs fail or create a fresh root file.
- **No new dependencies.**
