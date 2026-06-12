'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { DEGREES, DEGREE_BRANCH_MAP } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Edit3,
  Trash2,
  ListTodo,
  Calendar,
  Star,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  degree: string;
  branch: string;
  difficulty: string;
  points: number;
  deadline: string;
  isActive: boolean;
  createdAt: string;
}

interface TaskFormData {
  title: string;
  description: string;
  degree: string;
  branch: string;
  difficulty: string;
  points: string;
  deadline: string;
}

const emptyForm: TaskFormData = {
  title: '',
  description: '',
  degree: '',
  branch: '',
  difficulty: 'Medium',
  points: '10',
  deadline: '',
};

export function TaskManager() {
  const { token } = useAppStore();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editTask, setEditTask] = React.useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<TaskFormData>(emptyForm);
  const [submitting, setSubmitting] = React.useState(false);

  const fetchTasks = React.useCallback(async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/tasks?all=true', { headers });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || data || []);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async () => {
    if (!formData.title || !formData.description || !formData.degree || !formData.branch || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const body = {
        title: formData.title,
        description: formData.description,
        degree: formData.degree,
        branch: formData.branch,
        difficulty: formData.difficulty,
        points: parseInt(formData.points) || 10,
        deadline: new Date(formData.deadline).toISOString(),
      };

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Task created successfully');
        setShowForm(false);
        setFormData(emptyForm);
        fetchTasks();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create task');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTask = async () => {
    if (!editTask || !formData.title || !formData.description || !formData.degree || !formData.branch || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const body = {
        title: formData.title,
        description: formData.description,
        degree: formData.degree,
        branch: formData.branch,
        difficulty: formData.difficulty,
        points: parseInt(formData.points) || 10,
        deadline: new Date(formData.deadline).toISOString(),
      };

      const res = await fetch(`/api/tasks/${editTask.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success('Task updated successfully');
        setEditTask(null);
        setFormData(emptyForm);
        fetchTasks();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update task');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;

    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/tasks/${deleteTaskId}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        toast.success('Task deleted successfully');
        setDeleteTaskId(null);
        fetchTasks();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete task');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const openEditForm = (task: Task) => {
    setEditTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      degree: task.degree,
      branch: task.branch,
      difficulty: task.difficulty,
      points: task.points.toString(),
      deadline: new Date(task.deadline).toISOString().split('T')[0],
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Hard': return 'bg-danger/10 text-danger border-danger/20';
      case 'Medium': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-success/10 text-success border-success/20';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isDeadlineSoon = (deadline: string) => {
    const daysLeft = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 3 && daysLeft > 0;
  };

  const isExpired = (deadline: string) => {
    return new Date(deadline).getTime() < Date.now();
  };

  const branches = formData.degree ? (DEGREE_BRANCH_MAP[formData.degree] || []) : [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground">Task Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Create and manage tasks for students</p>
        </div>
        <Button
          onClick={() => {
            setFormData(emptyForm);
            setShowForm(true);
          }}
          className="btn-primary text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Task
        </Button>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ListTodo className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No tasks found. Create one to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-sm font-bold flex-1">{task.title}</h3>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditForm(task)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => setDeleteTaskId(task.id)}
                      className="p-1.5 rounded-lg hover:bg-danger/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-danger" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {task.description}
                </p>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <Badge variant="outline" className="text-[10px]">
                    {task.degree}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {task.branch}
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] ${getDifficultyColor(task.difficulty)}`}>
                    {task.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-warning" />
                      {task.points} pts
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(task.deadline)}
                    </span>
                  </div>
                  {isExpired(task.deadline) ? (
                    <Badge variant="outline" className="text-[9px] bg-danger/10 text-danger border-danger/20">
                      Expired
                    </Badge>
                  ) : isDeadlineSoon(task.deadline) ? (
                    <Badge variant="outline" className="text-[9px] bg-warning/10 text-warning border-warning/20">
                      <Clock className="w-2.5 h-2.5 mr-0.5" />
                      Due Soon
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] bg-success/10 text-success border-success/20">
                      Active
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit task dialog */}
      <Dialog open={showForm || !!editTask} onOpenChange={() => { setShowForm(false); setEditTask(null); setFormData(emptyForm); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium">Title *</Label>
              <Input
                placeholder="e.g., Build a Portfolio Website"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Description *</Label>
              <Textarea
                placeholder="Describe the task requirements..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Degree *</Label>
                <Select
                  value={formData.degree}
                  onValueChange={(val) => setFormData({ ...formData, degree: val, branch: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select degree" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEGREES.map((deg) => (
                      <SelectItem key={deg} value={deg}>
                        {deg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Branch *</Label>
                <Select
                  value={formData.branch}
                  onValueChange={(val) => setFormData({ ...formData, branch: val })}
                  disabled={!formData.degree}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((br) => (
                      <SelectItem key={br} value={br}>
                        {br}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(val) => setFormData({ ...formData, difficulty: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Points</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Deadline *</Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditTask(null); setFormData(emptyForm); }}>
              Cancel
            </Button>
            <Button
              onClick={editTask ? handleEditTask : handleCreateTask}
              disabled={submitting}
              className="btn-primary text-white"
            >
              {submitting ? 'Saving...' : editTask ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTaskId} onOpenChange={() => setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone. Any existing submissions for this task will remain in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-danger hover:bg-danger/90 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
