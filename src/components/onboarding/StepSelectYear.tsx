'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ArrowRight,
  Rocket,
  Check,
  BookOpen,
  BookMarked,
  Brain,
  Crown,
} from 'lucide-react';

const YEAR_CONFIG = [
  { label: '1st Year', icon: BookOpen, color: 'bg-emerald-500', borderActive: 'border-emerald-400', ringActive: 'ring-emerald-400/30', textActive: 'text-emerald-400' },
  { label: '2nd Year', icon: BookMarked, color: 'bg-blue-500', borderActive: 'border-blue-400', ringActive: 'ring-blue-400/30', textActive: 'text-blue-400' },
  { label: '3rd Year', icon: Brain, color: 'bg-purple-500', borderActive: 'border-purple-400', ringActive: 'ring-purple-400/30', textActive: 'text-purple-400' },
  { label: '4th Year', icon: Rocket, color: 'bg-orange-500', borderActive: 'border-orange-400', ringActive: 'ring-orange-400/30', textActive: 'text-orange-400' },
  { label: '5th Year', icon: Crown, color: 'bg-amber-500', borderActive: 'border-amber-400', ringActive: 'ring-amber-400/30', textActive: 'text-amber-400' },
];

interface StepSelectYearProps {
  selectedYear: string;
  selectedDegree: string;
  onUpdate: (year: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepSelectYear({
  selectedYear,
  selectedDegree,
  onUpdate,
  onNext,
  onPrev,
}: StepSelectYearProps) {
  const [localSelected, setLocalSelected] = useState(selectedYear);

  useEffect(() => {
    setLocalSelected(selectedYear);
  }, [selectedYear]);

  // Medical and architecture have 5th year
  const showFifthYear = ['MBBS', 'B.Arch', 'B.Pharm'].includes(selectedDegree);
  const availableYears = showFifthYear ? YEAR_CONFIG : YEAR_CONFIG.slice(0, 4);

  const handleSelect = (year: string) => {
    setLocalSelected(year);
    onUpdate(year);
  };

  return (
    <div
      className="animate-fade-in-up w-full max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <div
          className="animate-fade-in w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30"
          style={{ animationDelay: '100ms' }}
        >
          <Rocket className="h-8 w-8 text-white" />
        </div>
        <h2
          className="animate-fade-in text-3xl font-bold text-white font-[family-name:var(--font-poppins)]"
          style={{ animationDelay: '150ms' }}
        >
          Which year are you in?
        </h2>
        <p
          className="animate-fade-in text-text-secondary mt-2 text-sm"
          style={{ animationDelay: '200ms' }}
        >
          We&apos;ll tailor tasks and internships to your experience level
        </p>
      </div>

      {/* Pill-style Year Selector */}
      <div
        className="animate-fade-in-up flex flex-wrap justify-center gap-3 mb-8"
        style={{ animationDelay: '300ms' }}
      >
        {availableYears.map((yearConfig, index) => {
          const isSelected = localSelected === yearConfig.label;
          const Icon = yearConfig.icon;

          return (
            <button
              key={yearConfig.label}
              onClick={() => handleSelect(yearConfig.label)}
              className={`animate-fade-in relative group flex items-center gap-2.5 px-6 py-3.5 rounded-full border-2 transition-all duration-300 btn-press ${
                isSelected
                  ? `${yearConfig.borderActive} bg-white/10 shadow-lg ring-2 ${yearConfig.ringActive}`
                  : 'border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/8'
              }`}
              style={{ animationDelay: `${300 + index * 80}ms` }}
            >
              <Icon className={`w-5 h-5 transition-colors duration-300 ${
                isSelected ? yearConfig.textActive : 'text-white/40 group-hover:text-white/70'
              }`} />
              <span className={`font-semibold text-sm transition-colors duration-300 ${
                isSelected ? 'text-white' : 'text-white/60 group-hover:text-white/90'
              }`}>
                {yearConfig.label}
              </span>
              {isSelected && (
                <div className={`ml-1 w-5 h-5 rounded-full ${yearConfig.color} flex items-center justify-center`}>
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Visual indicator for selected year */}
      {localSelected && (
        <div
          className="animate-fade-in p-6 mb-6 text-center rounded-xl shadow-sm"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: '#E2E8F0', border: '1px solid' }}
        >
          {(() => {
            const config = YEAR_CONFIG.find(y => y.label === localSelected);
            if (!config) return null;
            const Icon = config.icon;
            return (
              <div className="flex items-center justify-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${config.color}/20 flex items-center justify-center ${config.textActive}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold">{localSelected} of {selectedDegree}</p>
                  <p className="text-white/50 text-xs mt-0.5">Tasks will be matched to your level</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Navigation */}
      <div
        className="animate-fade-in-up flex items-center justify-between mt-4"
        style={{ animationDelay: '500ms' }}
      >
        <Button
          type="button"
          variant="ghost"
          onClick={onPrev}
          className="text-blue-200/60 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          disabled={!localSelected}
          onClick={onNext}
          className="btn-press bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 h-11 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Complete Setup
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
