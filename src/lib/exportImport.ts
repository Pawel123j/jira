import type {
  AuditItem,
  CommentItem,
  ExportPayload,
  Task,
} from "../types";
import { parseAudit, parseComments, parseTasks } from "./stateValidation";

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

/** Validate the entire snapshot before previewing or persisting it. */
export function parseImport(text: string): ExportPayload | null {
  try {
    const data: unknown = JSON.parse(text);
    if (typeof data !== "object" || data === null || Array.isArray(data)) return null;
    const payload = data as Record<string, unknown>;
    if (payload.version !== undefined && payload.version !== 1) return null;
    const tasks = parseTasks(payload.tasks);
    const comments = parseComments(payload.comments === undefined ? {} : payload.comments);
    const audit = parseAudit(payload.audit === undefined ? [] : payload.audit);
    if (!tasks || !comments || !audit) return null;
    const taskIds = new Set(tasks.map(task => task.id));
    if (Object.keys(comments).some(id => !taskIds.has(id))) return null;
    return {
      version: 1,
      exportedAt: typeof payload.exportedAt === "string" ? payload.exportedAt : new Date().toISOString(),
      tasks,
      comments,
      audit,
    };
  } catch {
    return null;
  }
}
