'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Trophy, Shield, Copy, Check, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';

interface CompletionScreenProps {
  userName: string;
  degree?: string;
  branch?: string;
  city?: string;
  onGoToDashboard: () => void;
}

// Generate CampusCred username: firstname.branch.randomnumber
function generateUsername(fullName: string, branch: string): string {
  const firstName = fullName.trim().split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
  const branchShort = branch
    ? branch.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6)
    : 'gen';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${firstName}.${branchShort}.${randomNum}`;
}

// Static check circle (no continuous animation)
function StaticCheckCircle() {
  return (
    <div className="w-[120px] h-[120px] mx-auto flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="4" />
        <circle cx="60" cy="60" r="54" fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" transform="rotate(-90 60 60)" />
        <circle cx="60" cy="60" r="48" fill="#10B981" />
        <path d="M38 62 L52 76 L82 46" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// Static Level Progress Ring (no gradient animation)
function LevelProgressRing({ progress, max, level }: { progress: number; max: number; level: string }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(progress / max, 1);
  const offset = circumference - percent * circumference;

  const levelIcons: Record<string, string> = {
    Starter: '\u{1F331}',
    Achiever: '\u26A1',
    Expert: '\u{1F525}',
    Elite: '\u{1F48E}',
    Legend: '\u{1F451}',
  };

  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg width="112" height="112" viewBox="0 0 112 112" className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx="56" cy="56" r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"
        />
        {/* Progress ring — static, single color */}
        <circle
          cx="56" cy="56" r={radius}
          fill="none" stroke="#10B981" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl">{levelIcons[level] || '\u{1F331}'}</span>
        <span className="text-white font-bold text-sm mt-0.5">{level}</span>
      </div>
    </div>
  );
}

export function CompletionScreen({ userName, degree, branch, city, onGoToDashboard }: CompletionScreenProps) {
  const [showContent, setShowContent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const username = useMemo(() => generateUsername(userName, branch || ''), [userName, branch]);

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 600);
    const t2 = setTimeout(() => setShowDetails(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Simple static decorative elements (no continuous animation)
  const staticDecorations = useMemo(
    () => [
      { id: 0, x: 8, y: 12, size: 6, color: 'rgba(212,175,55,0.15)' },
      { id: 1, x: 85, y: 8, size: 8, color: 'rgba(59,130,246,0.12)' },
      { id: 2, x: 15, y: 80, size: 5, color: 'rgba(124,58,237,0.12)' },
      { id: 3, x: 90, y: 75, size: 7, color: 'rgba(16,185,129,0.12)' },
      { id: 4, x: 50, y: 5, size: 4, color: 'rgba(212,175,55,0.10)' },
      { id: 5, x: 72, y: 88, size: 5, color: 'rgba(59,130,246,0.10)' },
    ],
    []
  );

  const copyUsername = () => {
    navigator.clipboard.writeText(username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="animate-fade-in w-full max-w-lg mx-auto text-center relative overflow-hidden"
    >
      {/* Static decorative dots (no continuous animation) */}
      <div className="absolute inset-0 pointer-events-none">
        {staticDecorations.map((d) => (
          <div
            key={d.id}
            className="absolute rounded-full"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.size,
              height: d.size,
              backgroundColor: d.color,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Logo */}
        <div
          className="animate-fade-in flex justify-center mb-4"
          style={{ animationDelay: '100ms' }}
        >
          <CampusCredLogo size={48} variant="white" />
        </div>

        {/* Static Check Circle */}
        <div
          className="animate-fade-in flex justify-center mb-6"
          style={{ animationDelay: '200ms' }}
        >
          <StaticCheckCircle />
        </div>

        {showContent && (
          <div className="animate-fade-in-up">
            {/* Welcome */}
            <h2
              className="animate-fade-in text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-poppins)] mb-2"
              style={{ animationDelay: '100ms' }}
            >
              Welcome to CampusCred
              <br />
              <span className="text-gold">{userName}!</span>
            </h2>

            <p
              className="animate-fade-in text-text-secondary text-base mt-1 mb-8"
              style={{ animationDelay: '200ms' }}
            >
              Your account is ready. Let&apos;s start building your cred!
            </p>

            {/* User Details Card */}
            {showDetails && (
              <div
                className="animate-fade-in-up rounded-xl p-5 sm:p-6 mb-6 text-left"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: '#E2E8F0', border: '1px solid' }}
              >
                {/* CampusCred ID with Copy */}
                <div className="mb-5">
                  <p className="text-[11px] uppercase tracking-widest text-electric-light/60 font-bold mb-2 flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-electric-light/60" />
                    Your CampusCred ID
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/5 rounded-lg px-4 py-3" style={{ borderColor: '#E2E8F0', border: '1px solid' }}>
                      <span className="text-electric-light font-mono font-bold text-lg">@{username}</span>
                    </div>
                    <button
                      onClick={copyUsername}
                      className="btn-press flex h-11 w-11 items-center justify-center rounded-lg bg-electric/10 text-electric-light hover:bg-electric/20 transition-colors"
                      style={{ borderColor: '#E2E8F0', border: '1px solid' }}
                    >
                      {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-success text-[10px] mt-1 ml-1">
                      Copied to clipboard!
                    </p>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Name', value: userName },
                    { label: 'Degree', value: degree || 'Not set' },
                    { label: 'Branch', value: branch || 'Not set' },
                    { label: 'City', value: city || 'Not set' },
                  ].map((item, i) => (
                    <div
                      key={item.label}
                      className="animate-fade-in p-3 rounded-lg bg-white/[0.03]"
                      style={{ borderColor: '#E2E8F0', border: '1px solid', animationDelay: `${100 + i * 50}ms` }}
                    >
                      <p className="text-[10px] uppercase tracking-wider text-blue-200/30 font-semibold">{item.label}</p>
                      <p className="text-white text-sm font-medium mt-0.5 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CampusCred Score Section */}
            {showDetails && (
              <div
                className="animate-fade-in-up rounded-xl p-5 sm:p-6 mb-4 relative overflow-hidden"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: '#E2E8F0', border: '1px solid', animationDelay: '200ms' }}
              >
                {/* Score Header */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-gold" />
                  <h3 className="text-lg font-bold text-gold font-[family-name:var(--font-poppins)]">
                    CampusCred Score
                  </h3>
                  <Zap className="w-5 h-5 text-gold" />
                </div>

                {/* Level Progress Ring (static) */}
                <LevelProgressRing progress={0} max={1000} level="Starter" />

                {/* Progress text */}
                <div className="mt-3">
                  <div className="flex items-center justify-center gap-1.5 text-blue-200/40 text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>
                      <span className="text-electric-light font-bold">0</span>
                      <span className="text-blue-200/30"> / 1000</span> score &middot; <span className="text-purple-light font-medium">Starter</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            {showDetails && (
              <div
                className="animate-fade-in-up grid grid-cols-2 gap-3 mb-6"
                style={{ animationDelay: '300ms' }}
              >
                <div
                  className="rounded-xl p-4 relative overflow-hidden"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: '#E2E8F0', border: '1px solid' }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-electric" />
                  <span className="text-xl">{'\u{1F331}'}</span>
                  <p className="text-white font-bold text-base mt-1">0</p>
                  <p className="text-text-secondary text-[10px] uppercase tracking-wider font-semibold">Score</p>
                </div>

                <div
                  className="rounded-xl p-4 relative overflow-hidden"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: '#E2E8F0', border: '1px solid' }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gold" />
                  <span className="text-xl">{'\u{1F525}'}</span>
                  <p className="text-white font-bold text-base mt-1">0</p>
                  <p className="text-text-secondary text-[10px] uppercase tracking-wider font-semibold">Streak</p>
                </div>
              </div>
            )}

            {/* Profile Completion */}
            {showDetails && (
              <div
                className="animate-fade-in inline-flex items-center gap-2 mb-8"
                style={{ animationDelay: '450ms' }}
              >
                <div
                  className="rounded-xl px-5 py-3 flex items-center gap-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: '#E2E8F0', border: '1px solid' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">Profile Complete</p>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-success"
                          style={{ width: '100%', transition: 'width 1s ease-out' }}
                        />
                      </div>
                      <span className="text-success text-xs font-bold">100%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Go to Dashboard Button */}
            <div className="animate-fade-in-up" style={{ animationDelay: showDetails ? '600ms' : '400ms' }}>
              <Button
                onClick={onGoToDashboard}
                className="btn-press bg-white text-navy font-semibold h-13 px-10 rounded-xl shadow-lg hover:bg-white/90 transition-colors duration-200 text-base"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Go to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
