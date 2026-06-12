'use client';

import React, { useState } from 'react';
import {
 GraduationCap,
 Code,
 Award,
 Briefcase,
 Building2,
 Search,
 FileCheck,
 UserPlus,
 Users,
 Eye,
 MessageSquare,
 Star,
 ArrowRight,
 CheckCircle2,
 Sparkles,
 Zap,
 Target,
 BarChart3,
 Landmark,
 BookOpen,
 FileText,
 TrendingUp,
 Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';

const studentSteps = [
 {
 step: 1,
 icon: GraduationCap,
 title: 'Sign Up & Set Your Path',
 description: 'Register for free, select your degree and branch. CampusCred instantly shows tasks and internships matched to your field.',
 details: ['Quick 2-minute registration', 'Choose from 16+ degree programs', 'Branch-specific task matching', 'Auto-generated CampusCred username'],
 color: 'from-blue-500 to-cyan-500',
 },
 {
 step: 2,
 icon: Search,
 title: 'Browse & Choose Tasks',
 description: 'Explore real-world tasks from top companies filtered by your degree, branch, category, and difficulty level.',
 details: ['500+ active tasks at any time', '6 categories: Dev, Design, Marketing, Data, Writing, Research', '3 difficulty levels: Easy, Medium, Hard', 'Task kits and resources included'],
 color: 'from-violet-500 to-purple-500',
 },
 {
 step: 3,
 icon: Code,
 title: 'Complete & Submit Work',
 description: 'Work on real projects at your own pace. Submit your work with file uploads or external links before the deadline.',
 details: ['Flexible deadlines', 'File upload or external link submission', 'Track submission status in real-time', 'Early submission bonus points'],
 color: 'from-emerald-500 to-green-500',
 },
 {
 step: 4,
 icon: FileCheck,
 title: 'Get Reviewed & Certified',
 description: 'Professional mentors review your work and provide detailed feedback. Approved submissions earn QR-verified certificates.',
 details: ['Expert mentor review within 48 hours', 'Detailed feedback and rating (1-5)', 'QR-verified digital certificate (PDF + PNG)', 'SHA-256 tamper-proof hash verification'],
 color: 'from-amber-500 to-orange-500',
 },
 {
 step: 5,
 icon: Award,
 title: 'Build Your Portfolio & Score',
 description: 'Every completed task adds to your public portfolio. Your CampusCred Score (0-1000) grows with each achievement.',
 details: ['Public portfolio at campuscred.in/student/username', 'CampusCred Score with 5 levels', 'Skill badges and streak tracking', 'LinkedIn-ready certificate sharing'],
 color: 'from-rose-500 to-pink-500',
 },
 {
 step: 6,
 icon: Briefcase,
 title: 'Get Hired!',
 description: 'Companies browse student portfolios and scores. Apply for micro-internships directly through CampusCred and land your dream role.',
 details: ['Direct company applications', 'Micro-internship matching', 'Portfolio discovery by recruiters', 'Campus to corporate bridge'],
 color: 'from-indigo-500 to-blue-500',
 },
];

const companySteps = [
 { step: 1, icon: Building2, title: 'Register Your Company', description: 'Create your company profile with industry, size, and hiring needs. Get verified to build trust.' },
 { step: 1, icon: Target, title: 'Post Tasks & Internships', description: 'Create real-world tasks and micro-internships tailored to specific degrees and branches.' },
 { step: 2, icon: Eye, title: 'Review Submissions', description: 'Students complete your tasks. Review their work, provide feedback, and approve the best submissions.' },
 { step: 3, icon: Star, title: 'Discover Talent', description: 'Browse student portfolios, CampusCred Scores, and verified certificates. Find the best candidates.' },
 { step: 4, icon: UserPlus, title: 'Hire Directly', description: 'Shortlist, interview, and hire top talent directly through the platform. Zero placement fees.' },
];

const collegeSteps = [
 { step: 1, icon: Landmark, title: 'Partner With CampusCred', description: 'Register your college and get a dedicated dashboard to track student progress across all branches.' },
 { step: 2, icon: BookOpen, title: 'Student Analytics', description: 'Monitor student engagement, task completion rates, certificate counts, and CampusCred Scores in real-time.' },
 { step: 3, icon: FileText, title: 'Placement Reports', description: 'Generate placement-ready reports with verified student achievements and industry endorsements.' },
 { step: 4, icon: TrendingUp, title: 'Boost NIRF Rankings', description: 'Industry collaborations and student achievements through CampusCred contribute to improved NIRF metrics.' },
];

const containerVariants = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
 hidden: { opacity: 0, y: 20 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HowItWorksPage() {
 const [activeRole, setActiveRole] = useState<'students' | 'companies' | 'colleges'>('students');

 return (
 <div className="min-h-screen flex flex-col bg-background">
 <Navbar />
 <main className="flex-1 pt-16">
 {/* Hero */}
 <section className="relative overflow-hidden py-20 md:py-28">
 <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy" />
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-20 left-20 w-72 h-72 bg-electric rounded-full blur-[120px]" />
 <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple rounded-full blur-[120px]" />
 </div>
 <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <div
 className="flex justify-center mb-6"
 >
 <CampusCredLogo size={44} variant="white" animate={true} />
 </div>
 <h1
 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6"
 >
 How <span className="text-electric-light">CampusCred</span> Works
 </h1>
 <p
 className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed"
 >
 Three simple flows — one for students, one for companies, one for colleges.
 Pick your path and start building real credibility today.
 </p>
 </div>
 </section>

 {/* Role Tabs */}
 <section className="py-16">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <Tabs defaultValue="students" onValueChange={(v) => setActiveRole(v as typeof activeRole)} className="w-full">
 <div className="flex justify-center mb-12">
 <TabsList className="grid grid-cols-3 w-full max-w-lg h-auto p-1">
 <TabsTrigger value="students" className="py-3 text-sm font-medium data-[state=active]:bg-electric data-[state=active]:text-white">
 <GraduationCap className="w-4 h-4 mr-2" /> For Students
 </TabsTrigger>
 <TabsTrigger value="companies" className="py-3 text-sm font-medium data-[state=active]:bg-electric data-[state=active]:text-white">
 <Building2 className="w-4 h-4 mr-2" /> For Companies
 </TabsTrigger>
 <TabsTrigger value="colleges" className="py-3 text-sm font-medium data-[state=active]:bg-electric data-[state=active]:text-white">
 <Landmark className="w-4 h-4 mr-2" /> For Colleges
 </TabsTrigger>
 </TabsList>
 </div>

 {/* Students Flow */}
 <TabsContent value="students">
 <div
 initial="hidden"
 animate="visible"
 className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
 >
 {studentSteps.map((step, i) => (
 <div key={step.step}>
 <Card className="animate-fade-in h-full p-6 border-border hover:border-electric/30 transition-all hover:shadow-lg group relative overflow-hidden">
 <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-electric/5 to-purple/5 rounded-bl-full" />
 <div className="flex items-center gap-3 mb-4">
 <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform`}>
 <step.icon className="h-6 w-6" />
 </div>
 <div>
 <Badge variant="outline" className="text-xs mb-1">Step {step.step}</Badge>
 <h3 className="font-heading font-semibold">{step.title}</h3>
 </div>
 </div>
 <p className="text-sm text-text-secondary leading-relaxed mb-4">{step.description}</p>
 <ul className="space-y-2">
 {step.details.map((detail) => (
 <li key={detail} className="flex items-start gap-2 text-xs text-text-secondary">
 <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
 {detail}
 </li>
 ))}
 </ul>
 {i < studentSteps.length - 1 && (
 <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 text-electric/30">
 <ArrowRight className="h-6 w-6" />
 </div>
 )}
 </Card>
 </div>
 ))}
 </div>
 </TabsContent>

 {/* Companies Flow */}
 <TabsContent value="companies">
 <div
 initial="hidden"
 animate="visible"
 className="max-w-4xl mx-auto"
 >
 <div className="grid md:grid-cols-2 gap-8 mb-12">
 {companySteps.map((step, i) => (
 <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
 <Card className="animate-fade-in h-full p-6 border-border hover:border-success/30 transition-all hover:shadow-lg group">
 <div className="flex items-start gap-4">
 <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
 <step.icon className="h-6 w-6" />
 </div>
 <div>
 <Badge variant="outline" className="text-xs mb-2">Step {i + 1}</Badge>
 <h3 className="font-heading font-semibold mb-2">{step.title}</h3>
 <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
 </div>
 </div>
 </Card>
 </div>
 ))}
 </div>
 <div>
 <Card className="p-8 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-success/20">
 <div className="text-center">
 <Shield className="h-12 w-12 text-success mx-auto mb-4" />
 <h3 className="text-xl font-heading font-bold mb-2">Zero Placement Fees</h3>
 <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
 Unlike traditional placement agencies, CampusCred charges zero placement fees.
 Hire directly from a pool of verified, skilled students.
 </p>
 <a href="/pricing">
 <Button className="bg-navy text-white border-0 gap-2">
 View Company Pricing <ArrowRight className="w-4 h-4" />
 </Button>
 </a>
 </div>
 </Card>
 </div>
 </div>
 </TabsContent>

 {/* Colleges Flow */}
 <TabsContent value="colleges">
 <div
 initial="hidden"
 animate="visible"
 className="max-w-4xl mx-auto"
 >
 <div className="grid md:grid-cols-2 gap-8 mb-12">
 {collegeSteps.map((step, i) => (
 <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
 <Card className="animate-fade-in h-full p-6 border-border hover:border-amber-500/30 transition-all hover:shadow-lg group">
 <div className="flex items-start gap-4">
 <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
 <step.icon className="h-6 w-6" />
 </div>
 <div>
 <Badge variant="outline" className="text-xs mb-2">Step {i + 1}</Badge>
 <h3 className="font-heading font-semibold mb-2">{step.title}</h3>
 <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
 </div>
 </div>
 </Card>
 </div>
 ))}
 </div>
 <div>
 <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-500/20">
 <div className="text-center">
 <BarChart3 className="h-12 w-12 text-amber-500 mx-auto mb-4" />
 <h3 className="text-xl font-heading font-bold mb-2">Boost Your NIRF Rankings</h3>
 <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
 Industry collaborations and verified student achievements through CampusCred
 directly contribute to improved NIRF metrics and placement statistics.
 </p>
 <a href="/pricing">
 <Button className="gradient-gold text-navy border-0 gap-2">
 View College Plans <ArrowRight className="w-4 h-4" />
 </Button>
 </a>
 </div>
 </Card>
 </div>
 </div>
 </TabsContent>
 </Tabs>
 </div>
 </section>

 {/* Quick Comparison */}
 <section className="py-20 bg-muted/30">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div
 className="text-center mb-12"
 >
 <Badge className="mb-4 bg-electric/10 text-electric border-electric/20">
 <Zap className="w-3 h-3 mr-1" /> Quick Comparison
 </Badge>
 <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
 CampusCred vs <span className="text-navy">Traditional Methods</span>
 </h2>
 </div>
 <div
 >
 <Card className="overflow-hidden">
 <div className="grid grid-cols-3 bg-muted/50 p-4 font-heading font-semibold text-sm">
 <div>Feature</div>
 <div className="text-center">CampusCred</div>
 <div className="text-center text-text-secondary">Traditional</div>
 </div>
 {[
 ['Cost for Students', '100% Free', '₹5,000-50,000'],
 ['Certificate Verification', 'QR + SHA-256 Hash', 'Manual / Phone calls'],
 ['Real Company Tasks', 'Yes — 500+ companies', 'Rarely'],
 ['Public Portfolio', 'Instant, shareable URL', 'Manual resume building'],
 ['Scoring System', 'CampusCred Score 0-1000', 'CGPA only'],
 ['Placement Fees', 'Zero', '₹50,000-2,00,000'],
 ['Industry Exposure', 'From Day 1', 'Final year only'],
 ].map(([feature, cc, trad], i) => (
 <div key={feature} className={`grid grid-cols-3 p-4 text-sm border-t border-border ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
 <div className="font-medium">{feature}</div>
 <div className="text-center text-success font-medium flex items-center justify-center gap-1">
 <CheckCircle2 className="h-3.5 w-3.5" /> {cc}
 </div>
 <div className="text-center text-text-secondary">{trad}</div>
 </div>
 ))}
 </Card>
 </div>
 </div>
 </section>

 {/* CTA */}
 <section className="py-20 navy-bg">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <div
 >
 <CampusCredLogo size={44} variant="white" className="mx-auto mb-6" />
 <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
 Start Your <span className="text-electric-light">Journey</span> Today
 </h2>
 <p className="text-white/60 max-w-xl mx-auto mb-8">
 Whether you&apos;re a student, company, or college — CampusCred has a path for you.
 </p>
 <div className="flex flex-wrap justify-center gap-4">
 <a href="/">
 <Button className="bg-navy text-white border-0 gap-2 shadow-lg">
 Register as Student <ArrowRight className="w-4 h-4" />
 </Button>
 </a>
 <a href="/companies">
 <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
 For Companies
 </Button>
 </a>
 </div>
 </div>
 </div>
 </section>
 </main>
 <Footer />
 </div>
 );
}
