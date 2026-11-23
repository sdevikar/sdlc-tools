---
name: setup
description: >
  Install devflow in the current project. Checks for conflicting plugins
  (superpowers, ponytail, or kanban installed from a different marketplace),
  offers to remove them, registers the sdlc-tools and ponytail
  marketplaces if needed, then installs the plugin at local scope. Creates
  the .devflow/ working folder, sets up OpenSpec if the user wants it, and
  removes the old .claude/rules/devflow.md copy. Run this once per project
  and once per git worktree, and again after a plugin update.
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
but whose marketplace is not `ponytail`, or whose name is `kanban` but
whose marketplace is not `sdlc-tools`.

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

## Step 2 — Register dependency marketplaces (if needed)

Run:

```bash
claude plugin marketplace list
```

devflow and its dependencies come from three marketplaces. For each one that is
**not** in the output, run the corresponding `add` command. Skip any that
are already present. (`claude-plugins-official` is always present; it is
not in this table.)

| Marketplace name | Source |
|---|---|
| `sdlc-tools` | `qcom-all-gh-users/sdlc-tools` |
| `ponytail` | `DietrichGebert/ponytail` |

`sdlc-tools` hosts both devflow and kanban. For example, if both are
missing:

```bash
claude plugin marketplace add qcom-all-gh-users/sdlc-tools
claude plugin marketplace add DietrichGebert/ponytail
```

If the old `devflow` or `kanban` marketplace is still listed, tell the user
it moved to `sdlc-tools`, and ask before removing it with
`claude plugin marketplace remove <name>`. Removing a marketplace also
uninstalls its plugins.

Confirm `sdlc-tools`, `ponytail`, and `claude-plugins-official` appear in `claude plugin marketplace list` before
continuing.

---

## Step 3 — Install devflow

Run:

```bash
claude plugin install devflow@sdlc-tools --scope local
```

This also installs `superpowers@claude-plugins-official`, `ponytail@ponytail`,
and `kanban@sdlc-tools` as dependencies.

Confirm with:

```bash
claude plugin list
```

Expect `devflow@sdlc-tools`, `superpowers@claude-plugins-official`,
`ponytail@ponytail`, and `kanban@sdlc-tools` all enabled at local scope.

---

## Step 4 — Create the working folder

Run all commands in this step from the root of the current worktree
(`git rev-parse --show-toplevel`). Each git worktree has its own `.devflow/`.

Create these folders if they are missing:

```bash
mkdir -p .devflow/handoffs .devflow/reviews .devflow/plans \
  .devflow/research .devflow/analysis .devflow/artifacts
```

If `.devflow/.gitignore` is missing, create it with these four lines:

```gitignore
*
!.gitignore
!kanban.yaml
!charter.md
```

Git then tracks the kanban board and the charter, and ignores every other file
in `.devflow/`. Do not touch the root `.gitignore` for it.

If `.devflow/.gitignore` exists but lacks some of the `!` lines (an older
setup), ask: **Add the missing `!` lines to `.devflow/.gitignore`, so git
tracks the board and the charter?** Add them only if the user says yes.

Confirm with `git check-ignore -q .devflow/handoffs/x.md` (exit 0) and
`git check-ignore -q .devflow/charter.md` (exit 1). If the second check
exits 0, a root `.gitignore` pattern such as `.devflow/` excludes the folder.
Git cannot re-include a file inside an excluded folder. Tell the user this,
and name the pattern that `git check-ignore -v .devflow/charter.md` prints.

---

## Step 5 — Remove the old project rule

Older devflow versions copied a rule to `.claude/rules/devflow.md`. The
session start hook now prints a workflow map instead, so the copy is stale.

If `.claude/rules/devflow.md` exists and its first line is
`# devflow working files`, ask: **Delete the old `.claude/rules/devflow.md`?
The session start map replaces it.** Delete it only if the user says yes.
Leave any line for it in `info/exclude` or `.gitignore`; it does no harm.

---

## Step 6 — Set the kanban board path

Ask: **Set the kanban board path to `.devflow/kanban.yaml`?**

Explain: this tells kanban to put its board in the `.devflow/` working folder.
Git tracks the board through `.devflow/.gitignore`, so its history stays in the
repo. The board file is per-worktree: each worktree has its own
`.claude/settings.local.json`, so each gets its own board with no special
handling.

If the user declines, tell them: kanban will write `kanban.yaml` at the
worktree root instead. Move on.

If the user says yes:

1. Read `.claude/settings.local.json` from the worktree root. If the file does
   not exist, treat it as `{}`.
2. If `env.KANBAN_BOARD` already equals `.devflow/kanban.yaml`, say so and skip
   the write.
3. Otherwise, merge `"KANBAN_BOARD": ".devflow/kanban.yaml"` into the `env`
   key. Keep every other key in the file unchanged. Write the result back to
   `.claude/settings.local.json`.
4. Show the resulting `env` block as confirmation.

---

## Step 7 — OpenSpec

Skip this step if `openspec/` already exists in the worktree root.

Ask: **Use OpenSpec here?** OpenSpec keeps a proposal, design, specs, and
tasks for each change, and the kanban board syncs from it.

- If yes: run the `kanban:kanban-setup` skill. It checks the `openspec` CLI,
  runs `openspec init`, and creates the board. The `KANBAN_BOARD` value from
  Step 6 applies only from the next session, so if the user set it, use
  `.devflow/kanban.yaml` as the board path in this run. If the skill is not available
  yet, tell the user to type `/reload-plugins` and then run `/devflow:setup`
  again.
- If no: move on. `devflow:triage` creates the board when the first idea
  comes in.

Tell the user that `/devflow:charter` records the answer in the charter's
Process section.

---

## Done

Tell the user devflow is installed. Tell them that each new session starts
with a workflow map: when to use each skill, the charter digest, and the
handoff pointer.

If `.devflow/charter.md` is missing, offer `/devflow:charter` as the next
step. It sets the finish line that `/devflow:triage` and `/devflow:next`
measure against.

If a newly installed plugin is not available yet, tell the user to type
`/reload-plugins`. Claude cannot run this command; the user must type it.
