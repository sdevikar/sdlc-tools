# Proposal: Design Grilling Skill

## Why

`design-propose` asks the AI to write a design after reading the spec title and
description. The AI fills the design from its own assumptions. Those assumptions
do not get reviewed — they get locked in silently when the developer runs
`design-approve`. Matt Pocock's `grilling` skill solves this by mapping every
decision as a branching tree, asking all open questions in one round, and waiting
for answers before writing anything. This proposal adds a
`/mission-ctrl:design-grill` skill that does exactly that, ending by calling
`design-propose` automatically with a fully structured digest.

## Prerequisites

- `spec-template-25` applied (six-section template must exist in `design-propose`)

## What Changes

**New skill: `/mission-ctrl:design-grill`**

Accepts one input: `spec_id`. Does not accept a digest — the digest is produced
by the skill itself after grilling.

Workflow:
1. Read the spec from `.mission/specs.json`.
2. Read codebase context relevant to this spec (existing patterns, module boundaries, test seams).
3. Build a decision tree of every design decision the spec implies.
4. Identify the frontier: all decisions whose prerequisites are already settled.
5. Ask all frontier questions in one numbered list. Each question includes a
   recommended answer so the user can accept it with a short response.
6. Receive answers. Recompute frontier. Repeat until frontier is empty.
7. Write the design digest using the six-section template from `spec-template-25`.
8. Call `design-propose` with the resulting digest.

Key grilling rules (from Matt Pocock's approach, adapted):
- All frontier questions go in one batch — never ask one question and wait.
- The AI looks up environmental facts itself (file names, patterns). It does not
  ask the user about things it can find in the codebase.
- Questions are worded so "yes" accepts the AI's recommendation.

New schemas: `DesignGrillInput(spec_id)` → `DesignGrillResult(spec_id,
status: "design_proposed", questions_asked: int)`.

**`design-propose` remains available directly** — `design-grill` calls it as a
final step; developers can still call `design-propose` directly to skip grilling.

## Non-goals

- Not replacing `design-propose` — it calls `design-propose` as its final step
  and does not modify it.
- Not requiring multiple full sessions — grilling completes in one session;
  questions are batched to minimize round trips.
- Not blocking direct `design-propose` usage — grilling is not required.

## Impact

- `packages/pi-package/schemas.py` — add `DesignGrillInput`, `DesignGrillResult`
- `packages/pi-package/skills/design_grill.py` — new skill; calls `intent_design_propose` internally
- `packages/pi-package/skills/__init__.py` — register `design_grill`
- `packages/claude-plugin/skills/design-grill/SKILL.md` — new file
- `packages/claude-plugin/bin/mission-ctrl` — register `design-grill` in `_SKILLS`

## Done When

- [ ] `/mission-ctrl:design-grill` reads a spec and produces a numbered question list covering all design decisions
- [ ] After user answers, it writes a six-section digest and calls `design-propose` automatically
- [ ] `DesignGrillResult.questions_asked` reflects the actual count
- [ ] The resulting spec moves to `design_proposed` status; existing `design-approve` flow works unchanged
- [ ] Contract test covers `design-grill` end-to-end: input spec → output `design_proposed` status
- [ ] `design-propose` called directly still works; grilling is not required
