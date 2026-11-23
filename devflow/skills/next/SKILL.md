---
name: next
description: >
  Recommends the one next piece of work and one runner-up, ranked against
  the Proposed outcome lines of the accepted intents in intent/. Reads the
  intents, the kanban board, open handoffs, open OpenSpec changes, and git.
  Use when the user asks what to do next, finishes an item, or starts a session with no plan.
---

## What this skill does

Gives one recommendation, the reason it moves the finish line, and one
runner-up. It recommends; the user decides. It starts no work without
approval.

---

## Step 1 — Collect the facts

| Fact | Source |
|---|---|
| Intents: status, Proposed outcome, Constraints | `<project_root>/intent/*/intent.md`; the status is on the `Status:` line |
| Ideas and their bins | the board at `KANBAN_BOARD`, else `.devflow/kanban.yaml`; the bin is the `mvp`, `nice-to-have`, or `out-of-scope` tag |
| Open handoffs | `.devflow/handoffs/*.md` with `status` not `done`; their open questions and next steps |
| Open OpenSpec changes | `openspec list`, if `openspec/` exists |
| Recent work | `git log --oneline -15` and `git status --short` |

If no intent has `Status: accepted.`, offer `/devflow:intent` and stop. A
ranking needs a finish line.

If every outcome box of every accepted intent is checked, say the work is
done. Offer `/devflow:intent` to mark those intents done and capture the next
one, and stop.

## Step 2 — Rank

Take the first rule that gives a candidate:

1. **Broken things** — a failing test or build you know of, a handoff open
   question that blocks other work, or a draft intent that waits for the
   user's review.
2. **Unblocked `mvp` items** that check an unchecked outcome. Prefer
   work already in progress: an open handoff or an OpenSpec change with tasks.
3. **The `mvp` item that unblocks the most** other items.

Show `nice-to-have` items only when no `mvp` item is open. Never show
`out-of-scope` items. An item with no bin is not ranked; offer
`devflow:triage` for it.

## Step 3 — Report

Keep it to about 5 lines:

```text
Next: <item>. It moves "<outcome>" of <intent id>.
Why first: <one line>.
Runner-up: <item>. <one line>.
```

If the top item has an open handoff for its branch, offer `devflow:pickup`.
If it is an OpenSpec change with open tasks, offer `/opsx:apply <id>`. Run
either one only after the user agrees.

## Constraints

- One recommendation. Do not list the whole board.
- Never edit an intent, the board, or a handoff.
