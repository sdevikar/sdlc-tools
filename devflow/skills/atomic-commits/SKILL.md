---
name: atomic-commits
description: >
  Use this skill BEFORE ANY code change is written — with or without a formal
  plan. Triggers include: (1) plan-mode exit ("let's implement", "start
  coding", "go ahead", after /plan or a design-doc review); (2) direct
  implementation requests ("fix X", "add X", "change X", "refactor X",
  "update X", "can you modify…", "make this…") even when no plan was
  produced; (3) explicit requests for atomic commit planning, commit
  decomposition, or "break this into commits". The skill determines the
  commit sequence from either the existing plan or the stated request, then
  guides implementation one commit at a time with a review pause between each.
---

## What this skill does

Decomposes any upcoming code change into an ordered sequence of atomic commit
units **before any code is written**. Then executes one unit at a time, pausing
for review between each.

The goal is a clean, reviewable git history where each commit is self-contained,
purposeful, and as small as it can be without being artificial.

---

## Entry point — determine the scope

Before producing a commit plan, identify what you have:

**A. Coming out of plan mode** — a written plan exists. Use it directly as the
source of truth for Phase 1.

**B. No prior plan** — the user gave a direct request ("fix X", "add Y",
"refactor Z"). Before producing a commit plan:
1. Restate the change in one sentence to confirm shared understanding.
2. Ask any questions whose answers would change the commit structure (e.g.,
   "does this touch tests?", "should the config change be separate?").
   Skip if the request is unambiguous.
3. Proceed to Phase 1 using the request as the scope document.

In both cases, **do not write any code until the commit plan is approved.**

---

## Phase 1 — Produce the commit plan

Before touching any file, output a numbered commit sequence. Each entry must
include:

- **Purpose** — one sentence, one logical category
- **Files** — list every file that will be created or modified
- **Message** — a short conventional-commit-style subject line

Order dependencies first: if commit N depends on something introduced in
commit M, M comes before N.

**Present the commit plan and wait for explicit approval before writing any
code.** The user may reorder, split, or merge units.

### Merge test — what belongs in one commit

Put two units in one commit when **nobody would revert or cherry-pick one
without the other**, or when the first unit alone leaves the repo in a state
that should not ship.

| Keep together | Keep apart |
|---|---|
| A config key and the code that reads it | A refactor and a behavior change |
| A function change and its tests | Unrelated bug fixes |
| A new module and its unit tests | Mechanical changes (renames) and logic changes |
| | Dependency bumps |
| | CI or build changes that stand alone |

If two changes touch the same file but serve different purposes, they belong in
different commits — split the work, not the file.

### Volume check

A plan with more than 4 commits for one task **must state, for each commit
after the fourth, why it cannot merge with another commit**. If no good reason
exists, merge it into an earlier commit.

---

## Phase 2 — Execute one unit at a time

For each commit unit, in order:

1. Implement all changes for that unit — and only that unit.
2. Stage the relevant files by name: `git add <file1> <file2> ...`
3. Commit: `git commit -m "<message>"`
4. **Stop and show the user what was committed. Wait for explicit approval
   before proceeding to the next unit.**

If the user asks to adjust scope mid-sequence (add a file, split a commit),
update the remaining plan before continuing.

---

## Combine pass

On request, or before a push, list the commits ahead of the base branch and
propose combinations that fail the merge test.

- **Unpushed commits**: rewrite history without asking, then show the result.
- **Pushed commits**: state that a force push is needed. Ask before rewriting
  anything.

After any history rewrite on a branch that has an open PR, propose a new PR
body that states only the intent. Post it only after the user approves.

---

## Constraints

- **Stage only named files.** Never use `git add -A` or `git add .`.
- **No Co-Authored-By** lines unless the user explicitly requests them.
- **Buildability is preferred but not required at every boundary.** If a clean
  build can't be preserved naturally, note it in the plan and ensure the final
  commit restores a correct, buildable state.
- **Short messages are a natural consequence of small commits** — if a message
  feels long, the unit is probably too large.
- **Never combine unrelated changes** in one commit even if they touch the same
  file.
