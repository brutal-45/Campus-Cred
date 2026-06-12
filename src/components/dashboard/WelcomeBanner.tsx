'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LevelBadge } from './LevelBadge';
import { User } from '@/store';
import { Flame, Coins, ArrowRight, Sparkles, Target } from 'lucide-react';

interface WelcomeBannerProps {
  user: User;
  onBrowseTasks: () => void;
}

const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * WelcomeBanner
 *
 * Design rules:
 * - Solid navy background, no gradient, no dot grid
 * - Simple fade-in CSS animation (no framer-motion)
 * - 4px spacing grid
 * - No continuous animations
 */
export function WelcomeBanner({ user, onBrowseTasks }: WelcomeBannerProps) {
  // Calculate profile completion
  const profileFields = ['college', 'city', 'degree', 'branch', 'year', 'phone'];
  const filledFields = profileFields.filter((field) => {
    const value = user[field as keyof User];
    return value && String(value).trim() !== '';
  });
  const profileCompletion = Math.round((filledFields.length / profileFields.length) * 100);

  // Calculate streak display
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const isActive = i >= 7 - user.streakDays && i <= 6;
    const isToday = i === 6;
    return { label: dayLabels[i], isActive, isToday };
  });

  return (
    <div className="relative overflow-hidden rounded-2xl animate-fade-in">
      {/* Background — solid navy, no gradient */}
      <div className="absolute inset-0 bg-navy" />

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          {/* Left - Welcome info */}
          <div className="flex-1">
            <p className="text-white/70 text-sm mb-1">Welcome back,</p>
            <h1 className="text-2xl md:text-3xl font-bold font-heading text-white mb-3">
              {user.fullName}!
            </h1>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Level */}
              <LevelBadge level={user.level} points={user.points} compact />

              {/* Streak */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(249,115,22,0.20)', border: '1px solid rgba(249,115,22,0.30)' }}>
                <Flame className="w-4 h-4" style={{ color: '#FB923C' }} />
                <span className="text-sm font-semibold" style={{ color: '#FDBA74' }}>{user.streakDays} day streak</span>
              </div>

              {/* CampusCred Score */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)' }}>
                <Coins className="w-4 h-4" style={{ color: '#FACC15' }} />
                <span className="text-sm font-semibold text-white">{user.campusCredScore ?? user.points} / 1000</span>
              </div>
            </div>

            {/* Profile completion */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 max-w-[200px] h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.20)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${profileCompletion}%`, backgroundColor: 'rgba(255,255,255,0.80)' }}
                />
              </div>
              <span className="text-xs text-white/70">
                Profile {profileCompletion}% complete
              </span>
              {profileCompletion < 100 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0" style={{ backgroundColor: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.80)', borderColor: 'rgba(255,255,255,0.20)' }}>
                  Complete it
                </Badge>
              )}
            </div>

            {/* Quick action — btn-secondary style */}
            <Button
              onClick={onBrowseTasks}
              className="bg-white text-navy border-2 border-navy hover:bg-gray-100 font-semibold transition-colors duration-200 gap-2"
            >
              Browse Tasks
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Right - Streak & Quick Stats (hidden on mobile, shown on lg) */}
          <div className="hidden lg:block w-72">
            <div className="rounded-xl p-5" style={{ backgroundColor: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)' }}>
              {/* Mini streak tracker */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold font-heading text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: '#FACC15' }} />
                  Weekly Streak
                </h3>
                <div className="flex items-center gap-1.5">
                  {/* Static flame — NO continuous animation */}
                  <Flame className="w-5 h-5" style={{ color: '#FB923C' }} />
                  <span className="text-lg font-bold text-white">{user.streakDays}</span>
                  <span className="text-xs text-white/60">days</span>
                </div>
              </div>

              {/* 7-day dots — solid orange, no gradient */}
              <div className="flex items-end justify-between gap-2 mb-4">
                {last7Days.map((day, index) => (
                  <div key={index} className="flex flex-col items-center gap-1.5">
                    <span className="text-xs text-white/50 font-medium">{day.label}</span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        day.isToday ? 'ring-2 ring-white/40 ring-offset-2' : ''
                      } ${day.isActive ? '' : ''}`}
                      style={{
                        backgroundColor: day.isActive ? '#F97316' : 'rgba(255,255,255,0.10)',
                        border: day.isActive ? 'none' : '1px solid rgba(255,255,255,0.20)',
                        ringOffsetColor: '#0A0F2C',
                      }}
                    >
                      {day.isActive && (
                        <Flame className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Motivational text */}
              <p className="text-xs text-center text-white/60">
                {user.streakDays >= 7
                  ? 'On fire! Keep the streak going!'
                  : user.streakDays >= 3
                  ? 'Great momentum! Keep it up!'
                  : user.streakDays > 0
                  ? 'Nice start! Stay consistent!'
                  : 'Start your streak by completing a task today!'}
              </p>

              {/* Quick stats */}
              <div className="mt-4 pt-4 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target className="w-3.5 h-3.5" style={{ color: '#4ADE80' }} />
                  </div>
                  <p className="text-lg font-bold text-white">{user.campusCredScore ?? user.points}</p>
                  <p className="text-xs text-white/50">CampusCred Score</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Flame className="w-3.5 h-3.5" style={{ color: '#FB923C' }} />
                  </div>
                  <p className="text-lg font-bold text-white">{user.streakDays}</p>
                  <p className="text-xs text-white/50">Day Streak</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
