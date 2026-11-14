import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeSync, extractProject } from "../src/sync.js";

test("mergeSync preserves priority and notes", () => {
  const existing = [
    { id: "a", title: "a", lane: "In Progress", priority: 2, specPath: "x", summary: "s", status: "old", createdAt: "2026-10-01", updatedAt: "2026-10-01", notes: "keep" } as any,
  ];
  const active = [{ name: "a", lastModified: "2026-10-02T00:00:00Z", artifacts: [{ id: "proposal", status: "done" }, { id: "design", status: "done" }, { id: "tasks", status: "blocked" }] }];
  const merged = mergeSync(existing, active, []);
  assert.equal(merged[0].priority, 2);
  assert.equal(merged[0].notes, "keep");
  assert.equal(merged[0].lane, "In Progress");
  assert.equal(merged[0].status, "design in progress");
});

test("mergeSync moves archived", () => {
  const existing = [{ id: "a", title: "a", lane: "In Progress", priority: 3, specPath: "x", summary: "s", status: "tasks ready", createdAt: "2026-10-01", updatedAt: "2026-10-01" } as any];
  const merged = mergeSync(existing, [], [{ name: "a", dirName: "2026-10-03-a" }]);
  assert.equal(merged[0].lane, "Archived");
  assert.equal(merged[0].status, "archived");
});

test("mergeSync adds new active", () => {
  const active = [{ name: "b", lastModified: "2026-10-02T00:00:00Z", artifacts: [{ id: "proposal", status: "done" }, { id: "design", status: "blocked" }, { id: "tasks", status: "blocked" }] }];
  const merged = mergeSync([], active, []);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].id, "b");
  assert.equal(merged[0].priority, 99);
});

test("extractProject extracts prefix before first digit segment", () => {
  assert.equal(extractProject("kanban-28-setup"), "kanban");
  assert.equal(extractProject("marketplace-plugin-03-icon"), "marketplace-plugin");
  assert.equal(extractProject("myfeat"), undefined);
});

test("mergeSync sets project on new entries", () => {
  const active = [{ name: "kanban-29-foo", lastModified: "2026-10-02T00:00:00Z", artifacts: [] }];
  const merged = mergeSync([], active, []);
  assert.equal(merged[0].project, "kanban");
});

test("mergeSync preserves user-set project on update", () => {
  const existing = [
    { id: "kanban-29-foo", title: "foo", lane: "In Progress", priority: 1, specPath: "x", summary: "", status: "old", createdAt: "2026-10-01", updatedAt: "2026-10-01", project: "my-override" } as any,
  ];
  const active = [{ name: "kanban-29-foo", lastModified: "2026-10-02T00:00:00Z", artifacts: [] }];
  const merged = mergeSync(existing, active, []);
  assert.equal(merged[0].project, "my-override");
});