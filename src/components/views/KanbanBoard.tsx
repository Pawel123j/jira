import { useState } from "react";
import { statusOptions } from "../../data/seed";
import { statusAccentClasses } from "../../lib/badges";
import { isOverdue } from "../../lib/format";
import type { Task, TaskStatus } from "../../types";
import { TaskCard } from "../tasks/TaskCard";

interface KanbanBoardProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (task: Task) => void;
  onMoveTask: (
    draggedId: string,
    status: TaskStatus,
    beforeId: string | null,
  ) => void;
}

function groupByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const grouped: Record<TaskStatus, Task[]> = {
    "To do": [],
    "In progress": [],
    Done: [],
  };
  for (const task of tasks) grouped[task.status].push(task);
  return grouped;
}

export function KanbanBoard({
  tasks,
  selectedTaskId,
  onSelectTask,
  onMoveTask,
}: KanbanBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);
  const grouped = groupByStatus(tasks);

  const reset = () => {
    setDraggingId(null);
    setOverStatus(null);
  };

  const move = (status: TaskStatus, beforeId: string | null) => {
    if (draggingId) onMoveTask(draggingId, status, beforeId);
    reset();
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {statusOptions.map((status) => {
        const overdueCount = grouped[status].filter((task) =>
          isOverdue(task.due, task.status, task.deleted),
        ).length;

        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStatus(status);
            }}
            onDragLeave={() =>
              setOverStatus((current) => (current === status ? null : current))
            }
            onDrop={() => move(status, null)}
            className={`rounded-3xl border p-4 transition ${
              overStatus === status
                ? "border-violet-400 bg-violet-500/5 ring-1 ring-violet-300 dark:ring-violet-500/40"
                : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/80"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${statusAccentClasses[status]}`}
                  aria-hidden="true"
                />
                <h3 className="font-bold">{status}</h3>
              </div>
              <div className="flex items-center gap-2">
                {overdueCount > 0 && (
                  <span
                    title="Zadania po terminie"
                    className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400"
                  >
                    {overdueCount} ⚠
                  </span>
                )}
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {grouped[status].length}
                </span>
              </div>
            </div>

            <div className="min-h-[120px] space-y-3">
              {grouped[status].length > 0 ? (
                grouped[status].map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggingId(task.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={reset}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setOverStatus(status);
                    }}
                    onDrop={(e) => {
                      e.stopPropagation();
                      move(status, task.id);
                    }}
                    className={`cursor-grab active:cursor-grabbing ${
                      draggingId === task.id ? "opacity-50" : ""
                    }`}
                  >
                    <TaskCard
                      task={task}
                      selected={selectedTaskId === task.id}
                      onSelect={onSelectTask}
                    />
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500">
                  Przeciągnij tu zadanie
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
