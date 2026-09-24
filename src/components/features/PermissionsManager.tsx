import { useState, useEffect } from "react";
import { Bell, HardDrive, Fingerprint, RefreshCw, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePWA } from "@/hooks/usePWA";
import type { PermissionStatus } from "@/types";

export default function PermissionsManager() {
  const { requestNotificationPermission, requestPersistentStorage, getStorageInfo } = usePWA();
  const [permissions, setPermissions] = useState<PermissionStatus>({
    notifications: "prompt",
    camera: "prompt",
    biometric: "unavailable",
    persistentStorage: "prompt",
    backgroundSync: "unsupported",
    periodicSync: "unsupported",
  });
  const [storageInfo, setStorageInfo] = useState<{ used: number; quota: number; percentage: number } | null>(null);
  const [requesting, setRequesting] = useState<string | null>(null);

  useEffect(() => {
    checkPermissions();
    loadStorageInfo();
  }, []);

  const checkPermissions = async () => {
    const perms: Partial<PermissionStatus> = {};

    // Notifications
    if ("Notification" in window) {
      perms.notifications = Notification.permission as PermissionStatus["notifications"];
    } else {
      perms.notifications = "unsupported";
    }

    // Camera
    if (navigator.permissions) {
      try {
        const cam = await navigator.permissions.query({ name: "camera" as PermissionName });
        perms.camera = cam.state as PermissionStatus["camera"];
      } catch {
        perms.camera = "unsupported";
      }
    }

    // Biometric
    if (typeof PublicKeyCredential !== "undefined") {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        perms.biometric = available ? "available" : "unavailable";
      } catch {
        perms.biometric = "unavailable";
      }
    }

    // Persistent storage
    if (navigator.storage?.persisted) {
      const persisted = await navigator.storage.persisted();
      perms.persistentStorage = persisted ? "granted" : "prompt";
    }

    setPermissions((prev) => ({ ...prev, ...perms }));
  };

  const loadStorageInfo = async () => {
    if (navigator.storage?.estimate) {
      const info = await navigator.storage.estimate();
      setStorageInfo({
        used: info.usage ?? 0,
        quota: info.quota ?? 0,
        percentage: info.quota ? ((info.usage ?? 0) / info.quota) * 100 : 0,
      });
    }
  };

  const requestPermission = async (type: string) => {
    setRequesting(type);
    try {
      if (type === "notifications") {
        const result = await requestNotificationPermission();
        setPermissions((p) => ({ ...p, notifications: result }));
      } else if (type === "storage") {
        const granted = await requestPersistentStorage();
        setPermissions((p) => ({ ...p, persistentStorage: granted ? "granted" : "denied" }));
      } else if (type === "camera") {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach((t) => t.stop());
          setPermissions((p) => ({ ...p, camera: "granted" }));
        } catch {
          setPermissions((p) => ({ ...p, camera: "denied" }));
        }
      }
    } finally {
      setRequesting(null);
    }
  };

  const permItems = [
    {
      id: "notifications",
      icon: Bell,
      label: "Push Notifications",
      description: "Receive security alerts and OTP notifications",
      status: permissions.notifications,
      action: () => requestPermission("notifications"),
    },
    {
      id: "storage",
      icon: HardDrive,
      label: "Persistent Storage",
      description: "Keep app data across browser clears",
      status: permissions.persistentStorage,
      action: () => requestPermission("storage"),
    },
    {
      id: "biometric",
      icon: Fingerprint,
      label: "Biometric Auth",
      description: "Fingerprint or face unlock support",
      status: permissions.biometric === "available" ? "granted" : permissions.biometric === "unavailable" ? "unsupported" : "prompt",
      action: undefined,
    },
    {
      id: "camera",
      icon: () => <span className="text-base">📷</span>,
      label: "Camera",
      description: "Scan QR codes for account setup",
      status: permissions.camera,
      action: () => requestPermission("camera"),
    },
  ];

  const statusIcon = (status: string) => {
    switch (status) {
      case "granted":
      case "available":
        return <CheckCircle2 size={14} className="text-green-500" />;
      case "denied":
        return <XCircle size={14} className="text-red-400" />;
      case "unsupported":
        return <XCircle size={14} className="text-slate-300" />;
      default:
        return <AlertCircle size={14} className="text-amber-400" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "granted": case "available": return "Granted";
      case "denied": return "Denied";
      case "unsupported": return "Unsupported";
      default: return "Not Set";
    }
  };

  return (
    <div className="space-y-3">
      {permItems.map(({ id, icon: Icon, label, description, status, action }) => (
        <div key={id} className="glass-card rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500 flex-shrink-0">
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700">{label}</p>
            <p className="text-xs text-slate-400 truncate">{description}</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {statusIcon(status)}
            {action && status !== "granted" && status !== "unsupported" && status !== "denied" ? (
              <button
                onClick={action}
                disabled={requesting === id}
                className="text-xs bg-empire-50 text-empire-600 hover:bg-empire-100 px-2.5 py-1 rounded-lg font-medium transition-colors min-h-[28px] focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400"
              >
                {requesting === id ? <RefreshCw size={10} className="animate-spin" /> : "Allow"}
              </button>
            ) : (
              <span className={cn(
                "text-xs font-medium",
                status === "granted" ? "text-green-500" : status === "denied" ? "text-red-400" : "text-slate-400"
              )}>
                {statusLabel(status)}
              </span>
            )}
          </div>
        </div>
      ))}

      {/* Storage Info */}
      {storageInfo && (
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-slate-700">Storage Usage</p>
            <p className="text-xs text-slate-400">{storageInfo.percentage.toFixed(1)}%</p>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-empire-400 to-indigo-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-400">
              {(storageInfo.used / 1024).toFixed(1)} KB used
            </span>
            <span className="text-[10px] text-slate-400">
              {(storageInfo.quota / 1024 / 1024).toFixed(0)} MB quota
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
