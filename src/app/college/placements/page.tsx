'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select';
import {
 FileBarChart,
 Briefcase,
 Building2,
 GraduationCap,
 TrendingUp,
 Star,
 DollarSign,
 MapPin,
 Search,
 Filter,
 Download,
 ArrowUpRight,
 Users,
 Award,
 CheckCircle2,
 Clock,
} from 'lucide-react';
import {
 BarChart,
 Bar,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
} from 'recharts';

interface PlacementRecord {
 id: string;
 studentName: string;
 avatar: string;
 branch: string;
 degree: string;
 company: string;
 role: string;
 package: string;
 location: string;
 type: 'Internship' | 'Full-Time' | 'PPO';
 status: 'Accepted' | 'Offered' | 'In Process';
 placedDate: string;
 campusCredScore: number;
}

const mockPlacements: PlacementRecord[] = [
 { id: '1', studentName: 'Arjun Reddy', avatar: 'AR', branch: 'CSE', degree: 'B.Tech', company: 'Razorpay', role: 'SDE-1', package: '₹22 LPA', location: 'Bangalore', type: 'Full-Time', status: 'Accepted', placedDate: '2025-01-15', campusCredScore: 920 },
 { id: '2', studentName: 'Priya Sharma', avatar: 'PS', branch: 'CSE', degree: 'B.Tech', company: 'Zomato', role: 'Frontend Developer', package: '₹18 LPA', location: 'Delhi', type: 'Full-Time', status: 'Accepted', placedDate: '2025-01-10', campusCredScore: 820 },
 { id: '3', studentName: 'Divya Menon', avatar: 'DM', branch: 'IT', degree: 'B.Tech', company: 'Flipkart', role: 'Data Analyst', package: '₹15 LPA', location: 'Bangalore', type: 'PPO', status: 'Accepted', placedDate: '2025-01-08', campusCredScore: 750 },
 { id: '4', studentName: 'Rahul Verma', avatar: 'RV', branch: 'IT', degree: 'B.Tech', company: 'PhonePe', role: 'Backend Intern', package: '₹15,000/mo', location: 'Bangalore', type: 'Internship', status: 'Accepted', placedDate: '2025-01-05', campusCredScore: 650 },
 { id: '5', studentName: 'Ananya Patel', avatar: 'AP', branch: 'ECE', degree: 'B.Tech', company: 'Freshworks', role: 'ML Engineer', package: '₹14 LPA', location: 'Chennai', type: 'Full-Time', status: 'Offered', placedDate: '2025-01-12', campusCredScore: 580 },
 { id: '6', studentName: 'Sneha Iyer', avatar: 'SI', branch: 'CSE', degree: 'M.Tech', company: 'Swiggy', role: 'UI/UX Designer', package: '₹12 LPA', location: 'Bangalore', type: 'Full-Time', status: 'Accepted', placedDate: '2024-12-20', campusCredScore: 480 },
 { id: '7', studentName: 'Karthik Nair', avatar: 'KN', branch: 'Mechanical', degree: 'B.Tech', company: 'TCS', role: 'Software Developer', package: '₹7 LPA', location: 'Chennai', type: 'Full-Time', status: 'In Process', placedDate: '2025-01-18', campusCredScore: 320 },
 { id: '8', studentName: 'Amit Kumar', avatar: 'AK', branch: 'CSE', degree: 'B.E', company: 'Infosys', role: 'System Engineer', package: '₹6.5 LPA', location: 'Pune', type: 'Full-Time', status: 'Offered', placedDate: '2025-01-16', campusCredScore: 290 },
];

const branchPlacementData = [
 { branch: 'CSE', placed: 85, total: 120 },
 { branch: 'IT', placed: 52, total: 80 },
 { branch: 'ECE', placed: 38, total: 70 },
 { branch: 'EEE', placed: 22, total: 60 },
 { branch: 'Mech', placed: 18, total: 55 },
 { branch: 'Civil', placed: 12, total: 45 },
];

export default function CollegePlacementsPage() {
 const { token, user } = useAppStore();
 const [placements] = React.useState<PlacementRecord[]>(mockPlacements);
 const [searchQuery, setSearchQuery] = React.useState('');
 const [branchFilter, setBranchFilter] = React.useState('all');
 const [typeFilter, setTypeFilter] = React.useState('all');
 const [stats, setStats] = React.useState({
 totalPlaced: 189,
 placementRate: 68,
 avgPackage: '₹12.5 LPA',
 highestPackage: '₹45 LPA',
 companiesVisited: 42,
 offersThisYear: 227,
 });

 React.useEffect(() => {
 const fetchPlacements = async () => {
 try {
 const headers: Record<string, string> = {};
 if (token) headers['Authorization'] = `Bearer ${token}`;
 const res = await fetch('/api/college/placements', { headers });
 if (res.ok) {
 const data = await res.json();
 setStats((prev) => ({ ...prev, ...data }));
 }
 } catch (err) {
 console.error('Error fetching placements:', err);
 }
 };
 fetchPlacements();
 }, [token, user]);

 const filteredPlacements = React.useMemo(() => {
 let filtered = placements;
 if (searchQuery) {
 const q = searchQuery.toLowerCase();
 filtered = filtered.filter(
 (p) => p.studentName.toLowerCase().includes(q) || p.company.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)
 );
 }
 if (branchFilter !== 'all') filtered = filtered.filter((p) => p.branch === branchFilter);
 if (typeFilter !== 'all') filtered = filtered.filter((p) => p.type.toLowerCase().replace('-', '') === typeFilter);
 return filtered;
 }, [placements, searchQuery, branchFilter, typeFilter]);

 const branches = [...new Set(placements.map((p) => p.branch))];

 const getTypeColor = (type: string) => {
 switch (type) {
 case 'Full-Time': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
 case 'PPO': return 'bg-purple-100 text-purple-700 border-purple-200';
 case 'Internship': return 'bg-electric/10 text-electric border-electric/20';
 default: return 'bg-muted text-text-secondary';
 }
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'Accepted': return 'bg-emerald-100 text-emerald-700';
 case 'Offered': return 'bg-amber-100 text-amber-700';
 case 'In Process': return 'bg-electric/10 text-electric';
 default: return 'bg-muted text-text-secondary';
 }
 };

 const handleExport = () => {
 const csvRows = [
 ['Student', 'Branch', 'Company', 'Role', 'Package', 'Type', 'Status', 'Date'].join(','),
 ...filteredPlacements.map((p) =>
 [p.studentName, p.branch, p.company, p.role, p.package, p.type, p.status, p.placedDate].join(',')
 ),
 ];
 const csv = csvRows.join('\n');
 const blob = new Blob([csv], { type: 'text/csv' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = 'placement_report.csv';
 a.click();
 URL.revokeObjectURL(url);
 };

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between flex-wrap gap-4">
 <div>
 <h1 className="text-2xl font-bold font-heading text-foreground">Placement Reports</h1>
 <p className="text-sm text-text-secondary mt-1">Track placement statistics and student hiring outcomes</p>
 </div>
 <Button onClick={handleExport} variant="outline" className="gap-2">
 <Download className="w-4 h-4" />
 Export CSV
 </Button>
 </div>

 {/* Stats */}
 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
 {[
 { label: 'Total Placed', value: stats.totalPlaced.toString(), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+32 this semester' },
 { label: 'Placement Rate', value: `${stats.placementRate}%`, icon: TrendingUp, color: 'text-electric', bg: 'bg-electric/10', change: '+8% improvement' },
 { label: 'Avg Package', value: stats.avgPackage, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50', change: '+15% YoY' },
 { label: 'Highest Package', value: stats.highestPackage, icon: Star, color: 'text-purple', bg: 'bg-purple/10', change: 'CSE branch' },
 { label: 'Companies Visited', value: stats.companiesVisited.toString(), icon: Building2, color: 'text-electric', bg: 'bg-electric/10', change: '+10 new companies' },
 { label: 'Offers This Year', value: stats.offersThisYear.toString(), icon: Briefcase, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+38 from last year' },
 ].map((stat, index) => {
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
 <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
 <ArrowUpRight className="w-3 h-3" />{stat.change}
 </p>
 </CardContent>
 </Card>
 </div>
 );
 })}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Branch-wise placement chart */}
 <Card className="lg:col-span-2">
 <CardContent className="p-6">
 <h3 className="text-sm font-bold font-heading mb-4">Branch-wise Placements</h3>
 <ResponsiveContainer width="100%" height={300}>
 <BarChart data={branchPlacementData}>
 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
 <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
 <YAxis tick={{ fontSize: 12 }} />
 <Tooltip />
 <Bar dataKey="placed" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Placed" />
 <Bar dataKey="total" fill="#E5E7EB" radius={[4, 4, 0, 0]} name="Total" />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 {/* Placement type distribution */}
 <Card>
 <CardContent className="p-6">
 <h3 className="text-sm font-bold font-heading mb-4">By Type</h3>
 <div className="space-y-4">
 {[
 { type: 'Full-Time', count: placements.filter((p) => p.type === 'Full-Time').length, color: 'bg-emerald-500', pct: '60%' },
 { type: 'PPO', count: placements.filter((p) => p.type === 'PPO').length, color: 'bg-purple-500', pct: '20%' },
 { type: 'Internship', count: placements.filter((p) => p.type === 'Internship').length, color: 'bg-electric', pct: '20%' },
 ].map((item) => (
 <div key={item.type}>
 <div className="flex items-center justify-between text-sm mb-1">
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full ${item.color}`} />
 <span>{item.type}</span>
 </div>
 <span className="font-bold">{item.count}</span>
 </div>
 <div className="h-2 rounded-full bg-muted overflow-hidden">
 <div className={`h-full rounded-full ${item.color}`} style={{ width: item.pct }} />
 </div>
 </div>
 ))}
 </div>

 <div className="mt-6 p-3 rounded-lg bg-amber-50 text-center">
 <p className="text-[10px] text-amber-700 font-medium">CAMPUSCRED IMPACT</p>
 <p className="text-lg font-bold font-heading text-amber-700">78%</p>
 <p className="text-[10px] text-amber-600">of placed students had CampusCred certificates</p>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Search and filters */}
 <div className="flex items-center gap-3">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 placeholder="Search by student, company, or role..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-10"
 />
 </div>
 <Select value={branchFilter} onValueChange={setBranchFilter}>
 <SelectTrigger className="w-36">
 <SelectValue placeholder="Branch" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Branches</SelectItem>
 {branches.map((br) => (
 <SelectItem key={br} value={br}>{br}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 <Select value={typeFilter} onValueChange={setTypeFilter}>
 <SelectTrigger className="w-36">
 <Filter className="w-4 h-4 mr-2" />
 <SelectValue placeholder="Type" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Types</SelectItem>
 <SelectItem value="fulltime">Full-Time</SelectItem>
 <SelectItem value="ppo">PPO</SelectItem>
 <SelectItem value="internship">Internship</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {/* Placement records */}
 <div className="space-y-3">
 {filteredPlacements.map((placement, index) => (
 <div key={placement.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
 <Card className="hover:shadow-md transition-shadow">
 <CardContent className="p-5">
 <div className="flex items-start gap-4">
 <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-sm font-bold text-amber-700">
 {placement.avatar}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="text-sm font-bold">{placement.studentName}</h3>
 <Badge variant="outline" className={`text-[9px] ${getTypeColor(placement.type)}`}>
 {placement.type}
 </Badge>
 <Badge className={`text-[9px] ${getStatusColor(placement.status)}`}>
 {placement.status}
 </Badge>
 </div>
 <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary flex-wrap">
 <span className="flex items-center gap-1">
 <Building2 className="w-3 h-3" />{placement.company}
 </span>
 <span className="flex items-center gap-1">
 <Briefcase className="w-3 h-3" />{placement.role}
 </span>
 <span className="flex items-center gap-1">
 <GraduationCap className="w-3 h-3" />{placement.degree} {placement.branch}
 </span>
 <span className="flex items-center gap-1">
 <MapPin className="w-3 h-3" />{placement.location}
 </span>
 </div>
 </div>
 <div className="text-right">
 <p className="text-sm font-bold text-emerald-700">{placement.package}</p>
 <p className="text-[10px] text-text-secondary flex items-center gap-1 justify-end">
 <Star className="w-3 h-3 text-amber-500" />
 {placement.campusCredScore} score
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 ))}
 </div>

 {filteredPlacements.length === 0 && (
 <Card>
 <CardContent className="p-8 text-center">
 <FileBarChart className="w-10 h-10 text-text-secondary/30 mx-auto mb-2" />
 <p className="text-sm text-text-secondary">No placement records found</p>
 </CardContent>
 </Card>
 )}
 </div>
 );
}
