# OpenSpec ↔ Kanban Bridge Plugin: Research Report

> **Objective**: Build a plugin for OpenCode (and Claude) that bridges OpenSpec spec-driven development with lightweight kanban task management, enabling prioritization and "what's next" answering.

---

## 1. Problem Statement

The core problem: **developers need to answer "what is the next priority item?"** while working in a spec-driven development lifecycle. OpenSpec manages the lifecycle (propose → refine → implement → archive), but there is no lightweight task board that:

1. Automatically mirrors spec changes into kanban lanes
2. Lets you manually reorder and prioritize items
3. Answers "what should I work on next?" based on priority + spec phase
4. Optionally syncs with GitHub Issues for external tracking

---

## 2. The Existing Ecosystem

### 2.1 OpenSpec CLI Lifecycle

OpenSpec's `spec-driven` schema defines a 4-artifact lifecycle:

```
proposal.md → specs/**/*.md → design.md → tasks.md
   (why)      (requirements)    (how)      (steps)
```

**Key CLI commands** (all support `--json`):

| Command | Purpose | Key JSON Fields |
|---|---|---|
| `openspec list --json` | List all changes | `name`, `completedTasks`, `totalTasks`, `lastModified`, `status` |
| `openspec status --change <name> --json` | Artifact graph status | `schemaName`, `changeRoot`, `artifactPaths`, `applyRequires`, `artifacts[]` |
| `openspec new change <name>` | Create a change | Creates `changes/<name>/.openspec.yaml` with `schema` and `created` |
| `openspec archive <name>` | Archive completed change | Moves to `changes/archive/YYYY-MM-DD-<name>/` |
| `openspec instructions <artifact> --change <name> --json` | Get artifact instructions | `template`, `instruction`, `resolvedOutputPath`, `dependencies`, `unlocks` |
| `openspec context --json` | Working context | `root`, `members`, `status` |
| `openspec doctor --json` | Health report | Relationship health |
| `openspec view` | Interactive dashboard | Built-in terminal dashboard |

**Sample `status --json` output:**
```json
{
  "changeName": "test-feature",
  "schemaName": "spec-driven",
  "changeRoot": "/path/to/changes/test-feature",
  "artifactPaths": {
    "proposal": { "resolvedOutputPath": ".../proposal.md" },
    "specs": { "resolvedOutputPath": ".../specs/**/*.md" },
    "design": { "resolvedOutputPath": ".../design.md" },
    "tasks": { "resolvedOutputPath": ".../tasks.md" }
  },
  "artifacts": [
    { "id": "proposal", "status": "ready" },
    { "id": "design", "status": "blocked", "missingDeps": ["proposal"] },
    { "id": "tasks", "status": "blocked", "missingDeps": ["design", "specs"] }
  ]
}
```

### 2.2 OpenCode Plugin Architecture (V2 API)

**Definition format:**
```typescript
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "opencode-openspec-kanban",
  async setup(ctx) {
    // Register transforms, tools, hooks, etc.
    return () => { /* cleanup */ }
  },
})
```

**Three plugin flavors exist:**
- **Promise** (`@opencode/plugin/dist/v2/promise`) — most common, async/await style
- **Effect** (`@opencode/plugin/dist/v2/effect`) — functional, uses Effect TS runtime
- **Legacy V1** (`@opencode/plugin`) — hooks-based, being phased out

**Key context methods available to plugins:**
- `ctx.skill.transform(editor => ...)` — register/inspect/update/remove skills
- `ctx.command.transform(editor => ...)` — register slash commands
- `ctx.tool.transform(editor => ...)` — register AI-agent tools
- `ctx.storage.set/get/remove/scan(key, value)` — durable JSON storage
- `ctx.session.prompt({ sessionID, text, delivery })` — send prompts to sessions
- `ctx.vcs.get()/status()/diff()` — read VCS state
- `ctx.location.directory` / `ctx.location.project.canonical` — project paths
- `ctx.options` — plugin options from config
- `ctx.event.subscribe({ signal })` — event stream subscription

**Skill registration pattern:**
```typescript
await ctx.skill.transform((editor) => {
  editor.add({
    id: "openspec-kanban",
    name: "OpenSpec Kanban",
    description: "Kanban board for OpenSpec changes",
    path: "/path/to/skills/openspec-kanban/SKILL.md",
    content: "## ... skill instructions ...",
  })
})
```

**Tool registration pattern:**
```typescript
const registration = await ctx.tool.transform((editor) => {
  editor.namespace({ name: "openspec", description: "OpenSpec integration" })
  editor.add({
    name: "kanban-list",
    description: "List kanban items",
    input: { type: "object", properties: { ... }, required: [...] },
    execute: async (input, context) => {
      await context.progress({ status: "listing items" })
      return { content: await listItems(input) }
    },
  })
})
```

### 2.3 Existing Kanban/Orchestration Tools in the OpenCode Ecosystem

| Tool | Type | Repo | Stars | Key Notes |
|---|---|---|---|---|
| **Kagan** | OpenCode V2 plugin | [`kagan-sh/kagan-opencode`](https://github.com/kagan-sh/kagan-opencode) | 13 | Supervised kanban: Backlog → In Progress → Review → Done. Uses git worktrees. Intake + review agents gate transitions. No OpenSpec integration. |
| **opencode-kanban** | Rust TUI | [`TomCC7/opencode-kanban`](https://github.com/TomCC7/opencode-kanban) | 66 | Terminal kanban for git worktrees + tmux sessions. Already has `openspec/changes/select-task-base-branch` in its repo. |
| **Vibe Kanban** | Standalone | `BloopAI/vibe-kanban` | — | Multi-agent kanban (not OpenCode-specific) |
| **Kanban Code** | Native (macOS/Win) | `langwatch/kanban-code` | — | Claude Code session management as cards |
| **specdeck** | Standalone Node.js | `AidanFeess/specdeck` | 4 | **Read-only** local web dashboard for OpenSpec. NOT an OpenCode plugin. Shows changes as kanban lanes derived from artifact presence. |

#### specdeck — The Closest Analog

**specdeck** is the most relevant existing tool. It's a standalone Node.js app (not a plugin) that:
- Reads the `openspec/` directory directly
- Shows a kanban board with lanes derived from which artifacts exist (Draft, Ready, In Progress, Done, Archived)
- Ticks tasks by writing back to `tasks.md`
- Approval state derived from git `Approved-by:` trailers
- Remote awareness via git fetch state

**Design principles worth adopting:**
- *"Everything is derived, nothing is stored"* — lanes come from file state, not a status field
- *"It never claims to know more than it does"* — remote state labeled with fetch age
- *"specdeck writes only what you asked it to"* — never creates files outside OpenSpec's paths

**What it lacks:**
- No OpenCode plugin integration (no skill, tool, or command registration)
- No manual priority ordering (lanes are purely derived)
- No GitHub Issues sync
- Not accessible from within an OpenCode session

---

## 3. Proposed Architecture

### 3.1 Core Concept: kanban.md + kanban.html as the Bridge

The plugin maintains two artifacts:
- **`kanban.md`** — the human-editable source of truth (structured markdown with YAML-like frontmatter per entry)
- **`kanban.html`** — a generated visual kanban board (always regenerated via `/kanban-render`, never hand-edited)

Both are derived from structured `KanbanEntry` objects (see Appendix B). This enables:
1. **Human-readable** task board that anyone can edit outside OpenCode
2. **Source of truth** for priority ordering and manual lane moves
3. **Machine-readable** format that can be parsed into structured objects
4. **HTML rendering** for visual kanban boards with drag-and-drop, filtering, sorting

**Sample `kanban.md` structure (structured YAML-like frontmatter per entry):**
```markdown
# Kanban Board

> Last synced: 2026-10-21T12:00:00Z

## Not Started

### add-user-auth
- **priority**: 1
- **status**: proposal written
- **spec**: openspec/changes/add-user-auth/
- **summary**: Add user authentication with OAuth and email magic links
- **created**: 2026-10-20
- **updated**: 2026-10-21
- **notes**: Needs review before moving forward

### api-rate-limiting
- **priority**: 5
- **status**: in proposal
- **spec**: openspec/changes/api-rate-limiting/
- **summary**: Add API rate limiting middleware
- **created**: 2026-10-18
- **updated**: 2026-10-21

## In Progress

### add-user-auth
- **priority**: 1
- **status**: design in progress
- **spec**: openspec/changes/add-user-auth/
- **summary**: Add user authentication with OAuth and email magic links
- **created**: 2026-10-20
- **updated**: 2026-10-21

## Done

### fix-login-redirect
- **priority**: 10
- **status**: completed
- **spec**: openspec/changes/fix-login-redirect/
- **summary**: Fix login redirect loop on Safari
- **created**: 2026-10-15
- **updated**: 2026-10-15
- **completed**: 2026-10-15

## Archived

### old-feature
- **priority**: 10
- **status**: archived
- **spec**: openspec/changes/archive/2026-09-20-old-feature/
- **summary**: Old feature that was deprecated
- **created**: 2026-09-15
- **updated**: 2026-09-20
- **archived**: 2026-09-20
```

Each entry is a structured object (see `KanbanEntry` in Appendix B) that can be
parsed and rendered to `kanban.html` for a visual kanban board.

### 3.2 OpenSpec Stage → Kanban Lane Mapping

| OpenSpec Stage | Kanban Lane | Trigger |
|---|---|---|
| Change created, proposal missing | Not Started | `openspec new change` |
| Proposal written, specs/design/tasks missing | Not Started | proposal.md exists |
| Design or tasks in progress | In Progress | design.md or tasks.md exist |
| Tasks complete (apply-ready) | Ready | All artifacts done |
| Implementation complete, archive requested | Done | `openspec archive` called |
| Archived | Archived | Moved to `changes/archive/` |

### 3.3 Automation Strategy: Hooks + Manual Override

The kanban board is managed by **standalone** `/kanban-*` skills that are invoked
independently. They are NOT extensions of openspec skills. OpenSpec lifecycle
events may trigger kanban updates, but the kanban skills manage the board on
their own terms.

```
┌─────────────────────┐    ┌──────────────────────┐
│  OpenSpec Lifecycle  │    │    kanban.md         │
│  (propose/refine/   │    │  (human-editable)    │
│   implement/archive)│    │                      │
└──────────┬──────────┘    └──────────┬───────────┘
           │                          │
           ▼                          ▼
┌──────────────────────────────────────────────┐
│       OpenCode Plugin (this project)          │
│                                              │
│  Auto-sync (via hooks):                      │
│  - propose → /kanban-add to Not Started      │
│  - tasks complete → /kanban-move to Ready    │
│  - archive → /kanban-move to Archived        │
│                                              │
│  Manual:                                     │
│  - /kanban-priority add-user-auth high       │
│  - /kanban-move add-user-auth In Progress    │
│  - /kanban-next  ← "what to work on?"        │
│  - /kanban-render  ← generate HTML view      │
│                                              │
│  GitHub sync (optional):                     │
│  - Changes → Issues with labels              │
└──────────────────────────────────────────────┘
```

### 3.4 Plugin Components

#### 3.4.1 Skills (for AI agent instructions)

Skills are markdown files that guide the AI agent on how to use the plugin.
These are **standalone** kanban skills — they do NOT extend or wrap openspec skills.
They are triggered by OpenSpec lifecycle events (propose, apply, archive) but manage
the kanban board on their own terms.

1. **`kanban`** — Core kanban skill:
   - How to read `kanban.md` / `kanban.html`
   - How to use `/kanban-*` commands
   - How to answer "what's next" using priority + stage

2. **`kanban-sync`** — Syncs kanban board with current OpenSpec state
   - Reads all changes via `openspec list --json`
   - Compares against current kanban entries
   - Adds missing entries, updates statuses, marks archived

3. **`kanban-add`** — Adds a spec to the board
   - Called when a new change is proposed
   - Creates a structured kanban entry with metadata

4. **`kanban-move`** — Moves a card between lanes
   - Called when spec transitions (proposal→design→tasks→archive)
   - Also available as manual command

5. **`kanban-priority`** — Sets priority for a spec
   - Called manually or auto-assigned based on stage

6. **`kanban-next`** — Returns the next priority item
   - Filters active lanes, sorts by priority, returns top item

7. **`kanban-render`** — Renders kanban.md to kanban.html
   - Generates an HTML kanban board from structured entries
   - Supports drag-and-drop, filtering, sorting

#### 3.4.2 Commands (slash commands in OpenCode)

| Command | Purpose |
|---|---|
| `/kanban` | Show the kanban board (renders kanban.md or kanban.html) |
| `/kanban-add <name> [priority]` | Add a spec to the board |
| `/kanban-move <name> <lane>` | Move a card manually |
| `/kanban-priority <name> <level>` | Set priority (high/medium/low/number) |
| `/kanban-next` | Show the next priority item |
| `/kanban-done <name>` | Mark a card as done (pre-archive) |
| `/kanban-sync` | Sync kanban board with OpenSpec state |
| `/kanban-render` | Render kanban.md to kanban.html |

#### 3.4.3 Tools (for AI agent programmatic access)

| Tool | API | Purpose |
|---|---|---|
| `openspec_kanban_list` | `execute(input)` | Read kanban.md, return cards |
| `openspec_kanban_move` | `execute(input)` | Move a card between lanes |
| `openspec_kanban_priority` | `execute(input)` | Set/get priority for a card |
| `openspec_kanban_next` | `execute(input)` | Return the next priority item |

#### 3.4.4 Hooks (for automation)

```typescript
// Watch for openspec commands and sync kanban.md
await ctx.session.hook("command.execute.before", (event) => {
  if (event.command === "openspec new change") {
    // Add to kanban.md after creation
  }
  if (event.command === "openspec archive") {
    // Move to Done in kanban.md
  }
})
```

Alternatively, use `ctx.event.subscribe()` to watch the event stream for relevant operations.

### 3.5 kanban.md ↔ OpenSpec Sync Logic

```
SYNC TRIGGERS

1. openspec new change <name>
   → Check kanban.md for <name>
   → If absent: append to "Not Started" with default priority
   → Read .openspec.yaml for created date
   → Read proposal.md to extract summary

2. openspec status --change <name>
   → Check artifact statuses
   → If tasks blocked but design exists → "In Progress"
   → If tasks ready → "Ready" (or "In Progress" if agent working)
   → If artifacts complete → "Done" (awaiting archive)

3. openspec archive <name>
   → Move card from current lane → "Archived"
   → Add completion timestamp

4. Manual kanban.md edits
   → Plugin detects changes on next tool call
   → Does NOT override manual moves
   → Priority changes persist
```

### 3.6 Priority System

Priorities are stored as frontmatter in each card line:

```markdown
- [ ] add-user-auth (priority: 1) — proposal written
- [ ] api-rate-limiting (priority: 5) — in proposal
- [ ] fix-login-redirect (priority: 10) — done
```

**Next item algorithm:**
1. Filter to active lanes (Not Started, In Progress, Ready)
2. Sort by priority (lowest number = highest priority)
3. Return the first item that has actionable spec state:
   - Has a proposal (so the AI knows what to do)
   - Is not archived
   - Is not already in progress (optional filter)

**Priority commands:**
- `/kanban-priority <name> 1` — set numeric priority
- `/kanban-priority <name> high` — set high (priority: 1)
- `/kanban-priority <name> medium` — set medium (priority: 5)
- `/kanban-priority <name> low` — set low (priority: 10)

---

## 4. GitHub Issues Integration

### 4.1 Why It Matters

GitHub Issues are the de facto external task tracker. Integrating lets:
- External stakeholders see planned work
- PRs reference issues automatically
- Teams use familiar tools alongside AI specs

### 4.2 Integration Patterns

OpenCode has native GitHub integration and MCP server support. The plugin can:

```
Option A: Use GitHub MCP Server
- Configure `gh` MCP server (already common in OpenCode config)
- Use `gh issue create` / `gh issue list` via shell or MCP tools
- Sync labels: `spec:proposal`, `spec:tasks-ready`, `status:in-progress`

Option B: Use GitHub REST API directly
- Plugin registers GitHub as an integration via ctx.integration
- Uses Octokit to create/read/update issues
- More control, more setup

Option C: Shell out to `gh` CLI
- Simplest: `gh issue create --title "..." --body "..."`
- Requires `gh auth login` separately
- Best for MVP
```

### 4.3 GitHub Sync Strategy

| OpenSpec Action | GitHub Action | Trigger |
|---|---|---|
| Change proposed | Create issue with `spec:proposed` label | `openspec new change` |
| Proposal written | Add comment with spec link, change label to `spec:refined` | proposal.md created |
| Tasks ready | Label `status:ready` | tasks.md exists |
| Archive | Comment "Implemented and archived", label `status:done` | `openspec archive` |

### 4.4 Issue ↔ kanban.md Sync

The kanban.md card includes a GitHub issue reference:

```markdown
## Not Started
- [ ] add-user-auth (priority: high) — #[123] — proposal written
```

Where `#123` is the GitHub issue number. The plugin tracks the mapping in `ctx.storage`:
```json
{
  "kanban-links": {
    "add-user-auth": { "issue": 123, "repo": "owner/repo" }
  }
}
```

---

## 5. Claude Desktop/Agent Compatibility

The user also mentioned Claude (Claude Code/Claude Desktop). For Claude compatibility:

1. **Skills**: Claude Code uses `.claude/skills/` directory. Skills are the same markdown format.
2. **Commands**: Claude Code uses `.claude/commands/`. Same slash command format.
3. **MCP Servers**: Claude Desktop supports MCP servers for tool integration.
4. **Agent hooks**: Claude Code supports agentic hooks similar to OpenCode.

**Cross-compatibility approach:**
- Skills and commands are markdown — identical format works for both
- For tools: package as an MCP server (works with Claude Desktop) + OpenCode plugin (for OpenCode native tools)
- Use the same `kanban.md` format in both environments
- GitHub sync logic is environment-agnostic (works via MCP or plugin API)

### 5.1 MCP Server Approach for Claude

```
opencode-openspec-kanban/
├── packages/
│   ├── opencode-plugin/        # OpenCode V2 plugin
│   │   └── src/index.ts        # Registers skills, commands, tools
│   ├── kanban-mcp/             # MCP server for Claude Desktop
│   │   └── src/server.ts       # Exposes list/move/priority/next tools
│   └── cli/                    # Standalone CLI (used by both)
│       └── src/bin.ts          # kanban-cli commands
├── skills/                     # Shared skills (markdown) — SINGLE SOURCE OF TRUTH
│   ├── kanban/SKILL.md
│   ├── kanban-sync/SKILL.md
│   ├── kanban-add/SKILL.md
│   ├── kanban-move/SKILL.md
│   ├── kanban-priority/SKILL.md
│   ├── kanban-next/SKILL.md
│   └── kanban-render/SKILL.md
├── commands/                   # Shared commands (markdown)
│   ├── kanban.md
│   ├── kanban-add.md
│   ├── kanban-move.md
│   ├── kanban-priority.md
│   ├── kanban-next.md
│   ├── kanban-sync.md
│   └── kanban-render.md
├── AGENTS.md                   # Compact rules version (works everywhere)
├── libs/
│   └── kanban-core/            # Shared logic (TS library)
│       └── src/index.ts        # kanban.md parsing, sync logic, priority
│
├── .opencode/                  # OpenCode adapter
│   ├── skills/                 # Symlink or copy of skills/
│   ├── commands/               # Symlink or copy of commands/
│   └── plugin.json             # OpenCode plugin manifest
├── .claude-plugin/             # Claude Code adapter
│   ├── skills/                 # Symlink or copy of skills/
│   └── commands/               # Symlink or copy of commands/
├── .cursor/rules/              # Cursor adapter (rules-only)
├── .windsurf/rules/            # Windsurf adapter (rules-only)
├── .clinerules/                # Cline adapter (rules-only)
├── .codex-plugin/              # Codex adapter
├── .devin-plugin/              # Devin CLI adapter
├── .grok-plugin/               # Grok Build adapter
├── .kimi-plugin/               # Kimi adapter
├── .kiro/steering/             # Kiro adapter
├── .openclaw/skills/           # OpenClaw adapter
├── .qoder-plugin/              # Qoder adapter
├── pi-extension/               # Pi extension adapter
├── gemini-extension.json       # Gemini extension adapter
├── plugin.json                 # Generic plugin manifest
├── plugin.yaml                 # Generic plugin manifest
├── opencode.json               # OpenCode config
├── hooks/                      # Lifecycle hooks (shared across harnesses)
└── INSTALL.md                  # Per-harness install instructions
```

---

## 6. Multi-Harness Architecture (Ponytail Model)

### 6.1 Inspiration: Ponytail's Multi-Harness Approach

[Ponytail](https://github.com/dietrichgebert/ponytail) (171k+ stars) is a skill-based tool that works across **20+ AI coding agents**.
It achieves this through a **shared core + thin harness adapters** pattern:

```
ponytail/
├── skills/ponytail/SKILL.md       # SINGLE SOURCE OF TRUTH (the prompt)
├── commands/                      # Shared commands (markdown)
├── AGENTS.md                      # Compact rules version (works everywhere)
├── hooks/                         # Lifecycle hooks (shared)
├── scripts/                       # Install scripts
├──
├── .claude-plugin/                # Claude Code adapter (full plugin)
├── .opencode/                     # OpenCode adapter (skills + commands + plugin.json)
├── .codex-plugin/                 # Codex adapter (plugin + hooks)
├── .cursor/rules/                 # Cursor adapter (rules-only)
├── .windsurf/rules/               # Windsurf adapter (rules-only)
├── .clinerules/                   # Cline adapter (rules-only)
├── .devin-plugin/                 # Devin CLI adapter
├── .grok-plugin/                  # Grok Build adapter
├── .kimi-plugin/                  # Kimi adapter
├── .kiro/steering/                # Kiro adapter (steering)
├── .openclaw/skills/              # OpenClaw adapter
├── .qoder-plugin/                 # Qoder adapter
├── pi-extension/                  # Pi extension adapter
├── gemini-extension.json          # Gemini extension adapter
├── plugin.json                    # Generic plugin manifest
├── plugin.yaml                    # Generic plugin manifest (YAML)
├── opencode.json                  # OpenCode-specific config
└── INSTALL.md                     # Per-harness install instructions
```

**Key principles from Ponytail:**
1. **Single source of truth**: `skills/ponytail/SKILL.md` is the only place the core logic lives
2. **Thin adapters**: Each harness gets only the config files it needs to discover and load the shared content
3. **Graceful degradation**: Harnesses with full plugin support get commands + tools + hooks; harnesses without plugin support get instruction-only (rules file)
4. **AGENTS.md**: A compact, lowest-common-denominator version that works in any agent that reads a rules file
5. **Per-harness install docs**: `INSTALL.md` documents how to install for each harness

### 6.2 Harness Capability Matrix

Not all harnesses support the same features. The kanban plugin should adapt:

| Harness | Plugin Support | Skills | Commands | Tools | Hooks | MCP | Install Method |
|---|---|---|---|---|---|---|---|
| **OpenCode** | Full (V2) | Yes | Yes | Yes | Yes | Yes | `opencode plugin add` or local path |
| **Claude Code** | Full (plugin) | Yes | Yes | Via MCP | Yes | Yes | `/plugin marketplace add` |
| **Codex** | Full (plugin) | Yes | Yes | Via MCP | Yes | Yes | `codex plugin add` |
| **Cursor** | Rules only | Via rules | No | No | No | Via MCP | Copy rules file |
| **Windsurf** | Rules only | Via rules | No | No | No | Via MCP | Copy rules file |
| **Cline** | Rules only | Via rules | No | No | No | Via MCP | Copy rules file |
| **Gemini CLI** | Extension | Yes | Yes | No | No | Yes | `gemini extension` |
| **Kiro** | Steering | Yes | No | No | No | No | Steering file |
| **Devin CLI** | Plugin | Yes | Yes | No | No | No | Plugin install |
| **Grok Build** | Plugin | Yes | Yes | No | No | No | Plugin install |
| **Pi** | Extension | Yes | Yes | No | No | No | Extension install |
| **OpenClaw** | Skills | Yes | No | No | No | No | Skills dir |
| **Any agent** | Fallback | Via AGENTS.md | No | No | No | No | Copy AGENTS.md |

### 6.3 Adapter Strategy

**Full-support harnesses (OpenCode, Claude Code, Codex):**
- Get the complete plugin with skills, commands, tools, and hooks
- kanban.md is read/written via native file tools
- `kanban.html` rendered via tool
- GitHub sync via MCP or native integration

**Rules-only harnesses (Cursor, Windsurf, Cline):**
- Get `AGENTS.md` (compact rules) copied to their rules directory
- No commands or tools — the agent follows the rules to manage kanban.md
- `kanban.html` can still be generated if the agent has shell access
- GitHub sync requires MCP server or CLI

**Steering/extension harnesses (Kiro, Gemini, Pi):**
- Get harness-specific config files pointing to shared skills
- Commands may be available depending on harness capabilities
- MCP server provides tool access where native tools aren't available

### 6.4 Shared Core vs. Harness-Specific Code

```
┌─────────────────────────────────────────────────────────────┐
│                    SHARED CORE (harness-agnostic)            │
│                                                             │
│  skills/        → SKILL.md files (markdown instructions)     │
│  commands/      → Command definitions (markdown)             │
│  AGENTS.md      → Compact rules (works everywhere)          │
│  libs/          → kanban-core TS library (parsing, sync)    │
│  hooks/         → Lifecycle hooks (shell scripts)           │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  OpenCode    │ │  Claude Code │ │  Cursor      │
│  Adapter     │ │  Adapter     │ │  Adapter     │
│              │ │              │ │              │
│  .opencode/  │ │ .claude-     │ │ .cursor/     │
│  skills/     │ │ plugin/      │ │ rules/       │
│  commands/   │ │ skills/      │ │              │
│  plugin.json │ │ commands/    │ │ (rules only) │
│  plugin.ts   │ │ (MCP server) │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
```

**What lives in shared core:**
- All skill markdown (SKILL.md files)
- All command markdown
- AGENTS.md compact rules
- kanban-core library (TS) — parsing, sync, priority logic
- kanban.md format specification
- kanban.html template
- Lifecycle hook scripts

**What lives in harness adapters:**
- Plugin entry points (OpenCode V2 plugin, Claude plugin, etc.)
- Harness-specific config files (.opencode/plugin.json, .claude-plugin/, etc.)
- MCP server wrapper (for harnesses without native tools)
- Install scripts

### 6.5 AGENTS.md — The Universal Fallback

Following Ponytail's pattern, the plugin includes an `AGENTS.md` that contains the compact rules.
This file works in ANY agent that reads a rules file, even without plugin support:

```markdown
# OpenSpec Kanban Rules

When working with OpenSpec changes, maintain a `kanban.md` file at the project root.

## Kanban Board Management

- After proposing a change (`openspec new change`), add an entry to kanban.md
  under "Not Started" with priority (default: 5).
- When a change's tasks become ready, move it to "Ready" lane.
- When implementation starts, move to "In Progress".
- When archived, move to "Archived".
- Priority: lower number = higher priority. Use /kanban-priority to set.

## Answering "What's Next?"

1. Read kanban.md
2. Filter to active lanes (Not Started, In Progress, Ready)
3. Sort by priority (lowest first)
4. Return the first item with a proposal (so you know what to do)

## kanban.md Format

Entries use structured YAML-like frontmatter:
### <change-name>
- **priority**: N
- **status**: <status>
- **spec**: openspec/changes/<name>/
- **summary**: <description>
- **created**: YYYY-MM-DD
- **updated**: YYYY-MM-DD
- **notes**: <free-form notes>
```

### 6.6 INSTALL.md — Per-Harness Instructions

Following Ponytail's pattern, include an `INSTALL.md` with per-harness instructions:

```markdown
# Installation

## OpenCode
opencode plugin add opencode-openspec-kanban
# or local: add path to opencode.json plugins array

## Claude Code
/plugin marketplace add <repo-url>
/plugin install openspec-kanban

## Codex
codex plugin marketplace add <repo-url>
codex plugin add openspec-kanban

## Cursor / Windsurf / Cline
Copy AGENTS.md to your rules directory:
- Cursor: .cursor/rules/openspec-kanban.md
- Windsurf: .windsurf/rules/openspec-kanban.md
- Cline: .clinerules/openspec-kanban.md

## Gemini CLI
gemini extension install <repo-url>

## Any other agent
Copy AGENTS.md to your project root or agent config directory.
```

### 6.7 Lifecycle Hooks (Shared)

The `hooks/` directory contains shell scripts that work across harnesses that support hooks:

```
hooks/
├── on-propose.sh          # Triggered when openspec new change is called
├── on-archive.sh          # Triggered when openspec archive is called
├── on-task-complete.sh     # Triggered when a task checkbox is ticked
└── on-kanban-change.sh    # Triggered when kanban.md is modified
```

These hooks are referenced by harness-specific config files (e.g., `.codex-plugin/hooks.json`, `.claude-plugin/hooks.json`).

---

## 7. Implementation Roadmap

### Phase 1: MVP (Minimal Viable Plugin)

**Goal**: Basic kanban.md sync with OpenSpec, manual commands only.

**Deliverables:**
1. `kanban.md` format spec
2. OpenCode plugin with:
   - `ctx.tool.transform` registering 4 tools: `list`, `move`, `priority`, `next`
   - `ctx.command.transform` registering 4 slash commands
   - `ctx.skill.transform` registering the core skill
3. Core library (`libs/kanban-core/`):
   - `readKanban(path)` — parse kanban.md
   - `writeKanban(path, items)` — write kanban.md
   - `syncFromOpenSpec(openspecPath, kanbanPath)` — one-way sync from OpenSpec → kanban
4. CLI tool for manual use

**No automation hooks, no GitHub integration.**

### Phase 2: Automation Hooks

**Goal**: Auto-sync on OpenSpec lifecycle events.

**Deliverables:**
1. Session hooks for `openspec new change`, `openspec archive`
2. Event stream subscription watching `change.archived`
3. Priority system with numeric ordering
4. `kanban-next` command/tool

### Phase 3: GitHub Issues Integration

**Goal**: Optional GitHub Issues sync.

**Deliverables:**
1. GitHub MCP server integration (via `@modelcontextprotocol/server-github`)
2. `kanban-link` tool to link a spec to an existing issue
3. Auto-create issues for new specs (opt-in)
4. Sync issue state back to kanban.md

### Phase 4: Claude Compatibility + Multi-Harness Adapters

**Goal**: Package as MCP server for Claude Desktop + shared skills/commands + harness adapters.

**Deliverables:**
1. `packages/kanban-mcp/` MCP server (for Claude, Cursor, Windsurf, etc.)
2. `.claude-plugin/` adapter with skills/commands mirroring OpenCode versions
3. `AGENTS.md` compact rules (universal fallback for all harnesses)
4. `INSTALL.md` per-harness install instructions
5. Harness-specific adapter configs:
   - `.cursor/rules/` — Cursor rules-only adapter
   - `.windsurf/rules/` — Windsurf rules-only adapter
   - `.clinerules/` — Cline rules-only adapter
   - `.codex-plugin/` — Codex plugin adapter
   - `.kiro/steering/` — Kiro steering adapter
   - `gemini-extension.json` — Gemini extension adapter
6. Shared `libs/kanban-core/` used by all adapters
7. Lifecycle hooks in `hooks/` (shared across harnesses)

### Phase 5: Full Multi-Harness Coverage

**Goal**: Complete adapter coverage for all supported harnesses.

**Deliverables:**
1. Remaining harness adapters:
   - `.devin-plugin/` — Devin CLI
   - `.grok-plugin/` — Grok Build
   - `.kimi-plugin/` — Kimi
   - `.qoder-plugin/` — Qoder
   - `.openclaw/skills/` — OpenClaw
   - `pi-extension/` — Pi
2. `plugin.json` and `plugin.yaml` generic manifests
3. `opencode.json` OpenCode-specific config
4. Automated adapter generation script (copy shared core → harness dirs)
5. CI testing across harnesses

---

## 8. Comparison with Existing Approaches

| Feature | Kagan | opencode-kanban | specdeck | **Proposed Plugin** |
|---|---|---|---|---|
| OpenCode V2 plugin | Yes | No (Rust TUI) | No (Node.js app) | Yes |
| Git worktree isolation | Yes | Yes | No | No (optional) |
| Manual priority ordering | No | Partial | No | **Yes** |
| "What's next" answering | No | No | No | **Yes** (core feature) |
| OpenSpec lifecycle sync | No | Partial (has openspec dir) | Yes (read-only) | **Yes (bidirectional)** |
| GitHub Issues integration | No | No | No | **Yes (Phase 3)** |
| Claude compatibility | No | No | No | **Yes (Phase 4)** |
| AI-agent tool access | Yes | No | No | **Yes** |
| Human-editable format | No | No | No | **Yes (kanban.md)** |

---

## 9. Key Decisions and Tradeoffs

### 8.1 kanban.md vs. Internal Database

**Decision**: Use `kanban.md` as the source of truth.

**Pros:**
- Human-readable and editable outside the plugin
- Version-controlled alongside specs
- Simple to implement (text parsing)
- Survives plugin upgrades/reinstalls

**Cons:**
- Parsing complexity (markdown formats vary)
- No real-time sync (requires polling or hook-based detection)
- Manual edits could conflict with auto-sync

**Mitigation**: Use a strict, documented format. Auto-sync only touches structured fields, preserves manual edits to descriptions/priorities.

### 8.2 Automation: Hooks vs. Polling vs. Event Stream

**Decision**: Use a hybrid approach.
- **Hooks**: For explicit commands (`openspec new`, `openspec archive`) — reliable, immediate
- **Event stream**: For indirect changes (agent completing tasks that updates `tasks.md`) — catch-all
- **Polling**: None — avoid performance drain

**Implementation**: Register `ctx.session.hook("command.execute.before", ...)` for known commands. Subscribe to `ctx.event.subscribe()` for state changes. Reconcile kanban.md on tool calls.

### 8.3 Monorepo vs. Separate Packages

**Decision**: Monorepo with packages.

**Structure:**
```
opencode-openspec-kanban/
├── packages/
│   ├── opencode-plugin/     # V2 plugin entry
│   ├── kanban-mcp/          # MCP server for Claude
│   ├── cli/                 # Standalone CLI
│   └── kanban-core/         # Shared logic
├── skills/                  # Markdown skills
├── commands/                # Markdown commands
└── package.json             # Workspace root
```

**Rationale**: Shared core logic (`kanban-core`) is used by both the OpenCode plugin and the MCP server. This avoids duplication and ensures consistent behavior.

### 8.4 GitHub Integration: MCP vs. Direct API vs. CLI

**Decision**: Use MCP server integration (Phase 3), with CLI fallback.

**Rationale**: 
- MCP is the future-proof approach
- OpenCode and Claude both support MCP
- Avoids managing OAuth/token state in the plugin
- `@modelcontextprotocol/server-github` or `gh` MCP server likely already configured

**Fallback**: Shell out to `gh` CLI if MCP not available.

---

## 10. Open Questions

1. **Conflict resolution**: If the AI auto-moves a card but the user manually moved it back, what wins?
   - *Tentative answer*: Manual edits always win. Auto-sync respects current kanban.md state.

2. **Multi-project**: How to handle multiple OpenSpec roots/projects?
   - *Tentative answer*: Use `openspec store list` to discover all registered stores. Each gets its own section in kanban.md.

3. **Archived changes**: Should `openspec list` (which filters archives) or filesystem scanning find archived items?
   - *Tentative answer*: Watch `changes/archive/` directory for newly archived items.

4. **Task-level granularity**: Should individual tasks within `tasks.md` become kanban cards?
   - *Tentative answer*: No — keep it at the spec/change level. Tasks.md already tracks task progress.

5. **Worktree integration**: Combine with Kagan/opencode-kanban for isolated execution?
   - *Tentative answer*: Optional. The kanban plugin could suggest creating worktrees but shouldn't require them.

---

## 11. Next Steps

1. **Prototype `libs/kanban-core/`**: Implement kanban.md parsing and OpenSpec sync
2. **Build Phase 1 plugin**: Minimal OpenCode plugin with tools/commands
3. **Test with existing OpenSpec project**: Verify sync accuracy
4. **Expand to MCP server**: Add `packages/kanban-mcp/` for Claude
5. **Implement GitHub integration**: Phase 3 features

---

## Appendix A: OpenCode V2 Plugin Boilerplate

```typescript
// packages/opencode-plugin/src/index.ts
import { Plugin } from "@opencode/plugin"
import { readKanban, writeKanban, syncFromOpenSpec } from "kanban-core"
import { join } from "path"

export default Plugin.define({
  id: "opencode-openspec-kanban",
  async setup(ctx) {
    const kanbanPath = join(ctx.location.directory, "kanban.md")
    const openspecPath = join(ctx.location.directory, "openspec")

    // Register tools
    await ctx.tool.transform((editor) => {
      editor.namespace({
        name: "openspec",
        description: "OpenSpec kanban integration tools",
      })

      editor.add({
        name: "kanban-list",
        description: "List all kanban cards from kanban.md",
        input: { type: "object", properties: {}, required: [] },
        execute: async (_, context) => {
          await context.progress({ status: "Reading kanban.md" })
          const items = await readKanban(kanbanPath)
          return { content: JSON.stringify(items, null, 2) }
        },
      })

      editor.add({
        name: "kanban-next",
        description: "Show the next priority item to work on",
        input: { type: "object", properties: {}, required: [] },
        execute: async (_, context) => {
          await context.progress({ status: "Determining next priority" })
          const items = await readKanban(kanbanPath)
          const next = items
            .filter(i => !i.completed && i.lane !== "Archived")
            .sort((a, b) => (a.priority || 99) - (b.priority || 99))[0]
          return { content: next ? JSON.stringify(next, null, 2) : "No items found" }
        },
      })
    })

    // Register skills
    await ctx.skill.transform((editor) => {
      editor.add({
        id: "openspec-kanban",
        name: "OpenSpec Kanban",
        description: "Use kanban.md to track and prioritize OpenSpec work",
        path: join(ctx.location.directory, ".opencode/skills/openspec-kanban/SKILL.md"),
        content: "## ... skill instructions ...",
      })
    })

    // Register commands
    await ctx.command.transform((editor) => {
      editor.add({
        name: "kanban-next",
        description: "Show the next priority item",
        execute: async ({ sessionID }) => {
          await ctx.session.prompt({
            sessionID,
            text: "Use the openspec_kanban_next tool to show the next priority item.",
            delivery: "steer",
          })
        },
      })
      editor.add({
        name: "kanban",
        description: "Show the kanban board",
        execute: async ({ sessionID }) => {
          await ctx.session.prompt({
            sessionID,
            text: "Read kanban.md and display the structured board.",
            delivery: "steer",
          })
        },
      })
      editor.add({
        name: "kanban-render",
        description: "Render kanban.md to kanban.html",
        execute: async ({ sessionID }) => {
          await ctx.session.prompt({
            sessionID,
            text: "Use the openspec_kanban_render tool to generate kanban.html.",
            delivery: "steer",
          })
        },
      })
    })
  },
})
```

## Appendix B: kanban.md Format Specification

### Structured Object Format

Kanban entries are **structured objects** that can be rendered to both markdown (kanban.md)
and HTML (kanban.html). Each entry has a well-defined shape:

```typescript
interface KanbanEntry {
  id: string;              // Unique identifier (kebab-case change name)
  title: string;           // Human-readable title
  lane: KanbanLane;        // Current lane
  priority: number;        // Numeric priority (lower = higher priority)
  specPath: string;        // Path to openspec change directory
  summary: string;         // Brief description of the change
  status: string;          // OpenSpec artifact status (proposal, design, tasks, etc.)
  createdAt: string;       // ISO date when change was created
  updatedAt: string;       // ISO date when last modified
  completedAt?: string;    // ISO date when completed (Done/Archived)
  archivedAt?: string;     // ISO date when archived
  githubIssue?: number;    // Linked GitHub issue number
  tags?: string[];         // Optional tags for filtering
  assignee?: string;       // Optional assignee
  notes?: string;          // Free-form notes (preserved on rewrites)
}
```

### kanban.md Rendering

The markdown format uses a **structured YAML-like frontmatter block** per entry,
making it both human-readable and machine-parseable:

```markdown
<!-- kanban.md — auto-synced by opencode-openspec-kanban plugin -->
<!-- Manual edits to descriptions, priorities, and notes are preserved. -->
<!-- Lane moves are respected. Auto-sync only adds/removes/updates status. -->

# Kanban Board

> Last synced: 2026-10-21T12:00:00Z

## Not Started

### add-user-auth
- **priority**: 1
- **status**: proposal written
- **spec**: openspec/changes/add-user-auth/
- **summary**: Add user authentication with OAuth and email magic links
- **created**: 2026-10-20
- **updated**: 2026-10-21
- **notes**: Needs review before moving forward

## In Progress

### api-rate-limiting
- **priority**: 3
- **status**: design in progress
- **spec**: openspec/changes/api-rate-limiting/
- **summary**: Add API rate limiting middleware
- **created**: 2026-10-18
- **updated**: 2026-10-21

## Ready

### fix-login-redirect
- **priority**: 2
- **status**: tasks ready
- **spec**: openspec/changes/fix-login-redirect/
- **summary**: Fix login redirect loop on Safari
- **created**: 2026-10-19
- **updated**: 2026-10-21

## Done

### update-readme
- **priority**: 5
- **status**: completed
- **spec**: openspec/changes/update-readme/
- **summary**: Update README with new API docs
- **created**: 2026-10-10
- **updated**: 2026-10-15
- **completed**: 2026-10-15

## Archived

### old-feature
- **priority**: 10
- **status**: archived
- **spec**: openspec/changes/archive/2026-09-20-old-feature/
- **summary**: Old feature that was deprecated
- **created**: 2026-09-15
- **updated**: 2026-09-20
- **archived**: 2026-09-20
```

### kanban.html Rendering

The `kanban-render` skill generates an HTML kanban board from the structured objects.
The HTML uses a drag-and-drop interface (vanilla JS, no framework dependencies)
and renders cards from the parsed `KanbanEntry` objects:

```html
<!-- kanban.html — auto-generated by /kanban-render -->
<!-- DO NOT EDIT — regenerate with /kanban-render -->
<!DOCTYPE html>
<html>
<head>
  <title>Kanban Board</title>
  <style>/* embedded styles */</style>
</head>
<body>
  <div class="kanban-board">
    <div class="lane" data-lane="Not Started">
      <h2>Not Started</h2>
      <div class="card" data-id="add-user-auth" data-priority="1" draggable="true">
        <h3>add-user-auth</h3>
        <p>Add user authentication with OAuth and email magic links</p>
        <span class="priority">P1</span>
        <span class="status">proposal written</span>
      </div>
    </div>
    <!-- ... other lanes ... -->
  </div>
  <script>/* drag-and-drop, filtering, sorting */</script>
</body>
</html>
```

**Format rules:**
- Lane headers: `## <Lane Name>`
- Entries: `### <id>` followed by `- **key**: value` lines
- Structured fields are machine-parseable (key: value pairs)
- Free-form `notes` field preserved on auto-sync rewrites
- Priority defaults to 99 if not specified
- Lanes: Not Started, In Progress, Ready, Done, Archived (configurable)
- `kanban.html` is always regenerated — never edited by hand
- `kanban.md` is the source of truth; `kanban.html` is a view

---

## Appendix C: Existing OpenSpec Skills Reference

The project at `/home/swapnil/workspace/projects/kanban/.opencode/skills/` already has:
- `openspec-propose` — propose a new change with all artifacts
- `openspec-apply-change` — implement tasks from a change
- `openspec-archive-change` — archive a completed change
- `openspec-sync-specs` — sync delta specs to main specs
- `openspec-explore` — enter explore/thinking mode

And commands:
- `/opsx-propose` — propose new change
- `/opsx-apply` — implement tasks
- `/opsx-archive` — archive change
- `/opsx-sync` — sync specs
- `/opsx-explore` — explore mode

**These existing skills are NOT modified.** The kanban skills are **standalone** — they
are invoked independently (e.g., `/kanban-priority add-user-auth high`) and may be
triggered by OpenSpec lifecycle events, but they manage the kanban board on their own terms.

### New Kanban Skills (standalone)

The plugin adds these standalone skills:

| Skill | Purpose | Trigger |
|---|---|---|
| `kanban` | Core skill — how to read/manage kanban.md/html | Always available |
| `kanban-sync` | Sync board with OpenSpec state | After propose/archive, or manual |
| `kanban-add` | Add a spec to the board | During propose, or manual |
| `kanban-move` | Move a card between lanes | During spec transitions, or manual |
| `kanban-priority` | Set priority for a spec | Manual |
| `kanban-next` | Return next priority item | Manual |
| `kanban-render` | Render kanban.md → kanban.html | Manual, or after board changes |