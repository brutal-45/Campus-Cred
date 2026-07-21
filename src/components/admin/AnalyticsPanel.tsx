'use client'; 

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users,
  FileCheck,
  Award,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface AnalyticsData {
  totalStudents: number;
  totalSubmissions: number;
  totalCertificates: number;
  activeTasks: number;
  submissionsPerDay: { date: string; count: number }[];
  certificatesByBranch: { branch: string; count: number }[];
  studentsByDegree: { degree: string; count: number }[];
  topBranches: { branch: string; avgPoints: number }[];
}

const CHART_COLORS = ['#3B82F6', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export function AnalyticsPanel() {
  const { token } = useAppStore();
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/admin/analytics', { headers });
        if (res.ok) {
          const analyticsData = await res.json();
          setData(analyticsData);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground">Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Platform insights and performance metrics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                <div className="h-48 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-heading text-foreground">Analytics</h2>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Failed to load analytics data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">Platform insights and performance metrics</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: data.totalStudents, icon: Users, color: 'text-electric', bg: 'bg-electric/10' },
          { label: 'Total Submissions', value: data.totalSubmissions, icon: FileCheck, color: 'text-purple', bg: 'bg-purple/10' },
          { label: 'Certificates Issued', value: data.totalCertificates, icon: Award, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Active Tasks', value: data.activeTasks, icon: ListTodo, color: 'text-warning', bg: 'bg-warning/10' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold font-heading">{stat.value.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line chart: Submissions per day */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-heading">Submissions Per Day</h3>
              <TrendingUp className="w-4 h-4 text-electric" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.submissionsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Submissions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar chart: Certificates by branch */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-heading">Certificates By Branch</h3>
              <Award className="w-4 h-4 text-success" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.certificatesByBranch}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="branch" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="count" name="Certificates" radius={[4, 4, 0, 0]}>
                    {data.certificatesByBranch.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie chart: Students by degree */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-heading">Students By Degree</h3>
              <Users className="w-4 h-4 text-purple" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.studentsByDegree}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="degree"
                    label={({ degree, percent }) =>
                      `${degree} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {data.studentsByDegree.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => <span className="text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar chart: Top performing branches */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-heading">Top Performing Branches</h3>
              <TrendingUp className="w-4 h-4 text-warning" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topBranches} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="branch" tick={{ fontSize: 9 }} width={120} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value: number) => [`${value} avg pts`, 'Avg Points']}
                  />
                  <Bar dataKey="avgPoints" name="Avg Points" radius={[0, 4, 4, 0]}>
                    {data.topBranches.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
