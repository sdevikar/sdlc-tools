import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readKanban, writeKanban } from "../src/kanban.js";

const SAMPLE = `<!-- kanban.md -->
# Kanban Board

## Not Started

### add-user-auth
- **priority**: 1
- **status**: proposal written
- **spec**: openspec/changes/add-user-auth/
- **summary**: Add user authentication
- **created**: 2026-10-20
- **updated**: 2026-10-21
- **notes**: Needs review

### api-rate-limiting
- **priority**: 5
- **status**: in proposal
- **spec**: openspec/changes/api-rate-limiting/
- **summary**: Rate limiting
- **created**: 2026-10-18
- **updated**: 2026-10-21

## Done

### fix-login-redirect
- **priority**: 10
- **status**: completed
- **spec**: openspec/changes/fix-login-redirect/
- **summary**: Fix redirect
- **created**: 2026-10-15
- **updated**: 2026-10-15
- **completed**: 2026-10-15
- **tags**: bug, auth
`;

test("round-trip read->write->read equality", async () => {
  const dir = await mkdtemp(join(tmpdir(), "kanban-"));
  const p = join(dir, "kanban.md");
  await (await import("node:fs/promises")).writeFile(p, SAMPLE, "utf8");
  const first = await readKanban(p);
  await writeKanban(p, first);
  const second = await readKanban(p);
  assert.deepEqual(first, second);
  await rm(dir, { recursive: true, force: true });
});

test("default priority 99", async () => {
  const dir = await mkdtemp(join(tmpdir(), "kanban-"));
  const p = join(dir, "kanban.md");
  await (await import("node:fs/promises")).writeFile(
    p,
    "## Not Started\n\n### x\n- **status**: s\n- **spec**: sp\n- **summary**: sum\n- **created**: c\n- **updated**: u\n",
    "utf8"
  );
  const entries = await readKanban(p);
  assert.equal(entries[0].priority, 99);
  await rm(dir, { recursive: true, force: true });
});