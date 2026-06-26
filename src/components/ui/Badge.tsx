import { priorityBadgeClasses, statusBadgeClasses } from "../../lib/badges";
import type { TaskPriority, TaskStatus } from "../../types";

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-extrabold ${priorityBadgeClasses[priority]}`}
    >
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses[status]}`}
    >
      {status}
    </span>
  );
}

export function Tag({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-slate-300 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-300">
      {children}
    </span>
  );
}
