# Proposal

## Why

kanban-15 hooks the built-in `/init` command. Every `/init` run opens a kanban dialog, even in projects that do not use the kanban board. `/init` belongs to Claude Code and must stay unchanged. The `/kanban:setup` skill (kanban-27) is the correct place to offer the board, because the user runs it on purpose to set up kanban.

## What Changes

- **BREAKING**: Remove the `command.run` hook on `init` from `mod/kanban-board/hooks/register.tsx`. `/init` no longer opens a kanban dialog.
- Add a model-callable tool to the mod: `mcp__kanban__kanban_board_setup`. The tool opens the existing Yes/No dialog pane. It returns only after the user answers. On Yes, it runs the existing inline create/sync logic and returns the result line. On No or Esc, it returns "declined".
- Change step 4 of `skills/setup/SKILL.md`: call the tool when it exists (Claude Code with the mod loaded). Otherwise, ask the user in chat and then invoke the `kanban-init` skill.
- Rename the state key `initMode` to `setupMode` in `types/index.d.ts`. Rename the pane id `kanban-init-dialog` to `kanban-setup-dialog`.
- Update `README.md` and `docs/architecture.md`: remove the `/init` observer text and describe the setup dialog.

## Capabilities

### New Capabilities

None. The dialog requirements move into `zero-config-install`.

### Modified Capabilities

- `zero-config-install`: the setup skill asks the user to confirm before it creates or syncs `kanban.yaml`. Adds the dialog, the Yes/No/Esc outcomes, the openspec-failure guard, and a fallback for harnesses with no mod.
- `claude-mod-init`: all requirements removed. The mod no longer observes `/init`.

## Impact

- **Modifies**: `mod/kanban-board/hooks/register.tsx`, `mod/kanban-board/types/index.d.ts`, `skills/setup/SKILL.md`, `README.md`, `docs/architecture.md`.
- **Does not modify**: `libs/kanban-core/`, the `kanban-init` skill, the inline `mapLane` / `mapStatus` / `mergeSync` functions.
- **Depends on**: `kanban-15-claude-mod-init` (dialog and sync code), `kanban-27-zero-config-install` (setup skill and plugin install).
