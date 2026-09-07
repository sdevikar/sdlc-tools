# Proposal: mission-store-rename — .intent/ → .mission/ + intent/intent.md

## Why

Anthropic introduced a first-class `intent/` directory standard (Claude Academy
AI-native SDLC Playbook). Our hidden dotfolder `.intent/` collides with that
standard both semantically and visually. Renaming to `.mission/` removes the
ambiguity and reserves `intent/` for its intended purpose: a visible,
git-committed, Claude-readable project context file.

Separately, `AGENTS.md` and `intent/intent.md` serve different purposes:
- `AGENTS.md` = project-level system prompt for other agents (Cursor, Copilot,
  OpenCode). Out of scope for the Claude plugin.
- `intent/intent.md` = auto-generated, Claude Academy-format context document
  derived from `.mission/` state. The Claude plugin's primary sync target.

## What Changes

### 1. Store directory: `.intent/` → `.mission/`

One constant change in `IntentStore`:

```python
INTENT_DIRNAME = ".mission"  # was ".intent"
```

Python class names (`IntentStore`, `intent_dir` attribute) stay unchanged.
All hook, skill, and test code referencing `.intent` strings is updated.

### 2. `init` creates `intent/intent.md`

`/mission-ctrl:init` creates two artifacts:
- `.mission/` — the JSON store (source of truth, unchanged)
- `intent/intent.md` — derived, auto-generated, follows Claude Academy format

### 3. Post-skill hook writes `intent/intent.md`

`sync_after_write` (already fires after every write skill) also regenerates
`intent/intent.md`. No new decorator needed.

`intent_md.jinja2` template maps `.mission/` data to the five Claude Academy
sections:

| Section | Source |
|---|---|
| `## Problem` | `mission.statement` |
| `## Proposed Outcome` | `mvp` items + completion % |
| `## Constraints` | `constraints.rules` |
| `## Open Questions` | untriaged backlog items |
| `## Current Focus` | active spec (extension) |

### 4. Session-start hook: no change

The `has_intent_dir()` function already reads `IntentStore.INTENT_DIRNAME`, so
it detects `.mission/` automatically once the constant changes.

### 5. Docs: `.intent/` → `.mission/`, AGENTS.md removed from Claude plugin context

All live docs updated. Archived openspec left as-is (historical record).

### 6. Kanban note

Future Pi / OpenCode extension: establish `AGENTS.md → CLAUDE.md` linkage.
`AGENTS.md` is the right artifact for those agents; needs wiring.

## Out of Scope

- Renaming `IntentStore` Python class or `intent_dir` attribute
- Patching user's `CLAUDE.md`
- AGENTS.md removal (kept for cross-agent compatibility; just removed from Claude plugin docs)

## Done When

- All tests pass with `.mission/` as store directory.
- `init` creates `intent/intent.md` with all five sections.
- Post-skill writes update `intent/intent.md`.
- Docs use `.mission/` throughout.
