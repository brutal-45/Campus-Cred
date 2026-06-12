import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "skillbridge-secret-key-change-in-production";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "skillbridge-refresh-secret";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

export function generateRefreshToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string; email: string; role: string };
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
