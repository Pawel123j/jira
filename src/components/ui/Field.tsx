import type { ReactNode } from "react";

export const inputClasses =
  "w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500";

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

/** Label + control wrapper with optional hint/error text. */
export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="block">
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-500" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
