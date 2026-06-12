'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/store';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { BackButton } from '@/components/shared/BackButton';

// Static Success Checkmark (no prohibited animations)
function SuccessIcon() {
  return (
    <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center">
      <CheckCircle2 className="w-12 h-12 text-success" />
    </div>
  );
}

export function ResetPasswordPage() {
  const { navigate } = useAppStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get token from URL search params or localStorage
  const [resetToken, setResetToken] = useState<string>('');

  React.useEffect(() => {
    // Try URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    // Then try localStorage
    const tokenFromStorage = localStorage.getItem('cc_reset_token');
    const token = tokenFromUrl || tokenFromStorage || '';
    setResetToken(token);
  }, []);

  // Password validation
  const validations = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password);
    const passedCount = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
    const isStrongEnough = passedCount >= 3;
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
    const isValid = isStrongEnough && passwordsMatch && password.length > 0;

    return {
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
      isStrongEnough,
      passwordsMatch,
      isValid,
      confirmError: confirmPassword.length > 0 && !passwordsMatch,
    };
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validations.isValid) return;

    if (!resetToken) {
      toast.error('Invalid or missing reset token. Please request a new reset link.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to reset password');
        return;
      }

      setIsSuccess(true);
      // Clear the stored token
      localStorage.removeItem('cc_reset_token');
      toast.success('Password reset successfully!');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            {!isSuccess ? (
              <div key="form" className="animate-fade-in">
                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-navy font-[family-name:var(--font-poppins)]">
                    Set New Password
                  </h2>
                  <p className="text-text-secondary text-sm mt-1.5">
                    Create a strong password for your account
                  </p>
                </div>

                {!resetToken && (
                  <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 mb-4">
                    <p className="text-danger text-xs">
                      No reset token found. Please request a new password reset link.
                    </p>
                    <button
                      onClick={() => navigate('forgot-password')}
                      className="text-danger text-xs font-medium underline mt-1"
                    >
                      Request new link
                    </button>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-navy">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="pl-10 pr-10 bg-white border-[#CBD5E1] text-navy placeholder:text-[#94A3B8] focus:border-electric/50 focus:ring-electric/20 h-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-text-secondary transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {/* Password Strength Meter */}
                    <PasswordStrengthMeter password={password} />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-navy">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className={`pl-10 pr-10 bg-white border-[#CBD5E1] text-navy placeholder:text-[#94A3B8] focus:ring-electric/20 h-11 ${
                          validations.confirmError
                            ? 'border-danger/50 focus:border-danger/50'
                            : confirmPassword.length > 0 && validations.passwordsMatch
                            ? 'border-success/50 focus:border-success/50'
                            : 'focus:border-electric/50'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-text-secondary transition-colors"
                      >
                        {showConfirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {validations.confirmError && (
                      <p className="text-[11px] text-danger">
                        Passwords do not match
                      </p>
                    )}
                    {confirmPassword.length > 0 && validations.passwordsMatch && (
                      <p className="text-[11px] text-success">
                        Passwords match
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!validations.isValid || isLoading || !resetToken}
                    className="w-full btn-primary text-white font-semibold h-11 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Reset Password'
                    )}
                  </Button>
                </form>
              </div>
            ) : (
              <div key="success" className="text-center py-4 animate-fade-in">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                  <SuccessIcon />
                </div>

                <h2 className="text-2xl font-bold text-navy font-[family-name:var(--font-poppins)] mb-2">
                  Password Reset Successfully
                </h2>
                <p className="text-text-secondary text-sm mb-8">
                  Your password has been updated. You can now sign in with your new password.
                </p>

                <Button
                  onClick={() => navigate('login')}
                  className="btn-primary text-white font-semibold h-11 px-8 rounded-xl text-sm"
                >
                  Go to Login
                </Button>
              </div>
            )}
          </div>

          {/* Back to Login */}
          {!isSuccess && (
            <div className="text-center mt-4 animate-fade-in" style={{ animationDelay: '500ms' }}>
              <button
                onClick={() => navigate('login')}
                className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-electric transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
