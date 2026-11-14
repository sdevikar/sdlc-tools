# Proposal: Semantic Before-Send Classification

## Why

`on_before_send` uses keyword + interrogative matching. This is I3: "let's think
about how we'd build this" passes through; "implement the spec" gets intercepted
even mid-conversation where it is clearly not a standalone implementation trigger.
The heuristic works for clear cases but fails on the edges that matter — and those
edges are exactly the ones that create friction.

## Prerequisites

- `judgment-layer-18` applied

## What Changes

**`on_before_send` — two-stage classification:**

Stage 1 (current): keyword match + interrogative filter. Fast, no judgment needed.

Stage 2 (new): when Stage 1 fires, before redirecting, run `/mission-ctrl:judge
type=before_send` with the message + store state. If verdict is `"reference"`
(not genuine implementation intent), return `proceed`. If `"intent"`, redirect
as today.

**`judge type=before_send` prompt contract:** Input is `{message,
in_progress_specs, recent_events[-5], mission_statement}`; output is
`{verdict: "intent"|"reference"|"ambiguous", confidence, rationale}`. If
`confidence < 0.7`, treat as `proceed` (false-positive avoidance is the goal).

**Bypass phrase preserved:** "override intent" always works regardless of
judgment verdict — it is a hard override, not subject to reasoning.

## Non-goals

- Not replacing Stage 1 entirely — keyword match stays as a fast pre-filter;
  Stage 2 only runs when Stage 1 fires.
- Not fully suppressing ambiguous messages — `"ambiguous"` verdict always proceeds
  to avoid blocking users.

## Impact

- `packages/pi-package/hooks/before_send.py` — add Stage 2 judgment call
- `packages/claude-plugin/skills/judge/SKILL.md` — add `before_send` decision
  type worked example

## Done When

- [ ] "Let's think about how we'd build the export feature" passes through (verdict: `reference`)
- [ ] "Implement the cache layer now" gets intercepted (verdict: `intent`)
- [ ] "implement it" mid-design-discussion passes through (verdict: `reference`, context-aware)
- [ ] Bypass phrase always works regardless of judgment verdict
- [ ] All existing F3 and F2 test cases still pass
