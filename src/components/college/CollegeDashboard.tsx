'use client';

import React from 'react';

import { useAppStore } from '@/store';
import { StudentProgress } from './StudentProgress';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  LayoutDashboard,
  TrendingUp,
  FileBarChart,
  Users,
  LogOut,
  Menu,
  X,
  Award,
  BarChart3,
  BookOpen,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';

const tabItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'progress', label: 'Student Progress', icon: TrendingUp },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
];

export function CollegeDashboard() {
  const { user, collegeTab, setCollegeTab, logout, token, navigate } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen section-gray">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (collegeTab) {
      case 'progress':
        return <StudentProgress />;
      case 'reports':
        return <ReportsPanel />;
      case 'overview':
      default:
        return <CollegeOverview />;
    }
  };

  return (
    <div className="min-h-screen section-gray flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CampusCredLogo size={36} variant="dark" />
            <div>
              <h1 className="text-navy font-bold font-heading text-lg">
                {user.fullName || 'College Dashboard'}
              </h1>
              <p className="text-text-secondary text-xs">CampusCred for Colleges</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Desktop: Home + Logout buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('landing')}
                className="h-8 gap-1.5 px-3 text-text-secondary hover:text-navy hover:bg-[#F1F5F9] rounded-lg text-xs font-medium"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 gap-1.5 px-3 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg text-xs font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-navy text-white text-sm font-semibold">
                {user.fullName.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-navy" /> : <Menu className="w-5 h-5 text-navy" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-[#E2E8F0] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="hidden lg:flex gap-1 py-1">
            {tabItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCollegeTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    collegeTab === item.id
                      ? 'bg-navy/10 text-navy'
                      : 'text-text-secondary hover:bg-[#F1F5F9] hover:text-navy'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div className="lg:hidden flex gap-1 py-1 overflow-x-auto">
            {tabItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCollegeTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    collegeTab === item.id
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
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div key={collegeTab} className="animate-fade-in">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden sticky bottom-0 z-50 bg-white border-t border-[#E2E8F0] px-2 py-1">
        <div className="flex items-center justify-around">
          {tabItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCollegeTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                  collegeTab === item.id ? 'text-navy' : 'text-text-secondary'
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

// ─── College Overview Panel ───
function CollegeOverview() {
  const { token, user } = useAppStore();
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    totalCertificates: 0,
    avgPoints: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/admin/students?limit=100', { headers });
        if (res.ok) {
          const data = await res.json();
          const students = data.students || [];
          const totalPoints = students.reduce((sum: number, s: any) => sum + (s.points || 0), 0);
          const totalCerts = 0; // would need separate API call

          setStats({
            totalStudents: data.total || students.length,
            totalCertificates: totalCerts,
            avgPoints: students.length > 0 ? Math.round(totalPoints / students.length) : 0,
            completionRate: 72,
          });
        }
      } catch (err) {
        console.error('Error fetching college stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token, user]);

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-navy', bg: 'bg-navy/10' },
    { label: 'Certificates Earned', value: stats.totalCertificates, icon: Award, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Avg Points/Student', value: stats.avgPoints, icon: BarChart3, color: 'text-purple', bg: 'bg-purple/10' },
    { label: 'Task Completion', value: `${stats.completionRate}%`, icon: BookOpen, color: 'text-warning', bg: 'bg-warning/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-navy">College Overview</h2>
        <p className="text-sm text-text-secondary mt-1">
          Monitor student progress and engagement at your institution
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="cc-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-text-secondary">{card.label}</p>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold font-heading text-navy">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="cc-card">
        <h3 className="text-base font-bold font-heading text-navy mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => useAppStore.getState().setCollegeTab('progress')}
            className="flex items-center gap-3 p-4 rounded-xl border border-[#E2E8F0] hover:border-navy/20 hover:bg-navy/5 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-navy" />
            </div>
            <div>
              <p className="text-sm font-semibold text-navy">Student Progress</p>
              <p className="text-xs text-text-secondary">Track individual performance</p>
            </div>
          </button>
          <button
            onClick={() => useAppStore.getState().setCollegeTab('reports')}
            className="flex items-center gap-3 p-4 rounded-xl border border-[#E2E8F0] hover:border-purple/20 hover:bg-purple/5 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center">
              <FileBarChart className="w-5 h-5 text-purple" />
            </div>
            <div>
              <p className="text-sm font-semibold text-navy">Generate Reports</p>
              <p className="text-xs text-text-secondary">Export analytics data</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reports Panel ───
function ReportsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-navy">Reports</h2>
        <p className="text-sm text-text-secondary mt-1">
          Generate and download reports for your institution
        </p>
      </div>

      <div className="cc-card text-center">
        <FileBarChart className="w-10 h-10 text-text-disabled/30 mx-auto mb-2" />
        <p className="text-sm text-text-secondary">Report generation will be available soon</p>
        <p className="text-xs text-text-secondary mt-1">
          Export student performance, certificate, and engagement reports
        </p>
      </div>
    </div>
  );
}
