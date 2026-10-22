## Why

The project no longer maintains a separate `kanban.html`. Instead, a `/kanban-view` skill renders the `kanban.yaml` board as vertical swim lanes directly in the chat window, using Markdown that chat surfaces render natively.

## What Changes

- Add `/kanban-view` skill that reads `kanban.yaml` and prints a vertical swim-lane board (one column per lane, cards listed top-to-bottom by priority).
- Remove references to `kanban.html` generation from plans and skills.
- No external tooling required.

## Capabilities

### New Capabilities
- `kanban-view`: Render kanban.yaml as vertical swim lanes in chat

### Modified Capabilities
- `kanban-core-format`: documentation no longer references kanban.html

## Impact

- New skill: `.opencode/skills/kanban-view/`
- Docs: research report, AGENTS.md