# Architecture

Shared core library and skills, with thin adapters per harness.

```
kanban.yaml                   ← source of truth (project root)
libs/kanban-core/             ← TypeScript library (parse, sync, render, CLI bins)
skills/                       ← canonical skill definitions
  kanban/                         kanban board query
  kanban-init/                    initialize or sync the board
  kanban-render/                  generate kanban.html
  kanban-sync/                    sync board with OpenSpec changes
  kanban-view/                    render board inline (no LLM call)
  openspec-*/                     OpenSpec lifecycle skills
mod/kanban-board/             ← Claude Code mod source
  hooks/register.tsx              pane UI, auto-sync hooks, setup dialog tool
  hooks/hooks.json                hook module reference
  types/index.d.ts                $.state contract
.opencode/                    OpenCode V2 commands and skills
.cursor/rules/                Cursor rules adapter
.windsurf/rules/              Windsurf rules adapter
.kiro/steering/               Kiro steering adapter
.clinerules/                  Codex adapter
AGENTS.md                     universal fallback
```

## Research

See [plans/opencode-openspec-kanban-plugin-research.md](plans/opencode-openspec-kanban-plugin-research.md) for the full research report and architecture decisions.
