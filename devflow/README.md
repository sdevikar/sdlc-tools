# devflow

A Claude Code plugin that ships commit, handoff, and review workflows. It brings `superpowers` and `ponytail` with it as dependencies.

## Quick install

Run `/setup` in a Claude Code session inside the project where you want devflow. The skill checks for conflicts, registers the marketplace, and installs the plugin.

Or install manually:

```bash
# One time — register the marketplace
claude plugin marketplace add qcom-all-gh-users/devflow

# Per project — install at local scope
claude plugin install devflow@devflow --scope local
```

## Pre-flight: existing installs

devflow installs `superpowers` from `claude-plugins-official` and `ponytail` from the `ponytail` marketplace. If you already have either plugin installed from a **different** marketplace, uninstall it first to avoid name conflicts:

```bash
claude plugin uninstall <name>@<other-marketplace> --scope <scope>
```

The `/setup` skill does this check for you automatically.

## Skills

| Skill | What it does |
|---|---|
| `setup` | Checks for conflicts, registers the marketplace, installs devflow |
| `atomic-commits` | Plans commits before coding, enforces merge rules, volume check, combine pass |

## Rollback

```bash
claude plugin uninstall devflow@devflow --scope local
```
