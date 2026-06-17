import { priorityOptions, statusOptions } from "../../data/seed";
import type { FiltersState } from "../../types";
import { Button } from "../ui/Button";
import { inputClasses } from "../ui/Field";

interface TaskFiltersProps {
  filters: FiltersState;
  onChange: (patch: Partial<FiltersState>) => void;
  onReset: () => void;
  resultCount: number;
}

export function TaskFilters({
  filters,
  onChange,
  onReset,
  resultCount,
}: TaskFiltersProps) {
  return (
    <div className="grid gap-3">
      <label htmlFor="filter-search" className="sr-only">
        Szukaj zadań
      </label>
      <input
        id="filter-search"
        type="search"
        value={filters.search}
        onChange={(e) => onChange({ search: e.target.value })}
        className={inputClasses}
        placeholder="Szukaj po tytule, opisie, tagu lub osobie"
      />

      <div className="grid grid-cols-2 gap-3">
        <label htmlFor="filter-status" className="sr-only">
          Filtruj po statusie
        </label>
        <select
          id="filter-status"
          value={filters.status}
          onChange={(e) =>
            onChange({ status: e.target.value as FiltersState["status"] })
          }
          className={inputClasses}
        >
          <option value="ALL">Wszystkie statusy</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <label htmlFor="filter-priority" className="sr-only">
          Filtruj po priorytecie
        </label>
        <select
          id="filter-priority"
          value={filters.priority}
          onChange={(e) =>
            onChange({ priority: e.target.value as FiltersState["priority"] })
          }
          className={inputClasses}
        >
          <option value="ALL">Wszystkie priorytety</option>
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>

      <label className={`flex cursor-pointer items-center gap-3 ${inputClasses}`}>
        <input
          type="checkbox"
          checked={filters.showDeleted}
          onChange={(e) => onChange({ showDeleted: e.target.checked })}
          className="h-4 w-4 accent-violet-600"
        />
        <span>Pokaż też soft deleted</span>
      </label>

      <div className="flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
        <span>
          Znaleziono: <strong className="text-slate-700 dark:text-slate-200">{resultCount}</strong>
        </span>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Wyczyść filtry
        </Button>
      </div>
    </div>
  );
}
