'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
 Search,
 Filter,
 GraduationCap,
 Code,
 Palette,
 Megaphone,
 BarChart3,
 PenTool,
 Microscope,
 Clock,
 Star,
 ChevronLeft,
 ChevronRight,
 ArrowRight,
 Sparkles,
 X,
 SlidersHorizontal,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { DEGREE_BRANCH_MAP, TASK_CATEGORIES, DIFFICULTY_LEVELS } from '@/lib/constants';

const categoryIcons: Record<string, React.ReactNode> = {
 development: <Code className="h-4 w-4" />,
 design: <Palette className="h-4 w-4" />,
 marketing: <Megaphone className="h-4 w-4" />,
 data: <BarChart3 className="h-4 w-4" />,
 writing: <PenTool className="h-4 w-4" />,
 research: <Microscope className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
 development: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
 design: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
 marketing: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
 data: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
 writing: 'bg-red-500/10 text-red-600 border-red-500/20',
 research: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
};

const difficultyColors: Record<string, string> = {
 Easy: 'bg-green-500/10 text-green-600 border-green-500/20',
 Medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
 Hard: 'bg-red-500/10 text-red-600 border-red-500/20',
};

// Mock tasks for when API returns empty
const MOCK_TASKS = [
 { id: '1', title: 'Build a REST API for E-Commerce', description: 'Design and implement a complete REST API with authentication, product management, and order processing for an e-commerce platform.', degree: 'B.Tech', branch: 'CSE', difficulty: 'Hard', points: 50, deadline: '2025-04-15', category: 'development', estimatedHours: '20', isActive: true, createdAt: '2025-01-10' },
 { id: '2', title: 'Design a Mobile App Landing Page', description: 'Create a modern, responsive landing page design for a fitness tracking mobile application with Figma prototypes.', degree: 'B.Des', branch: 'UI/UX Design', difficulty: 'Medium', points: 30, deadline: '2025-04-10', category: 'design', estimatedHours: '12', isActive: true, createdAt: '2025-01-12' },
 { id: '3', title: 'Social Media Campaign for Startup', description: 'Plan and create a 30-day social media campaign strategy for a fintech startup targeting Gen Z users.', degree: 'BBA', branch: 'Marketing', difficulty: 'Medium', points: 25, deadline: '2025-04-20', category: 'marketing', estimatedHours: '15', isActive: true, createdAt: '2025-01-15' },
 { id: '4', title: 'Customer Churn Prediction Model', description: 'Build a machine learning model to predict customer churn for a SaaS company using Python and scikit-learn.', degree: 'B.Tech', branch: 'Data Science', difficulty: 'Hard', points: 45, deadline: '2025-04-18', category: 'data', estimatedHours: '25', isActive: true, createdAt: '2025-01-18' },
 { id: '5', title: 'Technical Blog Writing: Cloud Computing', description: 'Write a 2000-word technical blog post explaining cloud computing concepts for non-technical readers.', degree: 'BCA', branch: 'Web Development', difficulty: 'Easy', points: 15, deadline: '2025-04-12', category: 'writing', estimatedHours: '8', isActive: true, createdAt: '2025-01-20' },
 { id: '6', title: 'Market Research: Electric Vehicle Adoption', description: 'Conduct a comprehensive market research study on EV adoption trends in Tier-2 Indian cities.', degree: 'MBA', branch: 'Marketing', difficulty: 'Medium', points: 35, deadline: '2025-04-25', category: 'research', estimatedHours: '18', isActive: true, createdAt: '2025-01-22' },
 { id: '7', title: 'React Dashboard with Charts', description: 'Build an interactive admin dashboard with real-time data visualization using React and Recharts.', degree: 'B.Tech', branch: 'IT', difficulty: 'Medium', points: 35, deadline: '2025-04-22', category: 'development', estimatedHours: '16', isActive: true, createdAt: '2025-01-25' },
 { id: '8', title: 'Brand Identity Design for Cafe', description: 'Create a complete brand identity package including logo, color palette, typography, and brand guidelines for a specialty cafe.', degree: 'BFA', branch: 'Applied Art', difficulty: 'Medium', points: 30, deadline: '2025-04-14', category: 'design', estimatedHours: '14', isActive: true, createdAt: '2025-01-28' },
 { id: '9', title: 'Python Automation Script Suite', description: 'Develop a suite of Python automation scripts for common DevOps tasks including log analysis, backup, and deployment.', degree: 'B.Tech', branch: 'CSE', difficulty: 'Easy', points: 20, deadline: '2025-04-08', category: 'development', estimatedHours: '10', isActive: true, createdAt: '2025-02-01' },
 { id: '10', title: 'SEO Audit Report for E-Commerce', description: 'Perform a complete SEO audit for an e-commerce website and provide actionable recommendations with priority levels.', degree: 'BBA', branch: 'Digital Marketing', difficulty: 'Easy', points: 20, deadline: '2025-04-16', category: 'marketing', estimatedHours: '10', isActive: true, createdAt: '2025-02-05' },
 { id: '11', title: 'Sentiment Analysis for Product Reviews', description: 'Build an NLP model to analyze sentiment from product reviews and generate visual insights using Python.', degree: 'M.Sc', branch: 'Computer Science', difficulty: 'Hard', points: 40, deadline: '2025-04-28', category: 'data', estimatedHours: '22', isActive: true, createdAt: '2025-02-08' },
 { id: '12', title: 'Blockchain Research Paper', description: 'Write a research paper analyzing the potential of blockchain technology in supply chain management in India.', degree: 'B.Tech', branch: 'CSE', difficulty: 'Hard', points: 45, deadline: '2025-05-01', category: 'research', estimatedHours: '30', isActive: true, createdAt: '2025-02-10' },
];

const ITEMS_PER_PAGE = 6;

export default function TasksPage() {
 const [search, setSearch] = useState('');
 const [degree, setDegree] = useState<string>('all');
 const [branch, setBranch] = useState<string>('all');
 const [category, setCategory] = useState<string>('all');
 const [difficulty, setDifficulty] = useState<string>('all');
 const [page, setPage] = useState(1);
 const [tasks, setTasks] = useState(MOCK_TASKS);
 const [showFilters, setShowFilters] = useState(false);

 const degrees = Object.keys(DEGREE_BRANCH_MAP);
 const branches = degree !== 'all' ? DEGREE_BRANCH_MAP[degree] || [] : Object.values(DEGREE_BRANCH_MAP).flat();

 useEffect(() => {
 fetch('/api/tasks?all=true')
 .then(res => res.json())
 .then(data => {
 if (data.tasks && data.tasks.length > 0) {
 setTasks(data.tasks.map((t: Record<string, unknown>) => ({
 ...t,
 category: t.category || 'development',
 estimatedHours: t.estimatedHours || '10',
 })));
 }
 })
 .catch(() => {});
 }, []);

 const filteredTasks = useMemo(() => {
 return tasks.filter((task) => {
 const matchSearch = !search ||
 task.title.toLowerCase().includes(search.toLowerCase()) ||
 task.description.toLowerCase().includes(search.toLowerCase());
 const matchDegree = degree === 'all' || task.degree === degree;
 const matchBranch = branch === 'all' || task.branch === branch;
 const matchCategory = category === 'all' || task.category === category;
 const matchDifficulty = difficulty === 'all' || task.difficulty === difficulty;
 return matchSearch && matchDegree && matchBranch && matchCategory && matchDifficulty;
 });
 }, [tasks, search, degree, branch, category, difficulty]);

 const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
 const paginatedTasks = filteredTasks.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

 const resetFilters = () => {
 setSearch('');
 setDegree('all');
 setBranch('all');
 setCategory('all');
 setDifficulty('all');
 setPage(1);
 };

 const activeFilterCount = [degree !== 'all', branch !== 'all', category !== 'all', difficulty !== 'all', !!search].filter(Boolean).length;

 return (
 <div className="min-h-screen flex flex-col bg-background">
 <Navbar />
 <main className="flex-1 pt-16">
 {/* Hero */}
 <section className="relative overflow-hidden py-16 md:py-24">
 <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy-light to-navy" />
 <div className="absolute inset-0 opacity-10">
 <div className="absolute top-20 left-10 w-72 h-72 bg-electric rounded-full blur-[120px]" />
 <div className="absolute bottom-10 right-10 w-72 h-72 bg-success rounded-full blur-[120px]" />
 </div>
 <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
 <div className="flex justify-center mb-4">
 <CampusCredLogo size={44} variant="white" />
 </div>
 <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
 Browse <span className="text-electric-light">Tasks</span>
 </h1>
 <p className="text-white/60 max-w-2xl mx-auto mb-8">
 Real-world tasks from top companies. Complete them, earn certificates, and build your CampusCred Score.
 </p>
 <div className="max-w-xl mx-auto relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
 <Input
 value={search}
 onChange={(e) => { setSearch(e.target.value); setPage(1); }}
 placeholder="Search tasks by title or keyword..."
 className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl backdrop-blur-sm"
 />
 </div>
 </div>
 </section>

 {/* Filters + Task Grid */}
 <section className="py-12">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
 {/* Filter Bar */}
 <div className="flex flex-wrap items-center gap-3 mb-8">
 <Button
 variant="outline"
 size="sm"
 onClick={() => setShowFilters(!showFilters)}
 className="gap-2"
 >
 <SlidersHorizontal className="h-4 w-4" />
 Filters
 {activeFilterCount > 0 && (
 <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-navy text-white border-0">
 {activeFilterCount}
 </Badge>
 )}
 </Button>

 {/* Category pills */}
 <div className="flex flex-wrap gap-2">
 <Button
 variant={category === 'all' ? 'default' : 'outline'}
 size="sm"
 onClick={() => { setCategory('all'); setPage(1); }}
 className={category === 'all' ? 'bg-navy text-white border-0' : ''}
 >
 All
 </Button>
 {TASK_CATEGORIES.map((cat) => (
 <Button
 key={cat.id}
 variant={category === cat.id ? 'default' : 'outline'}
 size="sm"
 onClick={() => { setCategory(cat.id); setPage(1); }}
 className={`gap-1.5 ${category === cat.id ? 'bg-navy text-white border-0' : ''}`}
 >
 {categoryIcons[cat.id]}
 <span className="hidden sm:inline">{cat.label}</span>
 </Button>
 ))}
 </div>

 {activeFilterCount > 0 && (
 <Button variant="ghost" size="sm" onClick={resetFilters} className="text-text-secondary gap-1 ml-auto">
 <X className="h-3 w-3" /> Clear
 </Button>
 )}
 </div>

 {/* Expanded Filters */}
 <>
 {showFilters && (
 <div
 className="mb-8 overflow-hidden"
 >
 <Card className="p-6">
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="space-y-2">
 <label className="text-xs font-medium text-text-secondary">Degree</label>
 <Select value={degree} onValueChange={(v) => { setDegree(v); setBranch('all'); setPage(1); }}>
 <SelectTrigger><SelectValue placeholder="All Degrees" /></SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Degrees</SelectItem>
 {degrees.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <label className="text-xs font-medium text-text-secondary">Branch</label>
 <Select value={branch} onValueChange={(v) => { setBranch(v); setPage(1); }}>
 <SelectTrigger><SelectValue placeholder="All Branches" /></SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Branches</SelectItem>
 {[...new Set(branches)].map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <label className="text-xs font-medium text-text-secondary">Difficulty</label>
 <Select value={difficulty} onValueChange={(v) => { setDifficulty(v); setPage(1); }}>
 <SelectTrigger><SelectValue placeholder="All Levels" /></SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Levels</SelectItem>
 {DIFFICULTY_LEVELS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 </div>
 </Card>
 </div>
 )}
 </>

 {/* Results Count */}
 <div className="flex items-center justify-between mb-6">
 <p className="text-sm text-text-secondary">
 Showing <span className="font-semibold text-foreground">{paginatedTasks.length}</span> of{' '}
 <span className="font-semibold text-foreground">{filteredTasks.length}</span> tasks
 </p>
 </div>

 {/* Task Grid */}
 {paginatedTasks.length > 0 ? (
 <div
 layout
 className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
 >
 <>
 {paginatedTasks.map((task, i) => (
 <div
 key={task.id}
 layout
 >
 <Card className="h-full hover:shadow-lg transition-all hover:border-electric/30 group cursor-pointer">
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between gap-2">
 <Badge className={`${categoryColors[task.category] || 'bg-gray-500/10 text-gray-600 border-gray-500/20'} text-[10px]`}>
 {categoryIcons[task.category]}
 {TASK_CATEGORIES.find(c => c.id === task.category)?.label || task.category}
 </Badge>
 <Badge variant="outline" className={difficultyColors[task.difficulty] || ''}>
 {task.difficulty}
 </Badge>
 </div>
 <CardTitle className="text-base font-heading leading-tight mt-2 group-hover:text-electric transition-colors line-clamp-2">
 {task.title}
 </CardTitle>
 </CardHeader>
 <CardContent>
 <p className="text-xs text-text-secondary leading-relaxed mb-4 line-clamp-2">
 {task.description}
 </p>
 <div className="flex flex-wrap gap-2 mb-4">
 <Badge variant="secondary" className="text-[10px]">
 <GraduationCap className="h-3 w-3 mr-1" /> {task.degree}
 </Badge>
 <Badge variant="secondary" className="text-[10px]">{task.branch}</Badge>
 {task.estimatedHours && (
 <Badge variant="secondary" className="text-[10px]">
 <Clock className="h-3 w-3 mr-1" /> {task.estimatedHours}h
 </Badge>
 )}
 </div>
 <div className="flex items-center justify-between pt-3 border-t border-border">
 <div className="flex items-center gap-1">
 <Star className="h-4 w-4 text-gold" />
 <span className="text-sm font-semibold">{task.points} pts</span>
 </div>
 <div className="flex items-center gap-1 text-xs text-text-secondary">
 <Clock className="h-3.5 w-3.5" />
 {new Date(task.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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
 <h3 className="text-lg font-heading font-semibold mb-2">No tasks found</h3>
 <p className="text-sm text-text-secondary mb-4">Try adjusting your filters or search query.</p>
 <Button variant="outline" onClick={resetFilters}>Clear All Filters</Button>
 </Card>
 )}

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-center gap-2 mt-8">
 <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
 <ChevronLeft className="h-4 w-4" />
 </Button>
 {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
 <Button
 key={p}
 variant={p === page ? 'default' : 'outline'}
 size="sm"
 onClick={() => setPage(p)}
 className={p === page ? 'bg-navy text-white border-0' : ''}
 >
 {p}
 </Button>
 ))}
 <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
 <ChevronRight className="h-4 w-4" />
 </Button>
 </div>
 )}
 </div>
 </section>
 </main>
 <Footer />
 </div>
 );
}
