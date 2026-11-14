# Proposal: Automated Triage via Mission-Alignment Scoring

## Why

Today, triage requires the agent to supply a free-text `alignment_verdict` with
no check that the verdict is consistent with the mission, MVP definition, or
constraints. Two ideas with opposite implications can both get `"Core"` verdicts.
This is I2: mission-criticality judgment is unchecked and subjective.

## Prerequisites

- `judgment-layer-18` applied

## What Changes

**`/mission-ctrl:triage` SKILL.md:** Update the prompt to instruct the agent to
run `/mission-ctrl:judge type=triage` before calling triage. The judgment verdict
determines the bucket recommendation and alignment verdict.

**Auto-triage session nudge:** `on_session_start` (full verbosity) — when
untriaged ideas exist, include a structured block: "idea_003 (OAuth redesign) —
run `/mission-ctrl:judge type=triage idea_id=idea_003` to assess against mission
before triaging."

**`judge type=triage` prompt contract:** Input is
`{idea_id, idea_title, idea_description, mission_statement, mvp_items,
constraints}`; output is `{bucket: "mvp"|"later"|"rejected", alignment: {mission,
mvp, constraints}, rationale}`. If bucket is `"mvp"` but the idea doesn't touch
any MVP item, set `requires_approval: true`.

## Non-goals

- Not fully automatic — the agent proposes a bucket; the user confirms or overrides
  before triage writes.
- Not replacing the `triage` skill — judgment is a pre-step that structures the
  agent's reasoning.

## Impact

- `packages/claude-plugin/skills/triage/SKILL.md` — add judgment pre-step
- `packages/claude-plugin/skills/judge/SKILL.md` — add `triage` decision type
  worked example
- `packages/pi-package/hooks/session_start.py` — add untriaged idea nudge

## Done When

- [ ] Triaging an idea after running `/mission-ctrl:judge type=triage` produces a verdict consistent with the mission statement
- [ ] An idea that doesn't relate to any MVP item is flagged before being bucketed as `mvp_critical`
- [ ] Session-start full recap lists untriaged ideas with judgment prompts
