import { useState } from "react";
import { Settings, Fingerprint, Bell, Shield, Clock, Volume2, Smartphone, RefreshCw, Key, ChevronRight, Download, Info, Trash2, Moon, Zap, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import PermissionsManager from "@/components/features/PermissionsManager";
import { useBiometric } from "@/hooks/useBiometric";
import { usePWA } from "@/hooks/usePWA";
import { SETTINGS_KEY, AUTO_LOCK_OPTIONS, APP_VERSION } from "@/constants";
import type { AppSettings } from "@/types";
import { toast } from "sonner";

const defaultSettings: AppSettings = {
  biometricEnabled: true,
  autoLockTimeout: 5,
  showCopyAnimation: true,
  soundEnabled: true,
  notificationsEnabled: true,
  backgroundScanEnabled: true,
  maliciousLinkDetection: true,
  autoScanInterval: 24,
  theme: "light",
  language: "en",
  defaultBrowser: false,
  hapticFeedback: true,
};

type Section = "general" | "security" | "permissions" | "about";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("general");
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
    } catch {}
    return defaultSettings;
  });

  const { credentials, register, removeCredential, isRegistering } = useBiometric();
  const { canInstall, install, isInstalled, updateAvailable, requestUpdate } = usePWA();

  const saveSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  const handleClearData = () => {
    if (confirm("Are you sure? This will remove all accounts and settings.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExport = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      version: APP_VERSION,
      settings,
      accountCount: JSON.parse(localStorage.getItem("authempire_data") || "[]").length,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `authempire-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exported successfully");
  };

  const sections = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "permissions", label: "Permissions", icon: Bell },
    { id: "about", label: "About", icon: Info },
  ];

  const ToggleSwitch = ({
    value,
    onChange,
    disabled,
    id,
  }: {
    value: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
    id: string;
  }) => (
    <button
      role="switch"
      aria-checked={value}
      id={id}
      onClick={() => onChange(!value)}
      disabled={disabled}
      className={cn(
        "relative w-11 h-6 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400",
        value ? "bg-empire-500" : "bg-slate-200",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300",
          value ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );

  const SettingRow = ({
    icon: Icon,
    label,
    description,
    children,
    onClick,
    iconColor = "text-slate-500",
    iconBg = "bg-slate-50",
  }: {
    icon: typeof Settings;
    label: string;
    description?: string;
    children?: React.ReactNode;
    onClick?: () => void;
    iconColor?: string;
    iconBg?: string;
  }) => (
    <div
      className={cn(
        "flex items-center gap-3 p-3.5 transition-all",
        onClick && "cursor-pointer hover:bg-slate-50/80 active:bg-slate-100/80 rounded-xl"
      )}
      onClick={onClick}
    >
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", iconBg)}>
        <Icon size={15} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        {description && <p className="text-xs text-slate-400 truncate">{description}</p>}
      </div>
      {children ?? (onClick && <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />)}
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 pt-safe">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-lg font-black text-slate-800">Settings</h1>
          <p className="text-xs text-slate-400">Configure your security empire</p>
        </div>

        {/* Section tabs */}
        <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id as Section)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all min-h-[32px]",
                activeSection === id
                  ? "bg-empire-500 text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {/* General */}
        {activeSection === "general" && (
          <>
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-slate-100/80">
              <SettingRow
                icon={Volume2}
                label="Sound Effects"
                description="Alert sounds and siren warnings"
                iconColor="text-indigo-500"
                iconBg="bg-indigo-50"
              >
                <ToggleSwitch id="sound" value={settings.soundEnabled} onChange={(v) => saveSetting("soundEnabled", v)} />
              </SettingRow>
              <SettingRow
                icon={Smartphone}
                label="Haptic Feedback"
                description="Vibration on actions"
                iconColor="text-purple-500"
                iconBg="bg-purple-50"
              >
                <ToggleSwitch id="haptic" value={settings.hapticFeedback} onChange={(v) => saveSetting("hapticFeedback", v)} />
              </SettingRow>
              <SettingRow
                icon={Moon}
                label="Copy Animation"
                description="Show animation when copying OTP"
                iconColor="text-sky-500"
                iconBg="bg-sky-50"
              >
                <ToggleSwitch id="copy-anim" value={settings.showCopyAnimation} onChange={(v) => saveSetting("showCopyAnimation", v)} />
              </SettingRow>
            </div>

            {/* Auto-lock */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Clock size={15} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Auto-Lock Timeout</p>
                  <p className="text-xs text-slate-400">Lock app after inactivity</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {AUTO_LOCK_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => saveSetting("autoLockTimeout", value)}
                    className={cn(
                      "py-2 px-2 rounded-xl text-xs font-semibold transition-all",
                      settings.autoLockTimeout === value
                        ? "bg-empire-500 text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* PWA Install */}
            {(canInstall || isInstalled) && (
              <div className="glass-card rounded-2xl overflow-hidden">
                <SettingRow
                  icon={Download}
                  label={isInstalled ? "App Installed" : "Install App"}
                  description={isInstalled ? "AuthEmpire is installed on this device" : "Add to home screen for full features & offline use"}
                  iconColor={isInstalled ? "text-green-500" : "text-empire-500"}
                  iconBg={isInstalled ? "bg-green-50" : "bg-empire-50"}
                  onClick={!isInstalled ? install : undefined}
                >
                  {isInstalled ? (
                    <span className="text-xs text-green-500 font-semibold">✓ Installed</span>
                  ) : undefined}
                </SettingRow>
                {updateAvailable && (
                  <SettingRow
                    icon={RefreshCw}
                    label="Update Available"
                    description="A new version is ready to install"
                    iconColor="text-amber-500"
                    iconBg="bg-amber-50"
                    onClick={requestUpdate}
                  />
                )}
              </div>
            )}

            {/* Data management */}
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-slate-100/80">
              <SettingRow
                icon={Download}
                label="Export Backup"
                description="Download settings and account info"
                iconColor="text-blue-500"
                iconBg="bg-blue-50"
                onClick={handleExport}
              />
              <SettingRow
                icon={Trash2}
                label="Clear All Data"
                description="Remove all accounts and settings"
                iconColor="text-red-500"
                iconBg="bg-red-50"
                onClick={handleClearData}
              />
            </div>
          </>
        )}

        {/* Security */}
        {activeSection === "security" && (
          <>
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-slate-100/80">
              <SettingRow
                icon={Fingerprint}
                label="Biometric Authentication"
                description="Enable fingerprint/face unlock"
                iconColor="text-violet-500"
                iconBg="bg-violet-50"
              >
                <ToggleSwitch id="biometric" value={settings.biometricEnabled} onChange={(v) => saveSetting("biometricEnabled", v)} />
              </SettingRow>
              <SettingRow
                icon={Shield}
                label="Background Security Scan"
                description="Auto-scan every 24 hours"
                iconColor="text-green-500"
                iconBg="bg-green-50"
              >
                <ToggleSwitch id="bg-scan" value={settings.backgroundScanEnabled} onChange={(v) => saveSetting("backgroundScanEnabled", v)} />
              </SettingRow>
              <SettingRow
                icon={Lock}
                label="Malicious Link Detection"
                description="Block dangerous URLs automatically"
                iconColor="text-red-500"
                iconBg="bg-red-50"
              >
                <ToggleSwitch id="link-detect" value={settings.maliciousLinkDetection} onChange={(v) => saveSetting("maliciousLinkDetection", v)} />
              </SettingRow>
              <SettingRow
                icon={Bell}
                label="Security Notifications"
                description="Get alerted on threats"
                iconColor="text-amber-500"
                iconBg="bg-amber-50"
              >
                <ToggleSwitch id="notifs" value={settings.notificationsEnabled} onChange={(v) => saveSetting("notificationsEnabled", v)} />
              </SettingRow>
            </div>

            {/* Registered biometric devices */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-slate-700">Biometric Devices</p>
                <button
                  onClick={register}
                  disabled={isRegistering}
                  className="text-xs bg-empire-50 text-empire-600 hover:bg-empire-100 px-2.5 py-1 rounded-lg font-medium transition-colors"
                >
                  {isRegistering ? "Registering..." : "+ Add Device"}
                </button>
              </div>
              {credentials.length === 0 ? (
                <div className="text-center py-4">
                  <Fingerprint size={24} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No biometric devices registered</p>
                </div>
              ) : (
                credentials.map((cred) => (
                  <div key={cred.id} className="flex items-center gap-2.5 py-2 border-t border-slate-100 first:border-0">
                    <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                      <Fingerprint size={13} className="text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{cred.deviceName}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(cred.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => removeCredential(cred.id)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all"
                      aria-label="Remove device"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Recovery codes */}
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                  <Key size={15} className="text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700">Recovery Codes</p>
                  <p className="text-xs text-slate-400">Backup access codes</p>
                </div>
                <button className="text-xs text-empire-500 font-medium hover:text-empire-700">
                  Generate
                </button>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
                <p className="font-semibold mb-0.5">⚠️ Important</p>
                <p>Recovery codes allow access if you lose your biometric device. Store them safely.</p>
              </div>
            </div>
          </>
        )}

        {/* Permissions */}
        {activeSection === "permissions" && <PermissionsManager />}

        {/* About */}
        {activeSection === "about" && (
          <div className="space-y-3">
            <div className="glass-card rounded-2xl p-5 text-center">
              <img src="/logo.png" alt="AuthEmpire" className="w-16 h-16 rounded-2xl mx-auto mb-3 shadow-glass" />
              <h2 className="text-lg font-black text-gradient mb-0.5">AuthEmpire</h2>
              <p className="text-xs text-slate-400">Version {APP_VERSION}</p>
              <div className="mt-3 flex justify-center gap-2 flex-wrap">
                {["PWA Ready", "WebAuthn", "TOTP/HOTP", "24/7 Monitor"].map((tag) => (
                  <span key={tag} className="text-[10px] bg-empire-50 text-empire-600 px-2 py-0.5 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-slate-100/80">
              {[
                { label: "Authentication Standard", value: "RFC 6238 TOTP" },
                { label: "Biometric Standard", value: "WebAuthn/FIDO2" },
                { label: "Security Protocol", value: "W3C Credential Mgmt" },
                { label: "Encryption", value: "Web Crypto API" },
                { label: "PWA Standard", value: "Service Worker API" },
                { label: "Browser Support", value: "All modern browsers" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center px-4 py-3">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs font-semibold text-slate-700">{value}</span>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-2xl p-4 text-center">
              <Zap size={20} className="text-empire-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500 leading-relaxed">
                AuthEmpire implements GitHub-style 2FA authentication standards — biometric verification, TOTP/HOTP codes, and real-time security monitoring.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
