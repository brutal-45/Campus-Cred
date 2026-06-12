/**
 * CampusCred Security Module
 * 
 * Features:
 * 1. Rate limiting middleware (per-route and per-IP)
 * 2. Brute force protection (lockout after 5 failed login attempts for 15 min)
 * 3. Device fingerprinting on login
 * 4. Fraud detection logging
 * 5. Suspicious login alert helpers
 */

import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

// ─── RATE LIMITING ───

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  windowMs: number;     // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,       // 1 minute
  maxRequests: 60,            // 60 requests per minute
};

const ROUTE_RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/auth/login': { windowMs: 15 * 60 * 1000, maxRequests: 10 },          // 10 per 15 min
  '/api/auth/register': { windowMs: 60 * 60 * 1000, maxRequests: 5 },       // 5 per hour
  '/api/auth/forgot-password': { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour
  '/api/auth/send-otp': { windowMs: 5 * 60 * 1000, maxRequests: 5 },        // 5 per 5 min
  '/api/auth/send-email-otp': { windowMs: 5 * 60 * 1000, maxRequests: 5 },  // 5 per 5 min
  '/api/admin': { windowMs: 60 * 1000, maxRequests: 100 },                   // 100 per min
  '/api/student/tasks': { windowMs: 60 * 1000, maxRequests: 30 },            // 30 per min
};

/**
 * Check if a request is rate-limited.
 * Returns { limited: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  request: NextRequest,
  route?: string
): { limited: boolean; remaining: number; resetAt: number } {
  const ip = getClientIP(request);
  const routeKey = route || new URL(request.url).pathname;
  
  // Find the matching config (most specific match first)
  let config = DEFAULT_RATE_LIMIT;
  for (const [pattern, cfg] of Object.entries(ROUTE_RATE_LIMITS)) {
    if (routeKey.startsWith(pattern)) {
      config = cfg;
      break;
    }
  }

  const key = `${ip}:${routeKey}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { limited: false, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { limited: true, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { limited: false, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

// Cleanup expired entries every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }, 10 * 60 * 1000);
}

// ─── BRUTE FORCE PROTECTION ───

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface LoginAttempt {
  count: number;
  lockedUntil: number | null;
}

const loginAttemptStore = new Map<string, LoginAttempt>();

/**
 * Record a failed login attempt. Returns true if the account is now locked.
 */
export function recordFailedLogin(email: string): { locked: boolean; attemptsLeft: number; lockedUntil: number | null } {
  const key = email.toLowerCase();
  const entry = loginAttemptStore.get(key) || { count: 0, lockedUntil: null };
  
  // If currently locked, return lock status
  if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
    return { locked: true, attemptsLeft: 0, lockedUntil: entry.lockedUntil };
  }

  // If lockout expired, reset
  if (entry.lockedUntil && Date.now() >= entry.lockedUntil) {
    entry.count = 0;
    entry.lockedUntil = null;
  }

  entry.count++;
  
  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    loginAttemptStore.set(key, entry);
    return { locked: true, attemptsLeft: 0, lockedUntil: entry.lockedUntil };
  }

  loginAttemptStore.set(key, entry);
  return { locked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS - entry.count, lockedUntil: null };
}

/**
 * Reset login attempts after successful login.
 */
export function resetLoginAttempts(email: string): void {
  loginAttemptStore.delete(email.toLowerCase());
}

/**
 * Check if an account is currently locked.
 */
export function isAccountLocked(email: string): { locked: boolean; lockedUntil: number | null } {
  const key = email.toLowerCase();
  const entry = loginAttemptStore.get(key);
  
  if (!entry || !entry.lockedUntil) {
    return { locked: false, lockedUntil: null };
  }

  if (Date.now() >= entry.lockedUntil) {
    // Lockout expired, clean up
    loginAttemptStore.delete(key);
    return { locked: false, lockedUntil: null };
  }

  return { locked: true, lockedUntil: entry.lockedUntil };
}

// ─── DEVICE FINGERPRINTING ───

/**
 * Generate a device fingerprint from request headers.
 * Combines user agent, accept-language, and other headers to create a unique hash.
 */
export function generateDeviceFingerprint(request: NextRequest): string {
  const components = [
    request.headers.get('user-agent') || '',
    request.headers.get('accept-language') || '',
    request.headers.get('accept-encoding') || '',
    request.headers.get('sec-ch-ua') || '',
    request.headers.get('sec-ch-ua-platform') || '',
    request.headers.get('sec-ch-ua-mobile') || '',
  ];

  const raw = components.join('|');
  
  // Simple hash function (for production, use crypto.createHash)
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `fp_${Math.abs(hash).toString(36)}_${raw.length}`;
}

/**
 * Get client IP from request headers.
 */
export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

/**
 * Parse device info from user agent string.
 */
export function parseDeviceInfo(userAgent: string): {
  browser: string;
  os: string;
  device: string;
} {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  // Browser detection
  if (userAgent.includes('Firefox/')) browser = 'Firefox';
  else if (userAgent.includes('Edg/')) browser = 'Edge';
  else if (userAgent.includes('Chrome/')) browser = 'Chrome';
  else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) browser = 'Safari';

  // OS detection
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS X')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) { os = 'Android'; device = 'Mobile'; }
  else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) { os = 'iOS'; device = userAgent.includes('iPad') ? 'Tablet' : 'Mobile'; }

  return { browser, os, device };
}

/**
 * Check if a device fingerprint is known for a user.
 * Returns the known fingerprint or null.
 */
export async function checkKnownDevice(userId: string, fingerprint: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { deviceFingerprint: true },
  });
  
  if (!user?.deviceFingerprint) return false;
  return user.deviceFingerprint === fingerprint;
}

/**
 * Update the known device fingerprint for a user.
 */
export async function updateDeviceFingerprint(userId: string, fingerprint: string): Promise<void> {
  await db.user.update({
    where: { id: userId },
    data: { deviceFingerprint: fingerprint },
  });
}

// ─── FRAUD DETECTION LOGGING ───

export type FraudType = 'suspicious_login' | 'multiple_accounts' | 'plagiarism' | 'abuse' | 'certificate_tampering' | 'spam_submission' | 'fake_profile';
export type FraudSeverity = 'low' | 'medium' | 'high' | 'critical';

interface FraudLogEntry {
  userId?: string;
  type: FraudType;
  severity: FraudSeverity;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Log a fraud event to the database.
 */
export async function logFraudEvent(entry: FraudLogEntry): Promise<void> {
  try {
    await db.fraudLog.create({
      data: {
        userId: entry.userId || null,
        type: entry.type,
        severity: entry.severity,
        description: entry.description,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        ipAddress: entry.ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Failed to log fraud event:', error);
  }
}

/**
 * Get unresolved fraud events with optional filters.
 */
export async function getUnresolvedFraudEvents(filters?: {
  severity?: FraudSeverity;
  type?: FraudType;
  limit?: number;
}): Promise<any[]> {
  const where: any = { resolved: false };
  if (filters?.severity) where.severity = filters.severity;
  if (filters?.type) where.type = filters.type;

  return db.fraudLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 50,
  });
}

/**
 * Resolve a fraud event.
 */
export async function resolveFraudEvent(id: string, resolvedBy: string): Promise<void> {
  await db.fraudLog.update({
    where: { id },
    data: {
      resolved: true,
      resolvedBy,
      resolvedAt: new Date(),
    },
  });
}

// ─── SUSPICIOUS LOGIN ALERTS ───

interface SuspiciousLoginContext {
  userId: string;
  email: string;
  ipAddress: string;
  fingerprint: string;
  deviceInfo: string;
  userAgent: string;
}

/**
 * Analyze a login attempt for suspicious activity.
 * Returns a list of detected anomalies.
 */
export async function detectSuspiciousLogin(context: SuspiciousLoginContext): Promise<string[]> {
  const anomalies: string[] = [];

  // Check 1: Unknown device fingerprint
  const isKnownDevice = await checkKnownDevice(context.userId, context.fingerprint);
  if (!isKnownDevice) {
    anomalies.push('unknown_device');
  }

  // Check 2: Account was recently locked
  const lockStatus = isAccountLocked(context.email);
  if (lockStatus.lockedUntil && Date.now() < lockStatus.lockedUntil) {
    anomalies.push('account_recently_locked');
  }

  // Check 3: Multiple logins from different IPs recently
  const recentSessions = await db.session.findMany({
    where: {
      userId: context.userId,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    select: { ipAddress: true, fingerprint: true },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  const uniqueIPs = new Set(recentSessions.map(s => s.ipAddress).filter(Boolean));
  if (uniqueIPs.size > 3) {
    anomalies.push('multiple_ips');
  }

  const uniqueFingerprints = new Set(recentSessions.map(s => s.fingerprint).filter(Boolean));
  if (uniqueFingerprints.size > 3) {
    anomalies.push('multiple_devices');
  }

  // Check 4: Login from a different country (would need GeoIP in production)
  // For now, check if IP changed from last session
  const lastSession = await db.session.findFirst({
    where: { userId: context.userId },
    orderBy: { createdAt: 'desc' },
    select: { ipAddress: true },
  });

  if (lastSession?.ipAddress && lastSession.ipAddress !== context.ipAddress) {
    anomalies.push('ip_changed');
  }

  return anomalies;
}

/**
 * Handle a suspicious login detection — log fraud event and create notification.
 */
export async function handleSuspiciousLogin(
  context: SuspiciousLoginContext,
  anomalies: string[]
): Promise<void> {
  const severityMap: Record<string, FraudSeverity> = {
    unknown_device: 'low',
    ip_changed: 'medium',
    multiple_ips: 'high',
    multiple_devices: 'high',
    account_recently_locked: 'critical',
  };

  // Determine overall severity (highest anomaly wins)
  const severities = anomalies.map(a => severityMap[a] || 'medium');
  const severityOrder: FraudSeverity[] = ['low', 'medium', 'high', 'critical'];
  const maxSeverity = severities.reduce<FraudSeverity>((max, s) => {
    return severityOrder.indexOf(s) > severityOrder.indexOf(max) ? s : max;
  }, 'low');

  // Log fraud event
  await logFraudEvent({
    userId: context.userId,
    type: 'suspicious_login',
    severity: maxSeverity,
    description: `Suspicious login detected: ${anomalies.join(', ')}`,
    metadata: {
      anomalies,
      ipAddress: context.ipAddress,
      fingerprint: context.fingerprint,
      deviceInfo: context.deviceInfo,
    },
    ipAddress: context.ipAddress,
  });

  // Create notification for the user
  await db.notification.create({
    data: {
      userId: context.userId,
      title: 'Suspicious Login Detected',
      message: `We detected a login from a new device or location. If this wasn't you, please secure your account immediately.`,
      type: 'security',
    },
  });

  // If critical, also lock the account temporarily
  if (maxSeverity === 'critical') {
    const lockKey = context.email.toLowerCase();
    loginAttemptStore.set(lockKey, {
      count: MAX_LOGIN_ATTEMPTS,
      lockedUntil: Date.now() + LOCKOUT_DURATION_MS,
    });
  }
}

/**
 * Get rate limit headers for HTTP response.
 */
export function getRateLimitHeaders(remaining: number, resetAt: number): Record<string, string> {
  return {
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetAt).toISOString(),
  };
}
