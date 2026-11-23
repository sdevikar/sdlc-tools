# devflow

A Claude Code plugin that wires your project, commit, handoff, and review workflows into every project where you install it.

## The workflow

Without devflow, an AI coding session has no memory of previous sessions, no fixed finish line, no rules about how commits are structured, and no process for review feedback. You type the same instructions into every prompt.

devflow puts these rules in skills and hooks. It has four loops:

```mermaid
flowchart LR
    subgraph P["Project loop"]
        CH["charter<br/>finish line"] --> TR["triage<br/>bin each idea"] --> NX["next<br/>pick one item"]
    end
    subgraph C["Commit loop"]
        AC["atomic-commits<br/>plan, approve, commit"]
    end
    subgraph S["Session loop"]
        HO["handoff<br/>save state"] --> PU["pickup<br/>restore state"]
    end
    subgraph R["Review loop"]
        SR["self-review"] --> PR["address-pr-comments"]
    end
    NX --> AC --> SR
    AC -. "checkpoint at each commit" .-> HO
    PU --> AC
    PR --> AC
```

| Loop | What it does |
|---|---|
| **Project** | `charter` fixes the finish line in `.devflow/charter.md`. `triage` puts each new idea in a bin (`mvp`, `nice-to-have`, `out-of-scope`) on the kanban board, after you confirm. `next` recommends one item and a runner-up. They recommend; you decide. |
| **Commit** | Before any code, `atomic-commits` proposes a commit plan and waits for approval. It applies merge rules (config and the code that reads it go together; a refactor and a bug fix do not), runs a volume check, and offers a combine pass before a push. |
| **Session** | Each session starts with the workflow map, the charter digest, and a pointer to the latest handoff. At each milestone, a checkpoint hook asks Claude to keep the handoff current. `pickup` restores it in the next session. |
| **Review** | `self-review` runs the built-in code review, verifies each finding, checks earlier decisions, rates each fix, and waits for your approval tier by tier. `address-pr-comments` does the same for GitHub review threads. |

## What makes this stick

The value is in the process rules, not in any single skill: the merge test, the approval gates, the report format, the rating rubric, the rule that an earlier handoff overrides a reviewer's finding. These rules live in the skills, not in a prompt you retype each session.

devflow follows one principle: **hooks decide when, the main agent decides what.** A hook uses cheap, fixed signals (a commit, a new plan file) to pick the moment. The session agent, which has the full context, makes the call.

The plugin brings three dependencies:

| Dependency | Marketplace | Used for |
|---|---|---|
| `superpowers` | `claude-plugins-official` | Brainstorming, plans, debugging, and the receiving-code-review context |
| `ponytail` | `ponytail` | The smallest change that works |
| `kanban` | `sdlc-tools` | The board that holds ideas and OpenSpec changes |

## Install

```mermaid
flowchart TD
    A["claude plugin install devflow@sdlc-tools --scope local"] --> B["Type /reload-plugins"]
    B --> C["/devflow:setup"]
    C --> C1["Check for plugin conflicts"]
    C1 --> C2["Create .devflow/ and its .gitignore"]
    C2 --> C3["Offer to delete the old .claude/rules/devflow.md"]
    C3 --> C4["Set the board path to .devflow/kanban.yaml"]
    C4 --> Q{"Use OpenSpec here?"}
    Q -- yes --> K["kanban:kanban-setup<br/>openspec init and the board"]
    Q -- no --> D
    K --> D["/devflow:charter<br/>set the finish line"]
    D --> E["Each session starts with the map,<br/>the charter digest, and the handoff pointer"]
```

1. Run `claude plugin install devflow@sdlc-tools --scope local`. This also installs `superpowers`, `ponytail`, and `kanban`.
2. In Claude Code, type `/reload-plugins`, then run `/devflow:setup`.
3. Run `/devflow:charter` to set the finish line.

If the marketplaces are not registered yet:

```bash
# One time: register the marketplaces
claude plugin marketplace add qcom-all-gh-users/sdlc-tools
claude plugin marketplace add DietrichGebert/ponytail

# Per project
claude plugin install devflow@sdlc-tools --scope local
```

If you already have `superpowers`, `ponytail`, or `kanban` installed from a **different** marketplace, uninstall them first. `/devflow:setup` checks this for you.

Run setup again after a plugin update, and once in each new git worktree.

## Skills

| Skill | Loop | What it does |
|---|---|---|
| `setup` | — | Conflict check, marketplace registration, install, `.devflow/` folder, OpenSpec |
| `charter` | Project | Write or change the goal, done means, process, and scope |
| `triage` | Project | Propose a bin for a new idea and add it to the board |
| `next` | Project | Recommend one next item and a runner-up |
| `atomic-commits` | Commit | Plan, approve, commit, and review, one unit at a time |
| `handoff` | Session | Write or update this session's handoff |
| `pickup` | Session | Restore from the latest handoff |
| `self-review` | Review | Run, verify, rate, and gate-approve fixes from a code review |
| `address-pr-comments` | Review | Fetch, verify, rate, and gate-approve fixes from PR review threads |

## How the pieces connect

```mermaid
flowchart LR
    subgraph Hooks["hooks/hooks.json"]
        SS["SessionStart<br/>startup, clear, resume, compact"]
        ST["Stop<br/>after each Claude turn"]
    end
    subgraph Scripts["scripts/"]
        S1["session_start.py"]
        S2["checkpoint.py --start"]
        S3["checkpoint.py"]
        LH["latest_handoff.py"]
    end
    subgraph Files[".devflow/"]
        MAP["references/workflow-map.md<br/>(in the plugin)"]
        CHF["charter.md"]
        HF["handoffs/*.md"]
        CP[".checkpoint/&lt;session&gt;.json"]
    end
    SS --> S1 & S2
    ST --> S3
    S1 -- reads --> MAP & CHF
    S1 -- uses --> LH -- reads --> HF
    S2 -- writes baseline --> CP
    S3 -- reads, moves forward --> CP
    S3 -- checks age --> HF
```

All scripts use the Python standard library only. On any error, each hook prints nothing and exits 0. The hooks need `python3` on `PATH`.

## Working files

devflow keeps its working files in `.devflow/` at the root of each git worktree, so they never mix with a project's own `docs/`. `/devflow:setup` creates the folder. The skills also create it when it is missing.

```mermaid
flowchart TB
    subgraph T["Tracked by git"]
        GI[".gitignore"]
        KB["kanban.yaml<br/>ideas, bins, OpenSpec changes"]
        CHT["charter.md<br/>finish line"]
    end
    subgraph I["Ignored by git: local working notes"]
        H["handoffs/"]
        RV["reviews/"]
        PL["plans/"]
        RS["research/"]
        AN["analysis/"]
        AR["artifacts/"]
        CK[".checkpoint/"]
    end
```

| Path | Contents | Git |
|---|---|---|
| `.devflow/kanban.yaml` | Kanban board (created by `/kanban:kanban-setup` or `/devflow:triage`) | Tracked |
| `.devflow/charter.md` | Project charter (created by `/devflow:charter`) | Tracked |
| `.devflow/handoffs/` | Handoffs | Ignored |
| `.devflow/reviews/` | Review reports | Ignored |
| `.devflow/plans/` | Plans and design specs, including superpowers plans and specs | Ignored |
| `.devflow/research/` | Research notes | Ignored |
| `.devflow/analysis/` | Analysis and root-cause notes | Ignored |
| `.devflow/artifacts/` | PDFs, diagrams, images, and other binary files | Ignored |
| `.devflow/.checkpoint/` | Checkpoint state, one file per session | Ignored |

`.devflow/.gitignore` holds four lines:

```gitignore
*
!.gitignore
!kanban.yaml
!charter.md
```

You do not need to edit your root `.gitignore`. A root pattern such as `.devflow/` blocks the `!` lines, because git cannot re-include a file inside an excluded folder. Setup finds this case and names the pattern.

The board and the charter go stale slowly, and their history explains past decisions. The other files go stale fast, and an agent that searches them acts on stale facts. So they stay local.

## Workflow map

At each session start, clear, resume, and compaction, `session_start.py` gives Claude three parts:

```mermaid
sequenceDiagram
    participant CC as Claude Code
    participant H as session_start.py
    participant F as Files
    participant C as Claude
    participant U as You
    CC->>H: SessionStart JSON
    H->>F: Is there a .devflow/ folder?
    alt no .devflow/
        H-->>CC: nothing
    else set-up project
        H->>F: Read references/workflow-map.md
        H->>F: Read .devflow/charter.md
        H->>F: Find the latest open handoff for the branch
        H-->>CC: additionalContext: map + charter digest + pointer
        H-->>CC: systemMessage: pointer only
        CC->>C: map, digest, and pointer as context
        CC->>U: pointer lines only
    end
```

| Part | Source | Size |
|---|---|---|
| Workflow map: where files go, and which skill to use when | `references/workflow-map.md` | 40 lines at most |
| Charter digest: Goal, Done means, Process, Out of scope | `.devflow/charter.md` | 8 lines per section at most |
| Handoff pointer | the latest open handoff for the branch | 3 lines at most |

With no charter, the digest is one line that tells Claude to offer `/devflow:charter` once.

The map says *when*; each skill says *how*. A sample of the map:

| Moment | Use |
|---|---|
| The user brings a new idea or feature request | `devflow:triage`, before any design work |
| The user asks what to do next, or an item is done | `devflow:next` |
| Design a feature or a change in behavior | `superpowers:brainstorming`, then `superpowers:writing-plans` |
| Write code | `devflow:atomic-commits`, with `ponytail` |
| A bug, a test failure, or unexpected behavior | `superpowers:systematic-debugging` |
| Before a push | `devflow:self-review` |

The plugin prints the map, so a plugin update changes it in every project with no copy to refresh. If your `CLAUDE.md` names another location for a kind of file, your `CLAUDE.md` wins. Older versions copied a rule to `.claude/rules/devflow.md`. Setup offers to delete that copy.

## Project loop: charter, triage, and next

### Charter

`/devflow:charter` interviews you, one question at a time, with a draft answer for each. It writes `.devflow/charter.md` only after you approve the full file.

```mermaid
flowchart LR
    G["Goal<br/>one sentence"] --> D["Done means<br/>3 to 5 checkboxes"] --> P["Process<br/>for example TDD, OpenSpec"] --> O["Out of scope"]
    O --> PK["Parking lot"] --> RJ["Rejected"] --> CL["Changes<br/>dated log with reasons"]
    classDef digest fill:#dbeafe,stroke:#1e40af
    class G,D,P,O digest
```

The session start digest prints the four blue sections. Each change to Goal, Done means, or Out of scope adds a dated line with your reason under Changes. So when the finish line moves, the move is visible.

### Triage

`/devflow:triage` runs when you bring a new idea, also when you say "we should also add...".

```mermaid
flowchart TD
    I["New idea"] --> C{"Charter exists?"}
    C -- no --> OC["Offer /devflow:charter and stop"]
    C -- yes --> B["Propose a bin with a reason<br/>that names a charter line"]
    B --> U{"You confirm or change the bin"}
    U --> MVP["mvp<br/>a Done means line needs it"]
    U --> NTH["nice-to-have<br/>helps, but not needed"]
    U --> OOS["out-of-scope<br/>matches Out of scope"]
    MVP & NTH & OOS --> KB["Entry in .devflow/kanban.yaml<br/>tag = bin, notes = reason"]
    OOS --> RJ["Line under Rejected<br/>(or Parking lot)"]
    MVP -. "Process names OpenSpec" .-> OP["Offer /opsx:propose &lt;id&gt;"]
```

The entry `id` is kebab-case, so it can become the OpenSpec change name. When that change appears, kanban sync keeps the entry's tags and notes. Triage never refuses or delays work on an idea because of its bin.

### Next

`/devflow:next` reads the charter, the board, the open handoffs, the open OpenSpec changes, and git. It gives one item, the "Done means" line it moves, and one runner-up.

```mermaid
flowchart TD
    S["/devflow:next"] --> C{"Charter exists?"}
    C -- no --> OC["Offer /devflow:charter"]
    C -- yes --> A{"Every Done means line checked?"}
    A -- yes --> DONE["The project is done.<br/>Offer /devflow:charter for a new finish line"]
    A -- no --> R1{"Something broken?<br/>failing test, blocking question"}
    R1 -- yes --> OUT["Recommend it"]
    R1 -- no --> R2{"Unblocked mvp item<br/>that checks a Done means line?"}
    R2 -- yes --> OUT
    R2 -- no --> R3["mvp item that unblocks the most"]
    R3 --> OUT
    OUT --> OFF["Offer devflow:pickup or /opsx:apply,<br/>run only after you agree"]
```

`nice-to-have` items show only when no `mvp` item is open. `out-of-scope` items never show.

## Handoff and pickup

`/devflow:handoff` writes the session state to `.devflow/handoffs/handoff_<slug>_<YYYYMMDD-HHMM>.md` in the project root. On a feature branch, `<slug>` is the branch name with `/` changed to `-`. On `main`, it is a short topic. The file starts with frontmatter (`branch`, `head`, `base`, `pr`, `status`, `session`, `summary`, `next`), so tools can find it without a pasted path.

There is one handoff per session. Each later run in the same session finds the file by its `session` key and rewrites it in place. The handoff is a snapshot, not a log:

| Section | Holds |
|---|---|
| Goal | What the work is for |
| State | At most 3 outcomes |
| Decisions | Each decision and its reason |
| Dead ends | What failed and why |
| Open questions | Each question with its context |
| Next steps | A numbered list; the first item matches `next` |
| Artifacts | Paths that git does not show |

It never lists commits or files, because pickup reads those from git. Its test for each line: "Can `git log` or `git diff` tell the reader this? If yes, delete the line."

The life of one session:

```mermaid
sequenceDiagram
    participant U as You
    participant C as Claude
    participant SS as SessionStart hook
    participant ST as Stop hook
    participant H as Handoff file
    SS->>C: map, charter digest, pointer to the last handoff
    SS->>SS: record the baseline (HEAD, time)
    U->>C: /devflow:pickup
    C->>H: read the last handoff, check it against git
    U->>C: work on the next step
    C->>C: commit
    C-->>ST: turn ends
    ST->>C: "devflow checkpoint: new commit abc1234..."
    C->>H: create or rewrite this session's handoff
    C->>U: one line: the handoff path
    Note over C: auto-compaction
    SS->>C: map, digest, pointer again (matcher: compact)
    U->>C: more work, no milestone
    C-->>ST: turn ends
    ST-->>C: nothing
```

When a session starts, clears, resumes, or compacts, the pointer shows at most 3 lines: the `summary`, the `next` step, and the path of the most recently updated handoff for the current branch whose `status` is not `done`. Run `/devflow:pickup` to read that handoff, check it against git, and choose the next step. Pass a path to pick up a specific file: `/devflow:pickup .devflow/handoffs/<file>.md`.

### Checkpoint

When Claude ends a turn, the `Stop` hook checks for a milestone since the last checkpoint:

| Signal | Example |
|---|---|
| A new commit | Claude commits a fix |
| A new or changed file in `.devflow/plans/`, `analysis/`, `research/`, or `reviews/` | A plan or review report is written |
| An OpenSpec change archived, or with every task checked | The last task of a change is done |

Uncommitted edits, context use, and elapsed time are not signals. The handoffs folder is not a signal, so a handoff update does not trigger a new request.

```mermaid
flowchart TD
    E["Claude ends a turn"] --> A{"stop_hook_active,<br/>or DEVFLOW_CHECKPOINT=off?"}
    A -- yes --> N["Print nothing"]
    A -- no --> B{"Baseline file for this session?"}
    B -- no --> W["Write the baseline"] --> N
    B -- yes --> S{"Any signal newer<br/>than the baseline?"}
    S -- no --> N
    S -- yes --> M["Move the baseline forward"]
    M --> H{"This session's handoff<br/>newer than every signal?"}
    H -- yes --> N
    H -- no --> ASK["Ask Claude once:<br/>update the handoff, or reply<br/>'Handoff current.'"]
```

You do not need to answer the request. The hook moves the baseline before it asks, so it never asks twice for the same signal. It never asks while Claude is already continuing for it, and it stays silent on any error.

The hook keeps its state in `.devflow/.checkpoint/`. To turn it off, set `DEVFLOW_CHECKPOINT=off` in the environment. It needs Claude Code 2.1.314 or later.

## Review

Both review skills share one loop, in `references/review-loop.md`.

```mermaid
flowchart LR
    IN["Findings<br/>/code-review or PR threads"] --> V["Verify each one<br/>against the code"]
    V --> D["Check earlier decisions<br/>in handoffs and git"]
    D --> T["One report table"]
    T --> RT["Rate each fix:<br/>blast radius, reversibility"]
    RT --> AP{"You approve,<br/>tier by tier"}
    AP --> AC["atomic-commits"]
    AC --> PO["Push or post replies<br/>only when you say so"]
```

| Skill | Input | Report |
|---|---|---|
| `/devflow:self-review` | The built-in `/code-review` on your PR, unpushed commits, or `<default branch>...HEAD` | `.devflow/reviews/review_<slug>_<YYYYMMDD>.md` |
| `/devflow:address-pr-comments` | Inline threads, review bodies, and general comments on a PR | `.devflow/reviews/review_pr<n>_<YYYYMMDD>.md` |

Both skills are safe to re-run on the same target. A re-run reuses the newest report, adds a `## Round <n>` note, and adds no duplicate rows, commits, or replies. Thread replies state only facts: `**Fixed** in <sha>: <what changed>. <file>:<line>`, or `**Rejected**: <reason>`.

## Rollback

```bash
claude plugin uninstall devflow@sdlc-tools --scope local
```
