'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Award, Shield, GraduationCap, QrCode, Star } from 'lucide-react';
import { CertificateSVG } from './CertificateSVG';

interface LiveCertificatePreviewProps {
  studentName: string;
  degree?: string;
  branch?: string;
  college?: string;
  city?: string;
  taskTitle?: string;
  skills?: string[];
  profilePhotoUrl?: string | null;
  level?: string;
  /** Show below form on mobile, right side on desktop */
  collapsible?: boolean;
}

const LEVEL_COLORS: Record<string, string> = {
  Starter: '#10B981',
  Achiever: '#3B82F6',
  Expert: '#F59E0B',
  Pro: '#7C3AED',
  Legend: '#D4AF37',
};

/**
 * Live certificate preview that updates in real-time as the student
 * fills in their details during onboarding.
 *
 * Uses the official CampusCred certificate SVG template adapted
 * per student level category.
 */
export function LiveCertificatePreview({
  studentName,
  degree,
  branch,
  college,
  city,
  taskTitle = 'Sample Task Title',
  skills = [],
  profilePhotoUrl,
  level = 'Starter',
  collapsible = false,
}: LiveCertificatePreviewProps) {
  const [displayName, setDisplayName] = useState(studentName);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced name update (100ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDisplayName(studentName);
    }, 100);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [studentName]);

  const levelColor = LEVEL_COLORS[level] || LEVEL_COLORS.Starter;

  if (collapsible && isCollapsed) {
    return (
      <button
        onClick={() => setIsCollapsed(false)}
        className="w-full p-3 flex items-center justify-between text-sm text-gold hover:bg-gold/5 transition-colors"
        style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid #E2E8F0', borderRadius: '12px' }}
      >
        <span className="flex items-center gap-2">
          <Award className="w-4 h-4" />
          Preview Certificate
        </span>
        <span className="text-white/40 text-xs">Click to expand</span>
      </button>
    );
  }

  return (
    <div className={collapsible ? 'space-y-2' : ''}>
      {collapsible && (
        <button
          onClick={() => setIsCollapsed(true)}
          className="w-full text-right text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          Collapse
        </button>
      )}

      {/* Label */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{'\u2728'}</span>
        <span className="text-xs font-medium text-gold">Your Certificate Preview</span>
      </div>

      {/* Preview Card with the new CertificateSVG */}
      <div
        className="animate-fade-in relative rounded-lg overflow-hidden border shadow-xl"
        style={{
          borderColor: '#E2E8F0',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2), 0 0 30px rgba(212,175,55,0.1)',
        }}
      >
        {/* The certificate SVG - scales to fit the preview container */}
        <div className="bg-white">
          <div key={`${displayName}-${degree}-${branch}-${level}`}>
            <CertificateSVG
              studentName={displayName || 'Your Name'}
              degree={degree}
              branch={branch}
              college={college}
              city={city}
              taskTitle={taskTitle}
              skills={skills}
              level={level as any}
              showAvatar={true}
              showVerifiedBadge={true}
              className="w-full h-auto"
              scale={0.35}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
