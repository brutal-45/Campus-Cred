'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Building2, Shield, CheckCircle2, Download, Share2, Award, QrCode, Star } from 'lucide-react';
import { useAppStore } from '@/store';
import { StatsCounter } from '@/components/shared/StatsCounter';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { CertificateSVG, LEVEL_CERTIFICATE_PRESETS } from '@/components/certificate/CertificateSVG';

const LEVEL_ORDER = ['Starter', 'Achiever', 'Expert', 'Pro', 'Legend'] as const;
const LEVEL_EMOJIS: Record<string, string> = {
  Starter: '\u{1F331}',
  Achiever: '\u26A1',
  Expert: '\u{1F525}',
  Pro: '\u{1F48E}',
  Legend: '\u{1F451}',
};

/**
 * HeroSection
 *
 * Design rules applied:
 * - Navy background #0A0F2C with static dot grid at 8% opacity (NOT moving)
 * - Hero text: white, Poppins SemiBold for headings
 * - ONE gradient element: the main CTA button only
 * - All other sections: white or #F8FAFC
 * - NO floating blob animations, NO parallax, NO typing animations
 * - NO auto-playing carousels (level selector is manual only)
 * - Allowed animations: page fade-in (300ms), button press (scale 0.97, 100ms)
 * - Feature icons: light navy background (#0A0F2C at 8%) NOT colorful
 * - Navbar is ALWAYS visible (white bg), so hero needs pt-16 for navbar offset
 */
export function HeroSection() {
  const { navigate } = useAppStore();
  const [activeLevel, setActiveLevel] = useState<number>(4);
  const [stats, setStats] = useState({ students: 75, certificates: 60, companies: 15, branches: 124 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        // Use real DB counts; fall back to minimums if DB has fewer
        setStats({
          students: Math.max(data.students || 0, 75),
          certificates: Math.max(data.certificates || 0, 60),
          companies: Math.max(data.companies || 0, 15),
          branches: Math.max(data.branches || 0, 124),
        });
      }
    } catch {
      // Keep default minimum values
    }
  };

  const currentLevel = LEVEL_ORDER[activeLevel];
  const currentPreset = LEVEL_CERTIFICATE_PRESETS[currentLevel];

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden hero-bg">
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left Content — simple fade-in only */}
          <div className="text-center lg:text-left animate-fade-in">
            {/* Badge */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/40 bg-blue-500/15 px-4 py-1.5 text-sm font-semibold text-blue-300">
                India&apos;s #1 Student Career Platform
              </span>
            </div>

            {/* Headline – Poppins SemiBold only */}
            <h1 className="mb-6 font-heading text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Earn Real Work.
              <br />
              <span className="text-blue-400">Gain Real Cred.</span>
            </h1>

            {/* Subtitle – Inter Regular */}
            <p className="mx-auto mb-10 max-w-xl text-lg text-slate-200 lg:mx-0" style={{ lineHeight: 1.5 }}>
              CampusCred is 100% free for students. Complete real-world tasks from
              top Indian companies, earn QR-verified digital certificates, build a
              public portfolio, and get hired — all without spending a single rupee.
            </p>

            {/* CTA Buttons — ONE gradient button (primary) + one secondary */}
            <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
              {/* HERO CTA — The ONE allowed gradient button */}
              <button
                onClick={() => navigate('onboarding')}
                className="gradient-primary group flex items-center gap-2 rounded-lg px-6 py-3 text-base font-semibold text-white transition-all duration-200 active:scale-[0.97]"
                style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)' }}
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Secondary button — white bg, navy border */}
              <button
                onClick={() => navigate('company-register')}
                className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-white transition-all duration-200 hover:bg-white/10 active:scale-[0.97]"
              >
                <Building2 className="h-5 w-5" />
                For Companies
              </button>
            </div>

            {/* Trust Badges Row */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4" style={{ color: '#E8C84A' }} />
                <span className="text-xs text-slate-300 font-medium">QR-Verified</span>
              </div>
              <div className="h-3 w-px bg-white/30" />
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-slate-300 font-medium">Industry Recognized</span>
              </div>
              <div className="h-3 w-px bg-white/30" />
              <div className="flex items-center gap-1.5">
                <Download className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-slate-300 font-medium">PDF + PNG</span>
              </div>
              <div className="h-3 w-px bg-white/30" />
              <div className="flex items-center gap-1.5">
                <Share2 className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-slate-300 font-medium">LinkedIn Ready</span>
              </div>
            </div>
          </div>

          {/* Right — Certificate Showcase (Desktop only) */}
          <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="relative">
              {/* Subtle glow — NOT animated, just a static soft shadow */}
              <div className="absolute -inset-4 rounded-2xl blur-xl" style={{ backgroundColor: 'rgba(212,175,55,0.08)' }} />

              {/* Certificate card wrapper */}
              <div
                className="relative rounded-xl overflow-hidden"
                style={{
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                }}
              >
                {/* Top gold accent bar with logo */}
                <div className="flex items-center justify-between px-4 py-2.5" style={{ backgroundColor: 'rgba(212,175,55,0.12)', borderBottom: '1px solid rgba(212,175,55,0.20)' }}>
                  <div className="flex items-center gap-2">
                    <CampusCredLogo size={24} variant="white" />
                    <div className="h-4 w-px" style={{ backgroundColor: 'rgba(212,175,55,0.30)' }} />
                    <div className="flex items-center gap-1.5">
                      <Award className="h-4 w-4" style={{ color: '#E8C84A' }} />
                      <span className="text-xs font-semibold" style={{ color: '#E8C84A' }}>Official Certificate</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.20)' }}>
                      <div className="h-1.5 w-1.5 rounded-full bg-success" />
                      <span className="text-[10px] text-success font-semibold">Verified</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.20)' }}>
                      <QrCode className="h-3 w-3 text-electric-light" />
                      <span className="text-[10px] text-electric-light font-medium">QR Secured</span>
                    </div>
                  </div>
                </div>

                {/* Certificate SVG — no animation, just static display */}
                <div className="relative p-2 bg-white rounded-lg m-2">
                  <CertificateSVG
                    {...currentPreset}
                    scale={0.62}
                    className="w-full h-auto"
                  />
                </div>

                {/* Bottom info bar */}
                <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: 'rgba(212,175,55,0.06)', borderTop: '1px solid rgba(212,175,55,0.12)' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5" style={{ color: '#E8C84A' }} />
                      <span className="text-[10px] font-medium text-white/70">SHA-256 Encrypted</span>
                    </div>
                    <div className="h-3 w-px bg-white/10" />
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" style={{ color: '#E8C84A' }} />
                      <span className="text-[10px] font-medium text-white/70">{currentLevel} Level</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CampusCredLogo size={24} variant="icon" />
                    <span className="text-[10px] text-white/60 font-mono">campuscred.in/verify</span>
                  </div>
                </div>
              </div>

              {/* Level selector pills — manual only, NO auto-play */}
              <div className="mt-4 flex items-center justify-center gap-1.5">
                {LEVEL_ORDER.map((level, i) => (
                  <button
                    key={level}
                    onClick={() => setActiveLevel(i)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold transition-colors duration-200 border ${
                      activeLevel === i
                        ? 'border-gold/40 text-gold-light'
                        : 'border-white/10 text-white/60 hover:bg-white/10 hover:text-white/75'
                    }`}
                    style={activeLevel === i ? { backgroundColor: 'rgba(212,175,55,0.20)' } : { backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <span className="text-xs">{LEVEL_EMOJIS[level]}</span>
                    <span className="hidden sm:inline">{level}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Certificate Preview */}
        <div className="mt-12 lg:hidden animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="relative">
            <div className="absolute -inset-2 rounded-xl blur-lg" style={{ backgroundColor: 'rgba(212,175,55,0.08)' }} />
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                border: '1px solid rgba(212,175,55,0.20)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
            >
              {/* Top bar */}
              <div className="flex items-center justify-between px-3 py-2" style={{ backgroundColor: 'rgba(212,175,55,0.10)', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
                <div className="flex items-center gap-2">
                  <CampusCredLogo size={24} variant="white" />
                  <div className="h-3 w-px" style={{ backgroundColor: 'rgba(212,175,55,0.30)' }} />
                  <Award className="h-3.5 w-3.5" style={{ color: '#E8C84A' }} />
                  <span className="text-[10px] font-semibold" style={{ color: '#E8C84A' }}>Your Certificate</span>
                </div>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  <span className="text-[9px] text-success font-semibold">Verified</span>
                </div>
              </div>
              {/* Certificate SVG */}
              <div className="p-1.5 bg-white rounded-lg m-1.5">
                <CertificateSVG
                  {...currentPreset}
                  scale={0.48}
                  className="w-full h-auto"
                />
              </div>
              {/* Level selector — manual only */}
              <div className="px-3 py-2" style={{ borderTop: '1px solid rgba(212,175,55,0.08)' }}>
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {LEVEL_ORDER.map((level, i) => (
                    <button
                      key={level}
                      onClick={() => setActiveLevel(i)}
                      className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors duration-200 border whitespace-nowrap ${
                        activeLevel === i
                          ? 'border-gold/40 text-gold-light'
                          : 'border-white/10 text-white/60'
                      }`}
                      style={activeLevel === i ? { backgroundColor: 'rgba(212,175,55,0.20)' } : { backgroundColor: 'rgba(255,255,255,0.05)' }}
                    >
                      <span>{LEVEL_EMOJIS[level]}</span>
                      <span>{level}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row — standard card on dark bg */}
        <div className="mt-16">
          <div
            className="rounded-xl p-8 sm:p-10"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
            }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
              <StatsCounter value={stats.certificates} label="Certificates Issued" suffix="+" />
              <StatsCounter value={stats.companies} label="Companies" suffix="+" />
              <StatsCounter value={stats.students} label="Students" suffix="+" />
              <StatsCounter value={stats.branches} label="Branches" suffix="+" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
