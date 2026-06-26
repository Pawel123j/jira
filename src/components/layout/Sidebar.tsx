import { useRef, type ChangeEvent } from "react";
import { currentUser, teamMembers } from "../../data/seed";
import { auditActionLabels, roleLabels } from "../../lib/labels";
import type { AuditItem, ThemeMode } from "../../types";
import { Button } from "../ui/Button";
import { ThemeToggle } from "../ui/ThemeToggle";

interface SidebarProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  audit: AuditItem[];
  onLogout: () => void;
  onResetDemo: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

const sectionTitle =
  "text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400";

export function Sidebar({
  theme,
  onThemeChange,
  audit,
  onLogout,
  onResetDemo,
  onExport,
  onImport,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onImport(file);
    event.target.value = "";
  };

  return (
    <aside className="flex h-full flex-col gap-6 overflow-y-auto border-slate-200 bg-white/80 p-6 backdrop-blur-xl scrollbar-thin dark:border-slate-800/80 dark:bg-slate-950/70 lg:border-r">
      <div>
        <span className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-500">
          Mini Jira
        </span>
        <h2 className="mt-4 text-2xl font-bold">{currentUser.name}</h2>
        <p className="text-slate-500 dark:text-slate-400">{currentUser.email}</p>
        <span className="mt-2 inline-flex rounded-full bg-violet-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">
          {roleLabels[currentUser.role]}
        </span>
      </div>

      <div className="space-y-3">
        <div className={sectionTitle}>Motyw</div>
        <ThemeToggle theme={theme} onChange={onThemeChange} />
      </div>

      <div className="space-y-3">
        <div className={sectionTitle}>Zespół</div>
        <ul className="space-y-2">
          {teamMembers.map((member) => (
            <li
              key={member.email}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950/60"
            >
              <span className="font-medium">{member.name}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {roleLabels[member.role]}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        <div className={sectionTitle}>Audit log</div>
        <div className="space-y-2">
          {audit.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div className="text-sm font-semibold">
                {auditActionLabels[item.action]}
              </div>
              {item.detail ? (
                <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {item.detail}
                </div>
              ) : null}
              <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                {item.actor} · {item.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto space-y-3 pt-2">
        <div className={sectionTitle}>Dane</div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={onExport}>
            Eksport
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Import
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button variant="secondary" fullWidth onClick={onResetDemo}>
          Reset danych demo
        </Button>
        <Button variant="danger" fullWidth onClick={onLogout}>
          Wyloguj
        </Button>
      </div>
    </aside>
  );
}
