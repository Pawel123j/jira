import type { Task, TaskPriority } from "../types";

export type SortKey = "manual" | "priority" | "due" | "updated" | "title";

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "manual", label: "Domyślnie" },
  { value: "priority", label: "Priorytet (malejąco)" },
  { value: "due", label: "Termin (najbliższy)" },
  { value: "updated", label: "Ostatnio zmienione" },
  { value: "title", label: "Tytuł (A→Z)" },
];

const priorityRank: Record<TaskPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

/** Numeric time for sorting; invalid/empty values sort last. */
function timeValue(value: string): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? Number.POSITIVE_INFINITY : time;
}

/**
 * Returns a new, sorted array. `manual` preserves the original order
 * (e.g. the order set by Kanban drag & drop).
 */
export function sortTasks(tasks: Task[], key: SortKey): Task[] {
  if (key === "manual") return tasks;
  const copy = [...tasks];
  switch (key) {
    case "priority":
      copy.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
      break;
    case "due":
      copy.sort((a, b) => timeValue(a.due) - timeValue(b.due));
      break;
    case "updated":
      copy.sort((a, b) => {
        const at = timeValue(a.updatedAt);
        const bt = timeValue(b.updatedAt);
        if (at === bt) return 0;
        return bt - at; // most recently updated first
      });
      break;
    case "title":
      copy.sort((a, b) => a.title.localeCompare(b.title, "pl"));
      break;
  }
  return copy;
}
