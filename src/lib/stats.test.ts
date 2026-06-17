import { describe, expect, it } from "vitest";
import type { Task } from "../types";
import { pointsSummary } from "./stats";

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
    points: 0,
    subtasks: [],
    deleted: false,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

describe("pointsSummary", () => {
  it("sums points, counting done separately and ignoring deleted", () => {
    const summary = pointsSummary([
      task({ points: 5, status: "Done" }),
      task({ points: 3, status: "In progress" }),
      task({ points: 8, status: "Done", deleted: true }),
    ]);
    expect(summary.total).toBe(8);
    expect(summary.done).toBe(5);
    expect(summary.remaining).toBe(3);
    expect(summary.pct).toBe(63);
  });

  it("returns zeros and 0% when there are no points", () => {
    expect(pointsSummary([task({})])).toEqual({
      total: 0,
      done: 0,
      remaining: 0,
      pct: 0,
    });
  });
});
