'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store';
import {
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  Hourglass,
  ChevronDown,
  ChevronUp,
  FileText,
  Inbox,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';

interface Submission {
  id: string;
  taskId: string;
  taskTitle: string;
  taskPoints: number;
  status: string;
  feedback?: string | null;
  submittedAt: string;
  reviewedAt?: string | null;
  pointsEarned: number;
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; border: string }> = {
  Pending: {
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    border: 'border-yellow-200',
    icon: <Hourglass className="w-3.5 h-3.5" />,
  },
  'Under Review': {
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    icon: <Eye className="w-3.5 h-3.5" />,
  },
  Approved: {
    color: 'text-green-700',
    bg: 'bg-green-100',
    border: 'border-green-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  Rejected: {
    color: 'text-red-700',
    bg: 'bg-red-100',
    border: 'border-red-200',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const filterTabs = ['All', 'Pending', 'Under Review', 'Approved', 'Rejected'];

/**
 * MySubmissions
 *
 * Design rules:
 * - Cards use standard card style
 * - Simple CSS fade-in animation (no framer-motion)
 * - Expand/collapse feedback: simple CSS transition
 * - Skeleton loading with shimmer
 * - 4px spacing grid
 */
export function MySubmissions() {
  const { token } = useAppStore();
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['submissions', activeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeFilter !== 'All') params.set('status', activeFilter);
      const res = await fetch(`/api/student/submissions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch submissions');
      return res.json();
    },
    enabled: !!token,
  });

  const submissions: Submission[] = data?.submissions || [];

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 ${
              activeFilter === tab
                ? 'btn-primary text-white shadow-md'
                : 'bg-muted text-text-secondary hover:bg-muted/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border" style={{ borderColor: '#E2E8F0' }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2 skeleton-shimmer" />
                    <Skeleton className="h-3 w-32 skeleton-shimmer" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full skeleton-shimmer" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && submissions.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Inbox className="w-8 h-8 text-text-secondary" />
          </div>
          <h3 className="text-lg font-semibold font-heading mb-2 text-navy">
            {activeFilter === 'All' ? 'No submissions yet' : `No ${activeFilter.toLowerCase()} submissions`}
          </h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            {activeFilter === 'All'
              ? 'Start working on tasks to see your submissions here. Browse available tasks and begin your journey!'
              : `You don't have any ${activeFilter.toLowerCase()} submissions at the moment.`}
          </p>
        </div>
      )}

      {/* Submissions list */}
      {!isLoading && submissions.length > 0 && (
        <div className="space-y-3">
          {submissions.map((submission, index) => {
            const config = statusConfig[submission.status] || statusConfig.Pending;
            const isExpanded = expandedId === submission.id;

            return (
              <div
                key={submission.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <Card className="border hover:border-electric/20 transition-colors overflow-hidden" style={{ borderColor: '#E2E8F0' }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-4 h-4 text-electric flex-shrink-0" />
                          <h4 className="font-semibold text-sm truncate">
                            {submission.taskTitle}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Submitted {format(new Date(submission.submittedAt), 'dd MMM yyyy')}
                          </span>
                          {submission.pointsEarned > 0 && (
                            <span className="text-success font-medium">
                              +{submission.pointsEarned} pts earned
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${config.bg} ${config.color} ${config.border} border text-[10px] px-2 py-0.5 gap-1`}
                          variant="outline"
                        >
                          {config.icon}
                          {submission.status}
                        </Badge>

                        {submission.feedback && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() =>
                              setExpandedId(isExpanded ? null : submission.id)
                            }
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expandable feedback — CSS transition */}
                    {isExpanded && submission.feedback && (
                      <div className="mt-3 p-3 rounded-lg border" style={{ backgroundColor: 'rgba(241,245,249,0.50)', borderColor: '#E2E8F0' }}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-electric" />
                          <span className="text-xs font-semibold text-foreground">
                            Reviewer Feedback
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {submission.feedback}
                        </p>
                        {submission.reviewedAt && (
                          <p className="text-[10px] text-text-secondary mt-2">
                            Reviewed on {format(new Date(submission.reviewedAt), 'dd MMM yyyy')}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
