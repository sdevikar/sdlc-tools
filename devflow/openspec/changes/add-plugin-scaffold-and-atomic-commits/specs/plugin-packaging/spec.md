# Spec Delta

## Purpose

Defines how the devflow plugin installs into a project, which plugins it brings with it, and at which scope it runs.

## ADDED Requirements

### Requirement: Install from the repo as a marketplace
The repo root SHALL be a valid plugin marketplace that lists one plugin, `devflow`, with the repo root as its source.

#### Scenario: Add the marketplace and install
- **WHEN** the user runs `claude plugin marketplace add ~/personal/devflow` and then `claude plugin install devflow@devflow --scope local` in a project
- **THEN** the install succeeds and `claude plugin list` shows `devflow@devflow` enabled at local scope for that project

#### Scenario: Validation
- **WHEN** the user runs `claude plugin validate ~/personal/devflow`
- **THEN** the output reports that validation passed, with no warnings

### Requirement: Ship superpowers and ponytail as dependencies
The plugin SHALL declare `superpowers` from the `claude-plugins-official` marketplace and `ponytail` from the `ponytail` marketplace as dependencies. The marketplace SHALL allow cross-marketplace dependencies on both `claude-plugins-official` and `ponytail`.

#### Scenario: Dependencies install with the plugin
- **WHEN** the user installs devflow at local scope in a project that has neither superpowers nor ponytail
- **THEN** `superpowers@claude-plugins-official` and `ponytail@ponytail` also install and are enabled at local scope in that project

### Requirement: Local scope only
The documented install SHALL use local scope (`--scope local`). The README SHALL NOT tell the user to install at user or project scope.

#### Scenario: README install steps
- **WHEN** a reader follows the README install steps
- **THEN** every `claude plugin install` command in it passes `--scope local`

### Requirement: Single source of workflow skills
After install, the README SHALL tell the user to remove each personal copy of a skill that devflow or superpowers ships, such as `atomic-commits` and `brainstorming`. Removal SHALL touch only the links, not their targets.

#### Scenario: Bare skill name resolves to the plugin
- **WHEN** the personal links are removed and the user types `/atomic-commits`
- **THEN** the devflow skill runs, because no other command uses that name
