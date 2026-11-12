# Spec Delta

## Purpose

Reviews the user's own change before others see it, at an effort level that fits the change, and triages the findings with the shared review loop.

## ADDED Requirements

### Requirement: Pick the target
The skill SHALL use the PR number when the branch has a PR. With no PR and unpushed work, it SHALL pass no target. Otherwise it SHALL use `<default branch>...HEAD` and ask the user to commit uncommitted changes first.

#### Scenario: Branch with a PR
- **WHEN** `gh pr view` finds PR 42 for the branch
- **THEN** the skill reviews target `42`

#### Scenario: Pushed branch with uncommitted changes and no PR
- **WHEN** the branch is pushed, has no PR, and has uncommitted changes
- **THEN** the skill asks the user to commit before it reviews `main...HEAD`

### Requirement: Suggest an effort level
The skill SHALL suggest `low`, `medium`, or `high` from the diff, and SHALL ask the user to confirm it. A user-given level SHALL skip the suggestion.

#### Scenario: Docs-only change
- **WHEN** the diff touches only markdown files
- **THEN** the skill suggests `low` and waits for confirmation

### Requirement: Run the built-in review
The skill SHALL start `/code-review <level> <target>`. When the review runs in the background, the skill SHALL end its turn and continue the loop when the findings arrive.

#### Scenario: Terminal session
- **WHEN** the review starts in the background
- **THEN** the skill writes no report until the findings arrive

### Requirement: Report location
The skill SHALL write the report to `docs/reviews/review_<slug>_<YYYYMMDD>.md`, with `<slug>` from the branch as in `session-handoff`.

#### Scenario: First run on a branch
- **WHEN** self-review runs for the first time on `feat/foo` on 2026-11-12
- **THEN** the report is `docs/reviews/review_feat-foo_20261112.md`

### Requirement: Match findings across rounds
On a re-run, the skill SHALL match each new finding to an existing row by file and issue. It SHALL NOT add a row for a match.

#### Scenario: Same issue at a moved line
- **WHEN** a re-run reports the same issue at a different line in the same file
- **THEN** the report keeps one row for it
