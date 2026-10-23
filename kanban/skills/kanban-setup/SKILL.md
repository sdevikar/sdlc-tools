---
name: kanban-setup
description: Post-install setup for the kanban project. Installs openspec, builds kanban-core, initializes openspec if needed, and creates or syncs kanban.yaml.
license: MIT
version: '2'
---

## Steps

**1. Install openspec**

Check whether `package.json` exists at the project root AND `node_modules/@fission-ai/openspec` is absent.
If both conditions hold, run `npm install` at the project root.

**2. Build kanban-core**

Check whether `libs/kanban-core/dist/src/cli.js` exists.
If it is absent, run `npm install && npm run build` inside `libs/kanban-core/`.

**3. Initialize openspec**

Check whether `openspec/config.yaml` exists.
If it is absent, run `npx openspec init` at the project root.

**4. Create or sync kanban.yaml**

If the tool `kanban_board_setup` (full name ends in `__kanban_board_setup`) is available, call it. It runs silently and returns one of:

- A status line (e.g. `Kanban init: …` or `Kanban sync: …`) → report it, skip to step 7.
- `convert-needed` → `kanban.yaml` exists but uses an unrecognized format. Read the file, show the user its current content, explain the expected format (see step 6), and help them convert it. Write the converted file, then continue to step 5.
- `error: <reason>` → report the error, skip to step 7 with outcome `failed`.

If the tool is not available, continue to steps 5 and 6 to scan and write kanban.yaml yourself.

**5. Scan changes**

Collect active changes from `openspec/changes/` (exclude the `archive/` subdirectory). Collect archived changes from `openspec/changes/archive/`. For each change, call `openspec status --change "<name>" --json` to get artifact readiness.

**6. Assign lanes and write kanban.yaml**

| Artifact state | Lane | Status |
|---|---|---|
| tasks = done or ready | In Progress | tasks ready |
| design = done | In Progress | design in progress |
| proposal = done | Not Started | proposal written |
| anything else | Not Started | no proposal |
| Found in archive directory | Archived | archived |

- **Init mode** (`kanban.yaml` does not exist): create the file with all scanned entries. Use default priority 5.
- **Sync mode** (`kanban.yaml` exists): for new changes, add an entry. For existing changes, update `lane` and `status` only. Preserve these fields as the user set them: `priority`, `notes`, `tags`, `assignee`, `githubIssue`. Do not move a lane the user moved manually unless the change is now archived.

**7. Report**

Print one line that names the outcome:

```
Setup complete: openspec ready, kanban-core built, kanban.yaml <created|synced|skipped|failed: reason>
```
