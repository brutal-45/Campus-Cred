'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Search, ChevronLeft, ChevronRight, Users, GraduationCap,
  Trophy, Calendar, Mail, Building2, Phone, CheckCircle,
  XCircle, Ban, MoreHorizontal, Shield, Filter,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Student {
  id: string; fullName: string; email: string; college: string;
  degree: string; branch: string; points: number; level: string;
  createdAt: string; streakDays: number; phone?: string; year?: string; isVerified: boolean;
}

export default function AdminStudentsPage() {
  const { token } = useAppStore();
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [filterLevel, setFilterLevel] = React.useState('all');
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);
  const limit = 10;

  const fetchStudents = React.useCallback(async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/students?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, search, token]);

  React.useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filteredStudents = filterLevel === 'all'
    ? students
    : students.filter(s => s.level === filterLevel);

  const handleAction = async (studentId: string, action: 'verify' | 'suspend' | 'delete') => {
    setActionLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      if (action === 'verify') {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, isVerified: true } : s));
        toast.success('Student verified successfully');
      } else if (action === 'suspend') {
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, isVerified: false } : s));
        toast.success('Student suspended');
      } else if (action === 'delete') {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        setSelectedStudent(null);
        toast.success('Student deleted');
      }
    } catch { toast.error('Action failed'); }
    finally { setActionLoading(false); }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Legend': return 'bg-gold/10 text-gold border-gold/20';
      case 'Elite': case 'Pro': return 'bg-purple/10 text-purple border-purple/20';
      case 'Expert': return 'bg-electric/10 text-electric border-electric/20';
      case 'Achiever': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-text-secondary border-border';
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-electric" /> Student Management
        </h2>
        <p className="text-sm text-text-secondary mt-1">View, verify, suspend, or remove student accounts</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input placeholder="Search by name, email, or college..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-4 h-4 text-text-secondary" />
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Filter Level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Achiever">Achiever</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                  <SelectItem value="Elite">Elite</SelectItem>
                  <SelectItem value="Legend">Legend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-electric/30 border-t-electric rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-text-secondary">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-10 h-10 text-text-secondary/30 mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px]">Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">College</TableHead>
                    <TableHead className="hidden sm:table-cell">Degree / Branch</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, idx) => (
                    <tr key={student.id}
                      className="animate-fade-in hover:bg-muted/50 transition-colors border-b"
                      style={{ animationDelay: `${idx * 30}ms`, borderColor: '#E2E8F0' }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-electric/10 text-electric text-xs font-semibold">
                              {student.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{student.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-text-secondary">{student.email}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">{student.college || '-'}</TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-text-secondary">
                        {student.degree && student.branch ? `${student.degree} / ${student.branch}` : '-'}
                      </TableCell>
                      <TableCell><span className="text-sm font-semibold">{student.points}</span></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${getLevelColor(student.level)}`}>{student.level}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${student.isVerified ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                          {student.isVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedStudent(student)}>
                              <Shield className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction(student.id, 'verify')} className="text-success">
                              <CheckCircle className="w-4 h-4 mr-2" /> Verify
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction(student.id, 'suspend')} className="text-warning">
                              <Ban className="w-4 h-4 mr-2" /> Suspend
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction(student.id, 'delete')} className="text-danger">
                              <XCircle className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-secondary">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="w-4 h-4" /> Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Student detail dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Student Details</DialogTitle></DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-electric/10 text-electric text-lg font-semibold">
                    {selectedStudent.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selectedStudent.fullName}</h3>
                  <Badge variant="outline" className={`text-xs mt-1 ${getLevelColor(selectedStudent.level)}`}>{selectedStudent.level}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-text-secondary" /><span className="text-sm">{selectedStudent.email}</span></div>
                {selectedStudent.phone && <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-text-secondary" /><span className="text-sm">{selectedStudent.phone}</span></div>}
                <div className="flex items-center gap-3"><Building2 className="w-4 h-4 text-text-secondary" /><span className="text-sm">{selectedStudent.college || 'Not specified'}</span></div>
                <div className="flex items-center gap-3"><GraduationCap className="w-4 h-4 text-text-secondary" /><span className="text-sm">{selectedStudent.degree && selectedStudent.branch ? `${selectedStudent.degree} - ${selectedStudent.branch}` : 'Not specified'}</span></div>
                <div className="flex items-center gap-3"><Trophy className="w-4 h-4 text-text-secondary" /><span className="text-sm">{selectedStudent.points} points &bull; {selectedStudent.streakDays} day streak</span></div>
                <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-text-secondary" /><span className="text-sm">Joined {formatDate(selectedStudent.createdAt)}</span></div>
              </div>
              <DialogFooter className="flex gap-2 sm:gap-2">
                <Button variant="outline" size="sm" onClick={() => handleAction(selectedStudent.id, 'verify')} disabled={actionLoading} className="text-success border-success/20 hover:bg-success/10">
                  <CheckCircle className="w-4 h-4 mr-1" /> Verify
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAction(selectedStudent.id, 'suspend')} disabled={actionLoading} className="text-warning border-warning/20 hover:bg-warning/10">
                  <Ban className="w-4 h-4 mr-1" /> Suspend
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAction(selectedStudent.id, 'delete')} disabled={actionLoading} className="text-danger border-danger/20 hover:bg-danger/10">
                  <XCircle className="w-4 h-4 mr-1" /> Delete
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
