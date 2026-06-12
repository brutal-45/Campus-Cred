'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Search, Award, ShieldCheck, ShieldX, RotateCcw, Eye,
  QrCode, Download, AlertTriangle, CheckCircle, XCircle, Calendar, Hash,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface Certificate {
  id: string; certificateId: string; studentName: string; degree: string;
  branch: string; taskTitle: string; level: string; skills: string;
  issuedDate: string; isValid: boolean; hash: string; college: string;
}

const mockCertificates: Certificate[] = [
  { id: '1', certificateId: 'CRED-2024-A1B2C3', studentName: 'Aarav Sharma', degree: 'B.Tech', branch: 'CSE', taskTitle: 'Build a REST API for Todo App', level: 'Expert', skills: 'Node.js,REST,MongoDB', issuedDate: '2025-02-15T10:00:00Z', isValid: true, hash: 'sha256:abc123', college: 'IIT Bombay' },
  { id: '2', certificateId: 'CRED-2024-D4E5F6', studentName: 'Priya Patel', degree: 'B.Des', branch: 'UX Design', taskTitle: 'Design Mobile App UI Kit', level: 'Achiever', skills: 'Figma,UI/UX,Prototyping', issuedDate: '2025-02-20T10:00:00Z', isValid: true, hash: 'sha256:def456', college: 'NID Ahmedabad' },
  { id: '3', certificateId: 'CRED-2024-G7H8I9', studentName: 'Rahul Verma', degree: 'B.Tech', branch: 'Data Science', taskTitle: 'Analyze Sales Dataset', level: 'Expert', skills: 'Python,Pandas,ML', issuedDate: '2025-02-18T10:00:00Z', isValid: true, hash: 'sha256:ghi789', college: 'BITS Pilani' },
  { id: '4', certificateId: 'CRED-2024-J0K1L2', studentName: 'Sneha Gupta', degree: 'B.Tech', branch: 'IT', taskTitle: 'Write Technical Blog Post', level: 'Starter', skills: 'Technical Writing,Research', issuedDate: '2025-02-10T10:00:00Z', isValid: false, hash: 'sha256:jkl012', college: 'DTU Delhi' },
  { id: '5', certificateId: 'CRED-2024-M3N4O5', studentName: 'Vikram Singh', degree: 'MBA', branch: 'Marketing', taskTitle: 'Create Marketing Campaign', level: 'Achiever', skills: 'Digital Marketing,Analytics', issuedDate: '2025-03-01T10:00:00Z', isValid: true, hash: 'sha256:mno345', college: 'IIM Bangalore' },
  { id: '6', certificateId: 'CRED-2024-P6Q7R8', studentName: 'Deepa Nair', degree: 'B.Tech', branch: 'CSE', taskTitle: 'Daily Challenge: Binary Search', level: 'Legend', skills: 'Algorithms,Problem Solving', issuedDate: '2025-03-05T10:00:00Z', isValid: true, hash: 'sha256:pqr678', college: 'NIT Trichy' },
];

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = React.useState<Certificate[]>(mockCertificates);
  const [search, setSearch] = React.useState('');
  const [selectedCert, setSelectedCert] = React.useState<Certificate | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  const filtered = certificates.filter(c =>
    c.certificateId.toLowerCase().includes(search.toLowerCase()) ||
    c.studentName.toLowerCase().includes(search.toLowerCase()) ||
    c.taskTitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleRevoke = (id: string) => {
    setCertificates(prev => prev.map(c => c.id === id ? { ...c, isValid: false } : c));
    toast.success('Certificate revoked');
  };

  const handleRegenerate = async (id: string) => {
    setActionLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      setCertificates(prev => prev.map(c => c.id === id ? { ...c, isValid: true, hash: `sha256:${Date.now().toString(36)}` } : c));
      toast.success('Certificate regenerated');
    } catch { toast.error('Regeneration failed'); }
    finally { setActionLoading(false); }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Legend': return 'bg-gold/10 text-gold border-gold/20';
      case 'Elite': return 'bg-purple/10 text-purple border-purple/20';
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
          <Award className="w-6 h-6 text-electric" /> Certificate Management
        </h2>
        <p className="text-sm text-text-secondary mt-1">Manage, revoke, and regenerate certificates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Certificates', value: certificates.length, color: 'text-electric' },
          { label: 'Valid', value: certificates.filter(c => c.isValid).length, color: 'text-success' },
          { label: 'Revoked', value: certificates.filter(c => !c.isValid).length, color: 'text-danger' },
          { label: 'This Month', value: certificates.filter(c => new Date(c.issuedDate).getMonth() === new Date().getMonth()).length, color: 'text-purple' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4 text-center"><p className="text-xs text-text-secondary">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></CardContent></Card>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input placeholder="Search by cert ID, student, or task..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
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
                  <TableHead>Certificate ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden md:table-cell">Task</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((cert, idx) => (
                  <tr key={cert.id}
                    className="animate-fade-in hover:bg-muted/50 transition-colors border-b"
                    style={{ animationDelay: `${idx * 30}ms`, borderColor: '#E2E8F0' }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-text-secondary" />
                        <span className="text-xs font-mono font-medium">{cert.certificateId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className="bg-electric/10 text-electric text-[10px] font-semibold">
                            {cert.studentName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{cert.studentName}</p>
                          <p className="text-[10px] text-text-secondary">{cert.degree} &bull; {cert.branch}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-text-secondary max-w-[200px] truncate">{cert.taskTitle}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${getLevelColor(cert.level)}`}>{cert.level}</Badge></TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] border-0 ${cert.isValid ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                        {cert.isValid ? <><CheckCircle className="w-3 h-3 mr-0.5" /> Valid</> : <><XCircle className="w-3 h-3 mr-0.5" /> Revoked</>}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedCert(cert)}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                          {cert.isValid && <DropdownMenuItem onClick={() => handleRevoke(cert.id)} className="text-danger"><ShieldX className="w-4 h-4 mr-2" /> Revoke</DropdownMenuItem>}
                          {!cert.isValid && <DropdownMenuItem onClick={() => handleRegenerate(cert.id)}><RotateCcw className="w-4 h-4 mr-2" /> Regenerate</DropdownMenuItem>}
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

      {/* Certificate detail dialog */}
      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Certificate Details</DialogTitle></DialogHeader>
          {selectedCert && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <p className="font-mono text-sm font-semibold">{selectedCert.certificateId}</p>
                  <Badge variant="outline" className={`text-xs mt-1 ${getLevelColor(selectedCert.level)}`}>{selectedCert.level}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><Award className="w-4 h-4 text-text-secondary" /><span className="text-sm">{selectedCert.studentName}</span></div>
                <div className="flex items-center gap-3"><Hash className="w-4 h-4 text-text-secondary" /><span className="text-xs font-mono text-text-secondary break-all">{selectedCert.hash}</span></div>
                <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-text-secondary" /><span className="text-sm">Issued {formatDate(selectedCert.issuedDate)}</span></div>
                <div className="flex flex-wrap gap-1">
                  {selectedCert.skills.split(',').map(skill => (
                    <Badge key={skill} variant="outline" className="text-[10px]">{skill.trim()}</Badge>
                  ))}
                </div>
              </div>
              <DialogFooter className="flex gap-2 sm:gap-2">
                {selectedCert.isValid && (
                  <Button size="sm" variant="outline" onClick={() => { handleRevoke(selectedCert.id); setSelectedCert(null); }} className="text-danger border-danger/20 hover:bg-danger/10">
                    <ShieldX className="w-4 h-4 mr-1" /> Revoke
                  </Button>
                )}
                {!selectedCert.isValid && (
                  <Button size="sm" onClick={() => { handleRegenerate(selectedCert.id); setSelectedCert(null); }} disabled={actionLoading} className="bg-success hover:bg-success/90 text-white">
                    <RotateCcw className="w-4 h-4 mr-1" /> Regenerate
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
