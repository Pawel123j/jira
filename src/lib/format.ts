/**
 * Formatting helpers for dates used across the app.
 */

const dateTimeFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Human-friendly due date, or "brak" when empty. */
export function formatDue(value: string): string {
  if (!value) return "brak";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateTimeFormatter.format(date);
}

/** Current wall-clock time as HH:MM in Polish locale. */
export function nowTime(): string {
  return new Date().toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Current timestamp suitable for storing on a task. */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * True when the task has a due date in the past and is not done/deleted.
 * Used to surface overdue work in the UI and dashboard.
 */
export function isOverdue(due: string, status: string, deleted: boolean): boolean {
  if (!due || deleted || status === "Done") return false;
  const date = new Date(due);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}

/** Generate a reasonably unique id without external deps. */
export function makeId(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
