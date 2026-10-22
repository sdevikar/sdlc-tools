import { readFile, writeFile } from "node:fs/promises";
import type { KanbanEntry, KanbanLane } from "./types.js";
import { LANES } from "./types.js";

const FIELD_MAP: Record<string, keyof KanbanEntry> = {
  priority: "priority",
  status: "status",
  spec: "specPath",
  summary: "summary",
  created: "createdAt",
  updated: "updatedAt",
  completed: "completedAt",
  archived: "archivedAt",
  githubissue: "githubIssue",
  "github-issue": "githubIssue",
  tags: "tags",
  assignee: "assignee",
  notes: "notes",
  title: "title",
};

const SERIALIZE_KEY: Partial<Record<keyof KanbanEntry, string>> = {
  priority: "priority",
  status: "status",
  specPath: "spec",
  summary: "summary",
  createdAt: "created",
  updatedAt: "updated",
  completedAt: "completed",
  archivedAt: "archived",
  githubIssue: "githubIssue",
  tags: "tags",
  assignee: "assignee",
  notes: "notes",
};

const ORDERED_FIELDS: (keyof KanbanEntry)[] = [
  "priority",
  "status",
  "specPath",
  "summary",
  "createdAt",
  "updatedAt",
  "completedAt",
  "archivedAt",
  "githubIssue",
  "tags",
  "assignee",
  "notes",
];

function coerce(key: keyof KanbanEntry, value: string): KanbanEntry[keyof KanbanEntry] {
  if (key === "priority") {
    const n = Number(value);
    return Number.isNaN(n) ? 99 : n;
  }
  if (key === "githubIssue") {
    const n = Number(value);
    return Number.isNaN(n) ? undefined : n;
  }
  if (key === "tags") {
    return value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return value;
}

export async function readKanban(path: string): Promise<KanbanEntry[]> {
  const text = await readFile(path, "utf8");
  const entries: KanbanEntry[] = [];
  let lane: string = "Not Started";
  let current: Partial<KanbanEntry> | null = null;

  const flush = () => {
    if (!current || !current.id) return;
    const entry: KanbanEntry = {
      id: current.id,
      title: current.title ?? current.id,
      lane: current.lane ?? lane,
      priority: current.priority ?? 99,
      specPath: current.specPath ?? "",
      summary: current.summary ?? "",
      status: current.status ?? "",
      createdAt: current.createdAt ?? "",
      updatedAt: current.updatedAt ?? "",
    };
    for (const k of ["completedAt", "archivedAt", "githubIssue", "tags", "assignee", "notes"] as const) {
      if (current[k] !== undefined) (entry as unknown as Record<string, unknown>)[k] = current[k];
    }
    entries.push(entry);
    current = null;
  };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (line.startsWith("## ")) {
      flush();
      lane = line.slice(3).trim();
      continue;
    }
    if (line.startsWith("### ")) {
      flush();
      current = { id: line.slice(4).trim(), lane };
      continue;
    }
    const m = line.match(/^- \*\*(.+?)\*\*:\s*(.*)$/);
    if (m && current) {
      const rawKey = m[1].trim().toLowerCase().replace(/\s+/g, "");
      const value = m[2].trim();
      const field = FIELD_MAP[rawKey] ?? FIELD_MAP[rawKey.toLowerCase()];
      if (field) {
        (current as Record<string, unknown>)[field] = coerce(field, value);
      }
    }
  }
  flush();
  return entries;
}

export async function writeKanban(path: string, items: KanbanEntry[]): Promise<void> {
  const byLane = new Map<string, KanbanEntry[]>();
  for (const item of items) {
    const l = String(item.lane);
    if (!byLane.has(l)) byLane.set(l, []);
    byLane.get(l)!.push(item);
  }

  const laneOrder = [...LANES, ...[...byLane.keys()].filter((l) => !LANES.includes(l as KanbanLane))];
  const sections: string[] = [];

  for (const lane of laneOrder) {
    const laneItems = byLane.get(lane);
    if (!laneItems || laneItems.length === 0) continue;
    const cards = laneItems.map((item) => {
      const lines: string[] = [`### ${item.id}`];
      for (const field of ORDERED_FIELDS) {
        const val = item[field];
        if (val === undefined || val === null) continue;
        if (Array.isArray(val) && val.length === 0) continue;
        const key = SERIALIZE_KEY[field];
        if (!key) continue;
        const str = Array.isArray(val) ? val.join(", ") : String(val);
        lines.push(`- **${key}**: ${str}`);
      }
      return lines.join("\n");
    });
    sections.push(`## ${lane}\n\n${cards.join("\n\n")}`);
  }

  const header = [
    "<!-- kanban.md — auto-synced by opencode-openspec-kanban plugin -->",
    "<!-- Manual edits to descriptions, priorities, and notes are preserved. -->",
    "<!-- Lane moves are respected. Auto-sync only adds/removes/updates status. -->",
    "",
    "# Kanban Board",
    "",
  ].join("\n");

  const body = sections.join("\n\n");
  const content = header + (body ? body + "\n" : "");
  await writeFile(path, content, "utf8");
}

export { type KanbanEntry, type KanbanLane } from "./types.js";