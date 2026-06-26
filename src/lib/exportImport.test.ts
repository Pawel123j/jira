import { describe, expect, it } from "vitest";
import { initialAudit, initialComments, initialTasks } from "../data/seed";
import { buildExport, parseImport } from "./exportImport";

describe("buildExport", () => {
  it("wraps the state in a versioned payload", () => {
    const payload = buildExport(initialTasks, initialComments, initialAudit);
    expect(payload.version).toBe(1);
    expect(payload.tasks).toHaveLength(initialTasks.length);
    expect(typeof payload.exportedAt).toBe("string");
  });
});

describe("parseImport", () => {
  it("round-trips a valid export", () => {
    const json = JSON.stringify(
      buildExport(initialTasks, initialComments, initialAudit),
    );
    const parsed = parseImport(json);
    expect(parsed).not.toBeNull();
    expect(parsed?.tasks).toHaveLength(initialTasks.length);
  });

  it("returns null for invalid JSON", () => {
    expect(parseImport("{ nope")).toBeNull();
  });

  it("returns null when tasks are missing", () => {
    expect(parseImport(JSON.stringify({ comments: {} }))).toBeNull();
  });

  it("returns null when tasks are not task-like", () => {
    expect(parseImport(JSON.stringify({ tasks: [{ foo: 1 }] }))).toBeNull();
  });

  it("defaults comments and audit when absent", () => {
    const parsed = parseImport(
      JSON.stringify({ tasks: [initialTasks[0]] }),
    );
    expect(parsed?.comments).toEqual({});
    expect(parsed?.audit).toEqual([]);
  });
});
