import { useEffect, useMemo, useState } from "react";
import { LoginScreen } from "./components/auth/LoginScreen";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";
import { ToastStack } from "./components/ui/Toast";
import { Dashboard } from "./components/views/Dashboard";
import { KanbanBoard } from "./components/views/KanbanBoard";
import { ListView } from "./components/views/ListView";
import { defaultFilters, demoCredentials } from "./data/seed";
import { useJiraStore } from "./hooks/useJiraStore";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useTheme } from "./hooks/useTheme";
import { useToast } from "./hooks/useToast";
import { buildExport, downloadJson, parseImport } from "./lib/exportImport";
import { loadState, saveState } from "./lib/storage";
import type {
  AppView,
  FiltersState,
  Task,
  TaskFormState,
  TaskStatus,
} from "./types";

export default function App() {
  const { theme, isDark, setTheme } = useTheme();
  const { toasts, showToast, dismissToast } = useToast();
  const store = useJiraStore();

  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    loadState("auth", false),
  );
  const [view, setView] = useState<AppView>(() => loadState<AppView>("view", "list"));
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>("2");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => saveState("auth", isAuthenticated), [isAuthenticated]);
  useEffect(() => saveState("view", view), [view]);

  const visibleTasks = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return store.tasks.filter((task) => {
      if (!filters.showDeleted && task.deleted) return false;
      if (filters.status !== "ALL" && task.status !== filters.status) return false;
      if (filters.priority !== "ALL" && task.priority !== filters.priority) {
        return false;
      }
      if (query) {
        const haystack =
          `${task.title} ${task.description} ${task.tags.join(" ")} ${task.assignees.join(" ")}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [store.tasks, filters]);

  const selectedTask =
    store.tasks.find((task) => task.id === selectedTaskId) ?? null;
  const selectedComments = selectedTask
    ? store.comments[selectedTask.id] ?? []
    : [];

  const handleLogin = (email: string, password: string): boolean => {
    const ok =
      email.toLowerCase() === demoCredentials.email &&
      password === demoCredentials.password;
    if (ok) {
      setIsAuthenticated(true);
      showToast("Zalogowano do panelu Mini Jira 🚀");
    }
    return ok;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSidebarOpen(false);
    showToast("Wylogowano. Do zobaczenia!");
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTaskId(task.id);
    setSidebarOpen(false);
  };

  const handleCreate = (form: TaskFormState): boolean => {
    const task = store.createTask(form);
    setSelectedTaskId(task.id);
    showToast(`Dodano task: ${task.title}`);
    return true;
  };

  const handleSave = (id: string, form: TaskFormState): boolean => {
    const updated = store.updateTask(id, form);
    if (updated) showToast(`Zapisano task: ${updated.title}`);
    return Boolean(updated);
  };

  const handleToggleDelete = (id: string) => {
    const nextDeleted = store.toggleDelete(id);
    if (nextDeleted === null) return;
    showToast(
      nextDeleted ? "Task przeniesiony do soft delete." : "Task przywrócony.",
    );
  };

  const handleAddComment = (text: string): boolean => {
    if (!selectedTask) return false;
    const comment = store.addComment(selectedTask.id, text);
    if (comment) showToast("Komentarz dodany.");
    return Boolean(comment);
  };

  const handleHardDelete = (id: string) => {
    const task = store.tasks.find((item) => item.id === id);
    if (store.deleteTask(id)) {
      if (selectedTaskId === id) {
        const next = store.tasks.find((item) => item.id !== id);
        setSelectedTaskId(next ? next.id : null);
      }
      showToast(`Usunięto trwale: ${task?.title ?? "task"}`);
    }
  };

  const handleMoveTask = (
    draggedId: string,
    status: TaskStatus,
    beforeId: string | null,
  ) => {
    const task = store.tasks.find((item) => item.id === draggedId);
    const statusChanged = task && task.status !== status;
    store.moveTask(draggedId, status, beforeId);
    if (statusChanged) showToast(`Status: ${task.title} → ${status}`);
  };

  const handleExport = () => {
    downloadJson(buildExport(store.tasks, store.comments, store.audit));
    showToast("Wyeksportowano dane do pliku JSON.");
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const payload = parseImport(String(reader.result));
      if (!payload) {
        showToast("Nieprawidłowy plik — import przerwany.");
        return;
      }
      store.importData(payload);
      setSelectedTaskId(payload.tasks[0]?.id ?? null);
      setFilters(defaultFilters);
      showToast(`Zaimportowano ${payload.tasks.length} zadań.`);
    };
    reader.onerror = () => showToast("Nie udało się odczytać pliku.");
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    store.resetDemo();
    setFilters(defaultFilters);
    setSelectedTaskId("2");
    setSidebarOpen(false);
    showToast("Przywrócono dane demo.");
  };

  const handleFilterChange = (patch: Partial<FiltersState>) =>
    setFilters((prev) => ({ ...prev, ...patch }));
  const handleResetFilters = () => setFilters(defaultFilters);

  const shortcuts = useMemo(
    () => ({
      "1": () => setView("list"),
      "2": () => setView("board"),
      "3": () => setView("dashboard"),
      "/": () => {
        setView("list");
        requestAnimationFrame(() =>
          document.getElementById("filter-search")?.focus(),
        );
      },
    }),
    [],
  );
  useKeyboardShortcuts(shortcuts, isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
        style={{ backgroundImage: backgroundGradient(isDark) }}
      >
        <ToastStack toasts={toasts} onDismiss={dismissToast} />
        <LoginScreen theme={theme} onThemeChange={setTheme} onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
      style={{ backgroundImage: backgroundGradient(isDark) }}
    >
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <div className="lg:grid lg:grid-cols-[320px_1fr]">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <div
          className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar
            theme={theme}
            onThemeChange={setTheme}
            audit={store.audit}
            onLogout={handleLogout}
            onResetDemo={handleResetDemo}
            onExport={handleExport}
            onImport={handleImport}
          />
        </div>

        <main className="space-y-4 p-4 sm:p-6">
          <Topbar
            view={view}
            onViewChange={setView}
            onOpenSidebar={() => setSidebarOpen(true)}
          />

          {view === "list" && (
            <ListView
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              tasks={visibleTasks}
              selectedTaskId={selectedTaskId}
              onSelectTask={handleSelectTask}
              selectedTask={selectedTask}
              comments={selectedComments}
              onCreate={handleCreate}
              onSave={handleSave}
              onToggleDelete={handleToggleDelete}
              onHardDelete={handleHardDelete}
              onAddComment={handleAddComment}
              onAddSubtask={store.addSubtask}
              onToggleSubtask={store.toggleSubtask}
              onRemoveSubtask={store.removeSubtask}
            />
          )}

          {view === "board" && (
            <KanbanBoard
              tasks={visibleTasks}
              selectedTaskId={selectedTaskId}
              onSelectTask={handleSelectTask}
              onMoveTask={handleMoveTask}
            />
          )}

          {view === "dashboard" && (
            <Dashboard tasks={store.tasks} audit={store.audit} />
          )}
        </main>
      </div>
    </div>
  );
}

function backgroundGradient(isDark: boolean): string {
  return isDark
    ? "radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 25%), radial-gradient(circle at top right, rgba(168,85,247,.16), transparent 30%)"
    : "radial-gradient(circle at top left, rgba(59,130,246,.12), transparent 25%), radial-gradient(circle at top right, rgba(168,85,247,.10), transparent 30%)";
}
