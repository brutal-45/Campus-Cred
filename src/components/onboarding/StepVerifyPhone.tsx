'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Phone, Shield, Loader2, ArrowLeft, RefreshCw, CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OTPInput } from '@/components/shared/OTPInput';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { toast } from 'sonner';

interface StepVerifyPhoneProps {
  phone: string;
  onVerified: () => void;
  onPrev?: () => void;
}

// Mask phone: "+91 98765 43210" -> "+91 98*** ***10"
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').replace(/^91/, '');
  if (digits.length !== 10) return phone;
  return `+91 ${digits.slice(0, 2)}*** ***${digits.slice(8)}`;
}

export function StepVerifyPhone({ phone, onVerified, onPrev }: StepVerifyPhoneProps) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [otpExpiry, setOtpExpiry] = useState(300); // 5 minutes in seconds
  const [maskedPhone, setMaskedPhone] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const expiryRef = useRef<NodeJS.Timeout | null>(null);

  // Send OTP on mount
  useEffect(() => {
    sendOtp();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (expiryRef.current) clearInterval(expiryRef.current);
    };
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resendTimer]);

  // OTP expiry countdown
  useEffect(() => {
    if (otpExpiry <= 0) {
      if (expiryRef.current) clearInterval(expiryRef.current);
      return;
    }
    expiryRef.current = setInterval(() => {
      setOtpExpiry((prev) => {
        if (prev <= 1) {
          if (expiryRef.current) clearInterval(expiryRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (expiryRef.current) clearInterval(expiryRef.current);
    };
  }, [otpExpiry]);

  const sendOtp = useCallback(async () => {
    setIsSending(true);
    setError(false);
    try {
      const phoneDigits = phone.replace(/\D/g, '').replace(/^91/, '');
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneDigits, purpose: 'verification' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to send OTP');
        return;
      }
      setResendTimer(30);
      setOtpExpiry(data.expiresIn || 300);
      setMaskedPhone(data.maskedPhone || maskPhone(phone));

      if (process.env.NODE_ENV === 'development' && data.otp) {
        toast.success(`OTP sent via SMS! (Dev: ${data.otp})`, { duration: 8000 });
      } else {
        toast.success('OTP sent via SMS!', { duration: 5000 });
      }
    } catch {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [phone]);

  const handleVerify = useCallback(async (otpValue: string) => {
    if (otpValue.length !== 6) return;

    setIsLoading(true);
    setError(false);
    try {
      const phoneDigits = phone.replace(/\D/g, '').replace(/^91/, '');
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneDigits, otp: otpValue, purpose: 'verification' }),
      });
      const data = await res.json();

      if (!res.ok || !data.verified) {
        setError(true);
        toast.error(data.error || 'Invalid OTP. Please try again.');
        setOtp('');
        return;
      }

      setIsVerified(true);
      toast.success('Phone number verified!');

      // Short delay before moving to next step
      setTimeout(() => onVerified(), 1200);
    } catch {
      setError(true);
      toast.error('Verification failed. Please try again.');
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  }, [phone, onVerified]);

  const handleResend = useCallback(() => {
    setOtp('');
    setError(false);
    sendOtp();
  }, [sendOtp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="animate-fade-in-up w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div
          className="animate-fade-in w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-600/30"
          style={{ animationDelay: '100ms' }}
        >
          <MessageSquare className="h-10 w-10 text-white" />
        </div>

        <h2
          className="animate-fade-in text-3xl font-bold text-white font-[family-name:var(--font-poppins)]"
          style={{ animationDelay: '150ms' }}
        >
          Verify Your Phone
        </h2>

        <p
          className="animate-fade-in text-text-secondary mt-3 text-sm leading-relaxed"
          style={{ animationDelay: '200ms' }}
        >
          We&apos;ve sent a 6-digit code via SMS to
          <br />
          <span className="text-white font-semibold font-mono">{maskedPhone || maskPhone(phone)}</span>
        </p>
      </div>

      {/* CampusCred branded card */}
      <div
        className="animate-fade-in-up p-6 sm:p-8 rounded-xl shadow-sm"
        style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: '#E2E8F0', border: '1px solid', animationDelay: '250ms' }}
      >
        {/* Logo + security badge */}
        <div className="flex items-center justify-between mb-6">
          <CampusCredLogo size={28} variant="white" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple/10" style={{ borderColor: '#E2E8F0', border: '1px solid' }}>
            <Shield className="h-3.5 w-3.5 text-purple-light" />
            <span className="text-[10px] font-semibold text-purple-light">SMS Verified</span>
          </div>
        </div>

        {/* OTP Input — 6 separate boxes */}
        <div className="mb-6">
          <OTPInput
            value={otp}
            onChange={(val) => {
              setOtp(val);
              setError(false);
            }}
            onComplete={handleVerify}
            disabled={isLoading || isVerified}
            error={error}
            autoFocus
          />
        </div>

        {/* Verified state */}
        {isVerified && (
          <div className="flex items-center justify-center gap-2 mb-4 p-3 rounded-xl bg-success/10" style={{ borderColor: '#E2E8F0', border: '1px solid' }}>
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="text-success font-semibold text-sm">Phone Verified!</span>
          </div>
        )}

        {/* Loading state */}
        {isLoading && !isVerified && (
          <div className="flex items-center justify-center gap-2 mb-4 text-xs text-electric">
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying your code...
          </div>
        )}

        {/* Expiry timer */}
        {!isVerified && otpExpiry > 0 && (
          <p
            className="animate-fade-in text-center text-xs text-blue-200/40 mb-4 flex items-center justify-center gap-1"
            style={{ animationDelay: '300ms' }}
          >
            <Clock className="h-3 w-3" />
            Code expires in <span className="text-orange-400/70 font-mono font-semibold">{formatTime(otpExpiry)}</span>
          </p>
        )}

        {/* Expired message */}
        {otpExpiry <= 0 && !isVerified && (
          <div className="text-center text-xs text-red-400/80 mb-4 p-2 rounded-lg bg-red-400/5">
            OTP has expired. Please resend a new code.
          </div>
        )}

        {/* Verify Button */}
        {!isVerified && (
          <Button
            onClick={() => handleVerify(otp)}
            disabled={isLoading || otp.length !== 6}
            className="btn-press w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold h-12 rounded-xl shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all duration-300 text-base gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Verify Phone
              </>
            )}
          </Button>
        )}

        {/* Resend OTP */}
        {!isVerified && (
          <div className="mt-4 text-center">
            <button
              onClick={handleResend}
              disabled={resendTimer > 0 || isSending}
              className="inline-flex items-center gap-1.5 text-sm text-blue-200/50 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {resendTimer > 0
                ? `Resend code in ${resendTimer}s`
                : isSending
                  ? 'Sending...'
                  : 'Resend code'}
            </button>
          </div>
        )}
      </div>

      {/* Back button */}
      {onPrev && !isVerified && (
        <div
          className="animate-fade-in mt-6 text-center"
          style={{ animationDelay: '400ms' }}
        >
          <Button
            variant="ghost"
            onClick={onPrev}
            className="text-blue-200/60 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      )}
    </div>
  );
}
