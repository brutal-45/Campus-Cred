'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
 GraduationCap,
 Users,
 Award,
 TrendingUp,
 BookOpen,
 Star,
 ArrowUpRight,
 CheckCircle2,
 Building2,
 BarChart3,
 UserPlus,
 FileBarChart,
 Briefcase,
 MapPin,
} from 'lucide-react';
import Link from 'next/link';

export default function CollegeDashboardPage() {
 const { token, user } = useAppStore();
 const [stats, setStats] = React.useState({
 totalStudents: 1247,
 activeStudents: 856,
 totalCertificates: 3450,
 avgScore: 420,
 completionRate: 72,
 partnerStatus: 'Active',
 placedThisYear: 189,
 topBranch: 'CSE',
 tasksCompleted: 2890,
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
 setStats((prev) => ({
 ...prev,
 totalStudents: data.total || students.length || prev.totalStudents,
 avgScore: students.length > 0 ? Math.round(totalPoints / students.length) : prev.avgScore,
 }));
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
 { label: 'Total Students', value: stats.totalStudents.toLocaleString(), icon: Users, color: 'text-electric', bg: 'bg-electric/10', change: '+48 this semester' },
 { label: 'Active Students', value: stats.activeStudents.toLocaleString(), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '69% engagement' },
 { label: 'Certificates Earned', value: stats.totalCertificates.toLocaleString(), icon: Award, color: 'text-purple', bg: 'bg-purple/10', change: '+120 this month' },
 { label: 'Avg CampusCred Score', value: `${stats.avgScore}/1000`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', change: '+35 improvement' },
 ];

 const topPerformers = [
 { name: 'Arjun Reddy', branch: 'CSE', score: 920, level: 'Legend', tasks: 35, avatar: 'AR' },
 { name: 'Priya Sharma', branch: 'CSE', score: 820, level: 'Elite', tasks: 24, avatar: 'PS' },
 { name: 'Divya Menon', branch: 'IT', score: 750, level: 'Elite', tasks: 22, avatar: 'DM' },
 { name: 'Rahul Verma', branch: 'IT', score: 650, level: 'Expert', tasks: 18, avatar: 'RV' },
 { name: 'Ananya Patel', branch: 'ECE', score: 580, level: 'Expert', tasks: 15, avatar: 'AP' },
 ];

 const branchStats = [
 { branch: 'CSE', students: 320, avgScore: 520, certs: 980, color: 'bg-electric' },
 { branch: 'IT', students: 180, avgScore: 440, certs: 520, color: 'bg-purple' },
 { branch: 'ECE', students: 160, avgScore: 380, certs: 410, color: 'bg-emerald-500' },
 { branch: 'Mechanical', students: 140, avgScore: 340, certs: 320, color: 'bg-amber-500' },
 { branch: 'EEE', students: 120, avgScore: 310, certs: 280, color: 'bg-rose-500' },
 ];

 if (loading) {
 return (
 <div className="space-y-6">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {[1, 2, 3, 4].map((i) => (
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
 {/* Welcome banner */}
 <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
 <div className="flex items-center justify-between flex-wrap gap-4">
 <div>
 <h1 className="text-2xl font-bold font-heading">
 Welcome, {user?.fullName?.split(' ')[0] || 'Admin'}!
 </h1>
 <p className="text-white/80 text-sm mt-1">
 {user?.college || 'Your College'} • CampusCred Partner Dashboard
 </p>
 </div>
 <div className="flex items-center gap-2">
 <Badge className="bg-white/20 text-white border-white/30 gap-1">
 <CheckCircle2 className="w-3 h-3" />
 {stats.partnerStatus} Partner
 </Badge>
 </div>
 </div>
 </div>

 {/* Stats grid */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {statCards.map((card, index) => {
 const Icon = card.icon;
 return (
 <div key={card.label} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
 <Card className="hover:shadow-md transition-shadow">
 <CardContent className="p-5">
 <div className="flex items-center justify-between mb-2">
 <p className="text-xs font-medium text-text-secondary">{card.label}</p>
 <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
 <Icon className={`w-4 h-4 ${card.color}`} />
 </div>
 </div>
 <p className="text-2xl font-bold font-heading">{card.value}</p>
 <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
 <ArrowUpRight className="w-3 h-3" />
 {card.change}
 </p>
 </CardContent>
 </Card>
 </div>
 );
 })}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Top Performers */}
 <Card>
 <CardContent className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-base font-bold font-heading">Top Performers</h3>
 <Link href="/college/students" className="text-xs text-amber-600 hover:underline">View all</Link>
 </div>
 <div className="space-y-3">
 {topPerformers.map((student, index) => (
 <div key={student.name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
 <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-amber-600 bg-amber-50">
 #{index + 1}
 </div>
 <div className="w-10 h-10 rounded-full bg-electric/10 flex items-center justify-center text-sm font-bold text-electric">
 {student.avatar}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium">{student.name}</p>
 <p className="text-xs text-text-secondary">{student.branch} • {student.tasks} tasks</p>
 </div>
 <div className="text-right">
 <p className="text-sm font-bold">{student.score}</p>
 <Badge variant="outline" className={`text-[9px] ${
 student.level === 'Legend' ? 'bg-yellow-100 text-yellow-700' :
 student.level === 'Elite' ? 'bg-purple-100 text-purple-700' :
 'bg-orange-100 text-orange-700'
 }`}>
 {student.level}
 </Badge>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Branch Performance */}
 <Card>
 <CardContent className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-base font-bold font-heading">Branch Performance</h3>
 <Link href="/college/analytics" className="text-xs text-amber-600 hover:underline">Details</Link>
 </div>
 <div className="space-y-3">
 {branchStats.map((branch) => (
 <div key={branch.branch} className="p-3 rounded-xl bg-muted/50">
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full ${branch.color}`} />
 <span className="text-sm font-medium">{branch.branch}</span>
 </div>
 <span className="text-xs text-text-secondary">{branch.students} students</span>
 </div>
 <div className="flex items-center gap-4">
 <div className="flex-1">
 <div className="flex items-center justify-between text-xs mb-1">
 <span className="text-text-secondary">Avg Score</span>
 <span className="font-medium">{branch.avgScore}/1000</span>
 </div>
 <div className="h-1.5 rounded-full bg-muted overflow-hidden">
 <div
 className={`h-full rounded-full ${branch.color} transition-all`}
 style={{ width: `${(branch.avgScore / 1000) * 100}%` }}
 />
 </div>
 </div>
 <span className="text-xs text-text-secondary">📜 {branch.certs} certs</span>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Quick Actions */}
 <Card>
 <CardContent className="p-6">
 <h3 className="text-base font-bold font-heading mb-4">Quick Actions</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { label: 'View Students', href: '/college/students', icon: Users, color: 'text-electric bg-electric/10' },
 { label: 'Enroll Students', href: '/college/enroll', icon: UserPlus, color: 'text-purple bg-purple/10' },
 { label: 'Analytics', href: '/college/analytics', icon: BarChart3, color: 'text-emerald-600 bg-emerald-50' },
 { label: 'Placements', href: '/college/placements', icon: FileBarChart, color: 'text-amber-600 bg-amber-50' },
 ].map((action) => {
 const Icon = action.icon;
 return (
 <Link key={action.label} href={action.href}>
 <div className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-amber-500/30 hover:bg-amber-50/30 transition-all cursor-pointer">
 <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
 <Icon className="w-5 h-5" />
 </div>
 <p className="text-sm font-medium">{action.label}</p>
 </div>
 </Link>
 );
 })}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
