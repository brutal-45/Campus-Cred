'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';

/**
 * CTASection
 *
 * Design rules:
 * - Navy background (#0A0F2C) with hero-bg dot grid
 * - White logo variant
 * - Poppins SemiBold heading
 * - ONE gradient button allowed (hero CTA)
 * - No floating elements, no animated decorative shapes
 * - 4px spacing grid
 */
export function CTASection() {
  const { navigate } = useAppStore();
  const [studentCount, setStudentCount] = useState(75);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setStudentCount(Math.max(data.students || 0, 75));
      })
      .catch(() => {});
  }, []);

  const formatCount = (n: number) => n.toLocaleString('en-IN');

  return (
    <section className="hero-bg py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {/* Logo badge */}
        <div className="flex justify-center mb-6">
          <CampusCredLogo size={44} variant="white" />
        </div>

        {/* Heading — Poppins SemiBold */}
        <h2 className="mb-6 font-heading text-[32px] font-semibold text-white sm:text-[40px] md:text-[48px]">
          Ready to Build Your Cred?
        </h2>

        {/* Body text — Inter Regular, white/60 */}
        <p className="mx-auto mb-10 max-w-[560px] text-base leading-relaxed text-white/80 sm:text-lg">
          Join {formatCount(studentCount)}+ college students building real skills, earning verified
          certificates, and getting hired through CampusCred.
        </p>

        {/* CTA button — gradient-primary allowed for hero CTA */}
        <button
          onClick={() => navigate('onboarding')}
          className="gradient-primary group inline-flex items-center gap-3 rounded-xl px-10 py-4 text-lg font-bold text-white shadow-xl transition-[filter] duration-200 hover:brightness-90 active:scale-[0.97]"
        >
          Start Building Your Cred
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>

        {/* One line of reassurance */}
        <p className="mt-8 text-sm text-white/65">
          100% free for students · No credit card required
        </p>
      </div>
    </section>
  );
}
