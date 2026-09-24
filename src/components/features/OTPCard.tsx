import { useState, useCallback } from "react";
import { Copy, Star, StarOff, Trash2, ChevronRight, Check, RefreshCw } from "lucide-react";
import { cn, copyToClipboard, triggerHaptic } from "@/lib/utils";
import { formatOTPCode } from "@/lib/totp";
import { useTOTP } from "@/hooks/useTOTP";
import type { AuthAccount } from "@/types";
import { getInitials } from "@/lib/utils";

interface OTPCardProps {
  account: AuthAccount;
  onFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkUsed: (id: string) => void;
  expanded?: boolean;
  onExpand?: () => void;
}

export default function OTPCard({
  account,
  onFavorite,
  onDelete,
  onMarkUsed,
  expanded = false,
  onExpand,
}: OTPCardProps) {
  const [copied, setCopied] = useState(false);
  const { code, timeRemaining, progress, isExpiring } = useTOTP(
    account.secret,
    account.period,
    account.digits
  );

  const handleCopy = useCallback(async () => {
    const rawCode = code.replace(/\s/g, "");
    const success = await copyToClipboard(rawCode);
    if (success) {
      setCopied(true);
      triggerHaptic("light");
      onMarkUsed(account.id);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code, account.id, onMarkUsed]);

  const formattedCode = formatOTPCode(code);
  const circumference = 2 * Math.PI * 14; // radius = 14
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colorMap: Record<string, string> = {
    "#1a1a2e": "bg-slate-800",
    "#4285f4": "bg-blue-500",
    "#000000": "bg-gray-900",
  };

  return (
    <div
      className={cn(
        "glass-card rounded-2xl overflow-hidden transition-all duration-300",
        isExpiring && "ring-1 ring-amber-300/50",
        copied && "ring-1 ring-green-300/50"
      )}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Account Avatar */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
            style={{ backgroundColor: account.color }}
          >
            {getInitials(account.issuer)}
          </div>

          {/* Account Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700 truncate">{account.issuer}</p>
            <p className="text-xs text-slate-400 truncate">{account.label}</p>
          </div>

          {/* Timer Ring */}
          <div className="relative w-8 h-8 flex-shrink-0">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32" aria-hidden="true">
              <circle
                cx="16" cy="16" r="14"
                fill="none"
                stroke="rgba(0,0,0,0.06)"
                strokeWidth="2.5"
              />
              <circle
                cx="16" cy="16" r="14"
                fill="none"
                stroke={isExpiring ? "#f59e0b" : "#0ea5e9"}
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center text-[9px] font-bold",
                isExpiring ? "text-amber-500" : "text-empire-500"
              )}
            >
              {timeRemaining}
            </span>
          </div>
        </div>

        {/* OTP Code */}
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="group flex items-center gap-2 flex-1 min-h-[44px]"
            title="Copy code"
            aria-label={`Copy OTP code for ${account.issuer}`}
          >
            <span
              className={cn(
                "font-mono text-2xl font-bold tracking-widest transition-all duration-300",
                isExpiring
                  ? "text-amber-500"
                  : "text-gradient",
                copied && "text-green-500"
              )}
              style={copied || isExpiring ? {} : undefined}
            >
              {formattedCode}
            </span>
          </button>

          <div className="flex items-center gap-1 ml-2">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400",
                copied
                  ? "bg-green-50 text-green-500"
                  : "bg-slate-50 text-slate-400 hover:bg-empire-50 hover:text-empire-500"
              )}
              aria-label="Copy code"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>

            {/* Favorite button */}
            <button
              onClick={() => onFavorite(account.id)}
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400",
                account.isFavorite
                  ? "bg-amber-50 text-amber-400"
                  : "bg-slate-50 text-slate-300 hover:bg-amber-50 hover:text-amber-400"
              )}
              aria-label={account.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {account.isFavorite ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
            </button>

            {/* Expand button */}
            {onExpand && (
              <button
                onClick={onExpand}
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                  "bg-slate-50 text-slate-400 hover:bg-empire-50 hover:text-empire-500",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400",
                  expanded && "rotate-90"
                )}
                aria-label="Expand account details"
                aria-expanded={expanded}
              >
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-0.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              isExpiring
                ? "bg-amber-400"
                : "bg-gradient-to-r from-empire-400 to-indigo-400"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-100/60 animate-fade-in">
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-slate-50/80 rounded-lg p-2 text-center">
              <p className="text-[10px] text-slate-400 mb-0.5">Algorithm</p>
              <p className="text-xs font-semibold text-slate-600">{account.algorithm}</p>
            </div>
            <div className="bg-slate-50/80 rounded-lg p-2 text-center">
              <p className="text-[10px] text-slate-400 mb-0.5">Digits</p>
              <p className="text-xs font-semibold text-slate-600">{account.digits}</p>
            </div>
            <div className="bg-slate-50/80 rounded-lg p-2 text-center">
              <p className="text-[10px] text-slate-400 mb-0.5">Period</p>
              <p className="text-xs font-semibold text-slate-600">{account.period}s</p>
            </div>
          </div>
          {account.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {account.tags.map((tag) => (
                <span key={tag} className="text-[10px] bg-empire-50 text-empire-600 px-2 py-0.5 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={() => onDelete(account.id)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-red-400 hover:text-red-500 hover:bg-red-50/60 rounded-lg py-2 transition-all duration-200"
          >
            <Trash2 size={12} />
            Remove Account
          </button>
        </div>
      )}
    </div>
  );
}
