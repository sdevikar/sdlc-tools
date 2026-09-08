# Mission Ctrl — Dogfood Feedback Log

Feedback captured during live dogfood sessions. Each row maps to one or more `FEEDBACK_LOGGED` events in `.mission/meta.jsonl` of a consumer project.

Source sessions tracked here:
- `ses_0001` — e2eeval project (`/local/mnt/workspace/sdevikar/qcom/e2e/e2eeval`)
- `ses_conv_2026-09-06` — verbal feedback from this project's dogfood conversation

---

## Pending Decisions

| ID | Event(s) | Severity | Summary | What's Pending |
|----|----------|----------|---------|----------------|
| F4 | evt_000041 | blocker | MVP % always shows 0% — `links.mvp_items` never populated; counter sees no done work | **Design + impl**: add `done: bool = False` to `MvpItem`; update `_mvp_progress()` / `_mvp_percent()` to count `item.done`; add `mark-mvp-done` skill. Tracked in openspec `mvp-completion-fix-13`. |
| F7-long | ses_conv_2026-09-06 | enhancement | `intent:init` has no path to import existing proposals — mid-project adopters start with an empty store | **Design decision needed**: scope of `--import-openspec <dir>` flag. Questions: which proposal states map to which `SpecStatus`? (archived/merged → DONE? open approved → DESIGN_APPROVED? open draft → DRAFT?) Auto-detect openspec dir or require explicit path? What happens to ideas (no spec)? |
| F9 | ses_conv_2026-09-08 | polish | design-propose / design-approve feel like empty ceremony — clicking through a state machine, not a real quality gate | See detailed analysis below. |

---

### F9 — Design Gate: Original Intent vs. What Shipped

**Original intent** (`concept.md §2.6`): design-propose was meant to capture a structured "one-pager" covering architecture changes, impacted modules, risks, and open questions — a real artifact the user could review and reject, not just acknowledge. `design-approve` was the human sign-off on that artifact, with an explicit *modify* path (approve / modify / reject). The payback was supposed to come later via `DRIFT_DETECTED` events when implementation diverged from the digest.

**What shipped:**
- `design-propose` accepts a single free-text `digest` string (min 10 chars). Only the first 64 chars are stored in the event as `digest_id`. The `key_choices`, `risks`, and `open_questions` fields exist on `DesignProposedDecision` but are always written as empty lists — Pi never populates them.
- `design-approve` transitions status and records a boolean. No structured notes or structured comparison against the digest.
- The digest content is never surfaced in `recap` or `status` — invisible after logging.
- No `modify` path — only approve or reject+restart.
- `DRIFT_DETECTED` is deferred to v2 (listed in event catalog under "Deferred").

**Net effect**: In practice, the flow is:
1. Claude reasons about the design naturally in the conversation
2. User calls `design-propose` with a summary string to advance the status
3. User calls `design-approve` to advance status again
4. Both steps are status bookkeeping, not design capture

The gate *is* enforced (can't reach `in_progress` without `design_approved`), so it does block premature implementation. But there is no artifact being reviewed — the ceremony produces nothing reusable or diff-able.

**What's pending / decision points:**

1. **Short-term** (no decision needed): document this gap explicitly. The gate is a placeholder for future drift detection; it is not broken, just incomplete. Add a note to AGENTS.md / design.md that digest content is not yet used downstream — so users don't feel they need to write elaborate prose.

2. **Medium-term** (design decision): should Pi be prompted to fill in structured fields when calling `design-propose`? The `DesignProposedDecision` model already has `key_choices`, `risks`, `open_questions`. The gap is that the skill's `DesignProposeInput` only accepts a flat `digest: str` — no structured fields pass through. Two options:
   - Expand `DesignProposeInput` to accept `key_choices: list[str]`, `risks: list[str]`, `open_questions: list[str]` as optional fields, pass them into the event builder. Pi's SKILL.md guides it to populate them from its own reasoning.
   - Leave digest as free-text, parse structured sections from it at read time (fragile).

3. **Long-term payoff** (deferred): `DRIFT_DETECTED` event — compare committed code diff against the stored digest (or structured fields) and surface divergences at session start. This is what makes the gate worthwhile retroactively. No decision needed now, but the medium-term fix (structured fields) is a prerequisite for this to work.

---

## Closed / Fixed

| ID | Event(s) | Summary | Resolution |
|----|----------|---------|------------|
| F1 | evt_000038 | `.intent/` → `.mission/` rename broke uninitiated sessions | ✅ Fixed in `mission-store-rename-14` |
| F2 | evt_000044 | `_redirect_target` falls through to "add-idea" when a spec is already in progress | ✅ Fixed — `on_before_send` checks for any `in_progress` spec and short-circuits to `proceed` (commit `e84fdfd`) |
| F3 | evt_000045 | Before-send intercepts question-form messages ("How ready are we to implement CR-4?") | ✅ Fixed — `find_implementation_intent` returns `None` when message ends with `?` or first word is an interrogative (`commit e84fdfd`) |
| F5 | evt_000039 | Brief recap labels in-progress spec as "Next:" — collides with `:next` semantics | ✅ Fixed — brief mode now shows "Active: `<id>`" for in-progress, suppresses recommendations line (`commit e84fdfd`) |
| F6 | evt_000047 | e2eeval design doc used `--models` (list) but Argo contract requires `--model` (singular) | ✅ Not applicable — consumer-side doc issue, not a mission-ctrl defect |
| F7-short | ses_conv_2026-09-06 | Mid-project init: empty store causes every "implement" message to redirect to add-idea | ✅ Fixed — `on_before_send` returns `proceed` when store has no specs and no backlog items (`commit e84fdfd`) |
| F8 | ses_conv_2026-09-06 | Claude suggests stale `intent:triage` name instead of `/mission-ctrl:triage` | ✅ Fixed — updated `docs/design.md`, all `SKILL.md` files, and added complete Available Skills table to `agents_md.jinja2` (`commit e84fdfd`) |

---

## Status Key

- 🔲 Pending — needs design decision or significant impl before work can start
- ✅ Fixed — implemented and tested
- ✅ Not applicable — not a mission-ctrl defect
