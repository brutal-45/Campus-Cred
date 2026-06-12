'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Monitor, Briefcase, GraduationCap, FlaskConical, Calculator,
  BookOpen, TrendingUp, Server, Wrench, Scale, HeartPulse,
  Palette, Search, ArrowLeft, Check, Cpu, Building2, Pill,
  Ruler, Paintbrush, PenTool, Landmark,
} from 'lucide-react';
import { DEGREES, DEGREE_BRANCH_MAP } from '@/lib/constants';

const DEGREE_ICONS: Record<string, React.ReactNode> = {
  'B.Tech': <Monitor className="h-6 w-6" />,
  'B.E': <Cpu className="h-6 w-6" />,
  'BBA': <Briefcase className="h-6 w-6" />,
  'BCA': <Server className="h-6 w-6" />,
  'B.Sc': <FlaskConical className="h-6 w-6" />,
  'B.Com': <Calculator className="h-6 w-6" />,
  'BA': <BookOpen className="h-6 w-6" />,
  'MBA': <TrendingUp className="h-6 w-6" />,
  'MCA': <GraduationCap className="h-6 w-6" />,
  'M.Sc': <FlaskConical className="h-6 w-6" />,
  'M.Com': <Calculator className="h-6 w-6" />,
  'MA': <BookOpen className="h-6 w-6" />,
  'Diploma': <Wrench className="h-6 w-6" />,
  'LLB': <Scale className="h-6 w-6" />,
  'MBBS': <HeartPulse className="h-6 w-6" />,
  'B.Pharm': <Pill className="h-6 w-6" />,
  'B.Arch': <Ruler className="h-6 w-6" />,
  'BFA': <Paintbrush className="h-6 w-6" />,
  'B.Des': <PenTool className="h-6 w-6" />,
};

const DEGREE_COLORS: Record<string, string> = {
  'B.Tech': 'from-blue-500/20 to-blue-600/20',
  'B.E': 'from-blue-400/20 to-cyan-600/20',
  'BBA': 'from-emerald-500/20 to-emerald-600/20',
  'BCA': 'from-cyan-500/20 to-cyan-600/20',
  'B.Sc': 'from-purple-500/20 to-purple-600/20',
  'B.Com': 'from-orange-500/20 to-orange-600/20',
  'BA': 'from-pink-500/20 to-pink-600/20',
  'MBA': 'from-amber-500/20 to-amber-600/20',
  'MCA': 'from-indigo-500/20 to-indigo-600/20',
  'M.Sc': 'from-violet-500/20 to-violet-600/20',
  'M.Com': 'from-orange-400/20 to-orange-500/20',
  'MA': 'from-rose-500/20 to-rose-600/20',
  'Diploma': 'from-gray-500/20 to-gray-600/20',
  'LLB': 'from-yellow-500/20 to-yellow-600/20',
  'MBBS': 'from-red-500/20 to-red-600/20',
  'B.Pharm': 'from-teal-500/20 to-teal-600/20',
  'B.Arch': 'from-stone-500/20 to-stone-600/20',
  'BFA': 'from-fuchsia-500/20 to-fuchsia-600/20',
  'B.Des': 'from-lime-500/20 to-lime-600/20',
};

interface StepSelectDegreeProps {
  selectedDegree: string;
  onUpdate: (degree: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepSelectDegree({
  selectedDegree,
  onUpdate,
  onNext,
  onPrev,
}: StepSelectDegreeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localSelected, setLocalSelected] = useState(selectedDegree);

  const filteredDegrees = DEGREES.filter((degree) =>
    degree.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (degree: string) => {
    setLocalSelected(degree);
    onUpdate(degree);
    setTimeout(() => {
      onNext();
    }, 400);
  };

  useEffect(() => {
    setLocalSelected(selectedDegree);
  }, [selectedDegree]);

  return (
    <div
      className="animate-fade-in-up w-full max-w-3xl mx-auto"
    >
      <div className="text-center mb-6">
        <div
          className="animate-fade-in w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30"
          style={{ animationDelay: '100ms' }}
        >
          <GraduationCap className="h-8 w-8 text-white" />
        </div>
        <h2
          className="animate-fade-in text-3xl font-bold text-white font-[family-name:var(--font-poppins)]"
          style={{ animationDelay: '150ms' }}
        >
          Select your degree
        </h2>
        <p
          className="animate-fade-in text-text-secondary mt-2 text-sm"
          style={{ animationDelay: '200ms' }}
        >
          Choose the degree you are currently pursuing
        </p>
      </div>

      {/* Search */}
      <div
        className="animate-fade-in-up mb-6"
        style={{ animationDelay: '250ms' }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300/50" />
          <Input
            placeholder="Search degrees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-300/30 focus:border-electric/50 focus:ring-electric/20 h-11"
          />
        </div>
      </div>

      {/* Degree Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredDegrees.map((degree, index) => {
          const isSelected = localSelected === degree;
          const branchCount = DEGREE_BRANCH_MAP[degree]?.length || 0;
          const colorClass = DEGREE_COLORS[degree] || 'from-blue-500/20 to-blue-600/20';

          return (
            <button
              key={degree}
              onClick={() => handleSelect(degree)}
              className={`animate-fade-in card-hover relative group p-4 rounded-xl border-2 transition-all duration-300 text-left btn-press ${
                isSelected
                  ? 'border-electric bg-electric/10 shadow-lg shadow-electric/20'
                  : 'border-white/10 bg-white/5 hover:border-electric/30 hover:bg-white/8'
              }`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </div>
              )}

              {/* Icon with background */}
              <div
                className={`mb-3 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} transition-colors duration-300 ${
                  isSelected ? 'text-electric' : 'text-blue-200/60 group-hover:text-blue-200/90'
                }`}
              >
                {DEGREE_ICONS[degree] || <GraduationCap className="h-6 w-6" />}
              </div>

              <p
                className={`font-semibold text-sm leading-tight transition-colors duration-300 ${
                  isSelected ? 'text-white' : 'text-blue-100/80 group-hover:text-white'
                }`}
              >
                {degree}
              </p>

              <Badge
                variant="secondary"
                className={`mt-2 text-[10px] px-1.5 py-0 h-5 ${
                  isSelected
                    ? 'bg-electric/20 text-electric-light border-0'
                    : 'bg-white/5 text-blue-200/40 border-0'
                }`}
              >
                {branchCount} {branchCount === 1 ? 'branch' : 'branches'}
              </Badge>
            </button>
          );
        })}
      </div>

      {filteredDegrees.length === 0 && (
        <div className="animate-fade-in text-center py-12">
          <p className="text-blue-200/40 text-sm">
            No degrees found matching &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {/* Navigation */}
      <div
        className="animate-fade-in-up flex items-center justify-between mt-6"
        style={{ animationDelay: '350ms' }}
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
        {localSelected && (
          <Button
            type="button"
            onClick={onNext}
            className="btn-press bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 h-11 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all duration-300"
          >
            Continue with {localSelected}
          </Button>
        )}
      </div>
    </div>
  );
}
