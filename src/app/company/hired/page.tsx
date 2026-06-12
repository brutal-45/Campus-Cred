'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
 UserCheck,
 Building2,
 GraduationCap,
 Star,
 Calendar,
 Briefcase,
 MapPin,
 ExternalLink,
 MessageSquare,
 Filter,
 Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

interface HiredStudent {
 id: string;
 name: string;
 avatar: string;
 college: string;
 branch: string;
 degree: string;
 city: string;
 score: number;
 level: string;
 role: string;
 internshipTitle: string;
 hiredDate: string;
 status: 'Onboarding' | 'In Progress' | 'Completed' | 'Offer Extended';
 startDate: string;
 endDate: string;
}

const mockHired: HiredStudent[] = [
 { id: '1', name: 'Priya Sharma', avatar: 'PS', college: 'IIT Delhi', branch: 'CSE', degree: 'B.Tech', city: 'Delhi', score: 820, level: 'Elite', role: 'Frontend Developer', internshipTitle: 'Full-Stack Development Intern', hiredDate: '2025-01-10', status: 'In Progress', startDate: '2025-02-01', endDate: '2025-05-01' },
 { id: '2', name: 'Rahul Verma', avatar: 'RV', college: 'VIT Vellore', branch: 'IT', degree: 'B.Tech', city: 'Chennai', score: 650, level: 'Expert', role: 'Backend Developer', internshipTitle: 'Full-Stack Development Intern', hiredDate: '2025-01-08', status: 'In Progress', startDate: '2025-02-01', endDate: '2025-05-01' },
 { id: '3', name: 'Ananya Patel', avatar: 'AP', college: 'NIT Trichy', branch: 'ECE', degree: 'B.Tech', city: 'Trichy', score: 580, level: 'Expert', role: 'ML Engineer', internshipTitle: 'Data Science Intern', hiredDate: '2024-12-15', status: 'Completed', startDate: '2025-01-01', endDate: '2025-03-31' },
 { id: '4', name: 'Arjun Reddy', avatar: 'AR', college: 'BITS Pilani', branch: 'CSE', degree: 'B.Tech', city: 'Hyderabad', score: 920, level: 'Legend', role: 'DevOps Engineer', internshipTitle: 'Cloud & DevOps Intern', hiredDate: '2025-01-12', status: 'Onboarding', startDate: '2025-02-15', endDate: '2025-05-15' },
 { id: '5', name: 'Sneha Iyer', avatar: 'SI', college: 'IIIT Bangalore', branch: 'CSE', degree: 'M.Tech', city: 'Bangalore', score: 480, level: 'Expert', role: 'UI/UX Designer', internshipTitle: 'Design Intern', hiredDate: '2025-01-05', status: 'Offer Extended', startDate: '2025-03-01', endDate: '2025-06-01' },
];

export default function CompanyHiredPage() {
 const [hiredStudents] = React.useState<HiredStudent[]>(mockHired);
 const [searchQuery, setSearchQuery] = React.useState('');
 const [statusFilter, setStatusFilter] = React.useState('all');

 const filtered = React.useMemo(() => {
 let result = hiredStudents;
 if (searchQuery) {
 const q = searchQuery.toLowerCase();
 result = result.filter(
 (s) => s.name.toLowerCase().includes(q) || s.college.toLowerCase().includes(q) || s.role.toLowerCase().includes(q)
 );
 }
 if (statusFilter !== 'all') {
 result = result.filter((s) => s.status.toLowerCase().replace(' ', '-') === statusFilter);
 }
 return result;
 }, [hiredStudents, searchQuery, statusFilter]);

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'Onboarding': return 'bg-electric/10 text-electric border-electric/20';
 case 'In Progress': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
 case 'Completed': return 'bg-purple-100 text-purple-700 border-purple-200';
 case 'Offer Extended': return 'bg-amber-100 text-amber-700 border-amber-200';
 default: return 'bg-muted text-text-secondary';
 }
 };

 const getLevelColor = (level: string) => {
 switch (level) {
 case 'Legend': return 'bg-yellow-100 text-yellow-700';
 case 'Elite': return 'bg-purple-100 text-purple-700';
 case 'Expert': return 'bg-orange-100 text-orange-700';
 default: return 'bg-muted text-text-secondary';
 }
 };

 const formatDate = (dateStr: string) => {
 return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
 };

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl font-bold font-heading text-foreground">Hired Students</h1>
 <p className="text-sm text-text-secondary mt-1">Track students you&apos;ve hired and their internship journey</p>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {[
 { label: 'Total Hired', value: hiredStudents.length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
 { label: 'In Progress', value: hiredStudents.filter((s) => s.status === 'In Progress').length, icon: Briefcase, color: 'text-electric', bg: 'bg-electric/10' },
 { label: 'Completed', value: hiredStudents.filter((s) => s.status === 'Completed').length, icon: Star, color: 'text-purple', bg: 'bg-purple/10' },
 { label: 'Onboarding', value: hiredStudents.filter((s) => s.status === 'Onboarding' || s.status === 'Offer Extended').length, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
 ].map((stat) => {
 const Icon = stat.icon;
 return (
 <Card key={stat.label}>
 <CardContent className="p-5">
 <div className="flex items-center justify-between mb-2">
 <p className="text-xs font-medium text-text-secondary">{stat.label}</p>
 <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
 <Icon className={`w-4 h-4 ${stat.color}`} />
 </div>
 </div>
 <p className="text-2xl font-bold font-heading">{stat.value}</p>
 </CardContent>
 </Card>
 );
 })}
 </div>

 {/* Search & Filter */}
 <div className="flex items-center gap-3">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 placeholder="Search by name, college, or role..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-10"
 />
 </div>
 <Select value={statusFilter} onValueChange={setStatusFilter}>
 <SelectTrigger className="w-44">
 <Filter className="w-4 h-4 mr-2" />
 <SelectValue placeholder="Status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Statuses</SelectItem>
 <SelectItem value="onboarding">Onboarding</SelectItem>
 <SelectItem value="in-progress">In Progress</SelectItem>
 <SelectItem value="completed">Completed</SelectItem>
 <SelectItem value="offer-extended">Offer Extended</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {/* Hired students list */}
 <div className="space-y-4">
 {filtered.map((student, index) => (
 <div key={student.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
 <Card className="hover:shadow-md transition-shadow">
 <CardContent className="p-5">
 <div className="flex items-start gap-4">
 <Avatar className="w-14 h-14">
 <AvatarFallback className="bg-electric/10 text-electric text-base font-bold">
 {student.avatar}
 </AvatarFallback>
 </Avatar>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="text-base font-bold">{student.name}</h3>
 <Badge variant="outline" className={`text-[10px] ${getLevelColor(student.level)}`}>
 {student.level}
 </Badge>
 <Badge variant="outline" className={`text-[10px] ${getStatusColor(student.status)}`}>
 {student.status}
 </Badge>
 </div>
 <p className="text-sm text-text-secondary mt-1">{student.role} — {student.internshipTitle}</p>

 <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary flex-wrap">
 <span className="flex items-center gap-1">
 <GraduationCap className="w-3 h-3" />{student.degree} {student.branch}
 </span>
 <span className="flex items-center gap-1">
 <Building2 className="w-3 h-3" />{student.college}
 </span>
 <span className="flex items-center gap-1">
 <MapPin className="w-3 h-3" />{student.city}
 </span>
 <span className="flex items-center gap-1">
 <Star className="w-3 h-3 text-amber-500" />{student.score}/1000
 </span>
 </div>

 {/* Journey timeline */}
 <div className="mt-3 p-3 rounded-lg bg-muted/50">
 <p className="text-[10px] font-medium text-text-secondary mb-2">JOURNEY</p>
 <div className="flex items-center gap-2">
 {['Hired', 'Onboarding', 'In Progress', 'Completed'].map((step, i) => {
 const stepOrder = ['Onboarding', 'In Progress', 'Completed'].indexOf(student.status);
 const currentStep = ['Hired', 'Onboarding', 'In Progress', 'Completed'].indexOf(step);
 const isComplete = student.status === 'Completed'
 ? true
 : step === 'Hired'
 ? true
 : currentStep <= stepOrder + 1;
 const isCurrent = step === student.status;
 return (
 <React.Fragment key={step}>
 <div className="flex flex-col items-center">
 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
 isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-text-secondary'
 } ${isCurrent ? 'ring-2 ring-electric ring-offset-2' : ''}`}>
 {isComplete ? '✓' : i + 1}
 </div>
 <span className="text-[9px] text-text-secondary mt-1">{step}</span>
 </div>
 {i < 3 && (
 <div className={`flex-1 h-0.5 ${isComplete ? 'bg-emerald-300' : 'bg-muted'}`} />
 )}
 </React.Fragment>
 );
 })}
 </div>
 <div className="flex items-center gap-4 mt-2 text-[10px] text-text-secondary">
 <span>Start: {formatDate(student.startDate)}</span>
 <span>End: {formatDate(student.endDate)}</span>
 <span>Hired: {formatDate(student.hiredDate)}</span>
 </div>
 </div>

 {/* Actions */}
 <div className="flex gap-2 mt-3">
 <Link href={`/student/${student.id}`}>
 <Button size="sm" variant="outline" className="text-xs gap-1">
 <ExternalLink className="w-3 h-3" /> Portfolio
 </Button>
 </Link>
 <Button size="sm" variant="outline" className="text-xs gap-1">
 <MessageSquare className="w-3 h-3" /> Message
 </Button>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 ))}

 {filtered.length === 0 && (
 <Card>
 <CardContent className="p-8 text-center">
 <UserCheck className="w-10 h-10 text-text-secondary/30 mx-auto mb-2" />
 <p className="text-sm text-text-secondary">No hired students found</p>
 </CardContent>
 </Card>
 )}
 </div>
 </div>
 );
}
