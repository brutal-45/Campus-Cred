'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { DEGREES, DEGREE_BRANCH_MAP, TASK_CATEGORIES, DIFFICULTY_LEVELS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from '@/components/ui/select';
import { X, Plus, ClipboardList, Sparkles, Clock, Target, Zap, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface FormData {
 title: string;
 description: string;
 category: string;
 difficulty: string;
 degree: string;
 selectedBranches: string[];
 points: number;
 deadline: string;
 taskKitUrl: string;
 estimatedHours: string;
}

export default function PostTaskPage() {
 const { token } = useAppStore();
 const [submitting, setSubmitting] = React.useState(false);
 const [success, setSuccess] = React.useState(false);
 const [formData, setFormData] = React.useState<FormData>({
 title: '',
 description: '',
 category: '',
 difficulty: 'Medium',
 degree: '',
 selectedBranches: [],
 points: 50,
 deadline: '',
 taskKitUrl: '',
 estimatedHours: '',
 });

 const availableBranches = React.useMemo(() => {
 return DEGREE_BRANCH_MAP[formData.degree] || [];
 }, [formData.degree]);

 const toggleBranch = (branch: string) => {
 setFormData((prev) => ({
 ...prev,
 selectedBranches: prev.selectedBranches.includes(branch)
 ? prev.selectedBranches.filter((b) => b !== branch)
 : [...prev.selectedBranches, branch],
 }));
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();

 if (!formData.title || !formData.description || !formData.category || !formData.degree || formData.selectedBranches.length === 0 || !formData.deadline) {
 toast.error('Please fill in all required fields');
 return;
 }

 setSubmitting(true);
 try {
 const headers: Record<string, string> = {
 'Content-Type': 'application/json',
 };
 if (token) headers['Authorization'] = `Bearer ${token}`;

 const res = await fetch('/api/tasks', {
 method: 'POST',
 headers,
 body: JSON.stringify({
 title: formData.title,
 description: formData.description,
 category: formData.category,
 difficulty: formData.difficulty,
 degree: formData.degree,
 branch: formData.selectedBranches[0],
 branches: formData.selectedBranches,
 points: formData.points,
 deadline: new Date(formData.deadline).toISOString(),
 taskKitUrl: formData.taskKitUrl || undefined,
 estimatedHours: formData.estimatedHours || undefined,
 }),
 });

 if (res.ok) {
 toast.success('Task posted successfully!');
 setSuccess(true);
 setTimeout(() => setSuccess(false), 3000);
 } else {
 const data = await res.json();
 toast.error(data.error || 'Failed to post task');
 }
 } catch {
 toast.error('Something went wrong');
 } finally {
 setSubmitting(false);
 }
 };

 if (success) {
 return (
 <div
 className="animate-fade-in flex flex-col items-center justify-center py-20"
 >
 <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
 <CheckCircle2 className="w-10 h-10 text-emerald-600" />
 </div>
 <h2 className="text-2xl font-bold font-heading">Task Posted!</h2>
 <p className="text-sm text-text-secondary mt-2">Your task is now visible to eligible students</p>
 <div className="flex gap-3 mt-6">
 <Link href="/company/dashboard">
 <Button variant="outline">Go to Dashboard</Button>
 </Link>
 <Button onClick={() => { setSuccess(false); setFormData({ title: '', description: '', category: '', difficulty: 'Medium', degree: '', selectedBranches: [], points: 50, deadline: '', taskKitUrl: '', estimatedHours: '' }); }} className="bg-navy text-white gap-2">
 <Plus className="w-4 h-4" />
 Post Another Task
 </Button>
 </div>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl font-bold font-heading text-foreground">Post New Task</h1>
 <p className="text-sm text-text-secondary mt-1">Create a task for students to complete and earn certificates</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Main form */}
 <div className="lg:col-span-2">
 <Card>
 <CardContent className="p-6">
 <form onSubmit={handleSubmit} className="space-y-6">
 {/* Title */}
 <div className="space-y-2">
 <Label className="text-sm font-medium">
 Task Title <span className="text-red-500">*</span>
 </Label>
 <div className="relative">
 <ClipboardList className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
 <Input
 placeholder="e.g., Build a REST API for E-Commerce"
 value={formData.title}
 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 className="pl-10"
 />
 </div>
 </div>

 {/* Description */}
 <div className="space-y-2">
 <Label className="text-sm font-medium">
 Description <span className="text-red-500">*</span>
 </Label>
 <Textarea
 placeholder="Describe the task in detail, including deliverables, expected outcomes, and evaluation criteria..."
 value={formData.description}
 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
 rows={5}
 />
 </div>

 {/* Category & Difficulty */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label className="text-sm font-medium flex items-center gap-1">
 <Target className="w-3.5 h-3.5" /> Category <span className="text-red-500">*</span>
 </Label>
 <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
 <SelectTrigger>
 <SelectValue placeholder="Select category" />
 </SelectTrigger>
 <SelectContent>
 {TASK_CATEGORIES.map((cat) => (
 <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="space-y-2">
 <Label className="text-sm font-medium flex items-center gap-1">
 <Zap className="w-3.5 h-3.5" /> Difficulty
 </Label>
 <div className="flex gap-2">
 {DIFFICULTY_LEVELS.map((level) => (
 <button
 key={level}
 type="button"
 onClick={() => setFormData({ ...formData, difficulty: level })}
 className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
 formData.difficulty === level
 ? level === 'Easy' ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
 : level === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-300'
 : 'bg-red-100 text-red-700 border-red-300'
 : 'bg-muted/50 text-text-secondary border-border hover:bg-muted'
 }`}
 >
 {level}
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Degree */}
 <div className="space-y-2">
 <Label className="text-sm font-medium">
 Target Degree <span className="text-red-500">*</span>
 </Label>
 <Select value={formData.degree} onValueChange={(val) => setFormData({ ...formData, degree: val, selectedBranches: [] })}>
 <SelectTrigger>
 <SelectValue placeholder="Select degree" />
 </SelectTrigger>
 <SelectContent>
 {DEGREES.map((deg) => (
 <SelectItem key={deg} value={deg}>{deg}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 {/* Branches multi-select */}
 <div className="space-y-2">
 <Label className="text-sm font-medium">
 Target Branches <span className="text-red-500">*</span>
 </Label>
 <p className="text-xs text-text-secondary">
 {formData.degree ? 'Select branches for this task' : 'Select a degree first'}
 </p>
 {availableBranches.length > 0 && (
 <div className="flex flex-wrap gap-2">
 {availableBranches.map((branch) => {
 const isSelected = formData.selectedBranches.includes(branch);
 return (
 <button
 key={branch}
 type="button"
 onClick={() => toggleBranch(branch)}
 className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
 isSelected
 ? 'bg-purple/10 text-purple border-purple/30 shadow-sm'
 : 'bg-muted/50 text-text-secondary border-border hover:bg-muted'
 }`}
 >
 {branch}
 </button>
 );
 })}
 </div>
 )}
 {formData.selectedBranches.length > 0 && (
 <div className="flex flex-wrap gap-1 mt-2">
 {formData.selectedBranches.map((br) => (
 <Badge key={br} variant="secondary" className="text-[10px] gap-1">
 {br}
 <button type="button" onClick={() => toggleBranch(br)} className="hover:text-red-500">
 <X className="w-2.5 h-2.5" />
 </button>
 </Badge>
 ))}
 </div>
 )}
 </div>

 {/* Points, Deadline, Estimated Hours */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="space-y-2">
 <Label className="text-sm font-medium">Points</Label>
 <Input
 type="number"
 value={formData.points}
 onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
 min={10}
 max={200}
 />
 </div>

 <div className="space-y-2">
 <Label className="text-sm font-medium flex items-center gap-1">
 <Clock className="w-3.5 h-3.5" /> Deadline <span className="text-red-500">*</span>
 </Label>
 <Input
 type="date"
 value={formData.deadline}
 onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
 min={new Date().toISOString().split('T')[0]}
 />
 </div>

 <div className="space-y-2">
 <Label className="text-sm font-medium">Estimated Hours</Label>
 <Input
 placeholder="e.g., 8-10"
 value={formData.estimatedHours}
 onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
 />
 </div>
 </div>

 {/* Task Kit URL */}
 <div className="space-y-2">
 <Label className="text-sm font-medium">Task Kit URL (optional)</Label>
 <Input
 placeholder="Link to starter code, assets, or resources"
 value={formData.taskKitUrl}
 onChange={(e) => setFormData({ ...formData, taskKitUrl: e.target.value })}
 />
 </div>

 {/* Submit */}
 <Button type="submit" disabled={submitting} className="w-full bg-navy text-white gap-2 py-3">
 {submitting ? (
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : (
 <>
 <Plus className="w-4 h-4" />
 Post Task
 </>
 )}
 </Button>
 </form>
 </CardContent>
 </Card>
 </div>

 {/* Sidebar tips */}
 <div className="space-y-4">
 <Card>
 <CardContent className="p-5">
 <h3 className="text-sm font-bold font-heading mb-3 flex items-center gap-2">
 <Sparkles className="w-4 h-4 text-amber-500" />
 Tips for Great Tasks
 </h3>
 <ul className="space-y-2 text-xs text-text-secondary">
 <li className="flex gap-2">
 <span className="text-emerald-500">✓</span>
 Be specific about deliverables and evaluation criteria
 </li>
 <li className="flex gap-2">
 <span className="text-emerald-500">✓</span>
 Set realistic deadlines (7-14 days works best)
 </li>
 <li className="flex gap-2">
 <span className="text-emerald-500">✓</span>
 Provide starter code or resources via Task Kit URL
 </li>
 <li className="flex gap-2">
 <span className="text-emerald-500">✓</span>
 Assign appropriate points based on difficulty
 </li>
 <li className="flex gap-2">
 <span className="text-emerald-500">✓</span>
 Mention the tech stack students should use
 </li>
 </ul>
 </CardContent>
 </Card>

 <Card>
 <CardContent className="p-5">
 <h3 className="text-sm font-bold font-heading mb-3">Points Guide</h3>
 <div className="space-y-2">
 {[
 { level: 'Easy', points: '10-30', color: 'bg-emerald-100 text-emerald-700' },
 { level: 'Medium', points: '30-70', color: 'bg-amber-100 text-amber-700' },
 { level: 'Hard', points: '70-150', color: 'bg-red-100 text-red-700' },
 ].map((guide) => (
 <div key={guide.level} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
 <Badge className={`text-[10px] ${guide.color}`}>{guide.level}</Badge>
 <span className="text-xs text-text-secondary">{guide.points} points</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 );
}
