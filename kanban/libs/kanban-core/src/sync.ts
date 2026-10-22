import { execFileSync } from "node:child_process";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { KanbanEntry } from "./types.js";
import { readKanban, writeKanban } from "./kanban.js";

export interface SyncActiveChange {
  name: string;
  lastModified: string;
  artifacts: { id: string; status: string }[];
}

export interface SyncArchivedChange {
  name: string;
  dirName: string;
  lastModified?: string;
}

function artifactStatus(artifacts: { id: string; status: string }[], id: string): string {
  return artifacts.find((a) => a.id === id)?.status ?? "blocked";
}

export function mapLane(active: SyncActiveChange): string {
  const tasks = artifactStatus(active.artifacts, "tasks");
  const design = artifactStatus(active.artifacts, "design");
  if (tasks === "done" || tasks === "ready") return "Ready";
  if (design === "done") return "In Progress";
  return "Not Started";
}

export function mapStatus(active: SyncActiveChange): string {
  const tasks = artifactStatus(active.artifacts, "tasks");
  const design = artifactStatus(active.artifacts, "design");
  const proposal = artifactStatus(active.artifacts, "proposal");
  if (tasks === "done") return "tasks ready";
  if (design === "done") return "design in progress";
  if (proposal === "done") return "proposal written";
  return "no proposal";
}

export function mergeSync(
  existing: KanbanEntry[],
  active: SyncActiveChange[],
  archived: SyncArchivedChange[]
): KanbanEntry[] {
  const byId = new Map(existing.map((e) => [e.id, { ...e }]));
  const dateOnly = (s?: string) => (s ? s.slice(0, 10) : new Date().toISOString().slice(0, 10));

  for (const a of active) {
    const prev = byId.get(a.name);
    const lane = prev ? prev.lane : mapLane(a);
    const entry: KanbanEntry = {
      id: a.name,
      title: prev?.title ?? a.name,
      lane,
      priority: prev?.priority ?? 99,
      specPath: `openspec/changes/${a.name}/`,
      summary: prev?.summary ?? "",
      status: mapStatus(a),
      createdAt: prev?.createdAt ?? dateOnly(a.lastModified),
      updatedAt: dateOnly(a.lastModified),
    };
    if (prev) {
      if (prev.notes !== undefined) entry.notes = prev.notes;
      if (prev.tags !== undefined) entry.tags = prev.tags;
      if (prev.assignee !== undefined) entry.assignee = prev.assignee;
      if (prev.githubIssue !== undefined) entry.githubIssue = prev.githubIssue;
    }
    byId.set(a.name, entry);
  }

  for (const ar of archived) {
    const prev = byId.get(ar.name);
    const d = dateOnly(ar.lastModified);
    const entry: KanbanEntry = {
      id: ar.name,
      title: prev?.title ?? ar.name,
      lane: "Archived",
      priority: prev?.priority ?? 99,
      specPath: `openspec/changes/archive/${ar.dirName}/`,
      summary: prev?.summary ?? "",
      status: "archived",
      createdAt: prev?.createdAt ?? d,
      updatedAt: d,
      archivedAt: prev?.archivedAt ?? d,
      completedAt: prev?.completedAt ?? d,
    };
    if (prev) {
      if (prev.notes !== undefined) entry.notes = prev.notes;
      if (prev.tags !== undefined) entry.tags = prev.tags;
      if (prev.assignee !== undefined) entry.assignee = prev.assignee;
      if (prev.githubIssue !== undefined) entry.githubIssue = prev.githubIssue;
    }
    byId.set(ar.name, entry);
  }

  return [...byId.values()];
}

export async function syncFromOpenSpec(
  openspecPath: string,
  kanbanPath: string,
  runner?: (cmd: string, args: string[], cwd: string) => string
): Promise<void> {
  const run = runner ?? ((cmd, args, cwd) => execFileSync(cmd, args, { cwd, encoding: "utf8" }));
  const listRaw = run("openspec", ["list", "--json"], openspecPath);
  const list = JSON.parse(listRaw) as { changes: { name: string; lastModified: string }[] };
  const active: SyncActiveChange[] = list.changes.map((c) => {
    const statusRaw = run("openspec", ["status", "--change", c.name, "--json"], openspecPath);
    const st = JSON.parse(statusRaw) as { artifacts: { id: string; status: string }[] };
    return { name: c.name, lastModified: c.lastModified, artifacts: st.artifacts ?? [] };
  });

  const archiveDir = join(openspecPath, "openspec", "changes", "archive");
  const archived: SyncArchivedChange[] = [];
  if (existsSync(archiveDir)) {
    for (const dir of readdirSync(archiveDir)) {
      const m = dir.match(/^\d{4}-\d{2}-\d{2}-(.+)$/);
      const name = m ? m[1] : dir;
      archived.push({ name, dirName: dir });
    }
  }

  let current: KanbanEntry[] = [];
  try {
    current = await readKanban(kanbanPath);
  } catch {
    current = [];
  }
  const merged = mergeSync(current, active, archived);
  await writeKanban(kanbanPath, merged);
}