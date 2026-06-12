'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Search, Megaphone, CheckCircle, XCircle, Eye, Trophy, Calendar,
  Users, Award, Star, Gift, TrendingUp, Medal,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface AmbassadorActivity {
  id: string; activity: string; description: string; points: number;
  date: string; status: 'rewarded' | 'pending' | 'rejected';
}

interface Ambassador {
  id: string; fullName: string; email: string; college: string;
  level: string; referralCode: string; totalReferrals: number;
  activeReferrals: number; totalPoints: number; isVerified: boolean;
  joinedAt: string; activities: AmbassadorActivity[];
}

const mockAmbassadors: Ambassador[] = [
  { id: '1', fullName: 'Aarav Sharma', email: 'aarav@iitb.ac.in', college: 'IIT Bombay', level: 'gold', referralCode: 'AARAV2024', totalReferrals: 12, activeReferrals: 8, totalPoints: 240, isVerified: true, joinedAt: '2024-06-15T10:00:00Z', activities: [
    { id: 'a1', activity: 'referral', description: 'Referred Priya Patel', points: 20, date: '2025-03-05T10:00:00Z', status: 'rewarded' },
    { id: 'a2', activity: 'event', description: 'Hosted campus drive', points: 50, date: '2025-03-01T10:00:00Z', status: 'pending' },
    { id: 'a3', activity: 'social_post', description: 'LinkedIn post about CampusCred', points: 10, date: '2025-02-28T10:00:00Z', status: 'rewarded' },
  ]},
  { id: '2', fullName: 'Priya Patel', email: 'priya@nitt.edu', college: 'NIT Trichy', level: 'silver', referralCode: 'PRIYA2024', totalReferrals: 7, activeReferrals: 4, totalPoints: 140, isVerified: true, joinedAt: '2024-07-20T10:00:00Z', activities: [
    { id: 'a4', activity: 'referral', description: 'Referred Rahul Verma', points: 20, date: '2025-03-03T10:00:00Z', status: 'rewarded' },
  ]},
  { id: '3', fullName: 'Rahul Verma', email: 'rahul@bits.edu', college: 'BITS Pilani', level: 'bronze', referralCode: 'RAHUL2024', totalReferrals: 3, activeReferrals: 2, totalPoints: 60, isVerified: false, joinedAt: '2024-09-10T10:00:00Z', activities: [
    { id: 'a5', activity: 'social_post', description: 'Instagram story about CampusCred', points: 10, date: '2025-03-02T10:00:00Z', status: 'pending' },
  ]},
  { id: '4', fullName: 'Sneha Gupta', email: 'sneha@dtu.ac.in', college: 'DTU Delhi', level: 'platinum', referralCode: 'SNEHA2024', totalReferrals: 25, activeReferrals: 18, totalPoints: 500, isVerified: true, joinedAt: '2024-04-01T10:00:00Z', activities: [
    { id: 'a6', activity: 'campus_drive', description: 'Organized placement prep event', points: 100, date: '2025-03-06T10:00:00Z', status: 'rewarded' },
    { id: 'a7', activity: 'referral', description: 'Referred 5 students in batch', points: 100, date: '2025-03-04T10:00:00Z', status: 'rewarded' },
  ]},
  { id: '5', fullName: 'Vikram Singh', email: 'vikram@vit.ac.in', college: 'VIT Vellore', level: 'bronze', referralCode: 'VIKRAM2024', totalReferrals: 2, activeReferrals: 1, totalPoints: 40, isVerified: false, joinedAt: '2024-11-05T10:00:00Z', activities: [] },
];

const levelRequirements = [
  { level: 'bronze', label: 'Bronze', minReferrals: 3, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', icon: '🥉' },
  { level: 'silver', label: 'Silver', minReferrals: 5, color: 'bg-gray-400/10 text-gray-400 border-gray-400/20', icon: '🥈' },
  { level: 'gold', label: 'Gold', minReferrals: 10, color: 'bg-gold/10 text-gold border-gold/20', icon: '🥇' },
  { level: 'platinum', label: 'Platinum', minReferrals: 20, color: 'bg-purple/10 text-purple border-purple/20', icon: '💎' },
];

export default function AdminAmbassadorsPage() {
  const { token } = useAppStore();
  const [ambassadors, setAmbassadors] = React.useState<Ambassador[]>(mockAmbassadors);
  const [search, setSearch] = React.useState('');
  const [selectedAmbassador, setSelectedAmbassador] = React.useState<Ambassador | null>(null);

  const filtered = ambassadors.filter(a =>
    a.fullName.toLowerCase().includes(search.toLowerCase()) ||
    a.college.toLowerCase().includes(search.toLowerCase()) ||
    a.referralCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = (id: string) => {
    setAmbassadors(prev => prev.map(a => a.id === id ? { ...a, isVerified: true } : a));
    toast.success('Ambassador approved');
  };

  const handleReject = (id: string) => {
    setAmbassadors(prev => prev.filter(a => a.id !== id));
    toast.success('Ambassador rejected');
  };

  const handleApproveActivity = (ambassadorId: string, activityId: string) => {
    setAmbassadors(prev => prev.map(a => {
      if (a.id !== ambassadorId) return a;
      return { ...a, activities: a.activities.map(act => act.id === activityId ? { ...act, status: 'rewarded' as const } : act) };
    }));
    toast.success('Activity approved and points awarded');
  };

  const handleRejectActivity = (ambassadorId: string, activityId: string) => {
    setAmbassadors(prev => prev.map(a => {
      if (a.id !== ambassadorId) return a;
      return { ...a, activities: a.activities.map(act => act.id === activityId ? { ...act, status: 'rejected' as const } : act) };
    }));
    toast.success('Activity rejected');
  };

  const getLevelInfo = (level: string) => levelRequirements.find(l => l.level === level) || levelRequirements[0];

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const totalReferrals = ambassadors.reduce((a, b) => a + b.totalReferrals, 0);
  const totalPoints = ambassadors.reduce((a, b) => a + b.totalPoints, 0);
  const pendingApproval = ambassadors.filter(a => !a.isVerified).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-electric" /> Ambassador Management
        </h2>
        <p className="text-sm text-text-secondary mt-1">Manage ambassadors, activities, and rewards</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Ambassadors', value: ambassadors.length, color: 'text-electric', bg: 'bg-electric/10', icon: Megaphone },
          { label: 'Total Referrals', value: totalReferrals, color: 'text-success', bg: 'bg-success/10', icon: Users },
          { label: 'Points Awarded', value: totalPoints.toLocaleString(), color: 'text-gold', bg: 'bg-gold/10', icon: Trophy },
          { label: 'Pending Approval', value: pendingApproval, color: 'text-warning', bg: 'bg-warning/10', icon: Star },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-text-secondary">{s.label}</p>
                  <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}><Icon className={`w-3.5 h-3.5 ${s.color}`} /></div>
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Level Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Medal className="w-4 h-4 text-gold" /> Ambassador Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {levelRequirements.map(lvl => {
              const count = ambassadors.filter(a => a.level === lvl.level).length;
              return (
                <div key={lvl.level} className="text-center p-3 rounded-lg bg-muted/50">
                  <span className="text-2xl">{lvl.icon}</span>
                  <p className="text-sm font-semibold mt-1">{lvl.label}</p>
                  <p className="text-xs text-text-secondary">{lvl.minReferrals}+ referrals</p>
                  <Badge className={`text-[10px] mt-1 ${lvl.color}`}>{count} ambassadors</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input placeholder="Search ambassadors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
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
                  <TableHead>Ambassador</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((amb, idx) => {
                  const lvl = getLevelInfo(amb.level);
                  return (
                    <tr key={amb.id}
                      className="animate-fade-in hover:bg-muted/50 transition-colors border-b"
                      style={{ animationDelay: `${idx * 40}ms`, borderColor: '#E2E8F0' }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback className="bg-electric/10 text-electric text-xs font-semibold">
                              {amb.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{amb.fullName}</p>
                            <p className="text-[10px] text-text-secondary">{amb.college}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${lvl.color}`}>
                          {lvl.icon} {lvl.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="text-sm font-semibold">{amb.totalReferrals}</span>
                          <span className="text-[10px] text-text-secondary"> ({amb.activeReferrals} active)</span>
                        </div>
                      </TableCell>
                      <TableCell><span className="text-sm font-semibold">{amb.totalPoints}</span></TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] border-0 ${amb.isVerified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                          {amb.isVerified ? 'Approved' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedAmbassador(amb)}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                            {!amb.isVerified && <DropdownMenuItem onClick={() => handleApprove(amb.id)} className="text-success"><CheckCircle className="w-4 h-4 mr-2" /> Approve</DropdownMenuItem>}
                            {!amb.isVerified && <DropdownMenuItem onClick={() => handleReject(amb.id)} className="text-danger"><XCircle className="w-4 h-4 mr-2" /> Reject</DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Ambassador detail dialog */}
      <Dialog open={!!selectedAmbassador} onOpenChange={() => setSelectedAmbassador(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Ambassador Details</DialogTitle></DialogHeader>
          {selectedAmbassador && (() => {
            const lvl = getLevelInfo(selectedAmbassador.level);
            return (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="bg-electric/10 text-electric text-lg font-semibold">
                      {selectedAmbassador.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold">{selectedAmbassador.fullName}</h3>
                    <p className="text-sm text-text-secondary">{selectedAmbassador.college}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className={`text-[10px] ${lvl.color}`}>{lvl.icon} {lvl.label}</Badge>
                      {selectedAmbassador.isVerified && <Badge className="text-[10px] bg-success/10 text-success border-0">Verified</Badge>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{selectedAmbassador.totalReferrals}</p>
                    <p className="text-[10px] text-text-secondary">Referrals</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{selectedAmbassador.totalPoints}</p>
                    <p className="text-[10px] text-text-secondary">Points</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{selectedAmbassador.referralCode}</p>
                    <p className="text-[10px] text-text-secondary">Code</p>
                  </div>
                </div>

                {/* Activities */}
                {selectedAmbassador.activities.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-text-secondary mb-2 flex items-center gap-1">
                      <Gift className="w-3 h-3" /> Recent Activities
                    </p>
                    <div className="space-y-2">
                      {selectedAmbassador.activities.map(act => (
                        <div key={act.id} className="p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{act.description}</p>
                              <p className="text-[10px] text-text-secondary flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {formatDate(act.date)} &bull; +{act.points} pts
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {act.status === 'rewarded' && <Badge className="text-[9px] border-0 bg-success/10 text-success">Rewarded</Badge>}
                              {act.status === 'pending' && (
                                <>
                                  <Badge className="text-[9px] border-0 bg-warning/10 text-warning">Pending</Badge>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-success hover:bg-success/10" onClick={() => handleApproveActivity(selectedAmbassador.id, act.id)}>
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-danger hover:bg-danger/10" onClick={() => handleRejectActivity(selectedAmbassador.id, act.id)}>
                                    <XCircle className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              {act.status === 'rejected' && <Badge className="text-[9px] border-0 bg-danger/10 text-danger">Rejected</Badge>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!selectedAmbassador.isVerified && (
                  <DialogFooter className="flex gap-2 sm:gap-2">
                    <Button variant="outline" onClick={() => { handleReject(selectedAmbassador.id); setSelectedAmbassador(null); }} className="text-danger border-danger/20 hover:bg-danger/10">
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button onClick={() => { handleApprove(selectedAmbassador.id); setSelectedAmbassador(null); }} className="bg-success hover:bg-success/90 text-white">
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve Ambassador
                    </Button>
                  </DialogFooter>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
