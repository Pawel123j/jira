import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { emptyTaskForm } from "../data/seed";
import { loadState } from "../lib/storage";
import type { ExportPayload, TaskFormState } from "../types";
import { useJiraStore } from "./useJiraStore";

const form: TaskFormState = { ...emptyTaskForm, title: "Nowy task" };

describe("useJiraStore", () => {
  it("starts from seed data", () => {
    const { result } = renderHook(() => useJiraStore());
    expect(result.current.tasks).toHaveLength(3);
  });

  it("creates a task and records an audit entry", () => {
    const { result } = renderHook(() => useJiraStore());
    act(() => {
      result.current.createTask(form);
    });
    expect(result.current.tasks).toHaveLength(4);
    expect(result.current.tasks[0].title).toBe("Nowy task");
    expect(result.current.audit[0].action).toBe("TASK_CREATED");
  });

  it("updates a task's title", () => {
    const { result } = renderHook(() => useJiraStore());
    act(() => {
      result.current.updateTask("1", { ...form, title: "Zmieniony" });
    });
    const task = result.current.tasks.find((t) => t.id === "1");
    expect(task?.title).toBe("Zmieniony");
    expect(result.current.audit[0].action).toBe("TASK_UPDATED");
  });

  it("toggles soft delete and back", () => {
    const { result } = renderHook(() => useJiraStore());
    let nextDeleted: unknown;
    act(() => {
      nextDeleted = result.current.toggleDelete("1");
    });
    expect(nextDeleted).toBe(true);
    expect(result.current.tasks.find((t) => t.id === "1")?.deleted).toBe(true);
    act(() => {
      nextDeleted = result.current.toggleDelete("1");
    });
    expect(nextDeleted).toBe(false);
  });

  it("moves a task across columns and reorders the array", () => {
    const { result } = renderHook(() => useJiraStore());
    act(() => {
      result.current.moveTask("1", "Done", "3");
    });
    const moved = result.current.tasks.find((t) => t.id === "1");
    expect(moved?.status).toBe("Done");
    const ids = result.current.tasks.map((t) => t.id);
    expect(ids.indexOf("1")).toBeLessThan(ids.indexOf("3"));
    expect(result.current.audit[0].action).toBe("TASK_STATUS_CHANGED");
  });

  it("hard-deletes a task and its comments", () => {
    const { result } = renderHook(() => useJiraStore());
    act(() => {
      result.current.deleteTask("2");
    });
    expect(result.current.tasks.find((t) => t.id === "2")).toBeUndefined();
    expect(result.current.comments["2"]).toBeUndefined();
    expect(result.current.audit[0].action).toBe("TASK_DELETED");
  });

  it("adds, toggles and removes a subtask without flooding the audit log", () => {
    const { result } = renderHook(() => useJiraStore());
    const auditBefore = result.current.audit.length;

    act(() => {
      result.current.addSubtask("1", "Nowy krok");
    });
    const created = result.current.tasks
      .find((t) => t.id === "1")
      ?.subtasks.find((s) => s.title === "Nowy krok");
    expect(created).toBeDefined();
    // Subtask edits should not add audit entries.
    expect(result.current.audit.length).toBe(auditBefore);

    act(() => {
      result.current.toggleSubtask("1", created!.id);
    });
    expect(
      result.current.tasks
        .find((t) => t.id === "1")
        ?.subtasks.find((s) => s.id === created!.id)?.done,
    ).toBe(true);

    act(() => {
      result.current.removeSubtask("1", created!.id);
    });
    expect(
      result.current.tasks
        .find((t) => t.id === "1")
        ?.subtasks.some((s) => s.id === created!.id),
    ).toBe(false);
  });

  it("adds a comment to a task", () => {
    const { result } = renderHook(() => useJiraStore());
    act(() => {
      result.current.addComment("1", "Cześć");
    });
    expect(result.current.comments["1"][0].text).toBe("Cześć");
    expect(result.current.audit[0].action).toBe("COMMENT_CREATED");
  });

  it("persists tasks to localStorage", () => {
    const { result } = renderHook(() => useJiraStore());
    act(() => {
      result.current.createTask(form);
    });
    const stored = loadState<ExportPayload | null>("snapshot", null);
    expect(stored?.tasks).toHaveLength(4);
    expect(stored?.comments[stored!.tasks[0].id]).toEqual([]);
  });

  it("imports a payload, replacing state", () => {
    const { result } = renderHook(() => useJiraStore());
    const payload: ExportPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks: [
        {
          id: "x",
          title: "Z importu",
          description: "",
          priority: "LOW",
          status: "To do",
          assignees: [],
          due: "",
          tags: [],
          points: 0,
          subtasks: [],
          deleted: false,
          createdAt: "2026-10-28T10:00:00Z",
          updatedAt: "2026-10-28T10:00:00Z",
        },
      ],
      comments: { x: [] },
      audit: [],
    };
    act(() => {
      result.current.importData(payload);
    });
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe("Z importu");
    expect(result.current.audit[0].action).toBe("DATA_IMPORTED");
  });
});


describe("storage recovery", () => {
  it.each(["{}", "[null]", "not-json"])("preserves invalid legacy state %s", (raw) => {
    localStorage.setItem("mini-jira:tasks", raw);
    const { result } = renderHook(() => useJiraStore());
    expect(result.current.tasks).toHaveLength(3);
    expect(result.current.saveError).toContain("Nie można odczytać");
    act(() => { result.current.createTask(form); });
    expect(localStorage.getItem("mini-jira:tasks")).toBe(raw);
    expect(localStorage.getItem("mini-jira:snapshot")).toBeNull();
    expect(result.current.recoveryRaw).toContain(raw.replace(/"/g, '\\"'));
  });
  it("keeps changes in memory when quota is exceeded and retries one consistent snapshot", () => {
    const { result, unmount } = renderHook(() => useJiraStore());
    const previous = localStorage.getItem("mini-jira:snapshot");
    const fail = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Full", "QuotaExceededError"); });
    act(() => { result.current.createTask(form); });
    expect(result.current.tasks).toHaveLength(4);
    expect(result.current.saveError).toContain("Nie zapisano");
    expect(localStorage.getItem("mini-jira:snapshot")).toBe(previous);
    fail.mockRestore();
    act(() => { result.current.retrySave(); });
    expect(result.current.saveError).toBe("");
    unmount();
    const reloaded = renderHook(() => useJiraStore());
    expect(reloaded.result.current.tasks).toHaveLength(4);
    expect(reloaded.result.current.audit[0].action).toBe("TASK_CREATED");
  });
});
