'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import {
  LayoutDashboard,
  FileText,
  User,
  Briefcase,
  Zap,
  Users,
  Map,
  MessageSquare,
  Bell,
  Megaphone,
  Trophy,
  LogOut,
  Menu,
  X,
  Home,
  Globe,
  ExternalLink,
  Award,
  Settings,
  ChevronRight,
} from 'lucide-react';

const sidebarNavItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Portfolio', href: '/dashboard/portfolio', icon: User },
  { label: 'Resume', href: '/dashboard/resume', icon: FileText },
  { label: 'Challenges', href: '/dashboard/challenges', icon: Zap },
  { label: 'Mentorship', href: '/dashboard/mentorship', icon: Users },
  { label: 'Journey', href: '/dashboard/journey', icon: Map },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Ambassador', href: '/dashboard/ambassador', icon: Megaphone },
  { label: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
];

const utilityItems = [
  { label: 'Edit Profile', href: '/dashboard/profile', icon: User },
  { label: 'Security', href: '/dashboard', icon: Settings, action: 'security' as const },
];

/**
 * DashboardLayout
 *
 * Design rules:
 * - 240px (w-60) sidebar on desktop — navy bg for student
 * - Sidebar active: electric blue bg at 15% + 3px left border
 * - Sidebar hover: white at 5% bg
 * - Mobile: 56px header, bottom nav with 5 items
 * - Simple CSS fade-in for page transitions (no framer-motion)
 * - 4px spacing grid throughout
 * - No glassmorphism, no continuous animations
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, navigate, isDarkMode } = useAppStore();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top header - mobile */}
      <header className="lg:hidden sticky top-0 z-50 bg-white dark:bg-navy h-14 flex items-center px-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 dark:text-white" /> : <Menu className="w-5 h-5 dark:text-white" />}
            </button>
            <CampusCredLogo size={28} variant={isDarkMode ? 'white' : 'dark'} />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/dashboard/notifications">
              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors relative">
                <Bell className="w-5 h-5 text-text-secondary" />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-danger" />
              </button>
            </Link>
            {user && (
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-electric text-white text-xs font-semibold">
                  {user.fullName.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </header>

      {/* Mobile dropdown menu — simple CSS */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-x-0 top-14 z-40 bg-white dark:bg-navy-light shadow-lg max-h-[70vh] overflow-y-auto animate-fade-in"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="p-4 space-y-1">
            {sidebarNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active ? 'bg-electric/10 text-electric' : 'text-text-secondary hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <Separator className="my-2" />
            <Link
              href="/dashboard/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/dashboard/profile') ? 'bg-electric/10 text-electric' : 'text-text-secondary hover:bg-muted'
              }`}
            >
              <User className="w-4 h-4" />
              Edit Profile
            </Link>
            {user?.campusCredUsername && (
              <a
                href={`/student/${user.campusCredUsername}`}
                target="_blank"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-muted"
              >
                <Globe className="w-4 h-4" />
                My Portfolio
                <ExternalLink className="w-3 h-3 ml-auto" />
              </a>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop sidebar — 240px navy */}
        <aside className={`hidden lg:flex flex-col bg-navy sticky top-0 h-screen transition-all duration-200 ${sidebarCollapsed ? 'w-16' : 'w-60'}`}>
          {/* Sidebar header with logo */}
          <div className="h-16 flex items-center px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
            <button onClick={() => navigate('landing')} className="focus:outline-none">
              <CampusCredLogo size={sidebarCollapsed ? 28 : 34} variant={sidebarCollapsed ? 'icon' : 'white'} />
            </button>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="ml-auto p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <ChevronRight className={`w-3.5 h-3.5 text-white/60 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>

          {/* User info */}
          {user && !sidebarCollapsed && (
            <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-navy-lighter text-white text-sm font-semibold">
                    {user.fullName.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                  <p className="text-[10px] text-white/50 truncate">
                    {user.degree} • {user.branch}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.20)' }}>
                  <div className="h-full rounded-full bg-white" style={{ width: `${Math.min((user.campusCredScore ?? 0) / 10, 100)}%` }} />
                </div>
                <span className="text-[10px] text-white/50">{user.campusCredScore ?? 0}/1000</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <ScrollArea className="flex-1">
            <nav className="p-3 space-y-1">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      active
                        ? 'sidebar-active text-electric'
                        : 'sidebar-hover text-white/70 hover:text-white border-l-[3px] border-transparent'
                    } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!sidebarCollapsed && item.label}
                  </Link>
                );
              })}

              {!sidebarCollapsed && (
                <>
                  <Separator className="my-3 bg-white/10" />
                  {user?.campusCredUsername && (
                    <a
                      href={`/student/${user.campusCredUsername}`}
                      target="_blank"
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 sidebar-hover hover:text-white transition-colors duration-200 border-l-[3px] border-transparent"
                    >
                      <Globe className="w-4 h-4" />
                      My Portfolio
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  )}
                </>
              )}
            </nav>
          </ScrollArea>

          {/* Sidebar footer */}
          <div className="p-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
            {utilityItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              if (item.action === 'security') {
                return (
                  <button
                    key={item.label}
                    onClick={() => navigate('security' as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 sidebar-hover hover:text-white transition-colors border-l-[3px] border-transparent ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!sidebarCollapsed && item.label}
                  </button>
                );
              }
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    active
                      ? 'sidebar-active text-electric'
                      : 'sidebar-hover text-white/70 hover:text-white border-l-[3px] border-transparent'
                  } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && item.label}
                </Link>
              );
            })}
            <button
              onClick={() => navigate('landing')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 sidebar-hover hover:text-white transition-colors border-l-[3px] border-transparent ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
            >
              <Home className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && 'Back to Home'}
            </button>
            <button
              onClick={logout}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-danger/10 hover:text-danger transition-colors border-l-[3px] border-transparent ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && 'Sign Out'}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            <div key={pathname} className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom navigation - mobile */}
      <nav className="lg:hidden sticky bottom-0 z-50 bg-white dark:bg-navy px-2 py-1" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center justify-around">
          {sidebarNavItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                  active ? 'text-electric' : 'text-text-secondary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/dashboard/leaderboard"
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
              isActive('/dashboard/leaderboard') ? 'text-electric' : 'text-text-secondary'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-medium">Ranks</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
