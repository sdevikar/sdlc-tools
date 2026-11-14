# Proposal: Mid-Project Store Repair and Import

## Why

Running `/mission-ctrl:init` on a project that already has work done produces a
store that doesn't reflect reality: empty MVP, no specs, no backlog. The user
must manually reconstruct all state via skill calls — an adoption tax that blocks
mid-project onboarding. The e2eeval project demonstrated this: 6 done specs, 7
backlog ideas, but `mvp.json: {"items": []}`.

## Prerequisites

- `store-mvp-tracking-15` applied (`mvp-add` and `mvp-link` skills must exist)

## What Changes

**New skill: `/mission-ctrl:repair`**

Runs a read-only audit of the current `.mission/` store and returns a structured
health report. Does not write anything — surfaces what is wrong and which skills
to call.

Health checks:
- Empty MVP with specs present → suggests `mvp-add` calls
- Done specs with `mvp_items: []` → suggests `mvp-link` calls for each
- Untriaged backlog items that have a linked spec → stale bucket, suggest re-triage
- `in_progress` spec with unfinished `depends_on` → suggest `spec-status(blocked)`
- Empty `success_criteria` on mission → prompt to update via `mutation-skills-10`

Output: `RepairResult(issues: list[RepairIssue])`, each issue with `severity`,
`description`, and `suggested_skill` + sample input.

**`/mission-ctrl:init` — optional `--import-from` behavior (design deferred)**

When an existing project has openspec proposals or a `KANBAN.md`, init can offer
to pre-populate the store. Decisions about which file types to scan and which
proposal states map to which `SpecStatus` are deferred to the design step.

## Non-goals

- Not automated repair — `/repair` audits and suggests; the user runs the fixes.
- Not a full openspec importer — state mapping decisions require the judgment layer.
- Not a store format migration tool — that is a separate backlog item.

## Impact

- `packages/pi-package`: `skills/repair.py`, `schemas.py` (RepairInput,
  RepairResult, RepairIssue)
- `packages/claude-plugin`: `bin/mission-ctrl`, `skills/repair/SKILL.md`
- `packages/core`: no changes (repair uses existing read methods only)

## Done When

- [ ] `/mission-ctrl:repair` returns a non-empty `issues` list for the e2eeval store
- [ ] Each issue includes `severity`, `description`, and an actionable `suggested_skill` with sample input
- [ ] Running the suggested skills after a repair audit clears all issues on re-run
- [ ] `/repair` on a healthy store returns `issues: []`
- [ ] No writes occur during repair (read-only contract enforced by tests)
