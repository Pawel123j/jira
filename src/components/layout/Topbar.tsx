import type { AppView } from "../../types";

const tabs: { id: AppView; label: string; icon: string }[] = [
  { id: "list", label: "Lista", icon: "≣" },
  { id: "board", label: "Tablica", icon: "▥" },
  { id: "dashboard", label: "Dashboard", icon: "▦" },
];

interface TopbarProps {
  view: AppView;
  onViewChange: (view: AppView) => void;
  onOpenSidebar: () => void;
}

export function Topbar({ view, onViewChange, onOpenSidebar }: TopbarProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Otwórz menu"
          className="rounded-2xl border border-slate-300 px-3 py-2 text-lg dark:border-slate-700 lg:hidden"
        >
          ☰
        </button>
        <div>
          <h1 className="text-2xl font-bold">Mini Jira</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Zarządzaj zadaniami: lista, tablica Kanban i statystyki.
          </p>
        </div>
      </div>

      <nav
        aria-label="Widok"
        className="inline-flex w-full gap-1 rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900/80 sm:w-auto"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-current={view === tab.id ? "page" : undefined}
            onClick={() => onViewChange(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition sm:flex-none ${
              view === tab.id
                ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
