'use client';

import React from 'react';
import { GraduationCap, Code, Award } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '@/lib/constants';

const iconMap: Record<string, React.ReactNode> = {
  'graduation-cap': <GraduationCap className="h-7 w-7 text-navy" />,
  'code': <Code className="h-7 w-7 text-navy" />,
  'award': <Award className="h-7 w-7 text-navy" />,
};

/**
 * HowItWorks
 *
 * Design rules:
 * - Section background: white (section-white)
 * - Cards use cc-card style (white, 1px border, 12px radius, subtle shadow)
 * - Feature icons: light navy bg (#0A0F2C at 8%) — NOT colorful
 * - Simple fade-in animation only (300ms)
 * - No auto-play, no fancy transitions
 * - 4px spacing grid
 */
export function HowItWorks() {
  return (
    <section className="section-white py-12 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center animate-fade-in">
          <h2 className="mb-4 text-[32px] leading-[40px] font-semibold text-navy dark:text-white font-heading sm:text-[32px] sm:leading-[40px]">
            How CampusCred Works
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-text-secondary dark:text-white/60">
            Three simple steps to launch your career with real-world experience
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid gap-8 md:grid-cols-3 md:gap-6">
          {/* Connecting dotted line - only visible on md+ */}
          <div className="pointer-events-none absolute top-20 left-[16.5%] right-[16.5%] hidden h-0.5 md:block">
            <div className="h-full w-full border-t-2 border-dashed" style={{ borderColor: 'rgba(10,15,44,0.20)' }} />
          </div>

          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div
              key={step.step}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="cc-card relative flex flex-col items-center text-center">
                {/* Step number badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                    {step.step}
                  </span>
                </div>

                {/* Icon in light background */}
                <div className="feature-icon-bg mb-5 mt-3 flex h-16 w-16 items-center justify-center rounded-2xl">
                  {iconMap[step.icon]}
                </div>

                {/* Title */}
                <h3 className="mb-3 text-base font-semibold text-navy dark:text-white font-heading">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-text-secondary dark:text-white/60">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
