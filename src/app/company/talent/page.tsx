'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
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
 MapPin,
 ExternalLink,
 Eye,
 MessageSquare,
 ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

interface TalentProfile {
 id: string;
 name: string;
 avatar: string;
 college: string;
 branch: string;
 degree: string;
 city: string;
 score: number;
 level: string;
 skills: string[];
 tasksCompleted: number;
 certificates: number;
 streak: number;
}

const mockTalents: TalentProfile[] = [
 { id: '1', name: 'Priya Sharma', avatar: 'PS', college: 'IIT Delhi', branch: 'CSE', degree: 'B.Tech', city: 'Delhi', score: 820, level: 'Elite', skills: ['React', 'Node.js', 'Python', 'AWS'], tasksCompleted: 24, certificates: 18, streak: 15 },
 { id: '2', name: 'Rahul Verma', avatar: 'RV', college: 'VIT Vellore', branch: 'IT', degree: 'B.Tech', city: 'Chennai', score: 650, level: 'Expert', skills: ['Java', 'Spring Boot', 'MySQL', 'Docker'], tasksCompleted: 18, certificates: 14, streak: 8 },
 { id: '3', name: 'Ananya Patel', avatar: 'AP', college: 'NIT Trichy', branch: 'ECE', degree: 'B.Tech', city: 'Trichy', score: 580, level: 'Expert', skills: ['Machine Learning', 'Python', 'TensorFlow', 'Data Analysis'], tasksCompleted: 15, certificates: 12, streak: 12 },
 { id: '4', name: 'Arjun Reddy', avatar: 'AR', college: 'BITS Pilani', branch: 'CSE', degree: 'B.Tech', city: 'Hyderabad', score: 920, level: 'Legend', skills: ['Full-Stack', 'React', 'Go', 'Kubernetes'], tasksCompleted: 35, certificates: 28, streak: 30 },
 { id: '5', name: 'Sneha Iyer', avatar: 'SI', college: 'IIIT Bangalore', branch: 'CSE', degree: 'M.Tech', city: 'Bangalore', score: 480, level: 'Expert', skills: ['UI/UX Design', 'Figma', 'CSS', 'User Research'], tasksCompleted: 12, certificates: 10, streak: 5 },
 { id: '6', name: 'Karthik Nair', avatar: 'KN', college: 'COEP Pune', branch: 'Mechanical', degree: 'B.Tech', city: 'Pune', score: 320, level: 'Achiever', skills: ['CAD', 'MATLAB', 'Python', '3D Modeling'], tasksCompleted: 8, certificates: 6, streak: 3 },
 { id: '7', name: 'Divya Menon', avatar: 'DM', college: 'DTU Delhi', branch: 'IT', degree: 'B.Tech', city: 'Delhi', score: 750, level: 'Elite', skills: ['Data Science', 'Python', 'R', 'Tableau'], tasksCompleted: 22, certificates: 17, streak: 20 },
 { id: '8', name: 'Amit Kumar', avatar: 'AK', college: 'Jadavpur University', branch: 'CSE', degree: 'B.E', city: 'Kolkata', score: 290, level: 'Achiever', skills: ['Android', 'Kotlin', 'Firebase', 'UI Design'], tasksCompleted: 10, certificates: 7, streak: 7 },
];

export default function CompanyTalentPage() {
 const { token } = useAppStore();
 const [talents] = React.useState<TalentProfile[]>(mockTalents);
 const [searchQuery, setSearchQuery] = React.useState('');
 const [branchFilter, setBranchFilter] = React.useState('all');
 const [levelFilter, setLevelFilter] = React.useState('all');
 const [scoreSort, setScoreSort] = React.useState('desc');
 const [showFilters, setShowFilters] = React.useState(false);

 const filteredTalents = React.useMemo(() => {
 let filtered = talents;
 if (searchQuery) {
 const q = searchQuery.toLowerCase();
 filtered = filtered.filter(
 (t) =>
 t.name.toLowerCase().includes(q) ||
 t.college.toLowerCase().includes(q) ||
 t.skills.some((s) => s.toLowerCase().includes(q))
 );
 }
 if (branchFilter !== 'all') {
 filtered = filtered.filter((t) => t.branch === branchFilter);
 }
 if (levelFilter !== 'all') {
 filtered = filtered.filter((t) => t.level === levelFilter);
 }
 filtered = [...filtered].sort((a, b) =>
 scoreSort === 'desc' ? b.score - a.score : a.score - b.score
 );
 return filtered;
 }, [talents, searchQuery, branchFilter, levelFilter, scoreSort]);

 const getLevelColor = (level: string) => {
 switch (level) {
 case 'Legend': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
 case 'Elite': return 'bg-purple-100 text-purple-700 border-purple-200';
 case 'Expert': return 'bg-orange-100 text-orange-700 border-orange-200';
 case 'Achiever': return 'bg-amber-100 text-amber-700 border-amber-200';
 default: return 'bg-muted text-text-secondary border-border';
 }
 };

 const getScoreBarColor = (score: number) => {
 if (score >= 900) return 'bg-yellow-500';
 if (score >= 600) return 'bg-purple-500';
 if (score >= 300) return 'bg-orange-500';
 if (score >= 100) return 'bg-amber-500';
 return 'bg-emerald-500';
 };

 const branches = [...new Set(talents.map((t) => t.branch))];
 const levels = ['Legend', 'Elite', 'Expert', 'Achiever', 'Starter'];

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl font-bold font-heading text-foreground">Talent Search</h1>
 <p className="text-sm text-text-secondary mt-1">Discover and connect with top student talent across India</p>
 </div>

 {/* Search bar */}
 <div className="flex items-center gap-3">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 placeholder="Search by name, college, or skills..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-10"
 />
 </div>
 <Button
 variant="outline"
 onClick={() => setShowFilters(!showFilters)}
 className="gap-2"
 >
 <Filter className="w-4 h-4" />
 Filters
 <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
 </Button>
 </div>

 {/* Filters */}
 {showFilters && (
 <div
 className="grid grid-cols-1 sm:grid-cols-3 gap-3"
 >
 <Select value={branchFilter} onValueChange={setBranchFilter}>
 <SelectTrigger>
 <SelectValue placeholder="Filter by branch" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Branches</SelectItem>
 {branches.map((br) => (
 <SelectItem key={br} value={br}>{br}</SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Select value={levelFilter} onValueChange={setLevelFilter}>
 <SelectTrigger>
 <SelectValue placeholder="Filter by level" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Levels</SelectItem>
 {levels.map((lvl) => (
 <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
 ))}
 </SelectContent>
 </Select>

 <Select value={scoreSort} onValueChange={setScoreSort}>
 <SelectTrigger>
 <SelectValue placeholder="Sort by score" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="desc">Highest Score First</SelectItem>
 <SelectItem value="asc">Lowest Score First</SelectItem>
 </SelectContent>
 </Select>
 </div>
 )}

 {/* Results count */}
 <div className="flex items-center justify-between">
 <p className="text-sm text-text-secondary">
 <Users className="w-4 h-4 inline mr-1" />
 {filteredTalents.length} students found
 </p>
 </div>

 {/* Talent grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {filteredTalents.map((talent, index) => (
 <div key={talent.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
 <Card className="hover:shadow-md transition-shadow">
 <CardContent className="p-5">
 <div className="flex items-start gap-3">
 <Avatar className="w-12 h-12">
 <AvatarFallback className="bg-electric/10 text-electric text-sm font-bold">
 {talent.avatar}
 </AvatarFallback>
 </Avatar>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2">
 <p className="text-sm font-bold truncate">{talent.name}</p>
 <Badge variant="outline" className={`text-[9px] ${getLevelColor(talent.level)}`}>
 {talent.level}
 </Badge>
 </div>
 <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
 <span className="flex items-center gap-1">
 <GraduationCap className="w-3 h-3" />{talent.degree} {talent.branch}
 </span>
 </div>
 <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
 <span className="flex items-center gap-1">
 <Building2 className="w-3 h-3" />{talent.college}
 </span>
 <span className="flex items-center gap-1">
 <MapPin className="w-3 h-3" />{talent.city}
 </span>
 </div>
 </div>
 </div>

 {/* Score bar */}
 <div className="mt-3">
 <div className="flex items-center justify-between text-xs mb-1">
 <span className="font-medium">CampusCred Score</span>
 <span className="font-bold">{talent.score}/1000</span>
 </div>
 <div className="h-2 rounded-full bg-muted overflow-hidden">
 <div
 className={`h-full rounded-full ${getScoreBarColor(talent.score)} transition-all`}
 style={{ width: `${(talent.score / 1000) * 100}%` }}
 />
 </div>
 </div>

 {/* Skills */}
 <div className="flex flex-wrap gap-1 mt-3">
 {talent.skills.map((skill) => (
 <Badge key={skill} variant="secondary" className="text-[10px]">
 {skill}
 </Badge>
 ))}
 </div>

 {/* Stats */}
 <div className="flex items-center gap-4 mt-3 text-xs text-text-secondary">
 <span className="flex items-center gap-1">
 <Star className="w-3 h-3 text-amber-500" />{talent.tasksCompleted} tasks
 </span>
 <span>📜 {talent.certificates} certs</span>
 <span>🔥 {talent.streak}d streak</span>
 </div>

 {/* Actions */}
 <div className="flex gap-2 mt-4">
 <Link href={`/student/${talent.id}`} className="flex-1">
 <Button size="sm" variant="outline" className="w-full text-xs gap-1">
 <Eye className="w-3 h-3" /> View Portfolio
 </Button>
 </Link>
 <Button size="sm" className="flex-1 text-xs bg-navy text-white gap-1">
 <MessageSquare className="w-3 h-3" /> Contact
 </Button>
 </div>
 </CardContent>
 </Card>
 </div>
 ))}
 </div>

 {filteredTalents.length === 0 && (
 <Card>
 <CardContent className="p-8 text-center">
 <Users className="w-10 h-10 text-text-secondary/30 mx-auto mb-2" />
 <p className="text-sm text-text-secondary">No students match your search criteria</p>
 <p className="text-xs text-text-secondary mt-1">Try adjusting your filters</p>
 </CardContent>
 </Card>
 )}
 </div>
 );
}
