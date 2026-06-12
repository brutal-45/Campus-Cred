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
  const secret = process.env.CERT_SECRET || 'campuscred-cert-secret-2024';
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
  const avatarPath = generateAndSaveAvatar(studentName, studentId);
  const fullPath = path.join(process.cwd(), 'public', avatarPath);
  if (fs.existsSync(fullPath)) {
    const data = fs.readFileSync(fullPath);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  
  return null;
}

// ─── Puppeteer Rendering ─────────────────────────────────────────────

async function renderWithPuppeteer(
  html: string,
  outputDir: string,
  certificateId: string
): Promise<{ pngPath: string; pdfPath: string }> {
  // Dynamic import for Puppeteer (heavy dependency, loaded on demand)
  let puppeteer: any;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    // Fallback: use simpler approach without Puppeteer
    console.warn('[Certificate] Puppeteer not available, using fallback PNG generation');
    return await renderFallback(html, outputDir, certificateId);
  }

  const browser = await puppeteer.default.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  });

  try {
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
  } finally {
    await browser.close();
  }
}

/**
 * Fallback renderer when Puppeteer is not available
 * Uses html2canvas approach via a simple sharp-based image generation
 */
async function renderFallback(
  html: string,
  outputDir: string,
  certificateId: string
): Promise<{ pngPath: string; pdfPath: string }> {
  // Save the HTML for now - in production, this would use a cloud rendering service
  const htmlPath = path.join(outputDir, `${certificateId}.html`);
  fs.writeFileSync(htmlPath, html);

  // Create a placeholder PNG using sharp
  const pngPath = path.join(outputDir, `${certificateId}.png`);
  const pdfPath = path.join(outputDir, `${certificateId}.pdf`);

  // Generate a high-quality certificate image using Sharp
  // We create the certificate as a data URI in the HTML and can extract it
  // For now, save the HTML and create a minimal PNG placeholder
  const svgPlaceholder = `<svg width="3508" height="2480" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#FFF8E7"/>
    <text x="50%" y="50%" text-anchor="middle" font-size="48" fill="#0A0F2C">Certificate: ${certificateId}</text>
    <text x="50%" y="55%" text-anchor="middle" font-size="24" fill="#666">HTML template saved - requires Puppeteer for full rendering</text>
  </svg>`;

  await sharp(Buffer.from(svgPlaceholder))
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

  // Step 3: Prepare certificate data
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
    issuedDate: new Date().toISOString(),
    profilePhotoUrl: profilePhoto,
    qrCodeDataUri,
    verificationUrl: `https://campuscred.in/verify/${input.certificateId}`,
  };

  // Step 4: Generate HTML template
  const html = generateCertificateHtml(certData);
  console.log('[Certificate] HTML template generated');

  // Step 5: Render to PNG and PDF
  const { pngPath, pdfPath } = await renderWithPuppeteer(html, outputDir, input.certificateId);
  console.log('[Certificate] PNG and PDF rendered');

  // Step 6: Generate thumbnail
  const thumbnailPath = await generateThumbnail(pngPath, outputDir, input.certificateId);
  console.log('[Certificate] Thumbnail generated');

  // Step 7: Generate tamper-proof hash
  const hash = generateCertificateHash(
    input.certificateId,
    input.studentId,
    '', // taskId not needed in hash for now
    certData.issuedDate,
    input.studentName
  );
  console.log('[Certificate] Hash generated');

  // Step 8: Build URLs
  const pngUrl = `/certificates/${input.certificateId}.png`;
  const pdfUrl = `/certificates/${input.certificateId}.pdf`;
  const thumbnailUrl = `/certificates/${input.certificateId}_thumb.webp`;

  return {
    certificateId: input.certificateId,
    pngPath,
    pdfPath,
    thumbnailPath,
    pngUrl,
    pdfUrl,
    thumbnailUrl,
    hash,
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
    issuedDate: new Date().toISOString(),
    profilePhotoUrl: profilePhoto,
    qrCodeDataUri,
    verificationUrl: `https://campuscred.in/verify/${input.certificateId}`,
  };

  // Generate HTML
  const html = generateCertificateHtml(certData);
  const htmlPath = path.join(outputDir, `${input.certificateId}.html`);
  fs.writeFileSync(htmlPath, html);

  // Generate hash
  const hash = generateCertificateHash(
    input.certificateId,
    input.studentId,
    '',
    certData.issuedDate,
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
    htmlPath,
  };
}
