# Spec Delta

## Purpose

Plans and checks the commit history for a task, so each commit is the smallest complete unit and the number of commits stays reasonable.

## ADDED Requirements

### Requirement: Plan before code
Before any code change, the skill SHALL propose a commit plan and wait for the user's approval. After each commit it SHALL pause for review.

#### Scenario: Direct change request
- **WHEN** the user asks for a code change without a plan
- **THEN** the skill shows a numbered commit plan and writes no code until the user approves it

### Requirement: Merge test
The skill SHALL put two units in one commit when nobody would revert or cherry-pick one without the other, or when the first unit alone leaves the repo in a state that should not ship.

#### Scenario: Config and the code that reads it
- **WHEN** a task adds a config key and the code that reads it
- **THEN** the plan puts both in one commit

#### Scenario: Code and its tests
- **WHEN** a task changes a function and its tests
- **THEN** the plan puts the change and the tests in one commit

### Requirement: Keep unrelated work apart
The skill SHALL keep these in separate commits: a refactor and a behavior change, unrelated fixes, mechanical changes and logic, dependency bumps, and CI or build changes that stand alone.

#### Scenario: Rename plus a bug fix
- **WHEN** a task contains a mechanical rename and an unrelated bug fix
- **THEN** the plan has one commit for the rename and one for the fix

### Requirement: Volume check
A plan with more than 4 commits for one task SHALL state, for each commit after the fourth, why it cannot merge with another commit.

#### Scenario: Six-commit plan
- **WHEN** the skill drafts a plan with 6 commits
- **THEN** the plan gives a reason for commits 5 and 6, or merges them into earlier commits

### Requirement: Combine pass
On request, or before a push, the skill SHALL list the commits ahead of the base branch and propose combinations that fail the merge test. It SHALL rewrite only unpushed commits without asking. Rewriting pushed commits SHALL need the user's approval, because it needs a force push.

#### Scenario: Unpushed fixup commits
- **WHEN** three unpushed commits touch the same feature and its tests
- **THEN** the skill proposes one combined commit and rewrites the history only after the user approves

#### Scenario: Pushed commits
- **WHEN** the commits to combine are already on the remote
- **THEN** the skill says that a force push is needed and asks before it rewrites anything

### Requirement: PR description update
After the skill changes the history of a branch that has a PR, it SHALL propose a new PR body that states only the intent. It SHALL post the body only after the user approves.

#### Scenario: History changed on a PR branch
- **WHEN** a combine pass rewrites commits on a branch with an open PR
- **THEN** the skill shows a new PR body draft and does not post it until the user approves

### Requirement: Commit hygiene
The skill SHALL stage only named files. It SHALL NOT add a Co-Authored-By line unless the user asks for one.

#### Scenario: Staging
- **WHEN** the skill makes a commit
- **THEN** it stages files by path and never runs `git add -A` or `git add .`
