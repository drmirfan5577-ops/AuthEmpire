import { useState } from "react";
import { Shield, Bell, AlertTriangle, CheckCircle2, Info, AlertCircle, Trash2, RefreshCw, Eye } from "lucide-react";
import { cn, formatTimeAgo } from "@/lib/utils";
import SecurityMonitor from "@/components/features/SecurityMonitor";
import { useSecurityScanner } from "@/hooks/useSecurityScanner";
import type { SecurityEvent } from "@/types";

type Tab = "status" | "events" | "alerts";

export default function Security() {
  const [activeTab, setActiveTab] = useState<Tab>("status");
  const {
    scanResult,
    events,
    sirenAlerts,
    isScanning,
    performScan,
    acknowledgeEvent,
    clearEvents,
    unacknowledgedCount,
  } = useSecurityScanner();

  const eventIcon = (type: SecurityEvent["type"]) => {
    switch (type) {
      case "danger": return <AlertCircle size={14} className="text-red-500" />;
      case "warning": return <AlertTriangle size={14} className="text-amber-500" />;
      case "success": return <CheckCircle2 size={14} className="text-green-500" />;
      default: return <Info size={14} className="text-empire-400" />;
    }
  };

  const eventBg = (type: SecurityEvent["type"]) => {
    switch (type) {
      case "danger": return "bg-red-50 border-red-100";
      case "warning": return "bg-amber-50 border-amber-100";
      case "success": return "bg-green-50 border-green-100";
      default: return "bg-slate-50 border-slate-100";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 pt-safe">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-black text-slate-800">Security Center</h1>
              <p className="text-xs text-slate-400">24/7 Keeping an Eye Management</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Live indicator */}
              <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-green-600">LIVE</span>
              </div>
              <button
                onClick={() => performScan()}
                disabled={isScanning}
                className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-empire-50 hover:text-empire-500 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400"
                aria-label="Refresh security scan"
              >
                <RefreshCw size={14} className={isScanning ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100/80 p-1 rounded-xl">
            {[
              { id: "status", label: "Status", icon: Shield },
              { id: "events", label: `Events${unacknowledgedCount > 0 ? ` (${unacknowledgedCount})` : ""}`, icon: Bell },
              { id: "alerts", label: `Alerts${sirenAlerts.length > 0 ? ` (${sirenAlerts.length})` : ""}`, icon: AlertTriangle },
            ].map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as Tab)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 min-h-[36px]",
                    isActive
                      ? "bg-white shadow-sm text-empire-600"
                      : "text-slate-500 hover:text-slate-700"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={12} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {/* Status Tab */}
        {activeTab === "status" && (
          <SecurityMonitor
            scanResult={scanResult}
            isScanning={isScanning}
            onScan={performScan}
          />
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">{events.length} event(s)</p>
              {events.length > 0 && (
                <button
                  onClick={clearEvents}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors py-1 px-2 rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={10} />
                  Clear All
                </button>
              )}
            </div>

            {events.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 size={32} className="text-green-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No security events</p>
                <p className="text-xs text-slate-300 mt-1">Your system is clean</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "rounded-xl border p-3 flex items-start gap-2.5 transition-all",
                    eventBg(event.type),
                    event.acknowledged && "opacity-60"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {eventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 leading-snug">{event.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{event.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400">{formatTimeAgo(event.timestamp)}</span>
                      {event.source && (
                        <>
                          <span className="text-[10px] text-slate-300">·</span>
                          <span className="text-[10px] text-slate-400">{event.source}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {!event.acknowledged && event.type !== "info" && (
                    <button
                      onClick={() => acknowledgeEvent(event.id)}
                      className="flex-shrink-0 text-[10px] text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded bg-white/60 hover:bg-white transition-colors"
                      aria-label="Acknowledge event"
                    >
                      <Eye size={10} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">{sirenAlerts.length} URL alert(s)</p>

            {sirenAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Shield size={32} className="text-green-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No malicious links detected</p>
                <p className="text-xs text-slate-300 mt-1">AuthEmpire is actively monitoring</p>
              </div>
            ) : (
              sirenAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "rounded-xl border p-3",
                    alert.severity === "danger"
                      ? "bg-red-50 border-red-200"
                      : "bg-amber-50 border-amber-200"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle
                      size={14}
                      className={alert.severity === "danger" ? "text-red-500" : "text-amber-500"}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-xs font-bold",
                        alert.severity === "danger" ? "text-red-700" : "text-amber-700"
                      )}>
                        {alert.severity === "danger" ? "🚨 Blocked" : "⚠️ Warning"}
                        {alert.blocked && " — Navigation Blocked"}
                      </p>
                      <p className="text-[10px] font-mono text-slate-600 mt-1 break-all">{alert.url}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{alert.reason}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{formatTimeAgo(alert.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
