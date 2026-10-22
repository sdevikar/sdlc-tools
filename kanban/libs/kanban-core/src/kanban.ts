import { readFile, writeFile } from "node:fs/promises";
import { parse, stringify } from "yaml";
import type { KanbanEntry } from "./types.js";

export async function readKanban(path: string): Promise<KanbanEntry[]> {
  const text = await readFile(path, "utf8");
  const data = parse(text);
  if (Array.isArray(data)) return data as KanbanEntry[];
  if (data && Array.isArray((data as { entries?: KanbanEntry[] }).entries)) {
    return (data as { entries: KanbanEntry[] }).entries;
  }
  return [];
}

export async function writeKanban(path: string, items: KanbanEntry[]): Promise<void> {
  const content = stringify({ entries: items });
  await writeFile(path, content, "utf8");
}

export { type KanbanEntry, type KanbanLane } from "./types.js";