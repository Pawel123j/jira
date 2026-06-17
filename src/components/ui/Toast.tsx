interface ToastProps {
  message: string;
  onDismiss: () => void;
}

/** Sticky status banner. Renders nothing when there is no message. */
export function Toast({ message, onDismiss }: ToastProps) {
  if (!message) return null;

  return (
    <div className="pointer-events-none sticky top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto mx-auto flex max-w-7xl animate-slide-down items-center justify-between gap-4 rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200"
      >
        <span>{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Zamknij powiadomienie"
          className="rounded-lg px-2 py-0.5 text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-700/60 dark:hover:text-slate-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
