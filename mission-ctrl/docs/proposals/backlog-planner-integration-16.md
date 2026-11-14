# Proposal: Backlog Visibility in Planner

**ID:** `backlog-planner-integration-16`
**Status:** 🔲 Planned
**Depends on:** none

## Why

`/next` returns `spec_id: null` and recap says "none available" when the only pending work is untriaged backlog ideas. `suggest_next` reads only `store.specs` — `store.backlog` is never touched in the logic layer. Users who have finished all specs and have ideas waiting in the backlog get no actionable guidance.

## What Changes

**`recap.generate_recap`** — after `suggest_next`, call `store.backlog.search(bucket=Bucket.UNTRIAGED)` and `store.backlog.search(bucket=Bucket.MVP_CRITICAL)` filtered to ideas with no linked spec. Add a `backlog_actions: list[BacklogAction]` field to `RecapResult`.

**New dataclass `BacklogAction`** (in `logic/planner.py` or `logic/recap.py`):
```python
@dataclass(frozen=True)
class BacklogAction:
    idea_id: str
    title: str
    next_skill: str  # "/mission-ctrl:triage" or "/mission-ctrl:spec-create"
    reason: str
```

**`/mission-ctrl:next` skill output** — append a "Backlog actions" section after spec suggestions when `backlog_actions` is non-empty.

**`recap._render`** — standard/full verbosity: add `## Backlog Actions` section listing untriaged ideas and specless MVP-critical ideas.

**`AGENTS.md` template** — `## Next Up` section already shows specs; extend to include backlog action nudges when present.

## What This Is Not

- Not a planner rewrite — `suggest_next` stays pure-spec; backlog surfacing lives in the two call sites (recap + next skill)
- Not automated triage — this only surfaces ideas; triage judgment is still manual (see `auto-triage-19`)

## Impact

- `packages/core`: `logic/recap.py` (new field on `RecapResult`, new `BacklogAction` type, `_render` update)
- `packages/pi-package`: `skills/next.py` (surface backlog actions in output), `templates/agents_md.jinja2`
- No schema changes to stores; read-only

## Done When

- [ ] `/next` output includes backlog actions when no specs are actionable
- [ ] `recap` standard/full modes show backlog nudges (idea_id + next skill)
- [ ] `RecapResult.backlog_actions` is a typed field, not a free-text string
- [ ] All existing tests pass; new tests cover empty-spec + non-empty-backlog case
