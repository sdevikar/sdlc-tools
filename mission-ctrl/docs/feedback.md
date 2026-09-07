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
