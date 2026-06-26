import { describe, expect, it } from "vitest";
import { formatDue, isOverdue, makeId } from "./format";

describe("formatDue", () => {
  it("returns 'brak' for an empty value", () => {
    expect(formatDue("")).toBe("brak");
  });

  it("returns the raw value when it is not a valid date", () => {
    expect(formatDue("nie-data")).toBe("nie-data");
  });

  it("formats a valid ISO date", () => {
    expect(formatDue("2026-03-25T18:00")).toContain("2026");
  });
});

describe("isOverdue", () => {
  it("is true for a past due date that is not done or deleted", () => {
    expect(isOverdue("2000-01-01T00:00", "To do", false)).toBe(true);
  });

  it("is false for a future due date", () => {
    expect(isOverdue("2999-01-01T00:00", "To do", false)).toBe(false);
  });

  it("is false when the task is done", () => {
    expect(isOverdue("2000-01-01T00:00", "Done", false)).toBe(false);
  });

  it("is false when the task is deleted", () => {
    expect(isOverdue("2000-01-01T00:00", "To do", true)).toBe(false);
  });

  it("is false when there is no due date", () => {
    expect(isOverdue("", "To do", false)).toBe(false);
  });
});

describe("makeId", () => {
  it("includes the given prefix", () => {
    expect(makeId("task")).toMatch(/^task-/);
  });

  it("produces unique ids", () => {
    expect(makeId()).not.toBe(makeId());
  });
});
