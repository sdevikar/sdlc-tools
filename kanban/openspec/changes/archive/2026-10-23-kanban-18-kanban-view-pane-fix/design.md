# Design

## Context

The kanban-board mod registers `/kanban-view` as a native command in `session.start`. The `command.run` hook decides between pane and inline rendering. The current gate is `e.presentation.isFullscreen` — true only when Claude Code launched in alternate-screen mode.

`$.ui.open({ id, title })` returns `{ isPlaced: boolean }`. `isPlaced` is false when the surface can't draw the pane (narrow terminal, non-terminal surface). This is the correct signal for fallback.

A project-level skill at `.claude/skills/kanban-view/SKILL.md` holds the same name. If the mod is not loaded, Claude Code routes the command to the skill, which always renders inline.

## Goals / Non-Goals

**Goals:**
- Pane opens whenever the surface supports it, regardless of how Claude Code was launched
- Inline fallback when pane can't be placed
- Remove the competing skill

**Non-Goals:**
- Column-width tuning or pane sizing
- Changing the inline table format

## Decisions

**Use `isPlaced` from `$.ui.open()` instead of `e.presentation.isFullscreen`**

`isFullscreen` is a session-start property that reflects terminal mode, not pane availability. `$.ui.open()` asks the engine directly whether it seated the pane. This is the authoritative signal. Alternative considered: keep `isFullscreen` and add a column-width check. Rejected: two conditions to maintain, still indirect.

**Remove `.claude/skills/kanban-view/SKILL.md`**

The skill is now redundant. Keeping it creates a race: if the mod is not loaded, the skill silently takes over and renders inline with no pane attempt. Removal forces the mod to be the only handler, making loading failures visible.

## Risks / Trade-offs

- If the mod fails to load (deploy error, compile error), `/kanban-view` produces "Unknown command" instead of a silent inline fallback. → Mitigation: run `claude plugin validate` after deploy.

## Migration Plan

1. Edit `mod/kanban-board/hooks/register.tsx`: replace `isFullscreen` gate with `isPlaced` check.
2. Remove `.claude/skills/kanban-view/SKILL.md`.
3. Copy updated `register.tsx` to the deployed mod directory.
4. Reload the mod (restart session or re-invoke the plugin-authoring skill).
