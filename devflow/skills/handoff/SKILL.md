---
name: handoff
description: >
  Writes or updates this session's handoff at
  .devflow/handoffs/handoff_<slug>_<YYYYMMDD-HHMM>.md, so a later session can
  continue the work with /devflow:pickup. Use when the user asks for a
  handoff, wants to save session state, reaches a stopping point, or when the
  devflow checkpoint asks for an update.
argument-hint: "[what the next session will focus on]"
---

## What this skill does

Keeps one handoff document per session, at a fixed path, with fixed
frontmatter and fixed sections. The first run in a session creates the file.
Each later run, from the user or from the devflow checkpoint, rewrites the
same file in place. A new session finds it by branch, with no pasted path. If
the user passed arguments, treat them as the focus of the next session and
tailor the document to it: $ARGUMENTS

The handoff is a snapshot of the current state, not a history. Git holds the
history, and `/devflow:pickup` reads it.

---

## Step 1 — Collect the git state

Run these from the working directory:

| Value | Command |
|---|---|
| Project root | `git rev-parse --show-toplevel` |
| Branch | `git branch --show-current` (empty on a detached HEAD) |
| HEAD | `git rev-parse HEAD` (full SHA) |
| PR and base | `gh pr view --json url,baseRefName` (skip if `gh` fails or no PR exists) |
| Base without a PR | `git symbolic-ref --short refs/remotes/origin/HEAD`, without the `origin/` prefix; else `main` |
| Time | `date +%Y%m%d-%H%M` |

## Step 2 — Find or build the path

This session's ID is `${CLAUDE_SESSION_ID}`. Look for this session's file:

```bash
grep -l '^session: ${CLAUDE_SESSION_ID}$' <project_root>/.devflow/handoffs/*.md
```

If it prints a path, rewrite that file. Keep its name. Otherwise, create
`<project_root>/.devflow/handoffs/handoff_<slug>_<YYYYMMDD-HHMM>.md`:

- On a feature branch, `<slug>` is the branch name with `/` changed to `-`.
  Branch `feat/foo` gives `handoff_feat-foo_20261112-1405.md`.
- On `main`, `master`, or a detached HEAD, `<slug>` is a short kebab-case topic
  that describes the work. Do not use the branch name.

## Step 3 — Make sure the folder exists

If `.devflow/handoffs/` is missing in the project root, create it. If
`.devflow/.gitignore` is missing, create it with the three lines `*`,
`!.gitignore`, and `!kanban.yaml`. Git then ignores every file in `.devflow/`
except that file and the kanban board.

## Step 4 — Write the document

Start the file with this frontmatter. Write every key, one per line, as
`key: value`. Leave a value empty when it does not apply, but keep the key.

```markdown
---
branch: <branch, or empty on a detached HEAD>
head: <full SHA>
base: <PR base branch, or the default branch>
pr: <PR URL, or empty>
status: <in-progress, or done when the user says the branch work is finished>
session: ${CLAUDE_SESSION_ID}
summary: <where the work stands, on one line>
next: <the first next step, on one line>
---
```

Then write these sections, in this order. Write for a reader who never saw
this session. On an update, rewrite every section from the current state. Do
not add "Update" sections.

1. **Goal** — what the work is for, in one or two sentences.
2. **State** — at most 3 outcomes, in the user's words. Example: "The
   checkpoint fires on commit." Not "Edited checkpoint.py and added tests."
3. **Decisions** — a table with each decision and its reason.
4. **Dead ends** — what failed and why, so the next session does not retry it.
5. **Open questions** — each question with the context needed to answer it.
6. **Next steps** — a numbered list. The first item matches `next`.
7. **Artifacts** — paths or URLs that git does not show, such as plans,
   reviews, specs, and PRs. Do not copy their content.

Keep the document to about 40 lines after the frontmatter. Most of the space
goes to Decisions, Dead ends, Open questions, and Next steps.

Before you save, test each line: **can `git log` or `git diff` tell the reader
this? If yes, delete the line.** Never list commits or changed files.

## Step 5 — Report

Tell the user the path of the file and the `next` value in one line. Tell them
that the next session shows a pointer to it, and that `/devflow:pickup`
continues the work. On an update from the devflow checkpoint, report the path
only.

---

## Constraints

- **No secrets.** Replace every token, key, or password with `<redacted>`.
- **Never push.**
- **Never edit `.gitignore` without approval.**
- **Never commit** during a handoff, so the update creates no new checkpoint.
- One handoff per session. Edit only the file with this session's ID. Do not
  edit or delete handoffs from other sessions.
