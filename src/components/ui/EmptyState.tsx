import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
      {icon ? <div className="text-3xl" aria-hidden="true">{icon}</div> : null}
      <div className="font-semibold text-slate-700 dark:text-slate-200">{title}</div>
      {description ? (
        <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      ) : null}
      {action}
    </div>
  );
}
