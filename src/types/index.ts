// Core application types for AuthEmpire

export interface AuthAccount {
  id: string;
  issuer: string;
  label: string;
  secret: string;
  algorithm: "SHA1" | "SHA256" | "SHA512";
  digits: 6 | 8;
  period: 30 | 60;
  type: "totp" | "hotp";
  counter?: number;
  icon?: string;
  color: string;
  tags: string[];
  createdAt: number;
  lastUsed?: number;
  isFavorite: boolean;
}

export interface TOTPState {
  code: string;
  previousCode: string;
  timeRemaining: number;
  progress: number; // 0-100
  isExpiring: boolean; // last 5 seconds
}

export interface SecurityEvent {
  id: string;
  type: "info" | "warning" | "danger" | "success";
  title: string;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface SecurityScanResult {
  score: number; // 0-100
  status: "secure" | "warning" | "critical";
  findings: SecurityFinding[];
  scannedAt: number;
  nextScanAt: number;
  deviceInfo: DeviceInfo;
}

export interface SecurityFinding {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  title: string;
  description: string;
  recommendation: string;
  resolved: boolean;
}

export interface DeviceInfo {
  platform: string;
  browser: string;
  os: string;
  isMobile: boolean;
  isSecureContext: boolean;
  hasBiometric: boolean;
  hasPushSupport: boolean;
  hasWebAuthn: boolean;
  serviceWorkerActive: boolean;
}

export interface BiometricCredential {
  id: string;
  credentialId: string;
  publicKey: string;
  createdAt: number;
  lastUsed?: number;
  deviceName: string;
}

export interface AppSettings {
  biometricEnabled: boolean;
  autoLockTimeout: number; // minutes, 0 = never
  showCopyAnimation: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  backgroundScanEnabled: boolean;
  maliciousLinkDetection: boolean;
  autoScanInterval: number; // hours
  theme: "light" | "auto";
  language: "en" | "ur";
  defaultBrowser: boolean;
  hapticFeedback: boolean;
}

export interface PermissionStatus {
  notifications: "granted" | "denied" | "prompt" | "unsupported";
  camera: "granted" | "denied" | "prompt" | "unsupported";
  biometric: "available" | "unavailable" | "enrolled";
  persistentStorage: "granted" | "denied" | "prompt" | "unsupported";
  backgroundSync: "granted" | "denied" | "unsupported";
  periodicSync: "granted" | "denied" | "unsupported";
}

export interface SirenAlert {
  id: string;
  url: string;
  reason: string;
  severity: "warning" | "danger";
  timestamp: number;
  blocked: boolean;
}

export interface OTPSession {
  accountId: string;
  expiresAt: number;
  verified: boolean;
  method: "totp" | "biometric" | "recovery";
}

export interface ConnectedService {
  id: string;
  name: string;
  domain: string;
  icon?: string;
  lastAuth?: number;
  accountId: string;
  category: "social" | "finance" | "work" | "email" | "shopping" | "other";
}
