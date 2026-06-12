'use client';

import React from 'react';
import { useAppStore, User } from '@/store';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';
import {
 ArrowRight,
 Building2,
 Eye,
 EyeOff,
 Lock,
 Mail,
 MapPin,
 Landmark,
 Star,
 User,
 Sparkles,
 Loader2,
 ChevronLeft,
} from 'lucide-react';

const NAAC_RATINGS = ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', 'D', 'Not Rated'];

export default function CollegeRegisterPage() {
 const { setUser, setToken } = useAppStore();
 const [form, setForm] = React.useState({
 fullName: '',
 email: '',
 password: '',
 confirmPassword: '',
 collegeName: '',
 address: '',
 state: '',
 city: '',
 naacRating: '',
 nirfRank: '',
 website: '',
 });
 const [showPassword, setShowPassword] = React.useState(false);
 const [isLoading, setIsLoading] = React.useState(false);
 const [errors, setErrors] = React.useState<Record<string, string>>({});

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

 const handleSubmit = async (e: React.FormEvent) => {
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
 phone: '',
 collegeName: form.collegeName.trim(),
 address: form.address.trim() || undefined,
 state: form.state.trim() || undefined,
 city: form.city.trim() || undefined,
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
 toast.success('College registered successfully! Welcome to CampusCred.');
 window.location.href = '/college/dashboard';
 } catch {
 toast.error('Something went wrong. Please try again.');
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

 return (
 <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
 <div className="w-full max-w-2xl">
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
 className="animate-fade-in w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4"
 >
 <Landmark className="h-7 w-7 text-amber-600" />
 </div>
 <h1 className="text-2xl font-bold font-heading">Register Your College</h1>
 <p className="text-sm text-text-secondary mt-1">Track student progress and partner with CampusCred</p>
 </div>

 <Card className="border border-border shadow-lg">
 <CardContent className="p-6">
 <form onSubmit={handleSubmit} className="space-y-5">
 {/* Admin & College Name */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label className="text-sm font-medium">Admin Name <span className="text-red-500">*</span></Label>
 <div className="relative">
 <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 value={form.fullName}
 onChange={(e) => updateField('fullName', e.target.value)}
 placeholder="Your full name"
 className="pl-10"
 />
 </div>
 {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
 </div>
 <div className="space-y-2">
 <Label className="text-sm font-medium">College Name <span className="text-red-500">*</span></Label>
 <div className="relative">
 <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 value={form.collegeName}
 onChange={(e) => updateField('collegeName', e.target.value)}
 placeholder="College name"
 className="pl-10"
 />
 </div>
 {errors.collegeName && <p className="text-red-500 text-xs">{errors.collegeName}</p>}
 </div>
 </div>

 {/* Email */}
 <div className="space-y-2">
 <Label className="text-sm font-medium">Email <span className="text-red-500">*</span></Label>
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 type="email"
 value={form.email}
 onChange={(e) => updateField('email', e.target.value)}
 placeholder="admin@college.edu"
 className="pl-10"
 />
 </div>
 {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
 </div>

 {/* Password */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label className="text-sm font-medium">Password <span className="text-red-500">*</span></Label>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 type={showPassword ? 'text' : 'password'}
 value={form.password}
 onChange={(e) => updateField('password', e.target.value)}
 placeholder="Min 6 characters"
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
 <div className="space-y-2">
 <Label className="text-sm font-medium">Confirm Password <span className="text-red-500">*</span></Label>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 type="password"
 value={form.confirmPassword}
 onChange={(e) => updateField('confirmPassword', e.target.value)}
 placeholder="Re-enter password"
 className="pl-10"
 />
 </div>
 {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}
 </div>
 </div>

 <Separator />

 {/* Address, City, State */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="space-y-2">
 <Label className="text-sm font-medium">Address</Label>
 <div className="relative">
 <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 value={form.address}
 onChange={(e) => updateField('address', e.target.value)}
 placeholder="Campus address"
 className="pl-10"
 />
 </div>
 </div>
 <div className="space-y-2">
 <Label className="text-sm font-medium">City</Label>
 <Input
 value={form.city}
 onChange={(e) => updateField('city', e.target.value)}
 placeholder="e.g., Delhi"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-sm font-medium">State</Label>
 <Input
 value={form.state}
 onChange={(e) => updateField('state', e.target.value)}
 placeholder="e.g., Maharashtra"
 />
 </div>
 </div>

 {/* NAAC Rating */}
 <div className="space-y-2">
 <Label className="text-sm font-medium flex items-center gap-2">
 <Star className="w-4 h-4 text-amber-500" /> NAAC Rating
 </Label>
 <div className="flex flex-wrap gap-2">
 {NAAC_RATINGS.map((rating) => (
 <button
 key={rating}
 type="button"
 onClick={() => updateField('naacRating', rating)}
 className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
 form.naacRating === rating
 ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 shadow-sm'
 : 'bg-muted/50 text-text-secondary border-border hover:bg-muted'
 }`}
 >
 {rating}
 </button>
 ))}
 </div>
 </div>

 {/* NIRF Rank & Website */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label className="text-sm font-medium">NIRF Rank (optional)</Label>
 <Input
 type="number"
 value={form.nirfRank}
 onChange={(e) => updateField('nirfRank', e.target.value)}
 placeholder="e.g., 25"
 />
 </div>
 <div className="space-y-2">
 <Label className="text-sm font-medium">Website</Label>
 <Input
 value={form.website}
 onChange={(e) => updateField('website', e.target.value)}
 placeholder="https://college.edu"
 />
 </div>
 </div>

 {/* Submit */}
 <Button type="submit" disabled={isLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold gap-2 py-3">
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
 </CardContent>
 </Card>

 <p className="text-center text-xs text-text-secondary mt-4">
 Already have an account?{' '}
 <Link href="/" className="text-electric hover:underline font-medium">Sign in</Link>
 <span className="mx-2">|</span>
 <Link href="/" className="text-electric hover:underline font-medium">Back to Home</Link>
 </p>
 </div>
 </div>
 </div>
 );
}
