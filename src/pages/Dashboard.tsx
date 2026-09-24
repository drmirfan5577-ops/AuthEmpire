import { useState, useMemo } from "react";
import { Plus, Search, Star, Grid3X3, List, Shield, Zap, Clock, Key, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import OTPCard from "@/components/features/OTPCard";
import AddAccountModal from "@/components/features/AddAccountModal";
import { useAccounts } from "@/hooks/useAccounts";
import { useSecurityScanner } from "@/hooks/useSecurityScanner";
import { getSecurityColor } from "@/lib/security";
import { formatTimeAgo } from "@/lib/utils";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [activeFilter, setActiveFilter] = useState<"all" | "favorites" | "recent">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { accounts, favorites, recent, addAccount, updateAccount, deleteAccount, toggleFavorite, markUsed } = useAccounts();
  const { scanResult } = useSecurityScanner();

  const displayAccounts = useMemo(() => {
    let list = accounts;
    if (activeFilter === "favorites") list = favorites;
    else if (activeFilter === "recent") list = recent;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.issuer.toLowerCase().includes(q) ||
          a.label.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [accounts, favorites, recent, activeFilter, searchQuery]);

  const statusColor = scanResult ? getSecurityColor(scanResult.status) : "#10b981";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 pt-safe">
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src="/logo.png" alt="AuthEmpire" className="w-8 h-8 rounded-xl shadow-sm" />
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                  style={{ backgroundColor: statusColor }}
                />
              </div>
              <div>
                <h1 className="text-lg font-black text-slate-800 leading-tight">AuthEmpire</h1>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {accounts.length} account{accounts.length !== 1 ? "s" : ""} · Protected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                    viewMode === "list" ? "bg-white shadow-sm text-empire-500" : "text-slate-400"
                  )}
                  aria-label="List view"
                >
                  <List size={13} />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                    viewMode === "grid" ? "bg-white shadow-sm text-empire-500" : "text-slate-400"
                  )}
                  aria-label="Grid view"
                >
                  <Grid3X3 size={13} />
                </button>
              </div>

              {/* Add button */}
              <button
                onClick={() => setShowAdd(true)}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-empire-500 to-indigo-500 flex items-center justify-center text-white shadow-glass hover:from-empire-600 hover:to-indigo-600 transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400"
                aria-label="Add new account"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search accounts..."
              className="w-full bg-white/90 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-empire-300 focus:ring-1 focus:ring-empire-300 transition-all"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {[
              { id: "all", label: `All (${accounts.length})`, icon: Key },
              { id: "favorites", label: `★ (${favorites.length})`, icon: Star },
              { id: "recent", label: "Recent", icon: Clock },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveFilter(id as typeof activeFilter)}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-xl font-medium transition-all duration-200 min-h-[32px]",
                  activeFilter === id
                    ? "bg-empire-500 text-white shadow-sm"
                    : "bg-slate-100/80 text-slate-500 hover:bg-slate-200/80"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {/* Security status banner */}
        {scanResult && scanResult.status !== "secure" && (
          <div
            className={cn(
              "mb-4 rounded-xl p-3 flex items-center gap-2.5 border",
              scanResult.status === "warning"
                ? "bg-amber-50 border-amber-200"
                : "bg-red-50 border-red-200"
            )}
          >
            <Shield
              size={16}
              className={scanResult.status === "warning" ? "text-amber-500" : "text-red-500"}
            />
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-xs font-semibold",
                scanResult.status === "warning" ? "text-amber-700" : "text-red-700"
              )}>
                Security Score: {scanResult.score}/100
              </p>
              <p className="text-[10px] text-slate-500">
                {scanResult.findings.filter(f => !f.resolved).length} issue(s) found
              </p>
            </div>
            <a
              href="/security"
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-lg",
                scanResult.status === "warning"
                  ? "text-amber-600 bg-amber-100 hover:bg-amber-200"
                  : "text-red-600 bg-red-100 hover:bg-red-200"
              )}
            >
              View
            </a>
          </div>
        )}

        {/* Account list */}
        {displayAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {searchQuery ? (
              <>
                <Search size={36} className="text-slate-200 mb-3" />
                <p className="text-sm font-medium text-slate-400">No accounts found</p>
                <p className="text-xs text-slate-300 mt-1">Try a different search term</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-empire-50 flex items-center justify-center mb-4">
                  <Key size={28} className="text-empire-300" />
                </div>
                <p className="text-sm font-semibold text-slate-500 mb-1">No accounts yet</p>
                <p className="text-xs text-slate-400 mb-4">Add your first 2FA account</p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="flex items-center gap-2 bg-empire-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-empire-600 transition-colors min-h-[44px]"
                >
                  <Plus size={16} />
                  Add Account
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={cn(
            "gap-3",
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col"
          )}>
            {displayAccounts.map((account) => (
              <OTPCard
                key={account.id}
                account={account}
                onFavorite={toggleFavorite}
                onDelete={deleteAccount}
                onMarkUsed={markUsed}
                expanded={expandedId === account.id}
                onExpand={() => setExpandedId(expandedId === account.id ? null : account.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAdd && (
        <AddAccountModal
          onAdd={addAccount}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}
