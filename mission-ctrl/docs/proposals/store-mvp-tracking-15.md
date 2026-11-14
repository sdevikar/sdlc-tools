# Proposal: MVP Tracking Fix

**ID:** `store-mvp-tracking-15`
**Status:** 🔲 Planned
**Depends on:** none

## Why

MVP % has been stuck at 0% since the e2eeval dogfood session. Two root causes: (1) `MvpStore` has no `add()` method — there is no skill to define MVP items after `init`, so mid-project stores end up with empty `mvp.json`; (2) `MvpItem.linked_specs` is the linking field but there is also no `mvp-link` skill to associate a done spec with an MVP item. Because the planner counts MVP completion by checking `MvpItem.linked_specs` against done specs, an empty MVP list means 0% forever.

## What Changes

**Core (`mission_ctrl_core/stores/data_stores.py`):**
- `MvpStore.add(title, description)` → creates `MvpItem`, appends to `mvp.json`, returns item (mirrors `ConstraintsStore.add`)
- `MvpStore.get(mvp_id)` → fetch by id (raises `KeyError` if not found)
- `MvpStore.link_spec(mvp_id, spec_id)` → appends `spec_id` to `MvpItem.linked_specs`; idempotent

**Core (`mission_ctrl_core/stores/events.py`):**
- `EventBuilder.mvp_item_added(mvp_id, title)` → emits `MVP_ITEM_ADDED`
- `EventBuilder.mvp_spec_linked(mvp_id, spec_id)` → emits `MVP_SPEC_LINKED`

**Core (`mission_ctrl_core/models/meta.py`):**
- Add `MvpItemAddedDecision` and `MvpItemAddedEvent`
- Add `MvpSpecLinkedDecision` and `MvpSpecLinkedEvent`
- Register both in `MetaEvent` discriminated union

**Pi-package — two new skills:**
- `intent_mvp_add(MvpAddInput)` — `@sync_after_write`, calls `MvpStore.add()`, emits event
- `intent_mvp_link(MvpLinkInput)` — `@sync_after_write`, calls `MvpStore.link_spec()` + `SpecStore` backlink, emits event

**Schemas:**
```python
class MvpAddInput(BaseModel):
    title: str = Field(min_length=1)
    description: str | None = None

class MvpAddResult(BaseModel):
    mvp_item_id: str

class MvpLinkInput(BaseModel):
    mvp_item_id: str
    spec_id: str

class MvpLinkResult(BaseModel):
    mvp_item_id: str
    spec_id: str
```

**Claude plugin:**
- Register `/mission-ctrl:mvp-add` and `/mission-ctrl:mvp-link` in `_SKILLS`
- Add `SKILL.md` for each

## What This Is Not

- Not a bulk import/repair — see `mid-project-init-17` for that
- Not an MVP completion skill — `mark-mvp-done` from the original `mvp-completion-fix-13` is folded here; completion is inferred from `linked_specs` all being `done`, not from a separate boolean

## Impact

- `packages/core`: `data_stores.py`, `events.py`, `models/meta.py`, `models/__init__.py`
- `packages/pi-package`: `schemas.py`, `skills/mvp_add.py`, `skills/mvp_link.py`, `skills/__init__.py`
- `packages/claude-plugin`: `bin/mission-ctrl`, `skills/mvp-add/SKILL.md`, `skills/mvp-link/SKILL.md`

## Done When

- [ ] `MvpStore.add()` + `link_spec()` write correctly to `mvp.json`
- [ ] `/mission-ctrl:mvp-add` creates an MVP item and emits `MVP_ITEM_ADDED`
- [ ] `/mission-ctrl:mvp-link` links a spec to an MVP item bidirectionally and emits `MVP_SPEC_LINKED`
- [ ] MVP % in `recap` reflects linked done specs after using both skills
- [ ] Contract tests pass; 208+ tests green
