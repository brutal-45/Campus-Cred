'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Search, FileCheck, CheckCircle, XCircle, Clock, MessageSquare,
  Star, Eye, Filter, Send,
} from 'lucide-react';
import { toast } from 'sonner';

interface Submission {
  id: string; studentName: string; studentEmail: string; taskTitle: string;
  description: string; status: string; submittedAt: string; rating: number | null;
  feedback: string; fileUrl: string; externalLink: string;
}

const mockSubmissions: Submission[] = [
  { id: '1', studentName: 'Aarav Sharma', studentEmail: 'aarav@mail.com', taskTitle: 'Build a REST API for Todo App', description: 'Implemented complete REST API with authentication, rate limiting, and comprehensive documentation.', status: 'Pending', submittedAt: '2025-03-08T14:30:00Z', rating: null, feedback: '', fileUrl: '', externalLink: 'https://github.com/aarav/todo-api' },
  { id: '2', studentName: 'Priya Patel', studentEmail: 'priya@mail.com', taskTitle: 'Design Mobile App UI Kit', description: 'Created a 20-screen UI kit with dark mode support and component library.', status: 'Under Review', submittedAt: '2025-03-07T10:15:00Z', rating: null, feedback: '', fileUrl: '', externalLink: 'https://figma.com/priya/ui-kit' },
  { id: '3', studentName: 'Rahul Verma', studentEmail: 'rahul@mail.com', taskTitle: 'Analyze Sales Dataset', description: 'EDA with 15 visualizations, predictive model with 94% accuracy.', status: 'Approved', submittedAt: '2025-03-06T09:00:00Z', rating: 4, feedback: 'Excellent analysis! Very thorough EDA.', fileUrl: '', externalLink: '' },
  { id: '4', studentName: 'Sneha Gupta', studentEmail: 'sneha@mail.com', taskTitle: 'Write Technical Blog Post', description: 'AI in Education: A 2000-word deep dive into the future of learning.', status: 'Rejected', submittedAt: '2025-03-05T16:45:00Z', rating: 2, feedback: 'Needs more research and citations. Please revise.', fileUrl: '', externalLink: '' },
  { id: '5', studentName: 'Vikram Singh', studentEmail: 'vikram@mail.com', taskTitle: 'Create Marketing Campaign', description: 'Complete digital marketing strategy with social media calendar and analytics.', status: 'Pending', submittedAt: '2025-03-08T12:00:00Z', rating: null, feedback: '', fileUrl: '', externalLink: '' },
  { id: '6', studentName: 'Deepa Nair', studentEmail: 'deepa@mail.com', taskTitle: 'Daily Challenge: Binary Search', description: 'Optimized binary search implementation with O(log n) time.', status: 'Approved', submittedAt: '2025-03-07T08:30:00Z', rating: 5, feedback: 'Perfect implementation with edge case handling!', fileUrl: '', externalLink: 'https://github.com/deepa/binary-search' } as any,
];

export default function AdminSubmissionsPage() {
  const { token } = useAppStore();
  const [submissions, setSubmissions] = React.useState<Submission[]>(mockSubmissions);
  const [search, setSearch] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [selectedSub, setSelectedSub] = React.useState<Submission | null>(null);
  const [feedback, setFeedback] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState(false);

  const filtered = submissions.filter(s => {
    const matchSearch = s.studentName.toLowerCase().includes(search.toLowerCase()) || s.taskTitle.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const endpoint = action === 'approve'
        ? `/api/admin/submissions/${id}/approve`
        : `/api/admin/submissions/${id}/reject`;
      
      await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify({ feedback }) });
      
      setSubmissions(prev => prev.map(s => s.id === id ? {
        ...s, status: action === 'approve' ? 'Approved' : 'Rejected',
        rating: action === 'approve' ? 4 : 2, feedback,
      } : s));
      toast.success(`Submission ${action === 'approve' ? 'approved' : 'rejected'}`);
      setSelectedSub(null);
      setFeedback('');
    } catch { toast.error('Action failed'); }
    finally { setActionLoading(false); }
  };

  const getStatusColor = (s: string) => {
    switch (s) { case 'Approved': return 'bg-success/10 text-success'; case 'Rejected': return 'bg-danger/10 text-danger'; case 'Under Review': return 'bg-warning/10 text-warning'; default: return 'bg-muted text-text-secondary'; }
  };

  const formatDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const pendingCount = submissions.filter(s => s.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
          <FileCheck className="w-6 h-6 text-electric" /> Submission Review
        </h2>
        <p className="text-sm text-text-secondary mt-1">Review, approve, or reject student submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: submissions.length, color: 'text-electric' },
          { label: 'Pending', value: pendingCount, color: 'text-warning' },
          { label: 'Approved', value: submissions.filter(s => s.status === 'Approved').length, color: 'text-success' },
          { label: 'Rejected', value: submissions.filter(s => s.status === 'Rejected').length, color: 'text-danger' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4 text-center"><p className="text-xs text-text-secondary">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></CardContent></Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input placeholder="Search by student or task..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-4 h-4 text-text-secondary" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Under Review">Under Review</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead className="hidden md:table-cell">Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sub, idx) => (
                  <tr key={sub.id}
                    className="animate-fade-in hover:bg-muted/50 transition-colors border-b"
                    style={{ animationDelay: `${idx * 30}ms`, borderColor: '#E2E8F0' }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-electric/10 text-electric text-xs font-semibold">
                            {sub.studentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{sub.studentName}</p>
                          <p className="text-[10px] text-text-secondary">{sub.studentEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{sub.taskTitle}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-text-secondary">{formatDate(sub.submittedAt)}</TableCell>
                    <TableCell><Badge className={`text-[10px] border-0 ${getStatusColor(sub.status)}`}>{sub.status}</Badge></TableCell>
                    <TableCell className="hidden lg:table-cell">{sub.rating ? <div className="flex items-center gap-1"><Star className="w-3 h-3 text-warning fill-warning" /><span className="text-xs">{sub.rating}/5</span></div> : <span className="text-xs text-text-secondary">-</span>}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedSub(sub); setFeedback(sub.feedback); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review dialog */}
      <Dialog open={!!selectedSub} onOpenChange={() => { setSelectedSub(null); setFeedback(''); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Review Submission</DialogTitle></DialogHeader>
          {selectedSub && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-electric/10 text-electric text-sm font-semibold">
                    {selectedSub.studentName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedSub.studentName}</p>
                  <p className="text-xs text-text-secondary">{selectedSub.taskTitle}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm">{selectedSub.description}</p>
                {selectedSub.externalLink && <a href={selectedSub.externalLink} target="_blank" className="text-xs text-electric hover:underline flex items-center gap-1"><Send className="w-3 h-3" />{selectedSub.externalLink}</a>}
              </div>
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Clock className="w-3 h-3" /> Submitted {formatDate(selectedSub.submittedAt)}
                <Badge className={`text-[10px] border-0 ${getStatusColor(selectedSub.status)}`}>{selectedSub.status}</Badge>
              </div>
              <div className="space-y-2">
                <Label>Feedback</Label>
                <Textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Write feedback for the student..." rows={3} />
              </div>
              <DialogFooter className="flex gap-2 sm:gap-2">
                <Button variant="outline" onClick={() => { setSelectedSub(null); setFeedback(''); }}>Cancel</Button>
                <Button onClick={() => handleAction(selectedSub.id, 'reject')} disabled={actionLoading} variant="outline" className="text-danger border-danger/20 hover:bg-danger/10">
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
                <Button onClick={() => handleAction(selectedSub.id, 'approve')} disabled={actionLoading} className="bg-success hover:bg-success/90 text-white">
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
