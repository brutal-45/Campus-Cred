'use client';

import { useEffect, useRef, useState } from 'react';

interface StatsCounterProps {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

/**
 * StatsCounter
 *
 * Design rules:
 * - Counter animation is purposeful (showing data), not decorative
 * - Simple fade-in + count-up animation
 * - No floating, no bounce, no pulse effects
 * - Uses IntersectionObserver for triggering
 */
export function StatsCounter({ value, label, suffix = '', prefix = '', duration = 2000, className = '' }: StatsCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isVisible, value, duration]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-IN');
  };

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center gap-2 text-center animate-fade-in ${className}`}
    >
      <span className="text-3xl font-bold font-heading text-white sm:text-4xl md:text-5xl">
        {prefix}
        {formatNumber(displayValue)}
        {suffix}
      </span>
      <span className="text-sm text-white/70 md:text-base font-medium">
        {label}
      </span>
    </div>
  );
}
