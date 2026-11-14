# Proposal: Backlog Visibility in Planner

## Why

`/next` returns `spec_id: null` and recap says "none available" when the only
pending work is untriaged backlog ideas. `suggest_next` reads only `store.specs`
— `store.backlog` is never consulted. Users who have finished all specs and have
ideas waiting in the backlog get no actionable guidance.

## Prerequisites

None.

## What Changes

**`recap.generate_recap`:** After `suggest_next`, query untriaged and
MVP-critical backlog ideas with no linked spec. Add a
`backlog_actions: list[BacklogAction]` field to `RecapResult`.

**New type `BacklogAction`:** `idea_id`, `title`, `next_skill`
(`/mission-ctrl:triage` or `/mission-ctrl:spec-create`), `reason`.

**`/mission-ctrl:next` skill output:** Append a "Backlog actions" section after
spec suggestions when `backlog_actions` is non-empty.

**`recap._render`:** Standard/full verbosity adds a `## Backlog Actions` section
listing untriaged ideas and spec-less MVP-critical ideas.

**`AGENTS.md` template:** Extend `## Next Up` section to include backlog action
nudges when present.

## Non-goals

- Not a planner rewrite — `suggest_next` stays pure-spec; backlog surfacing lives
  only in the two call sites (recap + next skill).
- Not automated triage — this surfaces ideas; the triage judgment stays manual
  (see `auto-triage-19`).

## Impact

- `packages/core`: `logic/recap.py` (new `RecapResult` field, new `BacklogAction`
  type, `_render` update)
- `packages/pi-package`: `skills/next.py`, `templates/agents_md.jinja2`
- No store schema changes; read-only

## Done When

- [ ] `/next` output includes backlog actions when no specs are actionable
- [ ] `recap` standard/full modes show backlog nudges (idea_id + next skill)
- [ ] `RecapResult.backlog_actions` is a typed field, not a free-text string
- [ ] All existing tests pass; new tests cover empty-spec + non-empty-backlog case
