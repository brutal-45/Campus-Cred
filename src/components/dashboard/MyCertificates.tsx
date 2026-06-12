'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store';
import {
  Award,
  ExternalLink,
  Download,
  Linkedin,
  Share2,
  Calendar,
  Hash,
} from 'lucide-react';
import { format } from 'date-fns';

interface Certificate {
  id: string;
  certificateId: string;
  taskTitle: string;
  degree: string;
  branch: string;
  issuedDate: string;
  studentName: string;
  qrCodeUrl?: string | null;
  pdfUrl?: string | null;
}

/**
 * MyCertificates
 *
 * Design rules:
 * - Cards use cc-card style (hover: translateY -2px, shadow increase)
 * - Simple CSS fade-in animation (no framer-motion)
 * - Skeleton loading with shimmer
 * - Certificate header: navy bg (not gradient)
 * - 4px spacing grid
 */
export function MyCertificates() {
  const { token, setSelectedCertificateId, navigate } = useAppStore();

  const { data, isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const res = await fetch('/api/student/certificates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch certificates');
      return res.json();
    },
    enabled: !!token,
  });

  const certificates: Certificate[] = data?.certificates || [];

  const handleView = (certId: string) => {
    setSelectedCertificateId(certId);
    navigate('certificate');
  };

  const handleDownloadPDF = (cert: Certificate) => {
    const link = document.createElement('a');
    link.href = cert.pdfUrl || '#';
    link.download = `${cert.certificateId}.pdf`;
    link.click();
  };

  const handleShareLinkedIn = (cert: Certificate) => {
    const text = `I just earned a verified certificate from CampusCred for completing "${cert.taskTitle}"! #CampusCred #Internship #Certificate`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      typeof window !== 'undefined' ? window.location.origin : ''
    )}&summary=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = (cert: Certificate) => {
    const text = `I earned a verified certificate from CampusCred for completing "${cert.taskTitle}"! Certificate ID: ${cert.certificateId}. Check it out!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Loading state — skeleton shimmer
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border" style={{ borderColor: '#E2E8F0' }}>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32 mb-2 skeleton-shimmer" />
              <Skeleton className="h-4 w-48 skeleton-shimmer" />
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-36 skeleton-shimmer" />
                <Skeleton className="h-3 w-24 skeleton-shimmer" />
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex gap-2 w-full">
                <Skeleton className="h-8 flex-1 skeleton-shimmer" />
                <Skeleton className="h-8 w-8 skeleton-shimmer" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (certificates.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Award className="w-8 h-8 text-text-secondary" />
        </div>
        <h3 className="text-lg font-semibold font-heading mb-2 text-navy">No certificates yet</h3>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          Complete tasks and get your submissions approved to earn verified digital certificates. Your achievements will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {certificates.map((cert, index) => (
        <div
          key={cert.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="cc-card overflow-hidden h-full flex flex-col">
            {/* Certificate header — solid navy bg */}
            <div className="bg-navy p-4 pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-white" />
                <span className="text-xs text-white/80 font-medium">Verified Certificate</span>
              </div>
              <h3 className="font-bold font-heading text-white text-sm leading-snug line-clamp-2">
                {cert.taskTitle}
              </h3>
            </div>

            <div className="p-4 pb-3 flex-1">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Hash className="w-3.5 h-3.5" />
                  <span className="font-mono font-medium text-foreground">{cert.certificateId}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Issued {format(new Date(cert.issuedDate), 'dd MMM yyyy')}</span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {cert.degree}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {cert.branch}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 flex flex-col gap-2">
              <Button
                onClick={() => handleView(cert.id)}
                className="w-full gap-1.5 text-xs btn-primary text-white"
                size="sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Certificate
              </Button>

              <div className="flex gap-1.5 w-full">
                <Button
                  onClick={() => handleDownloadPDF(cert)}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 text-xs"
                >
                  <Download className="w-3 h-3" />
                  PDF
                </Button>
                <Button
                  onClick={() => handleShareLinkedIn(cert)}
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 text-xs"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-3 h-3" />
                  LinkedIn
                </Button>
                <Button
                  onClick={() => handleShareWhatsApp(cert)}
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs text-green-600 hover:text-green-700"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
