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
  ExternalLink,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Submission {
  id: string;
  status: string;
  description?: string;
  externalLink?: string;
  fileUrl?: string;
  feedback?: string;
  submittedAt: string;
  reviewedAt?: string;
  student: { id: string; fullName: string; email: string; college?: string; branch?: string };
  task: { id: string; title: string; points: number };
}

export function SubmissionManager() {
  const { token } = useAppStore();
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState('Pending');
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [rejectDialogId, setRejectDialogId] = React.useState<string | null>(null);
  const [rejectFeedback, setRejectFeedback] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [detailSubmission, setDetailSubmission] = React.useState<Submission | null>(null);

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

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/submissions/${id}/approve`, {
        method: 'PUT',
        headers,
      });

      if (res.ok) {
        toast.success('Submission approved! Certificate generated and points added.');
        fetchSubmissions();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to approve submission');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialogId || !rejectFeedback.trim()) {
      toast.error('Feedback is required when rejecting a submission');
      return;
    }

    setActionLoading(rejectDialogId);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/submissions/${rejectDialogId}/reject`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ feedback: rejectFeedback }),
      });

      if (res.ok) {
        toast.success('Submission rejected with feedback');
        setRejectDialogId(null);
        setRejectFeedback('');
        fetchSubmissions();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to reject submission');
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredSubmissions = submissions;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground">Submission Review</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review and manage student submissions
        </p>
      </div>

      {/* Status tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="bg-muted">
          <TabsTrigger value="Pending" className="text-xs">
            Pending
          </TabsTrigger>
          <TabsTrigger value="Under Review" className="text-xs">
            Under Review
          </TabsTrigger>
          <TabsTrigger value="Approved" className="text-xs">
            Approved
          </TabsTrigger>
          <TabsTrigger value="Rejected" className="text-xs">
            Rejected
          </TabsTrigger>
          <TabsTrigger value="All" className="text-xs">
            All
          </TabsTrigger>
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
      ) : filteredSubmissions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No {statusFilter === 'All' ? '' : statusFilter.toLowerCase() + ' '}submissions found
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
          {filteredSubmissions.map((sub) => {
            const isExpanded = expandedId === sub.id;
            return (
              <Card key={sub.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar className="w-9 h-9 mt-0.5">
                        <AvatarFallback className="bg-electric/10 text-electric text-xs font-semibold">
                          {sub.student.fullName.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{sub.student.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{sub.student.email}</p>
                        <p className="text-sm text-foreground mt-1 font-medium">{sub.task.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {sub.task.points} points • {formatDate(sub.submittedAt)}
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
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
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
                      {sub.student.college && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>College: {sub.student.college}</span>
                          {sub.student.branch && <span>Branch: {sub.student.branch}</span>}
                        </div>
                      )}

                      {/* Action buttons */}
                      {(sub.status === 'Pending' || sub.status === 'Under Review') && (
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(sub.id)}
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
                              setRejectDialogId(sub.id);
                              setRejectFeedback('');
                            }}
                            disabled={actionLoading === sub.id}
                            className="border-danger text-danger hover:bg-danger/10 gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailSubmission(sub)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View Details
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

      {/* Reject dialog */}
      <Dialog open={!!rejectDialogId} onOpenChange={() => setRejectDialogId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-danger" />
              Reject Submission
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Please provide feedback explaining why this submission is being rejected. This will help the student improve.
            </p>
            <Textarea
              placeholder="Enter rejection feedback..."
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogId(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectFeedback.trim() || !!actionLoading}
              className="bg-danger hover:bg-danger/90 text-white"
            >
              {actionLoading ? 'Rejecting...' : 'Reject Submission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={!!detailSubmission} onOpenChange={() => setDetailSubmission(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {detailSubmission && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-electric/10 text-electric font-semibold">
                    {detailSubmission.student.fullName.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{detailSubmission.student.fullName}</p>
                  <p className="text-xs text-muted-foreground">{detailSubmission.student.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground mb-1">Task</p>
                  <p className="text-sm font-medium">{detailSubmission.task.title}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground mb-1">Points</p>
                  <p className="text-sm font-medium">{detailSubmission.task.points} pts</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground mb-1">Submitted</p>
                  <p className="text-sm">{formatDate(detailSubmission.submittedAt)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-[10px] text-muted-foreground mb-1">Status</p>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(detailSubmission.status)}`}>
                    {detailSubmission.status}
                  </Badge>
                </div>
              </div>

              {detailSubmission.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm bg-muted/50 rounded-lg p-3">{detailSubmission.description}</p>
                </div>
              )}
              {detailSubmission.externalLink && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Submission Link</p>
                  <a
                    href={detailSubmission.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-electric hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    {detailSubmission.externalLink}
                  </a>
                </div>
              )}
              {detailSubmission.feedback && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Feedback</p>
                  <p className="text-sm bg-muted/50 rounded-lg p-3">{detailSubmission.feedback}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
