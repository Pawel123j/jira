import type { ToastItem } from "../../hooks/useToast";

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

/** Renders the stack of toasts pinned to the top of the viewport. */
export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex flex-col items-center gap-2 px-4 pt-4 sm:pt-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className="pointer-events-auto flex w-full max-w-md animate-slide-down items-center justify-between gap-4 rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200"
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Zamknij powiadomienie"
            className="rounded-lg px-2 py-0.5 text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-700/60 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
