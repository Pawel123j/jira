import { useState, type FormEvent } from "react";
import { demoCredentials } from "../../data/seed";
import type { ThemeMode } from "../../types";
import { Button } from "../ui/Button";
import { Field, inputClasses } from "../ui/Field";
import { ThemeToggle } from "../ui/ThemeToggle";

interface LoginScreenProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  /** Returns true on success; false shows an inline credential error. */
  onLogin: (email: string, password: string) => boolean;
}

export function LoginScreen({ theme, onThemeChange, onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState(demoCredentials.email);
  const [password, setPassword] = useState(demoCredentials.password);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Wpisz email i hasło.");
      return;
    }
    if (!onLogin(email.trim(), password)) {
      setError("Błędny email lub hasło.");
      return;
    }
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md animate-pop-in rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-500">
              Mini Jira
            </span>
            <h1 className="mt-4 text-3xl font-bold">Logowanie</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Wejdź do panelu i zarządzaj zadaniami.
            </p>
          </div>
          <ThemeToggle theme={theme} onChange={onThemeChange} />
        </div>

        <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/60">
          <div className="font-semibold">Dane demo</div>
          <div className="mt-2 space-y-1 text-slate-500 dark:text-slate-400">
            <div>Email: {demoCredentials.email}</div>
            <div>Hasło: {demoCredentials.password}</div>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <Field label="Email" htmlFor="login-email">
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              placeholder="Wpisz email"
            />
          </Field>

          <Field label="Hasło" htmlFor="login-password" error={error}>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
              placeholder="Wpisz hasło"
            />
          </Field>

          <Button type="submit" variant="primary" fullWidth>
            Zaloguj się
          </Button>
        </form>
      </div>
    </div>
  );
}
