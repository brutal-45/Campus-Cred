'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store';
import {
  Coins,
  Clock,
  ArrowRight,
  FileText,
  Zap,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string;
  degree: string;
  branch: string;
  difficulty: string;
  points: number;
  deadline: string;
  taskKitUrl?: string;
  createdAt: string;
}

const difficultyConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  Easy: {
    color: 'text-green-700',
    bg: 'bg-green-100 border-green-200',
    icon: <Zap className="w-3 h-3" />,
  },
  Medium: {
    color: 'text-yellow-700',
    bg: 'bg-yellow-100 border-yellow-200',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  Hard: {
    color: 'text-red-700',
    bg: 'bg-red-100 border-red-200',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
};

/**
 * AvailableTasks
 *
 * Design rules:
 * - Cards use cc-card style (hover: translateY -2px, shadow increase)
 * - Skeleton loading states with shimmer
 * - Simple fade-in CSS animation
 * - No framer-motion whileHover (cc-card handles hover)
 */
export function AvailableTasks() {
  const { user, token, setSelectedTaskId, navigate } = useAppStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', user?.degree, user?.branch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (user?.degree) params.set('degree', user.degree);
      if (user?.branch) params.set('branch', user.branch);
      const res = await fetch(`/api/tasks?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
    enabled: true,
  });

  const tasks: Task[] = data?.tasks || [];

  const handleStartTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    navigate('task');
  };

  const getTimeLeft = (deadline: string) => {
    try {
      return formatDistanceToNow(new Date(deadline), { addSuffix: true });
    } catch {
      return 'Deadline passed';
    }
  };

  const isDeadlineSoon = (deadline: string) => {
    const hoursLeft = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursLeft > 0 && hoursLeft < 48;
  };

  // Loading state — skeleton shimmer
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border" style={{ borderColor: '#E2E8F0' }}>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-3/4 mb-2 skeleton-shimmer" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full skeleton-shimmer" />
                <Skeleton className="h-5 w-20 rounded-full skeleton-shimmer" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <Skeleton className="h-12 w-full mb-3 skeleton-shimmer" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16 skeleton-shimmer" />
                <Skeleton className="h-4 w-24 skeleton-shimmer" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full rounded-md skeleton-shimmer" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-10 h-10 mx-auto text-danger mb-3" />
        <p className="text-text-secondary">Failed to load tasks. Please try again.</p>
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Search className="w-8 h-8 text-text-secondary" />
        </div>
        <h3 className="text-lg font-semibold font-heading mb-2 text-navy">No tasks available</h3>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          There are no tasks matching your degree and branch right now. Check back later or browse all available tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task, index) => {
        const diff = difficultyConfig[task.difficulty] || difficultyConfig.Medium;
        const deadlineSoon = isDeadlineSoon(task.deadline);

        return (
          <div
            key={task.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Card className="cc-card h-full flex flex-col">
              <CardHeader className="pb-3">
                <h3 className="font-bold font-heading text-foreground leading-snug mb-2 line-clamp-2">
                  {task.title}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {task.degree}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {task.branch}
                  </Badge>
                  <Badge
                    className={`text-[10px] px-1.5 py-0 border ${diff.bg} ${diff.color}`}
                    variant="outline"
                  >
                    {diff.icon}
                    {task.difficulty}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pb-3 flex-1">
                <p className="text-sm text-text-secondary line-clamp-3 mb-3">
                  {task.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm font-semibold text-electric">
                    <Coins className="w-4 h-4" />
                    <span>{task.points} pts</span>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      deadlineSoon ? 'text-danger font-medium' : 'text-text-secondary'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{getTimeLeft(task.deadline)}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  onClick={() => handleStartTask(task.id)}
                  className="w-full btn-primary text-white gap-1.5 font-semibold"
                  size="sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Start Task
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
