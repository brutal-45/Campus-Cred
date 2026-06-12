'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
 Search,
 Calendar,
 Clock,
 ArrowRight,
 Tag,
 BookOpen,
 TrendingUp,
 Lightbulb,
 Building2,
 GraduationCap,
 Star,
 Sparkles,
 User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';

const CATEGORIES = [
 { id: 'all', label: 'All', icon: BookOpen },
 { id: 'career', label: 'Career', icon: TrendingUp, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
 { id: 'technology', label: 'Technology', icon: Lightbulb, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
 { id: 'education', label: 'Education', icon: GraduationCap, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
 { id: 'company', label: 'Company', icon: Building2, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
 { id: 'tips', label: 'Tips & Guides', icon: Star, color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
];

const categoryColors: Record<string, string> = {
 career: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
 technology: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
 education: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
 company: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
 tips: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

const MOCK_POSTS = [
 { id: '1', title: 'How to Land Your First Internship Through CampusCred', slug: 'first-internship-guide', excerpt: 'A step-by-step guide for students to maximize their CampusCred profile and land their dream micro-internship.', content: '', coverImage: null, category: 'career', tags: '["internship","career","guide"]', author: { id: '1', fullName: 'Priya Sharma', profilePhoto: null }, status: 'Published', publishedAt: '2025-02-15T10:00:00Z' },
 { id: '2', title: 'The Future of QR-Verified Digital Certificates in India', slug: 'qr-certificates-future', excerpt: 'How blockchain-inspired hashing and QR verification are transforming the credibility of digital credentials.', content: '', coverImage: null, category: 'technology', tags: '["certificates","QR","verification"]', author: { id: '2', fullName: 'Arjun Mehta', profilePhoto: null }, status: 'Published', publishedAt: '2025-02-12T10:00:00Z' },
 { id: '3', title: 'Why Indian Colleges Need Real-World Task Platforms', slug: 'colleges-need-task-platforms', excerpt: 'The gap between academic learning and industry requirements, and how platforms like CampusCred bridge it.', content: '', coverImage: null, category: 'education', tags: '["colleges","education","industry"]', author: { id: '3', fullName: 'Rahul Verma', profilePhoto: null }, status: 'Published', publishedAt: '2025-02-10T10:00:00Z' },
 { id: '4', title: 'How Razorpay Uses CampusCred to Discover Student Talent', slug: 'razorpay-campuscred', excerpt: 'A case study on how Razorpay leverages CampusCred to find skilled interns and junior developers.', content: '', coverImage: null, category: 'company', tags: '["razorpay","hiring","case-study"]', author: { id: '4', fullName: 'Sneha Iyer', profilePhoto: null }, status: 'Published', publishedAt: '2025-02-08T10:00:00Z' },
 { id: '5', title: '10 Tips to Boost Your CampusCred Score Fast', slug: 'boost-campuscred-score', excerpt: 'Practical strategies to increase your CampusCred Score from Starter to Legend level in record time.', content: '', coverImage: null, category: 'tips', tags: '["score","tips","growth"]', author: { id: '1', fullName: 'Priya Sharma', profilePhoto: null }, status: 'Published', publishedAt: '2025-02-05T10:00:00Z' },
 { id: '6', title: 'Building a Portfolio That Gets You Hired', slug: 'portfolio-gets-hired', excerpt: 'How to craft a compelling CampusCred portfolio that catches the attention of top recruiters.', content: '', coverImage: null, category: 'career', tags: '["portfolio","hiring","career"]', author: { id: '2', fullName: 'Arjun Mehta', profilePhoto: null }, status: 'Published', publishedAt: '2025-02-01T10:00:00Z' },
 { id: '7', title: 'React vs Next.js: Which Should You Learn in 2025?', slug: 'react-vs-nextjs-2025', excerpt: 'An in-depth comparison to help students choose the right framework for their career path.', content: '', coverImage: null, category: 'technology', tags: '["react","nextjs","web-development"]', author: { id: '3', fullName: 'Rahul Verma', profilePhoto: null }, status: 'Published', publishedAt: '2025-01-28T10:00:00Z' },
 { id: '8', title: 'The Importance of Peer Reviews in Skill Development', slug: 'peer-reviews-skill-development', excerpt: 'Why giving and receiving peer feedback is crucial for growth, and how CampusCred facilitates it.', content: '', coverImage: null, category: 'education', tags: '["peer-review","skills","growth"]', author: { id: '4', fullName: 'Sneha Iyer', profilePhoto: null }, status: 'Published', publishedAt: '2025-01-25T10:00:00Z' },
 { id: '9', title: 'How to Write a Winning Task Submission', slug: 'winning-task-submission', excerpt: 'Best practices for submitting high-quality work that gets approved and earns top ratings from mentors.', content: '', coverImage: null, category: 'tips', tags: '["submission","quality","mentor"]', author: { id: '1', fullName: 'Priya Sharma', profilePhoto: null }, status: 'Published', publishedAt: '2025-01-20T10:00:00Z' },
];

export default function BlogPage() {
 const [search, setSearch] = useState('');
 const [category, setCategory] = useState<string>('all');
 const [posts, setPosts] = useState(MOCK_POSTS);
 const [page, setPage] = useState(1);
 const POSTS_PER_PAGE = 6;

 useEffect(() => {
 fetch('/api/blog')
 .then(res => res.json())
 .then(data => {
 if (data.posts && data.posts.length > 0) {
 setPosts(data.posts);
 }
 })
 .catch(() => {});
 }, []);

 const featuredPosts = posts.slice(0, 3);

 const filteredPosts = useMemo(() => {
 return posts.filter((post) => {
 const matchSearch = !search ||
 post.title.toLowerCase().includes(search.toLowerCase()) ||
 (post.excerpt || '').toLowerCase().includes(search.toLowerCase());
 const matchCategory = category === 'all' || post.category === category;
 return matchSearch && matchCategory;
 });
 }, [posts, search, category]);

 const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
 const paginated = filteredPosts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

 return (
 <div className="min-h-screen flex flex-col bg-background">
 <Navbar />
 <main className="flex-1 pt-16">
 {/* Hero */}
 <section className="relative overflow-hidden py-16 md:py-24">
 <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy" />
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-20 left-10 w-72 h-72 bg-purple rounded-full blur-[120px]" />
 <div className="absolute bottom-10 right-10 w-72 h-72 bg-electric rounded-full blur-[120px]" />
 </div>
 <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <div className="flex justify-center mb-4">
 <CampusCredLogo size={44} variant="white" />
 </div>
 <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
 CampusCred <span className="text-electric-light">Blog</span>
 </h1>
 <p className="text-white/60 max-w-2xl mx-auto mb-8">
 Insights, guides, and stories from India&apos;s student career ecosystem.
 </p>
 <div className="max-w-xl mx-auto relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
 <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search articles..." className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl backdrop-blur-sm" />
 </div>
 </div>
 </section>

 {/* Featured Posts */}
 {!search && category === 'all' && featuredPosts.length >= 3 && (
 <section className="py-12">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="flex items-center gap-2 mb-6">
 <Star className="h-5 w-5 text-gold" />
 <h2 className="text-xl font-heading font-bold">Featured Articles</h2>
 </div>
 <div className="grid md:grid-cols-3 gap-6">
 {featuredPosts.map((post, i) => (
 <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
 <Card className="animate-fade-in h-full hover:shadow-xl transition-all hover:border-electric/30 cursor-pointer group">
 <div className="h-40 bg-gradient-to-br from-electric/20 to-purple/20 rounded-t-lg flex items-center justify-center">
 <BookOpen className="h-12 w-12 text-electric/40" />
 </div>
 <CardHeader className="pb-2">
 <Badge className={`${categoryColors[post.category] || 'bg-gray-500/10 text-gray-600 border-gray-500/20'} text-[10px] w-fit`}>
 {CATEGORIES.find(c => c.id === post.category)?.label || post.category}
 </Badge>
 <CardTitle className="text-base font-heading leading-tight mt-2 group-hover:text-electric transition-colors line-clamp-2">
 {post.title}
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-3">{post.excerpt}</p>
 <div className="flex items-center justify-between text-xs text-text-secondary">
 <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author.fullName}</span>
 <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
 </div>
 </CardContent>
 </Card>
 </div>
 ))}
 </div>
 </div>
 </section>
 )}

 {/* Category Filter + All Posts */}
 <section className="py-12 bg-muted/30">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="flex flex-wrap gap-2 mb-8">
 {CATEGORIES.map((cat) => (
 <Button
 key={cat.id}
 variant={category === cat.id ? 'default' : 'outline'}
 size="sm"
 onClick={() => { setCategory(cat.id); setPage(1); }}
 className={`gap-1.5 ${category === cat.id ? 'bg-navy text-white border-0' : ''}`}
 >
 <cat.icon className="h-3.5 w-3.5" /> {cat.label}
 </Button>
 ))}
 </div>

 <p className="text-sm text-text-secondary mb-6">
 {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
 </p>

 {paginated.length > 0 ? (
 <div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
 <>
 {paginated.map((post, i) => (
 <div key={post.id} layout>
 <Card className="h-full hover:shadow-lg transition-all hover:border-electric/30 group cursor-pointer">
 <CardHeader className="pb-2">
 <div className="flex items-center justify-between mb-2">
 <Badge className={`${categoryColors[post.category] || 'bg-gray-500/10 text-gray-600 border-gray-500/20'} text-[10px]`}>
 {CATEGORIES.find(c => c.id === post.category)?.label || post.category}
 </Badge>
 <span className="text-[10px] text-text-secondary flex items-center gap-1">
 <Clock className="h-3 w-3" /> 5 min read
 </span>
 </div>
 <CardTitle className="text-base font-heading leading-tight group-hover:text-electric transition-colors line-clamp-2">
 {post.title}
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
 {post.tags && (
 <div className="flex flex-wrap gap-1 mb-3">
 {JSON.parse(post.tags).slice(0, 3).map((tag: string) => (
 <Badge key={tag} variant="secondary" className="text-[9px]">#{tag}</Badge>
 ))}
 </div>
 )}
 <div className="flex items-center justify-between pt-3 border-t border-border">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded-full bg-navy flex items-center justify-center text-white text-[10px] font-bold">
 {post.author.fullName.split(' ').map(n => n[0]).join('')}
 </div>
 <span className="text-xs font-medium">{post.author.fullName}</span>
 </div>
 <span className="text-[10px] text-text-secondary">
 {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
 </span>
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
 <h3 className="text-lg font-heading font-semibold mb-2">No articles found</h3>
 <p className="text-sm text-text-secondary">Try a different search or category.</p>
 </Card>
 )}
 </div>
 </section>

 {/* Newsletter CTA */}
 <section className="py-20">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 <div className="max-w-2xl mx-auto text-center">
 <CampusCredLogo size={36} variant="dark" className="mx-auto mb-4" />
 <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
 Stay Updated with <span className="text-navy">CampusCred</span>
 </h2>
 <p className="text-text-secondary mb-6">
 Get the latest career tips, industry insights, and platform updates delivered to your inbox.
 </p>
 <div className="flex gap-2 max-w-md mx-auto">
 <Input placeholder="Enter your email" className="rounded-l-xl" />
 <Button className="bg-navy text-white border-0 rounded-r-xl px-6">Subscribe</Button>
 </div>
 </div>
 </div>
 </section>
 </main>
 <Footer />
 </div>
 );
}
