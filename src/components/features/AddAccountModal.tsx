import { useState } from "react";
import { X, QrCode, Hash, ChevronRight, Camera, Eye, EyeOff, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateSecret, parseOTPAuthURL } from "@/lib/totp";
import { ACCOUNT_COLORS } from "@/constants";
import type { AuthAccount } from "@/types";

interface AddAccountModalProps {
  onAdd: (account: Omit<AuthAccount, "id" | "createdAt">) => void;
  onClose: () => void;
}

type Step = "method" | "manual" | "qr";

export default function AddAccountModal({ onAdd, onClose }: AddAccountModalProps) {
  const [step, setStep] = useState<Step>("method");
  const [showSecret, setShowSecret] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const [qrInput, setQrInput] = useState("");
  const [qrError, setQrError] = useState("");

  const [form, setForm] = useState({
    issuer: "",
    label: "",
    secret: "",
    algorithm: "SHA1" as "SHA1",
    digits: 6 as 6,
    period: 30 as 30,
    type: "totp" as "totp",
    tags: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.issuer.trim()) errs.issuer = "Service name is required";
    if (!form.label.trim()) errs.label = "Account label is required";
    if (!form.secret.trim()) errs.secret = "Secret key is required";
    if (form.secret.length < 16) errs.secret = "Secret must be at least 16 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onAdd({
      issuer: form.issuer.trim(),
      label: form.label.trim(),
      secret: form.secret.toUpperCase().replace(/\s/g, ""),
      algorithm: form.algorithm,
      digits: form.digits,
      period: form.period,
      type: form.type,
      color: ACCOUNT_COLORS[colorIdx],
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      isFavorite: false,
    });
    onClose();
  };

  const handleQRParse = () => {
    setQrError("");
    const parsed = parseOTPAuthURL(qrInput.trim());
    if (!parsed) {
      setQrError("Invalid OTP URL. Format: otpauth://totp/Issuer:label?secret=...");
      return;
    }
    onAdd({
      issuer: parsed.issuer,
      label: parsed.label,
      secret: parsed.secret,
      algorithm: parsed.digits === 8 ? "SHA256" : "SHA1" as "SHA1",
      digits: parsed.digits as 6,
      period: parsed.period as 30,
      type: parsed.type,
      color: ACCOUNT_COLORS[Math.floor(Math.random() * ACCOUNT_COLORS.length)],
      tags: [],
      isFavorite: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-glass-lg overflow-hidden animate-slide-in-left sm:animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Add Account</h2>
            <p className="text-xs text-slate-400">
              {step === "method" && "Choose how to add your account"}
              {step === "manual" && "Enter account details manually"}
              {step === "qr" && "Paste your OTP auth URL"}
            </p>
          </div>
          <button
            onClick={step === "method" ? onClose : () => setStep("method")}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[80vh] overflow-y-auto custom-scroll">
          {/* Method Selection */}
          {step === "method" && (
            <div className="space-y-3">
              <button
                onClick={() => setStep("qr")}
                className="w-full glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-empire-200 transition-all group min-h-[64px] focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400"
              >
                <div className="w-12 h-12 rounded-xl bg-empire-50 flex items-center justify-center text-empire-500 group-hover:bg-empire-100 transition-colors flex-shrink-0">
                  <QrCode size={22} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-slate-700">Scan QR Code / Paste URL</p>
                  <p className="text-xs text-slate-400">Paste otpauth:// URL from your service</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-empire-400 transition-colors" />
              </button>

              <button
                onClick={() => setStep("manual")}
                className="w-full glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-empire-200 transition-all group min-h-[64px] focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 transition-colors flex-shrink-0">
                  <Hash size={22} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-slate-700">Enter Manually</p>
                  <p className="text-xs text-slate-400">Enter service name, account & secret key</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-empire-400 transition-colors" />
              </button>
            </div>
          )}

          {/* QR / URL Input */}
          {step === "qr" && (
            <div className="space-y-4">
              <div className="bg-empire-50 rounded-2xl p-4 text-center">
                <Camera size={32} className="text-empire-400 mx-auto mb-2" />
                <p className="text-sm text-empire-600 font-medium">GitHub-Style Setup</p>
                <p className="text-xs text-empire-400 mt-1">
                  On the service's 2FA page, copy the "otpauth://" URL or manual entry key
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="otp-url">
                  OTP Auth URL or Secret Key
                </label>
                <textarea
                  id="otp-url"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="otpauth://totp/GitHub:username?secret=JBSWY3DP&issuer=GitHub"
                  className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700 resize-none focus:outline-none focus:border-empire-300 focus:ring-1 focus:ring-empire-300"
                  aria-describedby={qrError ? "qr-error" : undefined}
                />
                {qrError && (
                  <p id="qr-error" className="text-xs text-red-500 mt-1" role="alert">{qrError}</p>
                )}
              </div>

              <button
                onClick={handleQRParse}
                disabled={!qrInput.trim()}
                className="w-full bg-gradient-to-r from-empire-500 to-indigo-500 text-white font-semibold py-3 rounded-xl hover:from-empire-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400"
              >
                Parse & Add Account
              </button>
            </div>
          )}

          {/* Manual Entry */}
          {step === "manual" && (
            <div className="space-y-4">
              {/* Color picker */}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Account Color</p>
                <div className="flex gap-2 flex-wrap">
                  {ACCOUNT_COLORS.map((color, idx) => (
                    <button
                      key={color}
                      onClick={() => setColorIdx(idx)}
                      className={cn(
                        "w-7 h-7 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400",
                        colorIdx === idx && "ring-2 ring-offset-2 ring-slate-400 scale-110"
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Color ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Form fields */}
              {[
                { id: "issuer", label: "Service Name", placeholder: "e.g. GitHub, Google", key: "issuer" },
                { id: "label", label: "Account / Email", placeholder: "e.g. user@example.com", key: "label" },
              ].map(({ id, label, placeholder, key }) => (
                <div key={id}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor={id}>
                    {label}
                  </label>
                  <input
                    id={id}
                    type="text"
                    value={form[key as keyof typeof form] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-empire-300 focus:ring-1 focus:ring-empire-300 min-h-[44px]"
                    aria-describedby={errors[key] ? `${id}-error` : undefined}
                  />
                  {errors[key] && (
                    <p id={`${id}-error`} className="text-xs text-red-500 mt-1" role="alert">
                      {errors[key]}
                    </p>
                  )}
                </div>
              ))}

              {/* Secret */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600" htmlFor="secret">
                    Secret Key
                  </label>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, secret: generateSecret() }))}
                    className="text-xs text-empire-400 hover:text-empire-600 flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw size={10} />
                    Generate
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="secret"
                    type={showSecret ? "text" : "password"}
                    value={form.secret}
                    onChange={(e) => setForm((f) => ({ ...f, secret: e.target.value }))}
                    placeholder="Base32 secret key"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pr-10 text-sm font-mono text-slate-700 focus:outline-none focus:border-empire-300 focus:ring-1 focus:ring-empire-300 min-h-[44px]"
                    aria-describedby={errors.secret ? "secret-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none"
                    aria-label={showSecret ? "Hide secret" : "Show secret"}
                  >
                    {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.secret && (
                  <p id="secret-error" className="text-xs text-red-500 mt-1" role="alert">
                    {errors.secret}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="tags">
                  Tags <span className="font-normal text-slate-400">(comma separated)</span>
                </label>
                <input
                  id="tags"
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="e.g. work, personal, social"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-empire-300 focus:ring-1 focus:ring-empire-300 min-h-[44px]"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-empire-500 to-indigo-500 text-white font-semibold py-3 rounded-xl hover:from-empire-600 hover:to-indigo-600 transition-all min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-empire-400"
              >
                Add Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
