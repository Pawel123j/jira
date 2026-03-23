import { useMemo, useState } from "react";

type ThemeMode = "dark" | "light";
type TaskStatus = "To do" | "In progress" | "Done";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignees: string[];
  due: string;
  tags: string[];
  deleted: boolean;
};

type CommentItem = {
  id: string;
  author: string;
  text: string;
  time: string;
};

type AuditItem = {
  id: string;
  action: string;
  actor: string;
  time: string;
};

const teamMembers = [
  "Paweł Owner",
  "Adam Admin",
  "Mila Member",
  "Victor Viewer",
];

const tagOptions = ["bug", "feature", "urgent", "cleanup", "backend", "frontend"];

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Zrobić ekran logowania",
    description: "Formularz loginu z JWT, walidacją i stanem użytkownika.",
    priority: "HIGH",
    status: "To do",
    assignees: ["Mila Member"],
    due: "2026-03-25T18:00",
    tags: ["feature", "frontend"],
    deleted: false,
  },
  {
    id: "2",
    title: "Dodać audit log dla tasków",
    description: "Rejestrowanie create, update, delete, restore i komentarzy.",
    priority: "CRITICAL",
    status: "In progress",
    assignees: ["Adam Admin", "Mila Member"],
    due: "2026-03-24T15:00",
    tags: ["bug", "urgent", "backend"],
    deleted: false,
  },
  {
    id: "3",
    title: "Oczyścić stare taski",
    description: "Soft delete dla przestarzałych tasków i opcja przywracania.",
    priority: "LOW",
    status: "Done",
    assignees: ["Victor Viewer"],
    due: "",
    tags: ["cleanup"],
    deleted: true,
  },
];

const initialComments: Record<string, CommentItem[]> = {
  "1": [
    {
      id: "c1",
      author: "Paweł Owner",
      text: "Login ma mieć prostą walidację i pamiętanie sesji.",
      time: "22.03 20:31",
    },
  ],
  "2": [
    {
      id: "c2",
      author: "Adam Admin",
      text: "Audit log musi łapać też restore i zmianę statusu.",
      time: "22.03 20:47",
    },
  ],
  "3": [],
};

const initialAudit: AuditItem[] = [
  { id: "a1", action: "TASK_CREATED", actor: "Paweł Owner", time: "22.03 20:31" },
  { id: "a2", action: "TASK_UPDATED", actor: "Adam Admin", time: "22.03 20:42" },
  { id: "a3", action: "COMMENT_CREATED", actor: "Mila Member", time: "22.03 20:47" },
];

const emptyCreateForm = {
  title: "",
  description: "",
  status: "To do" as TaskStatus,
  priority: "MEDIUM" as TaskPriority,
  due: "",
  assignees: [] as string[],
  tags: [] as string[],
};

export default function MiniJiraPreview() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("pawel@demo.local");
  const [password, setPassword] = useState("demo1234");
  const [toast, setToast] = useState("Gotowe do akcji ✨");

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [commentsByTask, setCommentsByTask] = useState<Record<string, CommentItem[]>>(initialComments);
  const [audit, setAudit] = useState<AuditItem[]>(initialAudit);
  const [selectedTaskId, setSelectedTaskId] = useState("2");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [showDeleted, setShowDeleted] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    status: "ALL",
    priority: "ALL",
    showDeleted: true,
  });

  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "To do" as TaskStatus,
    priority: "MEDIUM" as TaskPriority,
    due: "",
    assignees: [] as string[],
    tags: [] as string[],
  });
  const [newComment, setNewComment] = useState("");

  const isDark = theme === "dark";

  const classes = useMemo(() => {
    const shell = isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900";
    const sidebar = isDark ? "border-slate-800/80 bg-slate-950/70" : "border-slate-300 bg-white/80";
    const panel = isDark ? "border-slate-800 bg-slate-900/80 shadow-slate-950/20" : "border-slate-300 bg-white shadow-slate-300/40";
    const muted = isDark ? "text-slate-400" : "text-slate-500";
    const input = isDark ? "border-slate-700 bg-slate-950 text-slate-100" : "border-slate-300 bg-white text-slate-900";
    const card = isDark ? "border-slate-800 bg-slate-950/80" : "border-slate-300 bg-slate-50";
    const subtle = isDark ? "bg-slate-900 text-slate-200 border-slate-700" : "bg-white text-slate-700 border-slate-300";
    return { shell, sidebar, panel, muted, input, card, subtle };
  }, [isDark]);

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0] ?? null;

  const visibleTasks = tasks.filter((task) => {
    if (!appliedFilters.showDeleted && task.deleted) return false;
    if (appliedFilters.status !== "ALL" && task.status !== appliedFilters.status) return false;
    if (appliedFilters.priority !== "ALL" && task.priority !== appliedFilters.priority) return false;
    if (appliedFilters.search.trim()) {
      const q = appliedFilters.search.toLowerCase();
      const haystack = `${task.title} ${task.description} ${task.tags.join(" ")} ${task.assignees.join(" ")}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const selectedComments = selectedTask ? commentsByTask[selectedTask.id] ?? [] : [];

  const syncEditForm = (task: Task | null) => {
    if (!task) return;
    setEditForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due: task.due,
      assignees: task.assignees,
      tags: task.tags,
    });
  };

  const pushAudit = (action: string) => {
    const entry: AuditItem = {
      id: `${Date.now()}-${Math.random()}`,
      action,
      actor: "Paweł Owner",
      time: new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
    };
    setAudit((prev) => [entry, ...prev].slice(0, 8));
  };

  const formatDue = (value: string) => {
    if (!value) return "brak";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setToast("Wpisz email i hasło 👀");
      return;
    }
    setIsAuthenticated(true);
    setToast("Zalogowano do panelu mini Jiry 🚀");
    if (selectedTask) syncEditForm(selectedTask);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToast("Wylogowano. Wracasz na ekran loginu.");
  };

  const handleApplyFilters = () => {
    setAppliedFilters({
      search,
      status: statusFilter,
      priority: priorityFilter,
      showDeleted,
    });
    setToast("Filtry odpalone ✨");
  };

  const handleRefresh = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
    setShowDeleted(true);
    setAppliedFilters({ search: "", status: "ALL", priority: "ALL", showDeleted: true });
    setToast("Panel odświeżony i filtry wyczyszczone.");
  };

  const handleCreateTask = () => {
    if (!createForm.title.trim()) {
      setToast("Task musi mieć tytuł.");
      return;
    }

    const task: Task = {
      id: `${Date.now()}`,
      title: createForm.title.trim(),
      description: createForm.description.trim() || "Brak opisu",
      status: createForm.status,
      priority: createForm.priority,
      due: createForm.due,
      assignees: createForm.assignees,
      tags: createForm.tags,
      deleted: false,
    };

    setTasks((prev) => [task, ...prev]);
    setCommentsByTask((prev) => ({ ...prev, [task.id]: [] }));
    setSelectedTaskId(task.id);
    syncEditForm(task);
    setCreateForm(emptyCreateForm);
    pushAudit("TASK_CREATED");
    setToast(`Dodano task: ${task.title}`);
  };

  const handleSaveTask = () => {
    if (!selectedTask) return;
    if (!editForm.title.trim()) {
      setToast("Tytuł taska nie może być pusty.");
      return;
    }

    const updatedTask: Task = {
      ...selectedTask,
      title: editForm.title.trim(),
      description: editForm.description.trim() || "Brak opisu",
      status: editForm.status,
      priority: editForm.priority,
      due: editForm.due,
      assignees: editForm.assignees,
      tags: editForm.tags,
    };

    setTasks((prev) => prev.map((task) => (task.id === selectedTask.id ? updatedTask : task)));
    pushAudit("TASK_UPDATED");
    setToast(`Zapisano task: ${updatedTask.title}`);
  };

  const handleDeleteRestore = () => {
    if (!selectedTask) return;
    const nextDeleted = !selectedTask.deleted;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === selectedTask.id
          ? {
              ...task,
              deleted: nextDeleted,
            }
          : task,
      ),
    );
    pushAudit(nextDeleted ? "TASK_SOFT_DELETED" : "TASK_RESTORED");
    setToast(nextDeleted ? "Task przerzucony do soft delete." : "Task przywrócony.");
  };

  const handleAddComment = () => {
    if (!selectedTask) return;
    if (!newComment.trim()) {
      setToast("Najpierw wpisz komentarz 😎");
      return;
    }

    const comment: CommentItem = {
      id: `${Date.now()}-comment`,
      author: "Paweł Owner",
      text: newComment.trim(),
      time: new Date().toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }),
    };

    setCommentsByTask((prev) => ({
      ...prev,
      [selectedTask.id]: [comment, ...(prev[selectedTask.id] ?? [])],
    }));
    setNewComment("");
    pushAudit("COMMENT_CREATED");
    setToast("Komentarz dodany.");
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTaskId(task.id);
    syncEditForm(task);
    setToast(`Otwarty task: ${task.title}`);
  };

  const handleProjectClick = () => {
    setToast("Projekt MINI aktywny.");
  };

  const toggleAssignee = (
    current: string[],
    value: string,
    setter: (updater: string[]) => void,
  ) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const toggleTag = (
    current: string[],
    value: string,
    setter: (updater: string[]) => void,
  ) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  return (
    <div
      className={`min-h-screen ${classes.shell}`}
      style={{
        backgroundImage: isDark
          ? "radial-gradient(circle at top left, rgba(59,130,246,.18), transparent 25%), radial-gradient(circle at top right, rgba(168,85,247,.16), transparent 30%)"
          : "radial-gradient(circle at top left, rgba(59,130,246,.12), transparent 25%), radial-gradient(circle at top right, rgba(168,85,247,.10), transparent 30%)",
      }}
    >
      <div className="sticky top-0 z-50 px-6 pt-6">
        <div className={`mx-auto max-w-7xl rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${classes.subtle}`}>
          {toast}
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="flex min-h-[calc(100vh-88px)] items-center justify-center p-6">
          <div className={`w-full max-w-md rounded-[2rem] border p-6 shadow-2xl ${classes.panel}`}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-500">
                  Mini Jira
                </span>
                <h1 className="mt-4 text-3xl font-bold">Logowanie</h1>
                <p className={classes.muted}>Wejdź do panelu i ogarnij taski jak boss.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${
                    theme === "light"
                      ? "border-blue-500 bg-blue-500/10 text-blue-600"
                      : isDark
                        ? "border-slate-700 bg-slate-900 text-slate-200"
                        : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  Biały
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${
                    theme === "dark"
                      ? "border-violet-500 bg-violet-500/10 text-violet-500"
                      : isDark
                        ? "border-slate-700 bg-slate-900 text-slate-200"
                        : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  Czarny
                </button>
              </div>
            </div>

            <div className={`mb-5 rounded-3xl border p-4 text-sm ${classes.card}`}>
              <div className="font-semibold">Dane demo</div>
              <div className={`mt-2 space-y-1 ${classes.muted}`}>
                <div>Email: pawel@demo.local</div>
                <div>Hasło: demo1234</div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 ${classes.input}`}
                  placeholder="Wpisz email"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium">Hasło</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 ${classes.input}`}
                  placeholder="Wpisz hasło"
                />
              </label>

              <button
                onClick={handleLogin}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 font-bold text-white"
              >
                Zaloguj się
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid min-h-[calc(100vh-88px)] grid-cols-[320px_1fr]">
          <aside className={`border-r p-6 backdrop-blur-xl flex flex-col gap-6 ${classes.sidebar}`}>
            <div>
              <span className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-500">
                Mini Jira
              </span>
              <h2 className="mt-4 text-2xl font-bold">Paweł Owner</h2>
              <p className={classes.muted}>pawel@demo.local</p>
            </div>

            <div className="space-y-3">
              <div className={`text-xs font-extrabold uppercase tracking-[0.2em] ${classes.muted}`}>
                Motyw
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    theme === "light"
                      ? "border-blue-500 bg-blue-500/10 text-blue-600"
                      : isDark
                        ? "border-slate-700 bg-slate-900 text-slate-200"
                        : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  Biały
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    theme === "dark"
                      ? "border-violet-500 bg-violet-500/10 text-violet-500"
                      : isDark
                        ? "border-slate-700 bg-slate-900 text-slate-200"
                        : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  Czarny
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className={`text-xs font-extrabold uppercase tracking-[0.2em] ${classes.muted}`}>
                Projekty
              </div>
              <button
                onClick={handleProjectClick}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left shadow-lg ${
                  isDark
                    ? "border-slate-700 bg-slate-900 ring-1 ring-violet-500/40"
                    : "border-slate-300 bg-white ring-1 ring-violet-300"
                }`}
              >
                <span className="font-semibold">MINI</span>
                <span className={`text-xs ${classes.muted}`}>OWNER</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className={`text-xs font-extrabold uppercase tracking-[0.2em] ${classes.muted}`}>
                Audit log
              </div>
              <div className="space-y-3">
                {audit.map((item) => (
                  <div key={item.id} className={`rounded-2xl border p-3 ${classes.card}`}>
                    <div className="text-sm font-semibold">{item.action}</div>
                    <div className="text-sm">{item.actor}</div>
                    <div className={`text-xs ${classes.muted}`}>{item.time}</div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-auto rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-4 py-3 font-semibold text-white"
            >
              Wyloguj
            </button>
          </aside>

          <main className="grid grid-cols-3 gap-4 p-6">
            <section className={`rounded-3xl border p-5 shadow-2xl ${classes.panel}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold">Mini Jira Demo</h1>
                  <p className={classes.muted}>Kliknij task po lewej, edytuj po prawej, dorzucaj komentarze i filtry.</p>
                </div>
                <button
                  onClick={handleRefresh}
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold ${classes.input}`}
                >
                  Refresh
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`rounded-2xl border px-4 py-3 outline-none ${classes.input}`}
                  placeholder="Szukaj po tytule lub opisie"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`rounded-2xl border px-4 py-3 ${classes.input}`}
                  >
                    <option value="ALL">Wszystkie statusy</option>
                    <option value="To do">To do</option>
                    <option value="In progress">In progress</option>
                    <option value="Done">Done</option>
                  </select>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className={`rounded-2xl border px-4 py-3 ${classes.input}`}
                  >
                    <option value="ALL">Wszystkie priorytety</option>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <label className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${classes.input}`}>
                  <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} />
                  <span>Pokaż też soft deleted</span>
                </label>
                <button
                  onClick={handleApplyFilters}
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 font-bold text-white"
                >
                  Filtruj
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {visibleTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleSelectTask(task)}
                    className={`w-full rounded-3xl border p-4 text-left transition ${
                      selectedTaskId === task.id
                        ? isDark
                          ? "border-violet-500/50 bg-slate-950 ring-1 ring-violet-500/50"
                          : "border-violet-400 bg-white ring-1 ring-violet-300"
                        : classes.card
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">{task.title}</div>
                      <div
                        className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                          task.priority === "CRITICAL"
                            ? "bg-red-500/15 text-red-500"
                            : task.priority === "HIGH"
                              ? "bg-amber-500/15 text-amber-500"
                              : task.priority === "MEDIUM"
                                ? "bg-blue-500/15 text-blue-500"
                                : isDark
                                  ? "bg-slate-800 text-slate-300"
                                  : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {task.priority}
                      </div>
                    </div>
                    <div className={`mt-3 flex flex-wrap gap-3 text-sm ${classes.muted}`}>
                      <span>{task.status}</span>
                      <span>{task.assignees.join(", ") || "Brak przypisań"}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-full border px-2.5 py-1 text-xs ${
                            isDark ? "border-slate-700 text-slate-300" : "border-slate-300 text-slate-700"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className={`mt-3 flex items-center justify-between text-xs ${classes.muted}`}>
                      <span>Due: {formatDue(task.due)}</span>
                      {task.deleted && <span className="text-red-500">soft deleted</span>}
                    </div>
                  </button>
                ))}
                {visibleTasks.length === 0 && (
                  <div className={`rounded-3xl border p-5 text-sm ${classes.card}`}>
                    Nic nie wpadło po filtrach. Zmień kryteria i kliknij Filtruj.
                  </div>
                )}
              </div>
            </section>

            <section className={`rounded-3xl border p-5 shadow-2xl ${classes.panel}`}>
              <h2 className="text-xl font-bold">Dodaj task</h2>
              <p className={classes.muted}>Tutaj naprawdę dodasz nowy task do listy.</p>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm">Tytuł</span>
                  <input
                    value={createForm.title}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
                    className={`w-full rounded-2xl border px-4 py-3 ${classes.input}`}
                    placeholder="Np. Dodać role użytkowników"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm">Opis</span>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                    className={`h-28 w-full rounded-2xl border px-4 py-3 ${classes.input}`}
                    placeholder="Opis taska"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, status: e.target.value as TaskStatus }))}
                    className={`rounded-2xl border px-4 py-3 ${classes.input}`}
                  >
                    <option value="To do">To do</option>
                    <option value="In progress">In progress</option>
                    <option value="Done">Done</option>
                  </select>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))}
                    className={`rounded-2xl border px-4 py-3 ${classes.input}`}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <input
                  type="datetime-local"
                  value={createForm.due}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, due: e.target.value }))}
                  className={`w-full rounded-2xl border px-4 py-3 ${classes.input}`}
                />

                <div>
                  <div className="mb-2 text-sm">Assignees</div>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map((member) => (
                      <button
                        key={member}
                        onClick={() =>
                          toggleAssignee(createForm.assignees, member, (next) =>
                            setCreateForm((prev) => ({ ...prev, assignees: next })),
                          )
                        }
                        className={`rounded-full border px-3 py-2 text-sm ${
                          createForm.assignees.includes(member)
                            ? "border-blue-500 bg-blue-500/10 text-blue-600"
                            : classes.subtle
                        }`}
                      >
                        {member}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm">Tagi</div>
                  <div className="flex flex-wrap gap-2">
                    {tagOptions.map((tag) => (
                      <button
                        key={tag}
                        onClick={() =>
                          toggleTag(createForm.tags, tag, (next) => setCreateForm((prev) => ({ ...prev, tags: next })))
                        }
                        className={`rounded-full border px-3 py-2 text-sm ${
                          createForm.tags.includes(tag)
                            ? "border-violet-500 bg-violet-500/10 text-violet-500"
                            : classes.subtle
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateTask}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 font-bold text-white"
                >
                  Dodaj task
                </button>
              </div>
            </section>

            <section className={`rounded-3xl border p-5 shadow-2xl ${classes.panel}`}>
              <h2 className="text-xl font-bold">Szczegóły taska</h2>
              <p className={classes.muted}>Kliknij task z listy i ogarnij jego edycję.</p>

              {selectedTask ? (
                <div className="mt-5 space-y-4">
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                    className={`w-full rounded-2xl border px-4 py-3 ${classes.input}`}
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                    className={`h-28 w-full rounded-2xl border px-4 py-3 ${classes.input}`}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as TaskStatus }))}
                      className={`rounded-2xl border px-4 py-3 ${classes.input}`}
                    >
                      <option value="To do">To do</option>
                      <option value="In progress">In progress</option>
                      <option value="Done">Done</option>
                    </select>
                    <select
                      value={editForm.priority}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))}
                      className={`rounded-2xl border px-4 py-3 ${classes.input}`}
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="CRITICAL">CRITICAL</option>
                    </select>
                  </div>

                  <input
                    type="datetime-local"
                    value={editForm.due}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, due: e.target.value }))}
                    className={`w-full rounded-2xl border px-4 py-3 ${classes.input}`}
                  />

                  <div>
                    <div className="mb-2 text-sm">Assignees</div>
                    <div className="flex flex-wrap gap-2">
                      {teamMembers.map((member) => (
                        <button
                          key={member}
                          onClick={() =>
                            toggleAssignee(editForm.assignees, member, (next) => setEditForm((prev) => ({ ...prev, assignees: next })))
                          }
                          className={`rounded-full border px-3 py-2 text-sm ${
                            editForm.assignees.includes(member)
                              ? "border-blue-500 bg-blue-500/10 text-blue-600"
                              : classes.subtle
                          }`}
                        >
                          {member}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-sm">Tagi</div>
                    <div className="flex flex-wrap gap-2">
                      {tagOptions.map((tag) => (
                        <button
                          key={tag}
                          onClick={() =>
                            toggleTag(editForm.tags, tag, (next) => setEditForm((prev) => ({ ...prev, tags: next })))
                          }
                          className={`rounded-full border px-3 py-2 text-sm ${
                            editForm.tags.includes(tag)
                              ? "border-violet-500 bg-violet-500/10 text-violet-500"
                              : classes.subtle
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveTask}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 font-bold text-white"
                  >
                    Zapisz task
                  </button>
                  <button
                    onClick={handleDeleteRestore}
                    className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 px-4 py-3 font-bold text-white"
                  >
                    {selectedTask.deleted ? "Przywróć task" : "Soft delete"}
                  </button>

                  <div className={`rounded-3xl border p-4 ${classes.card}`}>
                    <h3 className="text-lg font-bold">Komentarze</h3>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className={`mt-3 h-24 w-full rounded-2xl border px-4 py-3 ${classes.input}`}
                      placeholder="Dodaj komentarz..."
                    />
                    <button
                      onClick={handleAddComment}
                      className="mt-3 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 font-bold text-white"
                    >
                      Dodaj komentarz
                    </button>
                    <div className="mt-4 space-y-3">
                      {selectedComments.length > 0 ? (
                        selectedComments.map((comment) => (
                          <div key={comment.id} className={`rounded-2xl border p-3 ${classes.card}`}>
                            <div className="flex items-center justify-between gap-3">
                              <strong>{comment.author}</strong>
                              <span className={`text-xs ${classes.muted}`}>{comment.time}</span>
                            </div>
                            <p className="mt-2">{comment.text}</p>
                          </div>
                        ))
                      ) : (
                        <div className={`rounded-2xl border p-3 text-sm ${classes.card}`}>
                          Brak komentarzy. Dorzuć pierwszy.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`mt-5 rounded-3xl border p-5 ${classes.card}`}>
                  Brak tasków do wyświetlenia.
                </div>
              )}
            </section>
          </main>
        </div>
      )}
    </div>
  );
}
