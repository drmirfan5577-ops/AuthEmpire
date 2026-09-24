export const APP_NAME = "AuthEmpire";
export const APP_VERSION = "1.0.0";
export const STORAGE_KEY = "authempire_data";
export const SETTINGS_KEY = "authempire_settings";
export const SECURITY_KEY = "authempire_security";
export const EVENTS_KEY = "authempire_events";
export const SESSION_KEY = "authempire_session";

// TOTP defaults
export const DEFAULT_PERIOD = 30; // seconds
export const DEFAULT_DIGITS = 6;
export const DEFAULT_ALGORITHM = "SHA1";
export const EXPIRING_THRESHOLD = 5; // seconds

// Security scan
export const SCAN_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const MAX_EVENTS = 100;

// Malicious patterns (basic detection)
export const MALICIOUS_URL_PATTERNS = [
  /phish/i,
  /hack/i,
  /malware/i,
  /virus/i,
  /trojan/i,
  /ransomware/i,
  /spyware/i,
  /keylogger/i,
  /credential.?steal/i,
  /password.?dump/i,
  /exploit/i,
  /shellcode/i,
  /payload/i,
  /c2server/i,
  /botnet/i,
  /darkweb/i,
  /tor2web/i,
  /\.onion\./i,
  /free.?iphone/i,
  /win.?prize/i,
  /claim.?reward/i,
  /verify.?account.?now/i,
  /urgent.?action/i,
];

export const SUSPICIOUS_DOMAINS = [
  "bit.ly/malware",
  "goo.gl/phish",
  "tinyurl.com/hack",
];

// Trusted domains (never flag)
export const TRUSTED_DOMAINS = [
  "google.com",
  "github.com",
  "microsoft.com",
  "apple.com",
  "amazon.com",
  "cloudflare.com",
  "fastly.com",
  "mozilla.org",
];

// Account categories with colors
export const ACCOUNT_COLORS = [
  "#0ea5e9", // Blue
  "#6366f1", // Indigo
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#06b6d4", // Cyan
];

// Service categories
export const SERVICE_CATEGORIES = {
  social: { label: "Social Media", icon: "Users", color: "#6366f1" },
  finance: { label: "Finance & Banking", icon: "DollarSign", color: "#10b981" },
  work: { label: "Work & Productivity", icon: "Briefcase", color: "#0ea5e9" },
  email: { label: "Email", icon: "Mail", color: "#f59e0b" },
  shopping: { label: "Shopping", icon: "ShoppingBag", color: "#ec4899" },
  other: { label: "Other", icon: "Grid", color: "#8b5cf6" },
};

// Demo accounts for V1.0
export const DEMO_ACCOUNTS = [
  {
    id: "demo-github",
    issuer: "GitHub",
    label: "user@github.com",
    secret: "JBSWY3DPEHPK3PXP",
    algorithm: "SHA1" as const,
    digits: 6 as const,
    period: 30 as const,
    type: "totp" as const,
    color: "#1a1a2e",
    tags: ["work", "code"],
    createdAt: Date.now() - 86400000 * 30,
    isFavorite: true,
  },
  {
    id: "demo-google",
    issuer: "Google",
    label: "user@gmail.com",
    secret: "JBSWY3DPEHPK3PXQ",
    algorithm: "SHA1" as const,
    digits: 6 as const,
    period: 30 as const,
    type: "totp" as const,
    color: "#4285f4",
    tags: ["email", "personal"],
    createdAt: Date.now() - 86400000 * 15,
    isFavorite: true,
  },
  {
    id: "demo-twitter",
    issuer: "X (Twitter)",
    label: "user@twitter.com",
    secret: "JBSWY3DPEHPK3PXR",
    algorithm: "SHA1" as const,
    digits: 6 as const,
    period: 30 as const,
    type: "totp" as const,
    color: "#000000",
    tags: ["social"],
    createdAt: Date.now() - 86400000 * 7,
    isFavorite: false,
  },
];

export const AUTO_LOCK_OPTIONS = [
  { value: 0, label: "Never" },
  { value: 1, label: "1 minute" },
  { value: 5, label: "5 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
];
