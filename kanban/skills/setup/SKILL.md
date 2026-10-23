---
name: kanban-setup
description: Post-install setup for the kanban project. Installs openspec, builds kanban-core, initializes openspec if needed, and creates or syncs kanban.yaml.
license: MIT
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

If the tool `kanban_board_setup` (full name ends in `__kanban_board_setup`) is available, call it. It opens a Yes/No dialog and returns the result line, `declined`, or `error: <reason>`.

Otherwise, ask the user in chat: "Create or sync kanban.yaml now?" On yes, invoke the `kanban-init` skill. It preserves any fields the user set manually.

**5. Report**

Print one line that names the outcome of step 4: created, synced, skipped (user declined), or failed (with the reason):

```
Setup complete: openspec ready, kanban-core built, kanban.yaml <created|synced|skipped|failed>
```
