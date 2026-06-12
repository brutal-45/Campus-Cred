'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  Star,
  FileText,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';

interface Submission {
  id: string;
  status: string;
  description?: string;
  externalLink?: string;
  fileUrl?: string;
  feedback?: string;
  rating?: number | null;
  submittedAt: string;
  reviewedAt?: string;
  student: { id: string; fullName: string; email: string; college?: string; branch?: string; degree?: string; points: number; level: string };
  task: { id: string; title: string; points: number; difficulty: string };
}

export function ReviewQueue() {
  const { token } = useAppStore();
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState('Pending');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [reviewDialogId, setReviewDialogId] = React.useState<string | null>(null);
  const [reviewAction, setReviewAction] = React.useState<'approve' | 'reject'>('approve');
  const [reviewFeedback, setReviewFeedback] = React.useState('');
  const [reviewRating, setReviewRating] = React.useState(0);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const fetchSubmissions = React.useCallback(async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'All') {
        params.set('status', statusFilter);
      }

      const res = await fetch(`/api/admin/submissions?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || data || []);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, token]);

  React.useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleReview = async () => {
    if (!reviewDialogId) return;

    if (reviewAction === 'reject' && !reviewFeedback.trim()) {
      toast.error('Feedback is required when rejecting a submission');
      return;
    }

    if (reviewAction === 'approve' && reviewRating === 0) {
      toast.error('Please provide a rating (1-5 stars)');
      return;
    }

    setActionLoading(reviewDialogId);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const endpoint = reviewAction === 'approve'
        ? `/api/admin/submissions/${reviewDialogId}/approve`
        : `/api/admin/submissions/${reviewDialogId}/reject`;

      const body = reviewAction === 'approve'
        ? { rating: reviewRating }
        : { feedback: reviewFeedback, rating: reviewRating };

      const res = await fetch(endpoint, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(reviewAction === 'approve' ? 'Submission approved!' : 'Submission rejected with feedback');
        setReviewDialogId(null);
        setReviewFeedback('');
        setReviewRating(0);
        fetchSubmissions();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to process review');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'Rejected': return <XCircle className="w-4 h-4 text-danger" />;
      case 'Under Review': return <Eye className="w-4 h-4 text-warning" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-success/10 text-success border-success/20';
      case 'Rejected': return 'bg-danger/10 text-danger border-danger/20';
      case 'Under Review': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground">Review Submissions</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review student submissions and provide feedback
        </p>
      </div>

      {/* Status tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="bg-muted">
          <TabsTrigger value="Pending" className="text-xs">Pending</TabsTrigger>
          <TabsTrigger value="Under Review" className="text-xs">Under Review</TabsTrigger>
          <TabsTrigger value="Approved" className="text-xs">Approved</TabsTrigger>
          <TabsTrigger value="Rejected" className="text-xs">Rejected</TabsTrigger>
          <TabsTrigger value="All" className="text-xs">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Submissions list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                <div className="h-3 bg-muted rounded w-2/3 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No {statusFilter === 'All' ? '' : statusFilter.toLowerCase() + ' '}submissions to review
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
          {submissions.map((sub) => {
            const isExpanded = expandedId === sub.id;
            return (
              <Card key={sub.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar className="w-9 h-9 mt-0.5">
                        <AvatarFallback className="bg-purple/10 text-purple text-xs font-semibold">
                          {sub.student.fullName.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{sub.student.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{sub.student.email}</p>
                        <p className="text-sm text-foreground mt-1 font-medium">{sub.task.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {sub.task.points} pts • {formatDate(sub.submittedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] ${getStatusColor(sub.status)}`}>
                        <span className="mr-1">{getStatusIcon(sub.status)}</span>
                        {sub.status}
                      </Badge>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                        className="p-1 rounded hover:bg-muted transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      {sub.description && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                          <p className="text-sm bg-muted/50 rounded-lg p-3">{sub.description}</p>
                        </div>
                      )}
                      {sub.externalLink && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Link</p>
                          <a
                            href={sub.externalLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-electric hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {sub.externalLink}
                          </a>
                        </div>
                      )}
                      {sub.feedback && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Feedback</p>
                          <p className="text-sm bg-muted/50 rounded-lg p-3">{sub.feedback}</p>
                        </div>
                      )}
                      {sub.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground mr-1">Rating:</span>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < sub.rating! ? 'text-gold fill-gold' : 'text-muted-foreground/30'}`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Review action buttons */}
                      {(sub.status === 'Pending' || sub.status === 'Under Review') && (
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setReviewDialogId(sub.id);
                              setReviewAction('approve');
                              setReviewFeedback('');
                              setReviewRating(0);
                            }}
                            disabled={actionLoading === sub.id}
                            className="bg-success hover:bg-success/90 text-white gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReviewDialogId(sub.id);
                              setReviewAction('reject');
                              setReviewFeedback('');
                              setReviewRating(0);
                            }}
                            disabled={actionLoading === sub.id}
                            className="border-danger text-danger hover:bg-danger/10 gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review dialog */}
      <Dialog open={!!reviewDialogId} onOpenChange={() => setReviewDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewAction === 'approve' ? (
                <><CheckCircle2 className="w-5 h-5 text-success" /> Approve Submission</>
              ) : (
                <><XCircle className="w-5 h-5 text-danger" /> Reject Submission</>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Star rating */}
            <div>
              <p className="text-sm font-medium mb-2">Rating</p>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewRating(i + 1)}
                    className="p-0.5 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${i < reviewRating ? 'text-gold fill-gold' : 'text-muted-foreground/30'}`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {reviewRating > 0 ? `${reviewRating}/5` : 'Select rating'}
                </span>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <p className="text-sm font-medium mb-2">
                Feedback {reviewAction === 'reject' && <span className="text-danger">*</span>}
              </p>
              <Textarea
                placeholder={
                  reviewAction === 'approve'
                    ? 'Provide positive feedback for the student...'
                    : 'Explain what needs improvement...'
                }
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogId(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleReview}
              disabled={reviewAction === 'reject' ? !reviewFeedback.trim() || !!actionLoading : reviewRating === 0 || !!actionLoading}
              className={reviewAction === 'approve' ? 'bg-success hover:bg-success/90 text-white' : 'bg-danger hover:bg-danger/90 text-white'}
            >
              {actionLoading ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
