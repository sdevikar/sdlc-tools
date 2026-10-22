import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderKanbanHtml } from "../src/render.js";

test("renderKanbanHtml writes HTML file", async () => {
  const dir = await mkdtemp(join(tmpdir(), "kanban-"));
  const p = join(dir, "board.html");
  await renderKanbanHtml([{ id: "a", title: "A", lane: "Not Started", priority: 1, specPath: "x", summary: "s", status: "proposal written", createdAt: "2026-10-22", updatedAt: "2026-10-22" }], p);
  const html = await readFile(p, "utf8");
  assert.ok(html.includes("<!DOCTYPE html>"));
  assert.ok(html.includes("P1"));
  assert.ok(!html.includes("http://") && !html.includes("https://"));
  await rm(dir, { recursive: true, force: true });
});