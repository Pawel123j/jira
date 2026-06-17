import { useState } from "react";
import { formatDue, isOverdue } from "../../lib/format";
import type { CommentItem, Task, TaskFormState } from "../../types";
import { Button } from "../ui/Button";
import { Comments } from "./Comments";
import { TaskForm } from "./TaskForm";

interface TaskDetailsPanelProps {
  task: Task;
  comments: CommentItem[];
  /** Returns true when the task was saved. */
  onSave: (id: string, form: TaskFormState) => boolean;
  onToggleDelete: (id: string) => void;
  onAddComment: (text: string) => boolean;
}

function formFromTask(task: Task): TaskFormState {
  return {
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due: task.due,
    assignees: task.assignees,
    tags: task.tags,
  };
}

/**
 * Editor for the selected task. The parent remounts this via `key={task.id}`,
 * so the local edit form always initialises from the freshly selected task.
 */
export function TaskDetailsPanel({
  task,
  comments,
  onSave,
  onToggleDelete,
  onAddComment,
}: TaskDetailsPanelProps) {
  const [form, setForm] = useState<TaskFormState>(() => formFromTask(task));
  const [showErrors, setShowErrors] = useState(false);

  const titleError =
    showErrors && !form.title.trim() ? "Tytuł nie może być pusty." : undefined;
  const overdue = isOverdue(task.due, task.status, task.deleted);

  const patch = (partial: Partial<TaskFormState>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const handleSave = () => {
    if (!form.title.trim()) {
      setShowErrors(true);
      return;
    }
    onSave(task.id, form);
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Szczegóły taska</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Utworzono: {formatDue(task.createdAt)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {task.deleted && (
            <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-500">
              soft deleted
            </span>
          )}
          {overdue && (
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              po terminie
            </span>
          )}
        </div>
      </div>

      <div className="mt-5">
        <TaskForm
          idPrefix="edit"
          value={form}
          onChange={patch}
          titleError={titleError}
        />

        <div className="mt-4 grid gap-3">
          <Button variant="primary" fullWidth onClick={handleSave}>
            Zapisz task
          </Button>
          <Button variant="danger" fullWidth onClick={() => onToggleDelete(task.id)}>
            {task.deleted ? "Przywróć task" : "Soft delete"}
          </Button>
        </div>

        <div className="mt-5">
          <Comments comments={comments} onAdd={onAddComment} />
        </div>
      </div>
    </section>
  );
}
