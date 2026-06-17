export type ThemeMode = "dark" | "light";

export type TaskStatus = "To do" | "In progress" | "Done";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface TeamMember {
  name: string;
  email: string;
  role: Role;
}

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignees: string[];
  due: string;
  tags: string[];
  subtasks: SubTask[];
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentItem {
  id: string;
  author: string;
  text: string;
  time: string;
}

export type AuditAction =
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_STATUS_CHANGED"
  | "TASK_SOFT_DELETED"
  | "TASK_RESTORED"
  | "TASK_DELETED"
  | "COMMENT_CREATED"
  | "DATA_IMPORTED";

export interface AuditItem {
  id: string;
  action: AuditAction;
  actor: string;
  detail?: string;
  time: string;
}

/** Shape of a task form used by both the create and edit panels. */
export interface TaskFormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due: string;
  assignees: string[];
  tags: string[];
}

export type AppView = "list" | "board" | "dashboard";

export interface FiltersState {
  search: string;
  status: TaskStatus | "ALL";
  priority: TaskPriority | "ALL";
  showDeleted: boolean;
}

/** Serializable snapshot used by JSON export/import. */
export interface ExportPayload {
  version: 1;
  exportedAt: string;
  tasks: Task[];
  comments: Record<string, CommentItem[]>;
  audit: AuditItem[];
}
