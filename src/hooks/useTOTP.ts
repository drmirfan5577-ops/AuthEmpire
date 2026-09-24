import { useState, useEffect, useCallback, useRef } from "react";
import { generateTOTP, getTimeRemaining, getProgress } from "@/lib/totp";
import type { TOTPState } from "@/types";

export function useTOTP(secret: string, period: number = 30, digits: number = 6) {
  const [state, setState] = useState<TOTPState>({
    code: "------",
    previousCode: "------",
    timeRemaining: period,
    progress: 100,
    isExpiring: false,
  });
  const previousCodeRef = useRef("------");
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const refresh = useCallback(async () => {
    if (!secret || secret.trim() === "") {
      setState((prev) => ({
        ...prev,
        code: "------",
        timeRemaining: period,
        progress: 100,
      }));
      return;
    }

    const code = await generateTOTP(secret, period, digits);
    const remaining = getTimeRemaining(period);
    const progress = getProgress(period);

    setState((prev) => {
      const prevCode = prev.code !== code ? prev.code : prev.previousCode;
      if (prev.code !== code) {
        previousCodeRef.current = prev.code;
      }
      return {
        code,
        previousCode: prevCode,
        timeRemaining: remaining,
        progress,
        isExpiring: remaining <= 5,
      };
    });
  }, [secret, period, digits]);

  useEffect(() => {
    refresh();
    intervalRef.current = setInterval(refresh, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  return state;
}

export function useMultipleTOTP(accounts: Array<{ id: string; secret: string; period: number; digits: number }>) {
  const [codes, setCodes] = useState<Record<string, TOTPState>>({});
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const refreshAll = useCallback(async () => {
    const newCodes: Record<string, TOTPState> = {};
    await Promise.all(
      accounts.map(async ({ id, secret, period, digits }) => {
        if (!secret) return;
        const code = await generateTOTP(secret, period, digits);
        const remaining = getTimeRemaining(period);
        const progress = getProgress(period);
        newCodes[id] = {
          code,
          previousCode: codes[id]?.code !== code ? codes[id]?.code || "------" : codes[id]?.previousCode || "------",
          timeRemaining: remaining,
          progress,
          isExpiring: remaining <= 5,
        };
      })
    );
    setCodes(newCodes);
  }, [accounts, codes]);

  useEffect(() => {
    refreshAll();
    intervalRef.current = setInterval(refreshAll, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refreshAll]);

  return codes;
}
