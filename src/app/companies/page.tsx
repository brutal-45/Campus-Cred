'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
 Search,
 Building2,
 MapPin,
 Users,
 ExternalLink,
 CheckCircle2,
 Star,
 Briefcase,
 Globe,
 ChevronLeft,
 ChevronRight,
 Sparkles,
 X,
 SlidersHorizontal,
 Award,
 ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';

const INDUSTRIES = [
 'FinTech', 'E-Commerce', 'SaaS', 'EdTech', 'Food Tech',
 'HealthTech', 'AI/ML', 'Cybersecurity', 'Logistics', 'Media',
 'Gaming', 'Real Estate', 'AgriTech', 'CleanTech', 'Other',
];

const MOCK_COMPANIES = [
 { id: '1', companyName: 'Razorpay', slug: 'razorpay', logoUrl: '/assets/logos/razorpay.svg', industry: 'FinTech', description: 'India\'s first full-stack financial solutions company helping businesses accept, process, and disburse payments.', location: 'Bangalore', city: 'Bangalore', state: 'Karnataka', employeeCount: '201-500', isVerified: true, isFeatured: true, website: 'https://razorpay.com', foundedYear: 2014, _count: { internships: 8, tasks: 15 } },
 { id: '2', companyName: 'Zomato', slug: 'zomato', logoUrl: '/assets/logos/zomato.svg', industry: 'Food Tech', description: 'India\'s largest food delivery platform connecting millions of users with restaurants across the country.', location: 'Gurgaon', city: 'Gurgaon', state: 'Haryana', employeeCount: '500+', isVerified: true, isFeatured: true, website: 'https://zomato.com', foundedYear: 2010, _count: { internships: 5, tasks: 12 } },
 { id: '3', companyName: 'Swiggy', slug: 'swiggy', logoUrl: '/assets/logos/swiggy.svg', industry: 'Food Tech', description: 'Leading on-demand delivery platform offering food, groceries, and more across 500+ cities.', location: 'Bangalore', city: 'Bangalore', state: 'Karnataka', employeeCount: '500+', isVerified: true, isFeatured: true, website: 'https://swiggy.com', foundedYear: 2014, _count: { internships: 6, tasks: 10 } },
 { id: '4', companyName: 'CRED', slug: 'cred', logoUrl: '/assets/logos/cred.svg', industry: 'FinTech', description: 'Members-only platform rewarding users for paying credit card bills on time with exclusive perks.', location: 'Bangalore', city: 'Bangalore', state: 'Karnataka', employeeCount: '201-500', isVerified: true, isFeatured: true, website: 'https://cred.club', foundedYear: 2018, _count: { internships: 4, tasks: 8 } },
 { id: '5', companyName: 'Flipkart', slug: 'flipkart', logoUrl: '/assets/logos/flipkart.svg', industry: 'E-Commerce', description: 'India\'s leading e-commerce marketplace with over 400 million registered customers.', location: 'Bangalore', city: 'Bangalore', state: 'Karnataka', employeeCount: '500+', isVerified: true, isFeatured: true, website: 'https://flipkart.com', foundedYear: 2007, _count: { internships: 10, tasks: 20 } },
 { id: '6', companyName: 'PhonePe', slug: 'phonepe', logoUrl: '/assets/logos/phonepe.svg', industry: 'FinTech', description: 'India\'s largest digital payments platform with 500 million registered users.', location: 'Bangalore', city: 'Bangalore', state: 'Karnataka', employeeCount: '500+', isVerified: true, isFeatured: false, website: 'https://phonepe.com', foundedYear: 2015, _count: { internships: 5, tasks: 9 } },
 { id: '7', companyName: 'Freshworks', slug: 'freshworks', logoUrl: '/assets/logos/freshworks.svg', industry: 'SaaS', description: 'Modern SaaS products for customer engagement, IT service management, and HR.', location: 'Chennai', city: 'Chennai', state: 'Tamil Nadu', employeeCount: '500+', isVerified: true, isFeatured: false, website: 'https://freshworks.com', foundedYear: 2010, _count: { internships: 7, tasks: 11 } },
 { id: '8', companyName: 'Groww', slug: 'groww', logoUrl: '/assets/logos/groww.svg', industry: 'FinTech', description: 'India\'s fastest-growing investment platform for stocks, mutual funds, and more.', location: 'Bangalore', city: 'Bangalore', state: 'Karnataka', employeeCount: '201-500', isVerified: true, isFeatured: false, website: 'https://groww.in', foundedYear: 2016, _count: { internships: 3, tasks: 7 } },
 { id: '9', companyName: 'Meesho', slug: 'meesho', logoUrl: '/assets/logos/meesho.svg', industry: 'E-Commerce', description: 'India\'s largest reseller platform empowering small businesses with social commerce.', location: 'Bangalore', city: 'Bangalore', state: 'Karnataka', employeeCount: '201-500', isVerified: true, isFeatured: false, website: 'https://meesho.com', foundedYear: 2015, _count: { internships: 4, tasks: 6 } },
 { id: '10', companyName: 'Zerodha', slug: 'zerodha', logoUrl: '/assets/logos/zerodha.svg', industry: 'FinTech', description: 'India\'s largest stock broker by active clients with a tech-first approach.', location: 'Bangalore', city: 'Bangalore', state: 'Karnataka', employeeCount: '201-500', isVerified: true, isFeatured: true, website: 'https://zerodha.com', foundedYear: 2010, _count: { internships: 2, tasks: 5 } },
 { id: '11', companyName: 'TCS', slug: 'tcs', logoUrl: '/assets/logos/tcs.svg', industry: 'SaaS', description: 'India\'s largest IT services company providing consulting and business solutions globally.', location: 'Mumbai', city: 'Mumbai', state: 'Maharashtra', employeeCount: '500+', isVerified: true, isFeatured: true, website: 'https://tcs.com', foundedYear: 1968, _count: { internships: 15, tasks: 30 } },
 { id: '12', companyName: 'Infosys', slug: 'infosys', logoUrl: '/assets/logos/infosys.svg', industry: 'SaaS', description: 'Global leader in next-generation digital services and consulting.', location: 'Bangalore', city: 'Bangalore', state: 'Karnataka', employeeCount: '500+', isVerified: true, isFeatured: false, website: 'https://infosys.com', foundedYear: 1981, _count: { internships: 12, tasks: 25 } },
];

const ITEMS_PER_PAGE = 6;

export default function CompaniesPage() {
 const [search, setSearch] = useState('');
 const [industry, setIndustry] = useState<string>('all');
 const [page, setPage] = useState(1);
 const [companies, setCompanies] = useState(MOCK_COMPANIES);
 const [showFilters, setShowFilters] = useState(false);

 useEffect(() => {
 fetch('/api/companies')
 .then(res => res.json())
 .then(data => {
 if (data.companies && data.companies.length > 0) {
 setCompanies(data.companies);
 }
 })
 .catch(() => {});
 }, []);

 const featuredCompanies = companies.filter(c => c.isFeatured);
 const regularCompanies = companies.filter(c => !c.isFeatured);

 const filteredCompanies = useMemo(() => {
 return companies.filter((company) => {
 const matchSearch = !search ||
 company.companyName.toLowerCase().includes(search.toLowerCase()) ||
 (company.description || '').toLowerCase().includes(search.toLowerCase());
 const matchIndustry = industry === 'all' || company.industry === industry;
 return matchSearch && matchIndustry;
 });
 }, [companies, search, industry]);

 const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
 const paginated = filteredCompanies.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

 const resetFilters = () => { setSearch(''); setIndustry('all'); setPage(1); };
 const activeCount = [industry !== 'all', !!search].filter(Boolean).length;

 return (
 <div className="min-h-screen flex flex-col bg-background">
 <Navbar />
 <main className="flex-1 pt-16">
 {/* Hero */}
 <section className="relative overflow-hidden py-16 md:py-24">
 <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy" />
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-20 left-10 w-72 h-72 bg-success rounded-full blur-[120px]" />
 <div className="absolute bottom-10 right-10 w-72 h-72 bg-gold rounded-full blur-[120px]" />
 </div>
 <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <div className="flex justify-center mb-4">
 <CampusCredLogo size={44} variant="white" />
 </div>
 <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
 Company <span className="text-electric-light">Directory</span>
 </h1>
 <p className="text-white/60 max-w-2xl mx-auto mb-8">
 500+ verified companies posting real tasks and internships on CampusCred.
 </p>
 <div className="max-w-xl mx-auto relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
 <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search companies..." className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl backdrop-blur-sm" />
 </div>
 </div>
 </section>

 {/* Featured Companies */}
 {!search && industry === 'all' && featuredCompanies.length > 0 && (
 <section className="py-12 bg-muted/30">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="flex items-center gap-2 mb-6">
 <Star className="h-5 w-5 text-gold" />
 <h2 className="text-xl font-heading font-bold">Featured Companies</h2>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
 {featuredCompanies.map((company, i) => (
 <div key={company.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
 <Card className="animate-fade-in p-4 text-center hover:shadow-lg transition-all hover:border-gold/30 cursor-pointer group">
 <div className="w-14 h-14 mx-auto rounded-xl bg-muted flex items-center justify-center overflow-hidden mb-3 group-hover:scale-110 transition-transform">
 {company.logoUrl ? (
 <img src={company.logoUrl} alt={company.companyName} className="w-10 h-10 object-contain" />
 ) : (
 <Building2 className="h-7 w-7 text-text-secondary" />
 )}
 </div>
 <h4 className="text-xs font-semibold truncate">{company.companyName}</h4>
 <p className="text-[10px] text-text-secondary">{company.industry}</p>
 {company.isVerified && <CheckCircle2 className="h-3 w-3 text-success mx-auto mt-1" />}
 </Card>
 </div>
 ))}
 </div>
 </div>
 </section>
 )}

 {/* All Companies */}
 <section className="py-12">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="flex flex-wrap items-center gap-3 mb-6">
 <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
 <SlidersHorizontal className="h-4 w-4" /> Filters
 {activeCount > 0 && <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-navy text-white border-0">{activeCount}</Badge>}
 </Button>
 <div className="flex flex-wrap gap-2">
 <Button variant={industry === 'all' ? 'default' : 'outline'} size="sm" onClick={() => { setIndustry('all'); setPage(1); }} className={industry === 'all' ? 'bg-navy text-white border-0' : ''}>All</Button>
 {INDUSTRIES.slice(0, 5).map((ind) => (
 <Button key={ind} variant={industry === ind ? 'default' : 'outline'} size="sm" onClick={() => { setIndustry(ind); setPage(1); }} className={industry === ind ? 'bg-navy text-white border-0' : ''}>{ind}</Button>
 ))}
 </div>
 {activeCount > 0 && <Button variant="ghost" size="sm" onClick={resetFilters} className="text-text-secondary gap-1 ml-auto"><X className="h-3 w-3" /> Clear</Button>}
 </div>

 <>
 {showFilters && (
 <div className="mb-8 overflow-hidden">
 <Card className="p-6">
 <div className="space-y-2">
 <label className="text-xs font-medium text-text-secondary">Industry</label>
 <Select value={industry} onValueChange={(v) => { setIndustry(v); setPage(1); }}>
 <SelectTrigger><SelectValue placeholder="All Industries" /></SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Industries</SelectItem>
 {INDUSTRIES.map((ind) => <SelectItem key={ind} value={ind}>{ind}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 </Card>
 </div>
 )}
 </>

 <p className="text-sm text-text-secondary mb-6">
 Showing <span className="font-semibold text-foreground">{paginated.length}</span> of{' '}
 <span className="font-semibold text-foreground">{filteredCompanies.length}</span> companies
 </p>

 {paginated.length > 0 ? (
 <div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
 <>
 {paginated.map((company, i) => (
 <div key={company.id} layout>
 <Card className="h-full hover:shadow-lg transition-all hover:border-electric/30 group">
 <CardHeader className="pb-3">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
 {company.logoUrl ? (
 <img src={company.logoUrl} alt={company.companyName} className="w-10 h-10 object-contain" />
 ) : (
 <Building2 className="h-7 w-7 text-text-secondary" />
 )}
 </div>
 <div className="min-w-0">
 <CardTitle className="text-base font-heading leading-tight group-hover:text-electric transition-colors flex items-center gap-1.5">
 {company.companyName}
 {company.isVerified && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
 </CardTitle>
 <p className="text-xs text-text-secondary mt-0.5">{company.industry}</p>
 </div>
 </div>
 </CardHeader>
 <CardContent>
 <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-2">{company.description}</p>
 <div className="flex flex-wrap gap-2 mb-4">
 {company.location && (
 <Badge variant="secondary" className="text-[10px]"><MapPin className="h-3 w-3 mr-0.5" /> {company.city}, {company.state}</Badge>
 )}
 {company.employeeCount && (
 <Badge variant="secondary" className="text-[10px]"><Users className="h-3 w-3 mr-0.5" /> {company.employeeCount}</Badge>
 )}
 </div>
 <div className="flex items-center justify-between pt-3 border-t border-border">
 <div className="flex gap-3 text-xs text-text-secondary">
 <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {company._count.internships} internships</span>
 <span className="flex items-center gap-1"><Award className="h-3 w-3" /> {company._count.tasks} tasks</span>
 </div>
 {company.website && (
 <a href={company.website} target="_blank" rel="noopener noreferrer">
 <ExternalLink className="h-3.5 w-3.5 text-text-secondary hover:text-electric transition-colors" />
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
 <h3 className="text-lg font-heading font-semibold mb-2">No companies found</h3>
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

 {/* CTA for Companies */}
 <section className="py-16 bg-muted/30">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <div>
 <Building2 className="h-12 w-12 text-electric mx-auto mb-4" />
 <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
 Want Your Company on <span className="text-navy">CampusCred</span>?
 </h2>
 <p className="text-text-secondary max-w-xl mx-auto mb-6">
 Post tasks, hire interns, and discover India&apos;s brightest student talent — all with zero placement fees.
 </p>
 <a href="/"><Button className="bg-navy text-white border-0 gap-2">Register Your Company <ArrowRight className="w-4 h-4" /></Button></a>
 </div>
 </div>
 </section>
 </main>
 <Footer />
 </div>
 );
}
