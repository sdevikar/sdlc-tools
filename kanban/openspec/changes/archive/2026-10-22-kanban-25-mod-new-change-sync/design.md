# Design

## Context

See proposal.md for motivation. Extends kanban-24's timer mechanism to also detect new change proposals and add board entries automatically.

## Goals / Non-Goals

**Goals:**
- Add board entries for new changes that have a `proposal.md`, both from Claude turns and from terminal
- Skip folders with no `proposal.md`; retry them each tick until one appears
- Reuse kanban-24's 5-second timer and pattern

**Non-Goals:**
- Removing or moving entries when a folder is deleted (that's archiving, handled by kanban-24)
- Updating entries after they are added (the person edits the board directly)

## Decisions

### Share the timer from kanban-24

The `session.start` hook already calls `$.clock.every(5000, fn)` for the archive check. Extend the same timer callback to also call `checkChangesFolder($)`. One timer, two checks per tick.

### `checkChangesFolder` with mtime guard + skipped set

The function stats `openspec/changes/` mtime. If unchanged and the skipped set is empty, return. Otherwise scan folders, check for `proposal.md` existence with `$.fs.stat`, collect missing entries (folder has `proposal.md` but no kanban entry), run `new-sync` if any. Folders without `proposal.md` go into `skippedFolders` (a module-level `Set<string>`). Each tick, skipped folders are re-checked regardless of mtime—the changes folder mtime does not change when `proposal.md` is written inside a subfolder.

`archive` is excluded from the scan (it is a subfolder, not a change folder).

### `applyNewChanges` in sync.ts

Reads `openspec/changes/`, skips `archive/`, reads `kanban.yaml`, finds folders with `proposal.md` and no entry. For each: extracts the first sentence under `## Why` from `proposal.md` (split on `. ` or `.\n`, take index 0, trim to 80 chars), extracts priority from `NN` in `kanban-NN-<slug>`, creates the entry, appends it. Writes back. Makes no `openspec` calls.

The `specPath` is set to `openspec/changes/<name>/`.

### CLI dispatch

Extends the kanban-24 subcommand dispatch in `cli.ts`: `new-sync` calls `applyNewChanges`, `archive-sync` calls `applyArchives`, anything else calls `syncFromOpenSpec`.

## Risks / Trade-offs

- `$.fs.stat` checks per tick increase to two (archive + changes folder). Still negligible.
- First sentence extraction is heuristic. The proposal contract says the first sentence under `## Why` is a usable summary; the person can edit the board entry after.
- If a changes folder has the same name as an archived change, new-sync won't add a duplicate because the existing kanban entry (in Archived lane) counts as "already has an entry".
