'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
 BarChart3,
 TrendingUp,
 Users,
 Briefcase,
 UserCheck,
 Clock,
 Star,
 Target,
 Award,
 ArrowUpRight,
 ArrowDownRight,
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

const applicantData = [
 { month: 'Aug', applications: 28, hires: 3 },
 { month: 'Sep', applications: 45, hires: 5 },
 { month: 'Oct', applications: 62, hires: 8 },
 { month: 'Nov', applications: 78, hires: 10 },
 { month: 'Dec', applications: 56, hires: 7 },
 { month: 'Jan', applications: 92, hires: 12 },
];

const branchData = [
 { branch: 'CSE', students: 45 },
 { branch: 'IT', students: 28 },
 { branch: 'ECE', students: 22 },
 { branch: 'Mech', students: 15 },
 { branch: 'EEE', students: 12 },
 { branch: 'Civil', students: 8 },
];

const taskCategoryData = [
 { name: 'Development', value: 42, color: '#3B82F6' },
 { name: 'Design', value: 18, color: '#8B5CF6' },
 { name: 'Data Science', value: 22, color: '#10B981' },
 { name: 'Marketing', value: 10, color: '#F59E0B' },
 { name: 'Writing', value: 8, color: '#EF4444' },
];

const scoreDistribution = [
 { range: '0-100', count: 15 },
 { range: '101-300', count: 35 },
 { range: '301-600', count: 48 },
 { range: '601-900', count: 22 },
 { range: '901-1000', count: 5 },
];

const weeklyEngagement = [
 { week: 'W1', views: 120, applications: 18 },
 { week: 'W2', views: 145, applications: 22 },
 { week: 'W3', views: 132, applications: 19 },
 { week: 'W4', views: 168, applications: 28 },
 { week: 'W5', views: 190, applications: 32 },
 { week: 'W6', views: 210, applications: 35 },
 { week: 'W7', views: 185, applications: 30 },
 { week: 'W8', views: 225, applications: 40 },
];

export default function CompanyAnalyticsPage() {
 const { token, user } = useAppStore();
 const [analyticsData, setAnalyticsData] = React.useState({
 totalViews: 1247,
 totalApplications: 361,
 totalHires: 45,
 avgTimeToHire: 8.5,
 conversionRate: 12.5,
 avgApplicantScore: 520,
 });
 const [loading, setLoading] = React.useState(true);

 React.useEffect(() => {
 const fetchAnalytics = async () => {
 try {
 const headers: Record<string, string> = {};
 if (token) headers['Authorization'] = `Bearer ${token}`;
 const res = await fetch('/api/company/analytics', { headers });
 if (res.ok) {
 const data = await res.json();
 setAnalyticsData((prev) => ({ ...prev, ...data }));
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
 { label: 'Profile Views', value: analyticsData.totalViews.toLocaleString(), change: '+18%', up: true, icon: BarChart3, color: 'text-electric', bg: 'bg-electric/10' },
 { label: 'Total Applications', value: analyticsData.totalApplications.toString(), change: '+24%', up: true, icon: Users, color: 'text-purple', bg: 'bg-purple/10' },
 { label: 'Students Hired', value: analyticsData.totalHires.toString(), change: '+12%', up: true, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
 { label: 'Conversion Rate', value: `${analyticsData.conversionRate}%`, change: '+2.5%', up: true, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
 { label: 'Avg Score', value: analyticsData.avgApplicantScore.toString(), change: '+15', up: true, icon: Star, color: 'text-orange-600', bg: 'bg-orange-50' },
 { label: 'Avg Days to Hire', value: `${analyticsData.avgTimeToHire}d`, change: '-1.2d', up: false, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
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
 <h1 className="text-2xl font-bold font-heading text-foreground">Analytics</h1>
 <p className="text-sm text-text-secondary mt-1">Track your company&apos;s performance and hiring metrics</p>
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
 {stat.change} from last month
 </p>
 </CardContent>
 </Card>
 </div>
 );
 })}
 </div>

 <Tabs defaultValue="applications">
 <TabsList>
 <TabsTrigger value="applications" className="text-xs">Applications</TabsTrigger>
 <TabsTrigger value="branches" className="text-xs">By Branch</TabsTrigger>
 <TabsTrigger value="categories" className="text-xs">Categories</TabsTrigger>
 <TabsTrigger value="engagement" className="text-xs">Engagement</TabsTrigger>
 </TabsList>

 <TabsContent value="applications" className="mt-4">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card>
 <CardContent className="p-6">
 <h3 className="text-sm font-bold font-heading mb-4">Applications vs Hires</h3>
 <ResponsiveContainer width="100%" height={280}>
 <BarChart data={applicantData}>
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
 <XAxis dataKey="month" tick={{ fontSize: 12 }} />
 <YAxis tick={{ fontSize: 12 }} />
 <Tooltip />
 <Bar dataKey="applications" fill="#3B82F6" radius={[4, 4, 0, 0]} />
 <Bar dataKey="hires" fill="#10B981" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 <Card>
 <CardContent className="p-6">
 <h3 className="text-sm font-bold font-heading mb-4">Applicant Score Distribution</h3>
 <ResponsiveContainer width="100%" height={280}>
 <AreaChart data={scoreDistribution}>
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
 <XAxis dataKey="range" tick={{ fontSize: 11 }} />
 <YAxis tick={{ fontSize: 12 }} />
 <Tooltip />
 <Area type="monotone" dataKey="count" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
 </AreaChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 <TabsContent value="branches" className="mt-4">
 <Card>
 <CardContent className="p-6">
 <h3 className="text-sm font-bold font-heading mb-4">Applications by Branch</h3>
 <ResponsiveContainer width="100%" height={350}>
 <BarChart data={branchData} layout="vertical">
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
 <XAxis type="number" tick={{ fontSize: 12 }} />
 <YAxis dataKey="branch" type="category" tick={{ fontSize: 12 }} width={60} />
 <Tooltip />
 <Bar dataKey="students" fill="#3B82F6" radius={[0, 4, 4, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="categories" className="mt-4">
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card>
 <CardContent className="p-6">
 <h3 className="text-sm font-bold font-heading mb-4">Task Category Distribution</h3>
 <ResponsiveContainer width="100%" height={300}>
 <PieChart>
 <Pie
 data={taskCategoryData}
 cx="50%"
 cy="50%"
 innerRadius={60}
 outerRadius={100}
 paddingAngle={3}
 dataKey="value"
 >
 {taskCategoryData.map((entry, index) => (
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
 <h3 className="text-sm font-bold font-heading mb-4">Category Breakdown</h3>
 <div className="space-y-3">
 {taskCategoryData.map((cat) => (
 <div key={cat.name} className="flex items-center gap-3">
 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
 <span className="text-sm flex-1">{cat.name}</span>
 <span className="text-sm font-bold">{cat.value}%</span>
 <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
 <div className="h-full rounded-full" style={{ width: `${cat.value}%`, backgroundColor: cat.color }} />
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
 <LineChart data={weeklyEngagement}>
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
 <XAxis dataKey="week" tick={{ fontSize: 12 }} />
 <YAxis tick={{ fontSize: 12 }} />
 <Tooltip />
 <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
 <Line type="monotone" dataKey="applications" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
 </LineChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 );
}
