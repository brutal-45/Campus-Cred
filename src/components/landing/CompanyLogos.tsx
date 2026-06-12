'use client';

import React from 'react';
import Image from 'next/image';
import { SAMPLE_COMPANIES, COMPANY_LOGOS } from '@/lib/constants';

/**
 * CompanyLogos
 *
 * Design rules:
 * - Section background: #F8FAFC (section-gray)
 * - NO auto-scrolling marquees (forbidden: continuous rotation/animation)
 * - Static grid of company logos instead
 * - Logos: grayscale by default, full color on hover
 * - Simple fade-in animation only
 */
export function CompanyLogos() {
  return (
    <section className="section-gray py-16 sm:py-20">
      <div className="relative z-10">
        {/* Section Header */}
        <div className="mb-12 text-center animate-fade-in">
          <h2 className="mb-4 font-heading text-2xl font-bold text-navy dark:text-white sm:text-3xl md:text-4xl">
            Trusted by India&apos;s Top Companies
          </h2>

          <p className="mx-auto max-w-md text-sm text-text-secondary dark:text-white/60">
            Leading Indian companies post real tasks and hire through CampusCred
          </p>
        </div>

        {/* Static Grid — NO marquee animation */}
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5">
            {SAMPLE_COMPANIES.map((company) => (
              <div
                key={company}
                className="cc-card group flex h-16 items-center justify-center px-4"
              >
                <CompanyLogo name={company} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Renders a company logo from the SVG assets, with fallback to styled text */
function CompanyLogo({ name }: { name: string }) {
  const logoSrc = COMPANY_LOGOS[name];

  if (logoSrc) {
    return (
      <Image
        src={logoSrc}
        alt={`${name} logo`}
        width={120}
        height={36}
        className="h-9 w-auto object-contain opacity-60 grayscale transition-opacity duration-200 group-hover:opacity-100 group-hover:grayscale-0"
        priority={false}
      />
    );
  }

  // Fallback: styled text if no logo asset
  return (
    <span className="whitespace-nowrap text-sm font-semibold text-navy/70 dark:text-white/70 transition-opacity duration-200 group-hover:text-navy dark:group-hover:text-white">
      {name}
    </span>
  );
}
