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
  | { type: "ADD_COMMENT"; taskId: string; comment: CommentItem; audit: AuditItem }
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

function getInitialState(): StoreState {
  const seed = getSeedState();
  return {
    tasks: loadState("tasks", seed.tasks),
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
      assignees: form.assignees,
      tags: form.tags,
      deleted: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    dispatch({ type: "CREATE_TASK", task, audit: makeAudit("TASK_CREATED", task.title) });
    return task;
  }, []);

  const updateTask = useCallback((id: string, form: TaskFormState): Task | null => {
    const existing = state.tasks.find((task) => task.id === id);
    if (!existing) return null;
    const updated: Task = {
      ...existing,
      title: form.title.trim(),
      description: form.description.trim() || "Brak opisu",
      status: form.status,
      priority: form.priority,
      due: form.due,
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
  }, [state.tasks]);

  const changeStatus = useCallback(
    (id: string, status: TaskStatus): Task | null => {
      const existing = state.tasks.find((task) => task.id === id);
      if (!existing || existing.status === status) return null;
      const updated: Task = { ...existing, status, updatedAt: nowIso() };
      dispatch({
        type: "UPDATE_TASK",
        task: updated,
        audit: makeAudit("TASK_STATUS_CHANGED", `${existing.title} → ${status}`),
      });
      return updated;
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

  const resetDemo = useCallback(() => dispatch({ type: "RESET" }), []);

  const actions = useMemo(
    () => ({
      createTask,
      updateTask,
      changeStatus,
      toggleDelete,
      addComment,
      resetDemo,
    }),
    [createTask, updateTask, changeStatus, toggleDelete, addComment, resetDemo],
  );

  return { ...state, ...actions };
}

export type JiraStore = ReturnType<typeof useJiraStore>;
