import type { AuditItem, CommentItem, SubTask, Task } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 &&
    !Object.prototype.hasOwnProperty.call(Object.prototype, value);
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isSubtask(value: unknown): value is SubTask {
  return isRecord(value) && isId(value.id) && typeof value.title === "string" &&
    typeof value.done === "boolean";
}

/** Only the two documented legacy fields may be missing; wrong types are invalid. */
export function parseTasks(value: unknown): Task[] | null {
  if (!Array.isArray(value)) return null;
  const tasks: Task[] = [];
  const ids = new Set<string>();
  for (const item of value) {
    if (!isRecord(item) || !isId(item.id) || ids.has(item.id) ||
        typeof item.title !== "string" || typeof item.description !== "string" ||
        typeof item.status !== "string" || !["To do", "In progress", "Done"].includes(item.status) ||
        typeof item.priority !== "string" || !["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(item.priority) ||
        typeof item.due !== "string" || !isStringList(item.assignees) ||
        !isStringList(item.tags) || typeof item.deleted !== "boolean" ||
        typeof item.createdAt !== "string" || typeof item.updatedAt !== "string") {
      return null;
    }
    if (item.points !== undefined && (typeof item.points !== "number" ||
        !Number.isFinite(item.points) || item.points < 0)) return null;
    if (item.subtasks !== undefined && (!Array.isArray(item.subtasks) ||
        !item.subtasks.every(isSubtask) ||
        new Set(item.subtasks.map((sub) => sub.id)).size !== item.subtasks.length)) return null;
    ids.add(item.id);
    tasks.push({ ...item, points: item.points ?? 0, subtasks: item.subtasks ?? [] } as Task);
  }
  return tasks;
}

export function parseComments(value: unknown): Record<string, CommentItem[]> | null {
  if (!isRecord(value)) return null;
  for (const [taskId, comments] of Object.entries(value)) {
    if (!isId(taskId) || !Array.isArray(comments)) return null;
    const ids = new Set<string>();
    for (const comment of comments) {
      if (!isRecord(comment) || !isId(comment.id) || ids.has(comment.id) ||
          typeof comment.author !== "string" || typeof comment.text !== "string" ||
          typeof comment.time !== "string") return null;
      ids.add(comment.id);
    }
  }
  return value as Record<string, CommentItem[]>;
}

const auditActions = new Set([
  "TASK_CREATED", "TASK_UPDATED", "TASK_STATUS_CHANGED", "TASK_SOFT_DELETED",
  "TASK_RESTORED", "TASK_DELETED", "COMMENT_CREATED", "DATA_IMPORTED",
]);

export function parseAudit(value: unknown): AuditItem[] | null {
  if (!Array.isArray(value)) return null;
  const ids = new Set<string>();
  for (const item of value) {
    if (!isRecord(item) || !isId(item.id) || ids.has(item.id) ||
        typeof item.action !== "string" || !auditActions.has(item.action) ||
        typeof item.actor !== "string" || typeof item.time !== "string" ||
        (item.detail !== undefined && typeof item.detail !== "string")) return null;
    ids.add(item.id);
  }
  return value as AuditItem[];
}
