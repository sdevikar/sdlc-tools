# Spec Delta

## Purpose

Triages every reviewer comment on a PR with the shared review loop and replies in each thread after the user approves.

## ADDED Requirements

### Requirement: Sync check first
Before it fetches comments, the skill SHALL confirm the branch and worktree, run `git fetch`, and compare local and remote by content. On a difference, it SHALL stop and ask.

#### Scenario: Local commits not pushed
- **WHEN** `git diff HEAD @{u}` is not empty
- **THEN** the skill shows the difference and asks before it continues

### Requirement: Fetch all comment kinds
The skill SHALL fetch inline review comments, review bodies, and general PR comments, with pagination, from the host in the `origin` remote.

#### Scenario: Many comments
- **WHEN** a PR has more than one page of inline comments
- **THEN** the report has a row for each comment thread

### Requirement: Report location
The skill SHALL write the report to `docs/reviews/review_pr<n>_<YYYYMMDD>.md`.

#### Scenario: PR 42
- **WHEN** the skill runs on PR 42 on 2026-11-12 with no earlier report
- **THEN** the report is `docs/reviews/review_pr42_20261112.md`

### Requirement: Draft replies, post after approval
The skill SHALL draft one reply per thread and show all drafts. It SHALL post only after the user approves. Inline replies SHALL go on the thread root comment. Review bodies and general comments SHALL get one PR comment that quotes each point.

#### Scenario: User approves drafts
- **WHEN** the user approves the drafts
- **THEN** each inline reply appears in its own thread, and one PR comment answers the rest

### Requirement: Reply states only the current state
Each reply SHALL state only facts about the current state: whether the issue is fixed or rejected; for a fix, what changed and where (commit SHA, and file and line at that commit); for a rejection, why. It SHALL NOT thank, praise, restate the comment, or describe the process.

#### Scenario: Fixed issue
- **WHEN** commit `abc1234` fixed a thread's issue at line 42 of `src/load.py`
- **THEN** the reply reads like `**Fixed** in abc1234: <what changed>. src/load.py:42`, and nothing else

#### Scenario: Rejected issue
- **WHEN** the triage marks a thread's finding `not valid`
- **THEN** the reply reads like `**Rejected**: <reason, with the evidence or the earlier decision>`, and nothing else

#### Scenario: Partly fixed
- **WHEN** a commit fixes one part of a comment and the triage rejects the other part
- **THEN** the reply has one `**Fixed**` line for the fixed part and one `**Rejected**` line for the rest

### Requirement: No duplicate replies
The skill SHALL NOT post to a thread whose last message is already the user's reply.

#### Scenario: Re-run after replies
- **WHEN** the user re-runs the skill and no reviewer answered
- **THEN** the skill posts nothing
