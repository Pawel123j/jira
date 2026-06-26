import { useCallback, useEffect, useState } from "react";
import { loadState, saveState } from "../lib/storage";
import type { ThemeMode } from "../types";

/**
 * Theme state backed by localStorage. Toggles the `dark` class on <html>
 * so Tailwind's `dark:` variants drive all theming.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    loadState<ThemeMode>("theme", "dark"),
  );

  useEffect(() => {
    saveState("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const setTheme = useCallback((next: ThemeMode) => setThemeState(next), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    [],
  );

  return { theme, isDark: theme === "dark", setTheme, toggleTheme };
}
