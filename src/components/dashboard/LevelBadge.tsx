'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { LEVEL_THRESHOLDS } from '@/lib/constants';
import { getLevelForScore } from '@/lib/score-service';

interface LevelBadgeProps {
  level: string;
  points: number;
  compact?: boolean;
  showScore?: boolean;
  campusCredScore?: number;
}

/**
 * LevelBadge
 *
 * Design rules:
 * - Card style: white bg, 1px border, 12px radius, subtle shadow
 * - Simple CSS fade-in animation (no framer-motion)
 * - No gradient backgrounds — emoji provides color
 * - Score text: solid, no gradient
 */
export function LevelBadge({ level, points, compact = false, showScore = false, campusCredScore }: LevelBadgeProps) {
  const score = campusCredScore ?? points;
  const levelInfo = getLevelForScore(score);
  const currentLevelIndex = LEVEL_THRESHOLDS.findIndex((l) => l.level === levelInfo.level);
  const currentThreshold = LEVEL_THRESHOLDS[currentLevelIndex];
  const nextThreshold = LEVEL_THRESHOLDS[currentLevelIndex + 1];

  const progressToNext = nextThreshold
    ? ((score - currentThreshold.minScore) / (nextThreshold.minScore - currentThreshold.minScore)) * 100
    : 100;

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${currentThreshold.bgClass}`}>
        <span className="text-sm">{currentThreshold.icon}</span>
        <span className="text-xs font-semibold font-heading">{levelInfo.level}</span>
        {showScore && (
          <span className="text-xs opacity-70 ml-1">{score}</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm animate-fade-in" style={{ borderColor: '#E2E8F0' }}>
      <div className="flex items-center gap-3 mb-3">
        {/* Solid bg, no gradient */}
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
          <span className="text-lg">{currentThreshold.icon}</span>
        </div>
        <div>
          <p className="text-sm text-text-secondary font-sans">CampusCred Level</p>
          <p className="text-lg font-bold font-heading flex items-center gap-2">
            {levelInfo.level}
            <span className="text-sm font-normal text-text-secondary">{levelInfo.icon}</span>
          </p>
        </div>
      </div>

      {/* Score display — solid text, no gradient */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold text-foreground">{score}</span>
        <span className="text-xs text-text-secondary">/ 1000</span>
      </div>

      {nextThreshold ? (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-text-secondary">
            <span>{currentThreshold.minScore} pts</span>
            <span>{nextThreshold.minScore} pts</span>
          </div>
          <Progress
            value={Math.min(Math.max(progressToNext, 0), 100)}
            className="h-2"
          />
          <p className="text-xs text-text-secondary text-center">
            {nextThreshold.minScore - score} pts to {nextThreshold.level} {nextThreshold.icon}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-text-secondary">
            <span>{score} pts</span>
            <span>Max Level!</span>
          </div>
          <Progress value={100} className="h-2" />
          <p className="text-xs text-emerald-500 text-center font-medium">
            You&apos;ve reached the highest level!
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * ScoreRing - Circular progress indicator for CampusCred Score
 * Simple version: solid electric blue stroke, no gradient, no continuous animation
 */
export function ScoreRing({ score, size = 120, showLabel = true }: { score: number; size?: number; showLabel?: boolean }) {
  const { level, icon } = getLevelForScore(score);
  const levelInfo = LEVEL_THRESHOLDS.find(l => l.level === level) || LEVEL_THRESHOLDS[0];
  const percentage = (score / 1000) * 100;
  const strokeWidth = size > 100 ? 8 : 6;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center animate-fade-in" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle — solid electric blue, no gradient */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg">{icon}</span>
        <span className="text-lg font-bold font-heading text-foreground">
          {score}
        </span>
      </div>
      {showLabel && (
        <div className="absolute -bottom-6 text-center">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${levelInfo.bgClass}`}>
            {level}
          </span>
        </div>
      )}
    </div>
  );
}
