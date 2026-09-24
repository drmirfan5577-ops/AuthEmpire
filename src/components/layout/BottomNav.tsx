import { useLocation, useNavigate } from "react-router-dom";
import { Shield, Key, Settings, Activity, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSecurityScanner } from "@/hooks/useSecurityScanner";

const navItems = [
  { path: "/dashboard", icon: Key, label: "Codes" },
  { path: "/security", icon: Shield, label: "Security" },
  { path: "/activity", icon: Activity, label: "Activity" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { unacknowledgedCount } = useSecurityScanner();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-2xl mx-auto lg:max-w-6xl">
        <div className="glass-strong mx-3 mb-3 rounded-2xl border border-white/80">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              const showBadge = path === "/security" && unacknowledgedCount > 0;

              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={cn(
                    "relative flex flex-col items-center gap-1 min-w-[60px] py-2 px-3 rounded-xl",
                    "transition-all duration-200 min-h-[44px] min-w-[44px]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400",
                    isActive
                      ? "bg-empire-500/10 text-empire-600"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/60"
                  )}
                  aria-label={label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="relative">
                    <Icon
                      size={20}
                      className={cn(
                        "transition-all duration-200",
                        isActive && "drop-shadow-[0_0_6px_rgba(14,165,233,0.6)]"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unacknowledgedCount > 9 ? "9+" : unacknowledgedCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium transition-all duration-200",
                      isActive ? "text-empire-600" : "text-slate-400"
                    )}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-empire-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
