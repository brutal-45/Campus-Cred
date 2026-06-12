'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Briefcase,
  UserCheck,
  XCircle,
  Star,
  ChevronDown,
  ChevronUp,
  Users,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';

interface Applicant {
  id: string;
  status: string;
  appliedAt: string;
  student: {
    id: string;
    fullName: string;
    email: string;
    college?: string;
    branch?: string;
    degree?: string;
    points: number;
    level: string;
  };
}

interface InternshipWithApplicants {
  id: string;
  title: string;
  status: string;
  deadline: string;
  applicants: Applicant[];
}

export function ApplicantReview({ defaultTab = 'all' }: { defaultTab?: string }) {
  const { token } = useAppStore();
  const [internships, setInternships] = React.useState<InternshipWithApplicants[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedInternId, setExpandedInternId] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/company/internships', { headers });
      if (res.ok) {
        const data = await res.json();
        setInternships(data.internships || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (applicantId: string, action: 'shortlist' | 'hire' | 'reject', studentId: string) => {
    setActionLoading(applicantId);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      if (action === 'hire') {
        const res = await fetch(`/api/company/hire/${studentId}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ applicantId }),
        });

        if (res.ok) {
          toast.success('Student hired successfully! Notification sent.');
          fetchData();
        } else {
          const data = await res.json();
          toast.error(data.error || 'Failed to hire student');
        }
      } else {
        // For shortlist/reject, we update the applicant status via internships endpoint
        const res = await fetch(`/api/company/internships`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ applicantId, status: action === 'shortlist' ? 'Shortlisted' : 'Rejected' }),
        });

        if (res.ok) {
          toast.success(`Applicant ${action === 'shortlist' ? 'shortlisted' : 'rejected'}`);
          fetchData();
        } else {
          toast.error('Failed to update applicant status');
        }
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hired': return 'bg-success/10 text-success border-success/20';
      case 'Shortlisted': return 'bg-electric/10 text-electric border-electric/20';
      case 'Rejected': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Pro': return 'bg-purple/10 text-purple';
      case 'Expert': return 'bg-electric/10 text-electric';
      case 'Achiever': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Filter based on defaultTab
  const filteredInternships = React.useMemo(() => {
    if (defaultTab === 'hired') {
      return internships.map((intern) => ({
        ...intern,
        applicants: intern.applicants.filter((a) => a.status === 'Hired'),
      })).filter((intern) => intern.applicants.length > 0);
    }
    return internships;
  }, [internships, defaultTab]);

  const totalApplicants = filteredInternships.reduce(
    (sum, i) => sum + i.applicants.length,
    0
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-heading text-foreground">
            {defaultTab === 'hired' ? 'Hired Students' : 'Applicant Review'}
          </h2>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-5 bg-muted rounded w-1/3 mb-3" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground">
          {defaultTab === 'hired' ? 'Hired Students' : 'Applicant Review'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {defaultTab === 'hired'
            ? 'Students you have hired for your internships'
            : `Review and manage applicants for your internships (${totalApplicants} total)`}
        </p>
      </div>

      {filteredInternships.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {defaultTab === 'hired' ? 'No students hired yet' : 'No internships posted yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInternships.map((intern) => {
            const isExpanded = expandedInternId === intern.id;
            return (
              <Card key={intern.id}>
                <CardContent className="p-5">
                  {/* Internship header */}
                  <button
                    onClick={() => setExpandedInternId(isExpanded ? null : intern.id)}
                    className="w-full flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-electric/10 flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-electric" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-bold">{intern.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {intern.applicants.length} applicant{intern.applicants.length !== 1 ? 's' : ''} • Deadline: {formatDate(intern.deadline)}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>

                  {/* Applicants list */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3">
                      {intern.applicants.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No applicants for this internship yet
                        </p>
                      ) : (
                        intern.applicants.map((applicant) => (
                          <div
                            key={applicant.id}
                            className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-purple/10 text-purple text-xs font-semibold">
                                {applicant.student.fullName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold">{applicant.student.fullName}</p>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${getStatusColor(applicant.status)}`}
                                >
                                  {applicant.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                {applicant.student.college && (
                                  <span className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {applicant.student.college}
                                  </span>
                                )}
                                {applicant.student.branch && (
                                  <span className="flex items-center gap-1">
                                    <GraduationCap className="w-3 h-3" />
                                    {applicant.student.branch}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="flex items-center gap-1 text-xs">
                                  <Star className="w-3 h-3 text-warning" />
                                  {applicant.student.points} pts
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] ${getLevelColor(applicant.student.level)}`}
                                >
                                  {applicant.student.level}
                                </Badge>
                              </div>
                            </div>

                            {/* Action buttons */}
                            {defaultTab !== 'hired' && applicant.status !== 'Hired' && applicant.status !== 'Rejected' && (
                              <div className="flex items-center gap-1">
                                {applicant.status === 'Applied' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAction(applicant.id, 'shortlist', applicant.student.id)}
                                    disabled={actionLoading === applicant.id}
                                    className="text-xs border-electric text-electric hover:bg-electric/10"
                                  >
                                    Shortlist
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => handleAction(applicant.id, 'hire', applicant.student.id)}
                                  disabled={actionLoading === applicant.id}
                                  className="text-xs bg-success hover:bg-success/90 text-white gap-1"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  Hire
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAction(applicant.id, 'reject', applicant.student.id)}
                                  disabled={actionLoading === applicant.id}
                                  className="text-xs border-danger text-danger hover:bg-danger/10"
                                >
                                  <XCircle className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
