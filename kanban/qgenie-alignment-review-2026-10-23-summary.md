# QGenie Alignment Review — kanban board + OpenSpec bridge plugin · Summary

*One-page digest · Full report: [qgenie-alignment-review-2026-10-23.md](qgenie-alignment-review-2026-10-23.md) · Reviewed 2026-10-23 · Snapshot 2026-09.1*

## Verdict

The kanban plugin has no overlap with any of the nine known core QGenie plugins — it occupies a domain (YAML board management + OpenSpec spec lifecycle) that QGenie doesn't cover. Package the 10 existing SKILL.md skills as a QGenie plugin by adding a `.qgenie-plugin/plugin.json` manifest. The Claude Code mod, core library, and shell hooks stay exactly as they are and ship inside the package as a Claude Code adapter and runtime dependencies.

**Confidence:** Medium  ·  **Urgency:** Low

## Do next

1. Confirm the QGenie org/handle for the plugin id (immutable after first publish).
2. Create `.qgenie-plugin/plugin.json` with id, version, all 10 skill paths, and the Claude Code adapter.
3. Run `claude plugin validate .` to check the manifest locally.
4. **[Human approval gate]** Publish to the QGenie Plugin Registry with a semver tag.
5. Verify with `qgenie plugins add <org>/kanban --target claude` in a test project.

## Components at a glance

| Component | What to do | QGenie target | Confidence | Approval gate |
|---|---|---|---|---|
| Kanban skills | Act now | QGenie plugin | Medium | Yes |
| OpenSpec skills | Act now | QGenie plugin | Medium | Yes |
| Claude Code mod | Leave as-is | — | High | — |
| kanban-core library | Leave as-is | — | High | — |
| Shell hooks | Leave as-is | — | High | — |

## Watch out for

- **Risks:** Coverage matrix used the snapshot seed from 2026-09-17 (no live cache); run a fresh cache fetch before publishing to confirm no new core plugin covers this domain. Org/handle is immutable after first publish — confirm before creating the manifest. The `openspec` CLI and the `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` env flag are prerequisites that the plugin manifest cannot install automatically; document both in the registry description.
- **Needs human sign-off before acting:** Kanban skills (registry publication), OpenSpec skills (registry publication).

> This is a digest — the lead artifact for this review. Expand the full report for evidence trails, how-to-do-it steps, the Coverage Matrix, and the rollout plan.
