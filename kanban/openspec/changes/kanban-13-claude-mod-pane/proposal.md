## Why

The existing `/kanban-view` skill is LLM-driven: the model reads `kanban.yaml` and renders a table. This works in any harness but costs a model call and produces a static snapshot in the transcript.

Claude Code supports native UI mods. A mod can open a persistent side pane that renders the board directly from `kanban.yaml` — no model call, always current. The skill stays as a fallback for other harnesses (OpenCode, etc.).

## What Changes

- Add a new Claude Code mod at `~/.claude/dev-mods/<uuid>/kanban-board/`.
- The mod registers the `/kanban-view` slash command via `$.command.register`.
- In Claude Code, the mod's `command.run` hook intercepts `/kanban-view` and answers it directly — no LLM call. In other harnesses the existing skill still handles it.
- The pane reads `docs/kanban.yaml` via `$.fs.read`, parses YAML, groups entries by lane, and renders one vertical card per lane.
- Each card shows the lane name as a header and entries sorted by priority ascending. Each entry shows its `id` and `summary`.
- A Collapse button inside the pane minimizes it to lane headers only. An Expand button restores the full view. State lives in `$.state` (session-scoped).
- In non-fullscreen terminal mode, `/kanban-view` returns the board as text in the transcript (no pane). The hook checks `e.presentation.isFullscreen` to decide.

## Capabilities

### New Capabilities
- `claude-mod-pane`: Claude Code native pane for the kanban board

### Modified Capabilities
- `opencode-plugin-mvp`: `/kanban-view` command now co-exists — mod overrides in Claude Code, skill is the fallback elsewhere

## User Stories

| ID | Story |
|----|-------|
| U1 | As a user in fullscreen Claude Code, I type `/kanban-view` and a pane opens on the right — no LLM turn fires. |
| U2 | The pane shows one card per swim lane (Not Started, In Progress, Archived). |
| U3 | Each card lists entries sorted by priority ascending, showing `id` and `summary`. |
| U4 | I click Collapse. The pane shrinks to lane-header rows only. |
| U5 | I click Expand. The full card view returns. |
| U6 | In non-fullscreen mode, `/kanban-view` prints the board inline and returns to the prompt — no pane. |
| U7 | In OpenCode or any other harness, `/kanban-view` still works via the existing skill. |

## Impact

- Depends on: `kanban-01-core-format` (YAML schema), `kanban-03-opencode-plugin-mvp` (existing skill stays)
- New files: `~/.claude/dev-mods/<uuid>/kanban-board/` (`.claude-plugin/plugin.json`, `hooks/hooks.json`, `hooks/register.tsx`, `types/index.d.ts`)
- No changes to existing skills, libs, or packages
