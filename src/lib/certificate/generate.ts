/**
 * CampusCred — Certificate Generation Engine
 * 
 * Orchestrates the complete certificate generation pipeline:
 * 1. Data preparation (fetch student, task, submission data)
 * 2. Asset generation (QR code, avatar if needed)
 * 3. HTML template rendering
 * 4. PDF/PNG output via Puppeteer
 * 5. Thumbnail generation via Sharp
 * 6. Tamper-proof hash generation
 * 7. File storage and database update
 */

import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import sharp from 'sharp';
import { generateCertificateHtml, type CertificateData } from './template';
import { generateAndSaveAvatar } from './avatar';
import { isSupabaseStorageConfigured, uploadSupabaseObject } from '@/lib/supabase-storage';

// ─── Types ───────────────────────────────────────────────────────────

export interface GenerateCertificateInput {
  certificateId: string;
  studentName: string;
  degree: string;
  branch: string;
  college: string;
  city: string;
  state: string;
  taskTitle: string;
  skills: string[];
  level: string;
  studentId: string;
  profilePhotoUrl?: string | null;
  /** Task the certificate is for (empty for welcome certificates). Part of the tamper-proof hash. */
  taskId?: string;
  /**
   * ISO timestamp the certificate is issued at. Part of the tamper-proof hash,
   * so callers MUST persist this exact value as the record's issuedDate,
   * otherwise /api/verify can never reproduce the hash.
   */
  issuedDate?: string;
}

export interface GeneratedCertificateOutput {
  certificateId: string;
  pngPath: string;
  pdfPath: string;
  thumbnailPath: string;
  pngUrl: string;
  pdfUrl: string;
  thumbnailUrl: string;
  hash: string;
  /** ISO timestamp used for the hash — persist this as the record's issuedDate. */
  issuedDate: string;
}

/** Public base URL used in QR codes / verification links. */
export function verificationBaseUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '');
  return `${appUrl || 'https://campuscred.in'}/verify`;
}

// ─── QR Code Generation ──────────────────────────────────────────────

async function generateQrCodeDataUri(
  certificateId: string,
  verificationBaseUrl: string = 'https://campuscred.in/verify'
): Promise<string> {
  const verificationUrl = `${verificationBaseUrl}/${certificateId}`;
  
  return QRCode.toDataURL(verificationUrl, {
    width: 270,
    margin: 1,
    color: {
      dark: '#0A0F2C',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  });
}

// ─── Tamper-Proof Hash ───────────────────────────────────────────────

export function generateCertificateHash(
  certificateId: string,
  studentId: string,
  taskId: string,
  issuedDate: string,
  studentName: string
): string {
  const secret = process.env.CERT_SECRET || (process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('CERT_SECRET must be configured in production.'); })()
    : 'local-development-only-certificate-secret');
  const data = `${certificateId}-${studentId}-${taskId}-${issuedDate}-${studentName}`;
  return crypto.createHash('sha256').update(data + secret).digest('hex');
}

export function verifyCertificateHash(
  certificateId: string,
  studentId: string,
  taskId: string,
  issuedDate: string,
  studentName: string,
  hash: string
): boolean {
  const expected = generateCertificateHash(certificateId, studentId, taskId, issuedDate, studentName);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hash));
}

// ─── Profile Photo Handling ──────────────────────────────────────────

async function ensureProfilePhoto(
  studentName: string,
  studentId: string,
  profilePhotoUrl?: string | null
): Promise<string | null> {
  if (profilePhotoUrl) {
    // If it's a local path, try to read and convert to data URI
    if (profilePhotoUrl.startsWith('/uploads/')) {
      const fullPath = path.join(process.cwd(), 'public', profilePhotoUrl);
      if (fs.existsSync(fullPath)) {
        const data = fs.readFileSync(fullPath);
        const ext = path.extname(fullPath).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/webp';
        return `data:${mime};base64,${data.toString('base64')}`;
      }
    }
    if (profilePhotoUrl.startsWith('data:')) {
      return profilePhotoUrl;
    }
    // For external URLs, return as-is (Puppeteer will fetch them)
    return profilePhotoUrl;
  }

  // Generate auto-avatar
  const avatarPath = await generateAndSaveAvatar(studentName, studentId);
  // On Vercel this is already a data URL — use it directly instead of
  // (incorrectly) treating it as a filesystem path.
  if (avatarPath.startsWith('data:')) {
    return avatarPath;
  }
  const fullPath = path.join(process.cwd(), 'public', avatarPath);
  if (fs.existsSync(fullPath)) {
    const data = fs.readFileSync(fullPath);
    return `data:image/png;base64,${data.toString('base64')}`;
  }

  return null;
}

// ─── Puppeteer Rendering ─────────────────────────────────────────────

/** Details needed to draw a certificate when Puppeteer/Chromium is unavailable. */
interface FallbackCertData {
  studentName: string;
  taskTitle: string;
  level: string;
  degree: string;
  branch: string;
  qrCodeDataUri: string;
  issuedDate: string;
}

async function renderWithPuppeteer(
  html: string,
  outputDir: string,
  certificateId: string,
  fallbackData: FallbackCertData
): Promise<{ pngPath: string; pdfPath: string }> {
  // Dynamic import for Puppeteer (heavy dependency, loaded on demand)
  let puppeteer: any;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    console.warn('[Certificate] Puppeteer not available, using fallback PNG generation');
    return await renderFallback(html, outputDir, certificateId, fallbackData);
  }

  // The import can succeed while the bundled Chromium is missing (serverless
  // bundles, PUPPETEER_SKIP_DOWNLOAD, slim images). Launch failures must fall
  // back gracefully instead of failing the whole certificate workflow.
  let browser: any;
  try {
    browser = await puppeteer.default.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
    });

    const page = await browser.newPage();
    
    // Set viewport to A4 landscape at 300 DPI
    await page.setViewport({ width: 3508, height: 2480, deviceScaleFactor: 1 });
    
    // Load HTML content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const pngPath = path.join(outputDir, `${certificateId}.png`);
    const pdfPath = path.join(outputDir, `${certificateId}.pdf`);

    // Generate PNG screenshot
    await page.screenshot({
      path: pngPath,
      type: 'png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 3508, height: 2480 },
    });

    // Generate PDF
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      scale: 1,
      width: '3508px',
      height: '2480px',
    });

    return { pngPath, pdfPath };
  } catch (error) {
    console.warn('[Certificate] Puppeteer rendering failed, using fallback PNG generation:', error);
    return await renderFallback(html, outputDir, certificateId, fallbackData);
  } finally {
    await browser?.close().catch(() => {});
  }
}

/**
 * Fallback renderer when Puppeteer is not available
 * Uses html2canvas approach via a simple sharp-based image generation
 */
async function renderFallback(
  html: string,
  outputDir: string,
  certificateId: string,
  data: FallbackCertData
): Promise<{ pngPath: string; pdfPath: string }> {
  // Keep the full HTML template alongside the rendered files for debugging /
  // re-rendering with a browser later.
  const htmlPath = path.join(outputDir, `${certificateId}.html`);
  fs.writeFileSync(htmlPath, html);

  const pngPath = path.join(outputDir, `${certificateId}.png`);
  const pdfPath = path.join(outputDir, `${certificateId}.pdf`);

  // Draw a real certificate (A4 landscape @300dpi) with sharp so students
  // still get a presentable PNG/PDF when Chromium is unavailable.
  const esc = (s: string) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const issued = new Date(data.issuedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const svg = `<svg width="3508" height="2480" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#FFFDF5"/>
    <rect x="90" y="90" width="3328" height="2300" fill="none" stroke="#D4AF37" stroke-width="10"/>
    <rect x="140" y="140" width="3228" height="2200" fill="none" stroke="#0A0F2C" stroke-width="3"/>
    <text x="50%" y="430" text-anchor="middle" font-family="Georgia, serif" font-size="150" font-weight="bold" fill="#0A0F2C">Certificate of Achievement</text>
    <text x="50%" y="560" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" letter-spacing="14" fill="#B8860B">CAMPUSCRED</text>
    <text x="50%" y="760" text-anchor="middle" font-family="Arial, sans-serif" font-size="58" fill="#555555">This certificate is proudly presented to</text>
    <text x="50%" y="990" text-anchor="middle" font-family="Georgia, serif" font-size="190" font-weight="bold" fill="#0A0F2C">${esc(data.studentName)}</text>
    <text x="50%" y="1120" text-anchor="middle" font-family="Arial, sans-serif" font-size="56" fill="#555555">${esc(data.degree)}${data.branch ? ` · ${esc(data.branch)}` : ''}</text>
    <text x="50%" y="1330" text-anchor="middle" font-family="Arial, sans-serif" font-size="58" fill="#555555">for successfully completing the task</text>
    <text x="50%" y="1500" text-anchor="middle" font-family="Georgia, serif" font-size="110" font-style="italic" fill="#1E40AF">${esc(data.taskTitle)}</text>
    <text x="50%" y="1700" text-anchor="middle" font-family="Arial, sans-serif" font-size="62" fill="#0A0F2C">Level: ${esc(data.level)}</text>
    <text x="50%" y="1980" text-anchor="middle" font-family="Arial, sans-serif" font-size="52" fill="#777777">Issued on ${esc(issued)}</text>
    <image href="${data.qrCodeDataUri}" x="2928" y="1810" width="380" height="380"/>
    <text x="3118" y="2245" text-anchor="middle" font-family="Arial, sans-serif" font-size="36" fill="#777777">Scan to verify</text>
    <text x="240" y="2245" font-family="Arial, sans-serif" font-size="40" fill="#999999">Certificate ID: ${esc(certificateId)}</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(pngPath);

  // Create PDF from the PNG
  const pngBuffer = await sharp(pngPath).toBuffer();
  
  // Simple PDF generation
  try {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [3508, 2480],
    });
    pdf.addImage(pngBuffer.toString('base64'), 'PNG', 0, 0, 3508, 2480);
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    fs.writeFileSync(pdfPath, pdfBuffer);
  } catch {
    // If jsPDF fails, just copy the PNG path
    fs.writeFileSync(pdfPath, pngBuffer);
  }

  return { pngPath, pdfPath };
}

// ─── Thumbnail Generation ────────────────────────────────────────────

async function generateThumbnail(
  pngPath: string,
  outputDir: string,
  certificateId: string
): Promise<string> {
  const thumbnailPath = path.join(outputDir, `${certificateId}_thumb.webp`);
  
  await sharp(pngPath)
    .resize(800, 566, { fit: 'cover' })
    .webp({ quality: 90 })
    .toFile(thumbnailPath);
  
  return thumbnailPath;
}

// ─── Main Generation Pipeline ────────────────────────────────────────

const isVercel = process.env.VERCEL === '1';

export async function generateCertificate(
  input: GenerateCertificateInput
): Promise<GeneratedCertificateOutput> {
  // On Vercel, use /tmp for file writes (public/ is read-only)
  const outputDir = isVercel
    ? path.join('/tmp', 'certificates')
    : path.join(process.cwd(), 'public', 'certificates');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log(`[Certificate] Starting generation for ${input.certificateId}`);

  // Step 1: Generate QR code
  const qrCodeDataUri = await generateQrCodeDataUri(input.certificateId);
  console.log('[Certificate] QR code generated');

  // Step 2: Handle profile photo
  const profilePhoto = await ensureProfilePhoto(
    input.studentName,
    input.studentId,
    input.profilePhotoUrl
  );
  console.log('[Certificate] Profile photo ready');

  // Step 3: Prepare certificate data. issuedDate is part of the hash, so it
  // is fixed here and returned to the caller to persist verbatim.
  const issuedDate = input.issuedDate ?? new Date().toISOString();
  const certData: CertificateData = {
    certificateId: input.certificateId,
    studentName: input.studentName,
    degree: input.degree,
    branch: input.branch,
    college: input.college || 'N/A',
    city: input.city || '',
    state: input.state || '',
    taskTitle: input.taskTitle,
    skills: input.skills || [],
    level: input.level || 'Starter',
    issuedDate,
    profilePhotoUrl: profilePhoto,
    qrCodeDataUri,
    verificationUrl: `${verificationBaseUrl()}/${input.certificateId}`,
  };

  // Step 4: Generate HTML template
  const html = generateCertificateHtml(certData);
  console.log('[Certificate] HTML template generated');

  // Step 5: Render to PNG and PDF
  const { pngPath, pdfPath } = await renderWithPuppeteer(html, outputDir, input.certificateId, {
    studentName: input.studentName,
    taskTitle: input.taskTitle,
    level: input.level || 'Starter',
    degree: input.degree,
    branch: input.branch,
    qrCodeDataUri,
    issuedDate: certData.issuedDate,
  });
  console.log('[Certificate] PNG and PDF rendered');

  // Step 6: Generate thumbnail
  const thumbnailPath = await generateThumbnail(pngPath, outputDir, input.certificateId);
  console.log('[Certificate] Thumbnail generated');

  // Step 7: Generate tamper-proof hash (must match what /api/verify recomputes:
  // real taskId — or '' for welcome certificates — and the persisted issuedDate)
  const hash = generateCertificateHash(
    input.certificateId,
    input.studentId,
    input.taskId ?? '',
    certData.issuedDate,
    input.studentName
  );
  console.log('[Certificate] Hash generated');

  // Step 8: Persist files durably on Vercel. The function's /tmp directory is
  // discarded after each invocation, so certificate links must point to Storage.
  let pngUrl = `/certificates/${input.certificateId}.png`;
  let pdfUrl = `/certificates/${input.certificateId}.pdf`;
  let thumbnailUrl = `/certificates/${input.certificateId}_thumb.webp`;

  if (isVercel || isSupabaseStorageConfigured()) {
    const prefix = `certificates/${input.certificateId}`;
    [pngUrl, pdfUrl, thumbnailUrl] = await Promise.all([
      uploadSupabaseObject(`${prefix}.png`, fs.readFileSync(pngPath), 'image/png'),
      uploadSupabaseObject(`${prefix}.pdf`, fs.readFileSync(pdfPath), 'application/pdf'),
      uploadSupabaseObject(`${prefix}_thumb.webp`, fs.readFileSync(thumbnailPath), 'image/webp'),
    ]);
  }

  return {
    certificateId: input.certificateId,
    pngPath,
    pdfPath,
    thumbnailPath,
    pngUrl,
    pdfUrl,
    thumbnailUrl,
    hash,
    issuedDate,
  };
}

/**
 * Quick generation without Puppeteer (for development/preview)
 * Generates HTML and saves it, plus creates a simple preview image
 */
export async function generateCertificateQuick(
  input: GenerateCertificateInput
): Promise<GeneratedCertificateOutput & { htmlPath: string }> {
  const outputDir = isVercel
    ? path.join('/tmp', 'certificates')
    : path.join(process.cwd(), 'public', 'certificates');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // Generate QR code
  const qrCodeDataUri = await generateQrCodeDataUri(input.certificateId);

  // Handle profile photo
  const profilePhoto = await ensureProfilePhoto(
    input.studentName,
    input.studentId,
    input.profilePhotoUrl
  );

  // Prepare data
  const issuedDate = input.issuedDate ?? new Date().toISOString();
  const certData: CertificateData = {
    certificateId: input.certificateId,
    studentName: input.studentName,
    degree: input.degree,
    branch: input.branch,
    college: input.college || 'N/A',
    city: input.city || '',
    state: input.state || '',
    taskTitle: input.taskTitle,
    skills: input.skills || [],
    level: input.level || 'Starter',
    issuedDate,
    profilePhotoUrl: profilePhoto,
    qrCodeDataUri,
    verificationUrl: `${verificationBaseUrl()}/${input.certificateId}`,
  };

  // Generate HTML
  const html = generateCertificateHtml(certData);
  const htmlPath = path.join(outputDir, `${input.certificateId}.html`);
  fs.writeFileSync(htmlPath, html);

  // Generate hash
  const hash = generateCertificateHash(
    input.certificateId,
    input.studentId,
    input.taskId ?? '',
    issuedDate,
    input.studentName
  );

  const pngUrl = `/certificates/${input.certificateId}.html`;
  const pdfUrl = `/certificates/${input.certificateId}.html`;
  const thumbnailUrl = `/certificates/${input.certificateId}.html`;

  return {
    certificateId: input.certificateId,
    pngPath: htmlPath,
    pdfPath: htmlPath,
    thumbnailPath: htmlPath,
    pngUrl,
    pdfUrl,
    thumbnailUrl,
    hash,
    issuedDate,
    htmlPath,
  };
}
