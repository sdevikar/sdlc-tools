# Proposal: Mid-Project Store Repair and Import

**ID:** `mid-project-init-17`
**Status:** 🔲 Planned
**Depends on:** `store-mvp-tracking-15` (needs `mvp-add`, `mvp-link` skills)

## Why

Running `/mission-ctrl:init` on a project that already has work done produces a store that doesn't reflect reality: empty MVP, no specs, no backlog. The user is then expected to manually reconstruct all that state via skill calls — an adoption tax that effectively blocks mid-project onboarding. The e2eeval project demonstrated this concretely: 6 done specs, 7 backlog ideas, but `mvp.json: {"items": []}` and all `mvp_items: []`.

The long-term fix is the judgment layer (proposal 18) which will infer store state from the project context. This proposal is the medium-term bridge: a `/mission-ctrl:repair` skill that audits the current store for known health gaps and emits a guided fix plan, plus an optional import flag for init.

## What Changes

**New skill: `/mission-ctrl:repair`**

Runs a read-only audit of the current `.mission/` store and returns a structured health report. Does not write anything — surfaces what's wrong and which skills to call to fix it.

Health checks:
- Empty MVP (`len(mvp.items) == 0` with specs present) → suggests `mvp-add` calls
- Done specs with `mvp_items: []` → suggests `mvp-link` calls for each
- Untriaged backlog items that have a linked spec → stale bucket, suggest re-triage
- `in_progress` spec with all `depends_on` not done → blocked, suggest `spec-status(blocked)`
- `success_criteria: []` on mission → prompt to update via `mutation-skills-10`

Output: `RepairResult` with `issues: list[RepairIssue]`, each with `severity`, `description`, and `suggested_skill` + suggested input.

**`/mission-ctrl:init` — optional `--import-from` behavior (design decision needed before impl)**

When an existing project has openspec proposals or a `KANBAN.md`, init can offer to pre-populate the store. Decisions deferred to impl: which file types to scan, which proposal states map to which `SpecStatus`, whether this is interactive or produces a repair plan for user review.

## What This Is Not

- Not automated repair — `/repair` audits and suggests; the user runs the fixes
- Not a full openspec importer (that requires judgment layer for state mapping decisions)
- Not a migration tool for store format versions (that is `schema-migration`, a separate backlog item)

## Impact

- `packages/pi-package`: `skills/repair.py`, `schemas.py` (RepairInput, RepairResult, RepairIssue)
- `packages/claude-plugin`: `bin/mission-ctrl`, `skills/repair/SKILL.md`
- `packages/core`: no changes required (repair uses existing store read methods only)

## Done When

- [ ] `/mission-ctrl:repair` returns a non-empty `issues` list for the e2eeval store
- [ ] Each issue includes `severity`, `description`, and an actionable `suggested_skill` + sample input
- [ ] Running the suggested skills after a repair audit clears all issues on re-run
- [ ] `/repair` on a healthy store returns `issues: []`
- [ ] No writes occur during repair (read-only contract enforced by tests)
