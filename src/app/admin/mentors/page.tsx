'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Search, UserCheck, Star, CheckCircle, XCircle, Eye, Clock,
  Briefcase, GraduationCap, Calendar, MessageSquare, Users, Award,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface MentorSession {
  id: string; studentName: string; topic: string; status: string;
  scheduledAt: string; duration: number; rating: number | null;
}

interface Mentor {
  id: string; fullName: string; email: string; expertise: string[];
  designation: string; organization: string; isVerified: boolean;
  isAvailable: boolean; rating: number; totalReviews: number;
  hourlyRate: number; totalSessions: number; sessions: MentorSession[];
  createdAt: string;
}

const mockMentors: Mentor[] = [
  { id: '1', fullName: 'Dr. Rajesh Kumar', email: 'rajesh@tech.com', expertise: ['System Design', 'Cloud Architecture', 'Microservices'], designation: 'Principal Architect', organization: 'AWS India', isVerified: true, isAvailable: true, rating: 4.8, totalReviews: 45, hourlyRate: 2000, totalSessions: 32, sessions: [
    { id: 's1', studentName: 'Aarav Sharma', topic: 'System Design Review', status: 'Completed', scheduledAt: '2025-03-05T15:00:00Z', duration: 45, rating: 5 },
    { id: 's2', studentName: 'Priya Patel', topic: 'Cloud Deployment Strategy', status: 'Scheduled', scheduledAt: '2025-03-12T10:00:00Z', duration: 60, rating: null },
  ], createdAt: '2024-06-15T10:00:00Z' },
  { id: '2', fullName: 'Meera Iyer', email: 'meera@design.co', expertise: ['UX Research', 'Design Systems', 'Accessibility'], designation: 'Design Lead', organization: 'Figma', isVerified: true, isAvailable: true, rating: 4.9, totalReviews: 38, hourlyRate: 1500, totalSessions: 25, sessions: [
    { id: 's3', studentName: 'Sneha Gupta', topic: 'Portfolio Review', status: 'Completed', scheduledAt: '2025-03-04T11:00:00Z', duration: 30, rating: 5 },
  ], createdAt: '2024-07-20T10:00:00Z' },
  { id: '3', fullName: 'Arjun Reddy', email: 'arjun@data.io', expertise: ['Machine Learning', 'Data Engineering', 'Python'], designation: 'Senior ML Engineer', organization: 'Google India', isVerified: false, isAvailable: true, rating: 4.5, totalReviews: 20, hourlyRate: 2500, totalSessions: 15, sessions: [], createdAt: '2024-08-10T10:00:00Z' },
  { id: '4', fullName: 'Kavitha Nair', email: 'kavitha@product.in', expertise: ['Product Management', 'Agile', 'Startups'], designation: 'VP Product', organization: 'Razorpay', isVerified: true, isAvailable: false, rating: 4.7, totalReviews: 30, hourlyRate: 3000, totalSessions: 28, sessions: [], createdAt: '2024-09-05T10:00:00Z' },
  { id: '5', fullName: 'Suresh Menon', email: 'suresh@cyber.tech', expertise: ['Cybersecurity', 'Ethical Hacking', 'Network Security'], designation: 'CISO', organization: 'Infosys', isVerified: false, isAvailable: true, rating: 4.3, totalReviews: 12, hourlyRate: 1800, totalSessions: 10, sessions: [], createdAt: '2024-10-01T10:00:00Z' },
];

export default function AdminMentorsPage() {
  const [mentors, setMentors] = React.useState<Mentor[]>(mockMentors);
  const [search, setSearch] = React.useState('');
  const [selectedMentor, setSelectedMentor] = React.useState<Mentor | null>(null);

  const filtered = mentors.filter(m =>
    m.fullName.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.expertise.some(e => e.toLowerCase().includes(search.toLowerCase()))
  );

  const handleVerify = (id: string) => {
    setMentors(prev => prev.map(m => m.id === id ? { ...m, isVerified: true } : m));
    toast.success('Mentor verified successfully');
  };

  const handleToggleAvailable = (id: string) => {
    setMentors(prev => prev.map(m => m.id === id ? { ...m, isAvailable: !m.isAvailable } : m));
    const mentor = mentors.find(m => m.id === id);
    toast.success(`${mentor?.fullName} is now ${mentor?.isAvailable ? 'unavailable' : 'available'}`);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-electric" /> Mentor Management
        </h2>
        <p className="text-sm text-text-secondary mt-1">Verify mentors and review mentorship sessions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Mentors', value: mentors.length, color: 'text-electric' },
          { label: 'Verified', value: mentors.filter(m => m.isVerified).length, color: 'text-success' },
          { label: 'Pending', value: mentors.filter(m => !m.isVerified).length, color: 'text-warning' },
          { label: 'Total Sessions', value: mentors.reduce((a, m) => a + m.totalSessions, 0), color: 'text-purple' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4 text-center"><p className="text-xs text-text-secondary">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></CardContent></Card>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input placeholder="Search mentors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
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
                  <TableHead>Mentor</TableHead>
                  <TableHead className="hidden md:table-cell">Organization</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="hidden sm:table-cell">Sessions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((mentor, idx) => (
                  <tr key={mentor.id}
                    className="animate-fade-in hover:bg-muted/50 transition-colors border-b"
                    style={{ animationDelay: `${idx * 40}ms`, borderColor: '#E2E8F0' }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="bg-purple/10 text-purple text-xs font-semibold">
                            {mentor.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{mentor.fullName}</p>
                          <p className="text-[10px] text-text-secondary">{mentor.designation}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{mentor.organization}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                        <span className="text-sm font-semibold">{mentor.rating}</span>
                        <span className="text-[10px] text-text-secondary">({mentor.totalReviews})</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{mentor.totalSessions}</TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] border-0 ${mentor.isVerified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {mentor.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell><Switch checked={mentor.isAvailable} onCheckedChange={() => handleToggleAvailable(mentor.id)} /></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedMentor(mentor)}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                          {!mentor.isVerified && <DropdownMenuItem onClick={() => handleVerify(mentor.id)} className="text-success"><CheckCircle className="w-4 h-4 mr-2" /> Verify</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Mentor detail dialog */}
      <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Mentor Details</DialogTitle></DialogHeader>
          {selectedMentor && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-purple/10 text-purple text-lg font-semibold">
                    {selectedMentor.fullName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selectedMentor.fullName}</h3>
                  <p className="text-sm text-text-secondary">{selectedMentor.designation} @ {selectedMentor.organization}</p>
                  <div className="flex gap-1 mt-1">
                    {selectedMentor.isVerified && <Badge className="text-[10px] bg-success/10 text-success border-0">Verified</Badge>}
                    {selectedMentor.isAvailable && <Badge className="text-[10px] bg-electric/10 text-electric border-0">Available</Badge>}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3"><Briefcase className="w-4 h-4 text-text-secondary" /><span className="text-sm">₹{selectedMentor.hourlyRate}/hr</span></div>
                <div className="flex items-center gap-3"><GraduationCap className="w-4 h-4 text-text-secondary" /><span className="text-sm">{selectedMentor.totalSessions} sessions &bull; {selectedMentor.totalReviews} reviews</span></div>
                <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-text-secondary" /><span className="text-sm">Joined {formatDate(selectedMentor.createdAt)}</span></div>
              </div>

              <div>
                <p className="text-xs font-medium text-text-secondary mb-2">Expertise</p>
                <div className="flex flex-wrap gap-1">
                  {selectedMentor.expertise.map(e => <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>)}
                </div>
              </div>

              {/* Sessions */}
              {selectedMentor.sessions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-2 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Recent Sessions</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedMentor.sessions.map(session => (
                      <div key={session.id} className="p-2.5 rounded-lg bg-muted/50 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs">{session.studentName}</span>
                          <Badge className={`text-[9px] border-0 ${session.status === 'Completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{session.status}</Badge>
                        </div>
                        <p className="text-[10px] text-text-secondary">{session.topic} &bull; {session.duration}min</p>
                        {session.rating && <div className="flex items-center gap-0.5 mt-1">{Array.from({ length: session.rating }).map((_, i) => <Star key={i} className="w-2.5 h-2.5 text-warning fill-warning" />)}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter>
                {!selectedMentor.isVerified && (
                  <Button size="sm" onClick={() => { handleVerify(selectedMentor.id); setSelectedMentor(null); }} className="bg-success hover:bg-success/90 text-white">
                    <CheckCircle className="w-4 h-4 mr-1" /> Verify Mentor
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
