# Design

## Context

The Close button handler is correct (see proposal.md, Evidence). The classic renderer does not send mouse clicks to plugins, so only keys can press a button there. A Button `hotkey` presses it while the plugin's site holds the keyboard. A pane holds the keyboard after `ctrl+x tab`, a click, or `$.ui.open({ focus: true })`.

## Goals / Non-Goals

**Goals:**
- Close and collapse work by key in both renderers.
- The user can find the keys from the pane itself.

**Non-Goals:**
- Where the pane sits (dock or inline). That is `kanban-23-pane-renderer-hint`.
- Colors and card layout. That is `kanban-21-pane-visual-design`.

## Decisions

**Hotkeys `x` and `c`.** `x` matches the engine's own `ctrl+x x` close chord. `c` stands for collapse. A Button `hotkey` must be one digit or one lowercase letter. Alternative: digits `1`/`2`. Letters are easier to remember.

**`focus: true` on open from `/kanban-view` only.** The person asked for the pane, so it may take the keys. Alternative: no focus, and rely on `ctrl+x tab`. That keeps the prompt focused, but the user must learn a chord first. Trade-off: with focus, the user presses Escape or `ctrl+x tab` to return to the prompt. The header hint says so.

**No `holdToasts`.** `closeOnEscape` plus `focus` plus `holdToasts` makes a dialog that holds back every toast. The board stays open for a long time, so it must not hold toasts.

**Hint text in the header.** One dim `Text` line, for example `x close · c collapse · ctrl+x tab focus`. It is short, so it fits an inline pane at 80 columns.

**Test through the engine.** `close.test.ts` mounts the Pane on the `terminal` surface, presses `Close`, and checks that a `ui.close` hook beneath sees `{ id: 'kanban-board' }`. The test stubs `session.cwd` and `fs.read` with `{ value }` answers. It needs CLI 2.1.296 or later and `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1`. CLI 2.1.280 at `~/.local/bin/claude` is too old: it fails with `$.state` undefined.

## Risks / Trade-offs

- [Two `claude` binaries on PATH: 2.1.280 first, 2.1.296 via qgenie] → The test task names the binary path to use.
- [Focus takes the keyboard from the prompt] → Header hint names Escape and `ctrl+x tab`.
- [Escape closes the pane while it holds focus, which can surprise a user who wants to go back to the prompt only] → Keep `closeOnEscape`; `kanban-20` asked for it. The hint names `ctrl+x tab` to leave without a close.
