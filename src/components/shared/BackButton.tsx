'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  /** Navigation callback when back is clicked */
  onClick: () => void;
  /** Optional label text next to the arrow. If omitted, shows only the icon */
  label?: string;
  /** Where the button navigates to — shown as subtle hint on hover */
  to?: string;
  /** Visual variant */
  variant?: 'icon' | 'text' | 'floating';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Consistent back navigation button used across CampusCred.
 *
 * - `variant="icon"`     — Small rounded icon button (default, for headers)
 * - `variant="text"`     — Inline text link with arrow (for card footers)
 * - `variant="floating"` — Fixed-position floating back button
 *
 * No framer-motion — uses CSS transitions only.
 */
export function BackButton({
  onClick,
  label,
  to,
  variant = 'icon',
  className = '',
}: BackButtonProps) {
  if (variant === 'text') {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 text-sm transition-colors group ${className}`}
        style={{ color: 'rgba(191,219,254,0.50)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#60A5FA'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(191,219,254,0.50)'; }}
        title={to ? `Back to ${to}` : 'Go back'}
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        {label || 'Back'}
      </button>
    );
  }

  if (variant === 'floating') {
    return (
      <button
        onClick={onClick}
        className={`fixed top-4 left-4 z-50 w-10 h-10 rounded-xl border flex items-center justify-center transition-colors shadow-lg ${className}`}
        style={{
          backgroundColor: 'rgba(20,25,56,0.80)',
          borderColor: 'rgba(255,255,255,0.10)',
          color: 'rgba(191,219,254,0.60)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.10)';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(20,25,56,0.80)';
          e.currentTarget.style.color = 'rgba(191,219,254,0.60)';
        }}
        title={to ? `Back to ${to}` : 'Go back'}
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
    );
  }

  // Default: icon variant (rounded icon button for headers)
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${className}`}
      style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(255,255,255,0.10)',
        color: 'rgba(191,219,254,0.50)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.10)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.20)';
        e.currentTarget.style.color = '#ffffff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
        e.currentTarget.style.color = 'rgba(191,219,254,0.50)';
      }}
      title={to ? `Back to ${to}` : 'Go back'}
    >
      <ArrowLeft className="w-4 h-4" />
    </button>
  );
}
