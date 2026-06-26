import { useEffect } from "react";
import { Button } from "./Button";

interface ShortcutsDialogProps {
  open: boolean;
  onClose: () => void;
}

const shortcuts: { keys: string; label: string }[] = [
  { keys: "1", label: "Widok: Lista" },
  { keys: "2", label: "Widok: Tablica" },
  { keys: "3", label: "Widok: Dashboard" },
  { keys: "/", label: "Fokus w wyszukiwarce" },
  { keys: "?", label: "Ta pomoc" },
  { keys: "Esc", label: "Zamknij okno" },
];

export function ShortcutsDialog({ open, onClose }: ShortcutsDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="relative w-full max-w-sm animate-pop-in rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 id="shortcuts-title" className="text-lg font-bold">
          Skróty klawiszowe
        </h2>
        <ul className="mt-4 space-y-2">
          {shortcuts.map((shortcut) => (
            <li
              key={shortcut.keys}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="text-slate-600 dark:text-slate-300">
                {shortcut.label}
              </span>
              <kbd className="rounded-lg border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {shortcut.keys}
              </kbd>
            </li>
          ))}
        </ul>
        <Button
          variant="secondary"
          fullWidth
          autoFocus
          onClick={onClose}
          className="mt-5"
        >
          Zamknij
        </Button>
      </div>
    </div>
  );
}
