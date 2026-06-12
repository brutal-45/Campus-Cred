'use client';

import React from 'react';
import { useAppStore, User } from '@/store';
import dynamic from 'next/dynamic';

// Lazy load heavy components for better performance
const Navbar = dynamic(() => import('@/components/shared/Navbar').then(m => ({ default: m.Navbar })), { ssr: false });
const Footer = dynamic(() => import('@/components/shared/Footer').then(m => ({ default: m.Footer })), { ssr: false });
const HeroSection = dynamic(() => import('@/components/landing/HeroSection').then(m => ({ default: m.HeroSection })), { ssr: false });
const HowItWorks = dynamic(() => import('@/components/landing/HowItWorks').then(m => ({ default: m.HowItWorks })), { ssr: false });
const BranchPreview = dynamic(() => import('@/components/landing/BranchPreview').then(m => ({ default: m.BranchPreview })), { ssr: false });
const TestimonialsCarousel = dynamic(() => import('@/components/landing/TestimonialsCarousel').then(m => ({ default: m.TestimonialsCarousel })), { ssr: false });
const CompanyLogos = dynamic(() => import('@/components/landing/CompanyLogos').then(m => ({ default: m.CompanyLogos })), { ssr: false });
const CTASection = dynamic(() => import('@/components/landing/CTASection').then(m => ({ default: m.CTASection })), { ssr: false });
const RoleCards = dynamic(() => import('@/components/landing/RoleCards').then(m => ({ default: m.RoleCards })), { ssr: false });
const OnboardingFlow = dynamic(() => import('@/components/onboarding/OnboardingFlow').then(m => ({ default: m.OnboardingFlow })), { ssr: false });
const StudentDashboard = dynamic(() => import('@/components/dashboard/StudentDashboard').then(m => ({ default: m.StudentDashboard })), { ssr: false });
const TaskPage = dynamic(() => import('@/components/task/TaskPage').then(m => ({ default: m.TaskPage })), { ssr: false });
const CertificatePage = dynamic(() => import('@/components/certificate/CertificatePage').then(m => ({ default: m.CertificatePage })), { ssr: false });
const VerifyPage = dynamic(() => import('@/components/certificate/VerifyPage').then(m => ({ default: m.VerifyPage })), { ssr: false });
const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })), { ssr: false });
const CompanyDashboard = dynamic(() => import('@/components/company/CompanyDashboard').then(m => ({ default: m.CompanyDashboard })), { ssr: false });
const MentorDashboard = dynamic(() => import('@/components/mentor/MentorDashboard').then(m => ({ default: m.MentorDashboard })), { ssr: false });
const CollegeDashboard = dynamic(() => import('@/components/college/CollegeDashboard').then(m => ({ default: m.CollegeDashboard })), { ssr: false });
const MentorRegisterForm = dynamic(() => import('@/components/mentor/MentorRegisterForm').then(m => ({ default: m.MentorRegisterForm })), { ssr: false });
const CollegeRegisterForm = dynamic(() => import('@/components/college/CollegeRegisterForm').then(m => ({ default: m.CollegeRegisterForm })), { ssr: false });

// Auth pages
const LoginPage = dynamic(() => import('@/components/auth/LoginPage').then(m => ({ default: m.LoginPage })), { ssr: false });
const ForgotPasswordPage = dynamic(() => import('@/components/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })), { ssr: false });
const ResetPasswordPage = dynamic(() => import('@/components/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })), { ssr: false });
const AccountSecurityPage = dynamic(() => import('@/components/auth/AccountSecurityPage').then(m => ({ default: m.AccountSecurityPage })), { ssr: false });
const HallOfFamePage = dynamic(() => import('@/components/portfolio/HallOfFamePage').then(m => ({ default: m.HallOfFamePage })), { ssr: false });

import { ArrowRight, Sparkles, Shield, Building2, BookOpen, Landmark, GraduationCap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { toast } from 'sonner';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { BackButton } from '@/components/shared/BackButton';
import { PLATFORM_DOMAIN } from '@/lib/constants';
import { AuthProvider } from '@/providers/AuthProvider';

// ─── Company Register Form Component ───
function CompanyRegisterForm() {
  const { setUser, setToken, navigate } = useAppStore();
  const [form, setForm] = React.useState({
    fullName: '',
    email: '',
    password: '',
    companyName: '',
    industry: '',
    website: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'company' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Registration failed');
        return;
      }
      setUser(data.user as User);
      setToken(data.token);
      navigate('company');
      toast.success('Welcome to CampusCred!');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
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
            <h1 className="text-2xl font-bold font-heading text-navy">Register Your Company</h1>
            <p className="text-sm text-text-secondary mt-1">Post micro-internships and discover talented students</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium">Contact Name</label>
                    <Input value={form.fullName} onChange={(e) => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium">Company Name</label>
                    <Input value={form.companyName} onChange={(e) => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="Company name" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium">Email</label>
                  <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="work@company.com" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-medium">Password</label>
                  <Input type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium">Industry</label>
                    <Input value={form.industry} onChange={(e) => setForm(f => ({ ...f, industry: e.target.value }))} placeholder="e.g., FinTech" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-medium">Website</label>
                    <Input value={form.website} onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full btn-primary text-white hover:opacity-90 transition-opacity font-semibold gap-2">
                  {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Register Company <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </form>
            </CardContent>
          </Card>
          <p className="text-center text-xs text-text-secondary mt-4">
            Already have an account?{' '}
            <button onClick={() => navigate('login')} className="text-electric hover:underline font-medium">Sign in</button>
            <span className="mx-2">|</span>
            <button onClick={() => navigate('landing')} className="text-electric hover:underline font-medium">Back to Home</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Landing Page Component ───
function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <CompanyLogos />
        <HowItWorks />
        <RoleCards />
        <BranchPreview />
        <TestimonialsCarousel />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

// ─── Main App Router (inner) ───
function AppRouter() {
  const { currentView, isAuthenticated, user } = useAppStore();

  // Public verification page (no auth, no navbar/footer)
  if (currentView === 'verify') {
    return <VerifyPage />;
  }

  // Landing page
  if (currentView === 'landing' && !isAuthenticated) {
    return <LandingPage />;
  }

  // Onboarding / Registration flow
  if (currentView === 'onboarding' || currentView === 'register') {
    return <OnboardingFlow />;
  }

  // Company registration
  if (currentView === 'company-register') {
    return <CompanyRegisterForm />;
  }

  // Mentor registration
  if (currentView === 'mentor-register') {
    return <MentorRegisterForm />;
  }

  // College registration
  if (currentView === 'college-register') {
    return <CollegeRegisterForm />;
  }

  // Login page (new full-featured LoginPage component)
  if (currentView === 'login' && !isAuthenticated) {
    return <LoginPage />;
  }

  // Forgot password page
  if (currentView === 'forgot-password') {
    return <ForgotPasswordPage />;
  }

  // Reset password page
  if (currentView === 'reset-password') {
    return <ResetPasswordPage />;
  }

  // Authenticated pages
  if (isAuthenticated && user) {
    // Account security settings
    if (currentView === 'security') {
      return <AccountSecurityPage />;
    }

    // Hall of Fame
    if (currentView === 'hall-of-fame') {
      return <HallOfFamePage />;
    }

    // Admin dashboard
    if (user.role === 'admin' || currentView === 'admin') {
      return <AdminDashboard />;
    }

    // Company dashboard
    if (user.role === 'company' || currentView === 'company') {
      return <CompanyDashboard />;
    }

    // Mentor dashboard
    if (user.role === 'mentor' || currentView === 'mentor') {
      return <MentorDashboard />;
    }

    // College dashboard
    if (user.role === 'college' || currentView === 'college') {
      return <CollegeDashboard />;
    }

    // Student pages
    switch (currentView) {
      case 'task':
        return <TaskPage />;
      case 'certificate':
        return <CertificatePage />;
      case 'dashboard':
      default:
        return <StudentDashboard />;
    }
  }

  // Default: show landing page
  return <LandingPage />;
}

// ─── Main App Entry ───
export default function Home() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
