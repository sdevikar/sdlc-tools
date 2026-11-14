# Proposal: Design Grilling Skill

**ID:** `design-grilling-26`  
**Status:** 🔲 Planned  
**Depends on:** `spec-template-25`  

## Why

`design-propose` asks the AI to write a design after reading the spec title and description. The AI fills the design from its own assumptions. Those assumptions do not get reviewed — they get locked in silently when the developer runs `design-approve`.

Matt Pocock's `grilling` skill solves this by mapping every decision as a branching tree. The AI identifies all open questions, asks them all in one round, and waits for the user to answer before writing anything. This surfaces hidden assumptions before any design is committed.

This proposal adds a `/mission-ctrl:design-grill` skill that does exactly that — and ends by calling `design-propose` automatically with a fully structured digest.

## What Changes

**New skill: `/mission-ctrl:design-grill`**  
Accepts one input: `spec_id`. Does not accept a digest. The digest is produced by the skill itself after grilling.

Workflow:
1. Read the spec from `.mission/specs.json`.
2. Read the codebase context relevant to this spec (existing patterns, module boundaries, test seams).
3. Build a decision tree: every design decision the spec implies, with dependencies between decisions.
4. Identify the frontier: all decisions that can be asked now because their prerequisites are already settled.
5. Ask all frontier questions in a single numbered list. Each question includes a recommended answer so the user can accept it with a short response (e.g., "yes" or "1, 3, 5 yes, 2 no").
6. Receive user answers. Recompute the frontier. Repeat until the frontier is empty.
7. Write the design digest using the six-section template from `spec-template-25`.
8. Call `design-propose` with the resulting digest. Report the `design_proposed` result to the user.

**New schemas:**

```python
class DesignGrillInput(BaseModel):
    spec_id: str

class DesignGrillResult(BaseModel):
    spec_id: str
    status: Literal["design_proposed"] = "design_proposed"
    questions_asked: int
```

**New `design-grill/SKILL.md`**  
Describes the grilling workflow. Key rules from Matt's grilling skill that apply here:
- All frontier questions go in one batch. Do not ask one question and wait.
- The AI looks up environmental facts itself (file names, existing patterns). It does not ask the user about things it can find in the codebase.
- Questions are worded so "yes" accepts the AI's recommendation. The user can override any recommendation.
- The session ends only when the frontier is empty — not when the AI thinks it has "enough."

**`design-propose` remains available directly**  
`design-grill` calls `design-propose` as its final step. Developers who want to skip grilling can still call `design-propose` directly.

## What This Is Not

- Not replacing `design-propose` — it calls it as a final step, does not modify it.
- Not requiring multiple full sessions — grilling completes in one session. Questions are batched to minimize round trips.
- Not a blocker — if the developer runs `design-propose` directly, the system does not require grilling first.

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
