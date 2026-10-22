import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { syncFromOpenSpec } from "../src/sync.js";

const PROJECT = "/home/swapnil/workspace/projects/kanban";

test("sync moves archived specs to Archived section", async () => {
  const dir = await mkdtemp(join(tmpdir(), "kanban-"));
  const p = join(dir, "kanban.md");
  const names = [
    "kanban-01-core-format","kanban-02-core-sync","kanban-03-opencode-plugin-mvp",
    "kanban-04-html-render","kanban-05-automation-hooks","kanban-06-github-issues",
    "kanban-07-multi-harness-adapters","kanban-08-claude-mcp-server",
  ];
  const body = names.map((n,i)=>`### ${n}\n- **priority**: ${i+1}\n- **status**: proposal written\n- **spec**: openspec/changes/${n}/\n- **summary**: x\n- **created**: 2026-10-22\n- **updated**: 2026-10-22`).join("\n\n");
  await writeFile(p, `# Kanban Board\n\n## Not Started\n\n${body}\n\n## In Progress\n\n## Ready\n\n## Done\n\n## Archived\n`, "utf8");

  await syncFromOpenSpec(PROJECT, p);

  const out = await (await import("node:fs/promises")).readFile(p, "utf8");
  const archived = out.slice(out.indexOf("## Archived"));
  const notStarted = out.slice(out.indexOf("## Not Started"), out.indexOf("## Archived"));
  assert.ok(archived.includes("### kanban-01-core-format"));
  assert.ok(archived.includes("### kanban-02-core-sync"));
  assert.ok(!notStarted.includes("### kanban-01-core-format"));
  assert.ok(!notStarted.includes("### kanban-02-core-sync"));

  await rm(dir, { recursive: true, force: true });
});