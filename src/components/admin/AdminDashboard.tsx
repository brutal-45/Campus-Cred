'use client';

import React from 'react';

import { useAppStore } from '@/store';
import { OverviewPanel } from './OverviewPanel';
import { StudentTable } from './StudentTable';
import { SubmissionManager } from './SubmissionManager';
import { TaskManager } from './TaskManager';
import { AnalyticsPanel } from './AnalyticsPanel';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import {
  LayoutDashboard,
  Users,
  FileCheck,
  ListTodo,
  BarChart3,
  LogOut,
  Menu,
  X,
  Shield,
  Home,
} from 'lucide-react';

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'submissions', label: 'Submissions', icon: FileCheck },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export function AdminDashboard() {
  const { user, adminTab, setAdminTab, logout, navigate } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen section-gray">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (adminTab) {
      case 'overview':
        return <OverviewPanel />;
      case 'students':
        return <StudentTable />;
      case 'submissions':
        return <SubmissionManager />;
      case 'tasks':
        return <TaskManager />;
      case 'analytics':
        return <AnalyticsPanel />;
      default:
        return <OverviewPanel />;
    }
  };

  return (
    <div className="min-h-screen section-gray flex flex-col">
      {/* Top header - mobile */}
      <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-[#E2E8F0] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-navy" /> : <Menu className="w-5 h-5 text-navy" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-navy rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-sm font-bold font-heading text-navy">Admin Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-navy text-white text-xs font-semibold">
                AD
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-x-0 top-[57px] z-40 bg-white shadow-lg animate-fade-in"
            style={{ borderColor: '#E2E8F0', borderWidth: '0 0 1px 0' }}
          >
            <div className="p-4 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAdminTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      adminTab === item.id
                        ? 'bg-navy/10 text-navy'
                        : 'text-text-secondary hover:bg-[#F1F5F9]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      <div className="flex flex-1">
        {/* Desktop sidebar - navy background */}
        <aside className="hidden lg:flex flex-col w-60 sticky top-0 h-screen bg-navy">
          {/* Sidebar header */}
          <div className="p-4 border-b border-white/10">
            <CampusCredLogo size={34} variant="white" />
          </div>

          {/* Admin user info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-navy-lighter text-white text-sm font-semibold">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                <p className="text-xs text-white/50 truncate">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAdminTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'sidebar-active text-white'
                      : 'sidebar-hover text-white/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={() => navigate('landing')}
              className="sidebar-hover w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white transition-colors mb-1"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
            <div key={adminTab} className="animate-fade-in">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom navigation - mobile */}
      <nav className="lg:hidden sticky bottom-0 z-50 bg-white border-t border-[#E2E8F0] px-2 py-1">
        <div className="flex items-center justify-around">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setAdminTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                  adminTab === item.id ? 'text-navy' : 'text-text-secondary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => navigate('landing')}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-text-secondary hover:text-navy transition-colors"
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
