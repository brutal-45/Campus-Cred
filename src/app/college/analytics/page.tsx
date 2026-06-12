'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
 BarChart3,
 TrendingUp,
 Users,
 GraduationCap,
 Award,
 Star,
 ArrowUpRight,
 ArrowDownRight,
 BookOpen,
 Target,
} from 'lucide-react';
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
 PieChart,
 Pie,
 Cell,
 LineChart,
 Line,
 AreaChart,
 Area,
} from 'recharts';

const enrollmentTrend = [
 { month: 'Aug', students: 180, active: 120 },
 { month: 'Sep', students: 220, active: 155 },
 { month: 'Oct', students: 310, active: 210 },
 { month: 'Nov', students: 380, active: 260 },
 { month: 'Dec', students: 350, active: 230 },
 { month: 'Jan', students: 450, active: 310 },
];

const branchPerformance = [
 { branch: 'CSE', avgScore: 520, tasks: 890, certs: 340 },
 { branch: 'IT', avgScore: 440, tasks: 520, certs: 180 },
 { branch: 'ECE', avgScore: 380, tasks: 410, certs: 140 },
 { branch: 'EEE', avgScore: 310, tasks: 280, certs: 90 },
 { branch: 'Mech', avgScore: 340, tasks: 320, certs: 110 },
 { branch: 'Civil', avgScore: 290, tasks: 180, certs: 60 },
];

const levelDistribution = [
 { name: 'Starter', value: 15, color: '#4ADE80' },
 { name: 'Achiever', value: 25, color: '#FBBF24' },
 { name: 'Expert', value: 35, color: '#F97316' },
 { name: 'Elite', value: 18, color: '#8B5CF6' },
 { name: 'Legend', value: 7, color: '#EAB308' },
];

const monthlyEngagement = [
 { week: 'W1', logins: 420, submissions: 85 },
 { week: 'W2', logins: 480, submissions: 92 },
 { week: 'W3', logins: 510, submissions: 110 },
 { week: 'W4', logins: 490, submissions: 98 },
 { week: 'W5', logins: 550, submissions: 125 },
 { week: 'W6', logins: 580, submissions: 132 },
 { week: 'W7', logins: 530, submissions: 118 },
 { week: 'W8', logins: 620, submissions: 145 },
];

const topSkills = [
 { skill: 'React', count: 245 },
 { skill: 'Python', count: 198 },
 { skill: 'Node.js', count: 167 },
 { skill: 'Java', count: 152 },
 { skill: 'Machine Learning', count: 134 },
 { skill: 'CSS/Design', count: 120 },
 { skill: 'Data Analysis', count: 108 },
 { skill: 'DevOps', count: 87 },
];

export default function CollegeAnalyticsPage() {
 const { token, user } = useAppStore();
 const [stats, setStats] = React.useState({
 totalStudents: 1247,
 avgScore: 420,
 completionRate: 72,
 placementRate: 68,
 engagementRate: 69,
 certificatesPerStudent: 2.8,
 tasksPerStudent: 2.3,
 avgStreak: 8.5,
 });
 const [loading, setLoading] = React.useState(true);

 React.useEffect(() => {
 const fetchAnalytics = async () => {
 try {
 const headers: Record<string, string> = {};
 if (token) headers['Authorization'] = `Bearer ${token}`;
 const res = await fetch('/api/college/analytics', { headers });
 if (res.ok) {
 const data = await res.json();
 setStats((prev) => ({ ...prev, ...data }));
 }
 } catch (err) {
 console.error('Error fetching analytics:', err);
 } finally {
 setLoading(false);
 }
 };
 fetchAnalytics();
 }, [token, user]);

 const statCards = [
 { label: 'Total Students', value: stats.totalStudents.toLocaleString(), change: '+12%', up: true, icon: Users, color: 'text-electric', bg: 'bg-electric/10' },
 { label: 'Avg Score', value: `${stats.avgScore}/1000`, change: '+35', up: true, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
 { label: 'Completion Rate', value: `${stats.completionRate}%`, change: '+5%', up: true, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
 { label: 'Placement Rate', value: `${stats.placementRate}%`, change: '+8%', up: true, icon: TrendingUp, color: 'text-purple', bg: 'bg-purple/10' },
 { label: 'Engagement', value: `${stats.engagementRate}%`, change: '+3%', up: true, icon: BarChart3, color: 'text-electric', bg: 'bg-electric/10' },
 { label: 'Certs/Student', value: stats.certificatesPerStudent.toString(), change: '+0.4', up: true, icon: Award, color: 'text-rose-600', bg: 'bg-rose-50' },
 ];

 if (loading) {
 return (
 <div className="space-y-6">
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 {[1, 2, 3, 4, 5, 6].map((i) => (
 <Card key={i} className="skeleton-shimmer">
 <CardContent className="p-5">
 <div className="h-4 bg-muted rounded w-2/3 mb-3" />
 <div className="h-8 bg-muted rounded w-1/3" />
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl font-bold font-heading text-foreground">College Analytics</h1>
 <p className="text-sm text-text-secondary mt-1">Comprehensive insights into student performance and engagement</p>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 {statCards.map((stat, index) => {
 const Icon = stat.icon;
 return (
 <div key={stat.label} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
 <Card className="hover:shadow-md transition-shadow">
 <CardContent className="p-5">
 <div className="flex items-center justify-between mb-2">
 <p className="text-xs font-medium text-text-secondary">{stat.label}</p>
 <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
 <Icon className={`w-4 h-4 ${stat.color}`} />
 </div>
 </div>
 <p className="text-2xl font-bold font-heading">{stat.value}</p>
 <p className={`text-[10px] mt-1 flex items-center gap-1 ${stat.up ? 'text-emerald-600' : 'text-rose-600'}`}>
 {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
 {stat.change} from last semester
 </p>
 </CardContent>
 </Card>
 </div>
 );
 })}
 </div>

 <Tabs defaultValue="enrollment">
 <TabsList>
 <TabsTrigger value="enrollment" className="text-xs">Enrollment</TabsTrigger>
 <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
 <TabsTrigger value="levels" className="text-xs">Levels</TabsTrigger>
 <TabsTrigger value="engagement" className="text-xs">Engagement</TabsTrigger>
 </TabsList>

 <TabsContent value="enrollment" className="mt-4">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card>
 <CardContent className="p-6">
 <h3 className="text-sm font-bold font-heading mb-4">Student Enrollment Trend</h3>
 <ResponsiveContainer width="100%" height={300}>
 <AreaChart data={enrollmentTrend}>
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
 <XAxis dataKey="month" tick={{ fontSize: 12 }} />
 <YAxis tick={{ fontSize: 12 }} />
 <Tooltip />
 <Area type="monotone" dataKey="students" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} name="Enrolled" />
 <Area type="monotone" dataKey="active" stroke="#10B981" fill="#10B981" fillOpacity={0.15} name="Active" />
 </AreaChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 <Card>
 <CardContent className="p-6">
 <h3 className="text-sm font-bold font-heading mb-4">Top Skills</h3>
 <div className="space-y-3">
 {topSkills.map((skill) => (
 <div key={skill.skill} className="flex items-center gap-3">
 <span className="text-sm w-32 truncate">{skill.skill}</span>
 <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
 <div
 className="h-full rounded-full bg-amber-500 transition-all"
 style={{ width: `${(skill.count / topSkills[0].count) * 100}%` }}
 />
 </div>
 <span className="text-xs font-medium w-12 text-right">{skill.count}</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 <TabsContent value="performance" className="mt-4">
 <Card>
 <CardContent className="p-6">
 <h3 className="text-sm font-bold font-heading mb-4">Branch Performance Comparison</h3>
 <ResponsiveContainer width="100%" height={350}>
 <BarChart data={branchPerformance}>
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
 <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
 <YAxis tick={{ fontSize: 12 }} />
 <Tooltip />
 <Bar dataKey="avgScore" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Avg Score" />
 <Bar dataKey="certs" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Certificates" />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="levels" className="mt-4">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card>
 <CardContent className="p-6">
 <h3 className="text-sm font-bold font-heading mb-4">Student Level Distribution</h3>
 <ResponsiveContainer width="100%" height={300}>
 <PieChart>
 <Pie
 data={levelDistribution}
 cx="50%"
 cy="50%"
 innerRadius={60}
 outerRadius={100}
 paddingAngle={3}
 dataKey="value"
 >
 {levelDistribution.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip />
 </PieChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 <Card>
 <CardContent className="p-6">
 <h3 className="text-sm font-bold font-heading mb-4">Level Breakdown</h3>
 <div className="space-y-3">
 {levelDistribution.map((level) => (
 <div key={level.name} className="flex items-center gap-3">
 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: level.color }} />
 <span className="text-sm flex-1">{level.name}</span>
 <span className="text-sm font-bold">{level.value}%</span>
 <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
 <div className="h-full rounded-full" style={{ width: `${level.value}%`, backgroundColor: level.color }} />
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 <TabsContent value="engagement" className="mt-4">
 <Card>
 <CardContent className="p-6">
 <h3 className="text-sm font-bold font-heading mb-4">Weekly Engagement Trends</h3>
 <ResponsiveContainer width="100%" height={350}>
 <LineChart data={monthlyEngagement}>
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
 <XAxis dataKey="week" tick={{ fontSize: 12 }} />
 <YAxis tick={{ fontSize: 12 }} />
 <Tooltip />
 <Line type="monotone" dataKey="logins" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B' }} name="Logins" />
 <Line type="monotone" dataKey="submissions" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} name="Submissions" />
 </LineChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 );
}
