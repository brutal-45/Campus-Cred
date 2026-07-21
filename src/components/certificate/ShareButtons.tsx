'use client'; 

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  FileDown,
  ImageDown,
  MessageCircle,
  Link,
  Code,
  Check,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

// ─── LinkedIn SVG Icon ────────────────────────────────────────────────────────
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// ─── Props Interface ──────────────────────────────────────────────────────────
interface ShareButtonsProps {
  certificateId: string;
  taskTitle: string;
  branch?: string;
  studentName?: string;
  pdfUrl?: string;
  pngUrl?: string;
  verificationUrl?: string;
  className?: string;
}

// ─── ShareButtons Component ───────────────────────────────────────────────────
export function ShareButtons({
  certificateId,
  taskTitle,
  branch,
  studentName,
  pdfUrl,
  pngUrl,
  verificationUrl,
  className,
}: ShareButtonsProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingPNG, setDownloadingPNG] = useState(false);
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);

  // Computed URLs
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://campuscred.in';
  const verifyUrl = verificationUrl || `${origin}/?verify=${certificateId}`;
  const resolvedPdfUrl = pdfUrl || `${origin}/certificates/${certificateId}.pdf`;
  const resolvedPngUrl = pngUrl || `${origin}/certificates/${certificateId}.png`;

  // Branch hashtag (sanitize for hashtag)
  const branchTag = branch
    ? `#${branch.replace(/[^a-zA-Z0-9]/g, '')}`
    : '#Internship';

  // ─── Download PDF ────────────────────────────────────────────────────────
  const handleDownloadPDF = useCallback(async () => {
    setDownloadingPDF(true);
    try {
      const response = await fetch(resolvedPdfUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Certificate PDF downloaded!', {
        description: 'High-resolution, print-ready file saved.',
      });
    } catch {
      toast.error('Failed to download PDF', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setDownloadingPDF(false);
    }
  }, [resolvedPdfUrl, certificateId]);

  // ─── Download PNG ────────────────────────────────────────────────────────
  const handleDownloadPNG = useCallback(async () => {
    setDownloadingPNG(true);
    try {
      const response = await fetch(resolvedPngUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${certificateId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Certificate PNG downloaded!', {
        description: 'Ready for WhatsApp & social media sharing.',
      });
    } catch {
      toast.error('Failed to download PNG', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setDownloadingPNG(false);
    }
  }, [resolvedPngUrl, certificateId]);

  // ─── Share to LinkedIn ───────────────────────────────────────────────────
  const handleShareLinkedIn = useCallback(() => {
    const text = `Excited to share that I have completed ${taskTitle} on CampusCred and earned a verified certificate! #CampusCred #Internship ${branchTag} #Certified`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    toast.success('Opening LinkedIn...', {
      description: 'Share your achievement with your network.',
    });
  }, [taskTitle, branchTag, verifyUrl]);

  // ─── Share via WhatsApp ──────────────────────────────────────────────────
  const handleShareWhatsApp = useCallback(() => {
    const text = `I earned a verified certificate on CampusCred! Check it out: ${verifyUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    toast.success('Opening WhatsApp...', {
      description: 'Share your certificate with friends and family.',
    });
  }, [verifyUrl]);

  // ─── Copy Verification Link ──────────────────────────────────────────────
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopiedLink(true);
      toast.success('Verification link copied!', {
        description: 'Paste it anywhere to share your certificate.',
      });
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = verifyUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedLink(true);
        toast.success('Verification link copied!');
        setTimeout(() => setCopiedLink(false), 2500);
      } catch {
        toast.error('Failed to copy link', {
          description: 'Please copy the URL manually from your browser.',
        });
      }
      document.body.removeChild(textArea);
    }
  }, [verifyUrl]);

  // ─── Copy Embed Code ─────────────────────────────────────────────────────
  const handleCopyEmbedCode = useCallback(async () => {
    const embedCode = `<iframe src="https://campuscred.in/verify/${certificateId}" width="842" height="595" frameborder="0" style="border: 2px solid #D4AF37; border-radius: 8px;"></iframe>`;
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      toast.success('Embed code copied!', {
        description: 'Paste it into your portfolio website HTML.',
      });
      setTimeout(() => setCopiedEmbed(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = embedCode;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedEmbed(true);
        toast.success('Embed code copied!');
        setTimeout(() => setCopiedEmbed(false), 2500);
      } catch {
        toast.error('Failed to copy embed code');
      }
      document.body.removeChild(textArea);
    }
  }, [certificateId]);

  // ─── Embed Code String ───────────────────────────────────────────────────
  const embedCodeHtml = `<iframe\n  src="https://campuscred.in/verify/${certificateId}"\n  width="842"\n  height="595"\n  frameborder="0"\n  style="border: 2px solid #D4AF37; border-radius: 8px;"\n></iframe>`;

  // ─── Button Definitions ──────────────────────────────────────────────────
  const buttons = [
    {
      id: 'pdf',
      label: 'Download PDF',
      description: 'Print-ready, high resolution',
      icon: <FileDown className="w-5 h-5" />,
      onClick: handleDownloadPDF,
      loading: downloadingPDF,
      colorClass: 'from-[#0A0F2C] to-[#1a2250] border-[#3B82F6]/30 text-[#3B82F6] hover:border-[#3B82F6]/60 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]',
      iconBg: 'bg-[#3B82F6]/15',
    },
    {
      id: 'png',
      label: 'Download PNG',
      description: 'For WhatsApp & social media',
      icon: <ImageDown className="w-5 h-5" />,
      onClick: handleDownloadPNG,
      loading: downloadingPNG,
      colorClass: 'from-[#0A0F2C] to-[#1a1a35] border-[#7C3AED]/30 text-[#7C3AED] hover:border-[#7C3AED]/60 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]',
      iconBg: 'bg-[#7C3AED]/15',
    },
    {
      id: 'linkedin',
      label: 'Share to LinkedIn',
      description: 'Post to your professional network',
      icon: <LinkedInIcon className="w-5 h-5" />,
      onClick: handleShareLinkedIn,
      loading: false,
      colorClass: 'from-[#0A0F2C] to-[#0a1a30] border-[#0A66C2]/30 text-[#0A66C2] hover:border-[#0A66C2]/60 hover:shadow-[0_0_20px_rgba(10,102,194,0.15)]',
      iconBg: 'bg-[#0A66C2]/15',
    },
    {
      id: 'whatsapp',
      label: 'Share via WhatsApp',
      description: 'Send to friends & family',
      icon: <MessageCircle className="w-5 h-5" />,
      onClick: handleShareWhatsApp,
      loading: false,
      colorClass: 'from-[#0A0F2C] to-[#0a1f15] border-[#10B981]/30 text-[#10B981] hover:border-[#10B981]/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      iconBg: 'bg-[#10B981]/15',
    },
    {
      id: 'copylink',
      label: copiedLink ? 'Copied!' : 'Copy Verification Link',
      description: copiedLink ? 'Link copied to clipboard' : 'Share the verification URL',
      icon: copiedLink ? <CheckCircle2 className="w-5 h-5" /> : <Link className="w-5 h-5" />,
      onClick: handleCopyLink,
      loading: false,
      colorClass: copiedLink
        ? 'from-[#0A0F2C] to-[#0a1f15] border-[#10B981]/50 text-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.1)]'
        : 'from-[#0A0F2C] to-[#1a1a2a] border-[#D4AF37]/30 text-[#D4AF37] hover:border-[#D4AF37]/60 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]',
      iconBg: copiedLink ? 'bg-[#10B981]/15' : 'bg-[#D4AF37]/15',
    },
    {
      id: 'embed',
      label: 'Embed Code',
      description: 'Add to your portfolio website',
      icon: <Code className="w-5 h-5" />,
      onClick: () => setEmbedDialogOpen(true),
      loading: false,
      colorClass: 'from-[#0A0F2C] to-[#1a1525] border-[#7C3AED]/30 text-[#A78BFA] hover:border-[#7C3AED]/60 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]',
      iconBg: 'bg-[#7C3AED]/15',
    },
  ];

  return (
    <div className={`p-4 md:p-6 ${className || ''}`}
      style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px' }}>
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-5">
        <span className="text-lg" aria-hidden="true">🎉</span>
        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
          Share Your Achievement
        </h3>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {buttons.map((btn) => (
          <button
            key={btn.id}
            onClick={btn.onClick}
            disabled={btn.loading}
            className={`
              group relative flex flex-col items-center gap-2 p-4 rounded-xl
              bg-gradient-to-br ${btn.colorClass}
              border
              transition-all duration-300 ease-out
              hover:scale-[1.02] active:scale-[0.98]
              disabled:opacity-70 disabled:cursor-wait disabled:hover:scale-100
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0F2C]
            `}
            aria-label={btn.label}
          >
            {/* Icon */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${btn.iconBg} transition-transform duration-200 group-hover:scale-110`}>
              {btn.loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                btn.icon
              )}
            </div>

            {/* Label */}
            <span className="text-xs font-semibold text-center leading-tight">
              {btn.label}
            </span>

            {/* Description */}
            <span className="text-[10px] text-white/40 text-center leading-tight">
              {btn.description}
            </span>
          </button>
        ))}
      </div>

      {/* Embed Code Dialog */}
      <Dialog open={embedDialogOpen} onOpenChange={setEmbedDialogOpen}>
        <DialogContent className="bg-[#0A0F2C] border-white/15 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-[#D4AF37]" />
              Embed Certificate
            </DialogTitle>
            <DialogDescription className="text-white/50">
              Copy the HTML code below and paste it into your portfolio or personal website to embed your verified certificate.
            </DialogDescription>
          </DialogHeader>

          {/* Preview */}
          <div className="mt-2 rounded-lg border border-[#D4AF37]/30 overflow-hidden">
            <div className="px-3 py-2 bg-[#D4AF37]/10 border-b border-[#D4AF37]/20 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#D4AF37]/80 font-semibold">
                Preview
              </span>
              <span className="text-[10px] text-white/30 font-mono">
                842 × 595px
              </span>
            </div>
            <div className="bg-white/5 p-3 flex items-center justify-center min-h-[80px]">
              <div
                className="border-2 border-[#D4AF37] rounded-lg bg-white/95 w-full max-w-[280px] flex items-center justify-center py-6"
                style={{ aspectRatio: '842/595' }}
              >
                <div className="text-center">
                  <div className="text-[#0A0F2C] text-xs font-bold">CampusCred</div>
                  <div className="text-[#0A0F2C]/40 text-[8px]">Verified Certificate</div>
                  {studentName && (
                    <div className="text-[#0A0F2C]/60 text-[8px] mt-1">{studentName}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Code Block */}
          <div className="mt-3 rounded-lg border border-white/10 overflow-hidden">
            <div className="px-3 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                HTML Code
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyEmbedCode}
                className="h-7 gap-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10"
              >
                {copiedEmbed ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span className="text-[#10B981]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Link className="w-3.5 h-3.5" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
            <ScrollArea className="max-h-48">
              <pre className="p-3 text-[11px] leading-relaxed text-[#A78BFA] font-mono overflow-x-auto">
                <code>{embedCodeHtml}</code>
              </pre>
            </ScrollArea>
          </div>

          {/* Footer hint */}
          <p className="text-[10px] text-white/30 text-center mt-2">
            The iframe will display your verified certificate with a gold border on any website.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
