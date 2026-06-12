'use client';

import React from 'react';
import { motion } from 'framer-motion';

type LogoSize = 24 | 28 | 30 | 32 | 34 | 36 | 40 | 44 | 48 | 56 | 64;
type LogoVariant = 'full' | 'icon' | 'white' | 'dark' | 'gold';

interface CampusCredLogoProps {
  /** Height in pixels. Uses the allowed size scale. */
  size?: LogoSize;
  /** Visual variant of the logo. */
  variant?: LogoVariant;
  /** Play the shield-draw + checkmark-pop animation (600ms total, plays once). */
  animate?: boolean;
  /** Optional className for the wrapper div. */
  className?: string;
  /** Called when the logo is clicked. */
  onClick?: () => void;
}

/*
  Logo Placement Reference:
  ─────────────────────────
  FULL LOGO (icon + "CampusCred" text):
  - Navbar top left ........... height 36px
  - Footer center ............. height 32px (white version)
  - Login page center top ..... height 48px
  - Register page center top .. height 48px
  - Dashboard sidebar top ..... height 34px
  - Onboarding pages top left . height 36px
  - Company dashboard navbar .. height 36px
  - College dashboard navbar .. height 36px
  - Admin dashboard sidebar ... height 34px
  - Pricing page top left ..... height 36px
  - Blog page top left ........ height 36px
  - 404 error page center ..... height 48px

  ICON ONLY (shield + checkmark):
  - Browser favicon ........... 32x32
  - Certificate seal .......... 60x60 gold tinted
  - QR code center embed ...... 20x20
  - Mobile header ............. height 32px
  - Loading spinner page ...... 64px animated
  - Student public profile .... watermark 5% opacity 80px

  GOLD TINTED:
  - Certificate header ........ height 56px
  - Certificate verify page ... height 44px
  - Ambassador certificate .... height 52px

  WHITE VERSION:
  - Footer (dark bg) .......... height 32px
  - Dark mode navbar .......... height 36px
  - Navy email header ......... height 40px
*/

export function CampusCredLogo({
  size = 36,
  variant = 'full',
  animate = false,
  className = '',
  onClick,
}: CampusCredLogoProps) {
  const isIcon = variant === 'icon';
  const isWhite = variant === 'white';
  const isGold = variant === 'gold';

  // Determine colours based on variant
  const shieldBorder = isGold ? '#D4AF37' : isWhite ? '#ffffff' : '#3B82F6';
  const shieldFill = isGold ? 'rgba(212,175,55,0.12)' : isWhite ? 'rgba(255,255,255,0.12)' : '#0A0F2C';
  const capColor = isGold ? '#D4AF37' : isWhite ? '#ffffff' : '#3B82F6';
  const checkColor = isGold ? '#B8941F' : '#10B981';

  // Text colours using inline styles for reliability
  const campusColor = isWhite ? '#ffffff' : isGold ? '#D4AF37' : '#0A0F2C';
  const credColor = isWhite ? '#60A5FA' : isGold ? '#E8C84A' : '#3B82F6';

  // Text size scales with icon height
  const textSize =
    size >= 56 ? 22 :
    size >= 44 ? 18 :
    size >= 36 ? 16 :
    size >= 30 ? 14 :
    13;

  return (
    <div
      className={`flex items-center gap-2 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ padding: '8px', minWidth: size + 16, minHeight: size + 16 }}
    >
      {/* Shield SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="CampusCred logo"
      >
        {/* Shield path — draws in 0–400ms */}
        <motion.path
          d="M32 4L8 16V32C8 46.4 18.4 59.2 32 62C45.6 59.2 56 46.4 56 32V16L32 4Z"
          fill={shieldFill}
          stroke={shieldBorder}
          strokeWidth="2.5"
          strokeLinejoin="round"
          initial={animate ? { pathLength: 0, opacity: 0 } : undefined}
          animate={animate ? { pathLength: 1, opacity: 1 } : undefined}
          transition={animate ? { duration: 0.4, ease: 'easeOut' } : undefined}
        />

        {/* Graduation cap – top board */}
        <motion.path
          d="M18 28L32 20L46 28L32 36L18 28Z"
          fill={capColor}
          initial={animate ? { opacity: 0 } : undefined}
          animate={animate ? { opacity: 1 } : undefined}
          transition={animate ? { duration: 0.15, delay: 0.35 } : undefined}
        />
        {/* Cap tassel line */}
        <motion.path
          d="M32 36V44"
          stroke={capColor}
          strokeWidth="2"
          strokeLinecap="round"
          initial={animate ? { pathLength: 0 } : undefined}
          animate={animate ? { pathLength: 1 } : undefined}
          transition={animate ? { duration: 0.1, delay: 0.45 } : undefined}
        />
        {/* Tassel end dot */}
        <motion.circle
          cx="32"
          cy="45"
          r="2"
          fill={capColor}
          initial={animate ? { scale: 0 } : undefined}
          animate={animate ? { scale: 1 } : undefined}
          transition={animate ? { duration: 0.1, delay: 0.5 } : undefined}
        />

        {/* Checkmark — pops in at 400–600ms (the last 200ms of the 600ms animation) */}
        <motion.path
          d="M24 35L30 41L42 27"
          stroke={checkColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={animate ? { pathLength: 0, opacity: 0, scale: 0.8 } : undefined}
          animate={animate ? { pathLength: 1, opacity: 1, scale: 1 } : undefined}
          transition={animate ? { duration: 0.2, delay: 0.4, ease: 'easeOut' } : undefined}
        />
      </svg>

      {/* Text — hidden for 'icon' variant */}
      {!isIcon && (
        <motion.span
          className="font-heading font-semibold tracking-tight whitespace-nowrap"
          style={{ fontSize: textSize, lineHeight: 1 }}
          initial={animate ? { opacity: 0, x: -8 } : undefined}
          animate={animate ? { opacity: 1, x: 0 } : undefined}
          transition={animate ? { duration: 0.15, delay: 0.5 } : undefined}
        >
          <span style={{ color: campusColor }}>Campus</span>
          <span style={{ color: credColor }}>Cred</span>
        </motion.span>
      )}
    </div>
  );
}
