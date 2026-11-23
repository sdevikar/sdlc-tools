---
name: charter
description: >
  Writes or changes the project charter at .devflow/charter.md: the goal,
  3 to 5 checkable "done means" lines, the process, what is out of scope, a
  parking lot, rejected ideas, and a dated log of changes. Use when a project
  has no charter, when the user wants to set or move the finish line, or when
  devflow:next reports that every "done means" line is checked.
argument-hint: "[what to change]"
---

## What this skill does

Fixes the project's finish line in one short file, so `devflow:triage` and
`devflow:next` have something to measure against. The session start hook
prints a digest of the file. If the user passed arguments, treat them as the
change to make: $ARGUMENTS

---

## Step 1 — Read what exists

Read `<project_root>/.devflow/charter.md` if it exists. Also read the project
`README.md` and `CLAUDE.md`, and check if `openspec/` exists. Use these to
draft answers, so the user corrects a draft instead of writing from nothing.

## Step 2 — Interview the user

Ask one question at a time. Offer your draft answer with each question.

1. **Goal** — one sentence: who gets what.
2. **Done means** — 3 to 5 lines. Each line is a fact that a reader can check
   true or false, for example "`/devflow:next` gives one recommendation in a
   project with a charter". Push back on vague lines such as "works well".
3. **Process** — how work gets done here, for example "OpenSpec change per
   feature, TDD, atomic commits". If `openspec/` exists, draft "OpenSpec".
4. **Out of scope** — what the project will not do.

On an update, ask only about the sections the user wants to change.

## Step 3 — Write the file

Show the full file and ask: **Write `.devflow/charter.md`?** Write it only
after the user says yes. Use these `## ` headings, in this order, because the
session start hook reads them by name:

```markdown
# Charter

## Goal

<one sentence>

## Done means

- [ ] <checkable fact>

## Process

- <how work gets done>

## Out of scope

- <what the project will not do>

## Parking lot

- <idea>: <why it waits>

## Rejected

- <idea>: <reason>

## Changes

- <YYYY-MM-DD>: <what changed>. <the user's reason>
```

On the first write, the Changes section gets `<date>: Created.` On each later
change to Goal, Done means, or Out of scope, add one line with the date, the
old and new text, and the user's reason. Never delete a Changes line.

Check a "Done means" box only when the user confirms the fact is true.

## Constraints

- Never commit. Git tracks the file through `.devflow/.gitignore`; the user
  commits it.
- Keep the file under about 60 lines. Move detail to an OpenSpec change or
  a plan.
