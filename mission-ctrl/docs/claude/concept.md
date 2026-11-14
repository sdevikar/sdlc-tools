# Mission Ctrl — Concept (Claude Code edition)
## The problem and solution framing, re-grounded in Claude Code's actual capabilities.
Parallels `docs/concept.md` but replaces all Pi references and updates implementation assumptions.

> **Status note:** Sections 0–4 (problem statement, features, non-goals, data-model rationale)
> are authoritative and unchanged in substance from `docs/concept.md`. Sections 5+ reflect
> the Claude Code implementation — different invocation model, different hook system, same goals.

---

## 0. Purpose of This Document

Working reference for understanding *why* mission-ctrl exists and *what* it is trying to do,
from the perspective of a Claude Code user. For the technical how, see `docs/claude/design.md`
and `docs/claude/architecture.md`.

---

## 1. Abstract

### 1.1 Problem Statement

Claude Code dramatically accelerates output velocity. It also amplifies two failure modes:

- **Scope creep**: low-value features get implemented because they're easy to generate, not
  because they're aligned to the project's actual goal.
- **Session drift**: after a break, re-entry cost is high. Claude starts fresh each session.
  Without external context, it will happily reimplement, refactor, or wander.

Existing mitigations (CLAUDE.md, `AGENTS.md`) are static — you write them once and they age.
They don't enforce backlog-first, don't track spec state, and don't capture *why* decisions
were made.

Mission-ctrl adds a **discipline layer** on top of Claude Code:
- Forces all new ideas into a backlog before implementation.
- Requires design approval before `in_progress` can be set on a spec.
- Injects a context-aware recap at session start (from structured state, not chat history).
- Intercepts implementation-intent prompts and redirects them if the gate isn't clear.
- Auto-generates `CLAUDE.md` from the current project state after every intent write.

### 1.2 Solution Overview

A Claude Code plugin that provides:
1. **11 skills** invoked as `/mission-ctrl:skill-name` — backlog, spec, design gate, recap, feedback
2. **3 hooks** wired via `hooks.json` — session start, prompt interception, context sync
3. **An auto-maintained `CLAUDE.md`** — Claude's persistent project context, kept current

The intent store (`.mission/*.json` + `meta.jsonl`) is the single source of truth. It is:
- Git-tracked (small, diffable JSON files)
- Language-agnostic (readable by any tool)
- Append-only for history (`meta.jsonl`), mutable for state (`*.json`)
- Never touched by Claude directly — only written via skills

### 1.3 Design Philosophy

**Integrate, don't replace.** Claude Code already works. Mission-ctrl adds friction only at the
right moments: new idea capture, design review, session start. It stays silent otherwise.

**CLAUDE.md is the primary output.** The auto-generated `CLAUDE.md` is what makes mission-ctrl
invisible during normal work — Claude already reads it at session start, so the intent state is
always in context without any ceremony.

**Structure for reliability, natural language for usability.** Skills take structured JSON input.
The design digest is Claude's own prose (written in conversation, then captured). Neither
extreme — rigid forms nor freeform chat — alone is sufficient.

**No reasoning in core.** All alignment judgments, design proposals, and priority reasoning
happen in Claude's context before a skill is called. Core only validates and persists.

---

## 2. Features

### 2.1 Intent Management

Three files constitute the project "constitution":
- `mission.json` — what success looks like (1–3 sentence statement)
- `mvp.json` — what must exist for "product stands up"
- `constraints.json` — engineering guardrails (no LLM in core, no Node in runtime, etc.)

These are written once via `/mission-ctrl:init` and updated via mutation skills
(mutation-skills-10). The auto-generated `CLAUDE.md` surfaces them in every session, so
Claude always has the context to refuse or redirect misaligned requests.

### 2.2 Backlog-First Idea Capture

Any new idea goes to backlog before implementation:

1. Developer mentions an idea in chat
2. Claude captures it: `/mission-ctrl:add-idea`
3. Claude triages it with alignment judgment: `/mission-ctrl:triage`
4. If MVP-critical: Claude creates a spec: `/mission-ctrl:spec-create`
5. Only after design approval can implementation start

The `UserPromptSubmit` hook intercepts "implement X" prompts and injects a reminder if the
backlog/design gate isn't cleared. This is the Claude Code equivalent of Pi's `on_before_send`.

### 2.3 Design Gate

The design gate is where Claude Code's model differs most from Pi:

**Pi model**: Pi's AI generates a design digest autonomously, then calls `design-propose`.  
**Claude Code model**: Claude proposes the design *in conversation* — the developer reads it,
asks questions, approves it — then Claude calls `/mission-ctrl:design-propose` with a
structured text summary. The human approval happens in chat, not via a separate API call.

This is more natural: the design conversation was already happening in context. The skill just
formalizes the outcome and gates the spec state transition.

The digest format (what to include):
- Proposed files to change
- Pattern or approach chosen
- Key tradeoffs considered
- Any open questions that remain

### 2.4 Session Recap / Re-entry

The `SessionStart` hook fires when Claude Code opens. It calls `generate_recap()` and injects
the result as context before the first user message.

The verbosity tier depends on session gap:
- **< 1h**: ultra-brief — "Welcome back. `spec_001` still in progress."
- **1–24h**: brief — mission one-liner + last focus + next step
- **> 24h or first session**: full — mission + MVP % + last focus + changes since + next + constraints

Unlike Pi, the hook can't block the session start. It fires informationally — the recap is
prepended as `additionalContext` in the hook's JSON output and rendered before Claude responds.

### 2.5 Spec Dependency Graph

Specs have explicit `depends_on` relationships. The core enforces:
- No cycles (validated via `graphlib.TopologicalSorter`)
- Cannot move to `in_progress` until all `depends_on` specs are `done`
- The planner (`suggest_next`) respects this graph when ranking recommendations

### 2.6 Auto-maintained CLAUDE.md

After every skill write, a `PostToolUse` hook (async) regenerates `CLAUDE.md` from the
current intent store state. The file stays < 2KB and always reflects reality.

This is the key insight: **mission-ctrl's primary output is a CLAUDE.md**, not a UI or a
dashboard. Claude Code already reads CLAUDE.md at session start — mission-ctrl just keeps it
current with structured project state.

### 2.7 Feedback Logging

`/mission-ctrl:log-feedback` captures dogfood observations as structured events in `meta.jsonl`.
Category (false_positive, bug, ux, etc.), severity (blocker, polish, backlog), and optional
spec linkage. Enables evidence-based iteration rather than anecdotal fixes.

---

## 3. Non-Goals

- Not a replacement for CLAUDE.md (it generates and maintains CLAUDE.md, not replaces the concept)
- Not a full Jira/Linear replacement
- Not a code review tool
- Not a test runner
- Not verbose or conversational outside of decision points
- No LLM calls inside core — reasoning stays in Claude's context

---

## 4. Data Model Rationale

See `docs/concept.md §4` — the rationale is unchanged. The key decisions:

- Separate current state (JSON files) from decision history (`meta.jsonl`)
- Global canonical IDs across all files
- Language-agnostic storage (Claude Code, Pi, or manual scripting can all read it)
- No business logic embedded in data files

---

## 5. Claude Code Integration Points

### CLAUDE.md hierarchy

Claude Code loads CLAUDE.md files from the current directory and all ancestors. Mission-ctrl
writes to `./CLAUDE.md` (project root). This is the standard project instructions location —
team members see it via version control. No manual setup after `/mission-ctrl:init`.

The generated CLAUDE.md includes:
- Mission statement
- MVP progress (% complete, which items remain)
- Active constraints
- Current focus (in-progress spec)
- Next suggestion
- Backlog summary counts
- Agent instructions (backlog-first, design gate rules)

### Skills as slash commands

Every mission-ctrl skill is available as `/mission-ctrl:skill-name`. Claude Code shows the
description in the slash command menu. Skills with `disable-model-invocation: false` (the
default) can also be auto-invoked by Claude when it determines they're relevant.

### Hooks as behavioral guardrails

The three hooks form a minimal enforcement perimeter:

```
SessionStart → inject recap (informational)
UserPromptSubmit → intercept implementation-intent (can block)  
PostToolUse → keep CLAUDE.md current (async, non-blocking)
```

A future `PreToolUse` hook on `Edit|Write` could enforce the design gate at the tool-call
level — stronger than prompt-level interception but more disruptive to normal Claude Code usage.

### Sub-agents (future)

Claude Code's sub-agent system opens natural extensions:
- A `design-drafter` sub-agent in a forked context could structure the design proposal
  template before the developer reviews it
- A `recap` sub-agent could run `generate_recap()` in isolation, preventing the recap
  output from polluting the main context window

These require no changes to core — they're orchestration patterns on top of existing skills.

---

## 6. Workflow — End to End

```
Developer opens project
  → SessionStart hook → recap injected → Claude knows the state

Developer says "we should add rate limiting"
  → UserPromptSubmit hook: not an implementation-intent → pass-through
  → Claude asks: "want me to capture this to backlog?"
  → /mission-ctrl:add-idea → /mission-ctrl:triage

Developer says "implement rate limiting now"
  → UserPromptSubmit hook: implementation-intent detected
  → Hook injects: "rate limiting is in backlog as idea_003, untriaged. Triage first?"
  → Developer says "yes, make it mvp-critical"
  → /mission-ctrl:triage → /mission-ctrl:spec-create

Claude proposes design in conversation:
  "Here's my approach: middleware in src/api/middleware.py, token bucket per IP,
   Redis-backed. Tradeoff: adds Redis dep. Alternative: in-memory, no persistence."
Developer approves.
  → /mission-ctrl:design-propose (Claude writes the digest)
  → /mission-ctrl:design-approve

Developer says "implement it"
  → UserPromptSubmit hook: spec_001 is design_approved → pass-through
  → Claude implements
  → /mission-ctrl:spec-status (in_progress → done)

Next day, developer opens project
  → SessionStart hook: gap > 24h → full recap injected
  → Claude picks up exactly where things left off
```

---

## 7. Override Model

The enforcement is soft by default. The `UserPromptSubmit` hook can be bypassed with an
explicit override phrase (e.g., "skip backlog check"). The override is logged as
`INTENT_BYPASS_USED` in `meta.jsonl` — never silent.

This matches the design philosophy: mission-ctrl is a discipline enforcer, not a gatekeeper.
Repeated bypasses surface as a pattern in the feedback log and inform future gate calibration.
