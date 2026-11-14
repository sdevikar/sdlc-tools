# Proposal: Judgment Layer Architecture

## Why

Every remaining gap in the feedback backlog (I1–I4, F9, F11) has the same shape:
a binary rule is making a decision that requires reading context. The triage
alignment verdict is free-text with no validation against the mission. The
before-send classifier matches keywords, not intent. Spec completion requires a
manual skill call. The current architecture keeps all reasoning conversational —
it happens but does not persist. The judgment layer makes that reasoning
structured and persistent.

## Prerequisites

- `store-mvp-tracking-15` applied
- `backlog-planner-integration-16` applied

## What Changes

**Concept: structured reasoning step at decision points**

At each decision point (triage, before-send, session-start), the agent runs a
short structured prompt over `{mission, constraints, backlog state, recent
context}` and returns a `JudgmentResult` that persists as a
`JUDGMENT_RECORDED` event.

`JudgmentResult` fields: `decision_type`, `inputs`, `verdict`, `confidence`
(0.0–1.0), `reasoning`, `requires_approval`.

**New skill: `/mission-ctrl:judge`**

A meta-skill the agent calls when it needs a structured judgment. Takes
`decision_type` + context payload, returns `JudgmentResult`. The skill persists
the result to `meta.jsonl`. In v1 this is SKILL.md-only (no new Python beyond
the event persistence).

**Hook changes:**

`on_session_start`: when untriaged ideas or unlinked specs exist, emit a judgment
nudge prompt: "Run `/mission-ctrl:judge type=triage` for idea_003."

`on_before_send`: when pattern match fires, run a judgment before redirecting.
If `verdict == "reference"`, proceed. If `"intent"`, redirect as today.

**New core events:** `JUDGMENT_RECORDED` event type in `meta.py` / `events.py`;
`MetaStore.read_judgments(decision_type)` query helper.

## Non-goals

- Not a new LLM integration in core — reasoning happens in the agent's context,
  not inside `mission_ctrl_core`.
- Not replacing skills — judgment produces a verdict; skills execute the write.
- Not fully automated — `requires_approval: true` for consequential decisions.

## Impact

- `packages/core`: `models/meta.py` (new event type), `stores/events.py`,
  `models/__init__.py`
- `packages/pi-package`: `schemas.py` (JudgmentInput, JudgmentResult),
  `skills/judge.py`
- `packages/claude-plugin`: `bin/mission-ctrl`, `skills/judge/SKILL.md`
- `packages/claude-plugin/hooks/hooks.json`: update before-send to use judgment

## Done When

- [ ] `JUDGMENT_RECORDED` event persists with full `JudgmentResult` payload
- [ ] `/mission-ctrl:judge type=triage` produces a structured verdict against the mission statement
- [ ] `on_before_send` uses judgment for ambiguous messages (not just keyword match)
- [ ] SKILL.md contains a worked example of triage judgment with actual mission + idea input
- [ ] All existing 208+ tests still pass
