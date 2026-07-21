'use client'; 

import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, Loader2, Send, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from '@/components/shared/BackButton';

// Mask email: j***@gmail.com
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visibleChars = Math.min(2, local.length);
  const masked = local.slice(0, visibleChars) + '***';
  return `${masked}@${domain}`;
}

// Static Mail Icon (no prohibited animations)
function MailIcon() {
  return (
    <div className="relative">
      <div className="w-20 h-20 rounded-2xl bg-navy flex items-center justify-center">
        <Mail className="w-10 h-10 text-white" />
        {/* Notification dot */}
        <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-success flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">1</span>
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const { navigate } = useAppStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to send reset link');
        return;
      }

      setStep(2);
      setCooldown(60);
      toast.success('Reset link sent to your email!');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || !email) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setCooldown(60);
        toast.success('Reset link resent!');
      } else {
        toast.error('Failed to resend. Please try again.');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }, [cooldown, email]);

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Back arrow — top-left */}
      <div
        className="absolute top-4 left-4 z-20 animate-fade-in"
        style={{ animationDelay: '100ms' }}
      >
        <BackButton onClick={() => navigate('login')} to="Login" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="animate-fade-in">
          {/* Logo */}
          <div
            className="text-center mb-8 animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            <div
              className="flex justify-center mb-3 cursor-pointer"
              onClick={() => navigate('landing')}
            >
              <CampusCredLogo size={44} variant="white" animate={true} />
            </div>
          </div>

          {/* Card */}
          <div
            className="p-6 sm:p-8 animate-fade-in"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', animationDelay: '200ms' }}
          >
            {step === 1 ? (
              <div key="step1" className="animate-fade-in">
                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-navy font-[family-name:var(--font-poppins)]">
                    Reset Your Password
                  </h2>
                  <p className="text-text-secondary text-sm mt-1.5">
                    Enter your email and we&apos;ll send you a reset link
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmitEmail} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-navy">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="pl-10 bg-white border-[#CBD5E1] text-navy placeholder:text-[#94A3B8] focus:border-electric/50 focus:ring-electric/20 h-11"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary text-white font-semibold h-11 rounded-xl text-sm"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="mr-2 w-4 h-4" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate('login')}
                    className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-electric transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </button>
                </div>
              </div>
            ) : (
              <div key="step2" className="text-center animate-fade-in">
                {/* Mail Icon */}
                <div className="flex justify-center mb-6">
                  <MailIcon />
                </div>

                {/* Header */}
                <h2 className="text-2xl font-bold text-navy font-[family-name:var(--font-poppins)] mb-2">
                  Check Your Email
                </h2>
                <p className="text-text-secondary text-sm mb-6">
                  We&apos;ve sent a reset link to{' '}
                  <span className="text-electric font-medium">
                    {maskEmail(email)}
                  </span>
                </p>

                {/* Resend Button */}
                <Button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || isLoading}
                  className="w-full btn-secondary text-navy font-medium h-11 rounded-xl text-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : cooldown > 0 ? (
                    <>
                      <RefreshCw className="mr-2 w-4 h-4 opacity-50" />
                      Resend in {cooldown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 w-4 h-4" />
                      Resend Email
                    </>
                  )}
                </Button>

                {/* Back to Login */}
                <div className="mt-6">
                  <button
                    onClick={() => navigate('login')}
                    className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-electric transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
