---
name: kanban-sync
description: Sync kanban board with OpenSpec changes.
license: MIT
---

Sync the kanban board with the OpenSpec changes in the current project.

**1. Call the sync tool**

If the tool `kanban_board_setup` (full name ends in `__kanban_board_setup`) is available, call it. It runs silently and returns one of:

- A status line (for example `Kanban sync: …`) → report it. Stop.
- `convert-needed` → the board file exists but uses an unrecognized format. Follow the `convert-needed` handling in `/kanban:kanban-setup` step 3.
- `error: <reason>` → report the error.

**2. Fallback**

If the tool is not available, follow steps 4 and 5 of the `kanban-setup` skill. Scan `openspec/changes/`, assign lanes, and write the board file (use `$KANBAN_BOARD` relative to the project root if set, otherwise `kanban.yaml`) in sync mode.
