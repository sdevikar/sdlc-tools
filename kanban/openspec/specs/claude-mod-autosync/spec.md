# claude-mod-autosync Specification

## Purpose

Keeps the kanban pane up to date when `docs/kanban.yaml` changes, without user action.

## Requirements

### Requirement: Pane auto-syncs on kanban.yaml write
When `Write` or `Edit` targets a path containing `kanban.yaml`, the mod SHALL re-render the pane if it is open.

#### Scenario: Write to kanban.yaml with pane open
- **WHEN** a `Write` tool call targets a path containing `kanban.yaml` and the kanban pane is open
- **THEN** the pane re-renders to show the updated board state

#### Scenario: Edit to kanban.yaml with pane open
- **WHEN** an `Edit` tool call targets a path containing `kanban.yaml` and the kanban pane is open
- **THEN** the pane re-renders to show the updated board state

#### Scenario: Write to kanban.yaml with pane closed
- **WHEN** a `Write` tool call targets a path containing `kanban.yaml` and the kanban pane is not open
- **THEN** no re-render occurs

### Requirement: Pane auto-syncs after kanban commands
When a kanban command completes, the mod SHALL re-render the pane if it is open.

#### Scenario: kanban-sync with pane open
- **WHEN** the `/kanban-sync` command completes and the kanban pane is open
- **THEN** the pane re-renders to show the updated board state

#### Scenario: opsx-archive with pane open
- **WHEN** the `/opsx-archive` command completes and the kanban pane is open
- **THEN** the pane re-renders to show the updated board state

#### Scenario: opsx-propose with pane open
- **WHEN** the `/opsx-propose` command completes and the kanban pane is open
- **THEN** the pane re-renders to show the updated board state

#### Scenario: kanban-render with pane open
- **WHEN** the `/kanban-render` command completes and the kanban pane is open
- **THEN** the pane re-renders to show the updated board state

### Requirement: Refresh is silent
The auto-sync SHALL produce no toast, no transcript message, and no user-visible output.

#### Scenario: Silent refresh on file write
- **WHEN** the pane re-renders due to a `kanban.yaml` write
- **THEN** no message appears in the transcript and no toast is shown

### Requirement: Collapsed pane updates lane headers
When the pane is collapsed, a sync SHALL update the lane headers (not just full card view).

#### Scenario: Refresh while collapsed
- **WHEN** the pane is collapsed and a `kanban.yaml` write occurs
- **THEN** the pane re-renders and the lane headers reflect the current state
