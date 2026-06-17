import { useState } from "react";
import type { SubTask } from "../../types";
import { Button } from "../ui/Button";
import { inputClasses } from "../ui/Field";

interface SubtasksProps {
  subtasks: SubTask[];
  onAdd: (title: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function Subtasks({ subtasks, onAdd, onToggle, onRemove }: SubtasksProps) {
  const [title, setTitle] = useState("");
  const done = subtasks.filter((sub) => sub.done).length;
  const total = subtasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Podzadania</h3>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {done}/{total}
        </span>
      </div>

      {total > 0 && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {subtasks.map((sub) => (
          <li
            key={sub.id}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
          >
            <input
              type="checkbox"
              checked={sub.done}
              onChange={() => onToggle(sub.id)}
              className="h-4 w-4 shrink-0 accent-emerald-600"
              aria-label={`Oznacz „${sub.title}” jako ${sub.done ? "niezrobione" : "zrobione"}`}
            />
            <span
              className={`flex-1 text-sm ${
                sub.done
                  ? "text-slate-400 line-through dark:text-slate-500"
                  : ""
              }`}
            >
              {sub.title}
            </span>
            <button
              type="button"
              onClick={() => onRemove(sub.id)}
              aria-label={`Usuń podzadanie „${sub.title}”`}
              className="rounded-lg px-2 py-0.5 text-slate-400 transition hover:bg-slate-200/60 hover:text-red-500 dark:hover:bg-slate-700/60"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex gap-2">
        <label htmlFor="new-subtask" className="sr-only">
          Nowe podzadanie
        </label>
        <input
          id="new-subtask"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          className={inputClasses}
          placeholder="Dodaj podzadanie i naciśnij Enter"
        />
        <Button variant="secondary" onClick={handleAdd} disabled={!title.trim()}>
          Dodaj
        </Button>
      </div>
    </div>
  );
}
