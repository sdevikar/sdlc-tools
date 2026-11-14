# Proposal: Design Gate Enrichment and Drift Detection

## Why

`design-propose` and `design-approve` are status bookkeeping today. The
`key_choices`, `risks`, and `open_questions` fields in `DesignProposedDecision`
are always `[]`. The digest is truncated to 64 chars in the event. No
`DRIFT_DETECTED` event exists. The gate enforces "no `in_progress` without
approval" correctly, but produces no reusable artifact. The payback was always
`DRIFT_DETECTED`: surface when implementation diverged from the recorded design.
That requires structured fields to compare against.

## Prerequisites

- `judgment-layer-18` applied (Phase 2 only)

## What Changes

**`DesignProposeInput` — new optional structured fields:**

Add `key_choices: list[str]`, `risks: list[str]`, `open_questions: list[str]`
(all default to empty list). The `design-propose` SKILL.md instructs the agent
to populate these from its in-context reasoning before calling the skill.

**`EventBuilder.design_proposed`:** Pass through the structured fields instead
of hardcoding `[]`.

**`/mission-ctrl:status` and `recap`:** Surface the design digest in spec detail
output: "spec_001 (design_approved) — Key choices: X, Y. Risks: Z."

**Phase 2 — `DRIFT_DETECTED` event:** At session start, for each `in_progress`
spec with a design digest, run a judgment comparing `{design_digest, key_choices}`
against recent git commits and changed files. Emit `DRIFT_DETECTED` if
implementation diverges from stated key choices. Surface in recap.

## Non-goals

- Not replacing the free-text `digest` field — structured fields are additive
  and optional.
- Not blocking `design-propose` when structured fields are empty — they remain
  optional to avoid new ceremony.
- Not a full design document store — the digest remains the source of truth.

## Impact

- `packages/pi-package/schemas.py` — extend `DesignProposeInput`
- `packages/core/stores/events.py` — `design_proposed()` passes through structured fields
- `packages/pi-package/skills/status.py` + `recap.py` — surface digest in output
- `packages/claude-plugin/skills/design-propose/SKILL.md` — add prompt for structured fields
- Phase 2: `packages/core/models/meta.py` (new `DRIFT_DETECTED` event), session_start hook

## Done When

- [ ] `DesignProposeInput` accepts `key_choices`, `risks`, `open_questions`; all stored in event
- [ ] `/mission-ctrl:status` shows design digest summary for specs with a recorded design
- [ ] `/mission-ctrl:recap` (full verbosity) includes design highlights for `in_progress` specs
- [ ] Phase 2: `DRIFT_DETECTED` event emitted when recent commits touch modules not in the design scope
