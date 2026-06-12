'use client';

import React, { useState } from 'react';
import {
 Mail,
 Phone,
 MapPin,
 Send,
 MessageSquare,
 Clock,
 ChevronDown,
 ChevronUp,
 CheckCircle2,
 Globe,
 Building2,
 GraduationCap,
 Sparkles,
 ArrowRight,
 HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';

const faqs = [
 { q: 'Is CampusCred really free for students?', a: 'Yes! CampusCred is 100% free for students. You can register, complete tasks, earn certificates, and build your portfolio at no cost whatsoever. We believe financial barriers should never stand between talent and opportunity.' },
 { q: 'How are certificates verified?', a: 'Every certificate issued by CampusCred includes a unique QR code and a SHA-256 tamper-proof hash. Anyone can scan the QR code or enter the credential ID on our verification page to confirm authenticity. The hash ensures the certificate hasn\'t been altered.' },
 { q: 'What kind of tasks are available?', a: 'We offer tasks across 6 categories: Development, Design, Marketing, Data Science, Content Writing, and Research. Tasks come from real companies and are available for all degree programs and branches.' },
 { q: 'How does the CampusCred Score work?', a: 'Your CampusCred Score (0-1000) is calculated based on task completions, quality ratings, certificates earned, streak days, peer reviews, referrals, and more. There are 5 levels: Starter (0-100), Achiever (101-300), Expert (301-600), Elite (601-900), and Legend (901-1000).' },
 { q: 'Can companies hire directly through CampusCred?', a: 'Yes! Companies can browse student portfolios, view CampusCred Scores, and hire directly through the platform. There are zero placement fees for companies hiring through CampusCred.' },
 { q: 'How can my college partner with CampusCred?', a: 'Colleges can register on our platform to get a dedicated dashboard with student analytics, placement reports, and NIRF-ranking contributions. Contact us at creatorsports81@gmail.com for partnership inquiries.' },
 { q: 'What is a micro-internship?', a: 'Micro-internships are short-term (2-6 months), project-based work experiences offered by companies on CampusCred. They can be paid or unpaid, remote or on-site, and are specifically designed for college students.' },
 { q: 'How long does task review take?', a: 'Professional mentors typically review submissions within 48 hours. You\'ll receive detailed feedback and a rating (1-5 stars). Approved submissions automatically generate a verified certificate.' },
];

const offices = [
 { city: 'Pune', address: 'Maharashtra, Pune, India', type: 'Headquarters', icon: Building2 },
 { city: 'Mumbai', address: 'Maharashtra, Mumbai, India', type: 'Regional Office', icon: Building2 },
 { city: 'Nagpur', address: 'Maharashtra, Nagpur, India', type: 'Regional Office', icon: Building2 },
];

const contactMethods = [
 { icon: Mail, label: 'Email Us', value: 'creatorsports81@gmail.com', description: 'We reply within 24 hours', color: 'from-blue-500 to-cyan-500' },
 { icon: Phone, label: 'Call Us', value: '9096341850', description: 'Mon-Fri, 10am-6pm IST', color: 'from-emerald-500 to-green-500' },
 { icon: MessageSquare, label: 'Live Chat', value: 'Available on Platform', description: 'Instant support for students', color: 'from-violet-500 to-purple-500' },
];

const containerVariants = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
 hidden: { opacity: 0, y: 20 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ContactPage() {
 const [form, setForm] = useState({ name: '', email: '', subject: '', role: 'student', message: '' });
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [submitted, setSubmitted] = useState(false);
 const [openFaq, setOpenFaq] = useState<number | null>(null);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 // Simulate submission
 await new Promise(resolve => setTimeout(resolve, 1500));
 setIsSubmitting(false);
 setSubmitted(true);
 setTimeout(() => setSubmitted(false), 5000);
 setForm({ name: '', email: '', subject: '', role: 'student', message: '' });
 };

 return (
 <div className="min-h-screen flex flex-col bg-background">
 <Navbar />
 <main className="flex-1 pt-16">
 {/* Hero */}
 <section className="relative overflow-hidden py-16 md:py-24">
 <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy" />
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-20 left-10 w-72 h-72 bg-electric rounded-full blur-[120px]" />
 <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple rounded-full blur-[120px]" />
 </div>
 <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <div className="flex justify-center mb-4">
 <CampusCredLogo size={44} variant="white" />
 </div>
 <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
 Get in <span className="text-electric-light">Touch</span>
 </h1>
 <p className="text-white/60 max-w-2xl mx-auto">
 Have questions? We&apos;re here to help. Choose your preferred way to reach us.
 </p>
 </div>
 </section>

 {/* Contact Methods */}
 <section className="py-12">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div initial="hidden" animate="visible" className="grid md:grid-cols-3 gap-6">
 {contactMethods.map((method) => (
 <div key={method.label}>
 <Card className="animate-fade-in p-6 text-center hover:shadow-lg transition-all hover:border-electric/30 group">
 <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-r ${method.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
 <method.icon className="h-7 w-7 text-white" />
 </div>
 <h3 className="font-heading font-semibold mb-1">{method.label}</h3>
 <p className="text-sm font-medium text-electric mb-1">{method.value}</p>
 <p className="text-xs text-text-secondary">{method.description}</p>
 </Card>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* Contact Form + Office Locations */}
 <section className="py-16 bg-muted/30">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="grid lg:grid-cols-5 gap-8">
 {/* Form */}
 <div
 className="lg:col-span-3"
 >
 <Card className="p-8">
 <div className="mb-6">
 <Badge className="mb-3 bg-electric/10 text-electric border-electric/20"><Send className="w-3 h-3 mr-1" /> Send a Message</Badge>
 <h2 className="text-2xl font-heading font-bold dark:text-white">We&apos;d Love to Hear From You</h2>
 <p className="text-sm text-text-secondary dark:text-white/60 mt-1">Fill out the form below and we&apos;ll get back to you within 24 hours.</p>
 </div>

 {submitted ? (
 <div className="text-center py-12">
 <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
 <h3 className="text-xl font-heading font-bold mb-2">Message Sent!</h3>
 <p className="text-sm text-text-secondary">Thank you for reaching out. We&apos;ll respond within 24 hours.</p>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-4">
 <div className="grid sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-xs font-medium">Full Name</label>
 <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" required />
 </div>
 <div className="space-y-2">
 <label className="text-xs font-medium">Email</label>
 <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" required />
 </div>
 </div>
 <div className="grid sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-xs font-medium">I am a</label>
 <Select value={form.role} onValueChange={(v) => setForm(f => ({ ...f, role: v }))}>
 <SelectTrigger><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="student">Student</SelectItem>
 <SelectItem value="company">Company</SelectItem>
 <SelectItem value="college">College</SelectItem>
 <SelectItem value="mentor">Mentor</SelectItem>
 <SelectItem value="other">Other</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <label className="text-xs font-medium">Subject</label>
 <Input value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="What's this about?" required />
 </div>
 </div>
 <div className="space-y-2">
 <label className="text-xs font-medium">Message</label>
 <Textarea value={form.message} onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us more..." rows={5} required />
 </div>
 <Button type="submit" disabled={isSubmitting} className="w-full bg-navy text-white border-0 gap-2 font-semibold">
 {isSubmitting ? (
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : (
 <>Send Message <ArrowRight className="w-4 h-4" /></>
 )}
 </Button>
 </form>
 )}
 </Card>
 </div>

 {/* Office Locations */}
 <div
 className="lg:col-span-2 space-y-6"
 >
 <div>
 <Badge className="mb-3 bg-purple/10 text-purple border-purple/20"><MapPin className="w-3 h-3 mr-1" /> Our Offices</Badge>
 <h2 className="text-xl font-heading font-bold dark:text-white mb-4">Visit Us</h2>
 </div>
 {offices.map((office, i) => (
 <div
 key={office.city}
 >
 <Card className="animate-fade-in p-5 hover:shadow-lg transition-all hover:border-electric/30">
 <div className="flex items-start gap-3">
 <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-electric to-purple flex items-center justify-center shrink-0">
 <office.icon className="h-5 w-5 text-white" />
 </div>
 <div>
 <div className="flex items-center gap-2 mb-1">
 <h4 className="font-heading font-semibold text-sm dark:text-white">{office.city}</h4>
 <Badge variant="outline" className="text-[9px]">{office.type}</Badge>
 </div>
 <p className="text-xs text-text-secondary dark:text-white/60 leading-relaxed">{office.address}</p>
 </div>
 </div>
 </Card>
 </div>
 ))}

 {/* Quick Links */}
 <Card className="p-5 bg-gradient-to-br from-electric/5 to-purple/5 border-electric/20">
 <h4 className="font-heading font-semibold text-sm dark:text-white mb-3 flex items-center gap-2">
 <Globe className="h-4 w-4 text-electric" /> Quick Links
 </h4>
 <div className="space-y-2">
 {[
 { label: 'For Companies', href: '/companies' },
 { label: 'For Colleges', href: '/colleges' },
 { label: 'Pricing', href: '/pricing' },
 { label: 'How It Works', href: '/how-it-works' },
 ].map((link) => (
 <a key={link.label} href={link.href} className="flex items-center gap-2 text-xs text-text-secondary hover:text-electric transition-colors">
 <ArrowRight className="h-3 w-3" /> {link.label}
 </a>
 ))}
 </div>
 </Card>
 </div>
 </div>
 </div>
 </section>

 {/* FAQ Section */}
 <section className="py-20">
 <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-12">
 <Badge className="mb-4 bg-amber-500/10 text-amber-600 border-amber-500/20">
 <HelpCircle className="w-3 h-3 mr-1" /> FAQ
 </Badge>
 <h2 className="text-3xl md:text-4xl font-heading font-bold dark:text-white mb-4">
 Frequently Asked <span className="text-navy dark:text-electric-light">Questions</span>
 </h2>
 <p className="text-text-secondary dark:text-white/60">Find answers to the most common questions about CampusCred.</p>
 </div>

 <div className="space-y-3">
 {faqs.map((faq, i) => (
 <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
 <Card
 className="cursor-pointer hover:shadow-md transition-all"
 onClick={() => setOpenFaq(openFaq === i ? null : i)}
 >
 <div className="p-5 flex items-start justify-between gap-4">
 <h4 className="text-sm font-medium dark:text-white leading-tight pr-4">{faq.q}</h4>
 {openFaq === i ? (
 <ChevronUp className="h-5 w-5 text-electric shrink-0" />
 ) : (
 <ChevronDown className="h-5 w-5 text-text-secondary shrink-0" />
 )}
 </div>
 <>
 {openFaq === i && (
 <div
 className="overflow-hidden"
 >
 <div className="px-5 pb-5 pt-0">
 <div className="h-px bg-border mb-4" />
 <p className="text-sm text-text-secondary dark:text-white/60 leading-relaxed">{faq.a}</p>
 </div>
 </div>
 )}
 </>
 </Card>
 </div>
 ))}
 </div>
 </div>
 </section>
 </main>
 <Footer />
 </div>
 );
}

