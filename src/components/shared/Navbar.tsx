'use client';

import React, { useState, useEffect } from 'react';
import {
  LogOut,
  User,
  Shield,
  Building2,
  LayoutDashboard,
  ListChecks,
  Award,
  Globe,
  Home,
  Info,
  Briefcase,
  Users,
  Landmark,
  FolderOpen,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CampusCredLogo } from './CampusCredLogo';
import { ThemeToggle } from './ThemeToggle';
import { useAppStore } from '@/store';
import type { AppView } from '@/store';
import { useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  view: AppView;
  icon: React.ReactNode;
}

/**
 * Navbar
 *
 * Design rules:
 * - Height: 64px desktop, 56px mobile
 * - Background: ALWAYS white — no transparent, no glassmorphism
 * - 1px bottom border #E2E8F0
 * - On scroll past 80px: add subtle shadow 0 2px 8px rgba(0,0,0,0.08)
 * - Nav links: Inter Medium 15px, #0A0F2C
 * - Active nav link: Electric Blue #3B82F6
 * - Hover nav link: Electric Blue #3B82F6
 * - No animated underlines or fancy effects
 * - Logo: Full logo height 36px, links to homepage (or dashboard when authenticated)
 * - Logo variant: ALWAYS 'dark' (navy on white bg)
 * - Mobile: Clean slide-in menu from right, white background, full height
 * - No glassmorphism, no backdrop-blur, no transparent overlays
 * - 4px spacing grid throughout
 */
export function Navbar() {
  const { currentView, navigate, user, isAuthenticated, logout, language, setLanguage, isDarkMode } = useAppStore();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getNavItems = (): NavItem[] => {
    if (!isAuthenticated) {
      return [
        { label: 'Home', view: 'landing', icon: <Home className="h-4 w-4" /> },
        { label: 'About', view: 'landing', icon: <Info className="h-4 w-4" /> },
        { label: 'For Companies', view: 'company-register', icon: <Building2 className="h-4 w-4" /> },
        { label: 'For Mentors', view: 'mentor-register', icon: <Users className="h-4 w-4" /> },
      ];
    }
    if (user?.role === 'admin') {
      return [{ label: 'Admin Panel', view: 'admin', icon: <Shield className="h-4 w-4" /> }];
    }
    if (user?.role === 'company') {
      return [{ label: 'Company Dashboard', view: 'company', icon: <Building2 className="h-4 w-4" /> }];
    }
    if (user?.role === 'mentor') {
      return [{ label: 'Mentor Dashboard', view: 'mentor', icon: <Users className="h-4 w-4" /> }];
    }
    if (user?.role === 'college') {
      return [{ label: 'College Dashboard', view: 'college', icon: <Landmark className="h-4 w-4" /> }];
    }
    return [
      { label: 'Dashboard', view: 'dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
      { label: 'My Tasks', view: 'task', icon: <ListChecks className="h-4 w-4" /> },
      { label: 'Certificates', view: 'certificate', icon: <Award className="h-4 w-4" /> },
      { label: 'Portfolio', view: 'portfolio', icon: <FolderOpen className="h-4 w-4" /> },
    ];
  };

  const navItems = getNavItems();

  const handleNavigate = (view: AppView) => {
    // Map Zustand views to Next.js routes
    const routeMap: Partial<Record<AppView, string>> = {
      landing: '/',
      login: '/login',
      register: '/register',
      onboarding: '/onboarding',
      dashboard: '/dashboard',
      task: '/dashboard/tasks',
      certificate: '/dashboard/certificates',
      portfolio: '/dashboard/portfolio',
      admin: '/admin',
      company: '/company/dashboard',
      mentor: '/mentor/dashboard',
      college: '/college/dashboard',
      'company-register': '/company/register',
      'mentor-register': '/mentor/register',
      'college-register': '/college/register',
      security: '/dashboard/settings/security',
    };
    const route = routeMap[view];
    if (route) {
      router.push(route);
    } else {
      navigate(view);
    }
    setMobileOpen(false);
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-shadow duration-200 bg-white dark:bg-navy dark:border-navy-lighter ${
        isScrolled ? 'navbar-scrolled' : ''
      }`}
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo — height 36px, links to homepage or dashboard */}
        <button
          onClick={() => handleNavigate(isAuthenticated ? 'dashboard' : 'landing')}
          className="flex items-center focus:outline-none"
          aria-label="CampusCred Home"
        >
          <CampusCredLogo
            size={36}
            variant={isDarkMode ? 'white' : 'dark'}
            animate={false}
          />
        </button>

        {/* Desktop Navigation — Inter Medium 15px */}
        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavigate(item.view)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[15px] font-medium transition-colors duration-200 ${
                currentView === item.view
                  ? 'text-electric'
                  : 'text-text-secondary dark:text-white/60 dark:hover:text-electric-light hover:text-electric'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <ThemeToggle />

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="h-8 gap-1 rounded-full px-3 text-xs font-medium text-text-secondary dark:text-white/60 dark:hover:text-white hover:text-foreground"
          >
            <Globe className="h-3.5 w-3.5" />
            {language === 'en' ? 'EN' : 'HI'}
          </Button>

          {isAuthenticated && user ? (
            /* User Avatar Dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9 border-2 border-electric/30">
                    <AvatarImage src={user.profilePhoto} alt={user.fullName} />
                    <AvatarFallback className="bg-navy text-white text-xs font-bold">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none" style={{ color: '#0A0F2C' }}>{user.fullName}</p>
                    <p className="text-xs leading-none" style={{ color: '#64748B' }}>{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigate('dashboard')} className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Login / Register Buttons — using defined button styles */
            <div className="hidden items-center gap-2 sm:flex">
              <button
                onClick={() => handleNavigate('login')}
                className="btn-ghost text-sm px-4 py-2"
              >
                Login
              </button>
              <button
                onClick={() => handleNavigate('register')}
                className="btn-primary text-sm px-4 py-2"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                >
                  <Menu className="h-5 w-5 dark:text-white" style={{ color: 'var(--foreground)' }} />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-white dark:bg-navy-light dark:text-white">
                <SheetHeader>
                  <SheetTitle className="flex items-center">
                    <CampusCredLogo size={32} variant={isDarkMode ? 'white' : 'dark'} />
                  </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col gap-1 px-2 pt-4">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleNavigate(item.view)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        currentView === item.view
                          ? 'text-electric bg-electric/10'
                          : 'text-text-secondary hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}

                  <div className="my-3 h-px dark:bg-navy-lighter" style={{ backgroundColor: 'var(--border)' }} />

                  {/* Dark mode toggle in mobile menu */}
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm font-medium text-text-secondary dark:text-white/60">Dark Mode</span>
                    <ThemeToggle />
                  </div>

                  <div className="my-3 h-px dark:bg-navy-lighter" style={{ backgroundColor: 'var(--border)' }} />

                  {!isAuthenticated ? (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleNavigate('login')}
                        className="btn-secondary w-full text-sm py-2"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => handleNavigate('register')}
                        className="btn-primary w-full text-sm py-2"
                      >
                        Register
                      </button>
                    </div>
                  ) : user ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 rounded-lg px-3 py-2">
                        <Avatar className="h-8 w-8 border border-electric/30">
                          <AvatarImage src={user.profilePhoto} alt={user.fullName} />
                          <AvatarFallback className="bg-navy text-white text-xs font-bold">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium dark:text-white" style={{ color: 'var(--foreground)' }}>{user.fullName}</span>
                          <span className="text-xs dark:text-white/60" style={{ color: 'var(--muted-foreground)' }}>{user.email}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => { logout(); setMobileOpen(false); }}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  ) : null}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
