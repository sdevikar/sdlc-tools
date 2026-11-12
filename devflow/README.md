# devflow

A Claude Code plugin that ships commit, handoff, and review workflows. It brings `superpowers` and `ponytail` with it as dependencies.

## Install

Run these two commands once per machine, then repeat step 2 in each project where you want devflow.

**Step 1 — Add this repo as a marketplace (one time only):**

```bash
claude plugin marketplace add https://github.com/qcom-all-gh-users/devflow
```

**Step 2 — Install devflow in a project:**

```bash
claude plugin install devflow@devflow --scope local
```

This also installs `superpowers@claude-plugins-official` and `ponytail@ponytail` at local scope in that project.

## After install — remove personal skill links

If you have personal skill links for `atomic-commits` or `brainstorming` (e.g. under `~/.agents/skills/`), remove them so the bare skill name runs the plugin version:

```bash
rm ~/.agents/skills/atomic-commits
rm ~/.agents/skills/brainstorming
```

The source files stay on disk. To restore a link: `ln -s <target> ~/.agents/skills/<name>`.

## Skills

| Skill | What it does |
|---|---|
| `atomic-commits` | Plans commits before coding, enforces merge rules, volume check, combine pass |

## Rollback

```bash
claude plugin uninstall devflow@devflow --scope local
```

Re-create any personal skill links you removed.
