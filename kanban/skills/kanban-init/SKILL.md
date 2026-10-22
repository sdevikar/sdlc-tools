---
name: kanban-init
description: Initialize or sync the kanban board for a project. Installs openspec if needed and creates or syncs docs/kanban.yaml from openspec changes.
license: MIT
---

## Steps

**1. Install openspec**

Run `npm install @fission-ai/openspec` in the project root. This pins the version in `package.json` at project scope.

**2. Initialize openspec**

If `openspec/config.yaml` does not exist, run `npx openspec init`.

**3. Scan changes**

Collect active changes from `openspec/changes/` (exclude the `archive/` subdirectory). Collect archived changes from `openspec/changes/archive/`. For each change, call `openspec status --change "<name>" --json` to get artifact readiness.

**4. Assign lanes**

| Artifact state | Lane | Status |
|---|---|---|
| tasks = done or ready | In Progress | tasks ready |
| design = done | In Progress | design in progress |
| proposal = done | Not Started | proposal written |
| anything else | Not Started | no proposal |
| Found in archive directory | Archived | archived |

**5. Write or merge `docs/kanban.yaml`**

- **Init mode** (`docs/kanban.yaml` does not exist): create the file with all scanned entries. Use default priority 5.
- **Sync mode** (`docs/kanban.yaml` exists): for new changes, add an entry. For existing changes, update `lane` and `status` only. Preserve these fields as the user set them: `priority`, `notes`, `tags`, `assignee`, `githubIssue`. Do not move a lane the user moved manually unless the change is now archived.

**6. Report**

Print one line: `Kanban init: N entries created` (init mode) or `Kanban sync: N updated, N unchanged` (sync mode).
