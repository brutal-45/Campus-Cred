'use client';

import React, { useState } from 'react';

import { useAppStore, User } from '@/store';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Briefcase,
  Building2,
  BookOpen,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { BackButton } from '@/components/shared/BackButton';

export function MentorRegisterForm() {
  const { setUser, setToken, navigate } = useAppStore();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    designation: '',
    organization: '',
    expertise: '',
    experience: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Min 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!form.designation.trim()) newErrors.designation = 'Designation is required';
    if (!form.organization.trim()) newErrors.organization = 'Organization is required';
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
          role: 'mentor',
          designation: form.designation.trim(),
          organization: form.organization.trim(),
          expertise: form.expertise ? form.expertise.split(',').map(s => s.trim()) : [],
          experience: form.experience || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Registration failed');
        return;
      }
      setUser(data.user as User);
      setToken(data.token);
      navigate('mentor');
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
    `bg-background border border-input text-foreground placeholder:text-text-secondary focus:border-primary/50 focus:ring-primary/20 h-11 transition-all duration-200 ${
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
              className="w-14 h-14 rounded-2xl bg-purple/20 border border-purple/30 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple/20 animate-fade-in"
              style={{ animationDelay: '100ms' }}
            >
              <BookOpen className="h-7 w-7 text-purple-light" />
            </div>
            <h1 className="text-2xl font-bold font-heading text-navy">Register as Mentor</h1>
            <p className="text-sm text-text-secondary mt-1">Guide students and review their submissions</p>
          </div>

          <div className="cc-card p-6 space-y-5">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                      value={form.fullName}
                      onChange={(e) => updateField('fullName', e.target.value)}
                      placeholder="Dr. Jane Doe"
                      className={`pl-10 ${inputClass('fullName')}`}
                    />
                  </div>
                  {errors.fullName && <p className="text-red-400 text-xs">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium">Designation</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                      value={form.designation}
                      onChange={(e) => updateField('designation', e.target.value)}
                      placeholder="Professor"
                      className={`pl-10 ${inputClass('designation')}`}
                    />
                  </div>
                  {errors.designation && <p className="text-red-400 text-xs">{errors.designation}</p>}
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
                    placeholder="you@university.edu"
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
                  <Label className="text-[13px] font-medium">Organization</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                      value={form.organization}
                      onChange={(e) => updateField('organization', e.target.value)}
                      placeholder="IIT Delhi"
                      className={`pl-10 ${inputClass('organization')}`}
                    />
                  </div>
                  {errors.organization && <p className="text-red-400 text-xs">{errors.organization}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium">Experience (years)</Label>
                  <Input
                    value={form.experience}
                    onChange={(e) => updateField('experience', e.target.value)}
                    placeholder="e.g., 10"
                    className={inputClass('experience')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[13px] font-medium">Expertise (comma separated)</Label>
                <Input
                  value={form.expertise}
                  onChange={(e) => updateField('expertise', e.target.value)}
                  placeholder="Web Dev, ML, DSA, Cloud Computing"
                  className={inputClass('expertise')}
                />
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
                    Register as Mentor
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
