# Intent: mission-ctrl

**Author:** Swapnil Devikar  
**Status:** draft  

---

## Problem

AI coding assistants increase output velocity but also increase scope creep, session drift, and re-entry cost. Each new session starts cold. Ideas get implemented the moment they're suggested. There's no persistent record of what the project is actually trying to achieve, what's been decided, or what should come next. The developer ends up doing the PM work manually in their head every session — or stops doing it at all.

Existing spec-driven tools (SDD, Jira, Linear) are either too heavy or disconnected from the agent loop. They don't intercept the agent before it starts coding. They don't provide a recap when you return after a break. They don't enforce "backlog first" at the prompt level.

---

## Proposed outcome

A lightweight Claude Code plugin that acts as a persistent intent layer inside every coding session. It captures mission, MVP, and constraints once at project start, maintains a backlog and spec graph across sessions, intercepts implementation-intent prompts before design is approved, and injects a session recap when you return after time away. The developer stays in Claude Code; nothing changes about how they work except that drift is caught early and focus is protected automatically.

---

## Affected users and systems

**Users:** Solo developers and small teams using Claude Code for active development work. Specifically those who have experienced scope creep or context loss across multi-session projects.

**Systems:**
- Claude Code (plugin host — skills and hooks)
- `.intent/` file store in the project repo (git-tracked, human-readable JSON)
- `AGENTS.md` (auto-regenerated context file read natively by Claude Code)
- `mission_ctrl_core` Python library (pure, no network, no LLM)
- `mission_ctrl_pi` Python package (skills and hooks — currently stubbed for Pi, active for Claude Code)

---

## Constraints

- No LLM calls inside core. All reasoning stays in Claude's context; core only validates and persists.
- No new agent runtime. Works inside Claude Code as a plugin, not as a separate tool.
- No heavyweight PM UI. The entire surface is skills (slash commands) and hooks. No dashboards, no drag-and-drop, no external services.
- Store stays small and diffable. `.intent/` files are plain JSON committed to git. No binary formats, no databases.
- Minimal dependencies. Python stdlib + Pydantic. No Node.js in the runtime path.

---

## Open questions

- Should `intent:launch` also write an `intent.md` file (human-readable proto-spec) as a byproduct of onboarding, for team visibility? Or is `AGENTS.md` sufficient?
- What's the right intercept threshold for `on_before_send`? Current hardcoded pattern list will generate false positives. Configurable patterns are deferred to v2 — how much friction will this cause during dogfood?
- How should `.intent/` behave across git branches? Merge conflicts in `specs.json` are currently undocumented and unhandled.
