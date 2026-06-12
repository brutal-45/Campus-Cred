'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Search, ShieldAlert, AlertTriangle, CheckCircle, Eye, Clock,
  Shield, UserX, Fingerprint, Globe, AlertOctagon, Filter,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface FraudAlert {
  id: string; type: string; severity: string; description: string;
  userId: string | null; userName: string; ipAddress: string;
  metadata: Record<string, unknown>; resolved: boolean;
  resolvedBy: string | null; createdAt: string;
}

const mockFraudAlerts: FraudAlert[] = [
  { id: '1', type: 'suspicious_login', severity: 'high', description: 'Login from 5 different countries within 1 hour', userId: 'u1', userName: 'Aarav Sharma', ipAddress: '192.168.1.1', metadata: { countries: ['India', 'Nigeria', 'Russia', 'Brazil', 'China'] }, resolved: false, resolvedBy: null, createdAt: '2025-03-08T14:30:00Z' },
  { id: '2', type: 'multiple_accounts', severity: 'critical', description: 'Same device fingerprint registered 8 accounts', userId: null, userName: 'Multiple Users', ipAddress: '10.0.0.55', metadata: { fingerprint: 'fp_abc123', accountCount: 8 }, resolved: false, resolvedBy: null, createdAt: '2025-03-08T10:15:00Z' },
  { id: '3', type: 'plagiarism', severity: 'medium', description: 'Submission matches 94% with existing GitHub repository', userId: 'u3', userName: 'Rahul Verma', ipAddress: '172.16.0.1', metadata: { matchScore: 94, source: 'github.com/example/project' }, resolved: false, resolvedBy: null, createdAt: '2025-03-07T16:45:00Z' },
  { id: '4', type: 'abuse', severity: 'low', description: 'Spam messages sent to 15 mentors within 30 minutes', userId: 'u4', userName: 'Sneha Gupta', ipAddress: '192.168.2.10', metadata: { messageCount: 15, timeWindow: '30min' }, resolved: true, resolvedBy: 'admin', createdAt: '2025-03-06T09:00:00Z' },
  { id: '5', type: 'certificate_tampering', severity: 'critical', description: 'Certificate hash verification failed - possible tampering detected', userId: 'u5', userName: 'Vikram Singh', ipAddress: '10.10.10.1', metadata: { certificateId: 'CRED-2024-XYZ', expectedHash: 'sha256:abc', actualHash: 'sha256:def' }, resolved: false, resolvedBy: null, createdAt: '2025-03-08T08:00:00Z' },
  { id: '6', type: 'spam_submission', severity: 'medium', description: '20 identical submissions submitted in 5 minutes', userId: 'u6', userName: 'Deepa Nair', ipAddress: '192.168.3.25', metadata: { submissionCount: 20, timeWindow: '5min' }, resolved: false, resolvedBy: null, createdAt: '2025-03-07T12:30:00Z' },
  { id: '7', type: 'fake_profile', severity: 'high', description: 'Profile using stolen identity and stock photos', userId: 'u7', userName: 'Amit Kumar', ipAddress: '10.20.30.1', metadata: { reason: 'Stock photo detected in profile', reverseImageMatch: true }, resolved: false, resolvedBy: null, createdAt: '2025-03-08T06:15:00Z' },
];

export default function AdminFraudPage() {
  const { token } = useAppStore();
  const [alerts, setAlerts] = React.useState<FraudAlert[]>(mockFraudAlerts);
  const [search, setSearch] = React.useState('');
  const [filterSeverity, setFilterSeverity] = React.useState('all');
  const [filterType, setFilterType] = React.useState('all');
  const [selectedAlert, setSelectedAlert] = React.useState<FraudAlert | null>(null);
  const [resolving, setResolving] = React.useState(false);

  const filtered = alerts.filter(a => {
    const matchSearch = a.description.toLowerCase().includes(search.toLowerCase()) || a.userName.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = filterSeverity === 'all' || a.severity === filterSeverity;
    const matchType = filterType === 'all' || a.type === filterType;
    return matchSearch && matchSeverity && matchType;
  });

  const handleResolve = async (id: string) => {
    setResolving(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch('/api/fraud', { method: 'PUT', headers, body: JSON.stringify({ id }) });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true, resolvedBy: 'admin' } : a));
      toast.success('Fraud alert resolved');
      setSelectedAlert(null);
    } catch { toast.error('Failed to resolve alert'); }
    finally { setResolving(false); }
  };

  const getSeverityColor = (s: string) => {
    switch (s) { case 'critical': return 'bg-danger/10 text-danger border-danger/20'; case 'high': return 'bg-warning/10 text-warning border-warning/20'; case 'medium': return 'bg-electric/10 text-electric border-electric/20'; case 'low': return 'bg-muted text-text-secondary border-border'; default: return 'bg-muted text-text-secondary'; }
  };

  const getSeverityIcon = (s: string) => {
    switch (s) { case 'critical': return <AlertOctagon className="w-4 h-4 text-danger" />; case 'high': return <AlertTriangle className="w-4 h-4 text-warning" />; default: return <Shield className="w-4 h-4 text-text-secondary" />; }
  };

  const getTypeIcon = (t: string) => {
    switch (t) { case 'suspicious_login': return <Fingerprint className="w-4 h-4" />; case 'multiple_accounts': return <UserX className="w-4 h-4" />; case 'plagiarism': return <ShieldAlert className="w-4 h-4" />; case 'abuse': return <AlertTriangle className="w-4 h-4" />; case 'certificate_tampering': return <Shield className="w-4 h-4" />; case 'spam_submission': return <AlertOctagon className="w-4 h-4" />; case 'fake_profile': return <UserX className="w-4 h-4" />; default: return <ShieldAlert className="w-4 h-4" />; }
  };

  const formatDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const criticalCount = alerts.filter(a => !a.resolved && a.severity === 'critical').length;
  const highCount = alerts.filter(a => !a.resolved && a.severity === 'high').length;
  const unresolvedCount = alerts.filter(a => !a.resolved).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-danger" /> Fraud Detection
        </h2>
        <p className="text-sm text-text-secondary mt-1">Monitor and resolve security alerts</p>
      </div>

      {/* Alert Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Unresolved', value: unresolvedCount, color: 'text-danger', bg: 'bg-danger/10', icon: AlertTriangle },
          { label: 'Critical', value: criticalCount, color: 'text-danger', bg: 'bg-danger/10', icon: AlertOctagon },
          { label: 'High Severity', value: highCount, color: 'text-warning', bg: 'bg-warning/10', icon: ShieldAlert },
          { label: 'Resolved Today', value: alerts.filter(a => a.resolved).length, color: 'text-success', bg: 'bg-success/10', icon: CheckCircle },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-text-secondary">{s.label}</p>
                  <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input placeholder="Search alerts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-4 h-4 text-text-secondary" />
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-[130px]"><SelectValue placeholder="Severity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="suspicious_login">Suspicious Login</SelectItem>
                  <SelectItem value="multiple_accounts">Multiple Accounts</SelectItem>
                  <SelectItem value="plagiarism">Plagiarism</SelectItem>
                  <SelectItem value="abuse">Abuse</SelectItem>
                  <SelectItem value="certificate_tampering">Cert Tampering</SelectItem>
                  <SelectItem value="spam_submission">Spam</SelectItem>
                  <SelectItem value="fake_profile">Fake Profile</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden md:table-cell">User</TableHead>
                  <TableHead className="hidden lg:table-cell">IP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((alert, idx) => (
                  <tr key={alert.id}
                    className={`animate-fade-in hover:bg-muted/50 transition-colors border-b ${!alert.resolved && alert.severity === 'critical' ? 'bg-danger/5' : ''}`}
                    style={{ animationDelay: `${idx * 30}ms`, borderColor: '#E2E8F0' }}
                  >
                    <TableCell>{getSeverityIcon(alert.severity)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(alert.type)}
                        <span className="text-xs font-medium">{alert.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <p className="text-xs truncate">{alert.description}</p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-text-secondary">{alert.userName}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs font-mono text-text-secondary">{alert.ipAddress}</TableCell>
                    <TableCell>
                      {alert.resolved ? (
                        <Badge className="text-[10px] border-0 bg-success/10 text-success"><CheckCircle className="w-3 h-3 mr-0.5" /> Resolved</Badge>
                      ) : (
                        <Badge variant="outline" className={`text-[10px] ${getSeverityColor(alert.severity)}`}>{alert.severity}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedAlert(alert)}><Eye className="w-4 h-4" /></Button>
                        {!alert.resolved && (
                          <Button variant="ghost" size="sm" onClick={() => handleResolve(alert.id)} disabled={resolving} className="text-success hover:bg-success/10">
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Alert detail dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Fraud Alert Details</DialogTitle></DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedAlert.resolved ? 'bg-success/10' : 'bg-danger/10'}`}>
                  {selectedAlert.resolved ? <CheckCircle className="w-6 h-6 text-success" /> : getSeverityIcon(selectedAlert.severity)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{selectedAlert.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  <Badge variant="outline" className={`text-[10px] ${getSeverityColor(selectedAlert.severity)}`}>{selectedAlert.severity}</Badge>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm">{selectedAlert.description}</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><UserX className="w-4 h-4 text-text-secondary" /><span className="text-sm">{selectedAlert.userName}</span></div>
                <div className="flex items-center gap-3"><Globe className="w-4 h-4 text-text-secondary" /><span className="text-sm font-mono">{selectedAlert.ipAddress}</span></div>
                <div className="flex items-center gap-3"><Clock className="w-4 h-4 text-text-secondary" /><span className="text-sm">{formatDate(selectedAlert.createdAt)}</span></div>
              </div>
              {selectedAlert.metadata && Object.keys(selectedAlert.metadata).length > 0 && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-2">Metadata</p>
                  <div className="p-2 rounded bg-muted/50 text-xs font-mono space-y-1">
                    {Object.entries(selectedAlert.metadata).map(([key, value]) => (
                      <div key={key}><span className="text-text-secondary">{key}:</span> {JSON.stringify(value)}</div>
                    ))}
                  </div>
                </div>
              )}
              {!selectedAlert.resolved && (
                <DialogFooter>
                  <Button onClick={() => handleResolve(selectedAlert.id)} disabled={resolving} className="bg-success hover:bg-success/90 text-white">
                    <CheckCircle className="w-4 h-4 mr-1" /> Resolve Alert
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
