'use client';

import React, { useState } from 'react';

import { useAppStore, User } from '@/store';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building2,
  MapPin,
  Landmark,
  Sparkles,
  Loader2,
  Star,
} from 'lucide-react';
import { BackButton } from '@/components/shared/BackButton';

const NAAC_RATINGS = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'D', 'Not Rated'];

export function CollegeRegisterForm() {
  const { setUser, setToken, navigate } = useAppStore();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    collegeName: '',
    address: '',
    state: '',
    naacRating: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Admin name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!form.collegeName.trim()) newErrors.collegeName = 'College name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: 'college',
          collegeName: form.collegeName.trim(),
          address: form.address.trim() || undefined,
          state: form.state.trim() || undefined,
          naacRating: form.naacRating || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Registration failed');
        return;
      }
      setUser(data.user as User);
      setToken(data.token);
      navigate('college');
      toast.success('Welcome to CampusCred!');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const inputClass = (field: string) =>
    `bg-background border border-input text-foreground placeholder:text-text-secondary focus:border-gold/50 focus:ring-gold/20 h-11 transition-all duration-200 ${
      errors[field] ? 'border-red-400' : ''
    }`;

  return (
    <div className="min-h-screen section-gray flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="animate-fade-in">
          {/* Back arrow — top-left */}
          <div
            className="mb-6 animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            <BackButton onClick={() => navigate('landing')} to="Home" />
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4 cursor-pointer" onClick={() => navigate('landing')}>
              <CampusCredLogo size={48} variant="dark" animate={true} />
            </div>
            <div
              className="w-14 h-14 rounded-2xl bg-gold/20 border border-gold/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold/20 animate-fade-in"
              style={{ animationDelay: '100ms' }}
            >
              <Landmark className="h-7 w-7 text-gold" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-navy">Register Your College</h1>
            <p className="text-sm text-text-secondary mt-1">Track student progress and partner with CampusCred</p>
          </div>

          <div className="cc-card p-6 space-y-5">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium">Admin Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                      value={form.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="Your name"
                      className={`pl-10 ${inputClass('fullName')}`}
                    />
                  </div>
                  {errors.fullName && <p className="text-red-400 text-xs">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium">College Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                      value={form.collegeName}
                      onChange={(e) => updateField('collegeName', e.target.value)}
                      placeholder="College name"
                      className={`pl-10 ${inputClass('collegeName')}`}
                    />
                  </div>
                  {errors.collegeName && <p className="text-red-400 text-xs">{errors.collegeName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="admin@college.edu"
                    className={`pl-10 ${inputClass('email')}`}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="Min 6 characters"
                      className={`pl-10 pr-10 ${inputClass('password')}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                      className={`pl-10 ${inputClass('confirmPassword')}`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-xs">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                      value={form.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="Campus address"
                      className={`pl-10 ${inputClass('address')}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium">State</Label>
                  <Input
                    value={form.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    placeholder="e.g., Delhi"
                    className={inputClass('state')}
                  />
                </div>
              </div>

              {/* NAAC Rating */}
              <div className="space-y-2">
                <Label className="text-[13px] font-medium flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold" />
                  NAAC Rating
                </Label>
                <div className="flex flex-wrap gap-2">
                  {NAAC_RATINGS.map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => updateField('naacRating', rating)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                        form.naacRating === rating
                          ? 'bg-gold/20 border-gold/50 text-gold shadow-sm shadow-gold/10'
                          : 'bg-muted border-border text-text-secondary hover:border-gold/30 hover:text-gold/70'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary hover:opacity-90 transition-opacity font-semibold h-12 rounded-xl gap-2 text-base"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Register College
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <Separator />

            <p className="text-center text-xs text-text-secondary">
              Already have an account?{' '}
              <button
                onClick={() => navigate('login')}
                className="text-electric hover:underline font-medium"
              >
                Sign in
              </button>
              <span className="mx-2">|</span>
              <button
                onClick={() => navigate('landing')}
                className="text-electric hover:underline font-medium"
              >
                Back to Home
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
