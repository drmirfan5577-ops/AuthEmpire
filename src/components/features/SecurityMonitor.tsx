import { RefreshCw, Shield, AlertTriangle, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSecurityColor, getScoreGrade, formatTimestamp } from "@/lib/security";
import type { SecurityScanResult } from "@/types";
import { useState } from "react";

interface SecurityMonitorProps {
  scanResult: SecurityScanResult | null;
  isScanning: boolean;
  onScan: () => void;
}

export default function SecurityMonitor({ scanResult, isScanning, onScan }: SecurityMonitorProps) {
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

  if (isScanning) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="w-16 h-16 rounded-full bg-empire-50 flex items-center justify-center">
            <Shield size={28} className="text-empire-400" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-empire-300/50 border-t-empire-500 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-slate-700 mb-1">Scanning System...</p>
        <p className="text-xs text-slate-400">Running 24/7 security measurements</p>
        <div className="mt-4 space-y-2">
          {["Checking HTTPS context...", "Scanning WebAuthn support...", "Analyzing local storage...", "Testing notification permissions..."].map((msg, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-empire-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              {msg}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!scanResult) {
    return (
      <div className="glass-card rounded-2xl p-6 text-center">
        <Shield size={32} className="text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-400 mb-4">No scan results yet</p>
        <button
          onClick={onScan}
          className="bg-empire-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-empire-600 transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400"
        >
          Run Security Scan
        </button>
      </div>
    );
  }

  const { grade, color } = getScoreGrade(scanResult.score);
  const statusColor = getSecurityColor(scanResult.status);

  return (
    <div className="space-y-4">
      {/* Score Card */}
      <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ background: `radial-gradient(circle at 80% 50%, ${statusColor}, transparent 60%)` }}
          aria-hidden="true"
        />
        <div className="flex items-center gap-4 relative">
          {/* Score Circle */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="34"
                fill="none"
                stroke={statusColor}
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - scanResult.score / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black" style={{ color }}>{grade}</span>
              <span className="text-[10px] font-semibold text-slate-400">{scanResult.score}</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: statusColor }}
              />
              <span className="text-sm font-bold text-slate-700 capitalize">
                {scanResult.status === "secure" ? "All Clear" : scanResult.status === "warning" ? "Needs Attention" : "Critical Issues"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Last scan: {formatTimestamp(scanResult.scannedAt)}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {scanResult.findings.filter((f) => !f.resolved).length} issues
              </span>
              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                {scanResult.findings.filter((f) => f.resolved).length} resolved
              </span>
            </div>
          </div>

          <button
            onClick={onScan}
            disabled={isScanning}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-empire-50 hover:text-empire-500 transition-all disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400"
            aria-label="Re-run security scan"
          >
            <RefreshCw size={14} className={isScanning ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Device info chips */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {[
            { label: "HTTPS", ok: scanResult.deviceInfo.isSecureContext },
            { label: "WebAuthn", ok: scanResult.deviceInfo.hasWebAuthn },
            { label: "Service Worker", ok: scanResult.deviceInfo.serviceWorkerActive },
            { label: "Push Support", ok: scanResult.deviceInfo.hasPushSupport },
          ].map(({ label, ok }) => (
            <div key={label} className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
              ok ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
            )}>
              {ok ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Findings */}
      {scanResult.findings.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Security Findings ({scanResult.findings.length})
          </h3>
          {scanResult.findings.map((finding) => {
            const severityConfig = {
              critical: { color: "text-red-600 bg-red-50 border-red-100", dot: "bg-red-500", icon: XCircle },
              high: { color: "text-red-500 bg-red-50/50 border-red-100/50", dot: "bg-orange-500", icon: AlertTriangle },
              medium: { color: "text-amber-600 bg-amber-50 border-amber-100", dot: "bg-amber-400", icon: AlertTriangle },
              low: { color: "text-blue-600 bg-blue-50 border-blue-100", dot: "bg-blue-400", icon: Shield },
            }[finding.severity];

            const SeverityIcon = severityConfig.icon;

            return (
              <div
                key={finding.id}
                className={cn(
                  "rounded-xl border transition-all duration-200",
                  severityConfig.color,
                  finding.resolved && "opacity-60"
                )}
              >
                <button
                  onClick={() => setExpandedFinding(expandedFinding === finding.id ? null : finding.id)}
                  className="w-full flex items-center gap-3 p-3 text-left min-h-[44px] focus:outline-none"
                  aria-expanded={expandedFinding === finding.id}
                >
                  <SeverityIcon size={14} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{finding.title}</p>
                    <p className="text-[10px] opacity-70 capitalize">{finding.severity} · {finding.category}</p>
                  </div>
                  <ChevronDown
                    size={12}
                    className={cn(
                      "flex-shrink-0 transition-transform duration-200",
                      expandedFinding === finding.id && "rotate-180"
                    )}
                  />
                </button>
                {expandedFinding === finding.id && (
                  <div className="px-4 pb-3 text-xs space-y-1.5 border-t border-current/10">
                    <p className="opacity-80 pt-2">{finding.description}</p>
                    <p className="font-semibold">💡 {finding.recommendation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Next scan info */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Next auto-scan</span>
        <span>{formatTimestamp(scanResult.nextScanAt)}</span>
      </div>
    </div>
  );
}
