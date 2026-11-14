## Why

Every new project that uses this kanban plugin needs `docs/kanban.yaml` to exist before any other kanban commands work. Right now, the user must create it manually or run `/kanban-sync`. This creates friction on first use.

The `/init` command is the natural place to handle this. When a user runs `/init` to start a project, the kanban board should be offered and created in the same flow — no separate step required.

## What Changes

### New mod hook: observe `/init`

The kanban-board Claude mod adds a handler for the `/init` command. After Claude completes its normal `/init` work, the mod runs.

The mod does two things:

1. **Ask the user**: renders an inline Yes/No prompt — "Create a kanban board for this project?" (init mode) or "Sync kanban board with current openspec state?" (sync mode). If the user selects No, the mod exits silently.

2. **Create or sync `docs/kanban.yaml`**:
   - **Init mode** (`kanban.yaml` does not exist): scan `openspec/changes/` and `openspec/changes/archive/`, build entries from scratch, write `docs/kanban.yaml`.
   - **Sync mode** (`kanban.yaml` exists): same scan, merge with existing entries using `mergeSync` logic. Preserve manual fields: `priority`, `notes`, `tags`, `assignee`, `githubIssue`, and any user-moved lane.

3. **Print a result line** in the transcript: `Kanban init: 4 entries created` or `Kanban sync: 2 updated, 1 unchanged`.

### Sync logic (inline in mod)

The mod replicates the three small functions from `libs/kanban-core/src/sync.ts` inline. This avoids a compile-time dependency on kanban-core:

| Function | Source | What it does |
|----------|--------|--------------|
| `mapLane` | sync.ts:23 | Derives lane from artifact status |
| `mapStatus` | sync.ts:31 | Derives status string from artifact readiness |
| `mergeSync` | sync.ts:41 | Merges new scan with existing entries, preserving manual fields |

The mod shells out to `openspec list --json` and `openspec status --change <name> --json` for live data — same as the existing `syncFromOpenSpec` in sync.ts.

### Lane assignment rules

| Artifact state | Lane | Status |
|----------------|------|--------|
| tasks = done or ready | In Progress | tasks ready |
| design = done | In Progress | design in progress |
| proposal = done | Not Started | proposal written |
| otherwise | Not Started | no proposal |
| In archive directory | Archived | archived |

### User confirmation UI

The prompt wording changes based on mode:

- **Init**: "No kanban board found. Create one for this project? [Yes] [No]"
- **Sync**: "Kanban board found. Sync it with current openspec state? [Yes] [No]"

The mod renders this using the mods UI API (`$.ui`). The user's click determines whether file I/O runs.

## Capabilities

### New Capabilities

- `claude-mod-init`: `/init` command observer that creates or syncs `docs/kanban.yaml` with a user confirmation step.

### Modified Capabilities

- `claude-mod-pane` (kanban-13): the kanban-board mod gains a second hook in `register.tsx`.

## Impact

- **Depends on**: `kanban-13-claude-mod-pane` (provides the plugin base and `register.tsx`).
- **Modifies**: `~/.claude/dev-mods/<uuid>/kanban-board/hooks/register.tsx` — adds the `/init` observer and sync handler.
- **Does not modify**: `libs/kanban-core/` — logic is replicated inline, not imported.
- **Does not change** normal `/init` behavior. The mod observes and adds to it; it does not replace it.
