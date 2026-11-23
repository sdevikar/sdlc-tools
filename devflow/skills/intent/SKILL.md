---
name: intent
description: >
  Writes or changes an intent at intent/<id>/intent.md, in the format of
  Anthropic's AI-native SDLC playbook: the problem, checkable outcomes,
  affected users and systems, constraints, and open questions, for one piece
  of work. Use when the user starts new work, brings an idea that serves a new goal,
  when the user wants to accept, change, finish, or reject an intent, or when
  devflow:next reports that every outcome is checked.
argument-hint: "[idea, or the intent to change]"
---

## What this skill does

Captures what the user wants, why, and under which constraints, in the
user's own words. Git tracks the file, the next stage reads it, and
`devflow:triage` and `devflow:next` measure against its outcomes. The
session start hook prints a digest of each accepted intent. The request:
$ARGUMENTS

---

## Step 1 — Read what exists

Read every `<project_root>/intent/*/intent.md`. If the request names one of
them, this run changes that file. Skip to Step 4.

Also read the project `README.md` and `CLAUDE.md`, and check if `openspec/`
exists. An intent covers one piece of work, not the whole project. Scope
every line to that work.

## Step 2 — Brainstorm

Ask the questions an analyst would ask, one at a time, with your draft answer
for each, so the user corrects a draft instead of writing from nothing:

1. **Problem** — what the user cannot do today, and why it matters.
2. **Proposed outcome** — what better looks like. At least two lines, each a
   fact a reader can check true or false. Push back on vague lines such as
   "works well".
3. **Affected users and systems** — who and what the change touches.
4. **Constraints** — what the work must not do or change, and what is out
   of scope.
5. **Open questions** — what nobody can answer yet.

Keep the user's words. Do not turn them into formal requirements; that is the
job of the next stage.

## Step 3 — Write the draft

Pick a kebab-case `<id>`, usable as an OpenSpec change name. Show the full
file and ask: **Write `intent/<id>/intent.md`?** Write it only after the user
says yes. Use this template, because the session start hook reads the status
line and the `## ` headings:

```markdown
# Intent: <title>
Author: <name>. Status: draft.

## Problem

<in the user's words>

## Proposed outcome

- [ ] <checkable fact>
- [ ] <checkable fact>

## Affected users and systems

<who and what>

## Constraints

- <what the work must not do>

## Open questions

- <question>
```

## Step 4 — Review and status

Ask the user to read the file and correct it. Then ask: **Accept this
intent?** Change the status only on the user's word:

| Status | When |
|---|---|
| `draft` | Written, not yet reviewed |
| `accepted` | The user reviewed and approved it |
| `done` | The user confirms every outcome is true; check each box first |
| `rejected: <reason>` | The user drops it. Keep the file, so the idea is not proposed again |

Check an outcome box only when the user confirms the fact is true. On a change
to an accepted intent, ask for the reason.

## Step 5 — Offer the commit and the next stage

Offer a commit of the file. Use `intent: <add|accept|change|finish|reject>
<id>` as the subject, and the user's reason as the body for a change.

After an accept, offer the next stage. If `openspec/` exists, offer
`/opsx:propose <id>`, which must read `intent/<id>/intent.md` and answer or
carry forward each open question. Otherwise offer
`superpowers:brainstorming` with the intent.

## Constraints

- Never commit. The user approves each commit.
- Keep the file under about 40 lines. Detail belongs in the spec and plan.
