'use client'; 

import React from 'react';

// ─── Types ───────────────────────────────────────────────────────────

export interface CertificateSVGProps {
  /** Student's full name */
  studentName: string;
  /** Degree e.g. "B.Tech (Honours)" */
  degree?: string;
  /** Branch e.g. "Computer Science & AI" */
  branch?: string;
  /** College name */
  college?: string;
  /** City */
  city?: string;
  /** Task/challenge title */
  taskTitle?: string;
  /** Skills to display */
  skills?: string[];
  /** CampusCred level: Starter | Achiever | Expert | Pro | Legend */
  level?: 'Starter' | 'Achiever' | 'Expert' | 'Pro' | 'Legend';
  /** Credential ID e.g. "CRED-2026-884219" */
  credentialId?: string;
  /** Issue date string */
  issuedDate?: string;
  /** Student initials for avatar (auto-derived if not provided) */
  initials?: string;
  /** Whether to show the photo/initials circle */
  showAvatar?: boolean;
  /** Whether to show the verification badge */
  showVerifiedBadge?: boolean;
  /** Class name for the wrapper */
  className?: string;
  /** Scale factor (1 = full size 842×595) */
  scale?: number;
}

// ─── Level Configurations ────────────────────────────────────────────

const LEVEL_CONFIG = {
  Starter: {
    label: 'CAMPUSCRED STARTER',
    avatarGradient: ['#10B981', '#059669'],
    borderAccent: '#10B981',
    badgeBg: 'rgba(16,185,129,0.1)',
    badgeBorder: 'rgba(16,185,129,0.4)',
    badgeColor: '#10B981',
    icon: '\u{1F331}',
    shieldFill: '#10B981',
  },
  Achiever: {
    label: 'CAMPUSCRED ACHIEVER',
    avatarGradient: ['#3B82F6', '#1D4ED8'],
    borderAccent: '#3B82F6',
    badgeBg: 'rgba(59,130,246,0.1)',
    badgeBorder: 'rgba(59,130,246,0.4)',
    badgeColor: '#3B82F6',
    icon: '\u26A1',
    shieldFill: '#3B82F6',
  },
  Expert: {
    label: 'CAMPUSCRED EXPERT',
    avatarGradient: ['#F59E0B', '#D97706'],
    borderAccent: '#F59E0B',
    badgeBg: 'rgba(245,158,11,0.1)',
    badgeBorder: 'rgba(245,158,11,0.4)',
    badgeColor: '#F59E0B',
    icon: '\u{1F525}',
    shieldFill: '#F59E0B',
  },
  Pro: {
    label: 'CAMPUSCRED PRO',
    avatarGradient: ['#7C3AED', '#6D28D9'],
    borderAccent: '#7C3AED',
    badgeBg: 'rgba(124,58,237,0.1)',
    badgeBorder: 'rgba(124,58,237,0.4)',
    badgeColor: '#7C3AED',
    icon: '\u{1F48E}',
    shieldFill: '#7C3AED',
  },
  Legend: {
    label: 'CAMPUSCRED LEGEND',
    avatarGradient: ['#4C1D95', '#1D4ED8'],
    borderAccent: '#D4AF37',
    badgeBg: 'rgba(212,175,55,0.1)',
    badgeBorder: 'rgba(212,175,55,0.4)',
    badgeColor: '#D4AF37',
    icon: '\u{1F451}',
    shieldFill: '#D4AF37',
  },
} as const;

// ─── Helper Functions ────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 0)
    .map((p) => p[0].toUpperCase())
    .slice(0, 2)
    .join('');
}

function formatCredentialId(id?: string): string {
  if (id) return id;
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `CRED-${year}-${rand}`;
}

function formatIssueDate(date?: string): string {
  if (date) {
    const d = new Date(date);
    const day = d.getDate();
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
  const now = new Date();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

function getNameFontSize(name: string): number {
  const len = name.length;
  if (len <= 12) return 40;
  if (len <= 18) return 34;
  if (len <= 24) return 28;
  if (len <= 30) return 24;
  return 20;
}

function getNameUnderlineWidth(name: string): number {
  const len = name.length;
  if (len <= 12) return 380;
  if (len <= 18) return 420;
  if (len <= 24) return 440;
  if (len <= 30) return 460;
  return 470;
}

// ─── Corner Ornament Component ──────────────────────────────────────

function CornerOrnament({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const transforms: Record<string, string> = {
    tl: 'translate(22, 22)',
    tr: 'translate(820, 22) scale(-1, 1)',
    bl: 'translate(22, 573) scale(1, -1)',
    br: 'translate(820, 573) scale(-1, -1)',
  };

  return (
    <g transform={transforms[position]} opacity="0.9">
      {/* Main flourish arc */}
      <path
        d="M0,0 C8,2 18,3 28,0 C30,10 28,20 26,28"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Inner scroll */}
      <path
        d="M4,2 C10,4 16,4 22,2 C24,8 22,14 20,20"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Decorative curl */}
      <path
        d="M6,4 C4,8 2,14 4,18"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Diamond accent */}
      <path
        d="M10,10 L14,6 L18,10 L14,14 Z"
        fill="#D4AF37"
        opacity="0.7"
      />
      {/* Small dot */}
      <circle cx="16" cy="16" r="2" fill="#D4AF37" opacity="0.5" />
      {/* Extended flourish lines */}
      <path
        d="M28,0 C32,0 36,2 38,6"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M0,28 C0,32 2,36 6,38"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Leaf-like accent */}
      <path
        d="M30,2 C34,4 36,8 34,12"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M2,30 C4,34 8,36 12,34"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Tiny scroll curl */}
      <path
        d="M36,8 C38,10 38,14 36,16"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      <path
        d="M8,36 C10,38 14,38 16,36"
        fill="none"
        stroke="#D4AF37"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </g>
  );
}

// ─── Guilloche Border Pattern ───────────────────────────────────────

function GuillocheBorder() {
  return (
    <g opacity="0.12" fill="none" stroke="#D4AF37" strokeWidth="0.4">
      {/* Top guilloche wave */}
      {Array.from({ length: 12 }, (_, i) => (
        <path
          key={`gt-${i}`}
          d={`M${55 + i * 62},38 C${55 + i * 62 + 15},32 ${55 + i * 62 + 30},32 ${55 + i * 62 + 45},38 C${55 + i * 62 + 30},44 ${55 + i * 62 + 15},44 ${55 + i * 62},38`}
          strokeWidth="0.5"
        />
      ))}
      {/* Bottom guilloche wave */}
      {Array.from({ length: 12 }, (_, i) => (
        <path
          key={`gb-${i}`}
          d={`M${55 + i * 62},557 C${55 + i * 62 + 15},551 ${55 + i * 62 + 30},551 ${55 + i * 62 + 45},557 C${55 + i * 62 + 30},563 ${55 + i * 62 + 15},563 ${55 + i * 62},557`}
          strokeWidth="0.5"
        />
      ))}
      {/* Left guilloche wave */}
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={`gl-${i}`}
          d={`M38,${55 + i * 58} C32,${55 + i * 58 + 15} 32,${55 + i * 58 + 30} 38,${55 + i * 58 + 45} C44,${55 + i * 58 + 30} 44,${55 + i * 58 + 15} 38,${55 + i * 58}`}
          strokeWidth="0.5"
        />
      ))}
      {/* Right guilloche wave */}
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={`gr-${i}`}
          d={`M804,${55 + i * 58} C798,${55 + i * 58 + 15} 798,${55 + i * 58 + 30} 804,${55 + i * 58 + 45} C810,${55 + i * 58 + 30} 810,${55 + i * 58 + 15} 804,${55 + i * 58}`}
          strokeWidth="0.5"
        />
      ))}
      {/* Interconnecting fine lines - top */}
      {Array.from({ length: 8 }, (_, i) => (
        <line
          key={`ilt-${i}`}
          x1={70 + i * 88}
          y1="36"
          x2={70 + i * 88}
          y2="42"
          strokeWidth="0.3"
          stroke="#0A0F2C"
        />
      ))}
      {/* Interconnecting fine lines - bottom */}
      {Array.from({ length: 8 }, (_, i) => (
        <line
          key={`ilb-${i}`}
          x1={70 + i * 88}
          y1="555"
          x2={70 + i * 88}
          y2="561"
          strokeWidth="0.3"
          stroke="#0A0F2C"
        />
      ))}
    </g>
  );
}

// ─── QR Code SVG Pattern ────────────────────────────────────────────

function QRCodeSVG({ credId }: { credId: string }) {
  // Deterministic QR-like pattern based on credential ID
  const seed = credId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const size = 45;
  const cells = 15;
  const cellSize = size / cells;

  // Generate a QR-like matrix
  const matrix: boolean[][] = [];
  for (let r = 0; r < cells; r++) {
    matrix[r] = [];
    for (let c = 0; c < cells; c++) {
      // Finder patterns (3 corners)
      if (
        (r < 4 && c < 4) ||
        (r < 4 && c >= cells - 4) ||
        (r >= cells - 4 && c < 4)
      ) {
        // Finder pattern
        const lr = r < 4 ? r : r >= cells - 4 ? r - (cells - 4) : r;
        const lc = c < 4 ? c : c >= cells - 4 ? c - (cells - 4) : c;
        matrix[r][c] = lr === 0 || lr === 3 || lc === 0 || lc === 3 || (lr >= 1 && lr <= 2 && lc >= 1 && lc <= 2);
      } else {
        // Data area - pseudo-random based on seed
        const val = (seed * (r + 1) * (c + 1) + r * 7 + c * 13) % 17;
        matrix[r][c] = val < 8;
      }
    }
  }

  return (
    <g>
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0A0F2C"
            />
          ) : null
        )
      )}
    </g>
  );
}

// ─── Digital Seal Component ─────────────────────────────────────────

function DigitalSeal() {
  const sealR = 42;
  const textR = 34;

  return (
    <g transform="translate(0, 0)">
      {/* Outer ring */}
      <circle cx="0" cy="0" r={sealR} fill="none" stroke="#D4AF37" strokeWidth="2.5" />
      <circle cx="0" cy="0" r={sealR - 3} fill="none" stroke="#0A0F2C" strokeWidth="0.5" />
      <circle cx="0" cy="0" r={sealR - 4} fill="none" stroke="#D4AF37" strokeWidth="0.5" />

      {/* Text around circle */}
      <defs>
        <path
          id="sealTextPath"
          d={`M-${textR},0 A${textR},${textR} 0 1,1 ${textR},0 A${textR},${textR} 0 1,1 -${textR},0`}
          fill="none"
        />
      </defs>
      <text fontSize="5.5" fontWeight="bold" fill="#0A0F2C" letterSpacing="2.5">
        <textPath href="#sealTextPath" startOffset="2%">
          CAMPUSCRED &#x2022; VERIFIED &#x2022; INDIA &#x2022;
        </textPath>
      </text>

      {/* Inner filled circle */}
      <circle cx="0" cy="0" r="22" fill="#0A0F2C" />
      <circle cx="0" cy="0" r="20" fill="none" stroke="#D4AF37" strokeWidth="1" />

      {/* Shield icon */}
      <path
        d="M0,-14 L10,-9 L9,2 Q5,8 0,10 Q-5,8 -9,2 L-10,-9 Z"
        fill="#D4AF37"
        opacity="0.9"
      />
      <path
        d="M0,-11 L7,-7 L6,1 Q3,5 0,7 Q-3,5 -6,1 L-7,-7 Z"
        fill="#0A0F2C"
      />

      {/* CC text */}
      <text
        x="0"
        y="3"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontWeight="900"
        fontSize="9"
        fill="#D4AF37"
        letterSpacing="1"
      >
        CC
      </text>

      {/* Decorative dots on outer ring */}
      {Array.from({ length: 24 }, (_, i) => {
        const angle = (i * 15 * Math.PI) / 180;
        const x = Math.cos(angle) * (sealR - 1.5);
        const y = Math.sin(angle) * (sealR - 1.5);
        return <circle key={i} cx={x} cy={y} r="0.8" fill="#D4AF37" />;
      })}
    </g>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export function CertificateSVG({
  studentName = 'Student Name',
  degree = 'B.Tech',
  branch = 'Computer Science',
  college = 'Indian Institute of Technology',
  city = 'Delhi',
  taskTitle = 'Architecting Real-Time Distributed Financial Ledger Infrastructure',
  skills = ['RUST SYSTEMS', 'APACHE KAFKA', 'KUBERNETES'],
  level = 'Starter',
  credentialId,
  issuedDate,
  initials,
  showAvatar = true,
  showVerifiedBadge = true,
  className = '',
  scale = 1,
}: CertificateSVGProps) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.Starter;
  const nameSize = getNameFontSize(studentName);
  const nameUnderlineWidth = getNameUnderlineWidth(studentName);
  const displayInitials = initials || getInitials(studentName);
  const displayCredId = formatCredentialId(credentialId);
  const displayDate = formatIssueDate(issuedDate);
  const skillsText = skills.length > 0 ? skills.slice(0, 4).join(', ') : '';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 842 595"
      width={842 * scale}
      height={595 * scale}
      className={className}
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      <defs>
        {/* Background radial gradient */}
        <radialGradient id="premBgGrad" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F8FAFF" />
          <stop offset="100%" stopColor="#F0F4FF" />
        </radialGradient>

        {/* Avatar gradient - level-specific */}
        <linearGradient id="premAvatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={config.avatarGradient[0]} />
          <stop offset="100%" stopColor={config.avatarGradient[1]} />
        </linearGradient>

        {/* Gold line gradient (fades right) */}
        <linearGradient id="premGoldFadeR" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="85%" stopColor="#D4AF37" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>

        {/* Gold line gradient (fades left) */}
        <linearGradient id="premGoldFadeL" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#D4AF37" />
          <stop offset="85%" stopColor="#D4AF37" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>

        {/* Gold line gradient (fades both sides) */}
        <linearGradient id="premGoldFadeCenter" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0" />
          <stop offset="15%" stopColor="#D4AF37" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="85%" stopColor="#D4AF37" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>

        {/* Shield gradient for seal */}
        <linearGradient id="premShieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0A0F2C" />
          <stop offset="100%" stopColor="#1E3A5F" />
        </linearGradient>

        {/* Avatar gold glow filter */}
        <filter id="premAvatarGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="glow" />
          <feFlood floodColor="#D4AF37" floodOpacity="0.3" result="color" />
          <feComposite in="color" in2="glow" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Subtle drop shadow */}
        <filter id="premDropShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#0A0F2C" floodOpacity="0.1" />
        </filter>

        {/* Border texture pattern */}
        <pattern id="premBorderTexture" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="6" y2="6" stroke="#D4AF37" strokeWidth="0.15" opacity="0.3" />
          <line x1="6" y1="0" x2="0" y2="6" stroke="#D4AF37" strokeWidth="0.15" opacity="0.3" />
        </pattern>

        {/* Watermark pattern */}
        <pattern id="premWatermark" x="0" y="0" width="200" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <text x="0" y="30" fontFamily="sans-serif" fontWeight="900" fontSize="14" fill="#0A0F2C" opacity="0.04" letterSpacing="8">
            CAMPUSCRED
          </text>
          <text x="100" y="55" fontFamily="sans-serif" fontWeight="900" fontSize="14" fill="#0A0F2C" opacity="0.04" letterSpacing="8">
            CAMPUSCRED
          </text>
        </pattern>
      </defs>

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 1: BACKGROUND
          ═══════════════════════════════════════════════════════════════ */}
      {/* Base white */}
      <rect width="842" height="595" fill="#FFFFFF" />
      {/* Radial gradient overlay */}
      <rect width="842" height="595" fill="url(#premBgGrad)" />
      {/* Diagonal watermark */}
      <rect x="30" y="30" width="782" height="535" fill="url(#premWatermark)" />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 2: GUILLOCHE SECURITY BORDER
          ═══════════════════════════════════════════════════════════════ */}
      <GuillocheBorder />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 3: TRIPLE BORDER FRAME
          ═══════════════════════════════════════════════════════════════ */}
      {/* Outer: 3px solid gold */}
      <rect x="8" y="8" width="826" height="579" fill="none" stroke="#D4AF37" strokeWidth="3" rx="1" />
      {/* Border texture fill between outer and middle */}
      <rect x="11" y="11" width="820" height="573" fill="url(#premBorderTexture)" rx="1" />
      {/* Middle: 1px solid navy */}
      <rect x="14" y="14" width="814" height="567" fill="none" stroke="#0A0F2C" strokeWidth="1" rx="1" />
      {/* Inner: 2px solid gold */}
      <rect x="18" y="18" width="806" height="559" fill="none" stroke="#D4AF37" strokeWidth="2" rx="1" />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 4: CORNER ORNAMENTS
          ═══════════════════════════════════════════════════════════════ */}
      <CornerOrnament position="tl" />
      <CornerOrnament position="tr" />
      <CornerOrnament position="bl" />
      <CornerOrnament position="br" />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 5: TOP SECTION
          ═══════════════════════════════════════════════════════════════ */}

      {/* CampusCred Logo - Centered */}
      <g textAnchor="middle" fontFamily="sans-serif">
        <text x="340" y="62" fontWeight="900" fontSize="28" fill="#0A0F2C" letterSpacing="1">
          Campus<tspan fill="#D4AF37">Cred</tspan>
        </text>

        {/* Tagline */}
        <text
          x="340"
          y="78"
          fontWeight="600"
          fontSize="7"
          fill="#0A0F2C"
          opacity="0.55"
          letterSpacing="3.5"
        >
          EARN REAL WORK. GAIN REAL CRED.
        </text>
      </g>

      {/* Gold divider line */}
      <line x1="55" y1="90" x2="625" y2="90" stroke="url(#premGoldFadeCenter)" strokeWidth="1.2" />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 6: STUDENT AVATAR (Right Side)
          ═══════════════════════════════════════════════════════════════ */}
      {showAvatar && (
        <g transform="translate(720, 135)" filter="url(#premAvatarGlow)">
          {/* Outer gold ring */}
          <circle cx="0" cy="0" r="50" fill="none" stroke="#D4AF37" strokeWidth="3" />
          {/* Thin decorative ring */}
          <circle cx="0" cy="0" r="46" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.5" />
          {/* Avatar background */}
          <circle cx="0" cy="0" r="44" fill="url(#premAvatarGrad)" />
          {/* Initials text */}
          <text
            x="0"
            y="8"
            textAnchor="middle"
            fontFamily="sans-serif"
            fontWeight="900"
            fontSize="26"
            fill="#FFFFFF"
            letterSpacing="2"
          >
            {displayInitials}
          </text>

          {/* Level badge below avatar */}
          <g transform="translate(-55, 60)">
            <rect
              width="110"
              height="20"
              rx="10"
              fill={config.badgeBg}
              stroke={config.badgeBorder}
              strokeWidth="1"
            />
            <text
              x="55"
              y="13.5"
              textAnchor="middle"
              fontFamily="sans-serif"
              fontWeight="700"
              fontSize="7.5"
              fill={config.badgeColor}
              letterSpacing="1"
            >
              {config.label} {config.icon}
            </text>
          </g>
        </g>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 7: CERTIFICATE BODY TEXT
          ═══════════════════════════════════════════════════════════════ */}

      {/* Line 1: "THIS IS TO CERTIFY THAT" */}
      <text
        x="70"
        y="130"
        fontFamily="sans-serif"
        fontWeight="600"
        fontSize="10"
        fill="#0A0F2C"
        opacity="0.5"
        letterSpacing="4"
      >
        THIS IS TO CERTIFY THAT
      </text>

      {/* Line 2: Student Name - Very Large, Bold */}
      <text
        x="70"
        y="178"
        fontFamily="serif"
        fontWeight="bold"
        fontSize={nameSize}
        fill="#0A0F2C"
      >
        {studentName}
      </text>
      {/* Gold underline beneath name */}
      <rect x="70" y={184} width={nameUnderlineWidth} height="2" fill="#D4AF37" rx="1" />

      {/* Line 3: Degree & Branch */}
      <text x="70" y="215" fontFamily="serif" fontSize="13" fill="#0A0F2C" opacity="0.75" fontStyle="italic">
        a student of <tspan fontWeight="bold" fontStyle="normal">{degree}</tspan> in <tspan fontWeight="bold" fontStyle="normal">{branch}</tspan>
      </text>

      {/* Line 3 continued: College */}
      <text x="70" y="238" fontFamily="serif" fontSize="13" fill="#0A0F2C" opacity="0.75" fontStyle="italic">
        from <tspan fontWeight="bold" fontStyle="normal">{college}</tspan>{city ? <tspan fontWeight="bold" fontStyle="normal">, {city}</tspan> : ''}
      </text>

      {/* Line 4: "has successfully completed the task" */}
      <text x="70" y="275" fontFamily="serif" fontSize="13" fill="#0A0F2C" opacity="0.65">
        has successfully completed the task
      </text>

      {/* Line 5: Task Title - Electric Blue with decorative brackets */}
      <g transform="translate(70, 292)">
        {/* Left decorative bracket */}
        <text
          x="0"
          y="18"
          fontFamily="serif"
          fontSize="26"
          fill="#D4AF37"
          opacity="0.6"
        >
          &#x275B;
        </text>
        {/* Task title text */}
        <text
          x="18"
          y="16"
          fontFamily="sans-serif"
          fontWeight="bold"
          fontSize="15"
          fill="#3B82F6"
        >
          {taskTitle}
        </text>
        {/* Right decorative bracket */}
        <text
          x={18 + taskTitle.length * 8.2}
          y="18"
          fontFamily="serif"
          fontSize="26"
          fill="#D4AF37"
          opacity="0.6"
        >
          &#x275C;
        </text>
      </g>

      {/* Line 6: Skills text */}
      <text x="70" y="335" fontFamily="serif" fontSize="12" fill="#0A0F2C" opacity="0.6">
        on CampusCred and demonstrated skills in
      </text>
      {skillsText && (
        <text x="70" y="355" fontFamily="sans-serif" fontWeight="700" fontSize="12" fill="#0A0F2C" opacity="0.8">
          {skillsText}
        </text>
      )}

      {/* Skills as styled pills */}
      {skills.length > 0 && (
        <g transform="translate(70, 370)" fontFamily="sans-serif" fontWeight="600" fontSize="8" textAnchor="middle">
          {skills.slice(0, 4).map((skill, i) => {
            const pillWidth = Math.max(skill.length * 6.5 + 16, 55);
            const xPos = skills.slice(0, i).reduce((acc, s, j) => acc + Math.max(s.length * 6.5 + 16, 55) + 8, 0);
            return (
              <g key={skill} transform={`translate(${xPos},0)`}>
                <rect
                  width={pillWidth}
                  height="20"
                  rx="10"
                  fill="rgba(212,175,55,0.08)"
                  stroke="rgba(212,175,55,0.35)"
                  strokeWidth="0.8"
                />
                <text x={pillWidth / 2} y="13.5" fill="#0A0F2C" opacity="0.8">
                  {skill}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* Line 7: Date and Credential ID */}
      <text x="70" y="415" fontFamily="serif" fontSize="11" fill="#0A0F2C" opacity="0.6">
        Issued on {displayDate}
      </text>
      <text x="70" y="432" fontFamily="monospace" fontSize="9" fill="#0A0F2C" opacity="0.5" letterSpacing="1">
        Valid Certificate ID: {displayCredId}
      </text>

      {/* ═══════════════════════════════════════════════════════════════
          DIVIDER ABOVE FOOTER
          ═══════════════════════════════════════════════════════════════ */}
      <line x1="55" y1="465" x2="787" y2="465" stroke="url(#premGoldFadeCenter)" strokeWidth="0.8" />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 8: BOTTOM SECTION (3 Columns)
          ═══════════════════════════════════════════════════════════════ */}

      {/* LEFT COLUMN: QR Code */}
      <g transform="translate(65, 480)">
        {/* QR Code background */}
        <rect width="48" height="48" fill="#FFFFFF" stroke="#D4AF37" strokeWidth="1" rx="2" />
        {/* QR Code pattern */}
        <g transform="translate(1.5, 1.5)">
          <QRCodeSVG credId={displayCredId} />
        </g>
        {/* "Scan to Verify" text */}
        <text x="58" y="20" fontFamily="sans-serif" fontWeight="700" fontSize="7.5" fill="#0A0F2C" opacity="0.6" letterSpacing="1">
          SCAN TO VERIFY
        </text>
        <text x="58" y="33" fontFamily="monospace" fontSize="6" fill="#0A0F2C" opacity="0.4">
          campuscred.in/verify
        </text>
        <text x="58" y="43" fontFamily="monospace" fontSize="6" fill="#0A0F2C" opacity="0.4">
          {displayCredId}
        </text>
      </g>

      {/* CENTER COLUMN: Digital Seal */}
      <g transform="translate(421, 518)">
        <DigitalSeal />
        {/* "Digitally Verified" text */}
        <text
          x="0"
          y="52"
          textAnchor="middle"
          fontFamily="sans-serif"
          fontWeight="700"
          fontSize="7"
          fill="#0A0F2C"
          opacity="0.5"
          letterSpacing="2"
        >
          DIGITALLY VERIFIED
        </text>
      </g>

      {/* RIGHT COLUMN: Signature */}
      <g transform="translate(660, 480)" textAnchor="middle">
        {/* Signature line */}
        <line x1="-60" y1="32" x2="80" y2="32" stroke="#0A0F2C" strokeWidth="0.6" opacity="0.3" />
        {/* "Authorized by CampusCred" */}
        <text
          x="10"
          y="44"
          fontFamily="sans-serif"
          fontWeight="600"
          fontSize="7"
          fill="#0A0F2C"
          opacity="0.5"
          letterSpacing="1"
        >
          AUTHORIZED BY CAMPUSCRED
        </text>
        {/* "CampusCred Engine" in stylized script */}
        <text
          x="10"
          y="24"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontStyle="italic"
          fontWeight="bold"
          fontSize="16"
          fill="#0A0F2C"
          opacity="0.8"
        >
          CampusCred Engine
        </text>
      </g>

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 9: LEVEL-SPECIFIC ACCENT ENHANCEMENTS
          ═══════════════════════════════════════════════════════════════ */}

      {/* Level accent glow on inner border for Expert+ */}
      {(level === 'Expert' || level === 'Pro' || level === 'Legend') && (
        <rect
          x="20"
          y="20"
          width="802"
          height="555"
          fill="none"
          stroke={config.borderAccent}
          strokeWidth="0.5"
          opacity={level === 'Legend' ? 0.3 : 0.15}
          rx="1"
        />
      )}

      {/* Legend: Extra gold shimmer accents */}
      {level === 'Legend' && (
        <g opacity="0.15">
          {/* Top center gold accent */}
          <line x1="350" y1="24" x2="492" y2="24" stroke="#D4AF37" strokeWidth="1.5" />
          {/* Bottom center gold accent */}
          <line x1="350" y1="571" x2="492" y2="571" stroke="#D4AF37" strokeWidth="1.5" />
          {/* Small diamonds on the accents */}
          <path d="M421,22 L424,24 L421,26 L418,24 Z" fill="#D4AF37" />
          <path d="M421,569 L424,571 L421,573 L418,571 Z" fill="#D4AF37" />
        </g>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 10: VERIFIED BADGE (if enabled)
          ═══════════════════════════════════════════════════════════════ */}
      {showVerifiedBadge && (
        <g transform="translate(720, 250)">
          {/* Small verified badge */}
          <circle cx="0" cy="0" r="16" fill="#0A0F2C" opacity="0.05" />
          <circle cx="0" cy="0" r="12" fill="#0A0F2C" />
          <circle cx="0" cy="0" r="10.5" fill="none" stroke="#D4AF37" strokeWidth="0.8" />
          {/* Checkmark */}
          <path d="M-4,0 L-1,3 L5,-3" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text
            x="0"
            y="22"
            textAnchor="middle"
            fontFamily="sans-serif"
            fontWeight="700"
            fontSize="5.5"
            fill="#0A0F2C"
            opacity="0.5"
            letterSpacing="0.5"
          >
            VERIFIED
          </text>
        </g>
      )}
    </svg>
  );
}

// ─── Preset Certificate Variants ─────────────────────────────────────

/** Quick certificate for each level — used in hero section, previews etc. */
export const LEVEL_CERTIFICATE_PRESETS: Record<string, Partial<CertificateSVGProps>> = {
  Starter: {
    studentName: 'Rahul Sharma',
    degree: 'B.Tech',
    branch: 'CSE',
    college: 'VIT Vellore',
    city: 'Vellore',
    taskTitle: 'Building Responsive E-Commerce Dashboard',
    skills: ['HTML/CSS', 'REACT', 'TAILWIND'],
    level: 'Starter',
    credentialId: 'CRED-2026-100234',
  },
  Achiever: {
    studentName: 'Priya Patel',
    degree: 'B.Tech (Honours)',
    branch: 'Information Technology',
    college: 'NIT Trichy',
    city: 'Tiruchirappalli',
    taskTitle: 'Full-Stack Task Management Application',
    skills: ['NODE.JS', 'MONGODB', 'EXPRESS'],
    level: 'Achiever',
    credentialId: 'CRED-2026-284567',
  },
  Expert: {
    studentName: 'Vikram Singh',
    degree: 'M.Tech',
    branch: 'Data Science & AI',
    college: 'IIT Madras',
    city: 'Chennai',
    taskTitle: 'ML-Powered Sentiment Analysis Pipeline',
    skills: ['PYTHON', 'TENSORFLOW', 'NLP'],
    level: 'Expert',
    credentialId: 'CRED-2026-412890',
  },
  Pro: {
    studentName: 'Ananya Reddy',
    degree: 'B.Tech (Honours)',
    branch: 'Cyber Security',
    college: 'IIIT Hyderabad',
    city: 'Hyderabad',
    taskTitle: 'Zero-Trust Network Security Architecture',
    skills: ['PENETRATION', 'SIEM', 'DOCKER'],
    level: 'Pro',
    credentialId: 'CRED-2026-612345',
  },
  Legend: {
    studentName: 'Arjun R. Deshmukh',
    degree: 'B.Tech (Honours)',
    branch: 'Computer Science & AI',
    college: 'IIT Bombay',
    city: 'Mumbai',
    taskTitle: 'Architecting Real-Time Distributed Financial Ledger Infrastructure',
    skills: ['RUST SYSTEMS', 'APACHE KAFKA', 'KUBERNETES'],
    level: 'Legend',
    credentialId: 'CRED-2026-884219',
  },
};
