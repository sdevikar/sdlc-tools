# Design

## Context

See proposal.md - Why.

Current state after kanban-15 and kanban-27:

| Part | Where | What it does |
| --- | --- | --- |
| `/init` observer | `register.tsx` `command.run` on `init` | Calls `next(e)`, sets `initMode`, opens pane `kanban-init-dialog` |
| Dialog pane | `register.tsx` `ui.render` on `kanban-init-dialog` | Yes runs scan + `mergeSync` + `$.fs.write`; No/Esc closes |
| Setup skill | `skills/setup/SKILL.md` step 4 | Invokes the `kanban-init` skill with no confirmation |

A skill is plain text that the model follows. A skill cannot open a pane. The mod must expose something the model can call from the skill.

## Goals / Non-Goals

**Goals:**
- Move the dialog trigger from `/init` to `/kanban:setup` step 4.
- Reuse the kanban-15 dialog and sync code with small edits.
- Keep `/kanban:setup` usable in harnesses with no mod (OpenCode, Gemini).

**Non-Goals:**
- Change the lane or merge rules.
- Change `libs/kanban-core/` or the `kanban-init` skill.
- Change the main kanban pane.

## Decisions

### D1: The mod registers a tool; the skill tells the model to call it

In `session.start`, the mod calls `$.tool.register({ name: 'kanban_board_setup', ... })`. The engine exposes it as `mcp__<plugin>__kanban_board_setup`. A `tool.call` hook on that name serves it. Setup step 4 tells the model to call the tool.

**Alternative**: hook `skill.prompt` for `setup` and open the dialog when the skill loads.
**Rejected**: the dialog opens before steps 1–3 install openspec. On a fresh clone, Yes fails.

**Alternative**: skill-only chat question, delete the mod dialog.
**Rejected**: the user chose to keep the inline dialog in Claude Code.

### D2: The tool call waits for the user's answer

The `tool.call` hook opens the pane and awaits a promise. The Yes and No handlers resolve it. A `ui.close` hook on the dialog id resolves it as "declined" for Esc. The tool returns `{ result: <text> }`:

| Outcome | Tool result text |
| --- | --- |
| Yes, init | `Kanban init: N entries created` |
| Yes, sync | `Kanban sync: N updated, M unchanged` |
| No / Esc | `declined` |
| openspec fails | `error: <reason>` |

The resolver lives in a module variable. A reload resets it; the pane also closes on reload, so no call stays open.

**Alternative**: return at once and let the dialog run alone.
**Rejected**: the setup summary then cannot report the outcome.

The tool result replaces the `$.session.append` result line from kanban-15. The skill prints the line in its summary.

### D3: Move the Yes handler body into a named function

The Yes `onPress` body (about 70 lines) becomes `runKanbanSetup($): Promise<string>`. The tool hook and the button both use it. This also makes it testable.

### D4: Fallback when the tool does not exist

Step 4 of the skill says: "If the tool `mcp__kanban__kanban_board_setup` is available, call it. Otherwise ask the user in chat, then invoke `kanban-init` on yes." The model knows its own tool list, so no detection code is needed.

### D5: Rename state key and pane id

`initMode` → `setupMode`, `kanban-init-dialog` → `kanban-setup-dialog`. Per project rule, no back-compat shim. Old `$.state` values are session-scoped and disappear on restart.

## Risks / Trade-offs

| Risk | Mitigation |
| --- | --- |
| The tool's full name depends on the plugin name (`kanban` from plugin install, `kanban-board` from the dev-mods folder) | Skill text names the suffix `kanban_board_setup` and says "the kanban setup tool"; verify the real name with `$.tool.list` during task 2 |
| Pane cannot be placed (terminal too narrow) and the tool waits forever | If `$.ui.open` returns `isPlaced: false`, return `error: <reason>` at once |
| Tool permission prompt before the dialog | Accept: one extra prompt on first use. Note it in the README |
| Esc close does not fire a `ui.close` hook as expected | Verify in task 3; if it does not, use a `ui.input` hook for Esc |
