import type {
  AuditItem,
  CommentItem,
  FiltersState,
  Task,
  TaskFormState,
  TaskPriority,
  TaskStatus,
  TeamMember,
} from "../types";

export const teamMembers: TeamMember[] = [
  { name: "Paweł Owner", email: "pawel@demo.local", role: "OWNER" },
  { name: "Adam Admin", email: "adam@demo.local", role: "ADMIN" },
  { name: "Mila Member", email: "mila@demo.local", role: "MEMBER" },
  { name: "Victor Viewer", email: "victor@demo.local", role: "VIEWER" },
];

/** The signed-in user for this demo. */
export const currentUser: TeamMember = teamMembers[0];

export const tagOptions = [
  "bug",
  "feature",
  "urgent",
  "cleanup",
  "backend",
  "frontend",
];

export const statusOptions: TaskStatus[] = ["To do", "In progress", "Done"];

export const priorityOptions: TaskPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

/** Fibonacci-style story point estimates (0 = brak estymaty). */
export const pointsOptions = [0, 1, 2, 3, 5, 8, 13];

export const demoCredentials = {
  email: "pawel@demo.local",
  password: "demo1234",
};

export const initialTasks: Task[] = [
  {
    id: "1",
    title: "Zrobić ekran logowania",
    description: "Formularz loginu z JWT, walidacją i stanem użytkownika.",
    priority: "HIGH",
    status: "To do",
    assignees: ["Mila Member"],
    due: "2026-03-25T18:00",
    tags: ["feature", "frontend"],
    points: 5,
    subtasks: [
      { id: "s1", title: "Formularz email + hasło", done: true },
      { id: "s2", title: "Walidacja pól", done: false },
      { id: "s3", title: "Zapamiętywanie sesji", done: false },
    ],
    deleted: false,
    createdAt: "2026-03-22T20:31",
    updatedAt: "2026-03-22T20:31",
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
    points: 8,
    subtasks: [
      { id: "s4", title: "Rejestrowanie create/update/delete", done: true },
      { id: "s5", title: "Rejestrowanie restore i komentarzy", done: false },
    ],
    deleted: false,
    createdAt: "2026-03-22T20:32",
    updatedAt: "2026-03-22T20:42",
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
    points: 2,
    subtasks: [],
    deleted: true,
    createdAt: "2026-03-20T11:10",
    updatedAt: "2026-03-21T09:05",
  },
];

export const initialComments: Record<string, CommentItem[]> = {
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

export const initialAudit: AuditItem[] = [
  { id: "a1", action: "TASK_CREATED", actor: "Paweł Owner", time: "22.03 20:31" },
  { id: "a2", action: "TASK_UPDATED", actor: "Adam Admin", time: "22.03 20:42" },
  {
    id: "a3",
    action: "COMMENT_CREATED",
    actor: "Mila Member",
    time: "22.03 20:47",
  },
];

export const defaultFilters: FiltersState = {
  search: "",
  status: "ALL",
  priority: "ALL",
  showDeleted: true,
  onlyMine: false,
};

export const emptyTaskForm: TaskFormState = {
  title: "",
  description: "",
  status: "To do",
  priority: "MEDIUM",
  due: "",
  points: 0,
  assignees: [],
  tags: [],
};
