'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Clock, DollarSign, Building2 } from 'lucide-react';
import { useAppStore } from '@/store';

interface Internship {
  id: string; title: string; company: string; duration: string; stipend: string; location: string; isRemote: boolean; status: string;
}

export default function InternshipsRoute() {
  const { token } = useAppStore();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/internships', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setInternships(d.internships || []); setLoading(false); }).catch(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-electric/30 border-t-electric rounded-full animate-spin" /></div>;

  return (
    <div className="animate-fade-in space-y-6">
      <div><h1 className="text-2xl font-bold font-heading">My Internships</h1><p className="text-text-secondary text-sm mt-1">Track your internship applications and progress</p></div>
      {internships.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><Briefcase className="w-12 h-12 mx-auto text-text-secondary/30 mb-4" /><h3 className="text-lg font-semibold">No internships yet</h3><p className="text-sm text-text-secondary mt-1">Apply to internships to start your journey</p></CardContent></Card>
      ) : (
        <div className="space-y-4">{internships.map((intern, i) => (
          <div key={intern.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <Card className="hover:shadow-md transition-shadow"><CardContent className="p-5">
              <div className="flex items-start justify-between"><div><h3 className="font-semibold">{intern.title}</h3><p className="text-sm text-text-secondary flex items-center gap-1 mt-1"><Building2 className="w-3.5 h-3.5" />{intern.company}</p></div>
              <Badge variant={intern.status === 'Hired' ? 'default' : 'secondary'}>{intern.status}</Badge></div>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-text-secondary">
                {intern.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{intern.duration}</span>}
                {intern.stipend && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{intern.stipend}</span>}
                {intern.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{intern.location}</span>}
                {intern.isRemote && <Badge variant="outline" className="text-[10px]">Remote</Badge>}
              </div>
            </CardContent></Card>
          </div>
        ))}</div>
      )}
    </div>
  );
}
