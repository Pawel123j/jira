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

/**
 * Parse and validate every field used by the UI before replacing current data.
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

  const tasks = parseTasks(payload.tasks);
  const comments = parseComments(payload.comments === undefined ? {} : payload.comments);
  const audit = parseAudit(payload.audit === undefined ? [] : payload.audit);
  if (!tasks || !comments || !audit) return null;

  return {
    version: 1,
    exportedAt:
      typeof payload.exportedAt === "string"
        ? payload.exportedAt
        : new Date().toISOString(),
    tasks,
    comments,
    audit,
  };
}
