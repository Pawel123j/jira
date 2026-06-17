import { useState } from "react";
import { statusOptions } from "../../data/seed";
import { statusAccentClasses } from "../../lib/badges";
import type { Task, TaskStatus } from "../../types";
import { TaskCard } from "../tasks/TaskCard";

interface KanbanBoardProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (task: Task) => void;
  onChangeStatus: (id: string, status: TaskStatus) => void;
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
  onChangeStatus,
}: KanbanBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);
  const grouped = groupByStatus(tasks);

  const handleDrop = (status: TaskStatus) => {
    if (draggingId) onChangeStatus(draggingId, status);
    setDraggingId(null);
    setOverStatus(null);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {statusOptions.map((status) => (
        <div
          key={status}
          onDragOver={(e) => {
            e.preventDefault();
            setOverStatus(status);
          }}
          onDragLeave={() =>
            setOverStatus((current) => (current === status ? null : current))
          }
          onDrop={() => handleDrop(status)}
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
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {grouped[status].length}
            </span>
          </div>

          <div className="min-h-[120px] space-y-3">
            {grouped[status].length > 0 ? (
              grouped[status].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDraggingId(task.id)}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setOverStatus(null);
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
      ))}
    </div>
  );
}
