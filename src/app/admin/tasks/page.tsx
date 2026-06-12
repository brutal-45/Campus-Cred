'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Search, ListTodo, Plus, Pencil, Trash2, ToggleLeft, Calendar,
  Clock, Award, AlertTriangle, CheckCircle, XCircle, Tag,
} from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  id: string; title: string; description: string; degree: string; branch: string;
  difficulty: string; points: number; deadline: string; category: string;
  estimatedHours: string; isActive: boolean; isChallenge: boolean; submissionCount: number;
}

const mockTasks: Task[] = [
  { id: '1', title: 'Build a REST API for Todo App', description: 'Create a complete REST API with CRUD operations', degree: 'B.Tech', branch: 'Computer Science', difficulty: 'Medium', points: 50, deadline: '2025-03-15T10:00:00Z', category: 'development', estimatedHours: '8', isActive: true, isChallenge: false, submissionCount: 24 },
  { id: '2', title: 'Design Mobile App UI Kit', description: 'Create a comprehensive UI kit for a fitness app', degree: 'B.Des', branch: 'UX Design', difficulty: 'Hard', points: 75, deadline: '2025-03-20T10:00:00Z', category: 'design', estimatedHours: '12', isActive: true, isChallenge: false, submissionCount: 18 },
  { id: '3', title: 'Analyze Sales Dataset', description: 'Perform EDA and build a predictive model', degree: 'B.Tech', branch: 'Data Science', difficulty: 'Hard', points: 80, deadline: '2025-03-18T10:00:00Z', category: 'data', estimatedHours: '10', isActive: true, isChallenge: false, submissionCount: 12 },
  { id: '4', title: 'Write Technical Blog Post', description: 'Write a 1500-word blog on AI in Education', degree: 'Any', branch: 'Any', difficulty: 'Easy', points: 30, deadline: '2025-03-25T10:00:00Z', category: 'writing', estimatedHours: '4', isActive: true, isChallenge: false, submissionCount: 35 },
  { id: '5', title: 'Daily Challenge: Binary Search', description: 'Implement binary search with edge cases', degree: 'Any', branch: 'Any', difficulty: 'Easy', points: 20, deadline: '2025-03-10T10:00:00Z', category: 'development', estimatedHours: '1', isActive: false, isChallenge: true, submissionCount: 56 },
  { id: '6', title: 'Create Marketing Campaign', description: 'Design a digital marketing campaign for a startup', degree: 'MBA', branch: 'Marketing', difficulty: 'Medium', points: 60, deadline: '2025-03-22T10:00:00Z', category: 'marketing', estimatedHours: '6', isActive: true, isChallenge: false, submissionCount: 15 },
];

export default function AdminTasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>(mockTasks);
  const [search, setSearch] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState('all');
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [form, setForm] = React.useState({ title: '', description: '', degree: '', branch: '', difficulty: 'Medium', points: 30, deadline: '', category: 'development', estimatedHours: '4' });

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleToggleActive = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
    const task = tasks.find(t => t.id === id);
    toast.success(`Task ${task?.isActive ? 'deactivated' : 'activated'}`);
  };

  const handleDelete = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.success('Task deleted');
  };

  const handleCreate = () => {
    const newTask: Task = {
      ...form, id: Date.now().toString(), isChallenge: false,
      isActive: true, submissionCount: 0, deadline: form.deadline || new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    setShowCreateDialog(false);
    setForm({ title: '', description: '', degree: '', branch: '', difficulty: 'Medium', points: 30, deadline: '', category: 'development', estimatedHours: '4' });
    toast.success('Task created successfully');
  };

  const handleEdit = () => {
    if (!editingTask) return;
    setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...form } : t));
    setEditingTask(null);
    toast.success('Task updated');
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setForm({ title: task.title, description: task.description, degree: task.degree, branch: task.branch, difficulty: task.difficulty, points: task.points, deadline: task.deadline.split('T')[0], category: task.category, estimatedHours: task.estimatedHours });
  };

  const getDifficultyColor = (d: string) => {
    switch (d) { case 'Easy': return 'bg-success/10 text-success'; case 'Medium': return 'bg-warning/10 text-warning'; case 'Hard': return 'bg-danger/10 text-danger'; default: return 'bg-muted text-text-secondary'; }
  };

  const getCategoryIcon = (c: string) => {
    switch (c) { case 'development': return '💻'; case 'design': return '🎨'; case 'data': return '📊'; case 'marketing': return '📢'; case 'writing': return '✍️'; default: return '📝'; }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-electric" /> Task Management
          </h2>
          <p className="text-sm text-text-secondary mt-1">Create, edit, and manage tasks</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-navy text-white gap-2">
          <Plus className="w-4 h-4" /> Create Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Tasks', value: tasks.length, color: 'text-electric' },
          { label: 'Active', value: tasks.filter(t => t.isActive).length, color: 'text-success' },
          { label: 'Inactive', value: tasks.filter(t => !t.isActive).length, color: 'text-text-secondary' },
          { label: 'Total Submissions', value: tasks.reduce((a, t) => a + t.submissionCount, 0), color: 'text-purple' },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-4 text-center"><p className="text-xs text-text-secondary">{s.label}</p><p className={`text-2xl font-bold ${s.color}`}>{s.value}</p></CardContent></Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="data">Data</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="writing">Writing</SelectItem>
              </SelectContent>
            </Select>
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
                  <TableHead>Task</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden sm:table-cell">Difficulty</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead className="hidden lg:table-cell">Submissions</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((task, idx) => (
                  <tr key={task.id}
                    className="animate-fade-in hover:bg-muted/50 transition-colors border-b"
                    style={{ animationDelay: `${idx * 30}ms`, borderColor: '#E2E8F0' }}
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1">
                          {task.isChallenge && <Badge className="text-[8px] bg-warning/10 text-warning border-0 px-1">⚡ Challenge</Badge>}
                          {task.title}
                        </p>
                        <p className="text-[10px] text-text-secondary">{task.degree} &bull; {task.branch}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell"><span className="text-sm">{getCategoryIcon(task.category)} {task.category}</span></TableCell>
                    <TableCell className="hidden sm:table-cell"><Badge className={`text-[10px] border-0 ${getDifficultyColor(task.difficulty)}`}>{task.difficulty}</Badge></TableCell>
                    <TableCell><span className="text-sm font-semibold">{task.points}</span></TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{task.submissionCount}</TableCell>
                    <TableCell><Switch checked={task.isActive} onCheckedChange={() => handleToggleActive(task.id)} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(task)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:bg-danger/10" onClick={() => handleDelete(task.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={showCreateDialog || !!editingTask} onOpenChange={() => { setShowCreateDialog(false); setEditingTask(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Task description" rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Degree</Label><Input value={form.degree} onChange={e => setForm(f => ({ ...f, degree: e.target.value }))} placeholder="e.g., B.Tech" /></div>
              <div className="space-y-2"><Label>Branch</Label><Input value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} placeholder="e.g., CSE" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={v => setForm(f => ({ ...f, difficulty: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Easy">Easy</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="Hard">Hard</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Points</Label><Input type="number" value={form.points} onChange={e => setForm(f => ({ ...f, points: parseInt(e.target.value) || 0 }))} /></div>
              <div className="space-y-2"><Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="development">Development</SelectItem><SelectItem value="design">Design</SelectItem><SelectItem value="data">Data</SelectItem><SelectItem value="marketing">Marketing</SelectItem><SelectItem value="writing">Writing</SelectItem><SelectItem value="research">Research</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Estimated Hours</Label><Input value={form.estimatedHours} onChange={e => setForm(f => ({ ...f, estimatedHours: e.target.value }))} placeholder="e.g., 4" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreateDialog(false); setEditingTask(null); }}>Cancel</Button>
            <Button onClick={editingTask ? handleEdit : handleCreate} className="bg-navy text-white">
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
