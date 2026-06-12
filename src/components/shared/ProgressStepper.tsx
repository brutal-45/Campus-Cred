'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  icon?: React.ReactNode;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
}

export function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="flex w-full items-center justify-center gap-0">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        const stepBgColor = isCompleted
          ? '#10B981'
          : isCurrent
            ? '#3B82F6'
            : 'transparent';

        const stepBorderColor = isCompleted
          ? '#10B981'
          : isCurrent
            ? '#3B82F6'
            : '#64748B';

        const labelColor = isCompleted
          ? '#10B981'
          : isCurrent
            ? '#3B82F6'
            : '#64748B';

        return (
          <React.Fragment key={index}>
            {/* Step Circle */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                  isCurrent && 'animate-pulse-glow'
                )}
                style={{
                  backgroundColor: stepBgColor,
                  borderColor: stepBorderColor,
                  transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 300ms ease-in-out',
                }}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 text-white" strokeWidth={3} />
                ) : step.icon ? (
                  <div
                    className={cn(
                      isCurrent ? 'text-white' : isPending ? 'text-text-secondary' : 'text-white'
                    )}
                  >
                    {step.icon}
                  </div>
                ) : (
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      isCurrent ? 'text-white' : isPending ? 'text-text-secondary' : 'text-white'
                    )}
                  >
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={cn(
                  'text-xs font-medium text-center max-w-[80px] leading-tight',
                  isCurrent && 'font-semibold'
                )}
                style={{ color: labelColor }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="relative mx-1 mt-[-28px] h-[2px] w-8 flex-1 sm:w-12 md:w-16">
                <div className="absolute inset-0 rounded-full bg-text-secondary/30" />
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-success"
                  style={{
                    width: isCompleted ? '100%' : '0%',
                    transition: 'width 500ms ease-in-out',
                  }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
