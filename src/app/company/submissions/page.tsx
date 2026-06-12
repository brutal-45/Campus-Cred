'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
 FileText,
 ChevronDown,
 ChevronUp,
 CheckCircle2,
 XCircle,
 Clock,
 Star,
 Building2,
 GraduationCap,
 Eye,
 MessageSquare,
 Filter,
 Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Submission {
 id: string;
 studentName: string;
 studentCollege: string;
 studentBranch: string;
 studentLevel: string;
 studentScore: number;
 taskTitle: string;
 submittedAt: string;
 status: 'Pending' | 'Approved' | 'Rejected' | 'Under Review';
 rating: number | null;
 feedback: string | null;
}

const mockSubmissions: Submission[] = [
 { id: '1', studentName: 'Priya Sharma', studentCollege: 'IIT Delhi', studentBranch: 'CSE', studentLevel: 'Expert', studentScore: 580, taskTitle: 'Build a REST API for E-Commerce', submittedAt: '2025-01-15', status: 'Pending', rating: null, feedback: null },
 { id: '2', studentName: 'Rahul Verma', studentCollege: 'VIT Vellore', studentBranch: 'IT', studentLevel: 'Achiever', studentScore: 240, taskTitle: 'Design a Mobile App Landing Page', submittedAt: '2025-01-14', status: 'Approved', rating: 4, feedback: 'Great work on the design!' },
 { id: '3', studentName: 'Ananya Patel', studentCollege: 'NIT Trichy', studentBranch: 'ECE', studentLevel: 'Pro', studentScore: 650, taskTitle: 'Build a REST API for E-Commerce', submittedAt: '2025-01-13', status: 'Approved', rating: 5, feedback: 'Excellent API design and documentation' },
 { id: '4', studentName: 'Arjun Reddy', studentCollege: 'BITS Pilani', studentBranch: 'CSE', studentLevel: 'Expert', studentScore: 420, taskTitle: 'Create a Social Media Dashboard', submittedAt: '2025-01-12', status: 'Rejected', rating: 2, feedback: 'Does not meet requirements' },
 { id: '5', studentName: 'Sneha Iyer', studentCollege: 'NLSIU Bangalore', studentBranch: 'Law', studentLevel: 'Starter', studentScore: 80, taskTitle: 'Write a Legal Research Report', submittedAt: '2025-01-11', status: 'Under Review', rating: null, feedback: null },
 { id: '6', studentName: 'Karthik Nair', studentCollege: 'IIIT Hyderabad', studentBranch: 'CSE', studentLevel: 'Elite', studentScore: 750, taskTitle: 'Build a REST API for E-Commerce', submittedAt: '2025-01-10', status: 'Approved', rating: 5, feedback: 'Outstanding work!' },
 { id: '7', studentName: 'Divya Menon', studentCollege: 'COEP Pune', studentBranch: 'Mechanical', studentLevel: 'Achiever', studentScore: 200, taskTitle: 'Create Product Mockups', submittedAt: '2025-01-09', status: 'Pending', rating: null, feedback: null },
 { id: '8', studentName: 'Amit Kumar', studentCollege: 'DTU Delhi', studentBranch: 'IT', studentLevel: 'Expert', studentScore: 380, taskTitle: 'Data Analysis Dashboard', submittedAt: '2025-01-08', status: 'Approved', rating: 4, feedback: 'Good analysis with clear visualizations' },
];

export default function CompanySubmissionsPage() {
 const { token } = useAppStore();
 const [submissions] = React.useState<Submission[]>(mockSubmissions);
 const [expandedId, setExpandedId] = React.useState<string | null>(null);
 const [searchQuery, setSearchQuery] = React.useState('');
 const [activeTab, setActiveTab] = React.useState('all');
 const [actionLoading, setActionLoading] = React.useState<string | null>(null);

 const filteredSubmissions = React.useMemo(() => {
 let filtered = submissions;
 if (activeTab !== 'all') {
 filtered = filtered.filter((s) => s.status.toLowerCase().replace(' ', '-') === activeTab);
 }
 if (searchQuery) {
 const q = searchQuery.toLowerCase();
 filtered = filtered.filter(
 (s) =>
 s.studentName.toLowerCase().includes(q) ||
 s.taskTitle.toLowerCase().includes(q) ||
 s.studentCollege.toLowerCase().includes(q)
 );
 }
 return filtered;
 }, [submissions, activeTab, searchQuery]);

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
 case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
 case 'Under Review': return 'bg-amber-100 text-amber-700 border-amber-200';
 default: return 'bg-muted text-text-secondary border-border';
 }
 };

 const getLevelColor = (level: string) => {
 switch (level) {
 case 'Legend': return 'bg-yellow-100 text-yellow-700';
 case 'Elite': return 'bg-purple-100 text-purple-700';
 case 'Expert': return 'bg-orange-100 text-orange-700';
 case 'Pro': return 'bg-electric/10 text-electric';
 case 'Achiever': return 'bg-amber-100 text-amber-700';
 default: return 'bg-muted text-text-secondary';
 }
 };

 const handleAction = async (submissionId: string, action: 'approve' | 'reject') => {
 setActionLoading(submissionId);
 try {
 const headers: Record<string, string> = { 'Content-Type': 'application/json' };
 if (token) headers['Authorization'] = `Bearer ${token}`;

 const endpoint = action === 'approve'
 ? `/api/admin/submissions/${submissionId}/approve`
 : `/api/admin/submissions/${submissionId}/reject`;

 const res = await fetch(endpoint, {
 method: 'POST',
 headers,
 body: JSON.stringify({ feedback: action === 'approve' ? 'Good work!' : 'Does not meet requirements' }),
 });

 if (res.ok) {
 toast.success(`Submission ${action}d successfully`);
 } else {
 toast.error(`Failed to ${action} submission`);
 }
 } catch {
 toast.error('Something went wrong');
 } finally {
 setActionLoading(null);
 }
 };

 const counts = {
 all: submissions.length,
 pending: submissions.filter((s) => s.status === 'Pending').length,
 approved: submissions.filter((s) => s.status === 'Approved').length,
 rejected: submissions.filter((s) => s.status === 'Rejected').length,
 'under-review': submissions.filter((s) => s.status === 'Under Review').length,
 };

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl font-bold font-heading text-foreground">Submissions</h1>
 <p className="text-sm text-text-secondary mt-1">Review and manage student submissions for your tasks</p>
 </div>

 {/* Search and filters */}
 <div className="flex items-center gap-3">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 placeholder="Search by student, task, or college..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-10"
 />
 </div>
 <Badge variant="outline" className="text-xs gap-1 py-2 px-3">
 <Filter className="w-3 h-3" />
 {filteredSubmissions.length} results
 </Badge>
 </div>

 {/* Tabs */}
 <Tabs value={activeTab} onValueChange={setActiveTab}>
 <TabsList>
 <TabsTrigger value="all" className="text-xs">All ({counts.all})</TabsTrigger>
 <TabsTrigger value="pending" className="text-xs">Pending ({counts.pending})</TabsTrigger>
 <TabsTrigger value="under-review" className="text-xs">Review ({counts['under-review']})</TabsTrigger>
 <TabsTrigger value="approved" className="text-xs">Approved ({counts.approved})</TabsTrigger>
 <TabsTrigger value="rejected" className="text-xs">Rejected ({counts.rejected})</TabsTrigger>
 </TabsList>

 <TabsContent value={activeTab} className="mt-4">
 {filteredSubmissions.length === 0 ? (
 <Card>
 <CardContent className="p-8 text-center">
 <FileText className="w-10 h-10 text-text-secondary/30 mx-auto mb-2" />
 <p className="text-sm text-text-secondary">No submissions found</p>
 </CardContent>
 </Card>
 ) : (
 <div className="space-y-3">
 {filteredSubmissions.map((submission, index) => {
 const isExpanded = expandedId === submission.id;
 return (
 <div key={submission.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
 <Card>
 <CardContent className="p-4">
 <button
 onClick={() => setExpandedId(isExpanded ? null : submission.id)}
 className="w-full flex items-center gap-3"
 >
 <Avatar className="w-10 h-10">
 <AvatarFallback className="bg-electric/10 text-electric text-xs font-semibold">
 {submission.studentName.split(' ').map((n) => n[0]).join('')}
 </AvatarFallback>
 </Avatar>
 <div className="flex-1 min-w-0 text-left">
 <div className="flex items-center gap-2">
 <p className="text-sm font-semibold truncate">{submission.studentName}</p>
 <Badge variant="outline" className={`text-[9px] ${getStatusColor(submission.status)}`}>
 {submission.status}
 </Badge>
 </div>
 <p className="text-xs text-text-secondary truncate">{submission.taskTitle}</p>
 <div className="flex items-center gap-3 mt-1">
 <span className="text-[10px] text-text-secondary flex items-center gap-1">
 <Building2 className="w-3 h-3" />{submission.studentCollege}
 </span>
 <span className="text-[10px] text-text-secondary flex items-center gap-1">
 <GraduationCap className="w-3 h-3" />{submission.studentBranch}
 </span>
 <Badge variant="outline" className={`text-[9px] ${getLevelColor(submission.studentLevel)}`}>
 {submission.studentLevel}
 </Badge>
 </div>
 </div>
 <div className="flex items-center gap-2">
 {submission.rating && (
 <span className="flex items-center gap-1 text-xs">
 <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
 {submission.rating}/5
 </span>
 )}
 {isExpanded ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
 </div>
 </button>

 {isExpanded && (
 <div
 className="mt-4 pt-4 border-t border-border"
 >
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
 <div>
 <p className="text-[10px] text-text-secondary">CampusCred Score</p>
 <p className="text-sm font-bold">{submission.studentScore}/1000</p>
 </div>
 <div>
 <p className="text-[10px] text-text-secondary">Submitted</p>
 <p className="text-sm font-medium">{new Date(submission.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
 </div>
 <div>
 <p className="text-[10px] text-text-secondary">Rating</p>
 <p className="text-sm font-medium">{submission.rating ? `${submission.rating}/5` : 'Not rated'}</p>
 </div>
 <div>
 <p className="text-[10px] text-text-secondary">Status</p>
 <Badge variant="outline" className={`text-[10px] ${getStatusColor(submission.status)}`}>{submission.status}</Badge>
 </div>
 </div>

 {submission.feedback && (
 <div className="p-3 rounded-lg bg-muted/50 mb-4">
 <p className="text-[10px] text-text-secondary font-medium mb-1">Feedback</p>
 <p className="text-xs">{submission.feedback}</p>
 </div>
 )}

 {submission.status === 'Pending' && (
 <div className="flex gap-2">
 <Button
 size="sm"
 onClick={() => handleAction(submission.id, 'approve')}
 disabled={actionLoading === submission.id}
 className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
 >
 <CheckCircle2 className="w-3 h-3" />
 Approve
 </Button>
 <Button
 size="sm"
 variant="outline"
 onClick={() => handleAction(submission.id, 'reject')}
 disabled={actionLoading === submission.id}
 className="text-xs border-red-300 text-red-600 hover:bg-red-50 gap-1"
 >
 <XCircle className="w-3 h-3" />
 Reject
 </Button>
 <Button size="sm" variant="ghost" className="text-xs gap-1">
 <Eye className="w-3 h-3" />
 View Work
 </Button>
 <Button size="sm" variant="ghost" className="text-xs gap-1">
 <MessageSquare className="w-3 h-3" />
 Message
 </Button>
 </div>
 )}
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 );
 })}
 </div>
 )}
 </TabsContent>
 </Tabs>
 </div>
 );
}
