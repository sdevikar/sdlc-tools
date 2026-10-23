# Contributing

This project uses [OpenSpec](https://www.npmjs.com/package/@fission-ai/openspec)'s spec-based development workflow. All changes start as a spec proposal.

## Workflow

1. **Propose** — run `/openspec-propose` to describe the change. OpenSpec creates a spec file under `docs/specs/`.
2. **Implement** — work from the spec. Run `/openspec-apply-change` to apply it.
3. **Archive** — run `/openspec-archive-change` when the work is done. The kanban board moves the entry to Archived automatically.

Keep specs small and focused. One spec per logical change. Review the spec before starting implementation — it is the source of truth for scope.

## Setup

Install dependencies and initialize OpenSpec:

```bash
npm install @fission-ai/openspec
npx openspec init
```

Then follow the [Claude Code Setup](README.md#claude-code-setup) steps in the README to load the mod and link skills.

## Commit Style

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `refactor:`. Keep commits atomic — one spec change per commit.
