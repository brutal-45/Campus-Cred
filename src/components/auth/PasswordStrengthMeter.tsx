'use client';

import React, { useMemo } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
}

interface StrengthResult {
  score: number;
  label: string;
  color: string;
  textColor: string;
  checks: {
    label: string;
    passed: boolean;
  }[];
}

function analyzePassword(password: string): StrengthResult {
  const checks = [
    { label: '8+ characters', passed: password.length >= 8 },
    { label: 'Uppercase (A-Z)', passed: /[A-Z]/.test(password) },
    { label: 'Lowercase (a-z)', passed: /[a-z]/.test(password) },
    { label: 'Number (0-9)', passed: /\d/.test(password) },
    { label: 'Special (!@#$...)', passed: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password) },
  ];

  const passedCount = checks.filter((c) => c.passed).length;

  let score: number;
  let label: string;
  let color: string;
  let textColor: string;

  if (password.length === 0) {
    score = 0;
    label = '';
    color = '';
    textColor = '';
  } else if (passedCount <= 1) {
    score = 1;
    label = 'Weak';
    color = 'bg-red-500';
    textColor = 'text-red-400';
  } else if (passedCount <= 2) {
    score = 2;
    label = 'Fair';
    color = 'bg-orange-500';
    textColor = 'text-orange-400';
  } else if (passedCount <= 3) {
    score = 3;
    label = 'Strong';
    color = 'bg-blue-500';
    textColor = 'text-blue-400';
  } else {
    score = 4;
    label = 'Very Strong';
    color = 'bg-green-500';
    textColor = 'text-green-400';
  }

  return { score, label, color, textColor, checks };
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => analyzePassword(password), [password]);

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2 animate-fade-in">
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Password Strength</span>
          <span
            key={strength.label}
            className={`text-xs font-semibold ${strength.textColor}`}
          >
            {strength.label}
          </span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="h-1.5 flex-1 rounded-full overflow-hidden bg-[#E2E8F0]"
            >
              {strength.score >= level && (
                <div
                  className={`h-full rounded-full ${strength.color} animate-fade-in`}
                  style={{ animationDelay: `${(level - 1) * 100}ms` }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Requirement Checks */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {strength.checks.map((check) => (
          <div
            key={check.label}
            className="flex items-center gap-1.5"
          >
            <div
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors duration-200 ${
                check.passed
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-[#F1F5F9] text-[#CBD5E1]'
              }`}
            >
              {check.passed ? (
                <svg
                  className="w-2.5 h-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <div className="w-1 h-1 rounded-full bg-current" />
              )}
            </div>
            <span
              className={`text-[11px] transition-colors duration-200 ${
                check.passed ? 'text-navy/60' : 'text-text-secondary'
              }`}
            >
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
