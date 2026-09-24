import { useState } from "react";
import { Activity, Key, Clock, Copy, Star, Plus, Shield, TrendingUp } from "lucide-react";
import { cn, formatTimeAgo } from "@/lib/utils";
import { useAccounts } from "@/hooks/useAccounts";
import { useSecurityScanner } from "@/hooks/useSecurityScanner";

export default function ActivityPage() {
  const { accounts, recent } = useAccounts();
  const { events, scanResult } = useSecurityScanner();

  const recentEvents = events.slice(0, 20);
  const totalAuthEvents = events.filter((e) => e.source !== "AutoScanner").length;

  const stats = [
    {
      label: "Total Accounts",
      value: accounts.length,
      icon: Key,
      color: "text-empire-500",
      bg: "bg-empire-50",
    },
    {
      label: "Security Score",
      value: scanResult ? `${scanResult.score}` : "—",
      icon: Shield,
      color: "text-green-500",
      bg: "bg-green-50",
      suffix: scanResult ? "/100" : "",
    },
    {
      label: "Recent Uses",
      value: recent.length,
      icon: Clock,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      label: "Security Events",
      value: totalAuthEvents,
      icon: Activity,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 pt-safe">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-lg font-black text-slate-800">Activity</h1>
          <p className="text-xs text-slate-400">Your authentication activity log</p>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, icon: Icon, color, bg, suffix }) => (
            <div key={label} className="glass-card rounded-2xl p-4">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", bg)}>
                <Icon size={16} className={color} />
              </div>
              <p className="text-xl font-black text-slate-800">
                {value}
                {suffix && <span className="text-xs font-normal text-slate-400">{suffix}</span>}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Recent accounts */}
        {recent.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Recently Used
            </h2>
            <div className="space-y-2">
              {recent.map((account) => (
                <div key={account.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: account.color }}
                  >
                    {account.issuer.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{account.issuer}</p>
                    <p className="text-xs text-slate-400 truncate">{account.label}</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <Copy size={11} className="text-slate-300" />
                    <p className="text-[10px] text-slate-400">
                      {account.lastUsed ? formatTimeAgo(account.lastUsed) : "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security events */}
        {recentEvents.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Security Log
            </h2>
            <div className="space-y-2">
              {recentEvents.map((event) => (
                <div key={event.id} className={cn(
                  "rounded-xl border p-3 flex items-start gap-2.5",
                  event.type === "danger" ? "bg-red-50/50 border-red-100/80"
                    : event.type === "warning" ? "bg-amber-50/50 border-amber-100/80"
                    : event.type === "success" ? "bg-green-50/50 border-green-100/80"
                    : "bg-slate-50/50 border-slate-100"
                )}>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                    event.type === "danger" ? "bg-red-500"
                      : event.type === "warning" ? "bg-amber-400"
                      : event.type === "success" ? "bg-green-500"
                      : "bg-empire-400"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 leading-snug line-clamp-1">
                      {event.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatTimeAgo(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentEvents.length === 0 && recent.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No activity yet</p>
            <p className="text-xs text-slate-300 mt-1">Start using your accounts to see activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
