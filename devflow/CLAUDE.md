# devflow

A Claude Code plugin that ships the user's project, commit, handoff, and review workflows. It wires existing skills together and adds no new review logic. Superpowers and the workflow skills ship only through this plugin.

## Where things are

| Need | Path |
|---|---|
| Design record (source of truth) | `openspec/specs/` (current), `openspec/changes/<change>/` (in progress) |
| Working plan and plan review (gitignored) | `.devflow/plans/`, `.devflow/reviews/` |
| Handoffs (gitignored) | `.devflow/handoffs/handoff_<slug>_<YYYYMMDD-HHMM>.md` |
| Workflow map, printed at session start | `references/workflow-map.md` |
| Plugin manifest | `.claude-plugin/plugin.json` |
| Marketplace (shared with kanban) | `../.claude-plugin/marketplace.json` |
| Skills | `skills/<name>/SKILL.md` |
| Shared review loop | `references/review-loop.md` |
| Hooks and their scripts | `hooks/hooks.json`, `scripts/` |
| Tests | `tests/` |

## How to work here

- For each feature, write one OpenSpec change with `/opsx:propose`, build it with `/opsx:apply`, then run `/opsx:archive`.
- Each change is one commit. The commit message is in the change's `tasks.md`.
- `openspec/` is local only (gitignored). The current specs are in `openspec/specs/`.
- If a spec and the code disagree, fix the spec first, then the code.
- Read the latest Claude Code plugin docs before you change a manifest, hook, or skill frontmatter.

## Rules

- Install only at local scope: `claude plugin install devflow@sdlc-tools --scope local`.
- Python scripts use the stdlib only. Tests use `unittest` and real git repos in a temp folder. Do not add mocks.
- SessionStart prints the map (40 lines at most), the charter digest, and a pointer. Other hooks print a pointer or one request, never a document. On any error they exit 0 with no output.
- Skills never commit, push, post to GitHub, or edit `.gitignore` without the user's approval.
- Project skills (`charter`, `triage`, `next`) recommend. They never block work.
- Do not edit the old skill sources in `~/qcom/tools/agent-skills/`. Remove only the links in `~/.agents/skills/`.

## Check your work

```bash
claude plugin validate .                 # expect: Validation passed, no warnings
python3 -m unittest discover -s tests    # expect: OK
openspec validate --all --strict         # expect: all changes pass
```
