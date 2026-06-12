'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * TestimonialsCarousel
 *
 * Design rules:
 * - Section background: #F8FAFC (section-gray)
 * - Card uses cc-card style
 * - Manual navigation only — NO auto-play
 * - Simple fade transition between testimonials (no sliding)
 * - Navigation dots: solid electric blue for active
 * - 4px spacing grid
 */
export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section className="section-gray py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 text-center animate-fade-in">
          <h2 className="mb-4 font-heading text-3xl font-semibold text-navy dark:text-white sm:text-4xl md:text-5xl">
            What Students Say
          </h2>
          <p className="mx-auto mt-4 max-w-md text-text-secondary dark:text-white/60">
            Hear from students who transformed their careers with CampusCred
          </p>
        </div>

        {/* Carousel — simple fade, no sliding */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={goToPrev}
            className="absolute -left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white dark:bg-navy-lighter shadow-md transition-colors hover:bg-muted sm:-left-6"
            style={{ borderColor: 'rgba(226,232,240,0.50)' }}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5 text-navy dark:text-white" />
          </button>

          <button
            onClick={goToNext}
            className="absolute -right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-white dark:bg-navy-lighter shadow-md transition-colors hover:bg-muted sm:-right-6"
            style={{ borderColor: 'rgba(226,232,240,0.50)' }}
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5 text-navy dark:text-white" />
          </button>

          {/* Testimonial Card — simple fade transition */}
          <div className="min-h-[320px]" key={currentIndex}>
            <div className="cc-card text-center animate-fade-in">
              {/* Simple quote mark */}
              <div className="mb-6 font-serif text-5xl leading-none select-none" style={{ color: '#94A3B8' }}>
                &ldquo;
              </div>

              {/* Quote text — Inter Regular, not bold */}
              <p className="mx-auto mb-6 max-w-lg text-base leading-relaxed font-normal sm:text-lg dark:text-white/80" style={{ color: 'var(--foreground)' }}>
                {current.quote}
              </p>

              {/* Avatar */}
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                {current.avatar}
              </div>

              {/* Name and Details */}
              <h4 className="font-heading text-lg font-semibold text-navy dark:text-white">
                {current.name}
              </h4>
              <p className="text-sm text-text-secondary dark:text-white/60">
                {current.college} &middot; {current.branch}
              </p>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'h-2.5 rounded-full transition-all duration-200',
                  index === currentIndex
                    ? 'w-8 bg-electric'
                    : 'w-2.5 hover:bg-electric/40'
                )}
                style={index !== currentIndex ? { backgroundColor: 'var(--border)' } : undefined}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
