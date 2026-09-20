import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Task } from "../../types";
import { KanbanBoard } from "./KanbanBoard";

function task(overrides: Partial<Task>): Task {
  return {
    id: "x",
    title: "Zadanie",
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

const tasks: Task[] = [
  task({ id: "a", title: "Zadanie A", status: "To do" }),
  task({ id: "b", title: "Zadanie B", status: "Done" }),
];

describe("KanbanBoard", () => {
  it("renders both task cards", () => {
    render(
      <KanbanBoard
        tasks={tasks}
        selectedTaskId={null}
        onSelectTask={() => {}}
        onMoveTask={() => {}}
      />,
    );
    expect(screen.getByText("Zadanie A")).toBeInTheDocument();
    expect(screen.getByText("Zadanie B")).toBeInTheDocument();
  });

  it("moves a task to the next column via the ▶ button", () => {
    const onMoveTask = vi.fn();
    render(
      <KanbanBoard
        tasks={tasks}
        selectedTaskId={null}
        onSelectTask={() => {}}
        onMoveTask={onMoveTask}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Przenieś.*Zadanie A.*In progress/ }),
    );
    expect(onMoveTask).toHaveBeenCalledWith("a", "In progress", null);
  });

  it("disables moving forward from the last column", () => {
    render(
      <KanbanBoard
        tasks={tasks}
        selectedTaskId={null}
        onSelectTask={() => {}}
        onMoveTask={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Brak następnej kolumny" }),
    ).toBeDisabled();
  });
});
