---
name: setup
description: >
  Install devflow in the current project. Checks for conflicting plugins
  (superpowers or ponytail installed from a different marketplace), offers
  to remove them, registers the devflow marketplace if needed, then installs
  the plugin at local scope. Run this once per project.
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

## Done

Tell the user devflow is installed and list the skills now available:
`/atomic-commits`, plus the handoff, review, and PR-comment skills once
the remaining changes ship.
