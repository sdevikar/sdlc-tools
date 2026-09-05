# Proposal: insights — Behavioral Signal Synthesis from meta.jsonl

## Why

Developers already generate a rich behavioral record without thinking about it.
Every hook intercept, bypass, spec status flip, and session gap lands in
`meta.jsonl` automatically. Nobody reads it.

`log-feedback` requires conscious discipline — notice friction, categorize it,
invoke the skill. Under deadline pressure that doesn't happen. The automatic
record doesn't require discipline at all: it captures *what developers
actually did*, not what they intended to log.

`insights` synthesizes that automatic record into actionable patterns. The
goal is zero extra developer discipline: the signal is already there.

---

## What Signals Already Exist (No New Logging Required)

| Event in meta.jsonl | What it reveals |
|---|---|
| `INTENT_INTERCEPTED` (high frequency) | Dev repeatedly hitting the process; either friction or false positives |
| `INTENT_BYPASS_USED` | Explicit override — real urgency, or process frustration |
| `SPEC_STATUS_UPDATED` (any → `blocked`) | Genuine blocker encountered |
| `SPEC_STATUS_UPDATED` (`done` → `in_progress`) | Rework / churn on a spec |
| `SESSION_STARTED` with large `gap_hours` | Momentum loss; project stalled |
| `SESSION_STARTED` gap_hours trend over time | Whether velocity is increasing or declining |
| Long interval between `DESIGN_APPROVED` and first `in_progress` | Design-to-code friction |
| `FEEDBACK_LOGGED` severity=`blocker` cluster | Explicit developer-annotated hard stops |
| `BACKLOG_TRIAGE` → `rejected` rate | How well backlog intake is filtering scope |
| Ratio of `SPEC_CREATED` to `SPEC_STATUS_UPDATED` (done) | Completion rate / spec abandonment |

These signals require no new instrumentation. They are already being written.

---

## What Changes

### 1. Core: `MetaStore.read_signals()` aggregation helper

A pure Python method on `MetaStore` that reduces the full event log into a
structured `SignalSummary` — counts, rates, and sequences, no interpretation:

```python
@dataclass
class SignalSummary:
    intercept_count: int
    bypass_count: int          # bypass / intercept ratio
    blocked_specs: list[str]   # spec IDs that hit 'blocked'
    churned_specs: list[str]   # spec IDs that regressed from done
    stall_sessions: list[float]  # gap_hours for sessions > 24h gap
    avg_design_to_impl_hours: float | None
    blocker_feedback: list[str]  # descriptions from FEEDBACK_LOGGED severity=blocker
    rejection_rate: float      # rejected / total triaged
    completion_rate: float     # done / total specs created
```

No LLM. No interpretation. Counts and sequences only.
Implemented in `mission_ctrl_core/stores/data_stores.py`.

### 2. Skill: `insights` (SKILL.md-only — Claude reasons in-context)

`insights` is not a Python skill. It is a SKILL.md that:

1. Instructs Claude to call the `/mission-ctrl:status` skill for current project
   state, plus read `meta.jsonl` directly (or call a new `read-signals` skill
   that returns the `SignalSummary` JSON).
2. Provides a structured reasoning prompt: what patterns to look for, how to
   weight signals, what to flag.
3. Asks Claude to produce a short structured report covering:
   - **Process friction**: intercept/bypass ratio, most common intercept patterns
   - **Blockers**: specs that hit blocked, feedback-logged blockers
   - **Momentum**: session gap trends, completion rate
   - **Scope discipline**: rejection rate, backlog churn
   - **Decisions to preserve**: key DESIGN_APPROVED choices worth surfacing to memory
4. Optionally: Claude writes a summary to `docs/insights.md` or appends a
   `## Insights` section to CLAUDE.md (user chooses via a flag).

This keeps all interpretation in Claude's context — no LLM calls in core,
constraint satisfied.

### 3. Optional: `read-signals` skill (thin Python wrapper)

A minimal Python skill that calls `MetaStore.read_signals()` and returns the
`SignalSummary` as JSON. Gives Claude structured input to reason about
rather than parsing raw JSONL.

Input: none (reads from project root).
Output: `SignalSummary` as JSON.

This is optional — Claude can read `meta.jsonl` directly if small enough.
Worth adding if meta.jsonl grows large enough to make raw reading unreliable.

---

## What This Is Not

- **Not a replacement for log-feedback.** Explicit annotations remain useful
  for high-signal moments the developer *knows* matter. `insights` reads
  those too, but doesn't depend on them.
- **Not session transcript analysis.** No `.claude/projects/*.jsonl` scanning.
  The behavioral record in `meta.jsonl` is already clean and structured;
  raw transcripts are not.
- **Not a weakness profiler.** The output is process signals, not developer
  judgments. "This spec has been blocked twice" is a process observation.
  "You struggle with async code" is not in scope.
- **Not automated.** The developer still invokes `/mission-ctrl:insights`.
  Automation (e.g., running on session start above a signal threshold) is a
  future extension, not v1.
- **Not a PM dashboard.** No charts, no sprints, no velocity points.

---

## On the Automation Concern

The right framing: `insights` reduces the *cost* of signal capture to zero
(no log-feedback discipline required), but the developer still chooses *when*
to synthesize. Full automation — "run insights every session start if N
intercepts happened" — is a natural v2 extension via the `SessionStart` hook.

v1 establishes the signal → synthesis pipeline. v2 closes the loop by
triggering it automatically.

---

## Impact

- **`mission_ctrl_core`**: `MetaStore.read_signals()` method returning
  `SignalSummary` dataclass. No new event types. No schema changes.
- **`mission_ctrl_pi`**: optional `ReadSignalsInput`/`ReadSignalsResult`
  schemas + thin `read_signals` skill function. Registered in extension and bin.
- **`packages/claude-plugin/skills/insights/SKILL.md`**: the reasoning prompt
  and output structure. This is the primary deliverable.
- **`packages/claude-plugin/skills/read-signals/SKILL.md`** (optional): thin
  wrapper for the Python aggregation.
- No new event types. No changes to existing skills or hooks.
- AGENTS.md sync does not fire (insights is read-only by default).

## Prerequisites

- `log-feedback-06` applied (FEEDBACK_LOGGED events exist in the union)
- At least one week of real dogfood usage so meta.jsonl has non-trivial signal

## Done When

- `MetaStore.read_signals()` returns correct counts against the three
  core fixtures (empty-project, mid-flight, complex-graph).
- SKILL.md guides Claude to produce a non-empty structured report against
  a real `.intent/` store with > 20 events in meta.jsonl.
- Report correctly surfaces: top intercept pattern, any blocked specs, session
  gap trend, completion rate. Verified manually against a live dogfood store.
