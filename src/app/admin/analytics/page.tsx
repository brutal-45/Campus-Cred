'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import {
  BarChart3, TrendingUp, TrendingDown, Users, Award, FileCheck,
  ListTodo, IndianRupee, Calendar, ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend,
} from 'recharts';

const enrollmentData = [
  { month: 'Sep', students: 120, companies: 8 },
  { month: 'Oct', students: 245, companies: 12 },
  { month: 'Nov', students: 380, companies: 15 },
  { month: 'Dec', students: 520, companies: 22 },
  { month: 'Jan', students: 680, companies: 28 },
  { month: 'Feb', students: 850, companies: 35 },
  { month: 'Mar', students: 1020, companies: 42 },
];

const taskCompletionData = [
  { branch: 'CSE', completed: 85, pending: 12, rejected: 3 },
  { branch: 'IT', completed: 62, pending: 18, rejected: 5 },
  { branch: 'ECE', completed: 48, pending: 22, rejected: 8 },
  { branch: 'ME', completed: 35, pending: 15, rejected: 4 },
  { branch: 'CE', completed: 28, pending: 10, rejected: 3 },
  { branch: 'EE', completed: 42, pending: 14, rejected: 6 },
];

const certificateData = [
  { level: 'Starter', count: 320, color: '#94A3B8' },
  { level: 'Achiever', count: 245, color: '#10B981' },
  { level: 'Expert', count: 180, color: '#3B82F6' },
  { level: 'Elite', count: 85, color: '#7C3AED' },
  { level: 'Legend', count: 25, color: '#D4AF37' },
];

const revenueData = [
  { month: 'Sep', revenue: 45000, subscriptions: 12 },
  { month: 'Oct', revenue: 62000, subscriptions: 18 },
  { month: 'Nov', revenue: 78000, subscriptions: 24 },
  { month: 'Dec', revenue: 95000, subscriptions: 30 },
  { month: 'Jan', revenue: 120000, subscriptions: 38 },
  { month: 'Feb', revenue: 145000, subscriptions: 45 },
  { month: 'Mar', revenue: 168000, subscriptions: 52 },
];

const weeklyActivity = [
  { day: 'Mon', active: 342 }, { day: 'Tue', active: 456 },
  { day: 'Wed', active: 512 }, { day: 'Thu', active: 478 },
  { day: 'Fri', active: 389 }, { day: 'Sat', active: 267 },
  { day: 'Sun', active: 198 },
];

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState('6months');

  const stats = [
    { title: 'Total Users', value: '2,450', change: 12.5, icon: Users, color: 'text-electric', bg: 'bg-electric/10' },
    { title: 'Tasks Completed', value: '1,832', change: 8.3, icon: ListTodo, color: 'text-purple', bg: 'bg-purple/10' },
    { title: 'Certificates Issued', value: '855', change: 15.2, icon: Award, color: 'text-success', bg: 'bg-success/10' },
    { title: 'Revenue', value: '₹6.13L', change: 22.1, icon: IndianRupee, color: 'text-gold', bg: 'bg-gold/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <CampusCredLogo size={28} variant="dark" />
            <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-electric" /> Analytics Dashboard
            </h2>
          </div>
          <p className="text-sm text-text-secondary">Comprehensive platform analytics and insights</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last 1 Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((card, idx) => {
          const Icon = card.icon;
          const isPos = card.change >= 0;
          return (
            <div key={card.title} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-text-secondary">{card.title}</p>
                    <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold font-heading">{card.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {isPos ? <TrendingUp className="w-3 h-3 text-success" /> : <TrendingDown className="w-3 h-3 text-danger" />}
                    <span className={`text-xs font-medium ${isPos ? 'text-success' : 'text-danger'}`}>+{card.change}%</span>
                    <span className="text-[10px] text-text-secondary">vs last period</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trends */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Users className="w-4 h-4 text-electric" /> Enrollment Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={enrollmentData}>
                  <defs>
                    <linearGradient id="gStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gCompanies" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="students" stroke="#3B82F6" fill="url(#gStudents)" strokeWidth={2} name="Students" />
                  <Area type="monotone" dataKey="companies" stroke="#7C3AED" fill="url(#gCompanies)" strokeWidth={2} name="Companies" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Task Completion by Branch */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-purple" /> Task Completion by Branch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="branch" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="completed" stackId="a" fill="#10B981" name="Completed" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" />
                  <Bar dataKey="rejected" stackId="a" fill="#EF4444" name="Rejected" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Certificate Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Award className="w-4 h-4 text-gold" /> Certificate Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={certificateData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="count" label={({ level, percent }) => `${level} (${(percent * 100).toFixed(0)}%)`}>
                    {certificateData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-gold" /> Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#D4AF37" fill="url(#gRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Active Users */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Calendar className="w-4 h-4 text-electric" /> Weekly Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="active" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Active Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-success" /> Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Avg. Completion Rate', value: '78%', trend: '+5%', color: 'text-success' },
                { label: 'Avg. Time to Review', value: '2.4 hrs', trend: '-12%', color: 'text-success' },
                { label: 'Student Satisfaction', value: '4.6/5', trend: '+0.2', color: 'text-success' },
                { label: 'Certificate Claim Rate', value: '92%', trend: '+3%', color: 'text-success' },
                { label: 'Mentor Rating', value: '4.7/5', trend: '+0.1', color: 'text-success' },
                { label: 'Fraud Incidents', value: '3', trend: '-60%', color: 'text-success' },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{m.value}</span>
                    <Badge className={`text-[9px] border-0 ${m.color === 'text-success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{m.trend}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
