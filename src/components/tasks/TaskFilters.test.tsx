import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { defaultFilters } from "../../data/seed";
import { TaskFilters } from "./TaskFilters";

describe("TaskFilters", () => {
  it("reports search text changes", () => {
    const onChange = vi.fn();
    render(
      <TaskFilters
        filters={defaultFilters}
        onChange={onChange}
        onReset={() => {}}
        resultCount={3}
      />,
    );
    fireEvent.change(screen.getByLabelText("Szukaj zadań"), {
      target: { value: "bug" },
    });
    expect(onChange).toHaveBeenCalledWith({ search: "bug" });
  });

  it("toggles the 'only mine' filter", () => {
    const onChange = vi.fn();
    render(
      <TaskFilters
        filters={defaultFilters}
        onChange={onChange}
        onReset={() => {}}
        resultCount={3}
      />,
    );
    fireEvent.click(screen.getByLabelText("Tylko moje"));
    expect(onChange).toHaveBeenCalledWith({ onlyMine: true });
  });

  it("calls onReset from the clear button", () => {
    const onReset = vi.fn();
    render(
      <TaskFilters
        filters={defaultFilters}
        onChange={() => {}}
        onReset={onReset}
        resultCount={3}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Wyczyść filtry" }));
    expect(onReset).toHaveBeenCalled();
  });
});
