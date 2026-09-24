// Security utilities for AuthEmpire
import type { SecurityFinding, DeviceInfo, SecurityScanResult, SirenAlert } from "@/types";
import { MALICIOUS_URL_PATTERNS, TRUSTED_DOMAINS } from "@/constants";

export function detectDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  let browser = "Unknown";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return {
    platform: navigator.platform || "Unknown",
    browser,
    os,
    isMobile,
    isSecureContext: window.isSecureContext,
    hasBiometric: typeof PublicKeyCredential !== "undefined",
    hasPushSupport: "PushManager" in window,
    hasWebAuthn: typeof PublicKeyCredential !== "undefined",
    serviceWorkerActive: "serviceWorker" in navigator,
  };
}

export function runSecurityScan(): SecurityScanResult {
  const findings: SecurityFinding[] = [];
  const device = detectDeviceInfo();

  // Check 1: HTTPS / Secure context
  if (!device.isSecureContext) {
    findings.push({
      id: "no-https",
      severity: "high",
      category: "Transport Security",
      title: "Insecure Connection Detected",
      description: "The app is running on an insecure (HTTP) context. Authentication data may be exposed.",
      recommendation: "Access the app over HTTPS to ensure data encryption in transit.",
      resolved: false,
    });
  }

  // Check 2: WebAuthn availability
  if (!device.hasWebAuthn) {
    findings.push({
      id: "no-webauthn",
      severity: "medium",
      category: "Biometric Security",
      title: "Biometric Authentication Unavailable",
      description: "Your browser does not support WebAuthn/FIDO2 biometric authentication.",
      recommendation: "Update to a modern browser to enable biometric authentication.",
      resolved: false,
    });
  }

  // Check 3: Service Worker
  if (!device.serviceWorkerActive) {
    findings.push({
      id: "no-sw",
      severity: "low",
      category: "PWA Security",
      title: "Service Worker Not Supported",
      description: "Background security monitoring requires service worker support.",
      recommendation: "Use a modern browser for full offline and background monitoring capabilities.",
      resolved: false,
    });
  }

  // Check 4: Notification permissions
  if ("Notification" in window && Notification.permission === "denied") {
    findings.push({
      id: "notif-denied",
      severity: "medium",
      category: "Alert System",
      title: "Security Notifications Blocked",
      description: "Push notification permissions are denied. You won't receive real-time security alerts.",
      recommendation: "Enable notifications in your browser settings for this site.",
      resolved: false,
    });
  }

  // Check 5: Clipboard API
  if (!navigator.clipboard) {
    findings.push({
      id: "no-clipboard",
      severity: "low",
      category: "Usability",
      title: "Clipboard API Not Available",
      description: "Auto-copy OTP codes requires Clipboard API support.",
      recommendation: "Use a modern browser to enable clipboard functionality.",
      resolved: false,
    });
  }

  // Check 6: Local Storage encryption (simulated)
  const storedData = localStorage.getItem("authempire_data");
  if (storedData && !isDataEncrypted(storedData)) {
    findings.push({
      id: "unencrypted-storage",
      severity: "medium",
      category: "Data Security",
      title: "Local Data Not Encrypted",
      description: "Authentication secrets are stored in plaintext localStorage.",
      recommendation: "Enable device lock and browser security features. Future versions will use encrypted storage.",
      resolved: false,
    });
  }

  // Calculate score
  let score = 100;
  findings.forEach((f) => {
    if (!f.resolved) {
      if (f.severity === "critical") score -= 30;
      else if (f.severity === "high") score -= 20;
      else if (f.severity === "medium") score -= 10;
      else score -= 5;
    }
  });
  score = Math.max(0, score);

  let status: "secure" | "warning" | "critical" = "secure";
  if (score < 50) status = "critical";
  else if (score < 80) status = "warning";

  return {
    score,
    status,
    findings,
    scannedAt: Date.now(),
    nextScanAt: Date.now() + 24 * 60 * 60 * 1000,
    deviceInfo: device,
  };
}

function isDataEncrypted(data: string): boolean {
  try {
    const parsed = JSON.parse(data);
    // If it's parseable JSON with accounts array, it's not encrypted
    return !(parsed && Array.isArray(parsed.accounts));
  } catch {
    return true; // Can't parse = likely encrypted or corrupted
  }
}

export function analyzeURL(url: string): { isMalicious: boolean; isSuspicious: boolean; reason: string; severity: "warning" | "danger" } {
  let reason = "";
  let isMalicious = false;
  let isSuspicious = false;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Check trusted domains
    const isTrusted = TRUSTED_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`));
    if (isTrusted) return { isMalicious: false, isSuspicious: false, reason: "Trusted domain", severity: "warning" };

    // Check malicious patterns
    for (const pattern of MALICIOUS_URL_PATTERNS) {
      if (pattern.test(url)) {
        isMalicious = true;
        reason = `Matches malicious pattern: ${pattern.source}`;
        break;
      }
    }

    // Check for suspicious characteristics
    if (!isMalicious) {
      // IP address instead of domain
      if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        isSuspicious = true;
        reason = "IP address used instead of domain name";
      }
      // Very long subdomains (common in phishing)
      else if (hostname.split(".").some((part) => part.length > 30)) {
        isSuspicious = true;
        reason = "Unusually long subdomain detected";
      }
      // Many subdomains
      else if (hostname.split(".").length > 5) {
        isSuspicious = true;
        reason = "Excessive subdomains detected";
      }
      // Mixed unicode characters
      else if (/[^\x00-\x7F]/.test(hostname)) {
        isSuspicious = true;
        reason = "Non-ASCII characters in domain (possible IDN homograph attack)";
      }
      // Lookalike domains
      else if (/g[o0]{2}gle|payp[a@]l|micros[o0]ft|app[l1]e|amaz[o0]n/i.test(hostname)) {
        isMalicious = true;
        reason = "Domain appears to impersonate a trusted service";
      }
    }
  } catch {
    isSuspicious = true;
    reason = "Invalid or malformed URL";
  }

  return {
    isMalicious,
    isSuspicious,
    reason,
    severity: isMalicious ? "danger" : "warning",
  };
}

export function createSirenAlert(url: string, analysis: ReturnType<typeof analyzeURL>): SirenAlert {
  return {
    id: `alert-${Date.now()}`,
    url,
    reason: analysis.reason,
    severity: analysis.severity,
    timestamp: Date.now(),
    blocked: analysis.isMalicious,
  };
}

export function generateRecoveryCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const bytes = new Uint8Array(5);
    crypto.getRandomValues(bytes);
    const code = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
    codes.push(`${code.slice(0, 5)}-${code.slice(5)}`);
  }
  return codes;
}

export function hashData(data: string): string {
  // Simple deterministic hash for display purposes
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0").toUpperCase();
}

export function maskSecret(secret: string): string {
  if (secret.length <= 4) return "****";
  return secret.slice(0, 4) + "*".repeat(secret.length - 4);
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function getSecurityColor(status: "secure" | "warning" | "critical"): string {
  switch (status) {
    case "secure": return "#10b981";
    case "warning": return "#f59e0b";
    case "critical": return "#ef4444";
  }
}

export function getScoreGrade(score: number): { grade: string; color: string } {
  if (score >= 90) return { grade: "A+", color: "#10b981" };
  if (score >= 80) return { grade: "A", color: "#10b981" };
  if (score >= 70) return { grade: "B+", color: "#0ea5e9" };
  if (score >= 60) return { grade: "B", color: "#0ea5e9" };
  if (score >= 50) return { grade: "C", color: "#f59e0b" };
  if (score >= 40) return { grade: "D", color: "#f97316" };
  return { grade: "F", color: "#ef4444" };
}
