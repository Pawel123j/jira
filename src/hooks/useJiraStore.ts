import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  currentUser,
  initialAudit,
  initialComments,
  initialTasks,
} from "../data/seed";
import { makeId, nowIso, nowTime } from "../lib/format";
import { loadState, saveState } from "../lib/storage";
import type {
  AuditAction,
  AuditItem,
  CommentItem,
  ExportPayload,
  SubTask,
  Task,
  TaskFormState,
  TaskStatus,
} from "../types";

const MAX_AUDIT_ENTRIES = 12;

interface StoreState {
  tasks: Task[];
  comments: Record<string, CommentItem[]>;
  audit: AuditItem[];
}

type Action =
  | { type: "CREATE_TASK"; task: Task; audit: AuditItem }
  | { type: "UPDATE_TASK"; task: Task; audit: AuditItem }
  | { type: "PATCH_TASK"; task: Task }
  | { type: "DELETE_TASK"; id: string; audit: AuditItem }
  | { type: "MOVE_TASK"; tasks: Task[]; audit: AuditItem | null }
  | { type: "ADD_COMMENT"; taskId: string; comment: CommentItem; audit: AuditItem }
  | { type: "IMPORT_DATA"; payload: ExportPayload; audit: AuditItem }
  | { type: "RESET" };

function withAudit(state: StoreState, entry: AuditItem): AuditItem[] {
  return [entry, ...state.audit].slice(0, MAX_AUDIT_ENTRIES);
}

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "CREATE_TASK":
      return {
        tasks: [action.task, ...state.tasks],
        comments: { ...state.comments, [action.task.id]: [] },
        audit: withAudit(state, action.audit),
      };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.task.id ? action.task : task,
        ),
        audit: withAudit(state, action.audit),
      };
    case "PATCH_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.task.id ? action.task : task,
        ),
      };
    case "DELETE_TASK": {
      const comments = { ...state.comments };
      delete comments[action.id];
      return {
        tasks: state.tasks.filter((task) => task.id !== action.id),
        comments,
        audit: withAudit(state, action.audit),
      };
    }
    case "MOVE_TASK":
      return {
        ...state,
        tasks: action.tasks,
        audit: action.audit ? withAudit(state, action.audit) : state.audit,
      };
    case "ADD_COMMENT":
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.taskId]: [
            action.comment,
            ...(state.comments[action.taskId] ?? []),
          ],
        },
        audit: withAudit(state, action.audit),
      };
    case "IMPORT_DATA":
      return {
        tasks: normalizeTasks(action.payload.tasks),
        comments: action.payload.comments,
        audit: [action.audit, ...action.payload.audit].slice(
          0,
          MAX_AUDIT_ENTRIES,
        ),
      };
    case "RESET":
      return getSeedState();
    default:
      return state;
  }
}

function getSeedState(): StoreState {
  return {
    tasks: initialTasks,
    comments: initialComments,
    audit: initialAudit,
  };
}

/** Ensure tasks from older storage/imports have all required fields. */
function normalizeTasks(tasks: Task[]): Task[] {
  return tasks.map((task) => ({
    ...task,
    points: typeof task.points === "number" ? task.points : 0,
    subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
  }));
}

function getInitialState(): StoreState {
  const seed = getSeedState();
  return {
    tasks: normalizeTasks(loadState("tasks", seed.tasks)),
    comments: loadState("comments", seed.comments),
    audit: loadState("audit", seed.audit),
  };
}

function makeAudit(action: AuditAction, detail?: string): AuditItem {
  return {
    id: makeId("audit"),
    action,
    actor: currentUser.name,
    detail,
    time: nowTime(),
  };
}

/**
 * Central store for tasks, comments and the audit log. Persists every change
 * to localStorage and records an audit entry for each mutation.
 */
export function useJiraStore() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  useEffect(() => saveState("tasks", state.tasks), [state.tasks]);
  useEffect(() => saveState("comments", state.comments), [state.comments]);
  useEffect(() => saveState("audit", state.audit), [state.audit]);

  const createTask = useCallback((form: TaskFormState): Task => {
    const timestamp = nowIso();
    const task: Task = {
      id: makeId("task"),
      title: form.title.trim(),
      description: form.description.trim() || "Brak opisu",
      status: form.status,
      priority: form.priority,
      due: form.due,
      points: form.points,
      assignees: form.assignees,
      tags: form.tags,
      subtasks: [],
      deleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    dispatch({
      type: "CREATE_TASK",
      task,
      audit: makeAudit("TASK_CREATED", task.title),
    });
    return task;
  }, []);

  const updateTask = useCallback(
    (id: string, form: TaskFormState): Task | null => {
      const existing = state.tasks.find((task) => task.id === id);
      if (!existing) return null;
      const updated: Task = {
        ...existing,
        title: form.title.trim(),
        description: form.description.trim() || "Brak opisu",
        status: form.status,
        priority: form.priority,
        due: form.due,
        points: form.points,
        assignees: form.assignees,
        tags: form.tags,
        updatedAt: nowIso(),
      };
      dispatch({
        type: "UPDATE_TASK",
        task: updated,
        audit: makeAudit("TASK_UPDATED", updated.title),
      });
      return updated;
    },
    [state.tasks],
  );

  /**
   * Reorder/move a task within or across status columns (Kanban drag & drop).
   * `beforeId` is the task the dragged card was dropped onto, or null for the
   * end of the column.
   */
  const moveTask = useCallback(
    (draggedId: string, targetStatus: TaskStatus, beforeId: string | null) => {
      const dragged = state.tasks.find((task) => task.id === draggedId);
      if (!dragged) return;
      if (beforeId === draggedId) return;

      const statusChanged = dragged.status !== targetStatus;
      const updated: Task = {
        ...dragged,
        status: targetStatus,
        updatedAt: statusChanged ? nowIso() : dragged.updatedAt,
      };

      const rest = state.tasks.filter((task) => task.id !== draggedId);
      let insertAt = rest.length;
      if (beforeId) {
        const index = rest.findIndex((task) => task.id === beforeId);
        if (index !== -1) insertAt = index;
      }
      const tasks = [
        ...rest.slice(0, insertAt),
        updated,
        ...rest.slice(insertAt),
      ];

      dispatch({
        type: "MOVE_TASK",
        tasks,
        audit: statusChanged
          ? makeAudit("TASK_STATUS_CHANGED", `${dragged.title} → ${targetStatus}`)
          : null,
      });
    },
    [state.tasks],
  );

  const toggleDelete = useCallback(
    (id: string): boolean | null => {
      const existing = state.tasks.find((task) => task.id === id);
      if (!existing) return null;
      const nextDeleted = !existing.deleted;
      const updated: Task = {
        ...existing,
        deleted: nextDeleted,
        updatedAt: nowIso(),
      };
      dispatch({
        type: "UPDATE_TASK",
        task: updated,
        audit: makeAudit(
          nextDeleted ? "TASK_SOFT_DELETED" : "TASK_RESTORED",
          existing.title,
        ),
      });
      return nextDeleted;
    },
    [state.tasks],
  );

  const deleteTask = useCallback(
    (id: string): boolean => {
      const existing = state.tasks.find((task) => task.id === id);
      if (!existing) return false;
      dispatch({
        type: "DELETE_TASK",
        id,
        audit: makeAudit("TASK_DELETED", existing.title),
      });
      return true;
    },
    [state.tasks],
  );

  const addComment = useCallback(
    (taskId: string, text: string): CommentItem | null => {
      const trimmed = text.trim();
      if (!trimmed) return null;
      const comment: CommentItem = {
        id: makeId("comment"),
        author: currentUser.name,
        text: trimmed,
        time: nowTime(),
      };
      dispatch({
        type: "ADD_COMMENT",
        taskId,
        comment,
        audit: makeAudit("COMMENT_CREATED"),
      });
      return comment;
    },
    [],
  );

  const patchSubtasks = useCallback(
    (taskId: string, updater: (subtasks: SubTask[]) => SubTask[]) => {
      const existing = state.tasks.find((task) => task.id === taskId);
      if (!existing) return;
      const updated: Task = {
        ...existing,
        subtasks: updater(existing.subtasks),
        updatedAt: nowIso(),
      };
      dispatch({ type: "PATCH_TASK", task: updated });
    },
    [state.tasks],
  );

  const addSubtask = useCallback(
    (taskId: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      patchSubtasks(taskId, (subtasks) => [
        ...subtasks,
        { id: makeId("sub"), title: trimmed, done: false },
      ]);
    },
    [patchSubtasks],
  );

  const toggleSubtask = useCallback(
    (taskId: string, subId: string) => {
      patchSubtasks(taskId, (subtasks) =>
        subtasks.map((sub) =>
          sub.id === subId ? { ...sub, done: !sub.done } : sub,
        ),
      );
    },
    [patchSubtasks],
  );

  const removeSubtask = useCallback(
    (taskId: string, subId: string) => {
      patchSubtasks(taskId, (subtasks) =>
        subtasks.filter((sub) => sub.id !== subId),
      );
    },
    [patchSubtasks],
  );

  const importData = useCallback((payload: ExportPayload) => {
    dispatch({
      type: "IMPORT_DATA",
      payload,
      audit: makeAudit("DATA_IMPORTED", `${payload.tasks.length} zadań`),
    });
  }, []);

  const resetDemo = useCallback(() => dispatch({ type: "RESET" }), []);

  const actions = useMemo(
    () => ({
      createTask,
      updateTask,
      moveTask,
      toggleDelete,
      deleteTask,
      addComment,
      addSubtask,
      toggleSubtask,
      removeSubtask,
      importData,
      resetDemo,
    }),
    [
      createTask,
      updateTask,
      moveTask,
      toggleDelete,
      deleteTask,
      addComment,
      addSubtask,
      toggleSubtask,
      removeSubtask,
      importData,
      resetDemo,
    ],
  );

  return { ...state, ...actions };
}

export type JiraStore = ReturnType<typeof useJiraStore>;
