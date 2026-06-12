'use client';

import React from 'react';

import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users,
  FileCheck,
  Award,
  ListTodo,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface StatCard {
  title: string;
  value: number;
  change: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  data: { value: number }[];
}

interface RecentSubmission {
  id: string;
  studentName: string;
  taskTitle: string;
  status: string;
  submittedAt: string;
}

export function OverviewPanel() {
  const { token } = useAppStore();
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    totalSubmissions: 0,
    certificatesIssued: 0,
    activeTasks: 0,
    studentChange: 12,
    submissionChange: 8,
    certChange: 15,
    taskChange: -3,
  });
  const [recentSubmissions, setRecentSubmissions] = React.useState<RecentSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [analyticsRes, subsRes] = await Promise.all([
          fetch('/api/admin/analytics', { headers }),
          fetch('/api/admin/submissions?limit=5', { headers }),
        ]);

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setStats({
            totalStudents: analyticsData.totalStudents || 0,
            totalSubmissions: analyticsData.totalSubmissions || 0,
            certificatesIssued: analyticsData.totalCertificates || 0,
            activeTasks: analyticsData.activeTasks || 0,
            studentChange: 12,
            submissionChange: 8,
            certChange: 15,
            taskChange: -3,
          });
        }

        if (subsRes.ok) {
          const subsData = await subsRes.json();
          setRecentSubmissions(
            (subsData.submissions || subsData).slice(0, 5).map((s: any) => ({
              id: s.id,
              studentName: s.student?.fullName || s.studentName || 'Unknown',
              taskTitle: s.task?.title || s.taskTitle || 'Untitled',
              status: s.status,
              submittedAt: s.submittedAt,
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching overview data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const generateMiniData = (base: number) => {
    return Array.from({ length: 7 }, () => ({
      value: base + Math.floor(Math.random() * base * 0.3),
    }));
  };

  const statCards: StatCard[] = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      change: stats.studentChange,
      icon: Users,
      color: 'text-electric',
      bgColor: 'bg-electric/10',
      data: generateMiniData(stats.totalStudents),
    },
    {
      title: 'Total Submissions',
      value: stats.totalSubmissions,
      change: stats.submissionChange,
      icon: FileCheck,
      color: 'text-purple',
      bgColor: 'bg-purple/10',
      data: generateMiniData(stats.totalSubmissions),
    },
    {
      title: 'Certificates Issued',
      value: stats.certificatesIssued,
      change: stats.certChange,
      icon: Award,
      color: 'text-success',
      bgColor: 'bg-success/10',
      data: generateMiniData(stats.certificatesIssued),
    },
    {
      title: 'Active Tasks',
      value: stats.activeTasks,
      change: stats.taskChange,
      icon: ListTodo,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      data: generateMiniData(stats.activeTasks),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-success/10 text-success';
      case 'Rejected': return 'bg-danger/10 text-danger';
      case 'Under Review': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-text-secondary';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="skeleton-shimmer">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-3" />
                <div className="h-8 bg-muted rounded w-1/3 mb-2" />
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground">Dashboard Overview</h2>
        <p className="text-sm text-text-secondary mt-1">
          Monitor your platform&apos;s performance and recent activity
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const isPositive = card.change >= 0;
          return (
            <div
              key={card.title}
              className="animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <Card className="hover:shadow-lg transition-shadow" style={{ borderColor: '#E2E8F0' }}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-text-secondary">{card.title}</p>
                    <div className={`w-8 h-8 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold font-heading">{card.value.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3 text-success" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-danger" />
                        )}
                        <span className={`text-xs font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
                          {Math.abs(card.change)}%
                        </span>
                        <span className="text-[10px] text-text-secondary">vs last month</span>
                      </div>
                    </div>
                    <div className="w-20 h-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={card.data}>
                          <defs>
                            <linearGradient id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={idx === 0 ? '#3B82F6' : idx === 1 ? '#7C3AED' : idx === 2 ? '#10B981' : '#F59E0B'} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={idx === 0 ? '#3B82F6' : idx === 1 ? '#7C3AED' : idx === 2 ? '#10B981' : '#F59E0B'} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={idx === 0 ? '#3B82F6' : idx === 1 ? '#7C3AED' : idx === 2 ? '#10B981' : '#F59E0B'}
                            fill={`url(#gradient-${idx})`}
                            strokeWidth={1.5}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Recent activity */}
      <Card style={{ borderColor: '#E2E8F0' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold font-heading">Recent Submissions</h3>
            <Clock className="w-4 h-4 text-text-secondary" />
          </div>
          {recentSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <FileCheck className="w-10 h-10 text-text-secondary/30 mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No recent submissions</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-electric/10 text-electric text-xs font-semibold">
                      {sub.studentName.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{sub.studentName}</p>
                    <p className="text-xs text-text-secondary truncate">{sub.taskTitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                    <span className="text-[10px] text-text-secondary whitespace-nowrap">
                      {formatDate(sub.submittedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
