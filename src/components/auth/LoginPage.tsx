'use client';

import React, { useState } from 'react';
import { useAppStore, User, type AppView } from '@/store';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { BackButton } from '@/components/shared/BackButton';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { toast } from 'sonner';
import { isDemoMode, handleDemoOAuth, openOAuthPopup, handleOAuthCallback, type OAuthProvider } from '@/lib/oauth';

// ─── Google SVG Icon ───
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── GitHub SVG Icon ───
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

// ─── LinkedIn SVG Icon ───
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// Detect if input is email or phone
function detectInputType(value: string): 'email' | 'phone' {
  const phoneRegex = /^[+]?[\d\s\-()]{7,}$/;
  if (phoneRegex.test(value.replace(/\s/g, '')) && /\d/.test(value)) {
    return 'phone';
  }
  return 'email';
}

export function LoginPage() {
  const { setUser, setToken, setRefreshToken, setOauthUser, setOauthOnboarding, navigate } = useAppStore();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const inputType = detectInputType(identifier);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const payload: Record<string, string | boolean> = { password, rememberMe };
      if (inputType === 'phone') {
        payload.phone = identifier;
      } else {
        payload.email = identifier;
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }

      setUser(data.user as User);
      setToken(data.token);
      if (data.refreshToken) setRefreshToken(data.refreshToken);

      // Route based on role
      const roleRoutes: Record<string, AppView> = {
        admin: 'admin',
        company: 'company',
        mentor: 'mentor',
        college: 'college',
      };
      navigate(roleRoutes[data.user.role] || 'dashboard');
      toast.success(`Welcome back, ${data.user.fullName}!`);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    const oauthProvider = provider as OAuthProvider;
    setOauthLoading(provider);
    try {
      if (isDemoMode()) {
        // ─── Demo / Development Flow ───
        const data = await handleDemoOAuth(oauthProvider);

        setUser(data.user as User);
        setToken(data.token);
        if (data.refreshToken) setRefreshToken(data.refreshToken);

        if (data.isNewUser) {
          // New OAuth user — navigate to onboarding
          setOauthUser({
            provider: oauthProvider,
            providerId: (data.user as Record<string, unknown>).googleId ||
                        (data.user as Record<string, unknown>).githubId ||
                        (data.user as Record<string, unknown>).linkedinId ||
                        `${oauthProvider}_demo_12345` as string,
            email: (data.user as Record<string, unknown>).email as string,
            name: (data.user as Record<string, unknown>).fullName as string,
            avatar: ((data.user as Record<string, unknown>).profilePhoto as string) || null,
          });
          setOauthOnboarding(true);
          navigate('onboarding');
          toast.success(`Welcome, ${(data.user as Record<string, unknown>).fullName}! Let's set up your profile.`);
        } else {
          // Existing user — go straight to dashboard
          const roleRoutes: Record<string, AppView> = {
            admin: 'admin',
            company: 'company',
            mentor: 'mentor',
            college: 'college',
          };
          navigate(roleRoutes[(data.user as Record<string, unknown>).role as string] || 'dashboard');
          toast.success(`Welcome back, ${(data.user as Record<string, unknown>).fullName}!`);
        }
      } else {
        // ─── Production Flow (popup) ───
        const { code, state } = await openOAuthPopup(oauthProvider);
        const data = await handleOAuthCallback(oauthProvider, code, state);

        setUser(data.user as unknown as User);
        setToken(data.token);
        if (data.refreshToken) setRefreshToken(data.refreshToken);

        if (data.isNewUser) {
          setOauthUser({
            provider: oauthProvider,
            providerId: '',
            email: (data.user as Record<string, unknown>).email as string,
            name: (data.user as Record<string, unknown>).fullName as string,
            avatar: ((data.user as Record<string, unknown>).profilePhoto as string) || null,
          });
          setOauthOnboarding(true);
          navigate('onboarding');
          toast.success(`Welcome, ${(data.user as Record<string, unknown>).fullName}! Let's set up your profile.`);
        } else {
          const roleRoutes: Record<string, AppView> = {
            admin: 'admin',
            company: 'company',
            mentor: 'mentor',
            college: 'college',
          };
          navigate(roleRoutes[(data.user as Record<string, unknown>).role as string] || 'dashboard');
          toast.success(`Welcome back, ${(data.user as Record<string, unknown>).fullName}!`);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : `${provider} login failed. Please try again.`;
      toast.error(message);
    } finally {
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen hero-bg flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Back arrow — top-left */}
      <div
        className="absolute top-4 left-4 z-20 animate-fade-in"
        style={{ animationDelay: '100ms' }}
      >
        <BackButton onClick={() => navigate('landing')} to="Home" />
      </div>

      {/* Dark mode toggle — top-right */}
      <div
        className="absolute top-4 right-4 z-20 animate-fade-in"
        style={{ animationDelay: '100ms' }}
      >
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="animate-fade-in">
          {/* Logo — outside card, on navy background */}
          <div
            className="text-center mb-8 animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            <div
              className="flex justify-center mb-3 cursor-pointer"
              onClick={() => navigate('landing')}
            >
              <CampusCredLogo size={48} variant="white" animate={true} />
            </div>
            <p className="text-blue-200/60 text-sm font-medium tracking-wide">
              Earn Real Work. Gain Real Cred.
            </p>
          </div>

          {/* Login Card — clean white/dark bg */}
          <div
            className="bg-white dark:bg-navy-light border border-[#E2E8F0] dark:border-navy-lighter rounded-xl p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.3)] animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-navy dark:text-white font-[family-name:var(--font-poppins)]">
                Welcome Back
              </h2>
              <p className="text-text-secondary dark:text-white/60 text-sm mt-1">
                Sign in to access your dashboard
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email or Phone Input */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-navy dark:text-white/80">
                  Email or Phone
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-white/40 pointer-events-none">
                    {inputType === 'phone' ? (
                      <Phone className="w-4 h-4" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </div>
                  <Input
                    type={inputType === 'phone' ? 'tel' : 'email'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your email or phone number"
                    className="pl-10 h-11 rounded-lg border-[#CBD5E1] dark:border-navy-lighter bg-white dark:bg-navy-lighter text-navy dark:text-white placeholder:text-[#94A3B8] dark:placeholder:text-white/30 focus-visible:border-[#3B82F6] focus-visible:ring-[#3B82F6]/20 focus-visible:ring-[2px] transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-navy dark:text-white/80">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] dark:text-white/40 pointer-events-none" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 h-11 rounded-lg border-[#CBD5E1] dark:border-navy-lighter bg-white dark:bg-navy-lighter text-navy dark:text-white placeholder:text-[#94A3B8] dark:placeholder:text-white/30 focus-visible:border-[#3B82F6] focus-visible:ring-[#3B82F6]/20 focus-visible:ring-[2px] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] dark:text-white/40 hover:text-text-secondary dark:hover:text-white/60 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-[#CBD5E1] dark:border-navy-lighter data-[state=checked]:bg-electric data-[state=checked]:border-electric"
                  />
                  <label
                    htmlFor="remember"
                    className="text-xs text-text-secondary dark:text-white/50 cursor-pointer select-none"
                  >
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('forgot-password')}
                  className="text-xs text-electric hover:text-electric-dark transition-colors font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary h-11 rounded-xl text-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            {/* OR Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E2E8F0] dark:border-navy-lighter" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white dark:bg-navy-light text-[#94A3B8] dark:text-white/40 font-medium">
                  OR
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              {/* Google */}
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 h-11 rounded-xl bg-white dark:bg-navy-lighter text-gray-800 dark:text-white font-medium text-sm hover:bg-gray-50 dark:hover:bg-navy-light active:scale-[0.97] transition-all duration-200 disabled:opacity-50 border border-[#E2E8F0] dark:border-navy-lighter"
              >
                {oauthLoading === 'google' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-white/60" />
                ) : (
                  <GoogleIcon className="w-5 h-5" />
                )}
                Continue with Google
              </button>

              {/* GitHub */}
              <button
                type="button"
                onClick={() => handleOAuth('github')}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 h-11 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 active:scale-[0.97] transition-all duration-200 border border-gray-700 disabled:opacity-50"
              >
                {oauthLoading === 'github' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <GitHubIcon className="w-5 h-5" />
                )}
                Continue with GitHub
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={() => handleOAuth('linkedin')}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 h-11 rounded-xl bg-[#0A66C2] text-white font-medium text-sm hover:bg-[#004182] active:scale-[0.97] transition-all duration-200 disabled:opacity-50"
              >
                {oauthLoading === 'linkedin' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LinkedInIcon className="w-5 h-5" />
                )}
                Continue with LinkedIn
              </button>
            </div>

            {/* Register Link */}
            <p className="text-center text-sm text-[#94A3B8] dark:text-white/40 mt-6">
              No account yet?{' '}
              <button
                onClick={() => navigate('onboarding')}
                className="text-electric hover:text-electric-dark transition-colors font-semibold"
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
