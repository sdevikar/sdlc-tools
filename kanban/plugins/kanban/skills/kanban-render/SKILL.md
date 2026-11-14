---
name: kanban-render
description: Render kanban.yaml to a self-contained kanban.html board.
license: MIT
---

Determine the board path: use `$KANBAN_BOARD` relative to the project root if that variable is set, otherwise use `kanban.yaml` at the project root. Read the board file, call renderKanbanHtml, and write the HTML file next to the board (same directory, `.html` extension). Print the path.