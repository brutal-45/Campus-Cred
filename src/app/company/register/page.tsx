'use client';

import React from 'react';
import { useAppStore, User } from '@/store';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
 ArrowRight,
 Building2,
 Globe,
 Mail,
 Lock,
 User,
 Briefcase,
 Upload,
 ImagePlus,
 ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';

const INDUSTRIES = [
 'Technology', 'FinTech', 'EdTech', 'HealthTech', 'E-Commerce', 'SaaS',
 'Manufacturing', 'Consulting', 'Media', 'Real Estate', 'Finance', 'Healthcare',
 'Retail', 'Logistics', 'Agriculture', 'Other',
];

export default function CompanyRegisterPage() {
 const { setUser, setToken } = useAppStore();
 const [form, setForm] = React.useState({
 fullName: '',
 email: '',
 password: '',
 confirmPassword: '',
 companyName: '',
 industry: '',
 website: '',
 phone: '',
 employeeCount: '',
 foundedYear: '',
 description: '',
 });
 const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
 const [isLoading, setIsLoading] = React.useState(false);
 const [errors, setErrors] = React.useState<Record<string, string>>({});

 const validate = (): boolean => {
 const newErrors: Record<string, string> = {};
 if (!form.fullName.trim()) newErrors.fullName = 'Contact name is required';
 if (!form.email.trim()) newErrors.email = 'Email is required';
 else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';
 if (!form.password) newErrors.password = 'Password is required';
 else if (form.password.length < 6) newErrors.password = 'Min 6 characters';
 if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
 if (!form.companyName.trim()) newErrors.companyName = 'Company name is required';
 setErrors(newErrors);
 return Object.keys(newErrors).length === 0;
 };

 const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (file) {
 const reader = new FileReader();
 reader.onloadend = () => setLogoPreview(reader.result as string);
 reader.readAsDataURL(file);
 }
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
 role: 'company',
 phone: form.phone || undefined,
 companyName: form.companyName.trim(),
 industry: form.industry || undefined,
 website: form.website || undefined,
 }),
 });
 const data = await res.json();
 if (!res.ok) {
 toast.error(data.error || 'Registration failed');
 return;
 }
 setUser(data.user as User);
 setToken(data.token);
 toast.success('Company registered successfully! Welcome to CampusCred.');
 window.location.href = '/company/dashboard';
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
 className="animate-fade-in w-14 h-14 rounded-2xl bg-electric/10 border border-electric/20 flex items-center justify-center mx-auto mb-4"
 >
 <Building2 className="h-7 w-7 text-electric" />
 </div>
 <h1 className="text-2xl font-bold font-heading text-navy">Register Your Company</h1>
 <p className="text-sm text-text-secondary mt-1">Post micro-internships and discover talented students across India</p>
 </div>

 <Card className="border border-border shadow-lg">
 <CardContent className="p-6">
 <form onSubmit={handleSubmit} className="space-y-5">
 {/* Logo Upload */}
 <div className="flex items-center gap-4">
 <div className="relative group">
 <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/50 group-hover:border-electric/50 transition-colors overflow-hidden">
 {logoPreview ? (
 <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
 ) : (
 <ImagePlus className="w-8 h-8 text-text-secondary/40" />
 )}
 </div>
 <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
 <Upload className="w-5 h-5 text-white" />
 <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
 </label>
 </div>
 <div>
 <p className="text-sm font-medium">Company Logo</p>
 <p className="text-xs text-text-secondary">Click to upload (PNG, JPG, max 2MB)</p>
 </div>
 </div>

 <Separator />

 {/* Contact & Company Name */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label className="text-sm font-medium">Contact Name <span className="text-red-500">*</span></Label>
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
 <Label className="text-sm font-medium">Company Name <span className="text-red-500">*</span></Label>
 <div className="relative">
 <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 value={form.companyName}
 onChange={(e) => updateField('companyName', e.target.value)}
 placeholder="Company name"
 className="pl-10"
 />
 </div>
 {errors.companyName && <p className="text-red-500 text-xs">{errors.companyName}</p>}
 </div>
 </div>

 {/* Email & Phone */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label className="text-sm font-medium">Email <span className="text-red-500">*</span></Label>
 <div className="relative">
 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 type="email"
 value={form.email}
 onChange={(e) => updateField('email', e.target.value)}
 placeholder="work@company.com"
 className="pl-10"
 />
 </div>
 {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
 </div>
 <div className="space-y-2">
 <Label className="text-sm font-medium">Phone</Label>
 <Input
 value={form.phone}
 onChange={(e) => updateField('phone', e.target.value)}
 placeholder="+91 98765 43210"
 />
 </div>
 </div>

 {/* Password */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label className="text-sm font-medium">Password <span className="text-red-500">*</span></Label>
 <div className="relative">
 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 type="password"
 value={form.password}
 onChange={(e) => updateField('password', e.target.value)}
 placeholder="Min 6 characters"
 className="pl-10"
 />
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

 {/* Industry & Website */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label className="text-sm font-medium">Industry</Label>
 <Select value={form.industry} onValueChange={(val) => updateField('industry', val)}>
 <SelectTrigger>
 <SelectValue placeholder="Select industry" />
 </SelectTrigger>
 <SelectContent>
 {INDUSTRIES.map((ind) => (
 <SelectItem key={ind} value={ind}>{ind}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <Label className="text-sm font-medium">Website</Label>
 <div className="relative">
 <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 value={form.website}
 onChange={(e) => updateField('website', e.target.value)}
 placeholder="https://yourcompany.com"
 className="pl-10"
 />
 </div>
 </div>
 </div>

 {/* Employee Count & Founded Year */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label className="text-sm font-medium">Employee Count</Label>
 <Select value={form.employeeCount} onValueChange={(val) => updateField('employeeCount', val)}>
 <SelectTrigger>
 <SelectValue placeholder="Select size" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="1-10">1-10</SelectItem>
 <SelectItem value="11-50">11-50</SelectItem>
 <SelectItem value="51-200">51-200</SelectItem>
 <SelectItem value="201-500">201-500</SelectItem>
 <SelectItem value="500+">500+</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <Label className="text-sm font-medium">Founded Year</Label>
 <Input
 type="number"
 value={form.foundedYear}
 onChange={(e) => updateField('foundedYear', e.target.value)}
 placeholder="e.g., 2020"
 min={1900}
 max={new Date().getFullYear()}
 />
 </div>
 </div>

 {/* Description */}
 <div className="space-y-2">
 <Label className="text-sm font-medium">Company Description</Label>
 <textarea
 value={form.description}
 onChange={(e) => updateField('description', e.target.value)}
 placeholder="Brief description of your company..."
 rows={3}
 className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
 />
 </div>

 {/* Submit */}
 <Button type="submit" disabled={isLoading} className="w-full bg-navy text-white hover:opacity-90 transition-opacity font-semibold gap-2 py-3">
 {isLoading ? (
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : (
 <>
 <Briefcase className="w-4 h-4" />
 Register Company
 <ArrowRight className="w-4 h-4" />
 </>
 )}
 </Button>
 </form>
 </CardContent>
 </Card>

 <p className="text-center text-xs text-text-secondary mt-4">
 Already have an account?{' '}
 <Link href="/company/login" className="text-electric hover:underline font-medium">Sign in</Link>
 <span className="mx-2">|</span>
 <Link href="/" className="text-electric hover:underline font-medium">Back to Home</Link>
 </p>
 </div>
 </div>
 </div>
 );
}
