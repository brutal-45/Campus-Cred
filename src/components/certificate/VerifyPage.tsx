'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  AlertTriangle,
  Shield,
  Award,
  Calendar,
  Hash,
  GraduationCap,
  BookOpen,
  ArrowLeft,
  Search,
  MapPin,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react';
import { format } from 'date-fns';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';

interface VerificationData {
  valid: boolean;
  studentName?: string;
  taskTitle?: string;
  degree?: string;
  branch?: string;
  college?: string;
  city?: string;
  level?: string;
  skills?: string[];
  issuedDate?: string;
  certificateId?: string;
  certificateImageUrl?: string;
  thumbnailUrl?: string;
  taskDifficulty?: string;
  taskCategory?: string;
  hashValid?: boolean | null;
  message?: string;
}

const LEVEL_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  Starter:  { color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: '🌱' },
  Achiever: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: '⚡' },
  Expert:   { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: '🔥' },
  Elite:    { color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', icon: '💎' },
  Legend:   { color: '#D4AF37', bg: 'rgba(212,175,55,0.1)', icon: '👑' },
};

function getInitialVerifyId(): string {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('verify') || '';
  }
  return '';
}

export function VerifyPage() {
  const { goBack } = useAppStore();

  const initialVerifyId = useMemo(() => getInitialVerifyId(), []);
  const [searchId, setSearchId] = useState(initialVerifyId);
  const [activeQuery, setActiveQuery] = useState<string | null>(
    initialVerifyId || null
  );
  const [showHashDetails, setShowHashDetails] = useState(false);

  const { data, isLoading, error } = useQuery<VerificationData>({
    queryKey: ['verify', activeQuery],
    queryFn: async () => {
      if (!activeQuery) return { valid: false };
      const res = await fetch(`/api/verify/${activeQuery}`);
      if (!res.ok) throw new Error('Verification failed');
      return res.json();
    },
    enabled: !!activeQuery,
    retry: false,
  });

  const handleVerify = (id?: string) => {
    const certId = id || searchId.trim();
    if (!certId) return;
    setActiveQuery(certId);
  };

  const isValid = data?.valid === true;
  const levelConfig = LEVEL_CONFIG[data?.level || 'Starter'] || LEVEL_CONFIG.Starter;

  return (
    <div className="min-h-screen hero-bg flex flex-col items-center justify-center p-4">
      <div className="animate-fade-in w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CampusCredLogo size={44} variant="gold" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-white mb-2">
            Certificate Verification
          </h1>
          <p className="text-sm text-text-secondary">
            Verify the authenticity of a CampusCred certificate
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white/10 border rounded-xl p-6 mb-6" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Enter Certificate ID (e.g., CRED-2024-XXXXXX)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric/20 transition-all duration-200"
              />
            </div>
            <Button
              onClick={() => handleVerify()}
              disabled={!searchId.trim() || isLoading}
              className="btn-primary hover:opacity-90 transition-opacity font-semibold px-6"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Verify'
              )}
            </Button>
          </div>
        </div>

        {/* Verification Result */}
        {activeQuery && (data || error) && (
          <div className="animate-fade-in" key={activeQuery}>
            {isLoading ? (
              <div className="bg-white/10 border rounded-xl p-8" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex flex-col items-center gap-4">
                  <Skeleton className="w-20 h-20 rounded-full skeleton-shimmer" />
                  <Skeleton className="h-6 w-48 skeleton-shimmer" />
                  <Skeleton className="h-4 w-64 skeleton-shimmer" />
                </div>
              </div>
            ) : isValid ? (
              /* Valid Certificate */
              <div className="bg-white/10 border rounded-xl p-8" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Checkmark */}
                  <div className="animate-fade-in relative">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle
                        cx="40" cy="40" r="38"
                        fill="rgba(16,185,129,0.15)"
                        stroke="#10B981"
                        strokeWidth="2"
                      />
                      <path
                        d="M24 40 L35 51 L56 30"
                        stroke="#10B981"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  </div>

                  <div className="animate-fade-in space-y-2" style={{ animationDelay: '200ms' }}>
                    <h2 className="text-xl font-bold font-heading text-green-400">
                      Certificate Verified
                    </h2>
                    <p className="text-sm text-text-secondary">
                      This certificate is authentic and was issued by CampusCred
                    </p>
                    {data.level && (
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mt-2"
                        style={{
                          border: `1px solid ${levelConfig.color}`,
                          background: levelConfig.bg,
                          color: levelConfig.color,
                        }}
                      >
                        <span>{levelConfig.icon}</span> {data.level} Certified
                      </div>
                    )}
                  </div>

                  <div className="animate-fade-in w-full space-y-3 pt-4" style={{ animationDelay: '300ms' }}>
                    <div className="p-4 rounded-xl bg-muted/50 border space-y-3" style={{ borderColor: '#E2E8F0' }}>
                      <DetailRow icon={<Award className="w-4 h-4 text-electric" />} label="Student" value={data.studentName || ''} />
                      <DetailRow icon={<BookOpen className="w-4 h-4 text-purple-light" />} label="Task Completed" value={data.taskTitle || ''} />
                      <DetailRow icon={<GraduationCap className="w-4 h-4 text-electric-light" />} label="Degree & Branch" value={`${data.degree} • ${data.branch}`} />
                      {data.college && (
                        <DetailRow icon={<MapPin className="w-4 h-4 text-warning" />} label="College" value={`${data.college}${data.city ? `, ${data.city}` : ''}`} />
                      )}
                      <DetailRow icon={<Calendar className="w-4 h-4 text-warning" />} label="Date Issued" value={data.issuedDate ? format(new Date(data.issuedDate), 'dd MMMM yyyy') : 'N/A'} />
                      <DetailRow icon={<Hash className="w-4 h-4 text-success" />} label="Certificate ID" value={data.certificateId || ''} mono />
                      
                      {/* Skills */}
                      {data.skills && data.skills.length > 0 && (
                        <div className="flex items-start gap-3 pt-2 border-t" style={{ borderColor: '#E2E8F0' }}>
                          <Star className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                          <div className="text-left">
                            <p className="text-[10px] text-text-secondary uppercase tracking-wider">Skills Verified</p>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {data.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                                  style={{
                                    background: 'rgba(212,175,55,0.12)',
                                    border: '1px solid rgba(212,175,55,0.3)',
                                    color: '#F2D675',
                                  }}
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hash Verification (collapsible) */}
                    {data.hashValid !== null && data.hashValid !== undefined && (
                      <div className="rounded-xl bg-white/5 border overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
                        <button
                          onClick={() => setShowHashDetails(!showHashDetails)}
                          className="w-full p-3 flex items-center justify-between text-xs text-white/50 hover:text-white/70 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <Lock className="w-3 h-3" />
                            Cryptographic Hash Verification
                          </span>
                          {showHashDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {showHashDetails && (
                          <div className="px-3 pb-3">
                            <div className="p-3 rounded-lg bg-white/5 text-left">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${data.hashValid ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className={`text-xs font-medium ${data.hashValid ? 'text-green-400' : 'text-red-400'}`}>
                                  {data.hashValid ? 'Hash verified — certificate has not been tampered with' : 'Hash mismatch — certificate may have been modified'}
                                </span>
                              </div>
                              <p className="text-[10px] text-white/30">
                                SHA-256 hash verification ensures the certificate data matches the original issued record.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* View Full Certificate button */}
                    {data.certificateImageUrl && (
                      <Button
                        className="w-full btn-primary hover:opacity-90 transition-opacity gap-2"
                        onClick={() => {
                          window.open(data.certificateImageUrl!, '_blank');
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Full Certificate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Invalid Certificate */
              <div className="bg-white/10 border rounded-xl p-8" style={{ borderColor: '#E2E8F0' }}>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="animate-fade-in w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                  </div>

                  <div className="animate-fade-in space-y-2" style={{ animationDelay: '200ms' }}>
                    <h2 className="text-xl font-bold font-heading text-red-400">
                      Certificate Not Found
                    </h2>
                    <p className="text-sm text-text-secondary max-w-sm">
                      {data?.message || 'This certificate ID does not exist in our records. Please double-check the ID and try again.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back button */}
        {!activeQuery && (
          <div className="animate-fade-in text-center mt-8" style={{ animationDelay: '300ms' }}>
            <Button
              onClick={goBack}
              variant="ghost"
              className="text-white/50 hover:text-white hover:bg-white/10 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Detail row component
function DetailRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-shrink-0">{icon}</div>
      <div className="text-left min-w-0">
        <p className="text-[10px] text-text-secondary uppercase tracking-wider">{label}</p>
        <p className={`text-sm text-white truncate ${mono ? 'font-mono font-medium' : 'font-semibold'}`}>{value}</p>
      </div>
    </div>
  );
}
