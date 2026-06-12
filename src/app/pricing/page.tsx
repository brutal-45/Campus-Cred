'use client';

import React, { useState } from 'react';
import {
 CheckCircle2,
 X,
 GraduationCap,
 Building2,
 Landmark,
 ArrowRight,
 Star,
 Zap,
 Crown,
 Sparkles,
 HelpCircle,
 Users,
 Award,
 FileText,
 BarChart3,
 MessageSquare,
 Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';

const studentPlan = {
 name: 'Student',
 tagline: 'Always Free',
 price: '₹0',
 period: 'forever',
 icon: GraduationCap,
 gradient: 'from-emerald-500 to-green-500',
 popular: true,
 features: [
 { text: 'Unlimited task submissions', included: true },
 { text: 'QR-verified digital certificates', included: true },
 { text: 'Public portfolio with custom URL', included: true },
 { text: 'CampusCred Score (0-1000)', included: true },
 { text: 'Micro-internship applications', included: true },
 { text: '5 skill levels with badges', included: true },
 { text: 'LinkedIn certificate sharing', included: true },
 { text: 'Hall of Fame leaderboard', included: true },
 { text: 'Streak tracking & rewards', included: true },
 { text: 'Peer review system', included: true },
 { text: 'PDF + PNG certificate downloads', included: true },
 { text: 'Early submission bonus points', included: true },
 ],
 exclusions: [
 'Priority mentor review',
 '1-on-1 career coaching',
 ],
 cta: 'Register Free',
};

const companyPlans = [
 {
 name: 'Starter',
 tagline: 'For small teams',
 price: '₹4,999',
 period: '/month',
 icon: Zap,
 gradient: 'from-blue-500 to-cyan-500',
 popular: false,
 features: [
 { text: 'Up to 5 active tasks', included: true },
 { text: 'Up to 3 internships', included: true },
 { text: 'Student discovery & search', included: true },
 { text: 'Submission review dashboard', included: true },
 { text: 'Basic analytics', included: true },
 { text: 'Email support', included: true },
 { text: 'Company profile page', included: true },
 ],
 exclusions: [
 'Featured company listing',
 'Priority task placement',
 'Dedicated account manager',
 ],
 cta: 'Get Started',
 },
 {
 name: 'Professional',
 tagline: 'For growing companies',
 price: '₹14,999',
 period: '/month',
 icon: Star,
 gradient: 'from-electric to-purple',
 popular: true,
 features: [
 { text: 'Up to 25 active tasks', included: true },
 { text: 'Unlimited internships', included: true },
 { text: 'Advanced student search & filters', included: true },
 { text: 'Submission review with ratings', included: true },
 { text: 'Detailed analytics dashboard', included: true },
 { text: 'Featured company listing', included: true },
 { text: 'Priority task placement', included: true },
 { text: 'Company verification badge', included: true },
 { text: 'Direct hire functionality', included: true },
 { text: 'Priority support', included: true },
 ],
 exclusions: [
 'Dedicated account manager',
 'Custom branding on certificates',
 ],
 cta: 'Go Professional',
 },
 {
 name: 'Enterprise',
 tagline: 'For large organizations',
 price: 'Custom',
 period: '',
 icon: Crown,
 gradient: 'from-gold to-amber-500',
 popular: false,
 features: [
 { text: 'Unlimited everything', included: true },
 { text: 'Dedicated account manager', included: true },
 { text: 'Custom branding on certificates', included: true },
 { text: 'API access & integrations', included: true },
 { text: 'White-label options', included: true },
 { text: 'Bulk hiring tools', included: true },
 { text: 'Custom reporting', included: true },
 { text: 'SLA guarantee', included: true },
 { text: 'On-boarding & training', included: true },
 { text: 'Multi-team management', included: true },
 { text: 'SSO & advanced security', included: true },
 { text: 'Quarterly business reviews', included: true },
 ],
 exclusions: [],
 cta: 'Contact Sales',
 },
];

const collegePlans = [
 {
 name: 'Basic',
 tagline: 'For individual colleges',
 price: '₹9,999',
 period: '/year',
 icon: Landmark,
 gradient: 'from-amber-500 to-orange-500',
 popular: false,
 features: [
 { text: 'Student progress dashboard', included: true },
 { text: 'Up to 500 students tracked', included: true },
 { text: 'Basic placement reports', included: true },
 { text: 'College partner badge', included: true },
 { text: 'Email support', included: true },
 ],
 exclusions: [
 'Custom task creation',
 'Dedicated relationship manager',
 ],
 cta: 'Get Started',
 },
 {
 name: 'Premium',
 tagline: 'For top institutions',
 price: '₹29,999',
 period: '/year',
 icon: Award,
 gradient: 'from-electric to-purple',
 popular: true,
 features: [
 { text: 'Unlimited students tracked', included: true },
 { text: 'Advanced analytics dashboard', included: true },
 { text: 'Custom task creation', included: true },
 { text: 'Detailed placement reports', included: true },
 { text: 'NIRF ranking contribution data', included: true },
 { text: 'Featured college listing', included: true },
 { text: 'Dedicated relationship manager', included: true },
 { text: 'Priority support', included: true },
 { text: 'Batch import & management', included: true },
 { text: 'Custom branded certificates', included: true },
 ],
 exclusions: [],
 cta: 'Go Premium',
 },
];

const pricingFaqs = [
 { q: 'Are there any hidden fees for students?', a: 'Absolutely not. CampusCred is 100% free for students — no credit card required, no hidden charges, no premium tiers. Every student gets full access to tasks, certificates, portfolio, and internships.' },
 { q: 'Can I try a company plan before committing?', a: 'Yes! We offer a 14-day free trial for the Professional plan. No credit card required. Experience the full power of CampusCred for hiring before making a decision.' },
 { q: 'What payment methods do you accept?', a: 'We accept all major credit/debit cards, UPI, net banking, and bank transfers for Indian companies. For Enterprise plans, we also support purchase orders and invoicing.' },
 { q: 'Is there a long-term contract?', a: 'No long-term contracts. All plans are month-to-month (for companies) or annual (for colleges). You can upgrade, downgrade, or cancel at any time.' },
 { q: 'Do you offer discounts for startups or NGOs?', a: 'Yes! We offer a 30% discount for registered startups (under DPIIT) and NGOs. Contact our sales team for details.' },
 { q: 'What happens to student data if a company cancels?', a: 'Student data remains secure and is never shared. If a company cancels, their access to the dashboard is revoked, but student certificates and portfolios remain unaffected.' },
];

const containerVariants = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
 hidden: { opacity: 0, y: 20 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function PricingPage() {
 const [activeTab, setActiveTab] = useState<'companies' | 'colleges'>('companies');
 const [openFaq, setOpenFaq] = useState<number | null>(null);

 return (
 <div className="min-h-screen flex flex-col bg-background">
 <Navbar />
 <main className="flex-1 pt-16">
 {/* Hero */}
 <section className="relative overflow-hidden py-16 md:py-24">
 <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy" />
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-20 left-10 w-72 h-72 bg-gold rounded-full blur-[120px]" />
 <div className="absolute bottom-10 right-10 w-72 h-72 bg-electric rounded-full blur-[120px]" />
 </div>
 <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <div className="flex justify-center mb-4">
 <CampusCredLogo size={44} variant="white" />
 </div>
 <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
 Simple, Transparent <span className="text-electric-light">Pricing</span>
 </h1>
 <p className="text-white/60 max-w-2xl mx-auto mb-4">
 Students are always free. Companies and colleges pay only for what they need.
 </p>
 <div>
 <Badge className="bg-success/20 text-green-300 border-success/30 text-sm px-4 py-1.5">
 <GraduationCap className="w-4 h-4 mr-1.5" /> Students: 100% Free — Forever
 </Badge>
 </div>
 </div>
 </section>

 {/* Student Plan (Highlighted) */}
 <section className="py-12">
 <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
 <div
 >
 <Card className="relative overflow-hidden border-2 border-emerald-500/30 shadow-xl">
 <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
 ALWAYS FREE
 </div>
 <div className="p-8 md:p-10">
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
 <div>
 <div className="flex items-center gap-3 mb-3">
 <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
 <GraduationCap className="h-6 w-6 text-white" />
 </div>
 <div>
 <h3 className="text-xl font-heading font-bold">For Students</h3>
 <p className="text-sm text-text-secondary">Everything you need to build your career</p>
 </div>
 </div>
 <div className="flex items-baseline gap-1 mb-4">
 <span className="text-4xl font-heading font-bold text-emerald-600">₹0</span>
 <span className="text-text-secondary text-sm">forever</span>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-x-6 gap-y-2 flex-1 max-w-lg">
 {studentPlan.features.map((f) => (
 <div key={f.text} className="flex items-center gap-2 text-sm">
 <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
 <span>{f.text}</span>
 </div>
 ))}
 </div>
 <div className="md:text-right">
 <a href="/">
 <Button className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 gap-2 shadow-lg hover:shadow-emerald-500/25 font-semibold">
 {studentPlan.cta} <ArrowRight className="w-4 h-4" />
 </Button>
 </a>
 </div>
 </div>
 </div>
 </Card>
 </div>
 </div>
 </section>

 {/* Tab Switcher for Companies & Colleges */}
 <section className="py-12 bg-muted/30">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="flex justify-center mb-10">
 <div className="inline-flex bg-muted rounded-xl p-1">
 <button
 onClick={() => setActiveTab('companies')}
 className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'companies' ? 'bg-electric text-white shadow-md' : 'text-text-secondary hover:text-foreground'}`}
 >
 <Building2 className="h-4 w-4" /> For Companies
 </button>
 <button
 onClick={() => setActiveTab('colleges')}
 className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'colleges' ? 'bg-amber-500 text-white shadow-md' : 'text-text-secondary hover:text-foreground'}`}
 >
 <Landmark className="h-4 w-4" /> For Colleges
 </button>
 </div>
 </div>

 {/* Company Plans */}
 {activeTab === 'companies' && (
 <div
 key="companies"
 className="grid md:grid-cols-3 gap-6"
 >
 {companyPlans.map((plan) => (
 <div key={plan.name}>
 <Card className={`animate-fade-in h-full relative overflow-hidden ${plan.popular ? 'border-2 border-electric/50 shadow-xl scale-[1.02]' : 'border-border'}`}>
 {plan.popular && (
 <div className="absolute top-0 right-0 bg-navy text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
 MOST POPULAR
 </div>
 )}
 <CardHeader className="pb-2">
 <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center mb-3`}>
 <plan.icon className="h-6 w-6 text-white" />
 </div>
 <CardTitle className="text-lg font-heading">{plan.name}</CardTitle>
 <p className="text-xs text-text-secondary">{plan.tagline}</p>
 </CardHeader>
 <CardContent>
 <div className="flex items-baseline gap-1 mb-6">
 <span className="text-3xl font-heading font-bold">{plan.price}</span>
 {plan.period && <span className="text-text-secondary text-sm">{plan.period}</span>}
 </div>
 <div className="space-y-2.5 mb-6">
 {plan.features.map((f) => (
 <div key={f.text} className="flex items-center gap-2 text-sm">
 <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
 <span>{f.text}</span>
 </div>
 ))}
 {plan.exclusions.map((e) => (
 <div key={e} className="flex items-center gap-2 text-sm text-text-secondary">
 <X className="h-4 w-4 shrink-0" />
 <span>{e}</span>
 </div>
 ))}
 </div>
 <a href={plan.name === 'Enterprise' ? '/contact' : '/'}>
 <Button className={`w-full gap-2 font-semibold ${plan.popular ? 'bg-navy text-white border-0 shadow-lg' : 'border-border'}`} variant={plan.popular ? 'default' : 'outline'}>
 {plan.cta} <ArrowRight className="w-4 h-4" />
 </Button>
 </a>
 </CardContent>
 </Card>
 </div>
 ))}
 </div>
 )}

 {/* College Plans */}
 {activeTab === 'colleges' && (
 <div
 key="colleges"
 className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
 >
 {collegePlans.map((plan) => (
 <div key={plan.name}>
 <Card className={`animate-fade-in h-full relative overflow-hidden ${plan.popular ? 'border-2 border-amber-500/50 shadow-xl' : 'border-border'}`}>
 {plan.popular && (
 <div className="absolute top-0 right-0 gradient-gold text-navy text-[10px] font-bold px-3 py-1 rounded-bl-lg">
 RECOMMENDED
 </div>
 )}
 <CardHeader className="pb-2">
 <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center mb-3`}>
 <plan.icon className="h-6 w-6 text-white" />
 </div>
 <CardTitle className="text-lg font-heading">{plan.name}</CardTitle>
 <p className="text-xs text-text-secondary">{plan.tagline}</p>
 </CardHeader>
 <CardContent>
 <div className="flex items-baseline gap-1 mb-6">
 <span className="text-3xl font-heading font-bold">{plan.price}</span>
 {plan.period && <span className="text-text-secondary text-sm">{plan.period}</span>}
 </div>
 <div className="space-y-2.5 mb-6">
 {plan.features.map((f) => (
 <div key={f.text} className="flex items-center gap-2 text-sm">
 <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
 <span>{f.text}</span>
 </div>
 ))}
 {plan.exclusions.map((e) => (
 <div key={e} className="flex items-center gap-2 text-sm text-text-secondary">
 <X className="h-4 w-4 shrink-0" />
 <span>{e}</span>
 </div>
 ))}
 </div>
 <a href="/">
 <Button className={`w-full gap-2 font-semibold ${plan.popular ? 'gradient-gold text-navy border-0 shadow-lg' : 'border-border'}`} variant={plan.popular ? 'default' : 'outline'}>
 {plan.cta} <ArrowRight className="w-4 h-4" />
 </Button>
 </a>
 </CardContent>
 </Card>
 </div>
 ))}
 </div>
 )}
 </div>
 </section>

 {/* Comparison Table */}
 <section className="py-20">
 <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-12">
 <Badge className="mb-4 bg-electric/10 text-electric border-electric/20"><BarChart3 className="w-3 h-3 mr-1" /> Compare Plans</Badge>
 <h2 className="text-3xl font-heading font-bold">Feature <span className="text-navy">Comparison</span></h2>
 </div>
 <Card className="overflow-hidden">
 <div className="grid grid-cols-4 bg-muted/50 p-4 font-heading font-semibold text-xs">
 <div>Feature</div>
 <div className="text-center">Starter</div>
 <div className="text-center text-electric">Professional</div>
 <div className="text-center">Enterprise</div>
 </div>
 {[
 ['Active Tasks', '5', '25', 'Unlimited'],
 ['Internships', '3', 'Unlimited', 'Unlimited'],
 ['Student Search', 'Basic', 'Advanced', 'Advanced + API'],
 ['Analytics', 'Basic', 'Detailed', 'Custom Reports'],
 ['Featured Listing', '—', '✓', '✓'],
 ['Custom Branding', '—', '—', '✓'],
 ['Account Manager', '—', '—', '✓'],
 ['API Access', '—', '—', '✓'],
 ['Support', 'Email', 'Priority', 'Dedicated'],
 ].map(([feature, ...values], i) => (
 <div key={feature} className={`grid grid-cols-4 p-4 text-sm border-t border-border ${i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
 <div className="font-medium text-xs">{feature}</div>
 {values.map((v, j) => (
 <div key={j} className={`text-center text-xs ${j === 1 ? 'text-electric font-medium' : v === '—' ? 'text-text-secondary' : ''}`}>
 {v === '✓' ? <CheckCircle2 className="h-4 w-4 text-success mx-auto" /> : v}
 </div>
 ))}
 </div>
 ))}
 </Card>
 </div>
 </section>

 {/* Pricing FAQ */}
 <section className="py-16 bg-muted/30">
 <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-10">
 <Badge className="mb-4 bg-amber-500/10 text-amber-600 border-amber-500/20"><HelpCircle className="w-3 h-3 mr-1" /> FAQ</Badge>
 <h2 className="text-2xl md:text-3xl font-heading font-bold">Pricing <span className="text-navy">Questions</span></h2>
 </div>
 <div className="space-y-3">
 {pricingFaqs.map((faq, i) => (
 <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
 <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
 <div className="p-5 flex items-start justify-between gap-4">
 <h4 className="text-sm font-medium leading-tight">{faq.q}</h4>
 <span className="text-xs text-electric shrink-0">{openFaq === i ? '−' : '+'}</span>
 </div>
 {openFaq === i && (
 <div className="px-5 pb-5 pt-0">
 <div className="h-px bg-border mb-3" />
 <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
 </div>
 )}
 </Card>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* CTA */}
 <section className="py-20 navy-bg">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <div>
 <CampusCredLogo size={44} variant="white" className="mx-auto mb-6" />
 <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
 Ready to <span className="text-electric-light">Get Started</span>?
 </h2>
 <p className="text-white/60 max-w-xl mx-auto mb-8">
 Students join free. Companies and colleges can start with a trial.
 </p>
 <div className="flex flex-wrap justify-center gap-4">
 <a href="/">
 <Button className="bg-navy text-white border-0 gap-2 shadow-lg font-semibold">
 Register Now <ArrowRight className="w-4 h-4" />
 </Button>
 </a>
 <a href="/contact">
 <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
 Talk to Sales
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
