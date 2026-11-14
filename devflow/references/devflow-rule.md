# devflow working files

`/devflow:setup` copied this file from the devflow plugin. Run setup again to refresh it.

Keep working files in `<worktree_root>/.devflow/`, not in `docs/`. Git ignores the folder through `.devflow/.gitignore`.

| Kind | Folder |
|---|---|
| Handoffs | `.devflow/handoffs/` |
| Review reports | `.devflow/reviews/` |
| Plans and design specs, including superpowers plans and specs | `.devflow/plans/` |
| Research notes | `.devflow/research/` |
| Analysis and root-cause notes | `.devflow/analysis/` |
| PDFs, diagrams, images, and other binary files | `.devflow/artifacts/` |

- This rule sets the location for superpowers plans and specs. Use `.devflow/plans/` instead of `docs/superpowers/plans/` and `docs/superpowers/specs/`.
- Do not commit files in `.devflow/`.
- If a subfolder is missing, create it. If `.devflow/.gitignore` is missing, create it with the single line `*`.
- If this project's `CLAUDE.md` names another location for a kind of file, use that location instead.
