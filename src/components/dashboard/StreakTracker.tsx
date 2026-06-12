'use client';

import React from 'react';
import { Flame } from 'lucide-react';

interface StreakTrackerProps {
  streakDays: number;
}

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * StreakTracker
 *
 * Design rules:
 * - Card style: white bg, 1px border, 12px radius, subtle shadow
 * - NO continuous animation on flame icon (pulsing is forbidden)
 * - Simple CSS fade-in animation
 * - Streak dots: solid orange (no gradient), no ring animation
 * - 4px spacing grid
 */
export function StreakTracker({ streakDays }: StreakTrackerProps) {
  const today = new Date().getDay(); // 0=Sun, 1=Mon, ...
  const adjustedToday = today === 0 ? 6 : today - 1; // 0=Mon, 6=Sun

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (adjustedToday - 6 + i + 7) % 7;
    const isActive = i >= 7 - streakDays && i <= 6;
    const isToday = i === 6;
    return {
      label: dayLabels[dayIndex],
      isActive,
      isToday,
    };
  });

  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm animate-fade-in" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold font-heading text-foreground">
          Streak Tracker
        </h3>
        <div className="flex items-center gap-1.5">
          {/* Static flame — NO pulsing animation */}
          <Flame className="w-5 h-5" style={{ color: '#F97316' }} />
          <span className="text-lg font-bold font-heading text-foreground">
            {streakDays}
          </span>
          <span className="text-xs text-text-secondary">days</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-1.5">
        {last7Days.map((day, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="text-[10px] text-text-secondary font-medium">
              {day.label}
            </span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                day.isToday ? 'ring-2 ring-electric ring-offset-2' : ''
              }`}
              style={{
                backgroundColor: day.isActive ? '#F97316' : 'transparent',
                border: day.isActive ? 'none' : '1px solid #E2E8F0',
                ringOffsetColor: '#FFFFFF',
              }}
            >
              {day.isActive && (
                <Flame className="w-3.5 h-3.5 text-white" />
              )}
            </div>
          </div>
        ))}
      </div>

      {streakDays > 0 ? (
        <p className="text-xs text-center mt-3 text-text-secondary">
          {streakDays >= 7
            ? 'On fire! Keep the streak going!'
            : streakDays >= 3
            ? 'Great momentum! Keep it up!'
            : 'Nice start! Stay consistent!'}
        </p>
      ) : (
        <p className="text-xs text-center mt-3 text-text-secondary">
          Start your streak by completing a task today!
        </p>
      )}
    </div>
  );
}
