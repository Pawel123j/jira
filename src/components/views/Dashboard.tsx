import { priorityOptions, statusOptions } from "../../data/seed";
import { priorityDotClasses, statusAccentClasses } from "../../lib/badges";
import { isOverdue } from "../../lib/format";
import { auditActionLabels } from "../../lib/labels";
import { pointsSummary } from "../../lib/stats";
import type { AuditItem, Task } from "../../types";

interface DashboardProps {
  tasks: Task[];
  audit: AuditItem[];
}

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  accent?: string;
}

function StatCard({ label, value, hint, accent }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/20">
      <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className={`mt-2 text-3xl font-extrabold ${accent ?? ""}`}>{value}</div>
      {hint ? (
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</div>
      ) : null}
    </div>
  );
}

interface DistributionRow {
  label: string;
  count: number;
  dotClass: string;
}

function Distribution({
  title,
  rows,
  total,
}: {
  title: string;
  rows: DistributionRow[];
  total: number;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/20">
      <h3 className="text-lg font-bold">{title}</h3>
      <div className="mt-4 space-y-3">
        {rows.map((row) => {
          const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
          return (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${row.dotClass}`} />
                  {row.label}
                </span>
                <span className="font-semibold">{row.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Dashboard({ tasks, audit }: DashboardProps) {
  const active = tasks.filter((task) => !task.deleted);
  const total = active.length;
  const done = active.filter((task) => task.status === "Done").length;
  const overdue = active.filter((task) =>
    isOverdue(task.due, task.status, task.deleted),
  ).length;
  const deleted = tasks.length - active.length;
  const completion = total > 0 ? Math.round((done / total) * 100) : 0;

  const statusRows: DistributionRow[] = statusOptions.map((status) => ({
    label: status,
    count: active.filter((task) => task.status === status).length,
    dotClass: statusAccentClasses[status],
  }));

  const priorityRows: DistributionRow[] = priorityOptions.map((priority) => ({
    label: priority,
    count: active.filter((task) => task.priority === priority).length,
    dotClass: priorityDotClasses[priority],
  }));

  const points = pointsSummary(tasks);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Aktywne zadania" value={total} />
        <StatCard
          label="Ukończone"
          value={done}
          hint={`${completion}% wszystkich`}
          accent="text-emerald-500"
        />
        <StatCard
          label="Po terminie"
          value={overdue}
          accent={overdue > 0 ? "text-amber-500" : undefined}
        />
        <StatCard label="Soft deleted" value={deleted} accent="text-red-500" />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/20">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold">Postęp projektu</h3>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {done}/{total} ukończonych
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/20">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-bold">Story points</h3>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {points.done}/{points.total} pkt · zostało {points.remaining}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all"
            style={{ width: `${points.pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Distribution title="Według statusu" rows={statusRows} total={total} />
        <Distribution title="Według priorytetu" rows={priorityRows} total={total} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-slate-950/20">
        <h3 className="text-lg font-bold">Ostatnia aktywność</h3>
        <div className="mt-4 space-y-2">
          {audit.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-950/60"
            >
              <span className="font-medium">{auditActionLabels[item.action]}</span>
              <span className="text-slate-500 dark:text-slate-400">
                {item.actor} · {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
