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

  it.each([
    { tasks: [{ ...initialTasks[0], tags: null }] },
    { tasks: [{ ...initialTasks[0], status: "Unknown" }] },
    { tasks: [initialTasks[0], initialTasks[0]] },
    { tasks: initialTasks, comments: { "1": {} } },
    { tasks: initialTasks, audit: [null] },
  ])("rejects malformed import instead of persisting broken UI data: %j", (payload) => {
    expect(parseImport(JSON.stringify(payload))).toBeNull();
  });
});


describe("reject malformed snapshots before mutating data", () => {
  it.each([null, {}, [null], { tasks: [null] }, { tasks: [{ ...initialTasks[0], status: "unknown" }] }, { tasks: [{ ...initialTasks[0], due: "2026-02-31" }] }, { tasks: [initialTasks[0], initialTasks[0]] }, { version: 9, tasks: [] }, { tasks: [], comments: { missing: [] } }])("rejects %j", (payload) => {
    expect(parseImport(JSON.stringify(payload))).toBeNull();
  });
});


describe("nested snapshot validation", () => {
  const valid = () => buildExport(initialTasks, initialComments, initialAudit);

  it.each([
    { title: "   " }, { status: ["Done"] }, { priority: ["LOW"] },
    { id: "__proto__" }, { id: "constructor" }, { id: "toString" },
    { points: null }, { points: -1 }, { points: "3" },
    { subtasks: null }, { subtasks: [{ id: "s", title: "Step", done: "false" }] },
    { subtasks: [{ id: "s", title: "A", done: false }, { id: "s", title: "B", done: true }] },
    { assignees: [null] }, { tags: {} }, { deleted: "false" },
    { createdAt: "2026-02-31T10:00:00Z" }, { updatedAt: "not-a-date" },
  ])("rejects invalid task fields without normalizing bad types: %j", patch => {
    expect(parseImport(JSON.stringify({ tasks: [{ ...initialTasks[0], ...patch }] }))).toBeNull();
  });

  it.each([
    { comments: null }, { audit: null }, { version: null },
    { comments: { missing: [] } },
    { comments: { "1": [{ id: "c", author: "a", text: {}, time: "now" }] } },
    { comments: { "1": [{ id: "c", author: "a", text: "a", time: "now" }, { id: "c", author: "a", text: "b", time: "now" }] } },
    { audit: [{ id: "a", action: "TASK_CREATED", actor: "a", time: "now", detail: {} }] },
    { audit: [{ id: "a", action: ["TASK_CREATED"], actor: "a", time: "now" }] },
  ])("rejects malformed version, comments or history: %j", patch => {
    expect(parseImport(JSON.stringify({ ...valid(), ...patch }))).toBeNull();
  });

  it("only defaults missing legacy fields and preserves an empty board", () => {
    const task = { ...initialTasks[0] } as Partial<typeof initialTasks[0]>;
    delete task.points;
    delete task.subtasks;
    expect(parseImport(JSON.stringify({ tasks: [task] }))?.tasks[0]).toMatchObject({ points: 0, subtasks: [] });
    expect(parseImport('{"tasks":[]}')).toMatchObject({ tasks: [], comments: {}, audit: [] });
  });
});
