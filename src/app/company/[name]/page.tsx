'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
 Building2,
 Globe,
 MapPin,
 Calendar,
 Users,
 Briefcase,
 Star,
 Award,
 CheckCircle2,
 ExternalLink,
 Share2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface CompanyProfile {
 name: string;
 slug: string;
 logo: string | null;
 cover: string | null;
 industry: string;
 website: string;
 description: string;
 location: string;
 city: string;
 state: string;
 employeeCount: string;
 foundedYear: number;
 isVerified: boolean;
 isFeatured: boolean;
 totalInternships: number;
 totalHired: number;
 activeInternships: number;
 recentInternships: {
 id: string;
 title: string;
 status: string;
 deadline: string;
 isPaid: boolean;
 stipend: string;
 applicants: number;
 }[];
}

const mockProfiles: Record<string, CompanyProfile> = {
 'techcorp': {
 name: 'TechCorp Solutions',
 slug: 'techcorp',
 logo: null,
 cover: null,
 industry: 'Technology',
 website: 'https://techcorp.example.com',
 description: 'TechCorp Solutions is a leading technology company specializing in enterprise software, cloud solutions, and AI-powered tools. We believe in nurturing young talent and providing real-world experience through our internship programs.',
 location: 'Bangalore, Karnataka',
 city: 'Bangalore',
 state: 'Karnataka',
 employeeCount: '201-500',
 foundedYear: 2018,
 isVerified: true,
 isFeatured: true,
 totalInternships: 24,
 totalHired: 45,
 activeInternships: 5,
 recentInternships: [
 { id: '1', title: 'Full-Stack Development Intern', status: 'Open', deadline: '2025-02-28', isPaid: true, stipend: '₹15,000/month', applicants: 32 },
 { id: '2', title: 'UI/UX Design Intern', status: 'Open', deadline: '2025-03-01', isPaid: true, stipend: '₹12,000/month', applicants: 18 },
 { id: '3', title: 'Data Science Intern', status: 'Open', deadline: '2025-02-20', isPaid: true, stipend: '₹18,000/month', applicants: 24 },
 { id: '4', title: 'DevOps Engineer Intern', status: 'Closed', deadline: '2025-01-15', isPaid: true, stipend: '₹15,000/month', applicants: 28 },
 { id: '5', title: 'Mobile App Development Intern', status: 'Open', deadline: '2025-03-15', isPaid: false, stipend: '', applicants: 15 },
 ],
 },
};

export default function CompanyProfilePage() {
 const params = useParams();
 const companyName = params.name as string;
 const [profile, setProfile] = React.useState<CompanyProfile | null>(null);
 const [loading, setLoading] = React.useState(true);

 React.useEffect(() => {
 // Try to find from mock data first
 const mockProfile = mockProfiles[companyName?.toLowerCase()];
 if (mockProfile) {
 setProfile(mockProfile);
 } else {
 // Generate a generic profile for any company name
 const displayName = companyName
 ? companyName.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
 : 'Company';
 setProfile({
 name: displayName,
 slug: companyName,
 logo: null,
 cover: null,
 industry: 'Technology',
 website: `https://${companyName}.example.com`,
 description: `${displayName} is a forward-thinking company committed to nurturing talent and providing real-world experience through micro-internships and hands-on projects on CampusCred.`,
 location: 'India',
 city: 'Bangalore',
 state: 'Karnataka',
 employeeCount: '51-200',
 foundedYear: 2020,
 isVerified: false,
 isFeatured: false,
 totalInternships: 12,
 totalHired: 28,
 activeInternships: 3,
 recentInternships: [
 { id: '1', title: 'Software Development Intern', status: 'Open', deadline: '2025-03-15', isPaid: true, stipend: '₹12,000/month', applicants: 20 },
 { id: '2', title: 'Data Analysis Intern', status: 'Open', deadline: '2025-03-10', isPaid: false, stipend: '', applicants: 14 },
 { id: '3', title: 'Marketing Intern', status: 'Closed', deadline: '2025-01-30', isPaid: true, stipend: '₹8,000/month', applicants: 22 },
 ],
 });
 }
 setLoading(false);
 }, [companyName]);

 if (loading) {
 return (
 <div className="space-y-6 skeleton-shimmer">
 <div className="h-40 bg-muted rounded-xl" />
 <div className="h-8 bg-muted rounded w-1/3" />
 <div className="h-4 bg-muted rounded w-2/3" />
 </div>
 );
 }

 if (!profile) {
 return (
 <div className="flex items-center justify-center py-20">
 <div className="text-center">
 <Building2 className="w-12 h-12 text-text-secondary/30 mx-auto mb-3" />
 <p className="text-lg font-medium">Company not found</p>
 <Link href="/" className="text-sm text-electric hover:underline mt-2 inline-block">Back to Home</Link>
 </div>
 </div>
 );
 }

 const getDaysLeft = (deadline: string) => {
 const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
 return diff > 0 ? diff : 0;
 };

 return (
 <div className="space-y-6">
 {/* Cover */}
 <div className="relative h-40 md:h-52 rounded-xl bg-gradient-to-r from-electric/20 via-purple/20 to-emerald-20 overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
 <div className="absolute bottom-4 left-6 flex items-end gap-4">
 <div className="w-20 h-20 rounded-xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
 {profile.logo ? (
 <img src={profile.logo} alt={profile.name} className="w-full h-full rounded-lg object-cover" />
 ) : (
 <Building2 className="w-10 h-10 text-electric" />
 )}
 </div>
 <div className="text-white mb-1">
 <div className="flex items-center gap-2">
 <h1 className="text-2xl font-bold font-heading">{profile.name}</h1>
 {profile.isVerified && (
 <CheckCircle2 className="w-5 h-5 text-emerald-400" />
 )}
 {profile.isFeatured && (
 <Badge className="bg-amber-500 text-white text-[9px]">Featured</Badge>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Info grid */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Left: Company info */}
 <div className="space-y-4">
 <Card>
 <CardContent className="p-5">
 <h3 className="text-sm font-bold font-heading mb-3">About</h3>
 <p className="text-xs text-text-secondary leading-relaxed">{profile.description}</p>

 <div className="space-y-2 mt-4">
 {profile.industry && (
 <div className="flex items-center gap-2 text-xs">
 <Briefcase className="w-3.5 h-3.5 text-text-secondary" />
 <span>{profile.industry}</span>
 </div>
 )}
 {profile.location && (
 <div className="flex items-center gap-2 text-xs">
 <MapPin className="w-3.5 h-3.5 text-text-secondary" />
 <span>{profile.location}</span>
 </div>
 )}
 {profile.employeeCount && (
 <div className="flex items-center gap-2 text-xs">
 <Users className="w-3.5 h-3.5 text-text-secondary" />
 <span>{profile.employeeCount} employees</span>
 </div>
 )}
 {profile.foundedYear && (
 <div className="flex items-center gap-2 text-xs">
 <Calendar className="w-3.5 h-3.5 text-text-secondary" />
 <span>Founded {profile.foundedYear}</span>
 </div>
 )}
 {profile.website && (
 <div className="flex items-center gap-2 text-xs">
 <Globe className="w-3.5 h-3.5 text-text-secondary" />
 <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-electric hover:underline flex items-center gap-1">
 Visit Website <ExternalLink className="w-3 h-3" />
 </a>
 </div>
 )}
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardContent className="p-5">
 <h3 className="text-sm font-bold font-heading mb-3">Stats</h3>
 <div className="grid grid-cols-2 gap-3">
 <div className="p-3 rounded-lg bg-muted/50 text-center">
 <p className="text-lg font-bold font-heading">{profile.totalInternships}</p>
 <p className="text-[10px] text-text-secondary">Internships</p>
 </div>
 <div className="p-3 rounded-lg bg-muted/50 text-center">
 <p className="text-lg font-bold font-heading">{profile.totalHired}</p>
 <p className="text-[10px] text-text-secondary">Hired</p>
 </div>
 <div className="p-3 rounded-lg bg-muted/50 text-center">
 <p className="text-lg font-bold font-heading">{profile.activeInternships}</p>
 <p className="text-[10px] text-text-secondary">Active</p>
 </div>
 <div className="p-3 rounded-lg bg-emerald-50 text-center">
 <p className="text-lg font-bold font-heading text-emerald-600">
 {profile.isVerified ? '✓' : '—'}
 </p>
 <p className="text-[10px] text-text-secondary">Verified</p>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* CampusCred branding */}
 <div className="flex items-center justify-center gap-2 py-2">
 <CampusCredLogo size={28} variant="dark" />
 <span className="text-[10px] text-text-secondary">Verified Company Profile</span>
 </div>
 </div>

 {/* Right: Active internships */}
 <div className="lg:col-span-2 space-y-4">
 <div className="flex items-center justify-between">
 <h2 className="text-lg font-bold font-heading">Open Internships</h2>
 <Badge variant="outline" className="text-xs">{profile.activeInternships} active</Badge>
 </div>

 <div className="space-y-3">
 {profile.recentInternships.map((intern, index) => (
 <div key={intern.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
 <Card className="hover:shadow-md transition-shadow">
 <CardContent className="p-5">
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <h3 className="text-sm font-bold">{intern.title}</h3>
 <Badge className={`text-[9px] ${intern.status === 'Open' ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-text-secondary'}`}>
 {intern.status}
 </Badge>
 {intern.isPaid && (
 <Badge className="text-[9px] bg-amber-100 text-amber-700">Paid</Badge>
 )}
 </div>
 <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
 {intern.isPaid && intern.stipend && (
 <span className="flex items-center gap-1">
 <Star className="w-3 h-3 text-amber-500" />{intern.stipend}
 </span>
 )}
 <span className="flex items-center gap-1">
 <Users className="w-3 h-3" />{intern.applicants} applicants
 </span>
 {intern.status === 'Open' && (
 <span className="flex items-center gap-1">
 <Calendar className="w-3 h-3" />{getDaysLeft(intern.deadline)}d left
 </span>
 )}
 </div>
 </div>
 {intern.status === 'Open' && (
 <Button size="sm" className="bg-navy text-white text-xs gap-1">
 <Award className="w-3 h-3" />
 Apply Now
 </Button>
 )}
 </div>
 </CardContent>
 </Card>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}
