# Tasks

## 1. Handoff lookup script

- [ ] 1.1 Write `scripts/latest_handoff.py` (stdlib only: git root and branch from cwd, frontmatter parse, lookup rule, plain and `--hook` modes, silent exit 0 on any error) and verify `python3 scripts/latest_handoff.py` prints nothing outside a git repo
- [ ] 1.2 Write `tests/test_latest_handoff.py` (`unittest`, temp git repo on `feat/x`, two in-progress handoffs and one done, `--hook` stdin JSON, other branch) and verify `python3 -m unittest discover -s tests` passes

## 2. Hook

- [ ] 2.1 Write `hooks/hooks.json` (SessionStart, matcher `startup|clear|resume`, exec form with `${CLAUDE_PLUGIN_ROOT}`) and verify `claude plugin validate ~/personal/devflow` passes with no warnings

## 3. Skills

- [ ] 3.1 Write `skills/handoff/SKILL.md` from the `session-handoff` spec and verify one run on a feature branch writes the file at the spec path with all frontmatter keys
- [ ] 3.2 Write `skills/pickup/SKILL.md` from the `session-pickup` spec and verify it reports drift after one extra commit
- [ ] 3.3 Add a handoff and pickup section to `README.md` and verify it names the file pattern and `/devflow:pickup`

## 4. Install and migrate (each step after user approval)

- [ ] 4.1 Update the installed plugin and remove the link `~/.agents/skills/handoff`, and verify `/handoff` runs the devflow skill
- [ ] 4.2 Run `/clear` on a branch with a handoff, and verify the user sees the pointer line

## Workflow follow-up

- Commit as `feat: add handoff and pickup skills with session-start pointer`.
- Archive after `add-plugin-scaffold-and-atomic-commits`.
