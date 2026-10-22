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

Read `docs/kanban.yaml`, group entries by `lane`, sort each group by `priority` ascending. Render a Markdown table with one column per lane (Not Started, In Progress, Archived). Each column is sorted independently; rows are aligned by position (pad shorter columns with blank cells). Each cell shows the spec id with the summary on the next line. Print to chat. No HTML files are generated.