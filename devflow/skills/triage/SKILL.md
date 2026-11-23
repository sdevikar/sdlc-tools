---
name: triage
description: >
  Puts a new idea in a bin against the project charter: mvp, nice-to-have,
  or out-of-scope, with a one-line reason. The user confirms the bin. Then
  writes the idea to .devflow/kanban.yaml. Use when the user brings a new
  idea, feature request, or "we should also..." before any design work.
argument-hint: "<the idea>"
---

## What this skill does

Makes each scope change a visible decision. It proposes a bin; the user
decides. It never blocks the user from working on any idea. The idea:
$ARGUMENTS

---

## Step 1 — Read the charter and the board

Read `<project_root>/.devflow/charter.md`. If it is missing, tell the user
that triage needs a finish line, and offer `/devflow:charter`. Stop there.

Read the board at the path in the `KANBAN_BOARD` environment variable, else
`.devflow/kanban.yaml`. If an entry already covers the idea, show it and ask
if the user wants to change it.

## Step 2 — Propose a bin

| Bin | When |
|---|---|
| `mvp` | The project cannot check a "Done means" line without it. |
| `nice-to-have` | It helps, but every "Done means" line can be checked without it. |
| `out-of-scope` | It matches an "Out of scope" line, or it serves another goal. |

Give the bin and a one-line reason that names the charter line. Example:
"`nice-to-have`: no Done means line needs a dark mode." Ask the user to
confirm or change it.

## Step 3 — Write the entry

After the user confirms, add one entry to the board. If the board file is
missing, create it with `entries:` as the top key. Keep every other entry as
it is. Use this form, with tags as a block list, because the kanban pane
parses only that form:

```yaml
  - id: <kebab-case name, usable as an OpenSpec change name>
    title: <short title>
    lane: Not Started
    priority: <1 for mvp, 50 for nice-to-have, 99 for out-of-scope>
    specPath: ""
    summary: <one sentence>
    status: idea
    createdAt: <YYYY-MM-DD>
    updatedAt: <YYYY-MM-DD>
    tags:
      - <bin>
    notes: <the reason>
```

If the bin is `out-of-scope`, also add `- <idea>: <reason>` under the
charter's `## Rejected` section. If the user wants to keep it for later, use
`## Parking lot` instead.

## Step 4 — Report

Say the bin and the board path in one line. If the bin is `mvp` and the
charter's Process names OpenSpec, offer `/opsx:propose <id>`.

## Constraints

- Never refuse or delay work on an idea because of its bin.
- Never commit.
- Write nothing before the user confirms the bin.
