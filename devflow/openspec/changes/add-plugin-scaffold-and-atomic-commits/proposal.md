# Proposal

## Why

The user's commit, handoff, and review workflows depend on skills from several places: personal skill links, a local-scope superpowers install, and steps typed into prompts. Nothing guarantees that the skills are present, and the old copies drift apart. One plugin that ships the skills and declares superpowers as a dependency makes the workflow the default in each project where it is installed.

## What Changes

- Create the `devflow` plugin: a plugin manifest and a directory marketplace in the repo root, so `claude plugin install devflow@devflow --scope local` works.
- Declare `superpowers` from `claude-plugins-official` as a dependency. Allow that marketplace for cross-marketplace dependencies.
- Move the `atomic-commits` skill into the plugin and update it:
  - Add a merge test, plus lists of units to keep together and units to keep apart.
  - Add a volume check: more than 4 commits for one task needs a reason for each extra split.
  - Add a combine pass for unpushed commits.
  - Add a PR description update after the history changes.
- **BREAKING (user setup):** after install, remove the personal skill links `~/.agents/skills/atomic-commits` and `brainstorming`. The plugin and its superpowers dependency become the only source of these skills. The `handoff` link goes in the `add-handoff-and-pickup` change, together with its replacement.

## Capabilities

### New Capabilities
- `plugin-packaging`: how devflow installs, what it depends on, and which scope it uses.
- `commit-planning`: how the plugin splits work into commits, combines commits, and updates the PR description.

### Modified Capabilities

None.

## Impact

- New files: `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `skills/atomic-commits/SKILL.md`, `README.md`.
- User setup: the local-scope `superpowers@anthropic-plugin-directory` in `genai-plugins-ad-data` gets uninstalled. Its marketplace does not exist on this machine.
- Projects without devflow lose `atomic-commits` and `brainstorming` after the links are removed.
