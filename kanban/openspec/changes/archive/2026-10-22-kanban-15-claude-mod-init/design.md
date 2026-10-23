# Design

## Context

See proposal.md - Why.

The mod's `register.tsx` already hooks `session.start`, `tool.call`, `command.run`, and `ui.render` for the kanban pane. This change adds a second `command.run` hook (for `init`) and a second `ui.render` hook (for the init-dialog pane).

The `$.state` contract lives in `types/index.d.ts`. It currently declares `collapsed: boolean`. This change adds `initMode: 'init' | 'sync' | null`.

## Goals / Non-Goals

**Goals:**
- Observe the built-in `/init` command and offer to create or sync `docs/kanban.yaml`.
- Show an inline dialog pane with Yes/No buttons.
- Inline the three sync functions (`mapLane`, `mapStatus`, `mergeSync`) so the mod has no compile-time dependency on `kanban-core`.

**Non-Goals:**
- Replace or alter normal `/init` behaviour.
- Change the existing kanban pane or its collapse state.
- Support syncing from a source other than `openspec/changes/`.

## Decisions

### D1: Dialog via `$.ui.open` with `rows`, `focus`, `closeOnEscape`

The reference documents this as the dialog pattern. The pane opens inline (`rows: 5`), traps focus, and Esc closes it. No separate UI mechanism is needed.

**Alternative**: `$.session.append` a user-role message asking the question, then intercept the next prompt.  
**Rejected**: That would inject a model turn and potentially confuse the conversation history.

### D2: Mode stored in `$.state`

The `command.run` hook determines mode (init vs sync) from whether `docs/kanban.yaml` exists. It stores the mode in `$.state` under key `initMode`, then opens the pane. The `ui.render` hook reads `initMode` to show the correct prompt text and to know which operation to run on Yes.

**Alternative**: Pass mode through the pane's `requestId`.  
**Rejected**: The `requestId` is constrained to `[a-zA-Z0-9_-]` and is a structural id, not a payload.

### D3: Inline sync logic

`mapLane`, `mapStatus`, `mergeSync` are copied inline as plain functions. They read only the artifacts array from `openspec status --json`, which the mod already shells out to in the timer callbacks.

The mod uses `$.process.run` to call `openspec list --json` and `openspec status --change <name> --json`, matching the existing `checkChangesFolder` pattern.

**Alternative**: Import from `kanban-core`.  
**Rejected**: The mod runs in an isolated module environment with no Node `require`; `$.process.run` is the correct escape hatch.

### D4: Write kanban.yaml via `$.fs.write`

The mod uses `$.fs.write` (same as kanban-core uses `writeKanban` via `node:fs`). The YAML format is a plain string built by the mod; `js-yaml` is not available, so the mod serialises by hand using the same key order and indent as the existing file.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| `openspec` not on PATH when `$.process.run` runs | Catch error, toast the reason |
| `docs/kanban.yaml` already exists but is empty/corrupt | `parseKanban` already returns `[]` on bad input; merge starts from empty |
| User clicks Yes on a project with no `openspec/` directory | Guard: if `openspec list --json` fails, toast and close pane |
