# Proposal: mvp-completion-fix — Correct MVP % at Mid-Project Init

## Problem

When `mission-ctrl` is initialized mid-project (features already shipped), Claude
correctly identifies which MVP items are complete from the user's description.
But the MVP completion percentage shows **0%** for all items, even the ones the
user said are done.

### Root Cause

`MvpItem` has no `done` field. Completion is computed by checking whether all
`linked_specs` are in DONE status:

```python
# agents_sync._mvp_progress() AND recap._mvp_percent() — same pattern, same bug
done = bool(item.linked_specs) and all(s in done_specs for s in item.linked_specs)
```

At init time, `linked_specs` is always empty (`[]`). `bool([])` is `False`.
So every item is 0% done regardless of what the user told Claude during onboarding.

The same two-line pattern is duplicated in both `agents_sync.py` and `recap.py`.

---

## What Changes

### 1. Model: `MvpItem.done` field

Add a `done: bool = False` field to `MvpItem` in `models/mvp.py`:

```python
class MvpItem(BaseModel):
    id: MvpId
    title: str = Field(min_length=1)
    description: str | None = None
    linked_specs: list[str] = Field(default_factory=list)
    done: bool = False          # ← new; default False is backward-compatible
```

Non-breaking: existing `mvp.json` files without the field default to `False`,
preserving current behavior for projects already in flight.

### 2. Completion logic: `done` overrides `linked_specs`

Update both calculation sites so `item.done` is the override path:

```python
# Before (both sites)
done = bool(item.linked_specs) and all(s in done_specs for s in item.linked_specs)

# After
done = item.done or (bool(item.linked_specs) and all(s in done_specs for s in item.linked_specs))
```

Semantics:
- Items tracked through the spec workflow: unchanged behavior (spec links still win).
- Items marked done explicitly (mid-project init, backfill): `item.done = True` → counted.

### 3. Skill: `/mission-ctrl:mark-mvp-done`

A new mutation skill that sets `done = True` on one or more MVP items:

```
Input:  { "item_ids": ["mvp-1", "mvp-3"] }
Output: { "updated": ["mvp-1", "mvp-3"] }
```

- Reads current `mvp.json`, flips `done=True` on each named item.
- Errors if any `item_id` is not found (prevents silent typos).
- Fires the `sync_after_write` decorator → AGENTS.md regenerated.
- Appends `MVP_ITEM_MARKED_DONE` event to `meta.jsonl` (new event type, one per call
  with the full list).

### 4. Init flow: ask Claude to call `mark-mvp-done` for pre-completed items

No changes to `intent:init` signature. Instead, the `/mission-ctrl:init` SKILL.md
gains a post-init instruction:

> After `init`, ask the user which MVP items are already complete. For each one,
> call `/mission-ctrl:mark-mvp-done` with the relevant item IDs before finishing.

This keeps `init` schema clean and avoids a list-of-ids parameter that's awkward
in the common (green-field) case.

---

## New Event Type

```python
class MvpItemMarkedDoneDecision(BaseModel):
    model_config = ConfigDict(extra="forbid")
    item_ids: list[str]

class MvpItemMarkedDoneEvent(EventBase):
    event_type: Literal["MVP_ITEM_MARKED_DONE"]
    decision: MvpItemMarkedDoneDecision
```

---

## Impact

| File | Change |
|---|---|
| `models/mvp.py` | Add `done: bool = False` to `MvpItem` |
| `models/meta.py` | Add `MvpItemMarkedDoneEvent` + extend union |
| `models/__init__.py` | Export new event types |
| `stores/events.py` | Register `MVP_ITEM_MARKED_DONE`, add `EventBuilder.mvp_item_marked_done()` |
| `logic/recap.py` | Update `_mvp_percent()` |
| `agents_sync.py` | Update `_mvp_progress()` |
| `schemas.py` | Add `MarkMvpDoneInput`, `MarkMvpDoneResult` |
| `skills/mark_mvp_done.py` | New skill |
| `skills/__init__.py` | Export `intent_mark_mvp_done` |
| `extension.py` | Register `"mark-mvp-done"` |
| `bin/mission-ctrl` | Add to `_SKILLS` |
| `skills/mark-mvp-done/SKILL.md` | New skill doc |
| `skills/init/SKILL.md` | Post-init instruction for mid-project completion |

No schema migration needed for existing `.mission/` stores: `done` defaults to
`False`, which matches current (buggy) behavior.

---

## Done When

- `_mvp_progress()` and `_mvp_percent()` return correct counts for an `MvpItem`
  with `done=True` and empty `linked_specs`.
- `/mission-ctrl:mark-mvp-done` sets `done=True` on named items and rejects unknown IDs.
- `MVP_ITEM_MARKED_DONE` event is appended to `meta.jsonl`.
- AGENTS.md reflects updated completion % after `mark-mvp-done`.
- All three core fixtures pass updated unit tests.
- Contract test covers `MarkMvpDoneInput`.
