import { priorityOptions, statusOptions, tagOptions, teamMembers } from "../../data/seed";
import type { TaskFormState, TaskPriority, TaskStatus } from "../../types";
import { Chip } from "../ui/Chip";
import { Field, inputClasses } from "../ui/Field";

interface TaskFormProps {
  idPrefix: string;
  value: TaskFormState;
  onChange: (patch: Partial<TaskFormState>) => void;
  titleError?: string;
}

function toggle(list: string[], item: string): string[] {
  return list.includes(item)
    ? list.filter((value) => value !== item)
    : [...list, item];
}

/** Controlled task editor shared by the create and edit panels. */
export function TaskForm({ idPrefix, value, onChange, titleError }: TaskFormProps) {
  return (
    <div className="space-y-4">
      <Field label="Tytuł" htmlFor={`${idPrefix}-title`} error={titleError}>
        <input
          id={`${idPrefix}-title`}
          value={value.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className={inputClasses}
          placeholder="Np. Dodać role użytkowników"
          aria-invalid={Boolean(titleError)}
        />
      </Field>

      <Field label="Opis" htmlFor={`${idPrefix}-description`}>
        <textarea
          id={`${idPrefix}-description`}
          value={value.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className={`${inputClasses} h-28 resize-y`}
          placeholder="Krótki opis zadania"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Status" htmlFor={`${idPrefix}-status`}>
          <select
            id={`${idPrefix}-status`}
            value={value.status}
            onChange={(e) => onChange({ status: e.target.value as TaskStatus })}
            className={inputClasses}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priorytet" htmlFor={`${idPrefix}-priority`}>
          <select
            id={`${idPrefix}-priority`}
            value={value.priority}
            onChange={(e) =>
              onChange({ priority: e.target.value as TaskPriority })
            }
            className={inputClasses}
          >
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Termin" htmlFor={`${idPrefix}-due`}>
        <input
          id={`${idPrefix}-due`}
          type="datetime-local"
          value={value.due}
          onChange={(e) => onChange({ due: e.target.value })}
          className={inputClasses}
        />
      </Field>

      <div>
        <div className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Przypisani
        </div>
        <div className="flex flex-wrap gap-2">
          {teamMembers.map((member) => (
            <Chip
              key={member.name}
              label={member.name}
              color="blue"
              active={value.assignees.includes(member.name)}
              onClick={() => onChange({ assignees: toggle(value.assignees, member.name) })}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          Tagi
        </div>
        <div className="flex flex-wrap gap-2">
          {tagOptions.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              color="violet"
              active={value.tags.includes(tag)}
              onClick={() => onChange({ tags: toggle(value.tags, tag) })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
