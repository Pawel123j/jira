import type {
  AuditItem,
  CommentItem,
  ExportPayload,
  Task,
} from "../types";

/** Assemble a serializable snapshot of the current state. */
export function buildExport(
  tasks: Task[],
  comments: Record<string, CommentItem[]>,
  audit: AuditItem[],
): ExportPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
    comments,
    audit,
  };
}

/** Trigger a browser download of the snapshot as a JSON file. */
export function downloadJson(payload: ExportPayload): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `mini-jira-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function isTaskLike(value: unknown): value is Task {
  if (typeof value !== "object" || value === null) return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.status === "string" &&
    typeof task.priority === "string"
  );
}

/**
 * Parse and minimally validate an imported JSON string.
 * Returns a normalized payload, or null when the file is not recognisable.
 */
export function parseImport(text: string): ExportPayload | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }

  if (typeof data !== "object" || data === null) return null;
  const payload = data as Record<string, unknown>;

  if (!Array.isArray(payload.tasks)) return null;
  if (!payload.tasks.every(isTaskLike)) return null;

  const comments =
    typeof payload.comments === "object" && payload.comments !== null
      ? (payload.comments as Record<string, CommentItem[]>)
      : {};
  const audit = Array.isArray(payload.audit)
    ? (payload.audit as AuditItem[])
    : [];

  return {
    version: 1,
    exportedAt:
      typeof payload.exportedAt === "string"
        ? payload.exportedAt
        : new Date().toISOString(),
    tasks: payload.tasks as Task[],
    comments,
    audit,
  };
}
