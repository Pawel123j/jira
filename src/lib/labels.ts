import type { AuditAction, Role } from "../types";

/** Polish labels for audit log actions. */
export const auditActionLabels: Record<AuditAction, string> = {
  TASK_CREATED: "Utworzono task",
  TASK_UPDATED: "Zaktualizowano task",
  TASK_STATUS_CHANGED: "Zmieniono status",
  TASK_SOFT_DELETED: "Soft delete",
  TASK_RESTORED: "Przywrócono task",
  TASK_DELETED: "Usunięto trwale",
  COMMENT_CREATED: "Dodano komentarz",
  DATA_IMPORTED: "Zaimportowano dane",
};

/** Polish labels for roles. */
export const roleLabels: Record<Role, string> = {
  OWNER: "Właściciel",
  ADMIN: "Administrator",
  MEMBER: "Członek",
  VIEWER: "Obserwator",
};
