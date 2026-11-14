export type KanbanLane =
  | "Not Started"
  | "In Progress"
  | "Archived";

export interface KanbanEntry {
  id: string;
  title: string;
  lane: KanbanLane | string;
  priority: number;
  specPath: string;
  summary: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  archivedAt?: string;
  githubIssue?: number;
  tags?: string[];
  assignee?: string;
  notes?: string;
  project?: string;
}

export const LANES: KanbanLane[] = [
  "Not Started",
  "In Progress",
  "Archived",
];

export const OPTIONAL_FIELDS = [
  "completedAt",
  "archivedAt",
  "githubIssue",
  "tags",
  "assignee",
  "notes",
  "project",
] as const;