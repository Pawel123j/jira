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
  const subtasksTotal = task.subtasks.length;
  const subtasksDone = task.subtasks.filter((sub) => sub.done).length;
  const subtasksComplete = subtasksTotal > 0 && subtasksDone === subtasksTotal;

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
        {task.points > 0 && (
          <span
            title="Story points"
            className="inline-flex items-center rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-bold text-violet-600 dark:text-violet-400"
          >
            {task.points} pkt
          </span>
        )}
        {subtasksTotal > 0 && (
          <span
            title="Podzadania"
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              subtasksComplete
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            ☑ {subtasksDone}/{subtasksTotal}
          </span>
        )}
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
