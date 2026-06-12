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
  Search, GraduationCap, MapPin, Globe, Award, Users, Star,
  ToggleLeft, ExternalLink, Building2, Hash,
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';

interface College {
  id: string; collegeName: string; address: string; city: string; state: string;
  naacRating: string; nirfRank: number | null; isPartner: boolean; isFeatured: boolean;
  website: string; totalStudents: number; createdAt: string;
}

const mockColleges: College[] = [
  { id: '1', collegeName: 'IIT Bombay', address: 'Powai, Mumbai', city: 'Mumbai', state: 'Maharashtra', naacRating: 'A++', nirfRank: 3, isPartner: true, isFeatured: true, website: 'https://iitb.ac.in', totalStudents: 8500, createdAt: '2024-01-10T10:00:00Z' },
  { id: '2', collegeName: 'NIT Trichy', address: 'Tiruchirappalli', city: 'Trichy', state: 'Tamil Nadu', naacRating: 'A++', nirfRank: 9, isPartner: true, isFeatured: false, website: 'https://nitt.edu', totalStudents: 6200, createdAt: '2024-02-05T10:00:00Z' },
  { id: '3', collegeName: 'BITS Pilani', address: 'Pilani Campus', city: 'Pilani', state: 'Rajasthan', naacRating: 'A+', nirfRank: 14, isPartner: true, isFeatured: true, website: 'https://bits-pilani.ac.in', totalStudents: 7200, createdAt: '2024-03-15T10:00:00Z' },
  { id: '4', collegeName: 'VIT Vellore', address: 'Vellore Campus', city: 'Vellore', state: 'Tamil Nadu', naacRating: 'A++', nirfRank: 11, isPartner: false, isFeatured: false, website: 'https://vit.ac.in', totalStudents: 12000, createdAt: '2024-04-20T10:00:00Z' },
  { id: '5', collegeName: 'Jadavpur University', address: 'Kolkata', city: 'Kolkata', state: 'West Bengal', naacRating: 'A', nirfRank: 18, isPartner: false, isFeatured: false, website: 'https://jaduniv.edu.in', totalStudents: 5500, createdAt: '2024-05-08T10:00:00Z' },
  { id: '6', collegeName: 'DTU Delhi', address: 'Delhi', city: 'Delhi', state: 'Delhi', naacRating: 'A+', nirfRank: 22, isPartner: true, isFeatured: false, website: 'https://dtu.ac.in', totalStudents: 9000, createdAt: '2024-06-01T10:00:00Z' },
];

export default function AdminCollegesPage() {
  const [colleges, setColleges] = React.useState<College[]>(mockColleges);
  const [search, setSearch] = React.useState('');
  const [selectedCollege, setSelectedCollege] = React.useState<College | null>(null);

  const filtered = colleges.filter(c =>
    c.collegeName.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase()) ||
    c.state.toLowerCase().includes(search.toLowerCase())
  );

  const togglePartner = (id: string) => {
    setColleges(prev => prev.map(c => c.id === id ? { ...c, isPartner: !c.isPartner } : c));
    const college = colleges.find(c => c.id === id);
    toast.success(`${college?.collegeName} partnership ${college?.isPartner ? 'revoked' : 'activated'}`);
  };

  const toggleFeatured = (id: string) => {
    setColleges(prev => prev.map(c => c.id === id ? { ...c, isFeatured: !c.isFeatured } : c));
    const college = colleges.find(c => c.id === id);
    toast.success(`${college?.collegeName} ${college?.isFeatured ? 'unfeatured' : 'featured'}`);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-electric" /> College Management
        </h2>
        <p className="text-sm text-text-secondary mt-1">Manage college partnerships and partnerships status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Colleges', value: colleges.length, color: 'text-electric' },
          { label: 'Partners', value: colleges.filter(c => c.isPartner).length, color: 'text-success' },
          { label: 'Featured', value: colleges.filter(c => c.isFeatured).length, color: 'text-purple' },
          { label: 'Total Students', value: colleges.reduce((a, c) => a + c.totalStudents, 0).toLocaleString(), color: 'text-warning' },
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
            <Input placeholder="Search colleges..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
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
                  <TableHead>College</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden sm:table-cell">NAAC</TableHead>
                  <TableHead className="hidden lg:table-cell">NIRF</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((college, idx) => (
                  <tr key={college.id}
                    className="animate-fade-in hover:bg-muted/50 transition-colors border-b"
                    style={{ animationDelay: `${idx * 40}ms`, borderColor: '#E2E8F0' }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="bg-purple/10 text-purple text-xs font-semibold">
                            {college.collegeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{college.collegeName}</p>
                          <p className="text-[10px] text-text-secondary">{college.totalStudents.toLocaleString()} students</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-text-secondary">
                      <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{college.city}, {college.state}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-[10px]">{college.naacRating}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm font-semibold">
                      {college.nirfRank ? `#${college.nirfRank}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Switch checked={college.isPartner} onCheckedChange={() => togglePartner(college.id)} />
                    </TableCell>
                    <TableCell>
                      <Switch checked={college.isFeatured} onCheckedChange={() => toggleFeatured(college.id)} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedCollege(college)}><GraduationCap className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePartner(college.id)}><ToggleLeft className="w-4 h-4 mr-2" /> Toggle Partner</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleFeatured(college.id)}><Star className="w-4 h-4 mr-2" /> Toggle Featured</DropdownMenuItem>
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

      {/* College detail dialog */}
      <Dialog open={!!selectedCollege} onOpenChange={() => setSelectedCollege(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>College Details</DialogTitle></DialogHeader>
          {selectedCollege && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-purple/10 text-purple text-lg font-semibold">
                    {selectedCollege.collegeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selectedCollege.collegeName}</h3>
                  <div className="flex gap-1 mt-1">
                    {selectedCollege.isPartner && <Badge className="text-[10px] bg-success/10 text-success border-0">Partner</Badge>}
                    {selectedCollege.isFeatured && <Badge className="text-[10px] bg-purple/10 text-purple border-0">Featured</Badge>}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><MapPin className="w-4 h-4 text-text-secondary" /><span className="text-sm">{selectedCollege.address}</span></div>
                <div className="flex items-center gap-3"><Globe className="w-4 h-4 text-text-secondary" /><span className="text-sm">{selectedCollege.website}</span></div>
                <div className="flex items-center gap-3"><Award className="w-4 h-4 text-text-secondary" /><span className="text-sm">NAAC: {selectedCollege.naacRating}</span></div>
                <div className="flex items-center gap-3"><Hash className="w-4 h-4 text-text-secondary" /><span className="text-sm">NIRF Rank: {selectedCollege.nirfRank || 'Not ranked'}</span></div>
                <div className="flex items-center gap-3"><Users className="w-4 h-4 text-text-secondary" /><span className="text-sm">{selectedCollege.totalStudents.toLocaleString()} students</span></div>
              </div>
              <DialogFooter className="flex gap-2 sm:gap-2">
                <Button size="sm" variant="outline" onClick={() => { togglePartner(selectedCollege.id); setSelectedCollege(null); }}>
                  {selectedCollege.isPartner ? 'Revoke Partnership' : 'Make Partner'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { toggleFeatured(selectedCollege.id); setSelectedCollege(null); }}>
                  {selectedCollege.isFeatured ? 'Unfeature' : 'Feature'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
