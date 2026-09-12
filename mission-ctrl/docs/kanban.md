# Mission Ctrl — Build Kanban

Goal: dogfoodable Claude Code plugin with intent-aware project management. Pi/openspec: secondary harness, same core, same store format.

---

## OpenSpec Change Index

| Change | Title | Milestone | Status |
|---|---|---|---|
| `core-foundation-01` | Core Foundation | M0 | 📦 Archived |
| `logic-layer-02` | Logic Layer | M1 | 📦 Archived |
| ~~`pi-extension-shell-03`~~ | ~~Pi Extension Shell~~ | ~~M2~~ | ⚠️ Superseded (split → 03a/03b) |
| `pi-extension-shell-03a` | Extension Shell — Core Loop (7 skills) | M2a | 📦 Archived |
| `pi-extension-shell-03b` | Extension Shell — Design Gate (3 skills) | M2b | 📦 Archived |
| `hooks-auto-onboarding-04` | Hooks & Auto-Onboarding | M3 | 📦 Archived |
| `dogfood-ship-v0-1-05` | Dogfood & Ship v0.1 | M4 | 🔲 Planned |
| `log-feedback-06` | Feedback Logging Skill | M5-prep | ✅ Applied |
| ~~`ts-bridge-07`~~ | ~~TS ↔ Python Bridge~~ | ~~M2x~~ | ⚠️ Superseded (`bin/mission-ctrl` direct-wires Python; bridge not needed) |
| `claude-plugin-08` | Claude Code Plugin | M2x | ✅ Applied |
| ~~`direct-wire-09`~~ | ~~Direct-wire bin/mission-ctrl~~ | ~~M2x~~ | ⚠️ Superseded (already done in `claude-plugin-08`) |
| `mutation-skills-10` | Mutation skills: update-mission, add-constraint | M3x | 🔲 Planned |
| `launch-skill-11` | Conversational onboarding wrapper | M3x | 🔲 Planned |
| `insights-12` | Behavioral signal synthesis from meta.jsonl | M5 | 🔲 Planned |
| `mvp-completion-fix-13` | MVP % fix (MvpItem.done + mark-mvp-done) | M3x | ⚠️ Superseded by `store-mvp-tracking-15` |
| `mission-store-rename-14` | `.intent/` → `.mission/` rename + `intent/intent.md` | M2x | 📦 Archived |
| `store-mvp-tracking-15` | MVP tracking: MvpItem.done, mvp-add, mvp-link skills | M3x | 🔲 Planned |
| `backlog-planner-integration-16` | Surface backlog items in /next and recap | M3x | 🔲 Planned |
| `mid-project-init-17` | Mid-project store repair and import | M4x | 🔲 Planned |
| `judgment-layer-18` | Judgment layer: structured reasoning at decision points | M5 | 🔲 Planned |
| `auto-triage-19` | Automated triage via mission-alignment scoring | M5 | 🔲 Planned |
| `semantic-intent-20` | Semantic before-send classification | M5 | 🔲 Planned |
| `auto-advancement-21` | Auto spec-completion detection from git/tests | M5 | 🔲 Planned |
| `design-gate-enrichment-22` | Structured design artifacts and drift detection | M5 | 🔲 Planned |

> **Status key:** 🔲 Planned · 🔄 In Progress · ✅ Applied · 📦 Archived · ⚠️ Superseded

---

## Backlog (not this milestone)

- [ ] MCP visual spec graph server
- [ ] MCP dashboard server
- [ ] `backlog.merge`, `backlog.archive` skills
- [ ] Schema versioning / migration tooling
- [ ] Configurable `on_before_send` pattern matching (v1 ships hardcoded)
- [ ] Plugin distribution via Claude marketplace

---

## M0 — Core Foundation
> `core-foundation-01` | 📦 Archived

- [x] `mission_ctrl_core` (Python, pyproject.toml, pytest, uv workspace)
- [x] pydantic models: mission, mvp, constraints, backlog, specs, meta
- [x] All stores: MissionStore, MvpStore, ConstraintsStore, BacklogStore, SpecStore, MetaStore
- [x] EventBuilder: all v1 event types
- [x] 3 fixture repos: empty-project, mid-flight, complex-graph

---

## M1 — Logic Layer
> `logic-layer-02` | 📦 Archived

- [x] `planner.py`: `suggest_next()` — MVP-critical first, unblocked, continuity
- [x] `recap.py`: `generate_recap()` → `RecapResult`
- [x] Git read utility: read-only `git log` since timestamp

---

## M2a — Extension Shell: Core Loop (7 skills)
> `pi-extension-shell-03a` | 📦 Archived

- [x] `packages/pi-package` scaffold (`mission_ctrl_pi`, depends on `mission_ctrl_core`)
- [x] `schemas.py`: all skill input/output Pydantic models
- [x] 7 skills: `/mission-ctrl:init`, `add-idea`, `triage`, `spec-create`, `spec-status`, `next`, `status`
- [x] E2E lifecycle: init → add-idea → triage → spec-create → spec-status(done)

---

## M2b — Extension Shell: Design Gate (3 skills)
> `pi-extension-shell-03b` | 📦 Archived

- [x] `/mission-ctrl:recap`, `design-propose`, `design-approve`
- [x] `spec-status` extended for `design_approved → in_progress`
- [x] Full E2E with design gate

---

## M3 — Hooks & Auto-Onboarding
> `hooks-auto-onboarding-04` | 📦 Archived

- [x] `on_session_start`: gap-tiered recap injection, `SESSION_STARTED` event
- [x] `on_before_send`: hardcoded pattern matching, redirect, bypass, event logging
- [x] AGENTS.md sync: `sync_after_write` decorator, Jinja2 template, sanitization
- [x] `/mission-ctrl:log-feedback` skill

---

## M2x — Claude Code Plugin
> `claude-plugin-08` | ✅ Applied

- [x] `packages/claude-plugin/`: manifest, 11 SKILL.md files, `hooks/hooks.json`, `bin/mission-ctrl`, README
- [x] `bin/mission-ctrl` direct-wires Python (no bridge); uv fallback for system Python
- [x] `hooks.json`: SessionStart (gap-tiered recap) + UserPromptSubmit (before-send)
- [x] Contract test: `test_claude_plugin_contracts.py`
- [x] Dogfood bootstrap: `.mission/` initialized for this repo; AGENTS.md live

---

## M3x — Store Repair + Backlog Visibility
> `store-mvp-tracking-15`, `backlog-planner-integration-16`, `mid-project-init-17` | 🔲 Planned

See individual proposals in `docs/proposals/`.

---

## M4 — Dogfood & Ship v0.1
> `dogfood-ship-v0-1-05` | 🔲 Planned

- [ ] Run this project through its own workflow for one week
- [ ] Triage feedback; fix [blocker] items in M4
- [ ] README with install + quickstart
- [ ] CHANGELOG.md (v0.1.0 entry)
- [ ] CI: lint → test → build → publish; PyPI Trusted Publishing; pip-audit
- [ ] Tag `v0.1.0`, publish `mission_ctrl_core` + `mission_ctrl_pi` to PyPI

---

## M5 — Judgment Layer
> `judgment-layer-18` through `design-gate-enrichment-22` | 🔲 Planned

See individual proposals in `docs/proposals/`. Depends on M3x store completeness.
