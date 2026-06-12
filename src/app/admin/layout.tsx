'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  ListTodo,
  FileCheck,
  Award,
  UserCheck,
  BarChart3,
  ShieldAlert,
  Megaphone,
  LogOut,
  Home,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { useAppStore } from '@/store';

const sidebarItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/companies', label: 'Companies', icon: Building2 },
  { href: '/admin/colleges', label: 'Colleges', icon: GraduationCap },
  { href: '/admin/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/admin/submissions', label: 'Submissions', icon: FileCheck },
  { href: '/admin/certificates', label: 'Certificates', icon: Award },
  { href: '/admin/mentors', label: 'Mentors', icon: UserCheck },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/fraud', label: 'Fraud Detection', icon: ShieldAlert },
  { href: '/admin/ambassadors', label: 'Ambassadors', icon: Megaphone },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, navigate } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top header - mobile */}
      <header className="lg:hidden sticky top-0 z-50 bg-card border-b px-4 py-3" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <CampusCredLogo size={28} variant="dark" />
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-danger text-white text-xs font-semibold">
                AD
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div
          className="animate-fade-in lg:hidden fixed inset-x-0 top-[57px] z-40 bg-card border-b shadow-lg max-h-[70vh] overflow-y-auto"
          style={{ borderColor: '#E2E8F0' }}
        >
          <div className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-danger/10 text-danger'
                      : 'text-text-secondary hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className={`hidden lg:flex flex-col sticky top-0 h-screen navy-bg transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
          {/* Sidebar header */}
          <div className={`p-5 border-b border-white/10 ${collapsed ? 'px-3' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-danger rounded-xl flex items-center justify-center shadow-lg shrink-0">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div>
                  <h1 className="font-bold text-white font-heading text-base">CampusCred</h1>
                  <p className="text-[11px] text-white/50">Admin Panel</p>
                </div>
              )}
            </div>
          </div>

          {/* Admin user info */}
          <div className={`p-4 border-b border-white/10 ${collapsed ? 'px-3' : ''}`}>
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarFallback className="bg-danger text-white text-sm font-semibold">
                  AD
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'Admin'}</p>
                  <p className="text-[10px] text-white/50 truncate">Super Admin</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-danger text-white shadow-lg shadow-danger/25'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-3 border-t border-white/10 space-y-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
              {!collapsed && <span>Collapse</span>}
            </button>
            <button
              onClick={() => navigate('landing')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              {!collapsed && <span>Back to Home</span>}
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:bg-danger/20 hover:text-danger transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            <div key={pathname} className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom navigation - mobile */}
      <nav className="lg:hidden sticky bottom-0 z-50 bg-card border-t px-1 py-1" style={{ borderColor: '#E2E8F0' }}>
        <div className="flex items-center justify-around overflow-x-auto">
          {sidebarItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[56px] ${
                  isActive(item.href) ? 'text-danger' : 'text-text-secondary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[8px] font-medium leading-tight">{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/admin/fraud"
            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[56px] ${
              isActive('/admin/fraud') ? 'text-danger' : 'text-text-secondary'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="text-[8px] font-medium leading-tight">Fraud</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
