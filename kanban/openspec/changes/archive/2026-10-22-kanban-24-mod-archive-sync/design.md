# Design

## Context

See proposal.md for motivation. After a change is archived, the pane still shows it in its old lane because nothing writes `docs/kanban.yaml`. This change adds a background poll that detects the archive event and runs a targeted CLI command to move the entry.

## Goals / Non-Goals

**Goals:**
- Detect archive events both from Claude (skill) and from a plain terminal
- Move gap entries to Archived lane without touching any other entry
- Show a toast if the CLI fails; otherwise be silent

**Non-Goals:**
- New changes missing from the board (kanban-25)
- Fixing the full sync's status/date issues
- Watching `docs/kanban.yaml` for manual edits

## Decisions

### CLI subcommand dispatch

The current `cli.ts` runs `syncFromOpenSpec` unconditionally. Add a `process.argv[2]` check: `archive-sync` runs the new `applyArchives` function, anything else (including no argument) runs `syncFromOpenSpec` as before.

This avoids breaking the existing `kanban-sync` bin entry and the `/kanban-sync` command.

### `applyArchives` in sync.ts

Pure function: reads archive dir, reads `kanban.yaml`, finds gaps (archived folder name with no entry or entry whose lane is not Archived, compared case-insensitively), updates those entries in-place or appends new ones, writes back. Makes no `openspec` calls and no network I/O.

The function reuses the `SyncArchivedChange` type and the existing `writeKanban` / `readKanban` calls from `kanban.js`.

### Timer + mtime guard in the mod

`$.clock.every(5000, fn)` fires every 5 s. The callback calls `$.fs.stat` on `openspec/changes/archive`. If the folder's `mtimeMs` is unchanged from the stored value, the callback returns immediately. Only when the mtime changes does the callback run `$.process.run` for archive-sync.

An initial call at `session.start` sets the baseline mtime so the first 5 s tick sees a stable value and doesn't fire spuriously.

If the archive folder doesn't exist yet, `$.fs.stat` throws; the callback catches and ignores it.

### Error handling

`$.process.run` returns the exit code and stderr. On non-zero exit, one `$.ui.toast` shows the error message. No retry until the mtime changes again (the baseline is updated before running the command, so a subsequent tick with the same mtime is a no-op).

### Remove dead command triggers

`opsx-archive` and `opsx-propose` in `KANBAN_COMMANDS` refer to commands registered under `.opencode/`, not Claude Code. They never fire. Remove them. The `command.run` loop now covers only `kanban-sync` and `kanban-render`.

## Risks / Trade-offs

- One `$.fs.stat` every 5 s while the session is open. Negligible I/O.
- `writeKanban` re-serializes the whole file, so YAML comments and blank lines can change. This matches the existing full-sync behavior and is documented in the proposal.
- Race: if the mod writes while Claude runs `Edit`, Claude's edit fails because the file changed; Claude then re-reads and retries. No data is lost.
