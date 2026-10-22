---
name: kanban-view
description: Render kanban.yaml as vertical swim lanes in the chat window. Use when user asks to view the kanban board.
license: MIT
compatibility: Requires reading docs/kanban.yaml.
metadata:
  author: kanban
  version: "1.0"
---

# kanban-view

Read `docs/kanban.yaml`, group entries by `lane`, sort each group by `priority` ascending. Render a Markdown table with one column per lane (Not Started, In Progress, Archived). Each cell lists cards top-to-bottom as `- **id** — summary (P{priority})`. Print the table to chat. No HTML files are generated.