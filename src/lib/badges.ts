import type { TaskPriority, TaskStatus } from "../types";

/** Tailwind classes for the priority pill. */
export const priorityBadgeClasses: Record<TaskPriority, string> = {
  CRITICAL: "bg-red-500/15 text-red-600 dark:text-red-400",
  HIGH: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  MEDIUM: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  LOW: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

/** Tailwind classes for the status pill / column accent. */
export const statusBadgeClasses: Record<TaskStatus, string> = {
  "To do": "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "In progress": "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  Done: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
};

/** Accent colour (left border / dot) per status, used by the Kanban board. */
export const statusAccentClasses: Record<TaskStatus, string> = {
  "To do": "bg-slate-400 dark:bg-slate-500",
  "In progress": "bg-blue-500",
  Done: "bg-emerald-500",
};

/** Solid dot colour per priority (literal classes so Tailwind keeps them). */
export const priorityDotClasses: Record<TaskPriority, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-amber-500",
  MEDIUM: "bg-blue-500",
  LOW: "bg-slate-400 dark:bg-slate-500",
};
