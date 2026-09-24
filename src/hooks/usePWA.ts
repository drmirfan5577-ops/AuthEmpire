import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [swRegistered, setSwRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Listen for app installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    // Register service worker
    registerServiceWorker();

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      setSwRegistered(true);
      console.log("[PWA] Service Worker registered:", registration.scope);

      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });

      // Try periodic background sync
      if ("periodicSync" in registration) {
        try {
          const status = await navigator.permissions.query({
            name: "periodic-background-sync" as PermissionName,
          });
          if (status.state === "granted") {
            await (registration as unknown as { periodicSync: { register: (tag: string, options: Record<string, unknown>) => Promise<void> } }).periodicSync.register(
              "security-scan-daily",
              { minInterval: 24 * 60 * 60 * 1000 }
            );
          }
        } catch {
          console.log("[PWA] Periodic sync not supported");
        }
      }
    } catch (err) {
      console.log("[PWA] SW registration failed:", err);
    }
  };

  const install = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) return false;
    setIsInstalling(true);

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setInstallPrompt(null);
        return true;
      }
      return false;
    } finally {
      setIsInstalling(false);
    }
  }, [installPrompt]);

  const requestUpdate = useCallback(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.waiting?.postMessage({ type: "SKIP_WAITING" });
        window.location.reload();
      });
    }
  }, []);

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!("Notification" in window)) return "denied";
    if (Notification.permission === "granted") return "granted";
    return Notification.requestPermission();
  }, []);

  const requestPersistentStorage = useCallback(async (): Promise<boolean> => {
    if (!navigator.storage?.persist) return false;
    return navigator.storage.persist();
  }, []);

  const getStorageInfo = useCallback(async () => {
    if (!navigator.storage?.estimate) return null;
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage ?? 0,
      quota: estimate.quota ?? 0,
      percentage: estimate.quota ? ((estimate.usage ?? 0) / estimate.quota) * 100 : 0,
    };
  }, []);

  const canInstall = !isInstalled && !!installPrompt;

  return {
    canInstall,
    isInstalled,
    isInstalling,
    swRegistered,
    updateAvailable,
    install,
    requestUpdate,
    requestNotificationPermission,
    requestPersistentStorage,
    getStorageInfo,
  };
}
