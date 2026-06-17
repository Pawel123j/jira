import { formatDue, isOverdue } from "../../lib/format";
import type { Task } from "../../types";
import { PriorityBadge, StatusBadge, Tag } from "../ui/Badge";

interface TaskCardProps {
  task: Task;
  selected: boolean;
  onSelect: (task: Task) => void;
}

export function TaskCard({ task, selected, onSelect }: TaskCardProps) {
  const overdue = isOverdue(task.due, task.status, task.deleted);

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(task)}
      className={`w-full rounded-3xl border p-4 text-left transition hover:border-violet-400 ${
        selected
          ? "border-violet-400 bg-white ring-1 ring-violet-300 dark:border-violet-500/50 dark:bg-slate-950 dark:ring-violet-500/50"
          : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60"
      } ${task.deleted ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="font-semibold">{task.title}</div>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <StatusBadge status={task.status} />
        <span>{task.assignees.join(", ") || "Brak przypisań"}</span>
      </div>

      {task.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {task.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className={overdue ? "font-semibold text-amber-600 dark:text-amber-400" : ""}>
          Termin: {formatDue(task.due)}
          {overdue && " ⚠"}
        </span>
        {task.deleted && <span className="font-semibold text-red-500">soft deleted</span>}
      </div>
    </button>
  );
}
