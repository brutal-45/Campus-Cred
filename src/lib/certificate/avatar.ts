/**
 * CampusCred — Auto-Generated Student Avatar System
 *
 * Generates professional, aesthetic avatars using sharp (SVG rendering)
 * when a student has not uploaded a profile photo. Replaces the previous
 * node-canvas implementation, whose native build frequently broke installs
 * on CI and serverless platforms.
 *
 * Output: 800x800px circular PNG with gradient background,
 * geometric pattern overlay, and bold initials.
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

/** 8 gradient pairs based on student name hash */
const GRADIENT_PAIRS = [
  ['#0A0F2C', '#1E40AF'], // Navy → Royal Blue
  ['#4C1D95', '#1D4ED8'], // Deep Purple → Blue
  ['#0F766E', '#059669'], // Teal → Emerald
  ['#0A0F2C', '#7C3AED'], // Navy → Purple
  ['#3730A3', '#0891B2'], // Indigo → Cyan
  ['#9F1239', '#6D28D9'], // Rose → Purple
  ['#92400E', '#B45309'], // Amber → Orange
  ['#1E293B', '#2563EB'], // Slate → Blue
];

/** Pattern types for avatar background */
type PatternType = 'hexagon' | 'diagonal' | 'dots' | 'circles';

const PATTERNS: PatternType[] = ['hexagon', 'diagonal', 'dots', 'circles'];

/**
 * Hash a string to a number for deterministic selection
 */
function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Extract initials from a student name
 * "Rahul Sharma" → "RS"
 * "Priya" → "P"
 * "Mohammed Ali Khan" → "MA"
 */
export function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'S';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Build the geometric pattern overlay as SVG markup (drawn at 10% opacity). */
function patternSvg(pattern: PatternType, size: number): string {
  const scale = size / 800;
  const parts: string[] = [];

  switch (pattern) {
    case 'hexagon': {
      const hexSize = 30 * scale;
      const h = hexSize * Math.sqrt(3);
      for (let row = -1; row < size / h + 1; row++) {
        for (let col = -1; col < size / (hexSize * 1.5) + 1; col++) {
          const x = col * hexSize * 1.5;
          const y = row * h + (col % 2 === 0 ? 0 : h / 2);
          const points: string[] = [];
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            points.push(`${(x + hexSize * Math.cos(angle)).toFixed(1)},${(y + hexSize * Math.sin(angle)).toFixed(1)}`);
          }
          parts.push(`<polygon points="${points.join(' ')}" fill="none" stroke="#FFFFFF" stroke-width="1"/>`);
        }
      }
      break;
    }
    case 'diagonal': {
      const spacing = 20 * scale;
      for (let i = -size; i < size * 2; i += spacing) {
        parts.push(`<line x1="${i.toFixed(1)}" y1="0" x2="${(i + size).toFixed(1)}" y2="${size}" stroke="#FFFFFF" stroke-width="1"/>`);
      }
      break;
    }
    case 'dots': {
      const dotSpacing = 24 * scale;
      for (let y = 0; y < size; y += dotSpacing) {
        for (let x = 0; x < size; x += dotSpacing) {
          parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(2 * scale).toFixed(1)}" fill="#FFFFFF"/>`);
        }
      }
      break;
    }
    case 'circles': {
      for (let r = 40 * scale; r < size; r += 40 * scale) {
        parts.push(`<circle cx="${size / 2}" cy="${size / 2}" r="${r.toFixed(1)}" fill="none" stroke="#FFFFFF" stroke-width="1"/>`);
      }
      break;
    }
  }

  return `<g opacity="0.10">${parts.join('')}</g>`;
}

/**
 * Generate a professional avatar for a student
 * @param name - Student's full name
 * @param size - Output size in pixels (default 800)
 * @returns Buffer containing PNG image data
 */
export async function generateAvatar(name: string, size: number = 800): Promise<Buffer> {
  const hash = hashName(name || '');
  const scale = size / 800;

  const gradientPair = GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
  const pattern = PATTERNS[hash % PATTERNS.length];

  const initials = getInitials(name);
  const fontSize = (initials.length === 1 ? 320 : 280) * scale;

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${gradientPair[0]}"/>
      <stop offset="1" stop-color="${gradientPair[1]}"/>
    </linearGradient>
    <clipPath id="clip"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></clipPath>
  </defs>
  <g clip-path="url(#clip)">
    <rect width="${size}" height="${size}" fill="url(#bg)"/>
    ${patternSvg(pattern, size)}
    <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central"
      font-family="Poppins, Arial, Helvetica, sans-serif" font-weight="700"
      font-size="${fontSize}" letter-spacing="${initials.length === 1 ? 0 : 8 * scale}"
      fill="#FFFFFF">${escapeXml(initials)}</text>
  </g>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 3 * scale}" fill="none" stroke="#D4AF37" stroke-width="${6 * scale}"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 8 * scale}" fill="none" stroke="#FFFFFF" stroke-width="${3 * scale}"/>
</svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * Generate avatar and save to file
 * @param name - Student's full name
 * @param studentId - Student's ID for file naming
 * @returns Public path (local disk) or base64 data URL (Vercel) of the avatar
 */
export async function generateAndSaveAvatar(name: string, studentId: string): Promise<string> {
  const buffer = await generateAvatar(name);
  const isVercel = process.env.VERCEL === '1';

  if (isVercel) {
    // On Vercel, public/ is read-only — return base64 data URL
    return `data:image/png;base64,${buffer.toString('base64')}`;
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${studentId}.png`);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/avatars/${studentId}.png`;
}
