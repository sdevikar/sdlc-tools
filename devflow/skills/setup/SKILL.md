---
name: setup
description: >
  Install devflow in the current project. Checks for conflicting plugins
  (superpowers or ponytail installed from a different marketplace), offers
  to remove them, registers the devflow marketplace if needed, then installs
  the plugin at local scope. Creates the .devflow/ working folder and the
  .claude/rules/devflow.md project rule. Run this once per project and once
  per git worktree, and again after a plugin update.
---

## What this skill does

Installs devflow cleanly in the current project. It checks for conflicts
first so the install does not leave two plugins with the same name loaded.

---

## Step 1 — Check for conflicts

Run:

```bash
claude plugin list --json
```

Look for any installed plugin whose name is `superpowers` but whose
marketplace is not `claude-plugins-official`, or whose name is `ponytail`
but whose marketplace is not `ponytail`.

For each conflict found, tell the user:

> **Conflict:** `<name>@<marketplace>` is installed. devflow brings
> `<name>` from `<correct-marketplace>`. Having two plugins with the same
> name causes one to be silently shadowed. Uninstall `<name>@<marketplace>`
> before continuing.

Then ask: **Uninstall the conflicting plugin now?**

- If yes: run `claude plugin uninstall <name>@<marketplace> --scope <scope>`
  for each conflict and confirm the name no longer appears in
  `claude plugin list`.
- If no: stop and tell the user to uninstall manually before re-running
  `/setup`.

---

## Step 2 — Register the marketplace (if needed)

Run:

```bash
claude plugin marketplace list
```

If a marketplace named `devflow` is not in the output, run:

```bash
claude plugin marketplace add qcom-all-gh-users/devflow
```

Confirm the marketplace appears in `claude plugin marketplace list` before
continuing.

---

## Step 3 — Install devflow

Run:

```bash
claude plugin install devflow@devflow --scope local
```

This also installs `superpowers@claude-plugins-official` and
`ponytail@ponytail` as dependencies.

Confirm with:

```bash
claude plugin list
```

Expect `devflow@devflow`, `superpowers@claude-plugins-official`, and
`ponytail@ponytail` all enabled at local scope.

---

## Step 4 — Create the working folder

Run all commands in this step from the root of the current worktree
(`git rev-parse --show-toplevel`). Each git worktree has its own `.devflow/`.

Create these folders if they are missing:

```bash
mkdir -p .devflow/handoffs .devflow/reviews .devflow/plans \
  .devflow/research .devflow/analysis .devflow/artifacts
```

If `.devflow/.gitignore` is missing, create it with the single line `*`. That
file makes git ignore the whole `.devflow/` folder, so do not touch the root
`.gitignore` for it.

Confirm with `git check-ignore -q .devflow/handoffs` (exit 0).

---

## Step 5 — Install the project rule

The rule tells Claude where each kind of working file goes. Claude Code loads
every `.claude/rules/*.md` file next to `CLAUDE.md`. **Do not edit `CLAUDE.md`.**

The source is `${CLAUDE_PLUGIN_ROOT}/references/devflow-rule.md`. The target is
`.claude/rules/devflow.md`.

- If the target is missing, create `.claude/rules/` and copy the source there.
- If the target exists and matches the source, do nothing.
- If the target differs, show the difference. Ask: **Replace
  `.claude/rules/devflow.md` with the version from the plugin?** Replace it
  only if the user says yes.

---

## Step 6 — Make git ignore the rule file

Skip this step if `git check-ignore -q .claude/rules/devflow.md` exits 0.

Ask: **Add `.claude/rules/devflow.md` to this repo's `info/exclude` file, so
git ignores it?** That file is local to this clone, shared by all its
worktrees, and never committed.

- If yes: append the path as one line to the file that
  `git rev-parse --git-path info/exclude` prints. Then run
  `git check-ignore -q .claude/rules/devflow.md`.
- If the check still fails, a root `.gitignore` pattern such as `!**/*.md`
  un-ignores the file. Tell the user this. Ask: **Add
  `.claude/rules/devflow.md` to the root `.gitignore` instead?** Edit
  `.gitignore` only if the user says yes.
- If no: tell the user that git shows the rule file as untracked.

---

## Done

Tell the user devflow is installed and list the skills now available:
`/devflow:atomic-commits`, `/devflow:handoff`, `/devflow:pickup`,
`/devflow:self-review`, and `/devflow:address-pr-comments`. Tell them that
working files go in `.devflow/`
and that `.claude/rules/devflow.md` tells Claude where each kind goes.
