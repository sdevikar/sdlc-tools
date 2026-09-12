# Proposal: Design Gate Enrichment and Drift Detection

**ID:** `design-gate-enrichment-22`
**Status:** 🔲 Planned
**Depends on:** `judgment-layer-18`

## Why

`design-propose` and `design-approve` are status bookkeeping. The `key_choices`, `risks`, and `open_questions` fields in `DesignProposedDecision` are always `[]`. The digest is truncated to 64 chars in the event. No `DRIFT_DETECTED` event exists. The gate enforces "no `in_progress` without approval" correctly, but produces no reusable artifact — it is ceremony without payback. The payback was always `DRIFT_DETECTED`: surface when implementation diverged from the recorded design. That requires structured fields to compare against.

## What Changes

**`DesignProposeInput` — new optional structured fields:**
```python
class DesignProposeInput(BaseModel):
    spec_id: str
    digest: str = Field(min_length=10)
    key_choices: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    open_questions: list[str] = Field(default_factory=list)
```

**`EventBuilder.design_proposed`** — pass through the structured fields instead of hardcoding `[]`.

**`design-propose` SKILL.md** — update prompt to instruct the agent to populate `key_choices`, `risks`, `open_questions` from its in-context reasoning. The judgment layer (proposal 18) provides a natural pre-step: run `/mission-ctrl:judge type=design_propose` to structure the design reasoning before calling the skill.

**`/mission-ctrl:status` and `recap`** — surface the design digest in the spec detail output: "spec_001 (design_approved) — Key choices: X, Y. Risks: Z." Currently invisible after logging.

**`DRIFT_DETECTED` event (Phase 2, after judgment-layer-18):**
At session start, for each `in_progress` spec with a design digest, run a judgment comparing `{design_digest, key_choices}` against recent git commits and changed files. Emit `DRIFT_DETECTED` if implementation diverges from stated key choices. Surface in recap.

## What This Is Not

- Not replacing the free-text `digest` field — structured fields are additive and optional
- Not a full design document store — the digest remains the source; structured fields are extracted highlights
- Not blocking `design-propose` when structured fields are empty — they remain optional to avoid new ceremony

## Impact

- `packages/pi-package/schemas.py` — extend `DesignProposeInput`
- `packages/core/stores/events.py` — `design_proposed()` passes through structured fields
- `packages/pi-package/skills/status.py` + `recap.py` — surface digest in output
- `packages/claude-plugin/skills/design-propose/SKILL.md` — add prompt for structured fields
- Phase 2: `packages/core/models/meta.py` (new `DRIFT_DETECTED` event), session_start hook

## Done When

- [ ] `DesignProposeInput` accepts `key_choices`, `risks`, `open_questions`; stored in event
- [ ] `/mission-ctrl:status` shows design digest summary for specs with a recorded design
- [ ] `/mission-ctrl:recap` (full verbosity) includes design highlights for `in_progress` specs
- [ ] Phase 2: `DRIFT_DETECTED` event emitted when recent commits touch modules not in the design scope
