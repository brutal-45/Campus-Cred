'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select';
import {
 Search,
 Filter,
 Users,
 Star,
 Building2,
 GraduationCap,
 Award,
 TrendingUp,
 ExternalLink,
 ChevronDown,
 CheckCircle2,
 Clock,
 Briefcase,
 MapPin,
} from 'lucide-react';
import Link from 'next/link';

interface Student {
 id: string;
 name: string;
 avatar: string;
 email: string;
 branch: string;
 degree: string;
 year: string;
 city: string;
 score: number;
 level: string;
 tasksCompleted: number;
 certificates: number;
 streak: number;
 isVerified: boolean;
 lastActive: string;
 progress: number;
}

const mockStudents: Student[] = [
 { id: '1', name: 'Priya Sharma', avatar: 'PS', email: 'priya@iitd.ac.in', branch: 'CSE', degree: 'B.Tech', year: '3rd Year', city: 'Delhi', score: 820, level: 'Elite', tasksCompleted: 24, certificates: 18, streak: 15, isVerified: true, lastActive: '2 hours ago', progress: 82 },
 { id: '2', name: 'Rahul Verma', avatar: 'RV', email: 'rahul@vit.ac.in', branch: 'IT', degree: 'B.Tech', year: '4th Year', city: 'Vellore', score: 650, level: 'Expert', tasksCompleted: 18, certificates: 14, streak: 8, isVerified: true, lastActive: '1 day ago', progress: 65 },
 { id: '3', name: 'Ananya Patel', avatar: 'AP', email: 'ananya@nitt.edu', branch: 'ECE', degree: 'B.Tech', year: '3rd Year', city: 'Trichy', score: 580, level: 'Expert', tasksCompleted: 15, certificates: 12, streak: 12, isVerified: true, lastActive: '5 hours ago', progress: 58 },
 { id: '4', name: 'Arjun Reddy', avatar: 'AR', email: 'arjun@bits-pilani.ac.in', branch: 'CSE', degree: 'B.Tech', year: '4th Year', city: 'Hyderabad', score: 920, level: 'Legend', tasksCompleted: 35, certificates: 28, streak: 30, isVerified: true, lastActive: '30 min ago', progress: 92 },
 { id: '5', name: 'Sneha Iyer', avatar: 'SI', email: 'sneha@iiitb.ac.in', branch: 'CSE', degree: 'M.Tech', year: '2nd Year', city: 'Bangalore', score: 480, level: 'Expert', tasksCompleted: 12, certificates: 10, streak: 5, isVerified: true, lastActive: '3 hours ago', progress: 48 },
 { id: '6', name: 'Karthik Nair', avatar: 'KN', email: 'karthik@coep.ac.in', branch: 'Mechanical', degree: 'B.Tech', year: '3rd Year', city: 'Pune', score: 320, level: 'Achiever', tasksCompleted: 8, certificates: 6, streak: 3, isVerified: false, lastActive: '2 days ago', progress: 32 },
 { id: '7', name: 'Divya Menon', avatar: 'DM', email: 'divya@dtu.ac.in', branch: 'IT', degree: 'B.Tech', year: '4th Year', city: 'Delhi', score: 750, level: 'Elite', tasksCompleted: 22, certificates: 17, streak: 20, isVerified: true, lastActive: '1 hour ago', progress: 75 },
 { id: '8', name: 'Amit Kumar', avatar: 'AK', email: 'amit@jadavpur.edu', branch: 'CSE', degree: 'B.E', year: '3rd Year', city: 'Kolkata', score: 290, level: 'Achiever', tasksCompleted: 10, certificates: 7, streak: 7, isVerified: true, lastActive: '4 hours ago', progress: 29 },
];

export default function CollegeStudentsPage() {
 const [students] = React.useState<Student[]>(mockStudents);
 const [searchQuery, setSearchQuery] = React.useState('');
 const [branchFilter, setBranchFilter] = React.useState('all');
 const [yearFilter, setYearFilter] = React.useState('all');
 const [levelFilter, setLevelFilter] = React.useState('all');
 const [sortBy, setSortBy] = React.useState('score');
 const [showFilters, setShowFilters] = React.useState(false);

 const filteredStudents = React.useMemo(() => {
 let filtered = students;
 if (searchQuery) {
 const q = searchQuery.toLowerCase();
 filtered = filtered.filter(
 (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.branch.toLowerCase().includes(q)
 );
 }
 if (branchFilter !== 'all') filtered = filtered.filter((s) => s.branch === branchFilter);
 if (yearFilter !== 'all') filtered = filtered.filter((s) => s.year === yearFilter);
 if (levelFilter !== 'all') filtered = filtered.filter((s) => s.level === levelFilter);

 return [...filtered].sort((a, b) => {
 switch (sortBy) {
 case 'score': return b.score - a.score;
 case 'name': return a.name.localeCompare(b.name);
 case 'tasks': return b.tasksCompleted - a.tasksCompleted;
 case 'recent': return 0;
 default: return b.score - a.score;
 }
 });
 }, [students, searchQuery, branchFilter, yearFilter, levelFilter, sortBy]);

 const getLevelColor = (level: string) => {
 switch (level) {
 case 'Legend': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
 case 'Elite': return 'bg-purple-100 text-purple-700 border-purple-200';
 case 'Expert': return 'bg-orange-100 text-orange-700 border-orange-200';
 case 'Achiever': return 'bg-amber-100 text-amber-700 border-amber-200';
 default: return 'bg-muted text-text-secondary border-border';
 }
 };

 const getProgressColor = (progress: number) => {
 if (progress >= 75) return 'bg-emerald-500';
 if (progress >= 50) return 'bg-amber-500';
 return 'bg-electric';
 };

 const branches = [...new Set(students.map((s) => s.branch))];
 const years = [...new Set(students.map((s) => s.year))];
 const levels = ['Legend', 'Elite', 'Expert', 'Achiever', 'Starter'];

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl font-bold font-heading text-foreground">Student Tracker</h1>
 <p className="text-sm text-text-secondary mt-1">Monitor progress, search, filter, and track student achievements</p>
 </div>

 {/* Search and controls */}
 <div className="flex items-center gap-3">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 placeholder="Search by name, email, or branch..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-10"
 />
 </div>
 <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
 <Filter className="w-4 h-4" />
 Filters
 <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
 </Button>
 <Select value={sortBy} onValueChange={setSortBy}>
 <SelectTrigger className="w-40">
 <SelectValue placeholder="Sort by" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="score">Score</SelectItem>
 <SelectItem value="name">Name</SelectItem>
 <SelectItem value="tasks">Tasks</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {/* Filters */}
 {showFilters && (
 <div
 className="grid grid-cols-1 sm:grid-cols-3 gap-3"
 >
 <Select value={branchFilter} onValueChange={setBranchFilter}>
 <SelectTrigger>
 <SelectValue placeholder="Branch" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Branches</SelectItem>
 {branches.map((br) => (
 <SelectItem key={br} value={br}>{br}</SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Select value={yearFilter} onValueChange={setYearFilter}>
 <SelectTrigger>
 <SelectValue placeholder="Year" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Years</SelectItem>
 {years.map((yr) => (
 <SelectItem key={yr} value={yr}>{yr}</SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Select value={levelFilter} onValueChange={setLevelFilter}>
 <SelectTrigger>
 <SelectValue placeholder="Level" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Levels</SelectItem>
 {levels.map((lvl) => (
 <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 )}

 {/* Results count */}
 <p className="text-sm text-text-secondary">
 <Users className="w-4 h-4 inline mr-1" />
 Showing {filteredStudents.length} of {students.length} students
 </p>

 {/* Student cards */}
 <div className="space-y-3">
 {filteredStudents.map((student, index) => (
 <div key={student.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
 <Card className="hover:shadow-md transition-shadow">
 <CardContent className="p-5">
 <div className="flex items-start gap-4">
 <Avatar className="w-12 h-12">
 <AvatarFallback className="bg-electric/10 text-electric text-sm font-bold">
 {student.avatar}
 </AvatarFallback>
 </Avatar>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="text-sm font-bold">{student.name}</h3>
 {student.isVerified && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
 <Badge variant="outline" className={`text-[9px] ${getLevelColor(student.level)}`}>
 {student.level}
 </Badge>
 </div>
 <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary flex-wrap">
 <span className="flex items-center gap-1">
 <GraduationCap className="w-3 h-3" />{student.degree} {student.branch}
 </span>
 <span className="flex items-center gap-1">
 <MapPin className="w-3 h-3" />{student.city}
 </span>
 <span className="flex items-center gap-1">
 <Clock className="w-3 h-3" />{student.lastActive}
 </span>
 </div>

 {/* Progress bar */}
 <div className="mt-3">
 <div className="flex items-center justify-between text-xs mb-1">
 <span className="text-text-secondary">Progress</span>
 <span className="font-medium">{student.score}/1000 ({student.progress}%)</span>
 </div>
 <Progress value={student.progress} className="h-2" />
 </div>

 {/* Stats row */}
 <div className="flex items-center gap-4 mt-3 text-xs text-text-secondary">
 <span className="flex items-center gap-1">
 <Briefcase className="w-3 h-3" />{student.tasksCompleted} tasks
 </span>
 <span className="flex items-center gap-1">
 <Award className="w-3 h-3" />{student.certificates} certs
 </span>
 <span>🔥 {student.streak}d streak</span>
 <span>📊 {student.year}</span>
 </div>
 </div>

 <Link href={`/student/${student.id}`}>
 <Button size="sm" variant="outline" className="text-xs gap-1">
 <ExternalLink className="w-3 h-3" /> Portfolio
 </Button>
 </Link>
 </div>
 </CardContent>
 </Card>
 </div>
 ))}
 </div>

 {filteredStudents.length === 0 && (
 <Card>
 <CardContent className="p-8 text-center">
 <Users className="w-10 h-10 text-text-secondary/30 mx-auto mb-2" />
 <p className="text-sm text-text-secondary">No students match your criteria</p>
 </CardContent>
 </Card>
 )}
 </div>
 );
}
