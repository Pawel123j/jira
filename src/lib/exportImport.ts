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

const record = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const string = (v: unknown): v is string => typeof v === "string";
const strings = (v: unknown) => Array.isArray(v) && v.every(string);
const uniqueIds = (items: unknown[]) => items.every(v => record(v) && string(v.id) && v.id.length > 0) && new Set(items.map(v => (v as Record<string, unknown>).id)).size === items.length;
const date = (v: unknown) => string(v) && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
const instant = (v: unknown) => string(v) && Number.isFinite(Date.parse(v)) && date(v.slice(0, 10));

/** Shared validation for imports, current snapshots and legacy storage migration. */
export function parseImport(text: string): ExportPayload | null {
  try {
    const payload: unknown = JSON.parse(text);
    if (!record(payload) || (payload.version !== undefined && payload.version !== 1) || !Array.isArray(payload.tasks) || !uniqueIds(payload.tasks)) return null;
    const tasks = payload.tasks.map(value => record(value) ? { ...value, points: value.points ?? 0, subtasks: value.subtasks ?? [] } : value);
    for (const task of tasks) {
      if (!record(task) || !string(task.title) || !task.title.trim() || !string(task.description) || !["To do", "In progress", "Done"].includes(String(task.status)) || !["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(String(task.priority)) || !strings(task.assignees) || !strings(task.tags) || !(task.due === "" || date(task.due) || instant(task.due)) || typeof task.deleted !== "boolean" || !instant(task.createdAt) || !instant(task.updatedAt) || typeof task.points !== "number" || !Number.isFinite(task.points) || task.points < 0 || !Array.isArray(task.subtasks) || !uniqueIds(task.subtasks) || !task.subtasks.every(s => record(s) && string(s.title) && typeof s.done === "boolean")) return null;
    }
    const comments = payload.comments ?? {};
    const audit = payload.audit ?? [];
    if (!record(comments) || !Array.isArray(audit) || !uniqueIds(audit)) return null;
    for (const [taskId, entries] of Object.entries(comments)) {
      if (!tasks.some(t => t.id === taskId) || !Array.isArray(entries) || !uniqueIds(entries) || !entries.every(e => record(e) && [e.author, e.text, e.time].every(string))) return null;
    }
    const actions = ["TASK_CREATED", "TASK_UPDATED", "TASK_STATUS_CHANGED", "TASK_SOFT_DELETED", "TASK_RESTORED", "TASK_DELETED", "COMMENT_CREATED", "DATA_IMPORTED"];
    if (!audit.every(e => record(e) && actions.includes(String(e.action)) && [e.actor, e.time].every(string) && (e.detail === undefined || string(e.detail)))) return null;
    return { version: 1, exportedAt: string(payload.exportedAt) ? payload.exportedAt : new Date().toISOString(), tasks, comments, audit } as ExportPayload;
  } catch { return null; }
}
