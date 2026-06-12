/**
 * CampusCred — Certificate HTML Template Generator
 * 
 * Generates a complete, self-contained HTML template for the certificate.
 * All fonts and images are embedded as base64 data URIs.
 * The template renders at exactly 3508px × 2480px (A4 Landscape, 300 DPI).
 * 
 * Built layer by layer as specified in the design system.
 */

import fs from 'fs';
import path from 'path';
import {
  campusCredLogoDataUri,
  guillocheDataUri,
  cornerOrnamentDataUri,
  dividerDataUri,
  bottomDividerDataUri,
  digitalSealDataUri,
  watermarkDataUri,
  levelRibbonDataUri,
} from './svg-assets';
import { getInitials } from './avatar';

// ─── Types ───────────────────────────────────────────────────────────

export interface CertificateData {
  certificateId: string;
  studentName: string;
  degree: string;
  branch: string;
  college: string;
  city: string;
  state: string;
  taskTitle: string;
  skills: string[];
  level: string; // Starter, Achiever, Expert, Elite, Legend
  issuedDate: string; // formatted date
  profilePhotoUrl?: string | null;
  qrCodeDataUri: string;
  verificationUrl: string;
}

// ─── Font Loading ────────────────────────────────────────────────────

const FONT_DIR = path.join(__dirname, 'fonts');

function loadFontBase64(filename: string): string {
  const filePath = path.join(FONT_DIR, filename);
  const b64File = filePath.replace('.ttf', '.b64.txt');
  
  // Try pre-generated base64 file first
  if (fs.existsSync(b64File)) {
    return fs.readFileSync(b64File, 'utf-8').trim();
  }
  
  // Fallback: read TTF and convert
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    const b64 = data.toString('base64');
    // Cache it
    fs.writeFileSync(b64File, b64);
    return b64;
  }
  
  return '';
}

interface FontFace {
  family: string;
  weight: string;
  style: string;
  base64: string;
}

function getFontFaces(): FontFace[] {
  return [
    { family: 'PlayfairDisplay', weight: '700', style: 'normal', base64: loadFontBase64('PlayfairDisplay-Bold.ttf') },
    { family: 'CormorantGaramond', weight: '400', style: 'normal', base64: loadFontBase64('CormorantGaramond-Regular.ttf') },
    { family: 'CormorantGaramond', weight: '600', style: 'normal', base64: loadFontBase64('CormorantGaramond-SemiBold.ttf') },
    { family: 'GreatVibes', weight: '400', style: 'normal', base64: loadFontBase64('GreatVibes-Regular.ttf') },
    { family: 'Montserrat', weight: '600', style: 'normal', base64: loadFontBase64('Montserrat-SemiBold.ttf') },
    { family: 'Poppins', weight: '400', style: 'normal', base64: loadFontBase64('Poppins-Regular.ttf') },
    { family: 'Poppins', weight: '500', style: 'normal', base64: loadFontBase64('Poppins-Medium.ttf') },
    { family: 'Poppins', weight: '600', style: 'normal', base64: loadFontBase64('Poppins-SemiBold.ttf') },
    { family: 'Poppins', weight: '700', style: 'normal', base64: loadFontBase64('Poppins-Bold.ttf') },
  ].filter(f => f.base64.length > 0);
}

function generateFontCSS(fonts: FontFace[]): string {
  return fonts.map(f => `
    @font-face {
      font-family: '${f.family}';
      font-weight: ${f.weight};
      font-style: ${f.style};
      src: url(data:font/truetype;base64,${f.base64}) format('truetype');
      font-display: swap;
    }
  `).join('\n');
}

// ─── Level Configurations ────────────────────────────────────────────

interface LevelConfig {
  borderSet: string; // CSS for border layers
  cornerSize: number;
  cornerDetail: string;
  backgroundEffect: string;
  sealAccent: string;
  ribbon: string | null;
  namePrefix: string;
}

function getLevelConfig(level: string): LevelConfig {
  switch (level) {
    case 'Legend':
      return {
        borderSet: 'legend',
        cornerSize: 140,
        cornerDetail: 'maximum',
        backgroundEffect: 'holographic',
        sealAccent: 'gold-shimmer',
        ribbon: 'Legend',
        namePrefix: '👑 ',
      };
    case 'Elite':
      return {
        borderSet: 'elite',
        cornerSize: 130,
        cornerDetail: 'elaborate',
        backgroundEffect: 'purple-gradient',
        sealAccent: 'purple-gold',
        ribbon: 'Elite',
        namePrefix: '',
      };
    case 'Expert':
      return {
        borderSet: 'expert',
        cornerSize: 125,
        cornerDetail: 'detailed',
        backgroundEffect: 'amber-hint',
        sealAccent: 'orange-gold',
        ribbon: null,
        namePrefix: '',
      };
    case 'Achiever':
      return {
        borderSet: 'achiever',
        cornerSize: 120,
        cornerDetail: 'enhanced',
        backgroundEffect: 'blue-shimmer',
        sealAccent: 'blue-accented',
        ribbon: null,
        namePrefix: '',
      };
    default: // Starter
      return {
        borderSet: 'starter',
        cornerSize: 120,
        cornerDetail: 'standard',
        backgroundEffect: 'none',
        sealAccent: 'silver-tinted',
        ribbon: null,
        namePrefix: '',
      };
  }
}

// ─── Dynamic Name Size ───────────────────────────────────────────────

function getNameFontSize(name: string): number {
  const len = name.length;
  if (len <= 15) return 52;
  if (len <= 20) return 44;
  if (len <= 25) return 38;
  return 32;
}

// ─── Profile Photo Handling ──────────────────────────────────────────

function getPhotoStyle(data: CertificateData): string {
  if (data.profilePhotoUrl) {
    // Use actual photo (must be base64 data URI or absolute URL)
    if (data.profilePhotoUrl.startsWith('data:')) {
      return `background-image: url('${data.profilePhotoUrl}'); background-size: cover; background-position: center;`;
    }
    return `background-image: url('${data.profilePhotoUrl}'); background-size: cover; background-position: center;`;
  }
  // Auto-generated avatar fallback - use initials
  const initials = getInitials(data.studentName);
  const hash = [...data.studentName].reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) & 0x7FFFFFFF, 0);
  const gradients = [
    ['#0A0F2C', '#1E40AF'], ['#4C1D95', '#1D4ED8'],
    ['#0F766E', '#059669'], ['#0A0F2C', '#7C3AED'],
    ['#3730A3', '#0891B2'], ['#9F1239', '#6D28D9'],
    ['#92400E', '#B45309'], ['#1E293B', '#2563EB'],
  ];
  const [g1, g2] = gradients[hash % gradients.length];
  return `background: linear-gradient(135deg, ${g1}, ${g2}); display: flex; align-items: center; justify-content: center; color: white; font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 48px;`;
}

function getPhotoInnerHtml(data: CertificateData): string {
  if (!data.profilePhotoUrl) {
    const initials = getInitials(data.studentName);
    return initials;
  }
  return '';
}

// ─── Skills Tags HTML ────────────────────────────────────────────────

function skillsHtml(skills: string[]): string {
  if (!skills || skills.length === 0) return '';
  const maxSkills = skills.slice(0, 5);
  return maxSkills.map(s => `
    <span style="
      display: inline-block;
      background: rgba(212,175,55,0.12);
      border: 1px solid rgba(212,175,55,0.4);
      border-radius: 20px;
      padding: 4px 14px;
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
      font-size: 11px;
      color: #0A0F2C;
      margin: 3px 4px;
    ">${s}</span>
  `).join('');
}

// ─── Level Badge ─────────────────────────────────────────────────────

function levelBadgeHtml(level: string): string {
  const config: Record<string, { color: string; bg: string; icon: string }> = {
    Starter:  { color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: '🌱' },
    Achiever: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: '⚡' },
    Expert:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: '🔥' },
    Elite:    { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', icon: '💎' },
    Legend:   { color: '#D4AF37', bg: 'rgba(212,175,55,0.1)', icon: '👑' },
  };
  const c = config[level] || config.Starter;
  return `
    <div style="
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid ${c.color};
      background: ${c.bg};
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
      font-size: 10px;
      color: ${c.color};
    ">
      <span style="font-size: 12px;">${c.icon}</span>
      ${level}
    </div>
  `;
}

// ─── Main Template Generator ─────────────────────────────────────────

export function generateCertificateHtml(data: CertificateData): string {
  const W = 3508;
  const H = 2480;
  const levelConfig = getLevelConfig(data.level);
  const nameSize = getNameFontSize(data.studentName);
  const fonts = getFontFaces();
  const fontCSS = generateFontCSS(fonts);

  // SVG data URIs
  const logoUri = campusCredLogoDataUri(180, '#D4AF37');
  const guillocheUri = guillocheDataUri(W, H);
  const watermarkUri = watermarkDataUri(W, H);
  const cornerTL = cornerOrnamentDataUri('tl', levelConfig.cornerSize);
  const cornerTR = cornerOrnamentDataUri('tr', levelConfig.cornerSize);
  const cornerBL = cornerOrnamentDataUri('bl', levelConfig.cornerSize);
  const cornerBR = cornerOrnamentDataUri('br', levelConfig.cornerSize);
  const topDividerUri = dividerDataUri(300);
  const bottomDividerUri = bottomDividerDataUri(300);
  const sealUri = digitalSealDataUri(80);
  const ribbonUri = levelConfig.ribbon ? levelRibbonDataUri(levelConfig.ribbon as 'Elite' | 'Legend') : '';

  // Level-specific border styles
  const borderStyles = getBorderCSS(levelConfig.borderSet);
  const backgroundEffect = getBackgroundEffect(levelConfig.backgroundEffect);

  // Date formatting
  const issueDate = new Date(data.issuedDate);
  const formattedDate = issueDate.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  ${fontCSS}
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    width: ${W}px;
    height: ${H}px;
    margin: 0;
    padding: 0;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .certificate {
    position: relative;
    width: ${W}px;
    height: ${H}px;
    overflow: hidden;
  }
  
  /* LAYER 1: Base background */
  .layer-background {
    position: absolute;
    inset: 0;
    background: #FFF8E7;
    background: radial-gradient(ellipse at center, #FFFFFF 0%, #FFF0D0 100%);
  }
  
  /* LAYER 2: Security pattern */
  .layer-guilloche {
    position: absolute;
    inset: 0;
    background-image: url('${guillocheUri}');
    background-size: ${W}px ${H}px;
    opacity: 1;
    mask-image: linear-gradient(to bottom, transparent 5%, black 8%, black 12%, transparent 15%, transparent 85%, black 88%, black 95%, transparent 98%);
    -webkit-mask-image: linear-gradient(to right, transparent 2%, black 5%, black 10%, transparent 13%, transparent 87%, black 90%, black 95%, transparent 98%);
  }
  
  /* LAYER 3: Watermark */
  .layer-watermark {
    position: absolute;
    inset: 0;
    background-image: url('${watermarkUri}');
    background-size: ${W}px ${H}px;
  }
  
  ${backgroundEffect}
  
  /* LAYER 4: Border frame */
  .layer-borders {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  
  ${borderStyles}
  
  /* LAYER 5: Corner ornaments */
  .corner {
    position: absolute;
    z-index: 10;
    filter: drop-shadow(2px 2px 8px rgba(212,175,55,0.3));
  }
  .corner-tl { top: 30px; left: 30px; }
  .corner-tr { top: 30px; right: 30px; }
  .corner-bl { bottom: 30px; left: 30px; }
  .corner-br { bottom: 30px; right: 30px; }
  
  /* LAYER 6: Header section */
  .header {
    position: absolute;
    top: 56px;
    left: 56px;
    right: 56px;
    height: 18%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .header-left {
    display: flex;
    align-items: center;
  }
  
  .header-center {
    text-align: center;
    flex: 1;
  }
  
  .header-right {
    text-align: right;
    min-width: 200px;
  }
  
  .cert-title {
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
    font-size: 13px;
    letter-spacing: 6px;
    color: #D4AF37;
    text-transform: uppercase;
  }
  
  .divider-img {
    display: block;
    margin: 8px auto;
  }
  
  .issued-by {
    font-family: 'CormorantGaramond', sans-serif;
    font-weight: 400;
    font-size: 11px;
    color: rgba(10,15,44,0.7);
    letter-spacing: 3px;
  }
  
  .cert-id-label {
    font-family: 'Poppins', sans-serif;
    font-weight: 400;
    font-size: 8px;
    letter-spacing: 2px;
    color: #D4AF37;
    text-transform: uppercase;
  }
  
  .cert-id-value {
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 11px;
    color: #0A0F2C;
  }
  
  .cert-date {
    font-family: 'CormorantGaramond', sans-serif;
    font-size: 10px;
    color: rgba(10,15,44,0.7);
    margin-top: 4px;
  }
  
  /* LAYER 7: Gold divider after header */
  .gold-divider {
    position: absolute;
    top: calc(18% + 56px);
    left: 56px;
    right: 56px;
    text-align: center;
  }
  
  /* LAYER 8: Main body */
  .body {
    position: absolute;
    top: calc(18% + 80px);
    left: 56px;
    right: 56px;
    height: 60%;
    display: flex;
    gap: 40px;
  }
  
  .body-left {
    flex: 7;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
  }
  
  .body-right {
    flex: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 30px;
    gap: 20px;
  }
  
  .intro-text {
    font-family: 'CormorantGaramond', sans-serif;
    font-weight: 400;
    font-size: 16px;
    color: rgba(10,15,44,0.8);
    letter-spacing: 1px;
    margin-top: 30px;
  }
  
  .student-name {
    font-family: 'PlayfairDisplay', sans-serif;
    font-weight: 700;
    font-size: ${nameSize}px;
    color: #0A0F2C;
    text-shadow: 1px 2px 0px rgba(212,175,55,0.4);
    margin-top: 16px;
    line-height: 1.2;
  }
  
  .name-underline {
    width: 100%;
    max-width: 600px;
    height: 2px;
    background: linear-gradient(to right, transparent, #D4AF37, transparent);
    margin-top: 8px;
  }
  
  .academic-details {
    margin-top: 12px;
  }
  
  .degree-text {
    font-family: 'CormorantGaramond', sans-serif;
    font-weight: 400;
    font-size: 15px;
    color: rgba(10,15,44,0.75);
    font-style: italic;
  }
  
  .college-text {
    font-family: 'CormorantGaramond', sans-serif;
    font-weight: 600;
    font-size: 14px;
    color: rgba(10,15,44,0.85);
    margin-top: 6px;
  }
  
  .achievement-text {
    font-family: 'CormorantGaramond', sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: rgba(10,15,44,0.7);
    margin-top: 20px;
  }
  
  .task-box {
    background: rgba(10,15,44,0.05);
    border: 1px solid #D4AF37;
    border-left: 4px solid #D4AF37;
    border-radius: 4px;
    padding: 12px 24px;
    margin-top: 10px;
    max-width: 500px;
  }
  
  .task-title {
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 18px;
    color: #3B82F6;
    letter-spacing: 0.5px;
  }
  
  .task-platform {
    font-family: 'CormorantGaramond', sans-serif;
    font-weight: 400;
    font-size: 12px;
    color: rgba(10,15,44,0.6);
    margin-top: 4px;
  }
  
  .skills-intro {
    font-family: 'CormorantGaramond', sans-serif;
    font-weight: 400;
    font-size: 13px;
    color: rgba(10,15,44,0.65);
    margin-top: 16px;
  }
  
  .skills-container {
    margin-top: 8px;
    text-align: center;
  }
  
  /* Photo frame */
  .photo-frame {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    border: 3px solid #D4AF37;
    padding: 4px;
    background: white;
    box-shadow: 0 8px 24px rgba(10,15,44,0.2), 0 0 20px rgba(212,175,55,0.3);
  }
  
  .photo-inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 2px solid rgba(10,15,44,0.2);
    overflow: hidden;
    ${getPhotoStyle(data)}
  }
  
  /* LAYER 9: Bottom divider */
  .bottom-divider {
    position: absolute;
    bottom: calc(20% + 50px);
    left: 56px;
    right: 56px;
    text-align: center;
  }
  
  /* LAYER 10: Footer section */
  .footer {
    position: absolute;
    bottom: 50px;
    left: 56px;
    right: 56px;
    height: 20%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding-top: 20px;
  }
  
  .footer-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }
  
  .footer-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  
  .footer-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  
  .qr-scan-text {
    font-family: 'Poppins', sans-serif;
    font-weight: 400;
    font-size: 8px;
    color: rgba(10,15,44,0.6);
    letter-spacing: 1px;
  }
  
  .skills-verified-title {
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
    font-size: 9px;
    letter-spacing: 3px;
    color: #D4AF37;
  }
  
  .signature-text {
    font-family: 'GreatVibes', sans-serif;
    font-weight: 400;
    font-size: 28px;
    color: #0A0F2C;
  }
  
  .signature-line {
    width: 80px;
    height: 1px;
    background: #D4AF37;
  }
  
  .signature-label {
    font-family: 'Poppins', sans-serif;
    font-weight: 400;
    font-size: 8px;
    color: rgba(10,15,44,0.6);
  }
  
  .signature-name {
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 9px;
    color: rgba(10,15,44,0.8);
  }
  
  /* Bottom bar */
  .bottom-bar {
    position: absolute;
    bottom: 20px;
    left: 56px;
    right: 56px;
    text-align: center;
    padding-top: 8px;
    border-top: 0.5px solid rgba(212,175,55,0.3);
  }
  
  .bottom-bar-text {
    font-family: 'Poppins', sans-serif;
    font-weight: 400;
    font-size: 8px;
    color: rgba(10,15,44,0.5);
    letter-spacing: 1px;
  }
  
  /* Ribbon for Elite/Legend */
  .ribbon {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 20;
  }
  
  /* Inset glow on inner border */
  .inner-glow {
    position: absolute;
    inset: 36px;
    box-shadow: inset 0 0 30px rgba(212,175,55,0.15);
    pointer-events: none;
  }
</style>
</head>
<body>
<div class="certificate">
  <!-- LAYER 1: Base Background -->
  <div class="layer-background"></div>
  
  <!-- LAYER 2: Guilloche Security Pattern -->
  <div class="layer-guilloche"></div>
  
  <!-- LAYER 3: Diagonal Watermark -->
  <div class="layer-watermark"></div>
  
  <!-- LAYER 4: Border Frame -->
  <div class="layer-borders">
    <div class="border-1"></div>
    <div class="border-2"></div>
    <div class="border-3"></div>
    <div class="border-4"></div>
    <div class="inner-glow"></div>
  </div>
  
  <!-- LAYER 5: Corner Ornaments -->
  <img class="corner corner-tl" src="${cornerTL}" width="${levelConfig.cornerSize}" height="${levelConfig.cornerSize}" />
  <img class="corner corner-tr" src="${cornerTR}" width="${levelConfig.cornerSize}" height="${levelConfig.cornerSize}" />
  <img class="corner corner-bl" src="${cornerBL}" width="${levelConfig.cornerSize}" height="${levelConfig.cornerSize}" />
  <img class="corner corner-br" src="${cornerBR}" width="${levelConfig.cornerSize}" height="${levelConfig.cornerSize}" />
  
  ${levelConfig.ribbon ? `<img class="ribbon" src="${ribbonUri}" width="120" height="120" />` : ''}
  
  <!-- LAYER 6: Header Section -->
  <div class="header">
    <!-- Left: Logo -->
    <div class="header-left">
      <img src="${logoUri}" width="180" alt="CampusCred" />
    </div>
    
    <!-- Center: Title -->
    <div class="header-center">
      <div class="cert-title">Certificate of Completion</div>
      <img class="divider-img" src="${topDividerUri}" width="300" height="24" alt="" />
      <div class="issued-by">Issued by CampusCred</div>
    </div>
    
    <!-- Right: Certificate ID -->
    <div class="header-right">
      <div class="cert-id-label">Certificate No.</div>
      <div class="cert-id-value">${data.certificateId}</div>
      <div class="cert-date">${formattedDate}</div>
    </div>
  </div>
  
  <!-- LAYER 7: Gold Divider After Header -->
  <div class="gold-divider">
    <img src="${topDividerUri}" width="300" height="24" alt="" />
  </div>
  
  <!-- LAYER 8: Main Body -->
  <div class="body">
    <!-- Left Column: Text Content (70%) -->
    <div class="body-left">
      <div class="intro-text">This is to proudly certify that</div>
      
      <div class="student-name">${levelConfig.namePrefix}${data.studentName}</div>
      <div class="name-underline"></div>
      
      <div class="academic-details">
        <div class="degree-text">pursuing ${data.degree} in ${data.branch}</div>
        <div class="college-text">from ${data.college}${data.city ? `, ${data.city}` : ''}${data.state ? `, ${data.state}` : ''}</div>
      </div>
      
      <div class="achievement-text">has successfully completed the assigned task</div>
      
      <div class="task-box">
        <div class="task-title">${data.taskTitle}</div>
        <div class="task-platform">on CampusCred platform</div>
      </div>
      
      ${data.skills.length > 0 ? `
        <div class="skills-intro">demonstrating expertise in</div>
        <div class="skills-container">${skillsHtml(data.skills)}</div>
      ` : ''}
    </div>
    
    <!-- Right Column: Visual Elements (30%) -->
    <div class="body-right">
      <!-- Student Photo -->
      <div class="photo-frame">
        <div class="photo-inner">${getPhotoInnerHtml(data)}</div>
      </div>
      
      <!-- Level Badge -->
      ${levelBadgeHtml(data.level)}
      
      <!-- Digital Seal -->
      <img src="${sealUri}" width="80" height="80" alt="Digital Seal" style="filter: drop-shadow(0 2px 8px rgba(212,175,55,0.6));" />
    </div>
  </div>
  
  <!-- LAYER 9: Bottom Divider -->
  <div class="bottom-divider">
    <img src="${bottomDividerUri}" width="300" height="30" alt="" />
  </div>
  
  <!-- LAYER 10: Footer Section -->
  <div class="footer">
    <!-- Left: QR Code -->
    <div class="footer-left">
      <img src="${data.qrCodeDataUri}" width="90" height="90" alt="QR Code" style="border-radius: 4px;" />
      <div class="qr-scan-text">Scan to Verify Authenticity</div>
    </div>
    
    <!-- Center: Skills Verified -->
    <div class="footer-center">
      <div class="skills-verified-title">Skills Verified</div>
      <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; max-width: 180px;">
        ${data.skills.slice(0, 4).map(skill => `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
            <div style="width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid #D4AF37; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 10px; color: #D4AF37;">✓</span>
            </div>
            <span style="font-family: 'Poppins', sans-serif; font-size: 7px; color: rgba(10,15,44,0.6);">${skill}</span>
          </div>
        `).join('')}
      </div>
    </div>
    
    <!-- Right: Signatures -->
    <div class="footer-right">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
        <div class="signature-text">CampusCred</div>
        <div class="signature-line"></div>
        <div class="signature-label">Authorized Signatory</div>
        <div class="signature-name">CampusCred Platform</div>
      </div>
    </div>
  </div>
  
  <!-- Final Bottom Bar -->
  <div class="bottom-bar">
    <span class="bottom-bar-text">campuscred.in &nbsp;|&nbsp; verify at campuscred.in/verify/${data.certificateId}</span>
  </div>
</div>
</body>
</html>`;
}

// ─── Border CSS per Level ────────────────────────────────────────────

function getBorderCSS(level: string): string {
  const base = `
    .border-1 { position: absolute; inset: 20px; border: 2px solid #D4AF37; pointer-events: none; }
    .border-2 { position: absolute; inset: 25px; border: 6px solid #D4AF37; pointer-events: none; }
    .border-3 { position: absolute; inset: 32px; border: 1px solid #B8960C; pointer-events: none; }
    .border-4 { position: absolute; inset: 36px; border: 1px solid #E8E8E8; pointer-events: none; }
  `;

  switch (level) {
    case 'legend':
      return `
        .border-1 { position: absolute; inset: 18px; border: 2px solid #D4AF37; pointer-events: none; }
        .border-2 { position: absolute; inset: 23px; border: 8px solid #D4AF37; pointer-events: none; }
        .border-3 { position: absolute; inset: 32px; border: 2px solid #E8E8E8; pointer-events: none; }
        .border-3b { position: absolute; inset: 36px; border: 1px solid #B8960C; pointer-events: none; }
        .border-4 { position: absolute; inset: 40px; border: 1px solid #E8E8E8; pointer-events: none; }
        .inner-glow { position: absolute; inset: 40px; box-shadow: inset 0 0 40px rgba(212,175,55,0.2); pointer-events: none; }
      `;
    case 'elite':
      return `
        .border-1 { position: absolute; inset: 18px; border: 2px solid #D4AF37; pointer-events: none; }
        .border-2 { position: absolute; inset: 23px; border: 7px solid #D4AF37; pointer-events: none; }
        .border-3 { position: absolute; inset: 31px; border: 1px solid #7C3AED; pointer-events: none; }
        .border-3b { position: absolute; inset: 34px; border: 1px solid #B8960C; pointer-events: none; }
        .border-4 { position: absolute; inset: 38px; border: 1px solid #E8E8E8; pointer-events: none; }
        .inner-glow { position: absolute; inset: 38px; box-shadow: inset 0 0 35px rgba(124,58,237,0.1); pointer-events: none; }
      `;
    case 'expert':
      return `
        .border-1 { position: absolute; inset: 18px; border: 2px solid #D4AF37; pointer-events: none; }
        .border-2 { position: absolute; inset: 23px; border: 7px solid #D4AF37; pointer-events: none; }
        .border-3 { position: absolute; inset: 31px; border: 1px solid #B8960C; pointer-events: none; }
        .border-3b { position: absolute; inset: 35px; border: 1px solid #D4AF37; pointer-events: none; }
        .border-4 { position: absolute; inset: 39px; border: 1px solid #E8E8E8; pointer-events: none; }
      `;
    case 'achiever':
      return `
        .border-1 { position: absolute; inset: 19px; border: 2px solid #D4AF37; pointer-events: none; }
        .border-2 { position: absolute; inset: 24px; border: 7px solid #D4AF37; pointer-events: none; }
        .border-3 { position: absolute; inset: 32px; border: 1px solid #B8960C; pointer-events: none; }
        .border-4 { position: absolute; inset: 36px; border: 1px solid #E8E8E8; pointer-events: none; }
      `;
    default:
      return base;
  }
}

// ─── Background Effects per Level ────────────────────────────────────

function getBackgroundEffect(level: string): string {
  switch (level) {
    case 'holographic':
      return `
        .layer-holographic {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(212,175,55,0.02) 0%,
            rgba(124,58,237,0.03) 25%,
            rgba(59,130,246,0.02) 50%,
            rgba(16,185,129,0.03) 75%,
            rgba(212,175,55,0.02) 100%
          );
          background-size: 200% 200%;
          pointer-events: none;
        }
      `;
    case 'purple-gradient':
      return `
        .layer-purple-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(124,58,237,0.03) 100%);
          pointer-events: none;
        }
      `;
    case 'amber-hint':
      return `
        .layer-amber-hint {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 70% 30%, rgba(245,158,11,0.04) 0%, transparent 60%);
          pointer-events: none;
        }
      `;
    case 'blue-shimmer':
      return `
        .layer-blue-shimmer {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 30% 70%, rgba(59,130,246,0.03) 0%, transparent 50%);
          pointer-events: none;
        }
      `;
    default:
      return '';
  }
}
