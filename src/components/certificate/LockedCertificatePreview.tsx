'use client'; 

import React from 'react';
import { Lock, Award, Shield, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CertificateSVG } from './CertificateSVG';

interface LockedCertificatePreviewProps {
  studentName: string;
  degree?: string;
  branch?: string;
  taskTitle: string;
  level?: string;
  onUnlock?: () => void;
}

/**
 * Locked certificate preview shown on task pages for students
 * who have not yet submitted their work.
 * Shows a blurred CertificateSVG preview with a lock overlay.
 */
export function LockedCertificatePreview({
  studentName,
  degree,
  branch,
  taskTitle,
  level = 'Starter',
  onUnlock,
}: LockedCertificatePreviewProps) {
  return (
    <div className="relative group">
      {/* Blurred certificate preview */}
      <div
        className="rounded-xl overflow-hidden border transition-all duration-400"
        style={{
          borderColor: '#E2E8F0',
          filter: 'blur(8px) brightness(0.7)',
          transition: 'filter 400ms ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.filter = 'blur(4px) brightness(0.8)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.filter = 'blur(8px) brightness(0.7)';
        }}
      >
        {/* Certificate SVG (blurred) */}
        <div className="bg-white">
          <CertificateSVG
            studentName={studentName}
            degree={degree}
            branch={branch}
            taskTitle={taskTitle}
            level={level as any}
            showAvatar={true}
            showVerifiedBadge={true}
            className="w-full h-auto"
            scale={0.35}
          />
        </div>
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl"
        style={{
          background: 'rgba(10,15,44,0.5)',
          backdropFilter: 'blur(2px)',
        }}
      >
        <div className="animate-fade-in group-hover:scale-110 transition-transform duration-400">
          <Lock className="w-12 h-12 text-gold" />
        </div>

        <div className="animate-fade-in text-center space-y-3" style={{ animationDelay: '200ms' }}>
          <p className="text-sm font-medium text-white">
            Complete this task to earn your certificate
          </p>

          {onUnlock && (
            <Button
              onClick={onUnlock}
              className="btn-primary text-white hover:opacity-90 transition-opacity gap-2 text-sm"
            >
              <Award className="w-4 h-4" />
              Submit Task
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
