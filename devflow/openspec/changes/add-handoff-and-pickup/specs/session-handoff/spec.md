# Spec Delta

## Purpose

Writes a handoff document at a fixed path with a fixed name, so a later session or tool can find it and continue the work.

## ADDED Requirements

### Requirement: Fixed path and name
The skill SHALL write the handoff to `<project_root>/docs/handoffs/handoff_<slug>_<YYYYMMDD-HHMM>.md`. `<slug>` SHALL be the branch name with `/` changed to `-`. On `main`, `master`, or a detached HEAD, `<slug>` SHALL be a short kebab-case topic.

#### Scenario: Feature branch
- **WHEN** the user runs the skill on branch `feat/foo` at 14:05 on 2026-11-12
- **THEN** the file is `docs/handoffs/handoff_feat-foo_20261112-1405.md`

#### Scenario: Main branch
- **WHEN** the user runs the skill on `main`
- **THEN** the slug is a topic that describes the work, not `main`

### Requirement: Frontmatter
The handoff SHALL start with frontmatter that has these keys, one per line as `key: value`: `branch`, `head` (full SHA), `base`, `pr` (URL or empty), `status` (`in-progress` or `done`), and `next` (one line).

#### Scenario: Branch with a PR
- **WHEN** the branch has an open PR
- **THEN** `pr` holds the PR URL and `base` holds the PR base branch

#### Scenario: Work finished
- **WHEN** the user says the branch work is finished
- **THEN** `status` is `done`

### Requirement: Body sections
The body SHALL have these sections in this order: Goal, Done, Not done, Decisions and assumptions, Open questions, Next steps, Artifacts, Suggested skills, How to check the state. Artifacts SHALL be paths or URLs only, without their content.

#### Scenario: Reader who never saw the session
- **WHEN** a new session reads the handoff
- **THEN** every section is present, and each decision states its reason

### Requirement: Docs folder is ignored by git
Before it writes, the skill SHALL check with `git check-ignore` that the target path is ignored. If the path is not ignored, the skill SHALL warn and offer to add the folder to `.gitignore`. It SHALL NOT edit `.gitignore` without approval.

#### Scenario: Repo un-ignores markdown
- **WHEN** the repo `.gitignore` has `!**/*.md` and the handoff path is not ignored
- **THEN** the skill warns and asks before it changes `.gitignore`

### Requirement: No secrets
The skill SHALL NOT write tokens, keys, or passwords into the handoff. It SHALL replace each one with `<redacted>`.

#### Scenario: Token in the session
- **WHEN** the session output contains an API token
- **THEN** the handoff contains `<redacted>` in its place
