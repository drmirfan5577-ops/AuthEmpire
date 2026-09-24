import { useEffect, useState } from "react";
import { AlertTriangle, Shield, X, ExternalLink, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SirenAlert } from "@/types";

interface AlertSirenProps {
  alert: SirenAlert;
  onDismiss: () => void;
}

export default function AlertSiren({ alert, onDismiss }: AlertSirenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 300);
  };

  const isDanger = alert.severity === "danger";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4",
        isDanger ? "animate-siren" : "bg-amber-500/10 backdrop-blur-sm",
        visible ? "opacity-100" : "opacity-0",
        "transition-opacity duration-300"
      )}
      role="alertdialog"
      aria-modal="true"
      aria-label={isDanger ? "Malicious URL blocked" : "Suspicious URL warning"}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0",
          isDanger
            ? "bg-red-500/20 backdrop-blur-md"
            : "bg-amber-500/10 backdrop-blur-sm"
        )}
        onClick={!isDanger ? handleDismiss : undefined}
        aria-hidden="true"
      />

      {/* Alert Card */}
      <div
        className={cn(
          "relative w-full max-w-sm mx-auto rounded-3xl overflow-hidden",
          "shadow-[0_25px_80px_rgba(0,0,0,0.3)]",
          isDanger
            ? "bg-gradient-to-b from-red-50 to-white border-2 border-red-300"
            : "bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300",
          visible ? "translate-y-0 scale-100" : "translate-y-8 scale-95",
          "transition-all duration-300"
        )}
      >
        {/* Flashing header */}
        <div
          className={cn(
            "p-6 text-center",
            isDanger
              ? "bg-gradient-to-b from-red-100 to-red-50"
              : "bg-gradient-to-b from-amber-100 to-amber-50"
          )}
        >
          <div className="flex justify-center mb-3">
            <div
              className={cn(
                "relative w-16 h-16 rounded-full flex items-center justify-center",
                isDanger ? "bg-red-500 shadow-glow-red" : "bg-amber-500 shadow-glow-amber"
              )}
            >
              {isDanger ? (
                <Ban size={32} className="text-white" />
              ) : (
                <AlertTriangle size={32} className="text-white" />
              )}
              {isDanger && (
                <>
                  <div className="absolute inset-0 rounded-full bg-red-400/50 animate-ping" />
                  <div className="absolute inset-0 rounded-full bg-red-300/30 animate-ping [animation-delay:0.2s]" />
                </>
              )}
            </div>
          </div>

          <h2
            className={cn(
              "text-xl font-bold mb-1",
              isDanger ? "text-red-700" : "text-amber-700"
            )}
          >
            {isDanger ? "🚨 Malicious Link Blocked!" : "⚠️ Suspicious Link Warning"}
          </h2>
          <p
            className={cn(
              "text-sm",
              isDanger ? "text-red-600" : "text-amber-600"
            )}
          >
            {isDanger
              ? "AuthEmpire has blocked a dangerous URL"
              : "This link may be unsafe"}
          </p>
        </div>

        {/* Details */}
        <div className="p-5">
          <div className="bg-slate-50 rounded-xl p-3 mb-4">
            <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">
              Blocked URL
            </p>
            <p className="text-xs font-mono text-slate-700 break-all line-clamp-2">
              {alert.url}
            </p>
          </div>

          <div
            className={cn(
              "rounded-xl p-3 mb-4",
              isDanger ? "bg-red-50" : "bg-amber-50"
            )}
          >
            <p
              className={cn(
                "text-xs font-medium mb-1",
                isDanger ? "text-red-600" : "text-amber-600"
              )}
            >
              <Shield size={10} className="inline mr-1" />
              Threat Detected
            </p>
            <p
              className={cn(
                "text-xs",
                isDanger ? "text-red-700" : "text-amber-700"
              )}
            >
              {alert.reason}
            </p>
          </div>

          <div className="flex gap-2">
            {!isDanger && (
              <a
                href={alert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium py-2.5 px-4 rounded-xl hover:bg-amber-100 transition-colors min-h-[44px]"
                onClick={handleDismiss}
              >
                <ExternalLink size={14} />
                Proceed Anyway
              </a>
            )}
            <button
              onClick={handleDismiss}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 min-h-[44px]",
                isDanger
                  ? "bg-red-500 hover:bg-red-600 shadow-glow-red"
                  : "bg-amber-500 hover:bg-amber-600"
              )}
            >
              <X size={14} />
              {isDanger ? "Block & Close" : "Dismiss"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
