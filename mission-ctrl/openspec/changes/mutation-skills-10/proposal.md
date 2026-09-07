# Proposal: Mutation Skills for Mission, MVP, and Constraints

## Why

`intent:init` is write-once. Once a project is initialized, there is no
supported way to update the mission statement, add an MVP item, or add a
constraint without hand-editing JSON. This matters because direction changes
are normal — a tool that protects mission alignment but cannot update the
mission is broken by design. Every edit to mission/mvp/constraints currently
bypasses the event log, leaving no record of why the direction changed.

## Prerequisites

- `direct-wire-09` applied (plugin must be runnable to dogfood these skills)

## What Changes

Three new skills added to `mission_ctrl_pi` and the Claude plugin:

- `intent:update-mission`: updates `mission.statement` and optionally
  `success_criteria`. Emits `INTENT_UPDATED` event (new event type).
- `intent:add-mvp-item`: appends one item to `mvp.items[]` with title and
  optional description. Emits `MVP_ITEM_ADDED` event (new event type).
- `intent:add-constraint`: appends one constraint to `constraints[]` with
  rule, rationale, and severity. Emits `CONSTRAINT_ADDED` event (new event type).

Each skill: reads current file → validates new value → writes updated file →
logs event. No cross-file logic. No planner changes needed.

Three new SKILL.md files in `packages/claude-plugin/skills/`.
Three new skill functions in `mission_ctrl_pi/skills/`.
Three new input/output schemas in `mission_ctrl_pi/schemas.py`.
Three new event types added to `EventBuilder` and the discriminated union.

## Non-goals

- No `intent:delete-mvp-item` or `intent:remove-constraint` — deferred.
- No `intent:replace-mvp` or bulk-edit operations.
- No impact on planner, recap, or triage logic — those already read from
  the live files and will pick up changes automatically.
- No migration tooling for existing `.mission/` stores — field additions are
  additive and backward-compatible.

## Impact

- Additive to `mission_ctrl_pi` (3 skills, 3 schemas) and `mission_ctrl_core`
  (3 event types in `EventBuilder` + discriminated union).
- AGENTS.md sync fires after each write (existing `@sync_after_write` decorator).

**Done when:** each of the three skills writes the correct updated file, emits
the correct event to meta.jsonl, and the change is visible in `intent:status`
output — verified against a live `.mission/` store.
