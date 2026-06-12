'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { WelcomeBanner } from './WelcomeBanner';
import { AvailableTasks } from './AvailableTasks';
import { MySubmissions } from './MySubmissions';
import { MyCertificates } from './MyCertificates';
import { LeaderboardWidget } from './LeaderboardWidget';
import { LevelBadge } from './LevelBadge';
import { StreakTracker } from './StreakTracker';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import {
  LayoutDashboard,
  FileText,
  Send,
  Award,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
  Home,
  Trophy,
  Globe,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const sidebarItems = [
  { id: 'tasks', label: 'Tasks', icon: FileText },
  { id: 'submissions', label: 'My Submissions', icon: Send },
  { id: 'certificates', label: 'Certificates', icon: Award },
];

const actionItems = [
  { id: 'hall-of-fame', label: 'Hall of Fame', icon: Trophy, navigate: true },
];

const dashboardLinkItems = [
  { label: 'Portfolio', href: '/dashboard/portfolio', icon: Globe },
  { label: 'Challenges', href: '/dashboard/challenges', icon: Sparkles },
  { label: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy },
];

const utilityItems = [
  { id: 'security', label: 'Security', icon: Settings, navigate: true },
];

/**
 * StudentDashboard
 *
 * Design rules:
 * - 240px (w-60) navy sidebar on desktop, white text
 * - Sidebar active: electric blue bg at 15% + 3px left border
 * - Sidebar hover: white at 5% bg
 * - Main content: #F8FAFC (section-gray) background
 * - Desktop top bar: white bg, 1px border bottom, 64px height
 * - Mobile: 56px header, bottom nav with 5 items
 * - No glassmorphism, no continuous animations
 * - Simple fade-in for page transitions (300ms CSS)
 * - 4px spacing grid throughout
 */
export function StudentDashboard() {
  const { user, dashboardTab, setDashboardTab, logout, navigate } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen section-gray">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  const handleBrowseTasks = () => {
    setDashboardTab('tasks');
  };

  const renderContent = () => {
    switch (dashboardTab) {
      case 'tasks':
        return <AvailableTasks />;
      case 'submissions':
        return <MySubmissions />;
      case 'certificates':
        return <MyCertificates />;
      default:
        return <AvailableTasks />;
    }
  };

  return (
    <div className="min-h-screen section-gray flex flex-col">
      {/* Top header - mobile */}
      <header className="lg:hidden sticky top-0 z-50 bg-white dark:bg-navy h-14 flex items-center px-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 dark:text-white" /> : <Menu className="w-5 h-5 dark:text-white" />}
            </button>
            <CampusCredLogo size={32} variant="icon" />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
              <Bell className="w-5 h-5 text-text-secondary" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
            </button>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-navy text-white text-xs font-semibold">
                {user.fullName.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Mobile dropdown menu — simple fade, no sliding */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-x-0 top-14 z-40 bg-white dark:bg-navy-light shadow-lg animate-fade-in"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setDashboardTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    dashboardTab === item.id
                      ? 'bg-electric/10 text-electric'
                      : 'text-text-secondary hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            <Separator className="my-2" />
            <LevelBadge level={user.level} points={user.points} compact campusCredScore={user.campusCredScore} showScore />
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop sidebar — 240px navy */}
        <aside className="hidden lg:flex flex-col w-60 bg-navy sticky top-0 h-screen">
          {/* Sidebar header with logo */}
          <div className="h-16 flex items-center px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
            <button onClick={() => navigate('landing')} className="focus:outline-none">
              <CampusCredLogo size={34} variant="white" />
            </button>
          </div>

          {/* User info */}
          <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-navy-lighter text-white text-sm font-semibold">
                  {user.fullName.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                <p className="text-xs text-white/50 truncate">
                  {user.degree} • {user.branch}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = dashboardTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setDashboardTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'sidebar-active text-electric'
                      : 'border-l-[3px] border-transparent sidebar-hover text-white/70 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}

            <Separator className="my-3 bg-white/10" />

            {/* Action items */}
            {actionItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id as any)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 sidebar-hover hover:text-white transition-colors duration-200 border-l-[3px] border-transparent"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}

            {/* Portfolio Link */}
            {user.campusCredUsername && (
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

            <Separator className="my-3 bg-white/10" />

            {/* New Dashboard Links */}
            <p className="px-3 text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">More</p>
            {dashboardLinkItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 sidebar-hover hover:text-white transition-colors duration-200 border-l-[3px] border-transparent"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  <ExternalLink className="w-3 h-3 ml-auto" />
                </Link>
              );
            })}

            <Link
              href="/dashboard"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 sidebar-hover hover:text-white mt-2 transition-colors duration-200 border-l-[3px] border-transparent"
            >
              <LayoutDashboard className="w-4 h-4" />
              Full Dashboard
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Link>

            <Separator className="my-3 bg-white/10" />

            {/* Level badge in sidebar */}
            <div className="px-1">
              <LevelBadge level={user.level} points={user.points} campusCredScore={user.campusCredScore} />
            </div>

            <div className="px-1 mt-2">
              <StreakTracker streakDays={user.streakDays} />
            </div>

            <Separator className="my-3 bg-white/10" />

            {/* Leaderboard widget */}
            <LeaderboardWidget />
          </nav>

          {/* Sidebar footer */}
          <div className="p-3 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
            {utilityItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate('security' as any)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 sidebar-hover hover:text-white transition-colors border-l-[3px] border-transparent"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => navigate('landing')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 sidebar-hover hover:text-white transition-colors border-l-[3px] border-transparent"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-danger/10 hover:text-danger transition-colors border-l-[3px] border-transparent"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto section-gray">
          {/* Desktop top bar */}
          <div className="hidden lg:flex items-center h-16 bg-white dark:bg-navy px-8" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary dark:text-white/60">Student Dashboard</span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <ThemeToggle />
              <button className="p-2 rounded-lg hover:bg-muted transition-colors relative">
                <Bell className="w-5 h-5 text-text-secondary" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger" />
              </button>
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-navy text-white text-xs font-semibold">
                  {user.fullName.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            {/* Welcome banner */}
            <WelcomeBanner user={user} onBrowseTasks={handleBrowseTasks} />

            {/* Tab header for content */}
            <div className="mt-6 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setDashboardTab(item.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                          dashboardTab === item.id
                            ? 'bg-white dark:bg-navy-lighter text-foreground dark:text-white shadow-sm'
                            : 'text-text-secondary dark:text-white/60 hover:text-foreground dark:hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content area — simple CSS fade */}
            <div key={dashboardTab} className="animate-fade-in">
              {renderContent()}
            </div>

            {/* Mobile-only leaderboard and widgets below content */}
            <div className="lg:hidden mt-8 space-y-4">
              <LeaderboardWidget />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LevelBadge level={user.level} points={user.points} campusCredScore={user.campusCredScore} />
                <StreakTracker streakDays={user.streakDays} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Bottom navigation - mobile */}
      <nav className="lg:hidden sticky bottom-0 z-50 bg-white dark:bg-navy px-2 py-1" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center justify-around">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setDashboardTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                  dashboardTab === item.id
                    ? 'text-electric'
                    : 'text-text-secondary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => navigate('landing')}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-text-secondary hover:text-electric transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={logout}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-text-secondary hover:text-danger transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-medium">Sign Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
