import { useState } from "react";
import { emptyTaskForm } from "../../data/seed";
import type { TaskFormState } from "../../types";
import { Button } from "../ui/Button";
import { TaskForm } from "./TaskForm";

interface CreateTaskPanelProps {
  /** Returns true when the task was created so the form can reset. */
  onSubmit: (form: TaskFormState) => boolean;
}

export function CreateTaskPanel({ onSubmit }: CreateTaskPanelProps) {
  const [form, setForm] = useState<TaskFormState>(emptyTaskForm);
  const [showErrors, setShowErrors] = useState(false);

  const titleError =
    showErrors && !form.title.trim() ? "Tytuł jest wymagany." : undefined;

  const patch = (partial: Partial<TaskFormState>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const handleSubmit = () => {
    if (!form.title.trim()) {
      setShowErrors(true);
      return;
    }
    if (onSubmit(form)) {
      setForm(emptyTaskForm);
      setShowErrors(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/20">
      <h2 className="text-xl font-bold">Dodaj task</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Wypełnij formularz, aby dodać nowe zadanie do listy.
      </p>

      <div className="mt-5">
        <TaskForm
          idPrefix="create"
          value={form}
          onChange={patch}
          titleError={titleError}
        />
        <Button
          variant="primary"
          fullWidth
          onClick={handleSubmit}
          className="mt-4"
        >
          Dodaj task
        </Button>
      </div>
    </section>
  );
}
