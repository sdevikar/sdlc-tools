# CLAUDE.md

See [AGENTS.md](./AGENTS.md) for project structure, OpenSpec CLI, way of working, and build order.

---

## Claude Code Mod Development

This project includes a Claude Code mod (native UI plugin) for the kanban board.

### Mod location

The mod lives at `~/.claude/dev-mods/<uuid>/kanban-board/`. Three required files:

- `.claude-plugin/plugin.json` — manifest
- `hooks/hooks.json` — module reference
- `hooks/register.tsx` — the hooks module

A fourth file (`types/index.d.ts`) declares the mod's `$.state` contract.

### Mod commands

The mod registers these slash commands:

| Command | Effect |
| --- | --- |
| `/kanban-view` | Open the swim lane pane (or render inline in non-fullscreen) |

### Pane behavior

- Fullscreen terminal: opens as a right-side pane with vertical swim lane cards.
- Non-fullscreen: prints inline to the transcript (no pane).
- Each swim lane is a card. Entries sort by priority ascending within each lane.
- A Collapse button inside the pane minimizes it to lane headers only.
- An Expand button restores the full view.

### Auto-sync

The mod watches for writes to `docs/kanban.yaml` (via `tool.call` hooks on `Write` and `Edit`) and re-reads the file to update the pane. Kanban commands (`/kanban-sync`, `/kanban-render`, `/opsx-archive`, `/opsx-propose`) also trigger a refresh.

### Changes

| Change | Purpose |
| --- | --- |
| `kanban-13-claude-mod-pane` | Core mod: `/kanban-view` command, pane layout, collapse/expand |
| `kanban-14-claude-mod-autosync` | Auto-sync: refresh pane on kanban.yaml writes and kanban commands |
