import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

function getJwtSecret(name: 'JWT_SECRET' | 'JWT_REFRESH_SECRET'): string {
  const secret = process.env[name];
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${name} must be configured in production.`);
  }
  return name === 'JWT_SECRET'
    ? 'local-development-only-access-secret'
    : 'local-development-only-refresh-secret';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload: { userId: string; email: string; role: string }): string {
  // jwtid (jti) makes every token unique. Without it, two tokens issued for
  // the same user within the same second are byte-identical (iat has 1s
  // resolution), which made Session.create fail with a unique-constraint
  // error on refreshToken when e.g. register → login happened back-to-back.
  return jwt.sign(payload, getJwtSecret('JWT_SECRET'), { expiresIn: "15m", jwtid: randomUUID() });
}

export function generateRefreshToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, getJwtSecret('JWT_REFRESH_SECRET'), { expiresIn: "7d", jwtid: randomUUID() });
}

export function verifyAccessToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, getJwtSecret('JWT_SECRET')) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, getJwtSecret('JWT_REFRESH_SECRET')) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function generateCertificateId(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${year}-${random}`;
}

export function getLevelFromPoints(points: number): string {
  if (points >= 500) return "Legend";
  if (points >= 300) return "Pro";
  if (points >= 150) return "Expert";
  if (points >= 50) return "Achiever";
  return "Starter";
}
