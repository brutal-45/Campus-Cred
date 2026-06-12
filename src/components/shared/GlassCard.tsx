'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * CampusCred Card
 *
 * Replaces the old GlassCard (glassmorphism) with the design-system card:
 * - White background always
 * - Border: 1px solid #E2E8F0
 * - Border radius: 12px
 * - Box shadow: 0 1px 3px rgba(0,0,0,0.08)
 * - Hover shadow: 0 4px 12px rgba(0,0,0,0.12)
 * - Hover: translateY -2px
 * - Transition: 200ms ease
 * - No coloured backgrounds, no gradients, no heavy drop shadows
 */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = false, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white border rounded-xl p-6',
        hover && 'cursor-pointer',
        className
      )}
      style={{
        borderColor: '#E2E8F0',
        boxShadow: '0 1px 3px var(--color-card-shadow)',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px var(--color-card-shadow-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px var(--color-card-shadow)';
        }
      }}
    >
      {children}
    </div>
  );
}

/**
 * CampusCred Card for dark backgrounds (navy hero, footer, etc.)
 * Uses semi-transparent white instead of glassmorphism.
 * Still follows the card sizing/border rules but adapted for dark contexts.
 */
export function DarkCard({ children, className, hover = false, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-6',
        hover && 'cursor-pointer',
        className
      )}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.20)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {children}
    </div>
  );
}
