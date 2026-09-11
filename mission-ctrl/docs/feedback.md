# Mission Ctrl — Dogfood Feedback Log

Feedback captured during live dogfood sessions and design conversations.

Sources:
- `ses_0001` — e2eeval project (`/local/mnt/workspace/sdevikar/qcom/e2e/e2eeval`), events evt_000038 through evt_000066
- `ses_conv_2026-09-06` through `ses_conv_2026-09-08` — verbal feedback from this project's dogfood conversations

---

## Strategic Observations: Intelligence Gaps

The following four categories of gaps were identified as a coherent theme — each represents a place where the system makes a rule-based binary decision that actually requires reasoning:

| # | Category | Root Cause | Related items |
|---|----------|------------|---------------|
| I1 | **Dependency ordering** | `depends_on` must be set manually; the planner enforces declared deps but never infers them. Two specs can both be unblocked but have an obvious logical ordering that the system ignores. | F10 (planner blind spot) |
| I2 | **Mission-criticality judgment** | Triage requires an `alignment_verdict` string that Pi supplies freely. No reasoning step checks whether the verdict is consistent with the mission statement or MVP definition — a "Core" verdict is taken at face value. | F4 (MVP % bug masks this further) |
| I3 | **Implementation intent vs. reference** | `on_before_send` uses keyword + interrogative matching. Semantically adjacent messages ("let's think about how we'd build this") pass through; semantically clear messages with edge-case syntax get intercepted. The classifier is a heuristic, not a reasoner. | F3 (partially addressed), F10 |
| I4 | **Automatic workflow advancement** | No mechanism exists to advance spec status based on observed outcomes (commits, passing tests, conversation context). Every transition requires an explicit skill call. | F11 (auto-done), F9 (design gate ceremony) |

**Common root:** All four gaps have the same shape — a deterministic rule is being asked to do a job that benefits from context-awareness. The fix in each case is not a better rule; it's an LLM reasoning step or a signal from the environment (git, CI).

**What this means for the plugin design:** mission-ctrl v1 was deliberately stateless and network-free (core is deterministic, Pi does the reasoning). The I-series gaps are the natural ceiling of that design. v2 likely needs a "judgment layer" — a structured prompt that Pi runs at key decision points (triage, before-send, session-start) that has access to mission + constraints + recent history and returns a structured verdict instead of the current heuristic.

---

## Pending Tactical Items

| ID | Event(s) | Severity | Summary | What's Pending |
|----|----------|----------|---------|----------------|
| F4 | evt_000041 | blocker | MVP % always shows 0% — `links.mvp_items` never populated; counter sees no done work | **Design + impl**: add `done: bool = False` to `MvpItem`; update `_mvp_progress()` / `_mvp_percent()` to count `item.done`; add `mark-mvp-done` skill. Tracked in openspec `mvp-completion-fix-13`. |
| F7-long | ses_conv_2026-09-06 | enhancement | `intent:init` has no path to import existing proposals — mid-project adopters start with an empty store | **Design decision needed**: scope of `--import-openspec <dir>` flag. Which proposal states map to which `SpecStatus`? (archived/merged → DONE? open approved → DESIGN_APPROVED? open draft → DRAFT?) Auto-detect openspec dir or require explicit path? |
| F9 | ses_conv_2026-09-08 | polish | design-propose / design-approve are status bookkeeping, not artifact capture — `key_choices`, `risks`, `open_questions` are always empty; digest truncated to 64 chars; `DRIFT_DETECTED` deferred | **Decision**: expand `DesignProposeInput` to pass structured fields, or leave as free-text and defer until `DRIFT_DETECTED` is implemented? See detail below. |
| F10 | ses_conv_2026-09-08 | ux | `/next` and planner are spec-only — untriaged backlog ideas invisible until triage + spec-create; `/next` returns null when the only work is backlog triage | **Decision**: Option 1 (extend planner return type) vs. Option 2 (surface backlog separately in recap + `/next` skill)? See detail below. |
| F11 | evt_000066 | polish | Spec status not auto-transitioned to `done` after implementation — spec_004 and spec_005 both left in `in_progress`/`blocked` after code was committed and tests passed | **Design decision**: what is the trigger? Git commit message referencing spec_id? Explicit `--closes` flag on spec-status? CI green signal? See detail below. |
| F12 | ses_conv_2026-09-08 | blocker | `on_session_start` hook did not fire when returning to a long-idle tmux session or on exit-then-resume | ✅ Fixed — see detail below. |

---

### F9 — Design Gate: What Shipped vs. Original Intent

**Original intent** (`concept.md §2.6`): a structured one-pager capturing architecture changes, impacted modules, risks, and open questions — a real artifact the user reviews and can reject or modify. Payback: `DRIFT_DETECTED` events at session start when implementation diverges from the recorded design.

**What shipped:**
- `design-propose` accepts a free-text `digest` string (min 10 chars). Only the first 64 chars are stored as `digest_id`. `key_choices`, `risks`, `open_questions` exist on `DesignProposedDecision` but are always written as `[]` — the skill never populates them.
- `design-approve` records a boolean transition. No comparison against the digest.
- Digest content is never surfaced in `recap` or `status`.
- No modify path — only approve or reject+restart.
- `DRIFT_DETECTED` listed as "Deferred to v2" in event catalog.

**Net effect:** calling both skills advances a status machine. There is no artifact produced.

**Decision options:**
1. **Document the gap, change nothing now**: add a note to the SKILL.md and design.md that the gate is a placeholder for drift detection; it is not broken, just incomplete. Reduces the sense of ceremony without any code change.
2. **Expand `DesignProposeInput`**: add optional `key_choices: list[str]`, `risks: list[str]`, `open_questions: list[str]`; pass them into the event builder; update SKILL.md to prompt Pi to populate them from its own reasoning. Prerequisite for eventual `DRIFT_DETECTED`.
3. **Defer everything to v2**: accept ceremony for now; implement when `DRIFT_DETECTED` is scoped.

---

### F10 — Planner Blind Spot: Backlog Ideas Invisible to `/next`

**What happens today:**
`suggest_next` reads only `store.specs.read().nodes`. `store.backlog` is never read anywhere in the logic layer. The fallback string "none available; triage the backlog or finish a spec" in `recap._render` is hardcoded text, not an actual backlog read.

**Consequence:** after finishing a spec (or right after init), if the only work is untriaged ideas, `/next` returns `spec_id: null` and the recap says nothing actionable. AGENTS.md shows counts but not ids or titles.

**Decision options:**
1. **Extend planner return type** — `suggest_next` also returns `BacklogNudge` items for untriaged ideas and specless MVP-critical ideas. `list[Suggestion | BacklogNudge]`. Callers render them differently. Cleanest long-term; breaks planner API and tests.
2. **Surface backlog separately in recap + `/next`** — keep `suggest_next` pure-spec; have `recap.generate_recap` and the `/next` skill call `store.backlog.search()` directly and append a "Backlog actions" section. Non-breaking; backlog logic in two places.
3. **Lightweight nudge field** — add `backlog_pressure: str | None` to `RecapResult` with a pre-formatted string. Very low cost; least composable.

**Recommendation:** Option 2 first, migrate to Option 1 if the planner ever needs to rank backlog actions against specs.

---

### F11 — No Automatic Spec Completion Signal

**What happened (evt_000066):** spec_004 (batch orchestrator) and spec_005 (Docker image) were both fully implemented — code committed, tests passing — but remained in `in_progress`/`blocked` until manually closed with `/mission-ctrl:spec-status`. No mechanism exists to trigger a status transition from an observed outcome.

**Root cause:** The plugin has no `on_after_commit` or CI hook. The only post-write hook is `sync_after_write` (AGENTS.md regen). Spec status transitions are 100% user-initiated.

**Related to I4** (automatic workflow advancement) — the broader version of this problem is that any workflow stage could benefit from environment signals: design approved → start implementation; implementation done → mark done; spec blocked → surface at session start.

**Decision options:**
1. **Git commit message convention**: if commit message contains `closes spec_001` or `[spec_001]`, `on_session_start` reads recent commits, finds the pattern, and prompts user to close the spec. No automation — surfaces a nudge.
2. **`spec-status` flag `--closes-on-commit <spec_id>`**: user declares intent once; next session start checks git log and auto-transitions if a matching commit exists.
3. **Explicit user step, better prompted**: no automation; update AGENTS.md / session-start recap to include "Specs in in_progress with recent commits — consider marking done" as a prompt action.
4. **CI webhook (v2)**: out of scope for CLI plugin; requires infrastructure.

**Recommendation:** Option 3 (better prompting) costs nothing and covers the case. Option 1 (commit message convention) adds value proportional to how often users forget. Decide based on whether the problem recurs.

---

### F12 — SessionStart Hook Silent No-Op on Resume and Compact

**Two reported failure scenarios:**

1. **Idle tmux session, returned after days**: Claude Code fires `SessionStart` with event type `compact` when it auto-compacts a long-running session. Our `hooks.json` had `matcher: "startup|resume"` — `compact` events were silently filtered out. If the session never auto-compacted, `SessionStart` never fires at all (Claude Code has no mechanism to detect "user returned to idle terminal"). This is a permanent limitation for the never-compacted case.

2. **Exit + resume**: Should have matched `"resume"` in our matcher. Most likely failure: the `matcher` field on `SessionStart` is a regex applied to the session type string — if Claude Code sends a variant string (or `matcher` semantics differ from `UserPromptSubmit`), the hook was silently swallowed.

**Root cause:** The `matcher` field was adding an undocumented second gate on top of the gap-tier logic that already handles suppression (`< 1h gap → skip`). The official `remember` plugin (reference implementation) uses no `matcher` on `SessionStart` at all — the gap-tier is sufficient.

**Secondary issue:** `cwd` fallback only checked one field name (`event.get("cwd")`). If Claude Code sends the working directory under a different key on resume, `has_intent_dir` returns False and the hook silently returns None with no diagnostic output.

**Fixes applied (commit below):**
1. `hooks/hooks.json` — removed `matcher` from `SessionStart` hook. Fires on all session events (startup, resume, compact, clear). Gap-tier handles skip logic.
2. `bin/mission-ctrl` — `cmd_hook_session_start` now tries `cwd`, `workingDirectory`, `project_dir` before defaulting to `"."`. Emits a stderr line when returning None so `--debug` mode shows why.

**Residual limitation:** Returning to a never-compacted idle tmux session still can't be auto-detected. User should run `/mission-ctrl:recap` manually when returning after a long absence without triggering a session event.

---

## Closed / Fixed

| ID | Event(s) | Summary | Resolution |
|----|----------|---------|------------|
| F1 | evt_000038 | `.intent/` → `.mission/` rename broke uninitiated sessions against existing stores | ✅ Fixed in `mission-store-rename-14` |
| F2 | evt_000044 | `_redirect_target` falls through to "add-idea" when a spec is already in progress | ✅ Fixed — `on_before_send` short-circuits to `proceed` when any spec is `in_progress` (commit `e84fdfd`) |
| F3 | evt_000045 | Before-send intercepts question-form messages ("How ready are we to implement CR-4?") | ✅ Fixed — `find_implementation_intent` returns `None` for `?`-ending or interrogative-starting messages (commit `e84fdfd`) |
| F5 | evt_000039 | Brief recap labels in-progress spec as "Next:" — collides with `:next` semantics | ✅ Fixed — brief mode shows "Active: `<id>`" for in-progress, suppresses recommendations line (commit `e84fdfd`) |
| F6 | evt_000047 | e2eeval design doc used `--models` (list) but Argo contract requires `--model` (singular) | ✅ Not applicable — consumer-side doc issue |
| F7-short | ses_conv_2026-09-06 | Mid-project init: empty store redirects every "implement" message to add-idea | ✅ Fixed — `on_before_send` returns `proceed` when store has no specs and no backlog items (commit `e84fdfd`) |
| F8 | ses_conv_2026-09-06, evt_000055 | Stale `intent:*` skill names in docs, SKILL.md files, README — Claude suggested non-existent skill names | ✅ Fixed — updated `docs/design.md`, all `SKILL.md` files, `claude-plugin/README.md`, added Available Skills table to `agents_md.jinja2` (commit `e84fdfd`) |

---

## Status Key

- 🔲 Pending — needs design decision or impl
- ✅ Fixed — implemented and tested
- ✅ Not applicable — not a mission-ctrl defect
