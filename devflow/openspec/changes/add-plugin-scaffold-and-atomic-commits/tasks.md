# Tasks

## 1. Plugin scaffold

- [x] 1.1 Write `.claude-plugin/plugin.json` (name `devflow`, version `0.1.0`, description, author, `superpowers` dependency from `claude-plugins-official`) and verify `python3 -m json.tool` parses it
- [x] 1.2 Write `.claude-plugin/marketplace.json` (name, description, owner, `allowCrossMarketplaceDependenciesOn: ["claude-plugins-official"]`, one plugin with source `./`) and verify `claude plugin validate ~/personal/devflow` passes with no warnings

## 2. atomic-commits skill

- [x] 2.1 Write `skills/atomic-commits/SKILL.md` from the old skill plus the `commit-planning` spec (merge test, keep-together and keep-apart lists, volume check, combine pass, PR description update, hygiene) and verify `claude plugin validate` still passes
- [x] 2.2 Write `README.md` with the purpose, the local-scope install steps, and the link-removal step, and verify every install command passes `--scope local`

## 3. Install and migrate (each step after user approval)

- [x] 3.1 Add the marketplace and install devflow at local scope in `genai-plugins-ad-data`, and verify `claude plugin list` shows `devflow` and `superpowers@claude-plugins-official` enabled at local scope
- [x] 3.2 Uninstall `superpowers@anthropic-plugin-directory --scope local` in `genai-plugins-ad-data`, and verify `claude plugin list` shows only one superpowers
- [x] 3.3 Remove the links `~/.agents/skills/atomic-commits` and `brainstorming`, and verify their targets still exist
- [x] 3.4 In a session in that project, run `/atomic-commits` on a config-plus-code change, and verify it runs the devflow skill and proposes one commit

## Workflow follow-up

- Commit as `feat: add devflow plugin with atomic-commits skill`.
- Archive this change before archiving the other two, so `plugin-packaging` exists first.
