import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderKanbanHtml, renderKanbanMarkdown } from "../src/render.js";
import type { KanbanEntry } from "../src/types.js";

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

const mkEntry = (id: string, lane: KanbanEntry["lane"], priority: number): KanbanEntry => ({
  id, lane, priority, title: id, summary: `summary-${id}`, status: "proposal written",
  specPath: "x", createdAt: "2026-10-22", updatedAt: "2026-10-22",
});

test("renderKanbanMarkdown: header contains all lane names", () => {
  const md = renderKanbanMarkdown([]);
  const header = md.split("\n")[0];
  assert.ok(header.includes("Not Started"));
  assert.ok(header.includes("In Progress"));
  assert.ok(header.includes("Archived"));
});

test("renderKanbanMarkdown: sorts entries by priority ascending within lane", () => {
  const entries = [mkEntry("b", "Not Started", 2), mkEntry("a", "Not Started", 1)];
  const md = renderKanbanMarkdown(entries);
  const rows = md.split("\n").slice(2);
  assert.ok(rows[0].includes("**a**"));
  assert.ok(rows[1].includes("**b**"));
});

test("renderKanbanMarkdown: pads shorter columns with blank cells", () => {
  const entries = [
    mkEntry("x1", "Not Started", 1),
    mkEntry("x2", "Not Started", 2),
    mkEntry("y1", "In Progress", 1),
  ];
  const md = renderKanbanMarkdown(entries);
  const rows = md.split("\n").slice(2);
  assert.equal(rows.length, 2);
  // second row: Not Started has x2, In Progress is blank
  assert.ok(rows[1].includes("**x2**"));
  const cells = rows[1].split("|").map(c => c.trim());
  assert.equal(cells[2], "");
});