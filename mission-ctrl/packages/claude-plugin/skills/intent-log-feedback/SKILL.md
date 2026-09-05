---
description: Log a structured dogfood issue (false positive, planner miss, verbosity, hook behavior, bug, UX). Use when anything in the intent loop behaves unexpectedly during real use.
---

# intent:log-feedback

Capture structured dogfood observations — false positives, planner misses,
recap verbosity complaints, hook misfires — tagged by category and severity
so future fixes are evidence-based rather than anecdotal.

Appends a `FEEDBACK_LOGGED` event to `.intent/meta.jsonl`. No other file is touched.

## Input (`LogFeedbackInput`)

| Field | Type | Required | Values |
|---|---|---|---|
| `category` | string | yes | `false_positive`, `planner_miss`, `recap_verbosity`, `hook_behavior`, `bug`, `ux`, `other` |
| `description` | string | yes | free-form (what happened, what was expected) |
| `severity` | string | yes | `blocker`, `polish`, `backlog` |
| `related_spec_id` | string | no | spec id if issue relates to a specific spec |

## Output (`LogFeedbackResult`)

| Field | Type |
|---|---|
| `event_id` | string — e.g. `evt_000012` |
| `status` | `"logged"` |

## Invocation

```bash
mission-ctrl skill log-feedback --cwd "<project-dir>" <<'EOF'
{"category": "recap_verbosity", "description": "Recap always prints full spec list even for brief mode", "severity": "polish"}
EOF
```

## Canonical input example

```json
{"category": "recap_verbosity", "description": "Recap always prints full spec list even for brief mode", "severity": "polish"}
```

## Errors

- `NOT_INITIALIZED` — `.intent/` does not exist; run `intent:init` first.
