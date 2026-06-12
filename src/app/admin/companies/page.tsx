'use client';

import React from 'react';
import { useAppStore } from '@/store';
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
  Search, Building2, CheckCircle, XCircle, Eye, ExternalLink,
  Globe, MapPin, Users as UsersIcon, Calendar, Briefcase, Verified,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface Company {
  id: string; companyName: string; email: string; industry: string;
  website: string; location: string; employeeCount: string; isVerified: boolean;
  isFeatured: boolean; foundedYear: number; createdAt: string; taskCount: number;
}

const mockCompanies: Company[] = [
  { id: '1', companyName: 'TechVista Solutions', email: 'hr@techvista.com', industry: 'IT Services', website: 'https://techvista.com', location: 'Bangalore, India', employeeCount: '51-200', isVerified: true, isFeatured: true, foundedYear: 2018, createdAt: '2024-01-15T10:00:00Z', taskCount: 12 },
  { id: '2', companyName: 'DesignCraft Studio', email: 'hello@designcraft.io', industry: 'Design', website: 'https://designcraft.io', location: 'Mumbai, India', employeeCount: '11-50', isVerified: true, isFeatured: false, foundedYear: 2020, createdAt: '2024-02-10T10:00:00Z', taskCount: 8 },
  { id: '3', companyName: 'DataMinds Analytics', email: 'careers@dataminds.in', industry: 'Data Science', website: 'https://dataminds.in', location: 'Hyderabad, India', employeeCount: '201-500', isVerified: false, isFeatured: false, foundedYear: 2016, createdAt: '2024-03-05T10:00:00Z', taskCount: 5 },
  { id: '4', companyName: 'GreenLeaf Innovations', email: 'jobs@greenleaf.tech', industry: 'CleanTech', website: 'https://greenleaf.tech', location: 'Pune, India', employeeCount: '11-50', isVerified: false, isFeatured: false, foundedYear: 2021, createdAt: '2024-04-20T10:00:00Z', taskCount: 3 },
  { id: '5', companyName: 'FinEdge Capital', email: 'hr@finedge.com', industry: 'FinTech', website: 'https://finedge.com', location: 'Delhi, India', employeeCount: '51-200', isVerified: true, isFeatured: true, foundedYear: 2017, createdAt: '2024-05-12T10:00:00Z', taskCount: 15 },
  { id: '6', companyName: 'CloudPeak Systems', email: 'talent@cloudpeak.io', industry: 'Cloud Computing', website: 'https://cloudpeak.io', location: 'Chennai, India', employeeCount: '500+', isVerified: true, isFeatured: false, foundedYear: 2014, createdAt: '2024-06-01T10:00:00Z', taskCount: 20 },
];

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = React.useState<Company[]>(mockCompanies);
  const [search, setSearch] = React.useState('');
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(null);
  const [actionLoading, setActionLoading] = React.useState(false);

  const filtered = companies.filter(c =>
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async (companyId: string, action: 'verify' | 'reject' | 'feature') => {
    setActionLoading(true);
    try {
      await new Promise(r => setTimeout(r, 500));
      if (action === 'verify') {
        setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, isVerified: true } : c));
        toast.success('Company verified successfully');
      } else if (action === 'reject') {
        setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, isVerified: false } : c));
        toast.success('Company verification rejected');
      } else if (action === 'feature') {
        setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, isFeatured: !c.isFeatured } : c));
        toast.success('Featured status toggled');
      }
    } catch { toast.error('Action failed'); }
    finally { setActionLoading(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
          <Building2 className="w-6 h-6 text-electric" /> Company Management
        </h2>
        <p className="text-sm text-text-secondary mt-1">Verify, manage, and review company accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Companies', value: companies.length, color: 'text-electric', bg: 'bg-electric/10' },
          { label: 'Verified', value: companies.filter(c => c.isVerified).length, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Pending Review', value: companies.filter(c => !c.isVerified).length, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Featured', value: companies.filter(c => c.isFeatured).length, color: 'text-purple', bg: 'bg-purple/10' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 text-center">
              <p className="text-xs text-text-secondary">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
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
                  <TableHead>Company</TableHead>
                  <TableHead className="hidden md:table-cell">Industry</TableHead>
                  <TableHead className="hidden lg:table-cell">Location</TableHead>
                  <TableHead className="hidden sm:table-cell">Employees</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((company, idx) => (
                  <tr key={company.id}
                    className="animate-fade-in hover:bg-muted/50 transition-colors border-b"
                    style={{ animationDelay: `${idx * 40}ms`, borderColor: '#E2E8F0' }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="bg-electric/10 text-electric text-xs font-semibold">
                            {company.companyName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{company.companyName}</p>
                          <p className="text-[10px] text-text-secondary">{company.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{company.industry}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-text-secondary">{company.location}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{company.employeeCount}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{company.taskCount} tasks</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {company.isVerified && <Badge className="text-[9px] bg-success/10 text-success border-0"><Verified className="w-3 h-3 mr-0.5" />Verified</Badge>}
                        {company.isFeatured && <Badge className="text-[9px] bg-purple/10 text-purple border-0">Featured</Badge>}
                        {!company.isVerified && <Badge className="text-[9px] bg-warning/10 text-warning border-0">Pending</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedCompany(company)}><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                          {!company.isVerified && <DropdownMenuItem onClick={() => handleAction(company.id, 'verify')} className="text-success"><CheckCircle className="w-4 h-4 mr-2" /> Verify</DropdownMenuItem>}
                          {company.isVerified && <DropdownMenuItem onClick={() => handleAction(company.id, 'reject')} className="text-danger"><XCircle className="w-4 h-4 mr-2" /> Reject</DropdownMenuItem>}
                          <DropdownMenuItem onClick={() => handleAction(company.id, 'feature')}><Briefcase className="w-4 h-4 mr-2" /> Toggle Featured</DropdownMenuItem>
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

      {/* Company detail dialog */}
      <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Company Details</DialogTitle></DialogHeader>
          {selectedCompany && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-electric/10 text-electric text-lg font-semibold">
                    {selectedCompany.companyName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selectedCompany.companyName}</h3>
                  <div className="flex gap-1 mt-1">
                    {selectedCompany.isVerified && <Badge className="text-[10px] bg-success/10 text-success border-0">Verified</Badge>}
                    {selectedCompany.isFeatured && <Badge className="text-[10px] bg-purple/10 text-purple border-0">Featured</Badge>}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><Globe className="w-4 h-4 text-text-secondary" /><span className="text-sm">{selectedCompany.website}</span></div>
                <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-text-secondary" /><span className="text-sm">{selectedCompany.location}</span></div>
                <div className="flex items-center gap-3"><Briefcase className="w-4 h-4 text-text-secondary" /><span className="text-sm">{selectedCompany.industry}</span></div>
                <div className="flex items-center gap-3"><UsersIcon className="w-4 h-4 text-text-secondary" /><span className="text-sm">{selectedCompany.employeeCount} employees</span></div>
                <div className="flex items-center gap-3"><Calendar className="w-4 h-4 text-text-secondary" /><span className="text-sm">Founded {selectedCompany.foundedYear} &bull; Joined {formatDate(selectedCompany.createdAt)}</span></div>
              </div>
              <DialogFooter className="flex gap-2 sm:gap-2">
                {!selectedCompany.isVerified && (
                  <Button size="sm" onClick={() => { handleAction(selectedCompany.id, 'verify'); }} disabled={actionLoading} className="bg-success hover:bg-success/90 text-white">
                    <CheckCircle className="w-4 h-4 mr-1" /> Verify
                  </Button>
                )}
                {selectedCompany.isVerified && (
                  <Button size="sm" variant="outline" onClick={() => handleAction(selectedCompany.id, 'reject')} disabled={actionLoading} className="text-danger border-danger/20 hover:bg-danger/10">
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => handleAction(selectedCompany.id, 'feature')} disabled={actionLoading}>
                  <Briefcase className="w-4 h-4 mr-1" /> {selectedCompany.isFeatured ? 'Unfeature' : 'Feature'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
