import { useCallback, useEffect, useRef, useState } from "react";
import { makeId } from "../lib/format";

export interface ToastItem {
  id: string;
  message: string;
}

/**
 * Stack of transient status messages. Each toast auto-dismisses after
 * `duration` ms (set 0 to keep it until dismissed manually).
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<number[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, duration = 3500): string => {
    const id = makeId("toast");
    setToasts((prev) => [...prev, { id, message }]);
    if (duration > 0) {
      const timer = window.setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
      timers.current.push(timer);
    }
    return id;
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  return { toasts, showToast, dismissToast };
}
