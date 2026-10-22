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

Read `docs/kanban.yaml`, sort entries by `priority` ascending. Render a Markdown table with one row per spec (columns: Spec, Summary, Priority, Lane). Print the table to chat. No HTML files are generated.