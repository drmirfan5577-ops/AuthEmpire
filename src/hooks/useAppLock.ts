import { useState, useEffect, useCallback, useRef } from "react";
import { SETTINGS_KEY } from "@/constants";

interface LockState {
  isLocked: boolean;
  lastUnlocked: number | null;
}

export function useAppLock() {
  const [lockState, setLockState] = useState<LockState>(() => {
    // App starts locked if has been locked before
    const stored = localStorage.getItem("authempire_lock");
    if (stored) {
      const parsed = JSON.parse(stored);
      return { isLocked: true, lastUnlocked: parsed.lastUnlocked };
    }
    return { isLocked: false, lastUnlocked: Date.now() };
  });
  
  const activityTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const getAutoLockTimeout = useCallback((): number => {
    try {
      const settings = localStorage.getItem(SETTINGS_KEY);
      if (settings) {
        const parsed = JSON.parse(settings);
        return (parsed.autoLockTimeout ?? 5) * 60 * 1000; // Convert to ms
      }
    } catch {}
    return 5 * 60 * 1000; // 5 minutes default
  }, []);

  const resetActivityTimer = useCallback(() => {
    if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    const timeout = getAutoLockTimeout();
    if (timeout === 0) return; // Never lock
    activityTimerRef.current = setTimeout(() => {
      lock();
    }, timeout);
  }, [getAutoLockTimeout]);

  const unlock = useCallback(() => {
    const now = Date.now();
    setLockState({ isLocked: false, lastUnlocked: now });
    localStorage.setItem("authempire_lock", JSON.stringify({ lastUnlocked: now }));
    resetActivityTimer();
  }, [resetActivityTimer]);

  const lock = useCallback(() => {
    setLockState((prev) => ({ ...prev, isLocked: true }));
    if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
  }, []);

  // Reset activity on user interaction
  useEffect(() => {
    const events = ["mousemove", "mousedown", "keypress", "touchstart", "scroll"];
    const handler = () => {
      if (!lockState.isLocked) resetActivityTimer();
    };
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetActivityTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
    };
  }, [lockState.isLocked, resetActivityTimer]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        const timeout = getAutoLockTimeout();
        if (timeout > 0) {
          // Lock on background after timeout
          setTimeout(() => {
            if (document.hidden) lock();
          }, Math.min(timeout, 30000)); // Max 30s when backgrounded
        }
      } else {
        resetActivityTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [lock, resetActivityTimer, getAutoLockTimeout]);

  return {
    isLocked: lockState.isLocked,
    lastUnlocked: lockState.lastUnlocked,
    lock,
    unlock,
  };
}
