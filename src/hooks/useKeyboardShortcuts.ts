import { useEffect } from "react";

type ShortcutMap = Record<string, () => void>;

const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/**
 * Binds single-key shortcuts to the window. Ignores key presses while the user
 * is typing in a form field. The handler map should be memoised by the caller.
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (EDITABLE_TAGS.has(target.tagName) || target.isContentEditable)) {
        return;
      }
      const action = shortcuts[event.key];
      if (action) {
        event.preventDefault();
        action();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts, enabled]);
}
