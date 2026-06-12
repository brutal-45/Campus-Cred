'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ShareButtons } from './ShareButtons';
import { CertificateSVG } from './CertificateSVG';
import {
  ArrowLeft,
  Award,
  Shield,
  Calendar,
  Hash,
  GraduationCap,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Lock,
  Eye,
  BookOpen,
  MapPin,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';
import QRCode from 'qrcode';

interface CertificateData {
  id: string;
  certificateId: string;
  studentName: string;
  degree: string;
  branch: string;
  taskTitle: string;
  college: string | null;
  city: string | null;
  skills: string[];
  level: string;
  issuedDate: string;
  qrCodeUrl: string | null;
  pdfUrl: string | null;
  certificateImageUrl: string | null;
  thumbnailUrl: string | null;
  hash: string | null;
  isValid: boolean;
  student: {
    id: string;
    fullName: string;
    degree: string;
    branch: string;
    college: string | null;
    city: string | null;
    profilePhoto: string | null;
    level: string;
  };
  task: {
    id: string;
    title: string;
    degree: string;
    branch: string;
    difficulty: string;
    points: number;
    category: string | null;
  };
}

// Level configuration with colors and icons
const LEVEL_CONFIG: Record<string, { color: string; bg: string; icon: string; glow: string }> = {
  Starter:  { color: '#10B981', bg: 'rgba(16,185,129,0.1)',  icon: '🌱', glow: '0 0 20px rgba(16,185,129,0.3)' },
  Achiever: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  icon: '⚡', glow: '0 0 20px rgba(59,130,246,0.3)' },
  Expert:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  icon: '🔥', glow: '0 0 20px rgba(245,158,11,0.3)' },
  Elite:    { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)',  icon: '💎', glow: '0 0 20px rgba(124,58,237,0.3)' },
  Legend:   { color: '#D4AF37', bg: 'rgba(212,175,55,0.1)',  icon: '👑', glow: '0 0 30px rgba(212,175,55,0.4)' },
};

export function CertificatePage() {
  const { selectedCertificateId, token, goBack } = useAppStore();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['certificate', selectedCertificateId],
    queryFn: async () => {
      if (!selectedCertificateId) return null;
      const res = await fetch(`/api/certificates/${selectedCertificateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch certificate');
      return res.json();
    },
    enabled: !!selectedCertificateId && !!token,
  });

  const certificate: CertificateData | null = data?.certificate || null;
  const levelConfig = LEVEL_CONFIG[certificate?.level || 'Starter'] || LEVEL_CONFIG.Starter;

  // Generate QR code
  useEffect(() => {
    if (certificate?.certificateId) {
      const verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?verify=${certificate.certificateId}`;
      QRCode.toDataURL(verificationUrl, {
        width: 140,
        margin: 1,
        color: { dark: '#0A0F2C', light: '#FFFFFF' },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => console.error('QR generation failed'));
    }
  }, [certificate?.certificateId]);

  // Zoom controls
  const handleZoomIn = useCallback(() => setZoom(z => Math.min(z + 0.25, 3)), []);
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(z - 0.25, 0.5)), []);
  const handleZoomReset = useCallback(() => setZoom(1), []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!certificate) return;

    try {
      toast.loading('Generating PDF download...');

      // If server-generated PDF exists, download it directly
      if (certificate.pdfUrl) {
        const link = document.createElement('a');
        link.href = certificate.pdfUrl;
        link.download = `${certificate.certificateId}.pdf`;
        link.click();
        toast.dismiss();
        toast.success('Certificate PDF downloaded!');
        return;
      }

      // Fallback: generate from HTML using html2canvas + jsPDF
      if (certificateRef.current) {
        const html2canvasModule = await import('html2canvas');
        const html2canvasFn = html2canvasModule.default;

        const canvas = await html2canvasFn(certificateRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#FFFFFF',
        });

        try {
          const jspdfModule = await import('jspdf');
          const jsPDF = jspdfModule.jsPDF;
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width / 2, canvas.height / 2],
          });
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
          pdf.save(`${certificate.certificateId}.pdf`);
          toast.dismiss();
          toast.success('Certificate PDF downloaded!');
        } catch {
          // Fallback to PNG download
          const link = document.createElement('a');
          link.download = `${certificate.certificateId}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          toast.dismiss();
          toast.success('Certificate image downloaded!');
        }
      }
    } catch {
      toast.dismiss();
      toast.error('Failed to download certificate. Please try again.');
    }
  };

  // Download PNG
  const handleDownloadPNG = async () => {
    if (!certificate) return;

    // If server-generated image exists, download it directly
    if (certificate.certificateImageUrl) {
      const link = document.createElement('a');
      link.href = certificate.certificateImageUrl;
      link.download = `${certificate.certificateId}.png`;
      link.click();
      toast.success('Certificate PNG downloaded!');
      return;
    }

    // Fallback
    if (certificateRef.current) {
      try {
        const html2canvasModule = await import('html2canvas');
        const html2canvasFn = html2canvasModule.default;
        const canvas = await html2canvasFn(certificateRef.current, {
          scale: 3,
          useCORS: true,
          backgroundColor: '#FFFFFF',
        });
        const link = document.createElement('a');
        link.download = `${certificate.certificateId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('Certificate PNG downloaded!');
      } catch {
        toast.error('Failed to generate PNG');
      }
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen hero-bg p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-8 w-24 skeleton-shimmer" />
          <Skeleton className="aspect-[1.4/1] w-full rounded-2xl skeleton-shimmer" />
          <div className="flex gap-3 justify-center">
            <Skeleton className="h-10 w-32 rounded-lg skeleton-shimmer" />
            <Skeleton className="h-10 w-32 rounded-lg skeleton-shimmer" />
            <Skeleton className="h-10 w-32 rounded-lg skeleton-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !certificate) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center p-4">
        <div
          className="animate-fade-in bg-white/10 border rounded-xl p-8 text-center max-w-md"
          style={{ borderColor: '#E2E8F0' }}
        >
          <Award className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-bold font-heading text-white mb-2">Certificate Not Found</h2>
          <p className="text-sm text-text-secondary mb-6">
            The certificate you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
          </p>
          <Button onClick={goBack} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-bg" ref={containerRef}>
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-navy/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center gap-4">
          <Button
            onClick={goBack}
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex-1" />
          <span className="text-xs text-white/40 font-mono">{certificate.certificateId}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="animate-fade-in space-y-8">
          {/* Level Badge Header */}
          <div
            className="animate-fade-in flex items-center justify-center gap-3"
            style={{ animationDelay: '200ms' }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-sm"
              style={{
                borderColor: levelConfig.color,
                background: levelConfig.bg,
                color: levelConfig.color,
                boxShadow: levelConfig.glow,
              }}
            >
              <span className="text-lg">{levelConfig.icon}</span>
              {certificate.level} Certified
            </div>
          </div>

          {/* Certificate Display Area */}
          <div className="relative overflow-auto rounded-2xl border border-white/10 bg-white/5" style={{ maxHeight: '80vh' }}>
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 bg-navy/80 backdrop-blur-lg rounded-xl border border-white/20 p-1">
              <button onClick={handleZoomOut} className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs text-white/50 min-w-[3rem] text-center font-mono">{Math.round(zoom * 100)}%</span>
              <button onClick={handleZoomIn} className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button onClick={handleZoomReset} className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10 text-xs font-medium">
                Fit
              </button>
              <div className="w-px h-4 bg-white/20" />
              <button onClick={toggleFullscreen} className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Server-generated image or HTML fallback */}
            {certificate.certificateImageUrl && certificate.certificateImageUrl.endsWith('.png') ? (
              <div className="flex justify-center p-4" style={{ transform: `scale(${zoom})`, transformOrigin: 'center top', transition: 'transform 0.2s ease' }}>
                <img
                  src={certificate.certificateImageUrl}
                  alt={`Certificate for ${certificate.studentName}`}
                  className="max-w-full h-auto rounded-lg shadow-2xl"
                  style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(212,175,55,0.15)' }}
                />
              </div>
            ) : (
              /* HTML-rendered certificate (fallback / client-side) */
              <div className="flex justify-center p-4" style={{ transform: `scale(${zoom})`, transformOrigin: 'center top', transition: 'transform 0.2s ease' }}>
                <div
                  ref={certificateRef}
                  className="bg-white rounded-lg shadow-2xl"
                  style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(212,175,55,0.15)' }}
                >
                  <CertificateCard certificate={certificate} qrDataUrl={qrDataUrl} levelConfig={levelConfig} />
                </div>
              </div>
            )}
          </div>

          {/* Certificate Details Grid */}
          <div
            className="animate-fade-in grid grid-cols-1 md:grid-cols-3 gap-4"
            style={{ animationDelay: '400ms' }}
          >
            <div className="bg-white/10 border rounded-xl p-4 flex items-center gap-3" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20">
                <GraduationCap className="h-5 w-5 text-gold-light" />
              </div>
              <div>
                <p className="text-[10px] text-text-secondary uppercase tracking-wider">Degree & Branch</p>
                <p className="text-sm font-medium text-white">{certificate.degree} • {certificate.branch}</p>
              </div>
            </div>
            <div className="bg-white/10 border rounded-xl p-4 flex items-center gap-3" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-electric/20">
                <BookOpen className="h-5 w-5 text-electric-light" />
              </div>
              <div>
                <p className="text-[10px] text-text-secondary uppercase tracking-wider">Task Completed</p>
                <p className="text-sm font-medium text-white">{certificate.taskTitle}</p>
              </div>
            </div>
            <div className="bg-white/10 border rounded-xl p-4 flex items-center gap-3" style={{ borderColor: '#E2E8F0' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/20">
                <Calendar className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-[10px] text-text-secondary uppercase tracking-wider">Issued On</p>
                <p className="text-sm font-medium text-white">{format(new Date(certificate.issuedDate), 'dd MMMM yyyy')}</p>
              </div>
            </div>
          </div>

          {/* Skills Tags */}
          {certificate.skills && certificate.skills.length > 0 && (
            <div
              className="animate-fade-in bg-white/10 border rounded-xl p-4"
              style={{ animationDelay: '500ms', borderColor: '#E2E8F0' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-gold" />
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Skills Verified</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {certificate.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(212,175,55,0.12)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      color: '#F2D675',
                    }}
                  >
                    <Shield className="w-3 h-3" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="animate-fade-in" style={{ animationDelay: '600ms' }}>
            <ShareButtons
              certificateId={certificate.certificateId}
              taskTitle={certificate.taskTitle}
              branch={certificate.branch}
              studentName={certificate.studentName}
              pdfUrl={certificate.pdfUrl || undefined}
              pngUrl={certificate.certificateImageUrl || undefined}
            />
          </div>

          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}

// ─── Certificate Card (Client-side rendering using CertificateSVG) ────

function CertificateCard({
  certificate,
  qrDataUrl,
  levelConfig,
}: {
  certificate: CertificateData;
  qrDataUrl: string;
  levelConfig: { color: string; bg: string; icon: string; glow: string };
}) {
  // Map the API level name to CertificateSVG level prop
  const levelMap: Record<string, 'Starter' | 'Achiever' | 'Expert' | 'Pro' | 'Legend'> = {
    Starter: 'Starter',
    Achiever: 'Achiever',
    Expert: 'Expert',
    Elite: 'Pro',  // Map Elite → Pro for the SVG component
    Pro: 'Pro',
    Legend: 'Legend',
  };
  const svgLevel = levelMap[certificate.level] || 'Starter';

  return (
    <div className="w-full max-w-4xl">
      <CertificateSVG
        studentName={certificate.studentName}
        degree={certificate.degree}
        branch={certificate.branch}
        college={certificate.college || undefined}
        city={certificate.city || undefined}
        taskTitle={certificate.taskTitle}
        skills={certificate.skills}
        level={svgLevel}
        credentialId={certificate.certificateId}
        issuedDate={certificate.issuedDate}
        showAvatar={true}
        showVerifiedBadge={true}
        className="w-full h-auto"
        scale={1}
      />
    </div>
  );
}
