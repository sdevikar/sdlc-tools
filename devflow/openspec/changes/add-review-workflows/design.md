# Design

## Context

See proposal.md for the motivation. The built-in `/code-review` takes an effort level and a target (PR number, branch, range, or path). With no target it reviews commits ahead of upstream plus uncommitted changes. A range leaves out the working tree. In a terminal it runs as a background subagent, and its findings arrive later as text. `superpowers:receiving-code-review` forbids thanks and performative agreement, and it replies through `repos/{owner}/{repo}/pulls/{pr}/comments/{id}/replies`.

## Goals / Non-Goals

**Goals:**
- One loop, written once, shared by both skills.
- Every outward action (commit, push, post) happens only after the user says yes.

**Non-Goals:**
- New review logic. Findings come from `/code-review` or from reviewers.
- A hook that blocks `git push`. The user decides push case by case.

## Decisions

- **Shared loop in `references/review-loop.md`.** Both skills read it through `${CLAUDE_PLUGIN_ROOT}`. A third skill was the alternative, but the loop is not useful alone.
- **Two skills, not one.** The inputs and preflight differ: a self-review has no sync check and no replies.
- **IDs from GitHub, not row numbers.** `[c<root id>]`, `[v<review id>]`, and `[g<comment id>]` stay stable across runs. Self-review findings have no stable ID, so `[r<n>]` rows match on file and issue.
- **Fact-only replies.** A reply says fixed or rejected, then what changed and where (commit and `file:line`), or why it was rejected. The reviewer can check each claim, and nothing in the reply goes stale. This also meets the superpowers rule against thanks and performative agreement.
- **No model pin.** The skill does not force Opus. The session's model runs the review.
- **Earlier decisions mark a finding `not valid`, with a separate list at the approval step.** Superpowers says to discuss such conflicts. The separate list keeps that discussion visible.
- **Rubric thresholds.** Taken from the plan. The user reviews the rubric before implementation. A change to the numbers changes only the `review-triage` spec and the reference file.

## Risks / Trade-offs

- [The background review never returns] → The user re-runs `/devflow:self-review`. The report does not exist yet, so nothing duplicates.
- [The fetch misses comments on a large PR] → `--paginate` on every `gh api` call.
- [The ratings feel arbitrary] → Each rating cell is 0–2 with a written meaning. The user can change the table in one file.

## Open Questions

- The exact rubric numbers, pending the user's review. A change does not alter the task list.
