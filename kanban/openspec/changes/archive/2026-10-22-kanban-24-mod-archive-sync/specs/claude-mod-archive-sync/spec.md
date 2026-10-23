# Spec Delta

## Purpose

Keeps the kanban board's Archived lane current by detecting newly archived OpenSpec changes and moving their entries automatically, with no user action required.

## ADDED Requirements

### Requirement: Mod polls archive folder mtime
The mod SHALL check `openspec/changes/archive/` mtime once at session start and on a 5-second timer.

#### Scenario: Initial check at session start
- **WHEN** a Claude Code session starts
- **THEN** the mod reads the archive folder mtime and stores it as the current baseline

#### Scenario: Timer fires, mtime unchanged
- **WHEN** 5 seconds elapse and the archive folder mtime equals the stored baseline
- **THEN** the mod takes no action

#### Scenario: Timer fires, mtime changed
- **WHEN** 5 seconds elapse and the archive folder mtime differs from the stored baseline
- **THEN** the mod updates the baseline and triggers the gap scan

### Requirement: Mod identifies archive gaps
The mod SHALL compare archive folder contents with `docs/kanban.yaml` entries to find gaps.

#### Scenario: Entry already in Archived lane
- **WHEN** an archived change has a kanban entry whose lane is `Archived` or `archived` (case-insensitive)
- **THEN** it is not a gap

#### Scenario: Entry in wrong lane
- **WHEN** an archived change has a kanban entry whose lane is not `Archived` (case-insensitive)
- **THEN** it is a gap

#### Scenario: No entry exists
- **WHEN** an archived change has no kanban entry at all
- **THEN** it is a gap

#### Scenario: No gaps found
- **WHEN** all archived changes already have entries in the Archived lane
- **THEN** the mod does not run archive-sync

### Requirement: Mod runs archive-sync CLI on gaps
When gaps exist, the mod SHALL run `node libs/kanban-core/dist/src/cli.js archive-sync` from the project root.

#### Scenario: Gaps exist
- **WHEN** one or more gap entries are found
- **THEN** the mod runs archive-sync and re-renders the pane if it is open

#### Scenario: archive-sync exits non-zero
- **WHEN** archive-sync exits with a non-zero exit code
- **THEN** the mod shows one toast with the error message and does not retry until the archive folder mtime changes again

### Requirement: Lane comparison is case-insensitive
The gap check SHALL treat `Archived` and `archived` as the same lane value.

#### Scenario: Lowercase archived in kanban.yaml
- **WHEN** a kanban entry has `lane: archived` (lowercase)
- **THEN** it is not treated as a gap and archive-sync is not run for it
