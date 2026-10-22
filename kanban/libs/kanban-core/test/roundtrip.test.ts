import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readKanban, writeKanban } from "../src/kanban.js";

const SAMPLE = `entries:
  - id: add-user-auth
    title: add-user-auth
    lane: Not Started
    priority: 1
    specPath: openspec/changes/add-user-auth/
    summary: Add user authentication
    status: proposal written
    createdAt: "2026-10-20"
    updatedAt: "2026-10-21"
    notes: Needs review
  - id: fix-login-redirect
    title: fix-login-redirect
    lane: Done
    priority: 10
    specPath: openspec/changes/fix-login-redirect/
    summary: Fix redirect
    status: completed
    createdAt: "2026-10-15"
    updatedAt: "2026-10-15"
    completedAt: "2026-10-15"
    tags:
      - bug
      - auth
`;

test("round-trip read->write->read equality", async () => {
  const dir = await mkdtemp(join(tmpdir(), "kanban-"));
  const p = join(dir, "kanban.yaml");
  await writeFile(p, SAMPLE, "utf8");
  const first = await readKanban(p);
  await writeKanban(p, first);
  const second = await readKanban(p);
  assert.deepEqual(first, second);
  await rm(dir, { recursive: true, force: true });
});

test("default priority preserved", async () => {
  const dir = await mkdtemp(join(tmpdir(), "kanban-"));
  const p = join(dir, "kanban.yaml");
  await writeFile(p, `entries:\n  - id: x\n    title: x\n    lane: Not Started\n    priority: 99\n    specPath: sp\n    summary: sum\n    status: s\n    createdAt: c\n    updatedAt: u\n`, "utf8");
  const entries = await readKanban(p);
  assert.equal(entries[0].priority, 99);
  await rm(dir, { recursive: true, force: true });
});