# Mission Ctrl — Architecture

Status: current source of truth.

---

## 1. System Context

```mermaid
flowchart LR
    Dev["Developer"]
    CC["Claude Code\n(coding agent)"]
    Plugin["Claude Code Plugin\n(hooks + skills)"]
    Core["mission_ctrl_core\n(pure Python lib, no network)"]
    State[".mission/ files\n(repo, git-tracked)"]
    Git["git log / commits"]
    MD["AGENTS.md\n(auto-generated)"]

    Dev -->|types in chat| CC
    CC -->|calls skill via bin/mission-ctrl| Plugin
    Plugin -->|direct import, in-process| Core
    Core -->|validate + persist| State
    Core -->|read only| Git
    Plugin -->|regenerate| MD
    MD -->|loaded natively by Claude Code| CC
```

No subprocess boundary in the critical path, no external network call anywhere. Claude Code is the agent — it reasons in its own context; core only validates and persists what the agent tells it.

The `pi-package` provides an equivalent adapter for Pi/openspec environments using the same core library and the same `.mission/` store format.

---

## 2. Component Diagram

```mermaid
flowchart TB
    subgraph ClaudePlugin["claude-plugin"]
        SKILL_MD["SKILL.md files (11 skills)"]
        HooksJSON["hooks/hooks.json"]
        Bin["bin/mission-ctrl\n(dispatch wrapper)"]
    end

    subgraph PiPackage["pi-package (secondary harness)"]
        Hooks["hooks/: session_start, before_send"]
        Skills["skills/ (11 skills)"]
        Sync["AGENTS.md sync"]
        Ext["extension.py (Pi adapter)"]
    end

    subgraph Core["mission_ctrl_core"]
        Store["Store layer\nMission/Mvp/Backlog/Spec/Constraints/Meta"]
        Logic["Logic layer\nplanner.py, recap.py (no LLM calls)"]
        Schema["pydantic models"]
        EventB["EventBuilder"]
    end

    Bin -->|subprocess → on_session_start / before_send / skill| Hooks
    Hooks --> Skills
    Skills --> Store
    Skills --> Logic
    Store --> Schema
    Store --> EventB
    Skills --> Sync
```

`claude-plugin` delegates all logic to `pi-package` via `bin/mission-ctrl`. `mission_ctrl_core` is a standalone pip package — no agent-runtime dependency.

---

## 3. Data Flow — Core Loop

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant CC as Claude Code
    participant Skill as /mission-ctrl skill
    participant Core as mission_ctrl_core
    participant Meta as meta.jsonl

    Dev->>CC: "exports should be async"
    CC->>Skill: /mission-ctrl:add-idea
    Skill->>Core: BacklogStore.add()
    Core->>Meta: BACKLOG_ADDED

    CC->>CC: reason about alignment (in-context)
    CC->>Skill: /mission-ctrl:triage
    Skill->>Core: BacklogStore.update()
    Core->>Meta: BACKLOG_TRIAGE

    CC->>Skill: /mission-ctrl:spec-create
    Skill->>Core: SpecStore.add()
    Core->>Meta: SPEC_CREATED

    CC->>CC: draft design digest (in-context)
    CC->>Skill: /mission-ctrl:design-propose
    Skill->>Core: SpecStore.update()
    Core->>Meta: DESIGN_PROPOSED

    Dev->>CC: approve
    CC->>Skill: /mission-ctrl:design-approve
    Core->>Meta: DESIGN_APPROVED

    Dev->>CC: "implement it"
    CC->>CC: UserPromptSubmit hook fires
    CC-->>Dev: "spec_001 is design-approved — run /mission-ctrl:spec-status first"

    CC->>Skill: /mission-ctrl:spec-status (in_progress → done)
    Core->>Meta: SPEC_STATUS_UPDATED

    Dev->>CC: (next day) opens project
    CC->>CC: SessionStart hook fires → /mission-ctrl:recap
    CC-->>Dev: RecapResult (mission, MVP %, focus, next)
```

---

## 4. Data Model Relationships

```mermaid
flowchart TB
    Mission["mission.json"] --> Backlog["backlog.json"]
    MVP["mvp.json"] --> Backlog
    Constraints["constraints.json"] --> Backlog
    Backlog --> Specs["specs.json"]
    Specs --> Git["git commits (manual git_refs)"]
    Mission --> Meta["meta.jsonl"]
    Backlog --> Meta
    Specs --> Meta
    Meta --> MD["AGENTS.md (derived, regenerated)"]
```

File format (JSON/JSONL) is language-agnostic. Live samples in `docs/examples/domain/`.

---

## 5. Repository Layout

```
mission-ctrl/
├── packages/
│   ├── core/                        # mission_ctrl_core (Python, pip)
│   │   ├── mission_ctrl_core/
│   │   │   ├── models/              # pydantic models
│   │   │   ├── stores/              # IntentStore + sub-stores
│   │   │   ├── logic/               # planner.py, recap.py
│   │   │   └── stores/events.py     # EventBuilder
│   │   ├── tests/
│   │   │   └── fixtures/            # empty-project, mid-flight, complex-graph
│   │   └── pyproject.toml
│   │
│   ├── pi-package/                  # mission_ctrl_pi (secondary harness)
│   │   ├── mission_ctrl_pi/
│   │   │   ├── extension.py         # Pi adapter
│   │   │   ├── hooks/               # session_start.py, before_send.py
│   │   │   ├── skills/              # 11 skill functions
│   │   │   └── agents_sync.py       # AGENTS.md regeneration
│   │   ├── templates/               # agents_md.jinja2
│   │   └── pyproject.toml
│   │
│   └── claude-plugin/               # Claude Code plugin (primary surface)
│       ├── .claude-plugin/
│       │   └── plugin.json          # manifest (namespace: mission-ctrl)
│       ├── skills/                  # one SKILL.md per skill
│       ├── hooks/
│       │   └── hooks.json           # SessionStart + UserPromptSubmit wiring
│       ├── bin/
│       │   └── mission-ctrl         # dispatch wrapper (Python, stdlib-only)
│       └── README.md
│
├── docs/
│   ├── concept.md                   # why this tool exists
│   ├── architecture.md              # this file
│   ├── design.md                    # skill contracts, hooks, data model
│   ├── kanban.md                    # work items and proposals
│   ├── feedback.md                  # dogfood findings, bucketed
│   ├── proposals/                   # individual openspec proposal files
│   └── examples/
│
└── README.md
```

Runtime layout inside a user's project (unchanged): `.mission/*.json`, `.mission/meta.jsonl`, `AGENTS.md` at repo root, committed to git.

---

## 6. Design Decisions + Deferred Work

**What's deferred and why:**

| Item | Status | Why deferred |
|---|---|---|
| Distributing the plugin via Claude marketplace | Deferred | Requires publishing pipeline + versioning; local `--plugin-dir` sufficient for dogfood |
| `mutation-skills-10`: update-mission, add-mvp-item, add-constraint | Deferred | Store can be hand-edited for now; mutation skills are low-priority until judgment layer (proposal 18) shapes what mutations are needed |
| Semantic before-send classification | Deferred (proposal 20) | Requires judgment layer foundation first |
| Auto spec-completion detection | Deferred (proposal 21) | Requires environment signal wiring (git hook or CI) |
| Backlog merge / archive | Deferred | Not needed until backlog grows to 50+ items |
| Schema versioning / migration tooling | Deferred | No consumers on old schema yet |
| MCP visual spec graph server | Deferred | CLI surface sufficient; no pressing need for visual graph |

The `ts-bridge-07` proposal (Node → Python bridge for Pi) is superseded — `bin/mission-ctrl` calls Python directly, so no bridge is needed for Claude Code. If a true Node-side Pi adapter is ever needed, it would use the same bridge architecture, but that is not on the roadmap.
