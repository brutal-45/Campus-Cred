/**
 * CampusCred — Auto-Generated Student Avatar System
 * 
 * Generates professional, aesthetic avatars using node-canvas
 * when a student has not uploaded a profile photo.
 * 
 * Output: 800x800px circular PNG with gradient background,
 * geometric pattern overlay, and bold initials.
 */

import { createCanvas, registerFont, GlobalFonts } from 'canvas';
import path from 'path';
import fs from 'fs';

// Register Poppins Bold for avatar generation
const FONT_DIR = path.join(__dirname, 'fonts');
const POPPINS_BOLD = path.join(FONT_DIR, 'Poppins-Bold.ttf');

if (fs.existsSync(POPPINS_BOLD)) {
  registerFont(POPPINS_BOLD, { family: 'PoppinsAvatar', weight: 'bold' });
}

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
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Draw a geometric pattern overlay on the canvas
 */
function drawPattern(
  ctx: ReturnType<typeof createCanvas>['getContext'] extends (...args: any) => infer R ? R : never,
  pattern: PatternType,
  size: number
) {
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.strokeStyle = '#FFFFFF';
  ctx.fillStyle = '#FFFFFF';
  ctx.lineWidth = 1;

  switch (pattern) {
    case 'hexagon': {
      const hexSize = 30;
      const h = hexSize * Math.sqrt(3);
      for (let row = -1; row < size / h + 1; row++) {
        for (let col = -1; col < size / (hexSize * 1.5) + 1; col++) {
          const x = col * hexSize * 1.5;
          const y = row * h + (col % 2 === 0 ? 0 : h / 2);
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = x + hexSize * Math.cos(angle);
            const py = y + hexSize * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
    }
    case 'diagonal': {
      const spacing = 20;
      for (let i = -size; i < size * 2; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + size, size);
        ctx.stroke();
      }
      break;
    }
    case 'dots': {
      const dotSpacing = 24;
      for (let y = 0; y < size; y += dotSpacing) {
        for (let x = 0; x < size; x += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case 'circles': {
      const cx = size / 2;
      const cy = size / 2;
      for (let r = 40; r < size; r += 40) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
  }
  ctx.restore();
}

/**
 * Generate a professional avatar for a student
 * @param name - Student's full name
 * @param size - Output size in pixels (default 800)
 * @returns Buffer containing PNG image data
 */
export function generateAvatar(name: string, size: number = 800): Buffer {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const hash = hashName(name);

  // Select gradient pair and pattern based on hash
  const gradientPair = GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
  const pattern = PATTERNS[hash % PATTERNS.length];

  // --- LAYER 1: Gradient background (135° diagonal) ---
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, gradientPair[0]);
  gradient.addColorStop(1, gradientPair[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // --- LAYER 2: Geometric pattern overlay ---
  drawPattern(ctx, pattern, size);

  // --- LAYER 3: Circular clip ---
  // (We'll draw initials first, then clip the whole thing)

  // --- LAYER 4: Initials ---
  const initials = getInitials(name);
  const isSingle = initials.length === 1;
  const fontSize = isSingle ? 320 : 280;

  // Use Poppins Bold if registered, fallback to sans-serif
  let fontFamily = 'sans-serif';
  try {
    if (GlobalFonts && typeof GlobalFonts.get === 'function' && GlobalFonts.get('PoppinsAvatar')) {
      fontFamily = 'PoppinsAvatar';
    }
  } catch {
    // GlobalFonts not available, use fallback
  }

  ctx.save();
  ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#FFFFFF';

  // Text shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;

  // Letter spacing for 2 initials
  if (!isSingle) {
    ctx.letterSpacing = '8px';
  }

  ctx.fillText(initials, size / 2, size / 2);
  ctx.restore();

  // --- LAYER 5: Clip to circle ---
  // We need to create a new canvas for the circular result
  const resultCanvas = createCanvas(size, size);
  const resultCtx = resultCanvas.getContext('2d');

  // Clip to circle
  resultCtx.beginPath();
  resultCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  resultCtx.closePath();
  resultCtx.clip();

  // Draw the avatar content into the clipped context
  resultCtx.drawImage(canvas as unknown as CanvasImageSource, 0, 0);

  // --- LAYER 6: Gold border ring ---
  resultCtx.save();
  // Outer gold ring
  resultCtx.beginPath();
  resultCtx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2);
  resultCtx.strokeStyle = '#D4AF37';
  resultCtx.lineWidth = 6;
  resultCtx.stroke();

  // Inner white ring
  resultCtx.beginPath();
  resultCtx.arc(size / 2, size / 2, size / 2 - 8, 0, Math.PI * 2);
  resultCtx.strokeStyle = '#FFFFFF';
  resultCtx.lineWidth = 3;
  resultCtx.stroke();
  resultCtx.restore();

  return resultCanvas.toBuffer('image/png');
}

/**
 * Generate avatar and save to file
 * @param name - Student's full name
 * @param studentId - Student's ID for file naming
 * @returns File path of the saved avatar
 */
export function generateAndSaveAvatar(name: string, studentId: string): string {
  const buffer = generateAvatar(name);
  const isVercel = process.env.VERCEL === '1';

  if (isVercel) {
    // On Vercel, public/ is read-only — return base64 data URL
    const base64 = buffer.toString('base64');
    return `data:image/png;base64,${base64}`;
  }

  const dir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${studentId}.png`);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/avatars/${studentId}.png`;
}
