# Proposal: Auto Spec-Completion Detection

## Why

spec_004 and spec_005 in the e2eeval project were both fully implemented — code
committed, tests passing — but stayed `in_progress` until manually closed. No
mechanism exists to detect "this spec is done" from observed signals. Every state
transition requires an explicit `/mission-ctrl:spec-status` call. This is I4:
automatic workflow advancement requires sensing the environment.

## Prerequisites

- `judgment-layer-18` applied (Phase 3 only; Phases 1–2 are standalone)

## What Changes

**Phase 1 — session-start nudge (no new infrastructure):**

`on_session_start` (standard/full verbosity): after recap, if any spec is
`in_progress` and there are recent git commits, include: "spec_004 is in_progress
— if implementation is complete, run `/mission-ctrl:spec-status spec_id=spec_004
new_status=done`."

**Phase 2 — git commit convention (opt-in):**

If a commit message contains `closes spec_NNN` (case-insensitive),
`on_session_start` detects it in git log and surfaces a stronger nudge: "Commit
`a3f1` references spec_004 — mark as done?" Relies on `git_commits_since` already
in `gitutil.py`.

**Phase 3 — judgment-based inference:**

`/mission-ctrl:judge type=spec_completion` — given `{spec_id, spec_title,
design_digest, recent_commits}`, verdict: `"complete"|"in_progress"|"uncertain"`.
Run at session-start for all `in_progress` specs. Auto-transition when
`confidence > 0.8`, or show verdict to user if `requires_approval: true`.

## Non-goals

- Not CI integration — webhook or CI signal wiring is a separate backlog item
  requiring infrastructure.
- Not forced auto-close — Phase 3 always shows the verdict to the user for
  approval unless confidence is very high.

## Impact

- Phase 1: `packages/pi-package/hooks/session_start.py`
- Phase 2: `packages/core/logic/recap.py` (commit-reference detection)
- Phase 3: depends on `judgment-layer-18`; new judge decision type + session_start
  integration

## Done When

- [ ] Phase 1: session-start recap mentions in_progress specs with recent commits and a spec-status suggestion
- [ ] Phase 2: `closes spec_004` in a commit message produces a "mark as done?" nudge at session start
- [ ] Phase 3: running judge on spec_004 after its commit produces verdict `"complete"` with high confidence
