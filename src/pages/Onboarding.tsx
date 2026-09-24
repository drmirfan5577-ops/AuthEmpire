import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Key, Fingerprint, Bell, ChevronRight, Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBiometric } from "@/hooks/useBiometric";
import { usePWA } from "@/hooks/usePWA";

const steps = [
  {
    id: "welcome",
    icon: Shield,
    title: "Welcome to AuthEmpire",
    subtitle: "Your personal 2FA Security Empire",
    description:
      "Industry-grade authentication just like GitHub's security setup — biometric verification, live OTP codes, and 24/7 threat monitoring.",
    color: "from-empire-500 to-indigo-500",
    bgColor: "from-empire-50 to-indigo-50",
  },
  {
    id: "biometric",
    icon: Fingerprint,
    title: "Enable Biometric Auth",
    subtitle: "Fingerprint or Face Unlock",
    description:
      "Secure your authenticator with biometric verification. Uses WebAuthn/FIDO2 — your data never leaves your device.",
    color: "from-violet-500 to-purple-500",
    bgColor: "from-violet-50 to-purple-50",
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Security Alerts",
    subtitle: "Real-time threat notifications",
    description:
      "Allow notifications to receive instant security alerts, malicious link warnings, and 24/7 monitoring reports.",
    color: "from-amber-500 to-orange-500",
    bgColor: "from-amber-50 to-orange-50",
  },
  {
    id: "ready",
    icon: Zap,
    title: "You're Protected!",
    subtitle: "Security Empire is ready",
    description:
      "AuthEmpire is configured and monitoring 24/7. Your authentication codes are live and your security is active.",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50",
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [biometricDone, setBiometricDone] = useState(false);
  const [notifDone, setNotifDone] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { register } = useBiometric();
  const { requestNotificationPermission } = usePWA();

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleAction = async () => {
    setIsProcessing(true);

    try {
      if (step.id === "biometric" && !biometricDone) {
        const success = await register();
        if (success) setBiometricDone(true);
      } else if (step.id === "notifications" && !notifDone) {
        await requestNotificationPermission();
        setNotifDone(true);
      }
    } finally {
      setIsProcessing(false);
    }

    if (isLast) {
      localStorage.setItem("authempire_onboarded", "true");
      navigate("/dashboard");
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const stepDone = (id: string) => {
    if (id === "biometric") return biometricDone;
    if (id === "notifications") return notifDone;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col app-bg overflow-hidden">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-12 pb-4">
        {steps.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === currentStep
                ? "w-6 bg-empire-500"
                : i < currentStep
                ? "w-3 bg-empire-300"
                : "w-3 bg-slate-200"
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div
          key={currentStep}
          className="w-full max-w-sm animate-fade-in-up"
        >
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div
              className={cn(
                "relative w-28 h-28 rounded-3xl flex items-center justify-center",
                `bg-gradient-to-br ${step.bgColor}`
              )}
              style={{ boxShadow: "0 20px 60px rgba(14,165,233,0.15)" }}
            >
              <step.icon
                size={52}
                className={cn("transition-all", `bg-gradient-to-br ${step.color} text-transparent bg-clip-text`)}
                style={{
                  color: step.id === "welcome" ? "#0ea5e9"
                    : step.id === "biometric" ? "#8b5cf6"
                    : step.id === "notifications" ? "#f59e0b"
                    : "#10b981"
                }}
              />
              {stepDone(step.id) && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Text */}
          <div className="text-center mb-8">
            <p className={cn(
              "text-xs font-bold uppercase tracking-widest mb-1",
              step.id === "welcome" ? "text-empire-400"
                : step.id === "biometric" ? "text-violet-400"
                : step.id === "notifications" ? "text-amber-500"
                : "text-green-500"
            )}>
              {step.subtitle}
            </p>
            <h1 className="text-2xl font-black text-slate-800 mb-3">{step.title}</h1>
            <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
          </div>

          {/* Feature highlights for welcome step */}
          {step.id === "welcome" && (
            <div className="space-y-2 mb-6">
              {[
                { icon: Key, text: "Live TOTP codes with 30s countdown" },
                { icon: Fingerprint, text: "Biometric unlock — WebAuthn/FIDO2" },
                { icon: Shield, text: "24/7 auto security scanner" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 glass rounded-xl p-3">
                  <div className="w-7 h-7 rounded-lg bg-empire-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-empire-500" />
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{text}</p>
                </div>
              ))}
            </div>
          )}

          {/* GitHub-style setup info for biometric */}
          {step.id === "biometric" && (
            <div className="bg-violet-50 rounded-xl p-3 mb-6 text-xs text-violet-700">
              <p className="font-semibold mb-1">🔐 GitHub-Style Security</p>
              <p>Just like GitHub's 2FA setup — your biometric data stays on your device using platform authenticator (Touch ID / Face ID / Windows Hello).</p>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleAction}
            disabled={isProcessing}
            className={cn(
              "w-full py-4 rounded-2xl text-white font-bold text-base transition-all duration-200",
              "flex items-center justify-center gap-2 min-h-[56px]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400",
              "active:scale-95 disabled:opacity-70",
              isLast
                ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-glow-green"
                : `bg-gradient-to-r ${step.color}`
            )}
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {stepDone(step.id) ? <Check size={18} /> : isLast ? <Zap size={18} /> : <ChevronRight size={18} />}
                {isLast
                  ? "Enter AuthEmpire"
                  : stepDone(step.id)
                  ? "Continue"
                  : step.id === "biometric"
                  ? "Set Up Biometric"
                  : step.id === "notifications"
                  ? "Allow Notifications"
                  : "Get Started"}
              </>
            )}
          </button>

          {/* Skip */}
          {!isLast && step.id !== "welcome" && (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              className="mt-3 w-full text-sm text-slate-400 hover:text-slate-600 py-2 transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
