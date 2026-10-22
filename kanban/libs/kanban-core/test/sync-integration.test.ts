import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { syncFromOpenSpec } from "../src/sync.js";

const PROJECT = "/home/swapnil/workspace/projects/kanban";

test("sync moves archived specs to Archived lane", async () => {
  const dir = await mkdtemp(join(tmpdir(), "kanban-"));
  const p = join(dir, "kanban.yaml");
  const names = [
    "kanban-01-core-format","kanban-02-core-sync","kanban-03-opencode-plugin-mvp",
    "kanban-04-html-render","kanban-05-automation-hooks","kanban-06-github-issues",
    "kanban-07-multi-harness-adapters","kanban-08-claude-mcp-server",
  ];
  const entries = names.map((n,i)=>`  - id: ${n}\n    title: ${n}\n    lane: Not Started\n    priority: ${i+1}\n    specPath: openspec/changes/${n}/\n    summary: x\n    status: proposal written\n    createdAt: "2026-10-22"\n    updatedAt: "2026-10-22"`).join("\n");
  await writeFile(p, `entries:\n${entries}\n`, "utf8");

  await syncFromOpenSpec(PROJECT, p);

  const out = await readFile(p, "utf8");
  const archivedIdx = out.indexOf("lane: Archived");
  // check specific ids appear with Archived lane by scanning
  assert.ok(out.includes("kanban-01-core-format"));
  assert.ok(out.includes("kanban-02-core-sync"));
  // ensure their lane is Archived: parse via yaml
  const { parse } = await import("yaml");
  const data = parse(out) as { entries: { id: string; lane: string }[] };
  const byId = Object.fromEntries(data.entries.map(e=>[e.id,e.lane]));
  assert.equal(byId["kanban-01-core-format"], "Archived");
  assert.equal(byId["kanban-02-core-sync"], "Archived");
  assert.notEqual(byId["kanban-03-opencode-plugin-mvp"], "Archived");

  await rm(dir, { recursive: true, force: true });
});