import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

test("cli-view exits 1 and names root kanban.yaml when only docs/kanban.yaml exists", async () => {
  const dir = await mkdtemp(join(tmpdir(), "kanban-view-"));
  await mkdir(join(dir, "docs"), { recursive: true });
  await writeFile(join(dir, "docs", "kanban.yaml"), "entries:\n", "utf8");

  const cliPath = new URL("../src/cli-view.js", import.meta.url).pathname;
  const result = spawnSync(process.execPath, [cliPath], { cwd: dir, encoding: "utf8" });

  assert.equal(result.status, 1);
  assert.ok(
    result.stderr.includes(`${dir}/kanban.yaml`),
    `Expected stderr to contain ${dir}/kanban.yaml, got: ${result.stderr}`
  );

  await rm(dir, { recursive: true, force: true });
});
