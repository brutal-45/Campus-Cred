'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Eye,
  EyeOff,
  Mail,
  User,
  Lock,
  Loader2,
  Shield,
  Sparkles,
  Phone,
  CheckCircle2,
  XCircle,
  ArrowRight,
  MessageSquare,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { PLATFORM_NAME } from '@/lib/constants';
import { toast } from 'sonner';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { ProfilePhotoUpload } from '@/components/auth/ProfilePhotoUpload';
import { OTPInput } from '@/components/shared/OTPInput';

interface StepRegisterProps {
  onNext: () => void;
}

type EmailStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export function StepRegister({ onNext }: StepRegisterProps) {
  const { setUser, setToken, navigate } = useAppStore();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Email availability
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle');
  const emailDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Phone OTP
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(0);
  const [otpError, setOtpError] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState('');
  const otpTimerRef = useRef<NodeJS.Timeout | null>(null);
  const otpExpiryRef = useRef<NodeJS.Timeout | null>(null);

  // Profile photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // ─── Full Name: auto-capitalize ───
  const handleNameChange = useCallback((value: string) => {
    const capitalized = value.replace(/\b\w/g, (char) => char.toUpperCase());
    setFormData((prev) => ({ ...prev, fullName: capitalized }));
    if (errors.fullName) setErrors((prev) => { const n = { ...prev }; delete n.fullName; return n; });
  }, [errors.fullName]);

  // ─── Email: debounced availability check ───
  const handleEmailChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, email: value }));
    if (errors.email) setErrors((prev) => { const n = { ...prev }; delete n.email; return n; });

    if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailStatus(value.length > 0 ? 'invalid' : 'idle');
      return;
    }

    setEmailStatus('checking');
    emailDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: value }),
        });
        const data = await res.json();
        if (data.available) {
          setEmailStatus('available');
        } else {
          setEmailStatus('taken');
        }
      } catch {
        setEmailStatus('idle');
      }
    }, 500);
  }, [errors.email]);

  // ─── Phone: auto-format +91 XXXXX XXXXX ───
  const formatPhone = useCallback((value: string): string => {
    const digits = value.replace(/\D/g, '');
    const cleaned = digits.replace(/^91/, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 5) return `+91 ${cleaned}`;
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5, 10)}`;
  }, []);

  const handlePhoneChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '').replace(/^91/, '').slice(0, 10);
    const formatted = formatPhone(digits);
    setFormData((prev) => ({ ...prev, phone: formatted }));
    if (errors.phone) setErrors((prev) => { const n = { ...prev }; delete n.phone; return n; });
    // Reset OTP if phone changes
    if (isOtpSent) {
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setOtpValue('');
      setOtpTimer(0);
      setOtpExpiry(0);
    }
  }, [errors.phone, formatPhone, isOtpSent]);

  // ─── OTP: send ───
  const handleSendOtp = useCallback(async () => {
    const digits = formData.phone.replace(/\D/g, '').replace(/^91/, '');
    if (digits.length !== 10 || !/^[6-9]\d{9}$/.test(digits)) {
      setErrors((prev) => ({ ...prev, phone: 'Enter a valid 10-digit Indian phone number' }));
      return;
    }

    setOtpSending(true);
    setOtpError(false);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits, purpose: 'registration' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to send OTP');
        return;
      }

      setIsOtpSent(true);
      setOtpTimer(60);
      setOtpExpiry(data.expiresIn || 300);
      setMaskedPhone(data.maskedPhone || `+91 ${digits.slice(0, 2)}*** ***${digits.slice(8)}`);

      if (process.env.NODE_ENV === 'development' && data.otp) {
        toast.success(`OTP sent to ${data.maskedPhone || 'your phone'}! (Dev: ${data.otp})`, { duration: 8000 });
      } else {
        toast.success(`OTP sent to ${data.maskedPhone || 'your phone'}!`, { duration: 5000 });
      }
    } catch {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setOtpSending(false);
    }
  }, [formData.phone]);

  // ─── OTP: verify (auto-submit via OTPInput onComplete) ───
  const handleVerifyOtp = useCallback(async (otp: string) => {
    if (otp.length !== 6) return;

    setOtpLoading(true);
    setOtpError(false);
    try {
      const digits = formData.phone.replace(/\D/g, '').replace(/^91/, '');
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: digits, otp, purpose: 'registration' }),
      });
      const data = await res.json();
      if (!res.ok || !data.verified) {
        setOtpError(true);
        setOtpValue('');
        toast.error(data.error || 'Invalid OTP');
        return;
      }
      setIsOtpVerified(true);
      toast.success('Phone number verified!');
    } catch {
      setOtpError(true);
      setOtpValue('');
      toast.error('Verification failed');
    } finally {
      setOtpLoading(false);
    }
  }, [formData.phone]);

  // ─── OTP Timer countdown ───
  useEffect(() => {
    if (otpTimer <= 0) {
      if (otpTimerRef.current) clearInterval(otpTimerRef.current);
      return;
    }
    otpTimerRef.current = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          if (otpTimerRef.current) clearInterval(otpTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    };
  }, [otpTimer]);

  // ─── OTP Expiry countdown ───
  useEffect(() => {
    if (otpExpiry <= 0) {
      if (otpExpiryRef.current) clearInterval(otpExpiryRef.current);
      return;
    }
    otpExpiryRef.current = setInterval(() => {
      setOtpExpiry((prev) => {
        if (prev <= 1) {
          if (otpExpiryRef.current) clearInterval(otpExpiryRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (otpExpiryRef.current) clearInterval(otpExpiryRef.current);
    };
  }, [otpExpiry]);

  // ─── Photo select handler ───
  const handlePhotoSelect = useCallback((file: File | null, previewUrl: string | null) => {
    setPhotoFile(file);
    setPhotoPreview(previewUrl);
  }, []);

  // ─── Password match indicator ───
  const passwordMatch = formData.confirmPassword.length > 0
    ? formData.password === formData.confirmPassword
    : null;

  // ─── Validate ───
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    } else if (emailStatus === 'taken') {
      newErrors.email = 'This email is already registered';
    } else if (emailStatus === 'checking') {
      newErrors.email = 'Checking email availability...';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isOtpVerified) {
      newErrors.phone = 'Please verify your phone number with OTP';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/\d/.test(formData.password) || !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(formData.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Submit ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Upload photo first if selected
      let photoUrl: string | null = null;
      if (photoFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('photo', photoFile);
        try {
          const uploadRes = await fetch('/api/auth/upload-photo', {
            method: 'POST',
            body: uploadFormData,
          });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok && uploadData.url) {
            photoUrl = uploadData.url;
          }
        } catch {
          // Photo upload is optional, continue without it
        }
      }

      const phoneDigits = formData.phone.replace(/\D/g, '');

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: phoneDigits,
          password: formData.password,
          profilePhoto: photoUrl,
          phoneVerified: isOtpVerified,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Registration failed');
        return;
      }

      setUser(data.user);
      setToken(data.token);

      toast.success('Account created successfully!');
      onNext();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const inputClass = (field: string) =>
    `pl-10 bg-white/5 border-white/10 text-white placeholder:text-blue-300/30 focus:border-electric/50 focus:ring-electric/20 h-11 transition-all duration-200 ${
      errors[field] ? 'border-red-400/60 focus:border-red-400/60' : ''
    }`;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nameCharCount = formData.fullName.length;

  return (
    <div
      className="animate-fade-in-up w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div
          className="animate-fade-in w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/30"
          style={{ animationDelay: '100ms' }}
        >
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h2
          className="animate-fade-in text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-poppins)]"
          style={{ animationDelay: '100ms' }}
        >
          Create your account
        </h2>
        <p
          className="animate-fade-in text-text-secondary mt-2 text-sm"
          style={{ animationDelay: '200ms' }}
        >
          Join {PLATFORM_NAME} and start your journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ─── Full Name ─── */}
        <div
          className="animate-fade-in-up space-y-2"
          style={{ animationDelay: '100ms' }}
        >
          <Label htmlFor="fullName" className="text-blue-100 text-sm font-medium">
            Full Name <span className="text-red-400">*</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300/50" />
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleNameChange(e.target.value)}
              className={inputClass('fullName')}
              maxLength={50}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20">
              {nameCharCount}/50
            </span>
          </div>
          {formData.fullName && (
            <p className="text-[10px] text-blue-300/30">Used for certificate generation</p>
          )}
          {errors.fullName && (
            <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* ─── Email ─── */}
        <div
          className="animate-fade-in-up space-y-2"
          style={{ animationDelay: '150ms' }}
        >
          <Label htmlFor="email" className="text-blue-100 text-sm font-medium">
            Email Address <span className="text-red-400">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300/50" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={`${inputClass('email')} pr-10`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {emailStatus === 'checking' && (
                <Loader2 className="h-4 w-4 text-blue-300/50 animate-spin" />
              )}
              {emailStatus === 'available' && (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              )}
              {emailStatus === 'taken' && (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
              {emailStatus === 'invalid' && formData.email.length > 0 && (
                <XCircle className="h-4 w-4 text-orange-400/50" />
              )}
            </div>
          </div>
          {emailStatus === 'available' && (
            <p className="text-green-400/80 text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Email is available
            </p>
          )}
          {emailStatus === 'taken' && (
            <p className="text-red-400/80 text-xs flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              This email is already registered
            </p>
          )}
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* ─── Phone Number with OTP ─── */}
        <div
          className="animate-fade-in-up space-y-2"
          style={{ animationDelay: '200ms' }}
        >
          <Label htmlFor="phone" className="text-blue-100 text-sm font-medium">
            Phone Number <span className="text-red-400">*</span>
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300/50" />
              <Input
                id="phone"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`${inputClass('phone')} ${isOtpVerified ? 'border-green-500/40' : ''}`}
                disabled={isOtpVerified}
              />
              {isOtpVerified && (
                <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-400" />
              )}
            </div>

            {!isOtpVerified && (
              <Button
                type="button"
                onClick={handleSendOtp}
                disabled={otpSending || formData.phone.replace(/\D/g, '').replace(/^91/, '').length < 10 || (otpTimer > 0 && isOtpSent)}
                className="bg-electric/20 text-electric hover:bg-electric/30 border border-electric/30 h-11 px-4 whitespace-nowrap text-xs font-medium btn-press"
              >
                {otpSending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isOtpSent ? (
                  otpTimer > 0 ? `${otpTimer}s` : 'Resend'
                ) : (
                  <>
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    Send OTP
                  </>
                )}
              </Button>
            )}
          </div>

          {/* OTP Verification Section — Professional 6-box input */}
          {isOtpSent && !isOtpVerified && (
            <div className="mt-3">
              <div className="rounded-xl bg-white/5 border p-4 space-y-3" style={{ borderColor: '#E2E8F0' }}>
                {/* SMS icon + instruction */}
                <div className="flex items-center gap-2 text-xs text-blue-200/60">
                  <MessageSquare className="h-3.5 w-3.5 text-electric/70" />
                  <span>Enter the 6-digit code sent to <span className="text-white font-mono font-semibold">{maskedPhone}</span></span>
                </div>

                {/* 6 separate OTP input boxes */}
                <OTPInput
                  value={otpValue}
                  onChange={(val) => {
                    setOtpValue(val);
                    setOtpError(false);
                  }}
                  onComplete={handleVerifyOtp}
                  disabled={otpLoading || isOtpVerified}
                  error={otpError}
                  autoFocus
                />

                {/* Loading state */}
                {otpLoading && (
                  <div className="flex items-center justify-center gap-2 text-xs text-electric">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Verifying...
                  </div>
                )}

                {/* Error state */}
                {otpError && (
                  <p className="text-red-400 text-xs text-center">
                    Invalid code. Please try again.
                  </p>
                )}

                {/* Expiry + Resend row */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-blue-200/40">
                    <Clock className="h-3 w-3" />
                    {otpExpiry > 0 ? (
                      <span>Expires in <span className="text-orange-400/70 font-mono font-semibold">{formatTime(otpExpiry)}</span></span>
                    ) : (
                      <span className="text-red-400/70">Code expired</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setOtpValue(''); setOtpError(false); handleSendOtp(); }}
                    disabled={otpTimer > 0 || otpSending}
                    className="flex items-center gap-1 text-blue-200/50 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {otpSending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    {otpTimer > 0 ? `${otpTimer}s` : 'Resend'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {isOtpVerified && (
            <p className="text-green-400/80 text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Phone number verified via SMS
            </p>
          )}
          {errors.phone && (
            <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* ─── Password ─── */}
        <div
          className="animate-fade-in-up space-y-2"
          style={{ animationDelay: '250ms' }}
        >
          <Label htmlFor="password" className="text-blue-100 text-sm font-medium">
            Password <span className="text-red-400">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300/50" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 characters with mixed types"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-blue-300/30 focus:border-electric/50 focus:ring-electric/20 h-11 transition-all duration-200 ${
                errors.password ? 'border-red-400/60 focus:border-red-400/60' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300/50 hover:text-blue-200 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrengthMeter password={formData.password} />
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* ─── Confirm Password ─── */}
        <div
          className="animate-fade-in-up space-y-2"
          style={{ animationDelay: '300ms' }}
        >
          <Label htmlFor="confirmPassword" className="text-blue-100 text-sm font-medium">
            Confirm Password <span className="text-red-400">*</span>
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300/50" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              className={`pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-blue-300/30 focus:border-electric/50 focus:ring-electric/20 h-11 transition-all duration-200 ${
                errors.confirmPassword ? 'border-red-400/60 focus:border-red-400/60' : ''
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {passwordMatch === true && (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              )}
              {passwordMatch === false && (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-blue-300/50 hover:text-blue-200 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {passwordMatch === true && (
            <p className="text-green-400/80 text-xs flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Passwords match
            </p>
          )}
          {passwordMatch === false && (
            <p className="text-red-400/80 text-xs flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Passwords do not match
            </p>
          )}
          {errors.confirmPassword && (
            <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* ─── Profile Photo Upload ─── */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: '350ms' }}
        >
          <ProfilePhotoUpload
            onPhotoSelect={handlePhotoSelect}
            fullName={formData.fullName}
          />
        </div>

        {/* ─── Submit Button ─── */}
        <div
          className="animate-fade-in-up pt-2"
          style={{ animationDelay: '400ms' }}
        >
          <Button
            type="submit"
            disabled={isLoading}
            className="btn-press w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold h-12 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all duration-300 text-base gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Create Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Login Link */}
        <p
          className="animate-fade-in text-center text-sm text-text-secondary"
          style={{ animationDelay: '450ms' }}
        >
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('login')}
            className="text-electric hover:text-blue-300 font-medium transition-colors underline underline-offset-2"
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
}
