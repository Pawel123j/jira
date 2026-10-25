/**
 * Tiny typed wrapper around localStorage that fails gracefully when storage
 * is unavailable (private mode, SSR, quota errors).
 */

const PREFIX = "mini-jira:";

export type StorageIssue = "invalid" | "unavailable";

export function readState<T>(
  key: string,
  fallback: T,
  parse: (value: unknown) => T | null,
): { value: T; issue: StorageIssue | null } {
  if (typeof window === "undefined") return { value: fallback, issue: "unavailable" };
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(PREFIX + key);
  } catch {
    return { value: fallback, issue: "unavailable" };
  }
  if (raw === null) return { value: fallback, issue: null };
  try {
    const value = parse(JSON.parse(raw));
    if (value !== null) return { value, issue: null };
  } catch {
    // Keep the original value in its key, including malformed JSON.
  }
  return { value: fallback, issue: "invalid" };
}

export function loadState<T>(key: string, fallback: T): T {
  return readState(key, fallback, (value) => value as T).value;
}

export function saveState<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
