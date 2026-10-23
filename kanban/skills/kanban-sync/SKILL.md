---
name: kanban-sync
description: Sync kanban board with OpenSpec changes.
license: MIT
---

Sync the kanban board by running the compiled kanban-core CLI.

```bash
[ -f libs/kanban-core/dist/src/cli.js ] || (cd libs/kanban-core && npm install && npm run build)
node libs/kanban-core/dist/src/cli.js
```

Run these commands from the project root. Report any non-zero exit as an error.