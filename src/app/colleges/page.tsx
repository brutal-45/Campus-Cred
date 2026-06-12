'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
 Search,
 Landmark,
 MapPin,
 Star,
 Award,
 GraduationCap,
 Users,
 ExternalLink,
 CheckCircle2,
 ChevronLeft,
 ChevronRight,
 Sparkles,
 X,
 SlidersHorizontal,
 ArrowRight,
 Globe,
 Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { INDIAN_COLLEGES } from '@/data/indianColleges';

const STATES = [...new Set(INDIAN_COLLEGES.map(c => c.state))].sort();

const MOCK_COLLEGES = [
 { id: '1', collegeName: 'IIT Bombay', slug: 'iit-bombay', state: 'Maharashtra', city: 'Mumbai', naacRating: 'A++', nirfRank: 3, isPartner: true, isFeatured: true, website: 'https://iitb.ac.in', totalStudents: 10000 },
 { id: '2', collegeName: 'IIT Delhi', slug: 'iit-delhi', state: 'Delhi', city: 'New Delhi', naacRating: 'A++', nirfRank: 2, isPartner: true, isFeatured: true, website: 'https://iitd.ac.in', totalStudents: 9000 },
 { id: '3', collegeName: 'IIT Madras', slug: 'iit-madras', state: 'Tamil Nadu', city: 'Chennai', naacRating: 'A++', nirfRank: 1, isPartner: true, isFeatured: true, website: 'https://iitm.ac.in', totalStudents: 9500 },
 { id: '4', collegeName: 'IIT Kanpur', slug: 'iit-kanpur', state: 'Uttar Pradesh', city: 'Kanpur', naacRating: 'A++', nirfRank: 4, isPartner: true, isFeatured: true, website: 'https://iitk.ac.in', totalStudents: 8000 },
 { id: '5', collegeName: 'IIT Kharagpur', slug: 'iit-kharagpur', state: 'West Bengal', city: 'Kharagpur', naacRating: 'A++', nirfRank: 5, isPartner: true, isFeatured: true, website: 'https://iitkgp.ac.in', totalStudents: 12000 },
 { id: '6', collegeName: 'NIT Trichy', slug: 'nit-trichy', state: 'Tamil Nadu', city: 'Tiruchirappalli', naacRating: 'A++', nirfRank: 9, isPartner: true, isFeatured: false, website: 'https://nitt.edu', totalStudents: 7000 },
 { id: '7', collegeName: 'NIT Warangal', slug: 'nit-warangal', state: 'Telangana', city: 'Warangal', naacRating: 'A++', nirfRank: 10, isPartner: true, isFeatured: false, website: 'https://nitw.ac.in', totalStudents: 6500 },
 { id: '8', collegeName: 'BITS Pilani', slug: 'bits-pilani', state: 'Rajasthan', city: 'Pilani', naacRating: 'A++', nirfRank: 17, isPartner: true, isFeatured: true, website: 'https://bits-pilani.ac.in', totalStudents: 11000 },
 { id: '9', collegeName: 'VIT Vellore', slug: 'vit-vellore', state: 'Tamil Nadu', city: 'Vellore', naacRating: 'A++', nirfRank: 11, isPartner: true, isFeatured: false, website: 'https://vit.ac.in', totalStudents: 25000 },
 { id: '10', collegeName: 'DTU Delhi', slug: 'dtu-delhi', state: 'Delhi', city: 'New Delhi', naacRating: 'A+', nirfRank: 29, isPartner: false, isFeatured: false, website: 'https://dtu.ac.in', totalStudents: 15000 },
 { id: '11', collegeName: 'IIIT Hyderabad', slug: 'iiit-hyderabad', state: 'Telangana', city: 'Hyderabad', naacRating: 'A+', nirfRank: 43, isPartner: true, isFeatured: false, website: 'https://iiit.ac.in', totalStudents: 5000 },
 { id: '12', collegeName: 'Jadavpur University', slug: 'jadavpur-university', state: 'West Bengal', city: 'Kolkata', naacRating: 'A+', nirfRank: 12, isPartner: false, isFeatured: false, website: 'https://jaduniv.edu.in', totalStudents: 13000 },
];

const ITEMS_PER_PAGE = 6;

export default function CollegesPage() {
 const [search, setSearch] = useState('');
 const [state, setState] = useState<string>('all');
 const [page, setPage] = useState(1);
 const [colleges, setColleges] = useState(MOCK_COLLEGES);
 const [showFilters, setShowFilters] = useState(false);

 useEffect(() => {
 fetch('/api/colleges')
 .then(res => res.json())
 .then(data => {
 if (data.colleges && data.colleges.length > 0) {
 setColleges(data.colleges);
 }
 })
 .catch(() => {});
 }, []);

 const featuredColleges = colleges.filter(c => c.isFeatured);

 const filteredColleges = useMemo(() => {
 return colleges.filter((college) => {
 const matchSearch = !search ||
 college.collegeName.toLowerCase().includes(search.toLowerCase()) ||
 college.city?.toLowerCase().includes(search.toLowerCase());
 const matchState = state === 'all' || college.state === state;
 return matchSearch && matchState;
 });
 }, [colleges, search, state]);

 const totalPages = Math.ceil(filteredColleges.length / ITEMS_PER_PAGE);
 const paginated = filteredColleges.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

 const resetFilters = () => { setSearch(''); setState('all'); setPage(1); };
 const activeCount = [state !== 'all', !!search].filter(Boolean).length;

 return (
 <div className="min-h-screen flex flex-col bg-background">
 <Navbar />
 <main className="flex-1 pt-16">
 {/* Hero */}
 <section className="relative overflow-hidden py-16 md:py-24">
 <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy" />
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500 rounded-full blur-[120px]" />
 <div className="absolute bottom-10 right-10 w-72 h-72 bg-electric rounded-full blur-[120px]" />
 </div>
 <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <div className="flex justify-center mb-4">
 <CampusCredLogo size={44} variant="white" />
 </div>
 <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
 College <span className="text-electric-light">Partners</span>
 </h1>
 <p className="text-white/60 max-w-2xl mx-auto mb-8">
 200+ colleges across India trust CampusCred to give their students real-world experience and verified credentials.
 </p>
 <div className="max-w-xl mx-auto relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
 <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search colleges by name or city..." className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl backdrop-blur-sm" />
 </div>
 </div>
 </section>

 {/* Featured Colleges */}
 {!search && state === 'all' && featuredColleges.length > 0 && (
 <section className="py-12 bg-muted/30">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="flex items-center gap-2 mb-6">
 <Star className="h-5 w-5 text-gold" />
 <h2 className="text-xl font-heading font-bold">Featured Partner Colleges</h2>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
 {featuredColleges.map((college, i) => (
 <div key={college.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
 <Card className="animate-fade-in p-4 text-center hover:shadow-lg transition-all hover:border-gold/30 cursor-pointer group">
 <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
 <Landmark className="h-7 w-7 text-white" />
 </div>
 <h4 className="text-xs font-semibold truncate">{college.collegeName}</h4>
 <p className="text-[10px] text-text-secondary">{college.city}, {college.state}</p>
 {college.nirfRank && (
 <Badge variant="outline" className="mt-1.5 text-[9px]">NIRF #{college.nirfRank}</Badge>
 )}
 </Card>
 </div>
 ))}
 </div>
 </div>
 </section>
 )}

 {/* All Colleges */}
 <section className="py-12">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="flex flex-wrap items-center gap-3 mb-6">
 <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
 <SlidersHorizontal className="h-4 w-4" /> Filters
 {activeCount > 0 && <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-navy text-white border-0">{activeCount}</Badge>}
 </Button>
 <div className="flex flex-wrap gap-2">
 <Button variant={state === 'all' ? 'default' : 'outline'} size="sm" onClick={() => { setState('all'); setPage(1); }} className={state === 'all' ? 'bg-navy text-white border-0' : ''}>All States</Button>
 {STATES.slice(0, 5).map((s) => (
 <Button key={s} variant={state === s ? 'default' : 'outline'} size="sm" onClick={() => { setState(s); setPage(1); }} className={state === s ? 'bg-navy text-white border-0' : ''}>{s}</Button>
 ))}
 </div>
 {activeCount > 0 && <Button variant="ghost" size="sm" onClick={resetFilters} className="text-text-secondary gap-1 ml-auto"><X className="h-3 w-3" /> Clear</Button>}
 </div>

 <>
 {showFilters && (
 <div className="mb-8 overflow-hidden">
 <Card className="p-6">
 <div className="space-y-2">
 <label className="text-xs font-medium text-text-secondary">State</label>
 <Select value={state} onValueChange={(v) => { setState(v); setPage(1); }}>
 <SelectTrigger><SelectValue placeholder="All States" /></SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All States</SelectItem>
 {STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 </Card>
 </div>
 )}
 </>

 <p className="text-sm text-text-secondary mb-6">
 Showing <span className="font-semibold text-foreground">{paginated.length}</span> of{' '}
 <span className="font-semibold text-foreground">{filteredColleges.length}</span> colleges
 </p>

 {paginated.length > 0 ? (
 <div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
 <>
 {paginated.map((college, i) => (
 <div key={college.id} layout>
 <Card className="h-full hover:shadow-lg transition-all hover:border-amber-500/30 group">
 <CardHeader className="pb-3">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
 <Landmark className="h-6 w-6 text-white" />
 </div>
 <div className="min-w-0">
 <CardTitle className="text-sm font-heading leading-tight group-hover:text-amber-600 transition-colors">
 {college.collegeName}
 </CardTitle>
 <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1">
 <MapPin className="h-3 w-3" /> {college.city}, {college.state}
 </p>
 </div>
 </div>
 </CardHeader>
 <CardContent>
 <div className="flex flex-wrap gap-2 mb-4">
 {college.nirfRank && (
 <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
 <Award className="h-3 w-3 mr-0.5" /> NIRF #{college.nirfRank}
 </Badge>
 )}
 {college.naacRating && (
 <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
 NAAC {college.naacRating}
 </Badge>
 )}
 {college.isPartner && (
 <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">
 <CheckCircle2 className="h-3 w-3 mr-0.5" /> Partner
 </Badge>
 )}
 {college.totalStudents && (
 <Badge variant="secondary" className="text-[10px]">
 <Users className="h-3 w-3 mr-0.5" /> {college.totalStudents?.toLocaleString()} students
 </Badge>
 )}
 </div>
 <div className="flex items-center justify-end pt-3 border-t border-border">
 {college.website && (
 <a href={college.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-text-secondary hover:text-electric transition-colors">
 <Globe className="h-3.5 w-3.5" /> Visit Website
 </a>
 )}
 </div>
 </CardContent>
 </Card>
 </div>
 ))}
 </>
 </div>
 ) : (
 <Card className="p-12 text-center">
 <Sparkles className="h-12 w-12 text-text-secondary mx-auto mb-4" />
 <h3 className="text-lg font-heading font-semibold mb-2">No colleges found</h3>
 <Button variant="outline" onClick={resetFilters}>Clear All Filters</Button>
 </Card>
 )}

 {totalPages > 1 && (
 <div className="flex items-center justify-center gap-2 mt-8">
 <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
 {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
 <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className={p === page ? 'bg-navy text-white border-0' : ''}>{p}</Button>
 ))}
 <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
 </div>
 )}
 </div>
 </section>

 {/* CTA for Colleges */}
 <section className="py-16 navy-bg">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <div>
 <CampusCredLogo size={44} variant="white" className="mx-auto mb-6" />
 <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
 Partner With <span className="text-electric-light">CampusCred</span>
 </h2>
 <p className="text-white/60 max-w-xl mx-auto mb-6">
 Give your students access to real-world tasks, verified certificates, and career opportunities. Boost your NIRF rankings.
 </p>
 <a href="/"><Button className="gradient-gold text-navy border-0 gap-2 font-semibold">Register Your College <ArrowRight className="w-4 h-4" /></Button></a>
 </div>
 </div>
 </section>
 </main>
 <Footer />
 </div>
 );
}
