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

Invoke the `kanban-init` skill. It creates `kanban.yaml` when one does not exist, or syncs it when one already exists. It preserves any fields the user set manually.

**5. Report**

Print one line:

```
Setup complete: openspec ready, kanban-core built, kanban.yaml created/synced
```
