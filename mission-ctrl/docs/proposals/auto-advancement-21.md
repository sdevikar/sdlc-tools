# Proposal: Auto Spec-Completion Detection

**ID:** `auto-advancement-21`
**Status:** 🔲 Planned
**Depends on:** `judgment-layer-18`

## Why

spec_004 and spec_005 in the e2eeval project were both fully implemented — code committed, tests passing — but stayed `in_progress` until manually closed. No mechanism exists to detect "this spec is done" from observed signals. Every state transition requires an explicit `/mission-ctrl:spec-status` call. This is I4: automatic workflow advancement requires sensing the environment.

## What Changes

**Phase 1: Session-start nudge (minimal, no new infrastructure)**

`on_session_start` (standard/full verbosity): after recap, if any spec is `in_progress` and there are recent git commits, include: "spec_004 is in_progress — if implementation is complete, run `/mission-ctrl:spec-status spec_id=spec_004 new_status=done`."

This costs nothing and covers the "forgot to close" case.

**Phase 2: Git commit convention (opt-in)**

If a commit message contains `closes spec_NNN` (case-insensitive), `on_session_start` detects it in the git log and surfaces a stronger nudge: "Commit `a3f1` references spec_004 — mark as done?"

Relies on `git_commits_since` already in `gitutil.py`. No new git integration needed.

**Phase 3: Judgment-based inference (judgment-layer-18 required)**

`/mission-ctrl:judge type=spec_completion` — given `{spec_id, spec_title, design_digest, recent_commits}`, verdict: `"complete"|"in_progress"|"uncertain"`. Run at session-start for all in_progress specs. If `complete` and `confidence > 0.8`, auto-transition (or propose to user if `requires_approval: true`).

## What This Is Not

- Not CI integration — webhook / CI signal wiring is a separate backlog item requiring infrastructure
- Not forced auto-close — Phase 3 always shows the verdict to the user for approval unless confidence is very high

## Impact

- Phase 1: `packages/pi-package/hooks/session_start.py` — add in_progress + recent-commit check to recap
- Phase 2: `packages/core/logic/recap.py` — add commit-reference detection to `generate_recap`
- Phase 3: depends on `judgment-layer-18`; new judge decision type + `on_session_start` integration

## Done When

- [ ] Phase 1: session-start recap mentions in_progress specs with recent commits and a spec-status suggestion
- [ ] Phase 2: `closes spec_004` in commit message produces a "mark as done?" nudge at session start
- [ ] Phase 3 (judgment): running judge on spec_004 after its commit produces verdict `"complete"` with high confidence
