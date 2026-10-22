import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { KanbanEntry } from "./types.js";
import { renderKanbanMarkdown } from "./render.js";

const yamlPath = join(process.cwd(), "docs", "kanban.yaml");
let entries: KanbanEntry[];
try {
  const text = readFileSync(yamlPath, "utf8");
  const data = parse(text) as { entries?: KanbanEntry[] } | KanbanEntry[];
  entries = Array.isArray(data) ? data : (data.entries ?? []);
} catch {
  process.stderr.write(`Error: could not read ${yamlPath}\n`);
  process.exit(1);
}

process.stdout.write(renderKanbanMarkdown(entries) + "\n");
