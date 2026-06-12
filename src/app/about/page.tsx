'use client';

import React from 'react';
import {
 Heart,
 Target,
 Shield,
 Users,
 Award,
 Globe,
 Sparkles,
 TrendingUp,
 GraduationCap,
 Building2,
 Lightbulb,
 ArrowRight,
 CheckCircle2,
 Star,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';

const stats = [
 { label: 'Students', value: '50,000+', icon: GraduationCap, color: 'text-electric' },
 { label: 'Companies', value: '500+', icon: Building2, color: 'text-success' },
 { label: 'Certificates Issued', value: '25,000+', icon: Award, color: 'text-gold' },
 { label: 'Colleges Partnered', value: '200+', icon: Globe, color: 'text-purple' },
];

const values = [
 {
 icon: Shield,
 title: 'Verified Credibility',
 description: 'Every certificate is QR-verified and tamper-proof with SHA-256 hashing, ensuring authentic achievements.',
 color: 'from-blue-500 to-cyan-500',
 },
 {
 icon: Heart,
 title: 'Student-First',
 description: '100% free for students. We believe financial barriers should never stand between talent and opportunity.',
 color: 'from-rose-500 to-pink-500',
 },
 {
 icon: Target,
 title: 'Real-World Impact',
 description: 'Tasks from real companies solving real problems. No hypotheticals — only practical, portfolio-worthy work.',
 color: 'from-amber-500 to-orange-500',
 },
 {
 icon: Lightbulb,
 title: 'Continuous Growth',
 description: 'CampusCred Score, levels, streaks, and badges keep students motivated on their career journey.',
 color: 'from-violet-500 to-purple-500',
 },
 {
 icon: Users,
 title: 'Community Driven',
 description: 'Mentors, peer reviews, and a vibrant community ensure students never learn in isolation.',
 color: 'from-emerald-500 to-green-500',
 },
 {
 icon: TrendingUp,
 title: 'Career Acceleration',
 description: 'From first task to first job — CampusCred bridges the gap between campus and corporate.',
 color: 'from-indigo-500 to-blue-500',
 },
];

const team = [
 { name: 'Arjun Mehta', role: 'Founder & CEO', initials: 'AM', gradient: 'from-blue-500 to-purple-500' },
 { name: 'Priya Sharma', role: 'CTO', initials: 'PS', gradient: 'from-rose-500 to-pink-500' },
 { name: 'Rahul Verma', role: 'Head of Product', initials: 'RV', gradient: 'from-amber-500 to-orange-500' },
 { name: 'Sneha Iyer', role: 'Head of Partnerships', initials: 'SI', gradient: 'from-emerald-500 to-green-500' },
 { name: 'Vikram Patel', role: 'Lead Engineer', initials: 'VP', gradient: 'from-violet-500 to-purple-500' },
 { name: 'Ananya Reddy', role: 'Design Lead', initials: 'AR', gradient: 'from-cyan-500 to-blue-500' },
];

const milestones = [
 { year: '2023', event: 'CampusCred founded with a mission to bridge the campus-corporate gap' },
 { year: '2023', event: 'First 1,000 students onboarded across 50 colleges' },
 { year: '2024', event: 'Launched QR-verified digital certificates with SHA-256 hashing' },
 { year: '2024', event: 'Partnered with 200+ companies for real-world tasks and internships' },
 { year: '2024', event: '50,000+ students, 25,000+ certificates issued' },
 { year: '2025', event: 'Expanded to all degree programs and launched CampusCred Score' },
];



export default function AboutPage() {
 return (
 <div className="min-h-screen flex flex-col bg-background">
 <Navbar />
 <main className="flex-1 pt-16">
 {/* Hero Section */}
 <section className="relative overflow-hidden py-20 md:py-28">
 <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy" />
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-20 left-10 w-72 h-72 bg-electric rounded-full blur-[120px]" />
 <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple rounded-full blur-[120px]" />
 </div>
 <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <div
 className="flex justify-center mb-6"
 >
 <CampusCredLogo size={48} variant="white" animate={true} />
 </div>
 <h1
 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6"
 >
 About <span className="text-electric-light">CampusCred</span>
 </h1>
 <p
 className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed"
 >
 India&apos;s most trusted student career ecosystem. We bridge the gap between
 campus learning and corporate expectations by providing real-world tasks,
 verified certificates, and career opportunities — 100% free for students.
 </p>
 <div
 className="mt-8 flex flex-wrap justify-center gap-4"
 >
 <a href="/how-it-works">
 <Button className="bg-navy text-white border-0 gap-2 shadow-lg hover:shadow-electric/25">
 How It Works <ArrowRight className="w-4 h-4" />
 </Button>
 </a>
 <a href="/pricing">
 <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
 View Pricing
 </Button>
 </a>
 </div>
 </div>
 </section>

 {/* Stats Section */}
 <section className="py-16 bg-background">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div
 className="grid grid-cols-2 md:grid-cols-4 gap-6"
 >
 {stats.map((stat, i) => (
 <div key={stat.label} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
 <Card className="animate-fade-in text-center p-6 border-border hover:border-electric/30 transition-all hover:shadow-lg">
 <stat.icon className={`h-8 w-8 mx-auto mb-3 ${stat.color}`} />
 <p className="text-3xl md:text-4xl font-heading font-bold text-navy">
 {stat.value}
 </p>
 <p className="text-sm text-text-secondary mt-1">{stat.label}</p>
 </Card>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* Mission Section */}
 <section className="py-20 bg-gradient-to-b from-background to-muted/30">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="grid md:grid-cols-2 gap-12 items-center">
 <div
 >
 <Badge className="mb-4 bg-electric/10 text-electric border-electric/20">
 <Sparkles className="w-3 h-3 mr-1" /> Our Mission
 </Badge>
 <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
 Transforming How India&apos;s Students <span className="text-navy">Build Careers</span>
 </h2>
 <p className="text-text-secondary leading-relaxed mb-6">
 CampusCred was born from a simple observation: millions of talented Indian
 students graduate every year without the practical skills, verified credentials,
 or professional network needed to land their dream jobs.
 </p>
 <p className="text-text-secondary leading-relaxed mb-8">
 We created a platform where students complete real tasks from real companies,
 earn QR-verified digital certificates, build public portfolios, and get
 discovered by employers — all at zero cost. Because talent should never
 be limited by financial barriers.
 </p>
 <div className="space-y-3">
 {['100% free for students forever', 'Real company tasks, not toy projects', 'Industry-recognized QR-verified certificates', 'Public portfolio with CampusCred Score'].map((item) => (
 <div key={item} className="flex items-center gap-3">
 <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
 <span className="text-sm font-medium">{item}</span>
 </div>
 ))}
 </div>
 </div>
 <div
 className="relative"
 >
 <div className="absolute inset-0 bg-gradient-to-br from-electric/20 to-purple/20 rounded-3xl blur-2xl" />
 <div className="relative grid grid-cols-2 gap-4">
 {stats.map((stat, i) => (
 <div
 key={stat.label}
 className="bg-white dark:bg-navy-light rounded-2xl p-6 text-center shadow-lg border border-border"
 >
 <stat.icon className={`h-10 w-10 mx-auto mb-2 ${stat.color}`} />
 <p className="text-2xl font-heading font-bold">{stat.value}</p>
 <p className="text-xs text-text-secondary">{stat.label}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* Values Section */}
 <section className="py-20">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div
 className="text-center mb-12"
 >
 <Badge className="mb-4 bg-purple/10 text-purple border-purple/20">
 <Heart className="w-3 h-3 mr-1" /> Our Values
 </Badge>
 <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
 What We <span className="text-navy">Stand For</span>
 </h2>
 <p className="text-text-secondary max-w-2xl mx-auto">
 Six core principles guide everything we build, every decision we make,
 and every student we serve.
 </p>
 </div>
 <div
 className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
 >
 {values.map((value) => (
 <div key={value.title}>
 <Card className="animate-fade-in p-6 h-full border-border hover:border-electric/30 transition-all hover:shadow-lg group">
 <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${value.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
 <value.icon className="h-6 w-6 text-white" />
 </div>
 <h3 className="text-lg font-heading font-semibold mb-2">{value.title}</h3>
 <p className="text-sm text-text-secondary leading-relaxed">{value.description}</p>
 </Card>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* Timeline / Milestones */}
 <section className="py-20 bg-muted/30">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div
 className="text-center mb-12"
 >
 <Badge className="mb-4 bg-gold/10 text-gold-light border-gold/20">
 <Star className="w-3 h-3 mr-1" /> Our Journey
 </Badge>
 <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
 Milestones That <span className="text-navy">Define Us</span>
 </h2>
 </div>
 <div className="max-w-3xl mx-auto space-y-6">
 {milestones.map((milestone, i) => (
 <div
 key={i}
 className="flex gap-4 items-start"
 >
 <div className="flex flex-col items-center shrink-0">
 <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold">
 {milestone.year.slice(2)}
 </div>
 {i < milestones.length - 1 && (
 <div className="w-0.5 h-full bg-gradient-to-b from-electric/50 to-transparent mt-2" />
 )}
 </div>
 <div className="pb-6">
 <Badge variant="outline" className="mb-2 text-xs">{milestone.year}</Badge>
 <p className="text-sm leading-relaxed">{milestone.event}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* Team Section */}
 <section className="py-20">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div
 className="text-center mb-12"
 >
 <Badge className="mb-4 bg-electric/10 text-electric border-electric/20">
 <Users className="w-3 h-3 mr-1" /> Our Team
 </Badge>
 <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
 The People Behind <span className="text-navy">CampusCred</span>
 </h2>
 <p className="text-text-secondary max-w-2xl mx-auto">
 A passionate team of builders, educators, and dreamers committed to
 transforming student careers across India.
 </p>
 </div>
 <div
 className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
 >
 {team.map((member) => (
 <div key={member.name}>
 <Card className="animate-fade-in p-6 text-center hover:shadow-lg transition-all hover:border-electric/30 group">
 <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${member.gradient} flex items-center justify-center text-white text-lg font-bold mb-3 group-hover:scale-110 transition-transform`}>
 {member.initials}
 </div>
 <h4 className="text-sm font-semibold">{member.name}</h4>
 <p className="text-xs text-text-secondary mt-1">{member.role}</p>
 </Card>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* CTA Section */}
 <section className="py-20 navy-bg">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <div
 >
 <CampusCredLogo size={40} variant="white" className="mx-auto mb-6" />
 <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
 Ready to Build Your <span className="text-electric-light">Cred</span>?
 </h2>
 <p className="text-white/60 max-w-xl mx-auto mb-8">
 Join 50,000+ students already using CampusCred to earn real credentials,
 build portfolios, and accelerate their careers.
 </p>
 <div className="flex flex-wrap justify-center gap-4">
 <a href="/">
 <Button className="bg-navy text-white border-0 gap-2 shadow-lg">
 Get Started Free <ArrowRight className="w-4 h-4" />
 </Button>
 </a>
 <a href="/contact">
 <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
 Contact Us
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
