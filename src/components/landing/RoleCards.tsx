'use client';

import React from 'react';
import { GraduationCap, Building2, Users, Landmark, ArrowRight } from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';
import { useAppStore } from '@/store';
import type { AppView } from '@/store';

const iconMap: Record<string, React.ReactNode> = {
  'graduation-cap': <GraduationCap className="h-8 w-8" />,
  'building': <Building2 className="h-8 w-8" />,
  'users': <Users className="h-8 w-8" />,
  'landmark': <Landmark className="h-8 w-8" />,
};

const roleViewMap: Record<string, AppView> = {
  student: 'onboarding',
  company: 'company-register',
  mentor: 'mentor-register',
  college: 'college-register',
};

/**
 * RoleCards
 *
 * Design rules:
 * - Section background: #F8FAFC (section-gray)
 * - Cards use cc-card style
 * - Feature icons: light navy bg (#0A0F2C at 8%)
 * - Simple fade-in animation only (300ms)
 * - Buttons: btn-primary only (navy bg, white text)
 * - 4px spacing grid
 */
export function RoleCards() {
  const { navigate } = useAppStore();

  return (
    <section className="section-gray py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center animate-fade-in">
          <h2 className="mb-4 font-heading text-3xl font-semibold text-navy dark:text-white sm:text-4xl md:text-5xl">
            Join CampusCred As
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-text-secondary dark:text-white/60">
            Whether you&apos;re a student, company, mentor, or college — there&apos;s a place for you
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {USER_ROLES.map((role, index) => (
            <div
              key={role.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="cc-card flex flex-col items-center text-center">
                {/* Icon with role color on feature-icon-bg */}
                <div
                  className="feature-icon-bg mb-5 flex h-16 w-16 items-center justify-center rounded-xl"
                  style={{ color: role.color }}
                >
                  {iconMap[role.icon]}
                </div>

                {/* Role Name */}
                <h3 className="mb-2 font-heading text-xl font-semibold text-navy dark:text-white">
                  {role.label}
                </h3>

                {/* Description */}
                <p className="mb-6 text-sm leading-relaxed text-text-secondary dark:text-white/60">
                  {role.description}
                </p>

                {/* Join Button */}
                <button
                  onClick={() => navigate(roleViewMap[role.id])}
                  className="btn-primary group mt-auto flex w-full items-center justify-center gap-2 text-sm"
                >
                  Join as {role.label}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
