# Mission Ctrl — Dogfood Feedback Log

Feedback captured during live dogfood sessions and design conversations, bucketed by root cause.

Sources:
- `ses_0001` — e2eeval project (`/local/mnt/workspace/sdevikar/qcom/e2e/e2eeval`), events evt_000038–evt_000066
- `ses_conv_2026-09-06` through `ses_conv_2026-09-08` — verbal feedback

---

## Bucket A: Hooks

Hook infrastructure — event routing, before-send behavior, session-start reliability.

| ID | Event(s) | Summary | Status |
|----|----------|---------|--------|
| F2 | evt_000044 | `_redirect_target` falls through to "add-idea" when a spec is already `in_progress` | ✅ Fixed — `on_before_send` short-circuits to `proceed` when any spec is `in_progress` (`e84fdfd`) |
| F3 | evt_000045 | Before-send intercepts question-form messages ("How ready are we to implement CR-4?") | ✅ Fixed — `find_implementation_intent` returns `None` for `?`-ending or interrogative-starting messages (`e84fdfd`) |
| F7-short | ses_conv_2026-09-06 | Mid-project init: empty store redirects every "implement" message to add-idea | ✅ Fixed — `on_before_send` returns `proceed` when store has no specs and no backlog items (`e84fdfd`) |
| F12 | ses_conv_2026-09-08 | `SessionStart` hook silent no-op on resume and compact — `matcher: "startup\|resume"` silently dropped `compact` events | ✅ Fixed — removed `matcher` from `SessionStart` hook; broaden `cwd` field resolution (`f99042c`) |

---

## Bucket B: Store Integrity & Onboarding

Store correctness, mid-project adoption, planner completeness.

| ID | Event(s) | Summary | Status |
|----|----------|---------|--------|
| F1 | evt_000038 | `.intent/` → `.mission/` rename broke uninitiated sessions against existing stores | ✅ Fixed — `mission-store-rename-14` |
| F4 | evt_000041 | MVP % always 0% — `links.mvp_items` never populated; counter sees no done work | 🔲 Pending — `store-mvp-tracking-15` |
| F7-long | ses_conv_2026-09-06 | `init` has no path to import existing project work — mid-project adopters start with empty store | 🔲 Pending — `mid-project-init-17` (depends on 15) |
| F10 | ses_conv_2026-09-08 | `/next` and planner are spec-only — untriaged backlog ideas invisible until triage + spec-create | 🔲 Pending — `backlog-planner-integration-16` |

---

## Bucket C: Intelligent Project Management

The rule-based system has a ceiling. All items in this bucket require a reasoning step, not a better rule. See the [Strategic Observations](#strategic-observations) section below.

| ID | Event(s) | Summary | Status |
|----|----------|---------|--------|
| F9 | ses_conv_2026-09-08 | design-propose/approve are status bookkeeping — `key_choices`, `risks`, `open_questions` always empty; digest truncated to 64 chars; `DRIFT_DETECTED` deferred | 🔲 Pending — `design-gate-enrichment-22` |
| F11 | evt_000066 | Spec status not auto-transitioned to `done` when implementation is complete | 🔲 Pending — `auto-advancement-21` |
| I1 | ses_conv_2026-09-08 | Dependency ordering requires understanding what work *means*, not just checking declared deps | 🔲 Pending — `judgment-layer-18` |
| I2 | ses_conv_2026-09-08 | Mission-criticality judgment is subjective — triage alignment verdict is a free-text string with no validation against the mission | 🔲 Pending — `auto-triage-19` |
| I3 | ses_conv_2026-09-08 | Implementation intent vs. reference — keyword + interrogative matching is a heuristic, not semantic understanding | 🔲 Pending — `semantic-intent-20` |
| I4 | ses_conv_2026-09-08 | Automatic workflow advancement — every state transition requires an explicit skill call; no environment signals wired | 🔲 Pending — `auto-advancement-21` |

---

## Bucket D: UX & Output

Labeling, verbosity, output formatting.

| ID | Event(s) | Summary | Status |
|----|----------|---------|--------|
| F5 | evt_000039 | Brief recap labels in-progress spec as "Next:" — collides with `/next` semantics | ✅ Fixed — brief mode shows "Active: `<id>`" for in-progress, suppresses recommendations (`e84fdfd`) |

---

## Bucket E: Docs & Naming

Documentation accuracy, skill name correctness.

| ID | Event(s) | Summary | Status |
|----|----------|---------|--------|
| F8 | ses_conv_2026-09-06, evt_000055 | Stale `intent:*` skill names in docs, SKILL.md files, README — Claude suggested non-existent skill names | ✅ Fixed — updated `docs/design.md`, all `SKILL.md` files, README, added Available Skills table to `agents_md.jinja2` (`e84fdfd`) |

---

## Bucket N/A

| ID | Event(s) | Summary | Status |
|----|----------|---------|--------|
| F6 | evt_000047 | e2eeval design doc used `--models` (list) but Argo contract requires `--model` (singular) | ✅ Not applicable — consumer-side doc issue |

---

## Strategic Observations

The Bucket C items share a common root: the plugin makes binary decisions that require reasoning.

| # | Category | Common shape | Proposal |
|---|----------|-------------|----------|
| I1 | Dependency ordering | "Which should go first" requires understanding what work *means* | `judgment-layer-18` |
| I2 | Mission-criticality | "Does this serve the mission" requires reading the mission, not matching keywords | `auto-triage-19` |
| I3 | Implementation intent | "Is this asking or intending" requires semantic understanding | `semantic-intent-20` |
| I4 | Workflow advancement | "Is this spec done" requires sensing git + tests + conversation | `auto-advancement-21` |

**Root cause:** mission-ctrl v1 is a state machine that requires humans to do all the bookkeeping. Every skill is a manual write. The agent records but never infers. The judgment layer (proposal 18) is the architectural response: at each decision point, instead of a heuristic, the agent runs a structured reasoning step over mission + store state + context and returns a structured decision that gets persisted. The existing `decision` + `reasoning` fields in `MetaEvent` were designed for exactly this.

---

## Pending Item Detail

### F4 / F7-long — Store Integrity (Proposals 15, 16, 17)

The e2eeval project illustrates the problem: `mvp.json` has zero items because `init` creates an empty MVP list with no import path from existing work. All 6 done specs have `mvp_items: []`. The solution is not manual repair skills — it is the judgment layer recognizing existing work and populating the store at adoption time. Until proposal 17 lands, users can hand-edit `mvp.json` directly (JSON format is intentionally human-readable).

### F9 — Design Gate Ceremony (Proposal 22)

The gate enforces "no `in_progress` without `design_approved`" correctly. What's missing is the artifact behind the gate: `key_choices`, `risks`, `open_questions` are always `[]`. The payback — `DRIFT_DETECTED` — is deferred. Decision needed before proposal 22: expand `DesignProposeInput` with structured fields now (prerequisite for drift detection), or defer until the judgment layer can populate them automatically.

### F11 / I4 — Auto-Advancement (Proposal 21)

The immediate fix (better prompting at session start: "spec_004 is in_progress and has 3 commits since — consider marking done") costs nothing and covers the case. The full fix (git commit message convention like `closes spec_001`, or CI signal) is proposal 21.
