'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
 Search,
 MapPin,
 Clock,
 DollarSign,
 Briefcase,
 Building2,
 Wifi,
 ChevronLeft,
 ChevronRight,
 ArrowRight,
 Sparkles,
 X,
 SlidersHorizontal,
 GraduationCap,
 CheckCircle2,
 ExternalLink,
 Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { DEGREE_BRANCH_MAP } from '@/lib/constants';

const MOCK_INTERNSHIPS = [
 { id: '1', title: 'Frontend Development Intern', description: 'Build responsive web applications using React and Next.js. Work on real products used by millions.', company: { id: '1', companyName: 'Razorpay', logoUrl: '/assets/logos/razorpay.svg', industry: 'FinTech', location: 'Bangalore', isVerified: true }, branches: ['CSE', 'IT', 'ECE'], degrees: ['B.Tech', 'BCA', 'MCA'], duration: '3 months', isPaid: true, stipend: '₹15,000/month', location: 'Bangalore', isRemote: true, deadline: '2025-04-30', status: 'Open', applicantCount: 24 },
 { id: '2', title: 'UI/UX Design Intern', description: 'Design intuitive user interfaces for mobile and web applications. Create wireframes, prototypes, and design systems.', company: { id: '2', companyName: 'Swiggy', logoUrl: '/assets/logos/swiggy.svg', industry: 'Food Tech', location: 'Bangalore', isVerified: true }, branches: ['UI/UX Design', 'Graphic Design'], degrees: ['B.Des', 'BFA'], duration: '6 months', isPaid: true, stipend: '₹20,000/month', location: 'Bangalore', isRemote: false, deadline: '2025-04-25', status: 'Open', applicantCount: 18 },
 { id: '3', title: 'Data Analytics Intern', description: 'Analyze large datasets to derive business insights. Work with SQL, Python, and visualization tools.', company: { id: '3', companyName: 'Zomato', logoUrl: '/assets/logos/zomato.svg', industry: 'Food Tech', location: 'Gurgaon', isVerified: true }, branches: ['Data Science', 'Computer Science', 'Statistics'], degrees: ['B.Tech', 'B.Sc', 'M.Sc'], duration: '3 months', isPaid: true, stipend: '₹12,000/month', location: 'Gurgaon', isRemote: true, deadline: '2025-05-05', status: 'Open', applicantCount: 32 },
 { id: '4', title: 'Marketing & Growth Intern', description: 'Drive user acquisition and retention through creative marketing campaigns and growth hacking strategies.', company: { id: '4', companyName: 'CRED', logoUrl: '/assets/logos/cred.svg', industry: 'FinTech', location: 'Bangalore', isVerified: true }, branches: ['Marketing', 'Finance', 'Digital Marketing'], degrees: ['BBA', 'MBA'], duration: '2 months', isPaid: true, stipend: '₹10,000/month', location: 'Bangalore', isRemote: true, deadline: '2025-04-20', status: 'Open', applicantCount: 15 },
 { id: '5', title: 'Backend Engineering Intern', description: 'Work on scalable microservices architecture using Node.js and PostgreSQL. Deploy to production environments.', company: { id: '5', companyName: 'Freshworks', logoUrl: '/assets/logos/freshworks.svg', industry: 'SaaS', location: 'Chennai', isVerified: true }, branches: ['CSE', 'IT', 'Software Engineering'], degrees: ['B.Tech', 'MCA'], duration: '6 months', isPaid: true, stipend: '₹18,000/month', location: 'Chennai', isRemote: false, deadline: '2025-05-10', status: 'Open', applicantCount: 21 },
 { id: '6', title: 'Content Writing Intern', description: 'Write technical documentation, blog posts, and marketing copy for developer tools and platforms.', company: { id: '6', companyName: 'PhonePe', logoUrl: '/assets/logos/phonepe.svg', industry: 'FinTech', location: 'Bangalore', isVerified: true }, branches: ['English', 'Journalism', 'Web Development'], degrees: ['BA', 'BCA', 'MA'], duration: '2 months', isPaid: false, stipend: null, location: 'Remote', isRemote: true, deadline: '2025-04-28', status: 'Open', applicantCount: 12 },
 { id: '7', title: 'Machine Learning Intern', description: 'Develop and train ML models for fraud detection and risk assessment. Work with real financial data.', company: { id: '7', companyName: 'Groww', logoUrl: '/assets/logos/groww.svg', industry: 'FinTech', location: 'Bangalore', isVerified: true }, branches: ['CSE', 'AI/ML', 'Data Science'], degrees: ['B.Tech', 'M.Sc'], duration: '4 months', isPaid: true, stipend: '₹25,000/month', location: 'Bangalore', isRemote: false, deadline: '2025-05-15', status: 'Open', applicantCount: 28 },
 { id: '8', title: 'Full Stack Developer Intern', description: 'Build end-to-end features for an e-commerce platform. Work with React, Node.js, and MongoDB.', company: { id: '8', companyName: 'Flipkart', logoUrl: '/assets/logos/flipkart.svg', industry: 'E-Commerce', location: 'Bangalore', isVerified: true }, branches: ['CSE', 'IT', 'Web Development'], degrees: ['B.Tech', 'BCA', 'MCA'], duration: '6 months', isPaid: true, stipend: '₹22,000/month', location: 'Bangalore', isRemote: true, deadline: '2025-05-08', status: 'Open', applicantCount: 45 },
];

const ITEMS_PER_PAGE = 6;

export default function InternshipsPage() {
 const [search, setSearch] = useState('');
 const [branch, setBranch] = useState<string>('all');
 const [paidFilter, setPaidFilter] = useState<string>('all');
 const [remoteFilter, setRemoteFilter] = useState<string>('all');
 const [locationSearch, setLocationSearch] = useState('');
 const [page, setPage] = useState(1);
 const [internships, setInternships] = useState(MOCK_INTERNSHIPS);
 const [showFilters, setShowFilters] = useState(false);

 const allBranches = [...new Set(Object.values(DEGREE_BRANCH_MAP).flat())].sort();

 useEffect(() => {
 fetch('/api/internships')
 .then(res => res.json())
 .then(data => {
 if (data.internships && data.internships.length > 0) {
 setInternships(data.internships);
 }
 })
 .catch(() => {});
 }, []);

 const filteredInternships = useMemo(() => {
 return internships.filter((intern) => {
 const matchSearch = !search ||
 intern.title.toLowerCase().includes(search.toLowerCase()) ||
 intern.description.toLowerCase().includes(search.toLowerCase()) ||
 intern.company.companyName.toLowerCase().includes(search.toLowerCase());
 const matchBranch = branch === 'all' || intern.branches.some(b => b === branch);
 const matchPaid = paidFilter === 'all' ||
 (paidFilter === 'paid' && intern.isPaid) ||
 (paidFilter === 'unpaid' && !intern.isPaid);
 const matchRemote = remoteFilter === 'all' ||
 (remoteFilter === 'remote' && intern.isRemote) ||
 (remoteFilter === 'onsite' && !intern.isRemote);
 const matchLocation = !locationSearch ||
 intern.location?.toLowerCase().includes(locationSearch.toLowerCase());
 return matchSearch && matchBranch && matchPaid && matchRemote && matchLocation;
 });
 }, [internships, search, branch, paidFilter, remoteFilter, locationSearch]);

 const totalPages = Math.ceil(filteredInternships.length / ITEMS_PER_PAGE);
 const paginated = filteredInternships.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

 const resetFilters = () => {
 setSearch(''); setBranch('all'); setPaidFilter('all'); setRemoteFilter('all');
 setLocationSearch(''); setPage(1);
 };

 const activeCount = [branch !== 'all', paidFilter !== 'all', remoteFilter !== 'all', !!search, !!locationSearch].filter(Boolean).length;

 return (
 <div className="min-h-screen flex flex-col bg-background">
 <Navbar />
 <main className="flex-1 pt-16">
 {/* Hero */}
 <section className="relative overflow-hidden py-16 md:py-24">
 <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy" />
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-20 left-10 w-72 h-72 bg-success rounded-full blur-[120px]" />
 <div className="absolute bottom-10 right-10 w-72 h-72 bg-electric rounded-full blur-[120px]" />
 </div>
 <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <div className="flex justify-center mb-4">
 <CampusCredLogo size={44} variant="white" />
 </div>
 <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
 Browse <span className="text-electric-light">Internships</span>
 </h1>
 <p className="text-white/60 max-w-2xl mx-auto mb-8">
 Micro-internships from India&apos;s top companies. Apply directly and start building real experience.
 </p>
 <div className="max-w-xl mx-auto relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
 <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search internships by title, company..." className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl backdrop-blur-sm" />
 </div>
 </div>
 </section>

 {/* Quick Filters */}
 <section className="py-12">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="flex flex-wrap items-center gap-3 mb-6">
 <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
 <SlidersHorizontal className="h-4 w-4" /> Filters
 {activeCount > 0 && <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-navy text-white border-0">{activeCount}</Badge>}
 </Button>
 <div className="flex flex-wrap gap-2">
 <Button variant={paidFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => { setPaidFilter('all'); setPage(1); }} className={paidFilter === 'all' ? 'bg-navy text-white border-0' : ''}>All</Button>
 <Button variant={paidFilter === 'paid' ? 'default' : 'outline'} size="sm" onClick={() => { setPaidFilter('paid'); setPage(1); }} className={`gap-1.5 ${paidFilter === 'paid' ? 'bg-navy text-white border-0' : ''}`}>
 <DollarSign className="h-3.5 w-3.5" /> Paid
 </Button>
 <Button variant={paidFilter === 'unpaid' ? 'default' : 'outline'} size="sm" onClick={() => { setPaidFilter('unpaid'); setPage(1); }} className={paidFilter === 'unpaid' ? 'bg-navy text-white border-0' : ''}>
 Unpaid
 </Button>
 <Button variant={remoteFilter === 'remote' ? 'default' : 'outline'} size="sm" onClick={() => { setRemoteFilter(v => v === 'remote' ? 'all' : 'remote'); setPage(1); }} className={`gap-1.5 ${remoteFilter === 'remote' ? 'bg-navy text-white border-0' : ''}`}>
 <Wifi className="h-3.5 w-3.5" /> Remote
 </Button>
 </div>
 {activeCount > 0 && (
 <Button variant="ghost" size="sm" onClick={resetFilters} className="text-text-secondary gap-1 ml-auto"><X className="h-3 w-3" /> Clear</Button>
 )}
 </div>

 <>
 {showFilters && (
 <div className="mb-8 overflow-hidden">
 <Card className="p-6">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-xs font-medium text-text-secondary">Branch</label>
 <Select value={branch} onValueChange={(v) => { setBranch(v); setPage(1); }}>
 <SelectTrigger><SelectValue placeholder="All Branches" /></SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Branches</SelectItem>
 {allBranches.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <label className="text-xs font-medium text-text-secondary">Location</label>
 <Input value={locationSearch} onChange={(e) => { setLocationSearch(e.target.value); setPage(1); }} placeholder="e.g. Bangalore, Remote..." />
 </div>
 </div>
 </Card>
 </div>
 )}
 </>

 <p className="text-sm text-text-secondary mb-6">
 Showing <span className="font-semibold text-foreground">{paginated.length}</span> of{' '}
 <span className="font-semibold text-foreground">{filteredInternships.length}</span> internships
 </p>

 {/* Internship Grid */}
 {paginated.length > 0 ? (
 <div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
 <>
 {paginated.map((intern, i) => (
 <div key={intern.id} layout>
 <Card className="h-full hover:shadow-lg transition-all hover:border-electric/30 group">
 <CardHeader className="pb-3">
 <div className="flex items-center gap-3 mb-2">
 <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
 {intern.company.logoUrl ? (
 <img src={intern.company.logoUrl} alt={intern.company.companyName} className="w-8 h-8 object-contain" />
 ) : (
 <Building2 className="h-5 w-5 text-text-secondary" />
 )}
 </div>
 <div className="min-w-0">
 <p className="text-xs font-medium text-text-secondary flex items-center gap-1">
 {intern.company.companyName}
 {intern.company.isVerified && <CheckCircle2 className="h-3 w-3 text-success" />}
 </p>
 </div>
 </div>
 <CardTitle className="text-base font-heading leading-tight group-hover:text-electric transition-colors line-clamp-2">
 {intern.title}
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-2">{intern.description}</p>
 <div className="flex flex-wrap gap-1.5 mb-4">
 {intern.isPaid && (
 <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
 <DollarSign className="h-3 w-3 mr-0.5" /> {intern.stipend}
 </Badge>
 )}
 {intern.isRemote && (
 <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px]">
 <Wifi className="h-3 w-3 mr-0.5" /> Remote
 </Badge>
 )}
 {intern.duration && (
 <Badge variant="secondary" className="text-[10px]">
 <Clock className="h-3 w-3 mr-0.5" /> {intern.duration}
 </Badge>
 )}
 </div>
 <div className="flex items-center justify-between pt-3 border-t border-border">
 <div className="flex items-center gap-1 text-xs text-text-secondary">
 <MapPin className="h-3.5 w-3.5" /> {intern.location || 'Remote'}
 </div>
 <div className="flex items-center gap-1 text-xs text-text-secondary">
 <Users className="h-3.5 w-3.5" /> {intern.applicantCount} applied
 </div>
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
 <h3 className="text-lg font-heading font-semibold mb-2">No internships found</h3>
 <p className="text-sm text-text-secondary mb-4">Try adjusting your filters or search query.</p>
 <Button variant="outline" onClick={resetFilters}>Clear All Filters</Button>
 </Card>
 )}

 {/* Pagination */}
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
 </main>
 <Footer />
 </div>
 );
}
