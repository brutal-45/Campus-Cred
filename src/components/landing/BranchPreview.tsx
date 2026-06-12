'use client';

import React, { useState } from 'react';
import { ChevronDown, BookOpen, Cpu, Briefcase, Monitor, FlaskConical, Scale, Stethoscope, Pill, HardHat, Palette, PenTool } from 'lucide-react';
import { DEGREES, DEGREE_BRANCH_MAP } from '@/lib/constants';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';

/** Map each degree to a distinctive icon */
const DEGREE_ICONS: Record<string, React.ReactNode> = {
  'B.Tech': <Cpu className="h-5 w-5 text-navy" />,
  'B.E': <Cpu className="h-5 w-5 text-navy" />,
  'BBA': <Briefcase className="h-5 w-5 text-navy" />,
  'BCA': <Monitor className="h-5 w-5 text-navy" />,
  'B.Sc': <FlaskConical className="h-5 w-5 text-navy" />,
  'B.Com': <Briefcase className="h-5 w-5 text-navy" />,
  'BA': <PenTool className="h-5 w-5 text-navy" />,
  'MBA': <Briefcase className="h-5 w-5 text-navy" />,
  'MCA': <Monitor className="h-5 w-5 text-navy" />,
  'M.Sc': <FlaskConical className="h-5 w-5 text-navy" />,
  'M.Com': <Briefcase className="h-5 w-5 text-navy" />,
  'MA': <PenTool className="h-5 w-5 text-navy" />,
  'Diploma': <HardHat className="h-5 w-5 text-navy" />,
  'LLB': <Scale className="h-5 w-5 text-navy" />,
  'MBBS': <Stethoscope className="h-5 w-5 text-navy" />,
  'B.Pharm': <Pill className="h-5 w-5 text-navy" />,
  'B.Arch': <HardHat className="h-5 w-5 text-navy" />,
  'BFA': <Palette className="h-5 w-5 text-navy" />,
  'B.Des': <Palette className="h-5 w-5 text-navy" />,
};

/**
 * BranchPreview
 *
 * Design rules:
 * - Section background: #F8FAFC (section-gray)
 * - Cards use cc-card style
 * - Expand/collapse: simple height transition (no fancy motion)
 * - Feature icons: light navy bg (#0A0F2C at 8%)
 * - Simple fade-in animation only (300ms)
 * - 4px spacing grid
 */
export function BranchPreview() {
  const { navigate, isDarkMode } = useAppStore();
  const [expandedDegree, setExpandedDegree] = useState<string | null>(null);

  const toggleExpand = (degree: string) => {
    setExpandedDegree(prev => (prev === degree ? null : degree));
  };

  return (
    <section className="section-gray py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center animate-fade-in">
          <div className="flex justify-center mb-4">
            <CampusCredLogo size={44} variant={isDarkMode ? 'white' : 'dark'} />
          </div>
          <h2 className="mb-4 font-heading text-3xl font-semibold text-navy dark:text-white sm:text-4xl">
            Every Degree. Every Branch.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-text-secondary dark:text-white/60">
            We cover all major degrees and branches across Indian colleges
          </p>
        </div>

        {/* Degree Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {DEGREES.map((degree, index) => {
            const branches = DEGREE_BRANCH_MAP[degree] || [];
            const isExpanded = expandedDegree === degree;

            return (
              <div
                key={degree}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div
                  onClick={() => toggleExpand(degree)}
                  className={cn(
                    'cc-card cursor-pointer',
                    isExpanded && 'ring-2 ring-electric/30'
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="feature-icon-bg flex h-10 w-10 items-center justify-center rounded-xl">
                        {DEGREE_ICONS[degree] || <BookOpen className="h-5 w-5 text-navy" />}
                      </div>
                      <div>
                        <h3 className="font-heading text-base font-semibold text-navy dark:text-white">
                          {degree}
                        </h3>
                        <p className="text-sm text-text-secondary dark:text-white/60">
                          {branches.length} {branches.length === 1 ? 'branch' : 'branches'}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-text-secondary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>

                  {/* Branch List - Expanded */}
                  {isExpanded && (
                    <div className="mt-4 border-t pt-4" style={{ borderColor: '#E2E8F0' }}>
                      <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                        {branches.map((branch) => (
                          <li
                            key={branch}
                            className="flex items-center gap-2 text-sm text-text-secondary"
                          >
                            <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: 'rgba(10,15,44,0.30)' }} />
                            {branch}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('onboarding');
                        }}
                        className="btn-primary mt-4 w-full py-2 text-center text-sm"
                      >
                        Start with {degree}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
