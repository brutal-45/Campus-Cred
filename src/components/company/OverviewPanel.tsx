'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import {
  Briefcase,
  Users,
  UserCheck,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface InternshipData {
  id: string;
  title: string;
  status: string;
  deadline: string;
  applicantCount: number;
  hiredCount: number;
}

export function OverviewPanel() {
  const { token, user } = useAppStore();
  const [internships, setInternships] = React.useState<InternshipData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalInternships: 0,
    totalApplicants: 0,
    totalHired: 0,
    openInternships: 0,
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/company/internships', { headers });
        if (res.ok) {
          const data = await res.json();
          const internshipsList = data.internships || [];
          setInternships(internshipsList);

          const totalApplicants = internshipsList.reduce(
            (sum: number, i: InternshipData) => sum + (i.applicantCount || 0),
            0
          );
          const totalHired = internshipsList.reduce(
            (sum: number, i: InternshipData) => sum + (i.hiredCount || 0),
            0
          );
          const openInternships = internshipsList.filter(
            (i: InternshipData) => i.status === 'Open'
          ).length;

          setStats({
            totalInternships: internshipsList.length,
            totalApplicants,
            totalHired,
            openInternships,
          });
        }
      } catch (err) {
        console.error('Error fetching company data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, user]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysLeft = (deadline: string) => {
    const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="h-4 bg-muted rounded w-2/3 mb-3" />
                <div className="h-8 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground">Company Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track your internship postings and applicant pipeline
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Internships', value: stats.totalInternships, icon: Briefcase, color: 'text-electric', bg: 'bg-electric/10' },
          { label: 'Total Applicants', value: stats.totalApplicants, icon: Users, color: 'text-purple', bg: 'bg-purple/10' },
          { label: 'Students Hired', value: stats.totalHired, icon: UserCheck, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Open Positions', value: stats.openInternships, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold font-heading">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active internships */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold font-heading">Your Internships</h3>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          {internships.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No internships posted yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {internships.map((intern) => (
                <div
                  key={intern.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{intern.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-muted-foreground">
                        <Users className="w-3 h-3 inline mr-0.5" />
                        {intern.applicantCount} applicants
                      </span>
                      <span className="text-[10px] text-success">
                        <UserCheck className="w-3 h-3 inline mr-0.5" />
                        {intern.hiredCount} hired
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <span
                      className={`text-[10px] font-medium px-2 py-1 rounded-full ${
                        intern.status === 'Open'
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {intern.status}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {getDaysLeft(intern.deadline)}d left
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
