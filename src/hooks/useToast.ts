import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Transient status messages. A new message resets the auto-dismiss timer;
 * the toast bar only renders while a message is present.
 */
export function useToast() {
  const [toast, setToast] = useState("");
  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const showToast = useCallback((message: string, duration = 3500) => {
    setToast(message);
    clearTimer();
    if (duration > 0) {
      timerRef.current = window.setTimeout(() => setToast(""), duration);
    }
  }, []);

  const dismissToast = useCallback(() => {
    clearTimer();
    setToast("");
  }, []);

  useEffect(() => clearTimer, []);

  return { toast, showToast, dismissToast };
}
