import type { Task } from "../types";

export interface PointsSummary {
  total: number;
  done: number;
  remaining: number;
  pct: number;
}

/**
 * Sums story points across non-deleted tasks. `done` counts points on tasks
 * with status "Done"; `pct` is the share of completed points.
 */
export function pointsSummary(tasks: Task[]): PointsSummary {
  const active = tasks.filter((task) => !task.deleted);
  const total = active.reduce((sum, task) => sum + (task.points || 0), 0);
  const done = active
    .filter((task) => task.status === "Done")
    .reduce((sum, task) => sum + (task.points || 0), 0);
  const remaining = total - done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { total, done, remaining, pct };
}
