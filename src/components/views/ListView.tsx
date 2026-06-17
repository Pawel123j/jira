import { useEffect, useState } from "react";
import type {
  CommentItem,
  FiltersState,
  Task,
  TaskFormState,
} from "../../types";
import { CreateTaskPanel } from "../tasks/CreateTaskPanel";
import { TaskCard } from "../tasks/TaskCard";
import { TaskDetailsPanel } from "../tasks/TaskDetailsPanel";
import { TaskFilters } from "../tasks/TaskFilters";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";

const PAGE_SIZE = 8;

interface ListViewProps {
  filters: FiltersState;
  onFilterChange: (patch: Partial<FiltersState>) => void;
  onResetFilters: () => void;
  tasks: Task[];
  selectedTaskId: string | null;
  onSelectTask: (task: Task) => void;
  selectedTask: Task | null;
  comments: CommentItem[];
  onCreate: (form: TaskFormState) => boolean;
  onSave: (id: string, form: TaskFormState) => boolean;
  onToggleDelete: (id: string) => void;
  onHardDelete: (id: string) => void;
  onAddComment: (text: string) => boolean;
}

export function ListView({
  filters,
  onFilterChange,
  onResetFilters,
  tasks,
  selectedTaskId,
  onSelectTask,
  selectedTask,
  comments,
  onCreate,
  onSave,
  onToggleDelete,
  onHardDelete,
  onAddComment,
}: ListViewProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination whenever the filtered result set changes size.
  useEffect(() => setVisibleCount(PAGE_SIZE), [tasks.length]);

  const shownTasks = tasks.slice(0, visibleCount);
  const remaining = tasks.length - shownTasks.length;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/20">
        <h2 className="text-xl font-bold">Zadania</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Filtruj listę i kliknij zadanie, aby je edytować.
        </p>

        <div className="mt-5">
          <TaskFilters
            filters={filters}
            onChange={onFilterChange}
            onReset={onResetFilters}
            resultCount={tasks.length}
          />
        </div>

        <div className="mt-5 space-y-3">
          {shownTasks.length > 0 ? (
            shownTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                selected={selectedTaskId === task.id}
                onSelect={onSelectTask}
              />
            ))
          ) : (
            <EmptyState
              icon="🔍"
              title="Brak wyników"
              description="Żadne zadanie nie pasuje do filtrów. Zmień kryteria lub wyczyść filtry."
            />
          )}

          {remaining > 0 && (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              Pokaż więcej ({remaining})
            </Button>
          )}
        </div>
      </section>

      <CreateTaskPanel onSubmit={onCreate} />

      {selectedTask ? (
        <TaskDetailsPanel
          key={selectedTask.id}
          task={selectedTask}
          comments={comments}
          onSave={onSave}
          onToggleDelete={onToggleDelete}
          onHardDelete={onHardDelete}
          onAddComment={onAddComment}
        />
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/20">
          <EmptyState
            icon="🗂️"
            title="Nie wybrano zadania"
            description="Wybierz zadanie z listy, aby zobaczyć szczegóły i komentarze."
          />
        </section>
      )}
    </div>
  );
}
