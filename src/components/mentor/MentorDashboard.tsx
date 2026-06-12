'use client';

import React from 'react';

import { useAppStore } from '@/store';
import { ReviewQueue } from './ReviewQueue';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FileCheck,
  Users,
  Calendar,
  LogOut,
  Menu,
  X,
  GraduationCap,
  BookOpen,
  Star,
  Clock,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/shared/BackButton';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';

const tabItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'review', label: 'Review Submissions', icon: FileCheck },
  { id: 'students', label: 'My Students', icon: Users },
  { id: 'sessions', label: 'Sessions', icon: Calendar },
];

export function MentorDashboard() {
  const { user, mentorTab, setMentorTab, logout, token, navigate } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const [stats, setStats] = React.useState({
    totalReviewed: 0,
    pendingReview: 0,
    totalStudents: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/admin/submissions?status=Pending', { headers });
        if (res.ok) {
          const data = await res.json();
          setStats((prev) => ({
            ...prev,
            pendingReview: data.submissions?.length || 0,
          }));
        }
      } catch (err) {
        console.error('Error fetching mentor stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (mentorTab) {
      case 'review':
        return <ReviewQueue />;
      case 'students':
        return <MyStudentsPanel />;
      case 'sessions':
        return <SessionsPanel />;
      case 'overview':
      default:
        return <MentorOverview stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Gradient header */}
      <div className="navy-bg py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CampusCredLogo size={36} variant="dark" />
            <div>
              <h1 className="text-white font-bold font-heading text-lg">
                Mentor Dashboard
              </h1>
              <p className="text-white/50 text-xs">CampusCred for Mentors</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Desktop: Home + Logout buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('landing')}
                className="h-8 gap-1.5 px-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-xs font-medium"
              >
                <Home className="w-3.5 h-3.5" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 gap-1.5 px-3 text-white/70 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-xs font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </Button>
            </div>
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-navy text-white text-sm font-semibold">
                {user.fullName.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="hidden lg:flex gap-1 py-1">
            {tabItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setMentorTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    mentorTab === item.id
                      ? 'bg-purple/10 text-purple'
                      : 'text-text-secondary hover:bg-muted hover:text-foreground'
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
                  onClick={() => setMentorTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    mentorTab === item.id
                      ? 'bg-purple/10 text-purple'
                      : 'text-text-secondary hover:bg-muted'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
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
          <div key={mentorTab} className="animate-fade-in">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden sticky bottom-0 z-50 bg-card border-t border-border px-2 py-1">
        <div className="flex items-center justify-around">
          {tabItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setMentorTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                  mentorTab === item.id ? 'text-purple' : 'text-text-secondary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-medium">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => navigate('landing')}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-text-secondary hover:text-electric transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-medium">Home</span>
          </button>
          <button
            onClick={logout}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-text-secondary hover:text-danger transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[9px] font-medium">Sign Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

// ─── Overview Panel ───
function MentorOverview({ stats }: { stats: { totalReviewed: number; pendingReview: number; totalStudents: number; avgRating: number } }) {
  const { user, token } = useAppStore();
  const [overviewStats, setOverviewStats] = React.useState(stats);

  React.useEffect(() => {
    const fetchOverview = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Fetch mentor's reviewed submissions
        const [pendingRes, reviewedRes] = await Promise.all([
          fetch('/api/admin/submissions?status=Pending', { headers }),
          fetch('/api/admin/submissions?status=Approved', { headers }),
        ]);

        let pendingCount = 0;
        let reviewedCount = 0;

        if (pendingRes.ok) {
          const data = await pendingRes.json();
          pendingCount = data.submissions?.length || 0;
        }

        if (reviewedRes.ok) {
          const data = await reviewedRes.json();
          reviewedCount = data.submissions?.length || 0;
        }

        setOverviewStats({
          totalReviewed: reviewedCount,
          pendingReview: pendingCount,
          totalStudents: 12,
          avgRating: 4.7,
        });
      } catch (err) {
        console.error('Error fetching overview:', err);
      }
    };
    fetchOverview();
  }, [token]);

  const statCards = [
    { label: 'Pending Reviews', value: overviewStats.pendingReview, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Total Reviewed', value: overviewStats.totalReviewed, icon: FileCheck, color: 'text-purple', bg: 'bg-purple/10' },
    { label: 'My Students', value: overviewStats.totalStudents, icon: Users, color: 'text-electric', bg: 'bg-electric/10' },
    { label: 'Avg Rating', value: overviewStats.avgRating, icon: Star, color: 'text-gold', bg: 'bg-gold/10', isFloat: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground">
          Welcome, {user?.fullName}!
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Review student submissions and guide the next generation
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-text-secondary">{card.label}</p>
                  <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold font-heading">
                  {card.isFloat ? card.value.toFixed(1) : card.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick actions */}
      <Card style={{ borderColor: '#E2E8F0' }}>
        <CardContent className="p-6">
          <h3 className="text-base font-bold font-heading mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => useAppStore.getState().setMentorTab('review')}
              className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-purple/30 hover:bg-purple/5 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-purple/10 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-purple" />
              </div>
              <div>
                <p className="text-sm font-semibold">Review Submissions</p>
                <p className="text-xs text-text-secondary">{overviewStats.pendingReview} pending</p>
              </div>
            </button>
            <button
              onClick={() => useAppStore.getState().setMentorTab('students')}
              className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-electric/30 hover:bg-electric/5 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-electric/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-electric" />
              </div>
              <div>
                <p className="text-sm font-semibold">My Students</p>
                <p className="text-xs text-text-secondary">View progress</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── My Students Panel ───
function MyStudentsPanel() {
  const { token } = useAppStore();
  const [students, setStudents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/admin/students?limit=20', { headers });
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [token]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Legend': return 'bg-gold/10 text-gold border-gold/20';
      case 'Pro': return 'bg-purple/10 text-purple border-purple/20';
      case 'Expert': return 'bg-electric/10 text-electric border-electric/20';
      case 'Achiever': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-text-secondary border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground">My Students</h2>
        <p className="text-sm text-text-secondary mt-1">
          Track progress of students you are mentoring
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="skeleton-shimmer">
              <CardContent className="p-5">
                <div className="h-5 bg-muted rounded w-1/2 mb-3" />
                <div className="h-3 bg-muted rounded w-2/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-10 h-10 text-text-secondary/30 mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No students assigned yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {students.map((student: any) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-navy text-white text-xs font-semibold">
                      {student.fullName.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{student.fullName}</p>
                    <p className="text-xs text-text-secondary truncate">
                      {student.degree && student.branch ? `${student.degree} - ${student.branch}` : student.college || 'No info'}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${getLevelColor(student.level)}`}>
                    {student.level}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-sm font-bold">{student.points}</p>
                    <p className="text-[9px] text-text-secondary">Points</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-sm font-bold">{student.streakDays || 0}</p>
                    <p className="text-[9px] text-text-secondary">Streak</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-sm font-bold">0</p>
                    <p className="text-[9px] text-text-secondary">Certs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sessions Panel ───
function SessionsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground">Sessions</h2>
        <p className="text-sm text-text-secondary mt-1">
          Schedule and manage mentoring sessions
        </p>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="w-10 h-10 text-text-secondary/30 mx-auto mb-2" />
          <p className="text-sm text-text-secondary">No sessions scheduled</p>
          <p className="text-xs text-text-secondary mt-1">
            Session scheduling will be available soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
