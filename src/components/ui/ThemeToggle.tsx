import type { ThemeMode } from "../../types";

interface ThemeToggleProps {
  theme: ThemeMode;
  onChange: (theme: ThemeMode) => void;
}

const inactive =
  "border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="Wybór motywu">
      <button
        type="button"
        aria-pressed={theme === "light"}
        onClick={() => onChange("light")}
        className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
          theme === "light"
            ? "border-blue-500 bg-blue-500/10 text-blue-600"
            : inactive
        }`}
      >
        ☀️ Jasny
      </button>
      <button
        type="button"
        aria-pressed={theme === "dark"}
        onClick={() => onChange("dark")}
        className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
          theme === "dark"
            ? "border-violet-500 bg-violet-500/10 text-violet-500"
            : inactive
        }`}
      >
        🌙 Ciemny
      </button>
    </div>
  );
}
