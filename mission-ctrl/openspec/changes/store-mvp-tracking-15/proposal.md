# Proposal: MVP Tracking Fix

## Why

MVP % has been stuck at 0% since the e2eeval dogfood session. `MvpStore` has no
`add()` method — there is no skill to define MVP items after `init`, so
mid-project stores end up with empty `mvp.json`. `MvpItem.linked_specs` is the
linking field but there is no `mvp-link` skill to associate a done spec with an
MVP item. Because the planner counts completion by checking `linked_specs` against
done specs, an empty MVP list means 0% forever.

## Prerequisites

None.

## What Changes

**Core (`data_stores.py`):** Add `MvpStore.add(title, description)`,
`MvpStore.get(mvp_id)`, and `MvpStore.link_spec(mvp_id, spec_id)` (idempotent).

**Core events:** Add `MVP_ITEM_ADDED` and `MVP_SPEC_LINKED` event types to
`events.py` and `models/meta.py`.

**Pi-package — two new skills:**
- `/mission-ctrl:mvp-add` — calls `MvpStore.add()`, emits event, syncs AGENTS.md
- `/mission-ctrl:mvp-link` — calls `MvpStore.link_spec()`, adds backlink to
  `SpecStore`, emits event

Input schemas: `MvpAddInput(title, description?)` → `MvpAddResult(mvp_item_id)`;
`MvpLinkInput(mvp_item_id, spec_id)` → `MvpLinkResult(mvp_item_id, spec_id)`.

**Claude plugin:** Register both new skills in `_SKILLS`; add `SKILL.md` for each.

## Non-goals

- Not a bulk import or store repair for existing projects — see `mid-project-init-17`.
- Not a separate `mark-mvp-done` skill — completion is inferred from all
  `linked_specs` being `done`, not from an explicit boolean.

## Impact

- `packages/core`: `data_stores.py`, `events.py`, `models/meta.py`, `models/__init__.py`
- `packages/pi-package`: `schemas.py`, `skills/mvp_add.py`, `skills/mvp_link.py`,
  `skills/__init__.py`
- `packages/claude-plugin`: `bin/mission-ctrl`, `skills/mvp-add/SKILL.md`,
  `skills/mvp-link/SKILL.md`

## Done When

- [ ] `MvpStore.add()` and `link_spec()` write correctly to `mvp.json`
- [ ] `/mission-ctrl:mvp-add` creates an MVP item and emits `MVP_ITEM_ADDED`
- [ ] `/mission-ctrl:mvp-link` links a spec bidirectionally and emits `MVP_SPEC_LINKED`
- [ ] MVP % in `recap` reflects linked done specs after using both skills
- [ ] Contract tests pass; 208+ tests green
