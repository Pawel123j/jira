import { describe, expect, it } from "vitest";
import type { Task } from "../types";
import { sortTasks } from "./sort";

function task(overrides: Partial<Task>): Task {
  return {
    id: "x",
    title: "Task",
    description: "",
    priority: "MEDIUM",
    status: "To do",
    assignees: [],
    due: "",
    tags: [],
    subtasks: [],
    deleted: false,
    createdAt: "2026-01-01T00:00",
    updatedAt: "2026-01-01T00:00",
    ...overrides,
  };
}

const tasks: Task[] = [
  task({ id: "low", priority: "LOW", title: "Bravo", due: "2026-05-01T00:00", updatedAt: "2026-01-01T00:00" }),
  task({ id: "crit", priority: "CRITICAL", title: "Alfa", due: "", updatedAt: "2026-03-01T00:00" }),
  task({ id: "high", priority: "HIGH", title: "Charlie", due: "2026-02-01T00:00", updatedAt: "2026-02-01T00:00" }),
];

describe("sortTasks", () => {
  it("keeps the original order for 'manual'", () => {
    expect(sortTasks(tasks, "manual").map((t) => t.id)).toEqual([
      "low",
      "crit",
      "high",
    ]);
  });

  it("does not mutate the input array", () => {
    const before = tasks.map((t) => t.id);
    sortTasks(tasks, "priority");
    expect(tasks.map((t) => t.id)).toEqual(before);
  });

  it("sorts by priority (critical first)", () => {
    expect(sortTasks(tasks, "priority").map((t) => t.id)).toEqual([
      "crit",
      "high",
      "low",
    ]);
  });

  it("sorts by due date with empty dates last", () => {
    expect(sortTasks(tasks, "due").map((t) => t.id)).toEqual([
      "high",
      "low",
      "crit",
    ]);
  });

  it("sorts by most recently updated", () => {
    expect(sortTasks(tasks, "updated").map((t) => t.id)).toEqual([
      "crit",
      "high",
      "low",
    ]);
  });

  it("sorts by title A→Z", () => {
    expect(sortTasks(tasks, "title").map((t) => t.id)).toEqual([
      "crit",
      "low",
      "high",
    ]);
  });
});
