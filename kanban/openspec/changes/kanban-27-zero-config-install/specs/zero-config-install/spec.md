# Spec Delta

## Purpose

Enables zero-configuration installation: running `npm install` configures the consuming project's Claude Code settings and skill links automatically, with no manual steps.

## ADDED Requirements

### Requirement: Postinstall configures CLAUDE_CODE_PLUGIN_DIRS
The setup script SHALL write `CLAUDE_CODE_PLUGIN_DIRS` pointing to the installed mod directory into the consuming project's `.claude/settings.json`, creating the file if it does not exist and merging with existing content if it does.

#### Scenario: Fresh install with no existing settings
- **WHEN** the consuming project has no `.claude/settings.json`
- **THEN** the script creates `.claude/settings.json` with `env.CLAUDE_CODE_PLUGIN_DIRS` set to the absolute path of the installed `mod/` directory

#### Scenario: Install with existing settings file
- **WHEN** `.claude/settings.json` already exists with other keys
- **THEN** the script merges `env.CLAUDE_CODE_PLUGIN_DIRS` into the existing file without removing existing keys

#### Scenario: Re-install updates stale path
- **WHEN** `npm install` runs again and the mod path has changed
- **THEN** the script overwrites only `env.CLAUDE_CODE_PLUGIN_DIRS` with the new path

### Requirement: Postinstall links skills
The setup script SHALL create symlinks for all entries in `skills/` into the consuming project's `.claude/skills/`, creating the directory if it does not exist.

#### Scenario: Fresh install with no skill links
- **WHEN** `.claude/skills/` does not exist
- **THEN** the script creates the directory and adds one symlink per skill directory under `skills/`

#### Scenario: Re-install is idempotent
- **WHEN** skill symlinks already exist from a prior install
- **THEN** the script skips or overwrites them without error

### Requirement: Setup script is non-destructive
The setup script SHALL NOT remove or overwrite keys in `.claude/settings.json` that it did not write, and SHALL NOT delete symlinks in `.claude/skills/` that point to other locations.

#### Scenario: Existing unrelated settings preserved
- **WHEN** `.claude/settings.json` contains keys unrelated to this plugin
- **THEN** those keys remain unchanged after the script runs

#### Scenario: Existing unrelated skill links preserved
- **WHEN** `.claude/skills/` contains symlinks not owned by this plugin
- **THEN** those symlinks remain after the script runs
