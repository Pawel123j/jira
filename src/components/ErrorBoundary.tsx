import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Catches unexpected render/runtime errors and shows a friendly fallback
 * instead of a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Nieobsłużony błąd UI:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="text-3xl" aria-hidden="true">
            😵
          </div>
          <h1 className="mt-3 text-xl font-bold">Coś poszło nie tak</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Aplikacja napotkała nieoczekiwany błąd. Odśwież stronę, aby spróbować
            ponownie.
          </p>
          {this.state.message && (
            <p className="mt-3 break-words rounded-2xl bg-slate-100 p-3 text-left font-mono text-xs text-slate-600 dark:bg-slate-950/60 dark:text-slate-400">
              {this.state.message}
            </p>
          )}
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 font-bold text-white"
          >
            Odśwież stronę
          </button>
        </div>
      </div>
    );
  }
}
