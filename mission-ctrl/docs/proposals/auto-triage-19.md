# Proposal: Automated Triage via Mission-Alignment Scoring

**ID:** `auto-triage-19`
**Status:** 🔲 Planned
**Depends on:** `judgment-layer-18`

## Why

Today, triage requires the agent to supply a free-text `alignment_verdict` string. There is no check that this verdict is consistent with the mission statement, MVP definition, or constraints. Two ideas with opposite implications for the mission can both get `"Core"` verdicts because the judgment is completely unchecked. This is I2: mission-criticality judgment is subjective and the current system enforces nothing.

## What Changes

**`/mission-ctrl:triage` SKILL.md** — update the prompt to instruct the agent to run `/mission-ctrl:judge type=triage` before calling triage, using the mission + MVP + constraints as input. The judgment verdict determines the bucket recommendation and alignment verdict.

**Auto-triage session nudge** — `on_session_start` (full verbosity): when untriaged ideas exist, include a structured block: "idea_003 (OAuth redesign) — run `/mission-ctrl:judge type=triage idea_id=idea_003` to assess against mission before triaging."

**`/mission-ctrl:judge type=triage` prompt contract:**
- Input: `{idea_id, idea_title, idea_description, mission_statement, mvp_items, constraints}`
- Output: `{bucket: "mvp"|"later"|"rejected", alignment: {mission, mvp, constraints}, rationale}`
- If bucket == "mvp" but the idea doesn't touch any MVP item — flag as `requires_approval: true`

## What This Is Not

- Not fully automatic — the agent proposes a bucket; the user confirms or overrides before triage writes
- Not a replacement for `triage` skill — it's a pre-step that structures the agent's reasoning

## Impact

- `packages/claude-plugin/skills/triage/SKILL.md` — add judgment pre-step instructions
- `packages/claude-plugin/skills/judge/SKILL.md` — add `triage` decision type worked example
- `packages/pi-package/hooks/session_start.py` — add untriaged idea nudge to full verbosity recap
- No core changes required beyond what proposal 18 ships

## Done When

- [ ] Triaging an idea after running `/mission-ctrl:judge type=triage` produces a verdict consistent with the mission statement
- [ ] An idea that doesn't relate to any MVP item is flagged before being bucketed as `mvp_critical`
- [ ] Session-start full recap lists untriaged ideas with judgment prompts
