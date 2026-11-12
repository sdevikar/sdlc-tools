# Design

## Context

See proposal.md for the motivation. The old `atomic-commits` skill lives in `~/qcom/tools/agent-skills/atomic-commits/` and loads through the link `~/.agents/skills/atomic-commits`. `~/.claude/skills` is a link to `~/.agents/skills`. Superpowers is installed only once, at local scope in `genai-plugins-ad-data`, from `anthropic-plugin-directory`, a marketplace that is not configured on this machine.

## Goals / Non-Goals

**Goals:**
- One install command per project brings devflow and superpowers.
- The updated `atomic-commits` skill keeps the old skill's gates (plan approval, a pause after each commit) and adds the merge rules.

**Non-Goals:**
- Hooks, scripts, or new commands in this change.
- Changing the source folder of the old skill in `agent-skills`.

## Decisions

- **Directory marketplace in the repo root, source `./`.** The user can then install with `devflow@devflow`, and no shared marketplace needs an edit. The alternative was the existing `local-dev` marketplace. That ties devflow to another project's file.
- **Declare the dependency in `plugin.json`, not in the marketplace entry.** It travels with the plugin. With the allowlist in `marketplace.json`, the install also installs superpowers. Without the allowlist, the docs say the install completes and devflow then fails to load, so the allowlist is required.
- **Dependency in this first change.** The user wants superpowers to ship only through devflow. So the dependency is a packaging rule, not a review-skill rule.
- **Local scope.** The user's CLAUDE.md says to install all plugins at local scope. Dependencies install at the same scope as the plugin.
- **Rewrite the skill, do not copy it.** The old skill's table puts CI and build changes in their own commit, and it has no merge test. The new skill keeps the old gates and replaces the split rules.

## Risks / Trade-offs

- [Two plugins named `superpowers` load in `genai-plugins-ad-data`] → Uninstall `superpowers@anthropic-plugin-directory --scope local` there during migration.
- [Projects without devflow lose `atomic-commits` and `brainstorming`] → Accepted by the user. Install devflow in each project that needs them.
- [Other tools that read `~/.agents/skills` lose the removed links] → Accepted. The link targets stay, so a link can be restored with one `ln -s`.

## Migration Plan

1. `claude plugin marketplace add ~/personal/devflow`.
2. In each project: `claude plugin install devflow@devflow --scope local`.
3. In `genai-plugins-ad-data`: `claude plugin uninstall superpowers@anthropic-plugin-directory --scope local`.
4. Remove the links `~/.agents/skills/atomic-commits` and `brainstorming`.
5. Rollback: uninstall devflow, recreate the links with `ln -s`.
