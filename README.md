# sdlc-tools

A Claude Code plugin marketplace for the software development loop. It holds two plugins that work together:

| Plugin | Status | What it does |
| --- | --- | --- |
| [devflow](devflow/README.md) | Stable | Adds project, commit, handoff, and review workflows as skills. |
| [kanban](kanban/README.md) | Stable | Keeps a `kanban.yaml` task board in sync with OpenSpec changes. Shows a live board pane inside Claude Code. |

## How the plugins work together

Each tool owns one layer. A layer does not take over the job of another layer.

| Layer | Tool | Job |
| --- | --- | --- |
| Intent | devflow (`charter`, `triage`, `next`) | Fix the finish line, bin each idea, and pick the next item. |
| Execution | devflow | Do the work: create proposals, manage docs, plan commits, write handoffs, and run reviews. |
| Optimization | ponytail (a devflow dependency) | Keep the code that devflow produces small and simple. |
| UX | kanban | Show the state of the work on a board. |

```mermaid
flowchart LR
    IN["devflow: charter, triage, next<br/>intent: finish line, bins, next item"]
    DF["devflow<br/>execution: proposals, docs, commits, handoffs, reviews"]
    PT["ponytail<br/>optimization"]
    KB["kanban<br/>UX: the board"]
    IN -- "binned ideas, one next item" --> DF
    PT -- "simplicity checks on the work" --> DF
    DF -- "OpenSpec changes and binned ideas" --> KB
```

### Intent layer: devflow charter, triage, and next

The intent layer recommends. It never blocks work.

- **`charter`** fixes the finish line in `.devflow/charter.md`: a goal, 3 to 5 checkable "done means" lines, the process, and what is out of scope. Each change to the finish line gets a dated reason.
- **`triage`** proposes a bin for each new idea (`mvp`, `nice-to-have`, `out-of-scope`) with a reason. You confirm. The idea goes on the kanban board. Rejected ideas go in the charter, so the agent does not propose them again.
- **`next`** gives one item and a runner-up, ranked against the "done means" lines. `nice-to-have` items show only when no `mvp` item is open.

### Execution layer: devflow

devflow wires the daily work together. It creates OpenSpec proposals, keeps working docs in `.devflow/`, plans atomic commits, saves and restores handoffs, and runs a gated self-review before you push.

### Optimization layer: ponytail

ponytail pushes for the smallest solution that works. devflow installs it as a dependency.

### UX layer: kanban

kanban tracks OpenSpec changes on a board with the lanes Not Started, In Progress, and Archived. It shows a live board pane inside Claude Code. It shows the work. It does not decide the priority.

devflow lists kanban as a dependency, so an install of devflow also installs kanban.

## Install

Register the marketplace one time:

```bash
claude plugin marketplace add qcom-all-gh-users/sdlc-tools
```

Install each plugin per project, at local scope. OpenSpec is not a plugin, so no marketplace step exists for it. See [Prerequisites](#prerequisites).

```bash
# devflow also needs the ponytail marketplace for one of its dependencies
claude plugin marketplace add DietrichGebert/ponytail
claude plugin install devflow@sdlc-tools --scope local

claude plugin install kanban@sdlc-tools --scope local
```

Inside a Claude Code session, you can use `/plugin marketplace add ...` and `/plugin install ...` instead.

### Prerequisites

| Plugin | Needs |
| --- | --- |
| devflow | `superpowers` (from `claude-plugins-official`) and `ponytail` (from `DietrichGebert/ponytail`). Claude Code installs them as dependencies. |
| kanban | Node.js 22.12+ and the [OpenSpec](https://github.com/Fission-AI/OpenSpec) CLI (`npm install -g @fission-ai/openspec@latest`). A project that is a git repository. Run `/kanban:kanban-setup` after the install. It asks before it installs the CLI, then runs `openspec init`, which adds the `/openspec-*` skills to the project. |

## mission-ctrl is retired

mission-ctrl was a separate intent plugin with a Python store, a state machine, and a design gate. devflow's `charter`, `triage`, and `next` skills replace it. Its code stays in the git history. If you installed it, run `claude plugin uninstall mission-ctrl@sdlc-tools --scope local`.

## Move from the old marketplaces

devflow and kanban had their own marketplaces before, named `devflow` and `kanban`. The old repos are archived and point here. To switch:

1. Run `claude plugin marketplace list` to see which old marketplaces you have.
2. Run `claude plugin marketplace remove <old-name>` for each old one. This also uninstalls the plugins from that marketplace.
3. Add `sdlc-tools` and install the plugins again with the commands above.

Remove the old marketplace first. If both stay, two copies of a plugin with the same name can load.

## Repository layout

```
sdlc-tools/
├── .claude-plugin/marketplace.json   # lists the two plugins
├── devflow/                          # plugin root: devflow/
└── kanban/                           # project; plugin root: kanban/plugins/kanban/
```

Each folder keeps its full git history from its old repo. Release tags use the form `<plugin>--v<version>`, for example `devflow--v0.3.0`.

To validate after a change:

```bash
claude plugin validate .
claude plugin validate ./devflow
claude plugin validate ./kanban/plugins/kanban
```

See [docs/decisions.md](docs/decisions.md) for the decisions behind this layout.
