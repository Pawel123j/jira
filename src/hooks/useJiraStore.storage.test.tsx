import { act, render, renderHook, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "../App";
import { emptyTaskForm, initialAudit, initialComments, initialTasks } from "../data/seed";
import { useJiraStore } from "./useJiraStore";

const form = { ...emptyTaskForm, title: "Praca w pamięci" };

describe("safe persisted data", () => {
  it.each(["null", "{}", '"text"', "{invalid", "[null]", '[{"id":"1"}]'])(
    "keeps invalid tasks %s unchanged during mount, edits and remount",
    (raw) => {
      localStorage.setItem("mini-jira:tasks", raw);
      const comments = JSON.stringify(initialComments);
      localStorage.setItem("mini-jira:comments", comments);
      const { result, unmount } = renderHook(() => useJiraStore());
      expect(result.current.storageIssue).toBe("invalid");
      expect(result.current.tasks).toEqual(initialTasks);
      act(() => { result.current.createTask(form); });
      expect(result.current.tasks[0].title).toBe(form.title);
      expect(localStorage.getItem("mini-jira:tasks")).toBe(raw);
      expect(localStorage.getItem("mini-jira:comments")).toBe(comments);
      expect(localStorage.getItem("mini-jira:audit")).toBeNull();
      unmount();
      const next = renderHook(() => useJiraStore());
      expect(next.result.current.storageIssue).toBe("invalid");
      expect(localStorage.getItem("mini-jira:tasks")).toBe(raw);
    },
  );

  it.each([
    { tags: {} }, { assignees: [null] }, { points: -1 }, { points: "5" },
    { subtasks: [{ id: "s", title: "bad", done: "false" }] },
    { status: "Unknown" }, { status: ["Done"] }, { priority: "URGENT" },
    { description: null }, { deleted: "false" }, { id: "__proto__" },
  ])("rejects invalid nested task fields %j", (patch) => {
    const raw = JSON.stringify([{ ...initialTasks[0], ...patch }]);
    localStorage.setItem("mini-jira:tasks", raw);
    const { result } = renderHook(() => useJiraStore());
    expect(result.current.storageIssue).toBe("invalid");
    expect(localStorage.getItem("mini-jira:tasks")).toBe(raw);
  });

  it.each([
    ["comments", "null"], ["comments", "[]"], ["comments", '{"1":{}}'],
    ["comments", '{"1":[{"id":"c","author":"a","text":{},"time":"t"}]}'],
    ["audit", "{}"], ["audit", '[{"id":"a","action":"UNKNOWN","actor":"a","time":"t"}]'],
  ])("preserves invalid %s and does not overwrite valid tasks", (key, raw) => {
    const storedTasks = JSON.stringify([initialTasks[0]]);
    localStorage.setItem("mini-jira:tasks", storedTasks);
    localStorage.setItem(`mini-jira:${key}`, raw);
    const { result } = renderHook(() => useJiraStore());
    expect(result.current.storageIssue).toBe("invalid");
    act(() => { result.current.resetDemo(); });
    expect(localStorage.getItem(`mini-jira:${key}`)).toBe(raw);
    expect(localStorage.getItem("mini-jira:tasks")).toBe(storedTasks);
  });

  it("loads older tasks without points/subtasks and persists normal edits across reload", () => {
    const legacy = { ...initialTasks[0] } as Partial<typeof initialTasks[0]>;
    delete legacy.points;
    delete legacy.subtasks;
    localStorage.setItem("mini-jira:tasks", JSON.stringify([legacy]));
    const { result, unmount } = renderHook(() => useJiraStore());
    expect(result.current.storageIssue).toBeNull();
    expect(result.current.tasks[0]).toMatchObject({ points: 0, subtasks: [] });
    act(() => { result.current.createTask(form); });
    unmount();
    const reloaded = renderHook(() => useJiraStore());
    expect(reloaded.result.current.tasks[0].title).toBe(form.title);
    expect(reloaded.result.current.audit[0].action).toBe("TASK_CREATED");
    expect(reloaded.result.current.storageIssue).toBeNull();
  });

  it("retains a user's genuinely empty board instead of replacing it with demo data", () => {
    localStorage.setItem("mini-jira:tasks", "[]");
    localStorage.setItem("mini-jira:comments", "{}");
    localStorage.setItem("mini-jira:audit", "[]");
    const { result } = renderHook(() => useJiraStore());
    expect(result.current.tasks).toEqual([]);
    expect(result.current.storageIssue).toBeNull();
  });

  it("does not write when reads are denied, even if writes would be permitted", () => {
    const get = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    const set = vi.spyOn(Storage.prototype, "setItem");
    try {
      const { result } = renderHook(() => useJiraStore());
      expect(result.current.storageIssue).toBe("unavailable");
      act(() => { result.current.createTask(form); });
      expect(result.current.tasks[0].title).toBe(form.title);
      expect(set).not.toHaveBeenCalled();
    } finally {
      get.mockRestore();
      set.mockRestore();
    }
  });

  it.each(["QuotaExceededError", "SecurityError"])("stops persistence after %s without losing session edits", (name) => {
    localStorage.setItem("mini-jira:tasks", JSON.stringify(initialTasks));
    localStorage.setItem("mini-jira:audit", JSON.stringify(initialAudit));
    const { result } = renderHook(() => useJiraStore());
    const saved = localStorage.getItem("mini-jira:tasks");
    const set = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("not writable", name);
    });
    try {
      act(() => { result.current.createTask(form); });
      expect(result.current.storageIssue).toBe("unavailable");
      expect(result.current.tasks[0].title).toBe(form.title);
      expect(localStorage.getItem("mini-jira:tasks")).toBe(saved);
      const calls = set.mock.calls.length;
      act(() => { result.current.createTask({ ...form, title: "Drugi task" }); });
      expect(set).toHaveBeenCalledTimes(calls);
      expect(result.current.tasks[0].title).toBe("Drugi task");
    } finally {
      set.mockRestore();
    }
  });

  it("shows the warning and export action before login without replacing corrupt data", () => {
    localStorage.setItem("mini-jira:tasks", "null");
    render(<App />);
    expect(screen.getByRole("alert")).toHaveTextContent("Zmiany nie są zapisywane");
    expect(screen.getByRole("alert")).toHaveTextContent("Oryginał pozostawiono bez zmian");
    expect(screen.getByRole("button", { name: "Eksportuj bieżącą sesję" })).toBeVisible();
    expect(localStorage.getItem("mini-jira:tasks")).toBe("null");
  });
});
