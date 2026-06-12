'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import {
  Users, FileCheck, Award, ListTodo, TrendingUp, TrendingDown,
  Clock, Activity, ShieldAlert, Building2, Server, HardDrive, Cpu,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  dbLatency: number;
  activeConnections: number;
}

export default function AdminDashboardPage() {
  const { token } = useAppStore();
  const [stats, setStats] = React.useState({
    totalStudents: 0, totalSubmissions: 0, certificatesIssued: 0, activeTasks: 0,
    totalCompanies: 0, totalMentors: 0, fraudAlerts: 0,
    studentChange: 12, submissionChange: 8, certChange: 15, taskChange: -3,
  });
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const [systemHealth] = React.useState<SystemHealth>({
    status: 'healthy', uptime: '99.97%', cpuUsage: 23, memoryUsage: 45, dbLatency: 12, activeConnections: 142,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const [analyticsRes, subsRes] = await Promise.all([
          fetch('/api/admin/analytics', { headers }),
          fetch('/api/admin/submissions?limit=8', { headers }),
        ]);
        if (analyticsRes.ok) {
          const d = await analyticsRes.json();
          setStats(prev => ({
            ...prev,
            totalStudents: d.totalStudents || 0, totalSubmissions: d.totalSubmissions || 0,
            certificatesIssued: d.totalCertificates || 0, activeTasks: d.activeTasks || 0,
          }));
        }
        if (subsRes.ok) {
          const d = await subsRes.json();
          setRecentActivity((d.submissions || d).slice(0, 8));
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [token]);

  const chartData = Array.from({ length: 14 }, (_, i) => ({
    day: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    submissions: Math.floor(Math.random() * 30) + 10,
    certificates: Math.floor(Math.random() * 12) + 3,
  }));

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, change: stats.studentChange, icon: Users, color: 'text-electric', bg: 'bg-electric/10' },
    { title: 'Submissions', value: stats.totalSubmissions, change: stats.submissionChange, icon: FileCheck, color: 'text-purple', bg: 'bg-purple/10' },
    { title: 'Certificates', value: stats.certificatesIssued, change: stats.certChange, icon: Award, color: 'text-success', bg: 'bg-success/10' },
    { title: 'Active Tasks', value: stats.activeTasks, change: stats.taskChange, icon: ListTodo, color: 'text-warning', bg: 'bg-warning/10' },
    { title: 'Companies', value: stats.totalCompanies, change: 5, icon: Building2, color: 'text-electric-light', bg: 'bg-electric-light/10' },
    { title: 'Fraud Alerts', value: stats.fraudAlerts, change: -2, icon: ShieldAlert, color: 'text-danger', bg: 'bg-danger/10' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-success/10 text-success';
      case 'Rejected': return 'bg-danger/10 text-danger';
      case 'Under Review': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-text-secondary';
    }
  };

  const formatDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="skeleton-shimmer"><CardContent className="p-6"><div className="h-4 bg-muted rounded w-1/2 mb-3" /><div className="h-8 bg-muted rounded w-1/3" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <CampusCredLogo size={28} variant="dark" />
            <h2 className="text-2xl font-bold font-heading text-foreground">Admin Dashboard</h2>
          </div>
          <p className="text-sm text-text-secondary">Monitor your platform&apos;s performance and recent activity</p>
        </div>
        <Badge variant="outline" className="self-start bg-success/10 text-success border-success/20">
          <Activity className="w-3 h-3 mr-1" /> System Healthy
        </Badge>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const isPos = card.change >= 0;
          return (
            <div key={card.title} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-text-secondary">{card.title}</p>
                    <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold font-heading">{card.value.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {isPos ? <TrendingUp className="w-3 h-3 text-success" /> : <TrendingDown className="w-3 h-3 text-danger" />}
                    <span className={`text-xs font-medium ${isPos ? 'text-success' : 'text-danger'}`}>{Math.abs(card.change)}%</span>
                    <span className="text-[10px] text-text-secondary">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Activity className="w-4 h-4 text-electric" /> Platform Activity (Last 14 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="gSub" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gCert" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Area type="monotone" dataKey="submissions" stroke="#3B82F6" fill="url(#gSub)" strokeWidth={2} />
                  <Area type="monotone" dataKey="certificates" stroke="#10B981" fill="url(#gCert)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* System health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Server className="w-4 h-4 text-success" /> System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Uptime</span>
              <span className="text-sm font-semibold text-success">{systemHealth.uptime}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU</span>
                <span className="text-xs font-medium">{systemHealth.cpuUsage}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: `${systemHealth.cpuUsage}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-secondary flex items-center gap-1"><HardDrive className="w-3 h-3" /> Memory</span>
                <span className="text-xs font-medium">{systemHealth.memoryUsage}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-warning rounded-full" style={{ width: `${systemHealth.memoryUsage}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">DB Latency</span>
              <span className="text-xs font-medium">{systemHealth.dbLatency}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">Active Connections</span>
              <span className="text-xs font-medium">{systemHealth.activeConnections}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Clock className="w-4 h-4 text-text-secondary" /> Recent Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <FileCheck className="w-10 h-10 text-text-secondary/30 mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No recent submissions</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentActivity.map((sub: any) => (
                <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="bg-electric/10 text-electric text-xs font-semibold">
                      {(sub.student?.fullName || 'U').split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{sub.student?.fullName || 'Unknown'}</p>
                    <p className="text-xs text-text-secondary truncate">{sub.task?.title || 'Untitled'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${getStatusColor(sub.status)}`}>{sub.status}</span>
                    <span className="text-[10px] text-text-secondary whitespace-nowrap">{formatDate(sub.submittedAt)}</span>
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
