# Proposal: Judgment Layer Architecture

**ID:** `judgment-layer-18`
**Status:** 🔲 Planned
**Depends on:** `store-mvp-tracking-15`, `backlog-planner-integration-16`

## Why

Every remaining gap in the feedback backlog (I1–I4, F9, F11) has the same shape: a binary rule is being asked to make a decision that requires reading context. The triage alignment verdict is a free-text string with no validation against the mission. The before-send classifier matches keywords, not intent. Spec completion requires a manual skill call. Dependency ordering is declared by the user, never inferred.

The current architecture deliberately keeps all reasoning in the agent's context (core is deterministic, no LLM calls). The gap is that the agent's reasoning is unstructured — it happens conversationally and doesn't persist. The judgment layer makes that reasoning structured and persistent.

## What Changes

**Concept: structured reasoning step at decision points**

At each decision point (triage, before-send, session-start), instead of a heuristic, the agent runs a short structured prompt over `{mission, constraints, backlog state, recent context}` and returns a `JudgmentResult` that gets persisted as a `JUDGMENT_RECORDED` event.

```python
class JudgmentResult(BaseModel):
    decision_type: str          # "triage", "before_send", "spec_completion"
    inputs: dict                # what was reasoned over
    verdict: str                # the structured decision
    confidence: float           # 0.0–1.0
    reasoning: str              # human-readable rationale
    requires_approval: bool     # whether to show to user before acting
```

**New SKILL.md: `/mission-ctrl:judge`**

A meta-skill that the agent calls when it needs to make a structured judgment. Takes `decision_type` + context payload, returns `JudgmentResult`. The skill persists the result to `meta.jsonl` as `JUDGMENT_RECORDED` — the agent then acts on the verdict.

This is a SKILL.md-only skill in v1 (like `launch-skill-11`) — it instructs the agent how to reason and format the verdict, with no new Python code beyond persisting the structured result.

**Hook changes:**

`on_session_start` — after gap-tiered recap, if store has untriaged ideas or unlinked specs, emit a judgment nudge prompt: "Run `/mission-ctrl:judge type=triage` for idea_003 — describe it relative to the mission."

`on_before_send` — when pattern match fires, instead of a static redirect, run a quick judgment on whether this message is genuine implementation intent or contextual reference. If `judgment.verdict == "reference"`, proceed. If `"intent"`, redirect as today.

**Judgment events in core:**
- New `JUDGMENT_RECORDED` event type in `meta.py` / `events.py`
- `MetaStore.read_judgments(decision_type)` query helper

## What This Is Not

- Not a new LLM integration in core — reasoning happens in the agent's context, not inside `mission_ctrl_core`
- Not replacing skills — skills are still the write path; judgment produces a verdict, skills execute the write
- Not fully automated — `requires_approval: true` for consequential decisions; the agent shows the verdict to the user before acting

## Impact

- `packages/core`: `models/meta.py` (new event type), `stores/events.py` (new builder method), `models/__init__.py`
- `packages/pi-package`: `schemas.py` (JudgmentInput, JudgmentResult), `skills/judge.py`
- `packages/claude-plugin`: `bin/mission-ctrl`, `skills/judge/SKILL.md` (most of the work — prompt engineering)
- `packages/claude-plugin/hooks/hooks.json`: update before-send to use judgment when pattern matches

## Done When

- [ ] `JUDGMENT_RECORDED` event persists with full `JudgmentResult` payload
- [ ] `/mission-ctrl:judge type=triage` produces a structured verdict against the mission statement
- [ ] `on_before_send` uses judgment for ambiguous messages (not just keyword match)
- [ ] SKILL.md contains a worked example of triage judgment with actual mission + idea input
- [ ] All existing 208+ tests still pass
