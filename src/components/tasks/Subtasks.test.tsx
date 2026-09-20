import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SubTask } from "../../types";
import { Subtasks } from "./Subtasks";

const subtasks: SubTask[] = [
  { id: "1", title: "Krok pierwszy", done: true },
  { id: "2", title: "Krok drugi", done: false },
];

describe("Subtasks", () => {
  it("shows the completion ratio", () => {
    render(
      <Subtasks
        subtasks={subtasks}
        onAdd={() => {}}
        onToggle={() => {}}
        onRemove={() => {}}
      />,
    );
    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("adds a subtask from the input", () => {
    const onAdd = vi.fn();
    render(
      <Subtasks
        subtasks={subtasks}
        onAdd={onAdd}
        onToggle={() => {}}
        onRemove={() => {}}
      />,
    );
    fireEvent.change(screen.getByLabelText("Nowe podzadanie"), {
      target: { value: "Nowy krok" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Dodaj" }));
    expect(onAdd).toHaveBeenCalledWith("Nowy krok");
  });

  it("toggles and removes a subtask", () => {
    const onToggle = vi.fn();
    const onRemove = vi.fn();
    render(
      <Subtasks
        subtasks={subtasks}
        onAdd={() => {}}
        onToggle={onToggle}
        onRemove={onRemove}
      />,
    );
    fireEvent.click(screen.getAllByRole("checkbox")[0]);
    expect(onToggle).toHaveBeenCalledWith("1");

    fireEvent.click(
      screen.getByRole("button", { name: /Usuń podzadanie .*Krok pierwszy/ }),
    );
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
