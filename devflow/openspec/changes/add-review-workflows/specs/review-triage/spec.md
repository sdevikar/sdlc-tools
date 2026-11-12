# Spec Delta

## Purpose

Turns a list of review findings into a verified report with rated fixes, and implements only the fixes the user approves.

## ADDED Requirements

### Requirement: Verify each finding
The loop SHALL load `superpowers:receiving-code-review` and check each finding against the code and the current docs. It SHALL run a live test when it cannot verify a finding by reading.

#### Scenario: Unverified claim
- **WHEN** a finding claims a runtime behavior that the code does not make clear
- **THEN** the loop runs a test or command and cites its output in `Validity`

### Requirement: Earlier decisions win
When a decision in a handoff, an OpenSpec change, or the commit history conflicts with a finding, the loop SHALL mark the finding `not valid` and cite the decision. At the approval step it SHALL list these findings separately, so the user can override.

#### Scenario: Reviewer asks to undo a decision
- **WHEN** a finding asks to revert a choice that an OpenSpec design records
- **THEN** the row says `not valid`, cites the design, and the approval step lists it under conflicts

### Requirement: Report table
The report SHALL have one table with exactly these columns in this order: `Finding`, `Context`, `Validity`, `Proposed solution`, `Ready to implement`. Each `Finding` cell SHALL start with a stable ID: `[c<id>]`, `[v<id>]`, `[g<id>]`, or `[r<n>]`.

#### Scenario: Mixed sources
- **WHEN** a PR has an inline thread, a review body, and a general comment
- **THEN** the table has one row each, with IDs `[c…]`, `[v…]`, and `[g…]`

### Requirement: Ratings
A second table SHALL rate each proposed fix 0–2 on Impact, Size, Complexity, Blast radius, Reversibility, Confidence, and Sensitive area. A total of 0–3 SHALL be Low, 4–7 Medium, and 8 or more High. A 2 in Blast radius, Reversibility, or Sensitive area SHALL force High.

The report SHALL include a legend above the ratings table explaining what each score means:

| Score | Meaning |
|---|---|
| 0 | Small, safe, easy to verify |
| 1 | Moderate |
| 2 | Large, risky, or hard to undo |

And a tier legend:

| Tier | Total | Required action |
|---|---|---|
| Low | 0–3 | Approve the whole batch at once |
| Medium | 4–7 | Review each diff before allowing a push |
| High | 8+ (or any 2 in Blast radius, Reversibility, or Sensitive area) | Discuss the approach before any code is written |

#### Scenario: Small fix in shared CI
- **WHEN** a one-line fix touches CI config shared with other repos
- **THEN** Blast radius is 2 and the tier is High, whatever the total

### Requirement: Not ready section
Below the tables, the report SHALL list each item that is not ready, with its blocker and what would clear it.

#### Scenario: Blocked item
- **WHEN** a fix needs an answer from the reviewer
- **THEN** the Not ready section names the question and who must answer it

### Requirement: Approval gate
The loop SHALL stop after the report and ask which items to implement, grouped by tier. It SHALL NOT change code before the user answers, even for items marked ready.

#### Scenario: All items ready
- **WHEN** every row is ready to implement
- **THEN** the loop still stops and waits for the user's selection

### Requirement: Implement and record
The loop SHALL implement only approved items, through `devflow:atomic-commits`. It SHALL add `Status` and `Commit` columns to the report table. It SHALL NOT push unless the user asks.

#### Scenario: Two approved items
- **WHEN** the user approves two items
- **THEN** the report shows each item's commit SHA, and nothing is pushed

### Requirement: Quick-glance close
Every review response SHALL end with a table of `#`, short finding, validity, and status or ready, with one line per finding.

#### Scenario: End of a round
- **WHEN** the loop finishes a round
- **THEN** the last block of the response is the quick-glance table

### Requirement: Safe re-run
A re-run on the same target SHALL reuse the newest report for that target. It SHALL skip rows already present, unless the thread has a new comment after the user's last reply. It SHALL NOT re-apply a fix whose commit is in `git log`. It SHALL add a `## Round <n>` note.

#### Scenario: Second run with no new comments
- **WHEN** the user re-runs the skill and nothing changed
- **THEN** the report gains a Round note that says so, and no rows or commits are added
