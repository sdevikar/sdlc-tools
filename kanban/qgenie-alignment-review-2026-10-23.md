# QGenie Alignment Review — kanban board + OpenSpec bridge plugin

*Reviewed: 2026-10-23 · Reviewer: QGenie Alignment Advisor · Snapshot: 2026-09.1 (2026-09-17)*

> **Implementation-ready:** every recommended component below carries concrete How-to-execute
> steps and a source link. This report is written to be handed directly to a coding harness
> (Claude Code, Codex, or similar) as an implementation brief — see **Implementation Handoff** at
> the end for a ready-to-use handoff prompt.

## Bottom Line

The kanban plugin has no functional overlap with any of the nine known core QGenie plugins — everything it does occupies a domain (YAML-based board management + OpenSpec spec lifecycle) that QGenie does not cover. The right move is to **package it as a QGenie plugin** (Pattern B — Package as a QGenie plugin): add a `.qgenie-plugin/plugin.json` manifest alongside the existing `.claude-plugin/` manifest so users can install from the registry instead of running a three-step git + marketplace + install sequence. The two skill groups (10 SKILL.md files total) are ready to package now without any reformatting. The Claude Code mod, the core TypeScript library, and the project-level shell hooks stay exactly as they are and ship inside the plugin package as a Claude Code adapter and runtime dependencies.

| | |
|---|---|
| **Overall confidence** | Medium |
| **How urgent** | Low |

**Why this confidence level:** The packaging steps are grounded in the local QGenie authoring contract (`authoring.yaml`), a locally-held knowledge file that describes the plugin manifest layout, install command, and registry publication flow — a well-established, offline-readable source. Core plugin cross-referencing relied on the static snapshot seed from 2026-09-17 (the live CLI cache was unavailable due to missing credentials), so the "no overlap" verdict is based on plugin descriptions as of that date; a live cache run would increase confidence slightly. The skills' existing SKILL.md format and directory layout already match what QGenie plugins expect, so the packaging path has no structural ambiguity. The main uncertainty is registry publication, which requires live registry access and human sign-off.

**What to do next:**
1. Confirm the QGenie org/handle for the plugin id (e.g., `<your-org>/kanban`) — this is immutable after first publish.
2. Create `.qgenie-plugin/plugin.json` at the repo root with the plugin id, version, all 10 skill paths, and the Claude Code adapter pointing at `./mod/kanban-board/`.
3. Run `claude plugin validate .` to check manifest structure locally before touching the registry.
4. **[Human approval gate]** Open the QGenie Plugin Registry, choose **Add Plugin**, upload the folder or zip, and publish with a semver tag.
5. Verify install with `qgenie plugins add <org>/kanban --target claude` in a test project.

> Full detail below: Legend → Executive Summary → Current-State Summary → Coverage Matrix → Capability Mapping → Why This Direction → What QGenie Does Not Replace → Rollout Plan → Risks to Watch → Validation Plan → Open Questions.

---

## Legend

- **Cached** — read from a local knowledge file loaded this session (authoring contract, snapshot seed, or project files); offline, no network call.
- **Stale** — evidence exists, but its own dating suggests it may be out of date; worth re-checking before acting on version-sensitive claims.
- **Not found** — no matching QGenie capability was found in the local sources checked.

The local QGenie CLI snapshot cache was unavailable this session (no credentials configured). Core plugin data comes from `snapshot-metadata.yaml` (seed dated 2026-09-17). Steps marked `†` rely on the local authoring contract and may need confirmation against the current registry or adapter state before acting.

---

## Executive Summary

The kanban plugin is a Claude Code-first tool that manages a YAML-based kanban board (`kanban.yaml`) linked to an OpenSpec spec-driven development workflow. It consists of 10 skills (SKILL.md format), a native Claude Code mod that renders a live swim-lane pane and registers a model-callable setup tool, a TypeScript parsing/rendering library, and project-level shell hooks. None of these overlap with the nine known core QGenie plugins. The recommended direction adds a `.qgenie-plugin/plugin.json` manifest so the plugin can be installed from the QGenie registry — a distribution improvement, not a capability replacement. The Claude Code mod, core library, and shell hooks stay in place and are included in the package as a Claude Code adapter and runtime dependencies. The main benefit is a simpler install path; the main gate is registry publication, which requires human sign-off.

---

## Current-State Summary

### Key Facts

| Dimension | Finding |
|---|---|
| Primary purpose | Kanban board management (`kanban.yaml`) + OpenSpec spec lifecycle (propose/apply/archive/sync) inside Claude Code |
| Current harness / framework | Claude Code (primary); adapters for OpenCode, Cursor, Windsurf, Kiro, Codex also present — out of scope for this review (user scope: Claude Code only) |
| Existing QGenie overlap | None — no component maps to any known core QGenie plugin |
| Human approval gates | Registry publication (step 4 of packaging) |
| Harness coupling | `mod/kanban-board/` is tightly coupled to Claude Code's native mod API; `hooks/` shell scripts are Claude Code workspace hooks |
| Reuse potential | The 10 skills are portable (SKILL.md with no harness-specific calls); the mod and library are Claude Code-specific |

### Additional Details

| Dimension | Finding |
|---|---|
| Agent framework (if any) | None — skills invoke the `openspec` CLI and read/write files; no multi-agent orchestration |
| Tools used | `openspec` CLI (npm: `@fission-ai/openspec`), `kanban.yaml` file reads/writes, `claude plugin validate` |
| MCP usage | None in the core plugin; the Claude Code mod registers a single tool (`kanban_board_setup`) via Claude Code's function-hooks API |
| Context acquisition strategy | Skills read `kanban.yaml` and `openspec/changes/` at invocation time; mod reads `kanban.yaml` on pane open and on `Write`/`Edit` tool-call hooks |
| Prompt / token behavior | SKILL.md activation model — each skill loads only when the task matches; no large static prompts injected into every request |
| Workflow stages | Not Started → In Progress → Archived (kanban lanes); OpenSpec: new change → proposal → design → tasks → implement → archive |
| Auth / authorization model | No auth — all reads/writes are local filesystem; registry publication requires QGenie credentials (human-approval gate) |
| Data sensitivity | `kanban.yaml` contains project metadata (work items, priorities, notes) — not sensitive; no credentials in any skill or mod file |
| Deployment model | Currently: install via Claude Code marketplace + `/plugin install`; post-packaging: `qgenie plugins add <org>/kanban --target claude` |
| Observability | None — no logging, metrics, or tracing in skills or mod |
| Maintenance burden | One maintainer; skills and mod under active development; `libs/kanban-core/` has a compiled test suite |

---

## Coverage Matrix

**Plugin inventory considered:** 9 plugins (9-entry offline seed from `snapshot-metadata.yaml`; live cache unavailable this session — no credentials configured, so the identity-scoped cache query returned no results and the seed is the only source for this matrix).

<details>
<summary>Show the full plugin-by-component cross-reference (mostly "ruled out" rows — open only if you want to audit exhaustiveness)</summary>

| Core plugin | Evidence | Kanban skills | OpenSpec skills | Claude Code mod | kanban-core library | Shell hooks | Outcome |
|---|---|---|---|---|---|---|---|
| qgenie-chat | Stale | Ruled out: enterprise context/chat vs. YAML board management | Ruled out: spec lifecycle vs. enterprise chat | Ruled out | Ruled out | Ruled out | Ruled out everywhere |
| qgenie-debug | Stale | Ruled out: log analysis/SCA vs. YAML board | Ruled out: spec lifecycle vs. log analysis | Ruled out | Ruled out | Ruled out | Ruled out everywhere |
| qgenie-quartz | Stale | Ruled out: code indexing/dependency graph vs. YAML board | Ruled out: spec lifecycle vs. code indexing | Ruled out | Ruled out | Ruled out | Ruled out everywhere |
| qgenie-code-review | Stale | Ruled out: code review vs. YAML board management | Ruled out | Ruled out | Ruled out | Ruled out | Ruled out everywhere |
| qgenie-codewiki | Stale | Ruled out: documentation generation vs. YAML board | Ruled out: spec management creates proposal/design/tasks artifacts via OpenSpec CLI, not wiki documentation | Ruled out | Ruled out | Ruled out | Ruled out everywhere |
| qgenie-design | Stale | Ruled out: HLD/SDD pipeline vs. YAML board | Partial surface overlap: both produce structured documents from input. However the functional categories differ — `openspec-propose` generates structured spec artifacts (proposal.md, design.md, tasks.md) via the OpenSpec CLI schema for a spec-driven dev workflow; `qgenie-design` generates HLD/SDD using QGenie Chat + Quartz for a design-planning workflow. Different tools, outputs, and consumers — ruled out as a replacement | Ruled out | Ruled out | Ruled out | Ruled out everywhere |
| qgenie-optimizers | Stale | Ruled out: feature-flag/ELF analysis vs. YAML board | Ruled out | Ruled out | Ruled out | Ruled out | Ruled out everywhere |
| qgenie-port | Stale | Ruled out: code porting vs. YAML board | Ruled out: spec lifecycle vs. code porting | Ruled out | Ruled out | Ruled out | Ruled out everywhere |
| qgenie-triage-agent | Stale | Partial surface overlap: both manage work items. However the functional categories differ — kanban skills manage a YAML board with manual prioritization/lane assignment; `qgenie-triage-agent` uses ML ticket clustering and a TriageAgent MCP for automated similar-ticket detection and resolution recommendations. Different mechanism, different purpose — ruled out as a replacement | Ruled out: spec lifecycle vs. ticket triage | Ruled out | Ruled out | Ruled out | Ruled out everywhere |

**Ruled-out summary:** All nine known core plugins (qgenie-chat, qgenie-debug, qgenie-quartz, qgenie-code-review, qgenie-codewiki, qgenie-design, qgenie-optimizers, qgenie-port, qgenie-triage-agent) are ruled out against all five components. The kanban plugin occupies a domain — YAML board management and OpenSpec spec lifecycle — not covered by the current core plugin catalog.

</details>

---

## Capability Mapping

2 skill groups ready to package now · 3 components to leave as-is.

### Ready to act on now (2 components)

Both skill groups already use the SKILL.md format and `skills/<handle>/SKILL.md` directory layout that QGenie plugins expect. Adding a `.qgenie-plugin/plugin.json` manifest is the only structural change — no skill rewrites needed.

| # | Component | QGenie target | Confidence |
|---|---|---|---|
| 1 | Kanban skills | QGenie plugin (kanban skills) | Medium |
| 2 | OpenSpec skills | QGenie plugin (openspec skills) | Medium |

#### 1. Kanban skills → QGenie plugin
*Pattern B — Package as a QGenie plugin · Confidence: Medium · Status: Unknown*

**In plain terms:** Five SKILL.md skills (`kanban`, `kanban-init`, `kanban-render`, `kanban-sync`, `setup`) that manage the kanban board — reading priorities, initializing or syncing `kanban.yaml`, rendering an HTML board, syncing with OpenSpec changes, and offering a setup dialog. They already carry correct SKILL.md frontmatter (`name`, `description`) and live in `skills/<handle>/SKILL.md` directories. No reformatting is needed; a plugin manifest is the only addition.

**Why this makes sense:**
- Fits well because: A QGenie plugin is precisely a distributable bundle of skills (plus optional MCP, hooks, and adapters). These five skills are already in the layout the QGenie plugin manifest references — they are a direct packaging target, not a replacement for any core plugin. The local authoring contract confirms `skills/<skill-name>/SKILL.md` as the expected layout.
- Saves effort because: After packaging, users install with a single `qgenie plugins add` command instead of the current three-step flow (add marketplace, run `/plugin install`, verify the env flag). Version updates land through the registry rather than requiring a manual git pull and reinstall.
- Keeps paying off because: These skills are not replacing a core QGenie offering — they add domain-specific functionality QGenie doesn't cover. The platform durability argument applies to the distribution mechanism itself: as the QGenie registry improves (security scanning, versioning, governance), the kanban plugin benefits automatically alongside every other registered plugin, without the author replicating those improvements.

**How to do it:**
1. Create `.qgenie-plugin/plugin.json` at the repo root. Required fields: `"id": "<your-org>/kanban"` (immutable install key), `"version": "0.1.1"`, `"displayName": "Kanban Board"`, `"description": "Kanban board and OpenSpec bridge plugin"`, `"preferredHarness": "claude"`. Under `"capabilities"` list each of the five kanban skills with `"id"` and `"path": "./<skill-dir>/"`.
2. Confirm all skill paths start with `./` and stay inside the package root.
3. Run `claude plugin validate .` to check manifest structure before touching the registry. †
4. **[Human approval gate]** Open the QGenie Plugin Registry, choose **Add Plugin**, and upload the repo folder or zip. The registry validates the manifest before accepting it. Publish with a semver tag. †

**Caveats:** The org portion of the plugin id (`<your-org>`) must be your registered QGenie org — confirm it before creating the manifest since the id is immutable after first publish. The `claude plugin validate .` command checks Claude Code plugin structure; QGenie may have a separate validator at the registry upload step. The manifest field names come from `authoring.yaml` (local contract from the 2026-09 knowledge bundle); verify against the current registry schema on upload. †

**Link:** [QGenie Plugin Authoring Reference](https://qgenie-docs.qualcomm.com/qgenie-cli/reference/plugin-authoring)

<details>
<summary>Evidence trail</summary>

- **Source:** `shared/qgenie/authoring.yaml` → `plugin` section (local knowledge file loaded this session)
- **Source date:** 2026-09 knowledge bundle
- **Evidence label:** Cached
- **Relevant excerpt:** `minimum_layout: [".qgenie-plugin/plugin.json (required)", "At least one capability is required: a skill, MCP server, hook, agent, or command.", "skills/<skill-name>/SKILL.md (optional)"]`; `web_creation: ["Open the production plugin registry and choose Add Plugin. Upload a folder or .zip to auto-fill from .qgenie-plugin..."]`
</details>

---

#### 2. OpenSpec skills → QGenie plugin
*Pattern B — Package as a QGenie plugin · Confidence: Medium · Status: Unknown*

**In plain terms:** Five SKILL.md skills (`openspec-propose`, `openspec-apply-change`, `openspec-archive-change`, `openspec-explore`, `openspec-sync-specs`) that manage the OpenSpec spec lifecycle — creating proposals and generating all artifacts, applying changes, archiving completed changes, exploring the change tree, and syncing specs. Like the kanban skills, they already use the correct layout. They are bundled in the **same** `.qgenie-plugin/plugin.json` as the kanban skills — one plugin, one manifest, two skill groups.

**Why this makes sense:**
- Fits well because: These five skills are in the same standard `skills/<handle>/SKILL.md` layout. The same manifest that lists the kanban skills lists these too. No structural difference, no QGenie equivalent to displace.
- Saves effort because: Bundling both skill groups in one plugin means one `qgenie plugins add` command delivers all 10 skills. A user installing the plugin doesn't need to know about the internal split between board skills and spec-lifecycle skills.
- Keeps paying off because: Same distribution-mechanism durability as the kanban skills — registry improvements (versioning, security scanning) apply to both groups automatically.

**How to do it:** Same steps as component 1 above — these five skills are added to the same manifest's `capabilities.skills` array, each with its own `"id"` and `"path"`. No separate manifest needed.

**Caveats:** The `openspec` CLI (`@fission-ai/openspec`, npm) is a runtime prerequisite these skills depend on. The QGenie plugin manifest cannot install npm packages automatically. Document it as a prerequisite in the plugin's registry description and README — the `openspec-propose` SKILL.md already carries `compatibility: Requires openspec CLI.` in its frontmatter, so the text is available to copy. †

**Link:** [QGenie Plugin Authoring Reference](https://qgenie-docs.qualcomm.com/qgenie-cli/reference/plugin-authoring)

<details>
<summary>Evidence trail</summary>

- **Source:** `shared/qgenie/authoring.yaml` → `plugin` section; `skills/openspec-propose/SKILL.md` (project file)
- **Source date:** 2026-09 knowledge bundle; current project file
- **Evidence label:** Cached
- **Relevant excerpt:** `skills/openspec-propose/SKILL.md` frontmatter: `name: openspec-propose`, `compatibility: Requires openspec CLI.`
</details>

---

### Leave as-is (3 components)

No QGenie equivalent exists for these three. They stay exactly as they are and are included in the QGenie plugin package as the Claude Code adapter or runtime dependencies.

| # | Component | Confidence |
|---|---|---|
| 3 | Claude Code mod (`mod/kanban-board/`) | High |
| 4 | kanban-core library (`libs/kanban-core/`) | High |
| 5 | Shell hooks (`hooks/*.sh`) | High |

#### 3. Claude Code mod — keep as-is
*Pattern F — Keep and integrate · Confidence: High · Status: Unknown*

**In plain terms:** A native Claude Code UI mod (`mod/kanban-board/hooks/register.tsx`) that renders a swim-lane pane (`/kanban-view`), auto-syncs on `Write`/`Edit` tool-call hooks, and registers a model-callable setup tool (`kanban_board_setup`) via Claude Code's function-hooks API. It uses Claude Code's native mod TypeScript types — a harness-specific interface with no QGenie analog.

**Why not migrate:** No QGenie equivalent exists for native pane/UI modifications to Claude Code. The mod is the Claude Code harness adapter — it is what makes the plugin interactive in Claude Code. It stays as-is and is included in the QGenie plugin package as the Claude Code adapter (declared under `"adapters": { "claude": { "path": "./mod/kanban-board/" } }` in `.qgenie-plugin/plugin.json`).

**How to do it:** In `.qgenie-plugin/plugin.json`, add `"adapters": { "claude": { "path": "./mod/kanban-board/" } }`. No changes to the mod source. This is the only step — the mod source stays at `mod/kanban-board/`.

**Caveats:** The mod requires `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` in `~/.claude/settings.json` — a Claude Code prerequisite, not a QGenie one. Document it prominently in the plugin's registry description (already in `INSTALL.md`). Verify that `mod/kanban-board/hooks/hooks.json` format is compatible with the QGenie adapter loading contract for `claude` adapters. †

**Link:** No confirmed link — see Caveats.

<details>
<summary>Evidence trail</summary>

- **Source:** `mod/kanban-board/` project files; `INSTALL.md`; `shared/qgenie/authoring.yaml` → `plugin.minimum_layout`
- **Source date:** Current project files; 2026-09 knowledge bundle
- **Evidence label:** Not found (no QGenie equivalent for Claude Code native mods)
- **Relevant excerpt:** `authoring.yaml`: `"adapters/claude/ and/or adapters/codex/ (optional)"`
</details>

---

#### 4. kanban-core library — keep as-is
*Pattern F — Keep and integrate · Confidence: High · Status: Unknown*

**In plain terms:** A TypeScript library (`libs/kanban-core/`) that parses, syncs, and renders `kanban.yaml`, and provides CLI binaries. Consumed by the skills and the mod at runtime. Domain-specific; no QGenie equivalent.

**Why not migrate:** Domain-specific TypeScript library with no QGenie equivalent. It is a runtime dependency that ships inside the plugin package as-is, at `libs/kanban-core/`.

**How to do it:** No transition steps — this is a retention decision. Verify the compiled output at `libs/kanban-core/dist/` is included in the package before publishing (not gitignored at the package root level). †

**Caveats:** Confirm the `dist/` directory is not excluded from the package upload by a `.gitignore` or upload filter. A build step (`npm run build` in `libs/kanban-core/`) may be needed before packaging if `dist/` is not checked in.

**Link:** No confirmed link — see Caveats.

<details>
<summary>Evidence trail</summary>

- **Source:** `libs/kanban-core/` project files; `docs/architecture.md`
- **Source date:** Current project files
- **Evidence label:** Not found (no QGenie equivalent for TypeScript parsing/CLI libraries)
- **Relevant excerpt:** `docs/architecture.md`: `"libs/kanban-core/ — TypeScript library (parse, sync, render, CLI bins)"`
</details>

---

#### 5. Shell hooks — keep as-is
*Pattern F — Keep and integrate · Confidence: High · Status: Unknown*

**In plain terms:** Four shell scripts (`hooks/on-archive.sh`, `hooks/on-propose.sh`, `hooks/on-kanban-change.sh`, `hooks/on-task-complete.sh`) that automate kanban lane updates in response to OpenSpec lifecycle events. These are project-level automation, separate from the mod's own hooks module (`mod/kanban-board/hooks/`).

**Why not migrate:** No QGenie equivalent exists for project-level shell hooks that fire on Claude Code tool events. These are workflow glue for a specific project; they are not a distributable capability and do not belong in the plugin package.

**How to do it:** No transition steps — this is a retention decision. Document the shell hooks as a post-install manual step in the plugin's README: users who want the automation copy the relevant scripts to their project and wire them via `.claude/settings.json`. †

**Caveats:** The root `hooks/hooks.json` (which references the mod's `register.tsx`) is separate from these shell scripts — do not conflate them. The mod hooks load automatically on plugin install; the shell scripts require manual project-level setup.

**Link:** No confirmed link — see Caveats.

<details>
<summary>Evidence trail</summary>

- **Source:** `hooks/` project files (current)
- **Source date:** Current project files
- **Evidence label:** Not found (no QGenie equivalent for project-level shell hooks)
- **Relevant excerpt:** `hooks/on-archive.sh`, `hooks/on-propose.sh`, `hooks/on-kanban-change.sh`, `hooks/on-task-complete.sh` present in project root `hooks/` directory
</details>

---

## Why This Direction

Packaging the 10 skills as a QGenie plugin converts the current three-step install sequence into a single `qgenie plugins add` command. All three Pattern F — Keep and integrate components (the mod, the library, and the shell hooks) are retained inside the package — nothing is removed or replaced. The benefit is purely in distribution: the plugin becomes versioned, discoverable in the QGenie registry, and installable without a git clone. As the QGenie registry evolves (security scanning, versioned releases, governance), those improvements apply to this plugin automatically. There is no token-efficiency benefit from this packaging change (the skills already use SKILL.md's activation model, which is already efficient), and no harness behavior changes.

---

## What QGenie Does Not Replace

- **YAML board management**: `kanban.yaml` parsing, rendering, and sync in `libs/kanban-core/` — no QGenie equivalent.
- **OpenSpec spec lifecycle**: the `openspec` CLI and its artifact schema govern proposal/design/tasks generation — no QGenie equivalent.
- **Native Claude Code UI**: the `mod/kanban-board/` pane, auto-sync, and setup tool use Claude Code's native mod API — no QGenie equivalent.
- **Project-level shell hooks**: the four on-archive/on-propose/on-kanban-change/on-task-complete scripts — no QGenie equivalent.

---

## Rollout Plan

### Phase 0 — Inventory
**Covers:** All components — baseline inventory (complete — this review)
Component classification and packaging roles are determined. No further discovery needed before Phase 1.

### Phase 1 — Package reusable components
**Covers:** Pattern B — Package as a QGenie plugin (Kanban skills, OpenSpec skills — components 1 and 2)
Create `.qgenie-plugin/plugin.json` at the repo root. Declare all 10 skills under `capabilities.skills` with `"id"` and `"path"` for each. Declare the Claude Code adapter (component 3). Confirm paths start with `./` and stay in-package. Confirm `libs/kanban-core/dist/` is included.

### Phase 3 — Add harness adapters
**Covers:** Claude Code mod (component 3 — included in Phase 1 manifest; this phase = verification)
Add `"adapters": { "claude": { "path": "./mod/kanban-board/" } }` to the manifest. Verify `mod/kanban-board/hooks/hooks.json` format against the QGenie adapter loading contract. Run `claude plugin validate .`.

### Phase 4 — Validate behavior and performance
**Covers:** All components before registry publish
Install the plugin locally from the package directory and verify: all 10 skills appear in skill discovery, `/kanban-view` opens the pane, `/kanban:setup` triggers the setup dialog. Run the existing test suite (`claude plugin test mod/kanban-board`). Confirm the `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` prerequisite is documented in the registry description.

### Phase 5 — Publish and onboard users
**Covers:** Pattern B — Package as a QGenie plugin (registry publication — human-approval gate)
Confirm the org/handle with the QGenie registry team. Publish to the QGenie Plugin Registry with semver tag `0.1.1`. Update `INSTALL.md` to add the `qgenie plugins add <org>/kanban --target claude` path alongside the existing Claude Code marketplace path.

*(Phases 2 — MCP Hub — not applicable: no MCP server in this plugin.)*

---

## Risks to Watch

- **Stale plugin catalog:** The coverage matrix used the seed from 2026-09-17 with no live cache. If a new core QGenie plugin was added in the past five weeks that covers kanban-style task management or spec lifecycle management, the "no overlap" verdict should be re-examined. Run `fetch-qgenie-snapshot.js --cache` with valid credentials before the first registry publish.
- **Org/handle immutability:** The `"id"` field in `.qgenie-plugin/plugin.json` is immutable after first publish. Confirm the org name and handle with the QGenie registry team before creating the manifest.
- **Function hooks prerequisite:** The mod requires `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1`. If QGenie's install flow doesn't surface this prerequisite, users will install successfully but the mod won't load. Ensure it appears in the plugin registry description.
- **OpenSpec CLI prerequisite:** The openspec skills require `@fission-ai/openspec` (npm). This must be documented in the registry listing — it cannot be installed automatically by the plugin manifest.
- **kanban-core dist/ inclusion:** Verify the compiled library output (`libs/kanban-core/dist/`) is not excluded from the package upload before Phase 5.

---

## Validation Plan

| Metric | Current | Target | How to measure |
|---|---|---|---|
| Install steps | 3 (add marketplace, `/plugin install`, verify env flag) | 1 (`qgenie plugins add --target claude`) | Count manual steps in INSTALL.md after packaging |
| Skills in skill discovery | Verified per Claude Code install | Verified via QGenie | Run `qgenie plugins list` after install |
| Task completion rate | Not measured | Not measured | Manual smoke test: `/kanban:setup`, `/kanban-view`, `/kanban-render` |
| Human intervention rate | N/A | N/A | N/A |
| Latency | N/A | N/A | N/A |
| Maintenance locations | 1 (this repo) | 1 (this repo + QGenie registry releases) | Count git releases + registry versions post-publish |

---

## Implementation Handoff

*Written for whoever implements this next — a coding harness, or this same session — not required reading for vetting the recommendation itself.*

This report doubles as an implementation brief — every recommended component above carries a concrete **How to do it** and **Link**, and the Rollout Plan phases give an ordered sequence. Hand this file to a coding harness (Claude Code, Codex, or similar) to implement directly, or continue in this same session.

**Suggested handoff prompt:**

> Read `qgenie-alignment-review-2026-10-23.md` and implement it. Start with Phase 1: create `.qgenie-plugin/plugin.json`. Follow the "How to do it" steps under components 1 and 2 (Ready to act on now), and include the Claude Code adapter as described in component 3 (Leave as-is). Stop and ask before touching anything flagged as a human-approval gate (registry publication, Phase 5).

**Before implementing, confirm:**
- [ ] The org/handle for the plugin id has been confirmed with the QGenie registry team (it is immutable after first publish).
- [ ] `libs/kanban-core/dist/` is built and present before packaging.
- [ ] Every row flagged with a human-approval gate is reviewed by a human before proceeding.
- [ ] Phase order (1 → 3 → 4 → 5) is followed.

---

## Open Questions

- What QGenie org should the plugin publish under? (Determines `"id"`, e.g., `sdevikar/kanban` or a team org slug.)
- Does the QGenie registry have a separate CLI validator (`qgenie plugin validate`) beyond `claude plugin validate .`? Run it before Phase 5 if it exists.
- Does the QGenie adapter loading contract for `claude` expect `hooks/hooks.json` at a specific path relative to the adapter root, or does it discover it automatically?
- Should `libs/kanban-core/` be pre-built and included in the package, or should the registry support a build step?
