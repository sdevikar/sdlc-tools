---
name: kanban-view
description: Render kanban.yaml as vertical swim lanes in the chat window. Use when user asks to view the kanban board.
license: MIT
compatibility: Requires libs/kanban-core built with Node.js.
metadata:
  author: kanban
  version: "2.0"
---

# kanban-view

1. If `libs/kanban-core/dist/src/cli-view.js` does not exist, run `npm install && npm run build` inside `libs/kanban-core/`.
2. Run `node libs/kanban-core/dist/src/cli-view.js` from the project root.
3. Print the stdout output verbatim. Do not summarize or reformat it.