# Design

## Context

The path `docs/kanban.yaml` is hard-coded in many places:

| Area | Location | Form |
| --- | --- | --- |
| kanban-core CLI | `libs/kanban-core/src/cli.ts:6-9` | string `'docs/kanban.yaml'` passed 3 times |
| kanban-core view CLI | `libs/kanban-core/src/cli-view.ts:7` | `join(cwd, "docs", "kanban.yaml")` |
| Claude mod | `mod/kanban-board/hooks/register.tsx` | `kanbanPath()` helper, plus 2 inline paths in the `/init` observer, plus the pane error text |
| Installed mod | `~/.claude/dev-mods/<uuid>/kanban-board/hooks/register.tsx` | copy of the mod |
| Skills | `skills/*/SKILL.md`, `.opencode/skills/*/SKILL.md` | prose |
| Agent rules | `AGENTS.md`, `CLAUDE.md`, `.kiro/`, `.clinerules/`, `.cursor/`, `.windsurf/` | prose |
| Main specs | `kanban-view`, `claude-mod-autosync` Purpose text | prose |

The sync functions in `sync.ts` take `kanbanPath` as an argument. They do not need changes. The autosync hook matches any path that contains `kanban.yaml`, so it works with the new path.

## Goals / Non-Goals

**Goals:**
- One board location: `<project-root>/kanban.yaml`.
- One definition of the path in each runtime (kanban-core, mod).
- Move this repo's own board with git history.

**Non-Goals:**
- No fallback read of `docs/kanban.yaml`.
- No automatic move, warning, or detection of a legacy file.
- No change to the YAML format.
- No edit to `docs/plans/` or archived changes. They are historical records.

## Decisions

### D1: Hard cut, no fallback

Every component uses only `kanban.yaml` at the root. A fallback adds a code path that must be tested and later removed. The user base is small, and the move is one `git mv`.

**Alternative rejected:** read the legacy path if the root file is missing. This keeps two sources of truth alive.

### D2: One path constant per runtime

- kanban-core: add `export const KANBAN_FILE = 'kanban.yaml'` in a shared module (for example `src/paths.ts`). `cli.ts` and `cli-view.ts` use it.
- Mod: `kanbanPath($)` returns `${cwd}/kanban.yaml`. The `/init` observer calls `kanbanPath($)` instead of inline strings. The error text uses `kanban.yaml`.

The mod does not import kanban-core (kanban-15 decision), so the constant exists in two places.

### D3: Move the repo board with `git mv`

`git mv docs/kanban.yaml kanban.yaml` keeps file history. The move and the code change go in one commit, so no commit has a broken board path.

### D4: Purpose text edits go direct to main specs

`kanban-view` and `claude-mod-autosync` name the path only in Purpose. A delta cannot change Purpose, so a task edits those main spec files directly.

## Risks / Trade-offs

| Risk | Mitigation |
| --- | --- |
| Other projects still have `docs/kanban.yaml`; `/init` offers to create a new board and the old one looks lost | README and INSTALL note the one-line `git mv`. This is the accepted cost of a hard migration. |
| `archive-sync` / `new-sync` create a fresh root file when only the legacy file exists | Same as above. The legacy file is not touched, so no data loss. |
| Installed dev-mod copy stays stale | Task copies `register.tsx` to the dev-mod folder and reloads the mod. |
| Missed reference | Final task greps for `docs/kanban` outside `docs/plans/` and `openspec/changes/archive/`. |
