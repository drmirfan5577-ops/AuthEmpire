import { useState } from "react";
import { Fingerprint, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBiometric } from "@/hooks/useBiometric";

interface BiometricAuthProps {
  onSuccess: () => void;
  onFallback?: () => void;
  mode?: "unlock" | "verify";
  title?: string;
  subtitle?: string;
}

export default function BiometricAuth({
  onSuccess,
  onFallback,
  mode = "unlock",
  title,
  subtitle,
}: BiometricAuthProps) {
  const { authenticate, isAuthenticating, error, isAvailable } = useBiometric();
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");

  const handleAuth = async () => {
    setStatus("scanning");
    const success = await authenticate();
    if (success) {
      setStatus("success");
      setTimeout(onSuccess, 600);
    } else {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center text-center px-6 py-8">
      {/* Icon */}
      <div className="relative mb-6">
        <div
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500",
            status === "idle" && "bg-empire-50 text-empire-400",
            status === "scanning" && "bg-empire-100 text-empire-500 animate-pulse",
            status === "success" && "bg-green-50 text-green-500",
            status === "error" && "bg-red-50 text-red-400",
          )}
          style={{
            boxShadow:
              status === "scanning"
                ? "0 0 40px rgba(14,165,233,0.3), 0 0 80px rgba(14,165,233,0.15)"
                : status === "success"
                ? "0 0 40px rgba(16,185,129,0.3)"
                : status === "error"
                ? "0 0 40px rgba(239,68,68,0.2)"
                : "0 0 20px rgba(14,165,233,0.1)",
          }}
        >
          {status === "scanning" ? (
            <Loader2 size={40} className="animate-spin" />
          ) : status === "success" ? (
            <CheckCircle2 size={40} />
          ) : status === "error" ? (
            <AlertCircle size={40} />
          ) : (
            <Fingerprint size={40} />
          )}
        </div>

        {/* Pulse rings */}
        {status === "scanning" && (
          <>
            <div className="absolute inset-0 rounded-full bg-empire-400/20 animate-ping" />
            <div className="absolute inset-0 rounded-full bg-empire-400/10 animate-ping [animation-delay:0.3s]" />
          </>
        )}
        {status === "success" && (
          <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
        )}
      </div>

      {/* Text */}
      <h3 className="text-lg font-semibold text-slate-700 mb-1">
        {title ??
          (mode === "unlock" ? "Unlock AuthEmpire" : "Verify Identity")}
      </h3>
      <p className="text-sm text-slate-400 mb-6 max-w-xs">
        {status === "scanning"
          ? "Verifying biometric..."
          : status === "success"
          ? "Identity verified!"
          : status === "error"
          ? "Verification failed. Try again."
          : subtitle ?? (
              isAvailable
                ? "Use your fingerprint or face to authenticate"
                : "Touch the button to authenticate"
            )}
      </p>

      {/* Auth Button */}
      {(status === "idle" || status === "error") && (
        <button
          onClick={handleAuth}
          disabled={isAuthenticating}
          className={cn(
            "w-full max-w-xs py-4 px-8 rounded-2xl text-white font-semibold text-base",
            "transition-all duration-200 min-h-[52px]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400",
            status === "error"
              ? "bg-red-100 text-red-500 hover:bg-red-200"
              : "bg-gradient-to-r from-empire-500 to-indigo-500 hover:from-empire-600 hover:to-indigo-600",
            "shadow-glass active:scale-95"
          )}
          aria-label="Authenticate with biometric"
        >
          <div className="flex items-center justify-center gap-2">
            {status === "error" ? (
              <>
                <AlertCircle size={18} />
                Try Again
              </>
            ) : (
              <>
                <Fingerprint size={18} />
                {isAvailable ? "Use Biometric" : "Authenticate"}
              </>
            )}
          </div>
        </button>
      )}

      {/* Fallback option */}
      {onFallback && status !== "scanning" && (
        <button
          onClick={onFallback}
          className="mt-4 text-sm text-empire-400 hover:text-empire-600 transition-colors py-2 px-4 min-h-[44px]"
        >
          Use PIN instead
        </button>
      )}

      {/* Error message */}
      {error && status === "error" && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
