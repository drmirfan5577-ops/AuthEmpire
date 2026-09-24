import { useState, useEffect, useCallback, useRef } from "react";
import type { SecurityScanResult, SecurityEvent, SirenAlert } from "@/types";
import { runSecurityScan, analyzeURL, createSirenAlert } from "@/lib/security";
import { SCAN_INTERVAL_MS, MAX_EVENTS, SECURITY_KEY, EVENTS_KEY } from "@/constants";
import { generateId } from "@/lib/utils";

export function useSecurityScanner() {
  const [scanResult, setScanResult] = useState<SecurityScanResult | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [sirenAlerts, setSirenAlerts] = useState<SirenAlert[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [activeSiren, setActiveSiren] = useState<SirenAlert | null>(null);
  const scanTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const clickHandlerRef = useRef<(e: MouseEvent) => void>();

  const loadScanResult = useCallback(() => {
    try {
      const stored = localStorage.getItem(SECURITY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SecurityScanResult;
        setScanResult(parsed);
        return parsed;
      }
    } catch {}
    return null;
  }, []);

  const loadEvents = useCallback(() => {
    try {
      const stored = localStorage.getItem(EVENTS_KEY);
      if (stored) setEvents(JSON.parse(stored));
    } catch {}
  }, []);

  const saveEvents = useCallback((evts: SecurityEvent[]) => {
    const trimmed = evts.slice(-MAX_EVENTS);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(trimmed));
    setEvents(trimmed);
  }, []);

  const addEvent = useCallback((event: Omit<SecurityEvent, "id" | "timestamp" | "acknowledged">) => {
    const newEvent: SecurityEvent = {
      ...event,
      id: generateId(),
      timestamp: Date.now(),
      acknowledged: false,
    };
    setEvents((prev) => {
      const updated = [newEvent, ...prev].slice(-MAX_EVENTS);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
      return updated;
    });
    return newEvent;
  }, []);

  const performScan = useCallback(async () => {
    setIsScanning(true);
    addEvent({
      type: "info",
      title: "Security Scan Started",
      message: "Running automated security measurements scan...",
      source: "AutoScanner",
    });

    await new Promise((r) => setTimeout(r, 2000)); // Simulate scan time

    const result = runSecurityScan();
    setScanResult(result);
    localStorage.setItem(SECURITY_KEY, JSON.stringify(result));

    const eventType = result.status === "secure" ? "success" : result.status === "warning" ? "warning" : "danger";
    addEvent({
      type: eventType,
      title: `Security Scan Complete — Score: ${result.score}/100`,
      message: `Status: ${result.status.toUpperCase()}. Found ${result.findings.length} issue(s).`,
      source: "AutoScanner",
    });

    // Trigger notification if issues found
    if (result.status !== "secure" && "Notification" in window && Notification.permission === "granted") {
      new Notification("⚠️ AuthEmpire Security Alert", {
        body: `Security score: ${result.score}/100. ${result.findings.length} issue(s) found.`,
        icon: "/logo.png",
        badge: "/logo.png",
      });
    }

    setIsScanning(false);
    scheduleNextScan(result.nextScanAt);
    return result;
  }, [addEvent]);

  const scheduleNextScan = useCallback((nextAt: number) => {
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    const delay = Math.max(0, nextAt - Date.now());
    scanTimerRef.current = setTimeout(() => performScan(), Math.min(delay, SCAN_INTERVAL_MS));
  }, [performScan]);

  const checkURL = useCallback((url: string): SirenAlert | null => {
    const analysis = analyzeURL(url);
    if (analysis.isMalicious || analysis.isSuspicious) {
      const alert = createSirenAlert(url, analysis);
      setSirenAlerts((prev) => [alert, ...prev]);

      if (analysis.isMalicious) {
        setActiveSiren(alert);
        addEvent({
          type: "danger",
          title: "🚨 Malicious URL Detected!",
          message: `Blocked: ${url} — ${analysis.reason}`,
          source: "LinkGuard",
          metadata: { url, reason: analysis.reason },
        });

        // Play siren sound
        playSirenSound();
      } else {
        addEvent({
          type: "warning",
          title: "⚠️ Suspicious URL Warning",
          message: `Caution: ${url} — ${analysis.reason}`,
          source: "LinkGuard",
          metadata: { url, reason: analysis.reason },
        });
      }

      return alert;
    }
    return null;
  }, [addEvent]);

  const dismissSiren = useCallback(() => {
    setActiveSiren(null);
  }, []);

  const acknowledgeEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const updated = prev.map((e) => e.id === id ? { ...e, acknowledged: true } : e);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearEvents = useCallback(() => {
    localStorage.removeItem(EVENTS_KEY);
    setEvents([]);
  }, []);

  function playSirenSound() {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.5);
      oscillator.frequency.linearRampToValueAtTime(880, ctx.currentTime + 1);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 1.5);
    } catch {
      console.log("[Security] Audio not available");
    }
  }

  // Install link click interceptor
  useEffect(() => {
    clickHandlerRef.current = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor || !anchor.href) return;
      
      const href = anchor.href;
      if (href.startsWith(window.location.origin)) return; // Same origin, skip
      
      const analysis = analyzeURL(href);
      if (analysis.isMalicious) {
        e.preventDefault();
        e.stopPropagation();
        const alert = createSirenAlert(href, analysis);
        setSirenAlerts((prev) => [alert, ...prev]);
        setActiveSiren(alert);
        playSirenSound();
        addEvent({
          type: "danger",
          title: "🚨 Blocked Malicious Link!",
          message: `Navigation to ${href} was blocked. Reason: ${analysis.reason}`,
          source: "LinkGuard",
        });
      }
    };

    document.addEventListener("click", clickHandlerRef.current, true);
    return () => {
      if (clickHandlerRef.current) {
        document.removeEventListener("click", clickHandlerRef.current, true);
      }
    };
  }, [addEvent]);

  // Initialize
  useEffect(() => {
    loadScanResult();
    loadEvents();
    
    const stored = localStorage.getItem(SECURITY_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SecurityScanResult;
        if (Date.now() >= parsed.nextScanAt) {
          performScan();
        } else {
          scheduleNextScan(parsed.nextScanAt);
        }
      } catch {
        performScan();
      }
    } else {
      performScan();
    }

    return () => {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    };
  }, []);

  // Service Worker message handler
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type === "SECURITY_SCAN_COMPLETE") {
        addEvent({
          type: "info",
          title: "Background Scan Complete",
          message: "Service Worker completed background security check.",
          source: "ServiceWorker",
        });
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [addEvent]);

  const unacknowledgedCount = events.filter((e) => !e.acknowledged && e.type !== "info").length;

  return {
    scanResult,
    events,
    sirenAlerts,
    activeSiren,
    isScanning,
    unacknowledgedCount,
    performScan,
    checkURL,
    dismissSiren,
    acknowledgeEvent,
    clearEvents,
    addEvent,
  };
}
