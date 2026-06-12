'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
 Briefcase,
 Users,
 UserCheck,
 Clock,
 TrendingUp,
 FileText,
 Star,
 ArrowUpRight,
 Eye,
 Calendar,
} from 'lucide-react';
import Link from 'next/link';

interface InternshipData {
 id: string;
 title: string;
 status: string;
 deadline: string;
 applicantCount: number;
 hiredCount: number;
}

interface TaskData {
 id: string;
 title: string;
 degree: string;
 branch: string;
 submissions: number;
 status: string;
}

export default function CompanyDashboardPage() {
 const { token, user } = useAppStore();
 const [internships, setInternships] = React.useState<InternshipData[]>([]);
 const [tasks, setTasks] = React.useState<TaskData[]>([]);
 const [loading, setLoading] = React.useState(true);
 const [stats, setStats] = React.useState({
 totalInternships: 8,
 totalApplicants: 156,
 totalHired: 23,
 openPositions: 5,
 activeTasks: 12,
 totalSubmissions: 89,
 avgRating: 4.2,
 responseRate: 87,
 });

 React.useEffect(() => {
 const fetchData = async () => {
 try {
 const headers: Record<string, string> = {};
 if (token) headers['Authorization'] = `Bearer ${token}`;

 const res = await fetch('/api/company/internships', { headers });
 if (res.ok) {
 const data = await res.json();
 const internshipsList = data.internships || [];
 setInternships(internshipsList);

 const totalApplicants = internshipsList.reduce(
 (sum: number, i: InternshipData) => sum + (i.applicantCount || 0), 0
 );
 const totalHired = internshipsList.reduce(
 (sum: number, i: InternshipData) => sum + (i.hiredCount || 0), 0
 );
 const openInternships = internshipsList.filter(
 (i: InternshipData) => i.status === 'Open'
 ).length;

 setStats((prev) => ({
 ...prev,
 totalInternships: internshipsList.length || prev.totalInternships,
 totalApplicants: totalApplicants || prev.totalApplicants,
 totalHired: totalHired || prev.totalHired,
 openPositions: openInternships || prev.openPositions,
 }));
 }
 } catch (err) {
 console.error('Error fetching company data:', err);
 } finally {
 setLoading(false);
 }
 };
 fetchData();
 }, [token, user]);

 const getDaysLeft = (deadline: string) => {
 const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
 return diff > 0 ? diff : 0;
 };

 const statCards = [
 { label: 'Active Internships', value: stats.openPositions, icon: Briefcase, color: 'text-electric', bg: 'bg-electric/10', change: '+3 this month' },
 { label: 'Total Applicants', value: stats.totalApplicants, icon: Users, color: 'text-purple', bg: 'bg-purple/10', change: '+24 this week' },
 { label: 'Students Hired', value: stats.totalHired, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+5 this month' },
 { label: 'Avg Rating', value: `${stats.avgRating}/5`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', change: '+0.3 improvement' },
 ];

 const recentInterns = [
 { name: 'Priya Sharma', college: 'IIT Delhi', branch: 'CSE', role: 'Frontend Intern', status: 'Active', avatar: 'PS' },
 { name: 'Rahul Verma', college: 'VIT Vellore', branch: 'IT', role: 'Backend Intern', status: 'Active', avatar: 'RV' },
 { name: 'Ananya Patel', college: 'NIT Trichy', branch: 'ECE', role: 'ML Intern', status: 'Completed', avatar: 'AP' },
 { name: 'Arjun Reddy', college: 'BITS Pilani', branch: 'CSE', role: 'DevOps Intern', status: 'Active', avatar: 'AR' },
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
 <div className="bg-navy rounded-xl p-6 text-white">
 <div className="flex items-center justify-between flex-wrap gap-4">
 <div>
 <h1 className="text-2xl font-bold font-heading">
 Welcome back, {user?.fullName?.split(' ')[0] || 'Company'}!
 </h1>
 <p className="text-white/70 text-sm mt-1">
 Here&apos;s an overview of your company activity on CampusCred
 </p>
 </div>
 <Link href="/company/post-internship">
 <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 gap-2">
 <Briefcase className="w-4 h-4" />
 Post New Internship
 </Button>
 </Link>
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
 {/* Recent Interns */}
 <Card>
 <CardContent className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-base font-bold font-heading">Recent Interns</h3>
 <Link href="/company/hired" className="text-xs text-electric hover:underline flex items-center gap-1">
 View all <Eye className="w-3 h-3" />
 </Link>
 </div>
 <div className="space-y-3">
 {recentInterns.map((intern, i) => (
 <div key={intern.avatar} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
 <div className="w-10 h-10 rounded-full bg-electric/10 flex items-center justify-center text-sm font-bold text-electric">
 {intern.avatar}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium truncate">{intern.name}</p>
 <p className="text-xs text-text-secondary">{intern.college} • {intern.branch}</p>
 </div>
 <div className="text-right">
 <p className="text-xs font-medium">{intern.role}</p>
 <Badge variant={intern.status === 'Active' ? 'default' : 'secondary'} className={`text-[9px] ${intern.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-text-secondary'}`}>
 {intern.status}
 </Badge>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 {/* Active Internships */}
 <Card>
 <CardContent className="p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-base font-bold font-heading">Your Internships</h3>
 <Link href="/company/post-internship" className="text-xs text-electric hover:underline flex items-center gap-1">
 Post new <Briefcase className="w-3 h-3" />
 </Link>
 </div>
 {internships.length === 0 ? (
 <div className="space-y-3">
 {[
 { title: 'Full-Stack Development Intern', applicants: 32, hired: 4, days: 12 },
 { title: 'UI/UX Design Intern', applicants: 18, hired: 2, days: 8 },
 { title: 'Data Science Intern', applicants: 24, hired: 3, days: 5 },
 ].map((intern, i) => (
 <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium truncate">{intern.title}</p>
 <div className="flex items-center gap-3 mt-1">
 <span className="text-[10px] text-text-secondary">
 <Users className="w-3 h-3 inline mr-0.5" />
 {intern.applicants} applicants
 </span>
 <span className="text-[10px] text-emerald-600">
 <UserCheck className="w-3 h-3 inline mr-0.5" />
 {intern.hired} hired
 </span>
 </div>
 </div>
 <div className="text-right">
 <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Open</Badge>
 <p className="text-[10px] text-text-secondary mt-1">
 <Calendar className="w-3 h-3 inline mr-0.5" />
 {intern.days}d left
 </p>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="space-y-3 max-h-64 overflow-y-auto">
 {internships.slice(0, 5).map((intern, i) => (
 <div key={intern.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium truncate">{intern.title}</p>
 <div className="flex items-center gap-3 mt-1">
 <span className="text-[10px] text-text-secondary">
 <Users className="w-3 h-3 inline mr-0.5" />
 {intern.applicantCount} applicants
 </span>
 <span className="text-[10px] text-emerald-600">
 <UserCheck className="w-3 h-3 inline mr-0.5" />
 {intern.hiredCount} hired
 </span>
 </div>
 </div>
 <div className="text-right">
 <Badge className={`text-[10px] ${intern.status === 'Open' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-text-secondary'}`}>
 {intern.status}
 </Badge>
 <p className="text-[10px] text-text-secondary mt-1">
 {getDaysLeft(intern.deadline)}d left
 </p>
 </div>
 </div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 </div>

 {/* Quick actions */}
 <Card>
 <CardContent className="p-6">
 <h3 className="text-base font-bold font-heading mb-4">Quick Actions</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 {[
 { label: 'Post Internship', href: '/company/post-internship', icon: Briefcase, color: 'text-electric bg-electric/10' },
 { label: 'Post Task', href: '/company/post-task', icon: FileText, color: 'text-purple bg-purple/10' },
 { label: 'Search Talent', href: '/company/talent', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
 { label: 'View Analytics', href: '/company/analytics', icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
 ].map((action) => {
 const Icon = action.icon;
 return (
 <Link key={action.label} href={action.href}>
 <div className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-electric/30 hover:bg-electric/5 transition-all cursor-pointer">
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
