'use client';

import React from 'react';
import { useAppStore, User } from '@/store';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { toast } from 'sonner';
import Link from 'next/link';
import {
 ArrowRight,
 Building2,
 Eye,
 EyeOff,
 Lock,
 Mail,
 ChevronLeft,
} from 'lucide-react';

export default function CompanyLoginPage() {
 const { setUser, setToken } = useAppStore();
 const [email, setEmail] = React.useState('');
 const [password, setPassword] = React.useState('');
 const [showPassword, setShowPassword] = React.useState(false);
 const [rememberMe, setRememberMe] = React.useState(false);
 const [isLoading, setIsLoading] = React.useState(false);
 const [errors, setErrors] = React.useState<Record<string, string>>({});

 const validate = (): boolean => {
 const newErrors: Record<string, string> = {};
 if (!email.trim()) newErrors.email = 'Email is required';
 if (!password) newErrors.password = 'Password is required';
 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!validate()) return;
 setIsLoading(true);
 try {
 const res = await fetch('/api/auth/login', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 email: email.trim().toLowerCase(),
 password,
 rememberMe,
 role: 'company',
 }),
 });
 const data = await res.json();
 if (!res.ok) {
 toast.error(data.error || 'Login failed');
 return;
 }
 if (data.user?.role !== 'company') {
 toast.error('This login is for company accounts only');
 return;
 }
 setUser(data.user as User);
 setToken(data.token);
 toast.success('Welcome back!');
 window.location.href = '/company/dashboard';
 } catch {
 toast.error('Something went wrong. Please try again.');
 } finally {
 setIsLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
 <div className="w-full max-w-md">
 <div>
 {/* Back link */}
 <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-foreground mb-6 transition-colors">
 <ChevronLeft className="w-4 h-4" />
 Back to Home
 </Link>

 {/* Header */}
 <div className="text-center mb-8">
 <div className="flex justify-center mb-4">
 <CampusCredLogo size={44} variant="dark" animate={true} />
 </div>
 <div
 className="animate-fade-in w-14 h-14 rounded-2xl bg-electric/10 border border-electric/20 flex items-center justify-center mx-auto mb-4"
 >
 <Building2 className="h-7 w-7 text-electric" />
 </div>
 <h1 className="text-2xl font-bold font-heading text-navy">Company Login</h1>
 <p className="text-sm text-text-secondary mt-1">Sign in to your company dashboard</p>
 </div>

 <Card className="border border-border shadow-lg">
 <CardContent className="p-6">
 <form onSubmit={handleSubmit} className="space-y-5">
 {/* Email */}
 <div className="space-y-2">
 <Label className="text-sm font-medium">Email</Label>
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 type="email"
 value={email}
 onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({}); }}
 placeholder="work@company.com"
 className="pl-10"
 />
 </div>
 {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
 </div>

 {/* Password */}
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <Label className="text-sm font-medium">Password</Label>
 <Link href="/" className="text-xs text-electric hover:underline">Forgot password?</Link>
 </div>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 type={showPassword ? 'text' : 'password'}
 value={password}
 onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({}); }}
 placeholder="Enter your password"
 className="pl-10 pr-10"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground"
 >
 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
 </div>

 {/* Remember Me */}
 <div className="flex items-center gap-2">
 <input
 type="checkbox"
 id="remember"
 checked={rememberMe}
 onChange={(e) => setRememberMe(e.target.checked)}
 className="rounded border-border"
 />
 <Label htmlFor="remember" className="text-xs text-text-secondary cursor-pointer">Remember me for 30 days</Label>
 </div>

 {/* Submit */}
 <Button type="submit" disabled={isLoading} className="w-full bg-navy text-white hover:opacity-90 transition-opacity font-semibold gap-2 py-3">
 {isLoading ? (
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : (
 <>
 Sign In
 <ArrowRight className="w-4 h-4" />
 </>
 )}
 </Button>
 </form>

 </CardContent>
 </Card>

 <p className="text-center text-xs text-text-secondary mt-4">
 Don&apos;t have an account?{' '}
 <Link href="/company/register" className="text-electric hover:underline font-medium">Register your company</Link>
 </p>
 </div>
 </div>
 </div>
 );
}
