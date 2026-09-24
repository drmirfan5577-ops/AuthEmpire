import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Fingerprint, Zap } from "lucide-react";
import { useBiometric } from "@/hooks/useBiometric";
import { usePWA } from "@/hooks/usePWA";
import BiometricAuth from "@/components/features/BiometricAuth";
import { cn } from "@/lib/utils";

type Phase = "intro" | "auth" | "pin";

export default function Splash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");
  const [pin, setPin] = useState("");
  const [isFirstTime] = useState(() => !localStorage.getItem("authempire_data"));
  const { canInstall, install, swRegistered } = usePWA();
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Check if already set up
    const lockData = localStorage.getItem("authempire_lock");
    const hasAccounts = localStorage.getItem("authempire_data");

    if (!hasAccounts && isFirstTime) {
      // First time — show intro then go to onboarding
      setTimeout(() => navigate("/onboarding"), 2500);
      return;
    }

    // Show auth after intro animation
    setTimeout(() => setPhase("auth"), 1500);

    // Show install banner after delay
    if (canInstall) setTimeout(() => setShowInstallBanner(true), 3000);
  }, [navigate, isFirstTime, canInstall]);

  const handleBiometricSuccess = () => {
    localStorage.setItem("authempire_lock", JSON.stringify({ lastUnlocked: Date.now() }));
    navigate("/dashboard");
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 6) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 6) {
      // Simple pin verification (demo)
      setTimeout(() => {
        navigate("/dashboard");
      }, 300);
    }
  };

  const clearPin = () => setPin((p) => p.slice(0, -1));

  const pinDigits = ["1","2","3","4","5","6","7","8","9","","0","⌫"];

  if (isFirstTime) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 app-bg overflow-hidden">
        <div className="animate-fade-in-up text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <img src="/logo.png" alt="AuthEmpire" className="w-24 h-24 rounded-3xl shadow-glass-lg animate-float" />
            <div className="absolute inset-0 rounded-3xl bg-empire-400/20 animate-ping" />
          </div>
          <h1 className="text-3xl font-black text-gradient mb-2">AuthEmpire</h1>
          <p className="text-slate-500 text-sm">Setting up your security empire...</p>
          <div className="mt-6 flex gap-1 justify-center">
            {[0,1,2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-empire-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 app-bg relative overflow-hidden">
      {/* Decorative BG */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-empire-100/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="relative inline-block mb-4">
            <img src="/logo.png" alt="AuthEmpire" className="w-20 h-20 rounded-3xl shadow-glass-lg mx-auto" />
            {swRegistered && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                <Zap size={10} className="text-white" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-black text-gradient">AuthEmpire</h1>
          <p className="text-xs text-slate-400 mt-0.5">2FA Security Authenticator</p>
        </div>

        {/* Auth Section */}
        {phase === "auth" && (
          <div className="glass-strong rounded-3xl overflow-hidden animate-fade-in-up">
            <BiometricAuth
              onSuccess={handleBiometricSuccess}
              onFallback={() => setPhase("pin")}
              mode="unlock"
              title="Welcome back"
              subtitle="Authenticate to access your codes"
            />
          </div>
        )}

        {/* PIN Section */}
        {phase === "pin" && (
          <div className="glass-strong rounded-3xl p-5 animate-fade-in-up">
            <div className="text-center mb-6">
              <Lock size={28} className="text-empire-400 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-700">Enter PIN</h3>
              <p className="text-xs text-slate-400">6-digit PIN to unlock</p>
            </div>

            {/* PIN dots */}
            <div className="flex justify-center gap-3 mb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-full border-2 transition-all duration-200",
                    i < pin.length
                      ? "bg-empire-500 border-empire-500 scale-110"
                      : "border-slate-300"
                  )}
                />
              ))}
            </div>

            {/* PIN pad */}
            <div className="grid grid-cols-3 gap-2.5">
              {pinDigits.map((digit, idx) => (
                <button
                  key={idx}
                  onClick={() => digit === "⌫" ? clearPin() : digit ? handlePinDigit(digit) : undefined}
                  disabled={!digit}
                  className={cn(
                    "h-14 rounded-2xl text-lg font-semibold transition-all duration-150",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400",
                    "active:scale-95",
                    digit === "⌫"
                      ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      : digit
                      ? "bg-slate-50 text-slate-700 hover:bg-empire-50 hover:text-empire-600 shadow-sm"
                      : "invisible"
                  )}
                  aria-label={digit === "⌫" ? "Delete" : digit || undefined}
                >
                  {digit}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPhase("auth")}
              className="mt-4 w-full text-sm text-empire-400 hover:text-empire-600 py-2 transition-colors"
            >
              Use biometric instead
            </button>
          </div>
        )}

        {/* PWA Install Banner */}
        {showInstallBanner && canInstall && (
          <div className="mt-4 glass rounded-2xl p-4 animate-slide-in-right">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-empire-50 flex items-center justify-center flex-shrink-0">
                <img src="/logo.png" alt="" className="w-5 h-5 rounded-md" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700">Install AuthEmpire</p>
                <p className="text-[10px] text-slate-400">Add to home screen for full features</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="text-[10px] text-slate-400 px-2 py-1 hover:text-slate-600"
                >
                  Later
                </button>
                <button
                  onClick={install}
                  className="text-[10px] bg-empire-500 text-white px-3 py-1 rounded-lg font-medium hover:bg-empire-600 transition-colors"
                >
                  Install
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
