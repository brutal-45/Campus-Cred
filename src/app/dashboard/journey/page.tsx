'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Map, Flag, Trophy, CheckCircle, Clock, ArrowRight, Star,
  Calendar, Building2, Zap, Target, GraduationCap, Briefcase,
  ChevronRight, Milestone, Rocket, Award, Sparkles, TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/store';
import { LEVEL_THRESHOLDS } from '@/lib/constants';

interface MilestoneEntry {
  id: string; title: string; description: string; date: string; type: 'task' | 'certificate' | 'internship' | 'streak' | 'level';
  status: 'completed' | 'in-progress' | 'upcoming'; points?: number; company?: string;
}

interface InternshipPhase {
  id: string; title: string; startDate: string; endDate: string; company: string; role: string;
  status: 'completed' | 'active' | 'upcoming'; progress: number; milestones: string[];
}



const typeIcon: Record<string, React.ElementType> = { task: Target, certificate: Award, internship: Briefcase, streak: Zap, level: Trophy };
const typeColor: Record<string, string> = { task: 'text-electric', certificate: 'text-amber-500', internship: 'text-purple-500', streak: 'text-orange-500', level: 'text-emerald-500' };

interface JourneyApplication {
  applicationId: string; status: string; appliedAt: string; title: string; company: string; duration?: string | null;
}

export default function JourneyPage() {
  const { token, user } = useAppStore();
  const [filter, setFilter] = React.useState<string>('all');
  const [milestones, setMilestones] = React.useState<MilestoneEntry[]>([]);
  const [applications, setApplications] = React.useState<JourneyApplication[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!token) { setLoading(false); return; }
    const headers = { Authorization: `Bearer ${token}` };
    (async () => {
      try {
        const [subsRes, certsRes, appsRes] = await Promise.all([
          fetch('/api/student/submissions', { headers }).then(r => (r.ok ? r.json() : { submissions: [] })).catch(() => ({ submissions: [] })),
          fetch('/api/student/certificates', { headers }).then(r => (r.ok ? r.json() : { certificates: [] })).catch(() => ({ certificates: [] })),
          fetch('/api/student/internships', { headers }).then(r => (r.ok ? r.json() : { internships: [] })).catch(() => ({ internships: [] })),
        ]);

        const apps: JourneyApplication[] = appsRes.internships || [];
        setApplications(apps);

        const events: MilestoneEntry[] = [];
        for (const sub of subsRes.submissions || []) {
          if (sub.status === 'Approved') {
            events.push({
              id: `task-${sub.id}`,
              title: `Task Approved: ${sub.taskTitle}`,
              description: `Your submission was approved${sub.taskPoints ? ` and earned ${sub.taskPoints} points` : ''}`,
              date: (sub.reviewedAt || sub.submittedAt || '').toString(),
              type: 'task', status: 'completed', points: sub.taskPoints || 0,
            });
          } else if (sub.status === 'Pending' || sub.status === 'Under Review') {
            events.push({
              id: `task-${sub.id}`,
              title: `Task Submitted: ${sub.taskTitle}`,
              description: 'Your submission is awaiting review',
              date: (sub.submittedAt || '').toString(),
              type: 'task', status: 'in-progress',
            });
          }
        }
        for (const cert of certsRes.certificates || []) {
          events.push({
            id: `cert-${cert.id}`,
            title: 'Certificate Earned',
            description: cert.taskTitle,
            date: (cert.issuedDate || '').toString(),
            type: 'certificate', status: 'completed',
          });
        }
        for (const app of apps) {
          if (app.status === 'Rejected') continue;
          events.push({
            id: `app-${app.applicationId}`,
            title: app.status === 'Hired' ? `Internship Offer: ${app.title}` : `Applied: ${app.title}`,
            description: app.status === 'Hired' ? 'Congratulations — you were hired!' : `Application status: ${app.status}`,
            date: (app.appliedAt || '').toString(),
            type: 'internship', status: app.status === 'Hired' ? 'completed' : 'in-progress', company: app.company,
          });
        }
        if ((user?.streakDays || 0) >= 7) {
          events.push({
            id: 'streak-current',
            title: `${user?.streakDays}-Day Streak`,
            description: 'Consistency pays off — keep the streak alive!',
            date: '', type: 'streak', status: 'in-progress',
          });
        }

        events.sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'));

        // Upcoming goals derived from the student's actual progress
        const score = user?.campusCredScore || 0;
        const nextLevel = LEVEL_THRESHOLDS.find(t => score < t.minScore);
        if (nextLevel) {
          events.push({
            id: 'next-level',
            title: `Level Up: ${nextLevel.level} ${nextLevel.icon}`,
            description: `Reach ${nextLevel.minScore}+ CampusCred Score (current: ${score})`,
            date: '', type: 'level', status: 'upcoming',
          });
        }
        if ((certsRes.certificates || []).length === 0) {
          events.push({
            id: 'first-cert',
            title: 'First Certificate',
            description: 'Complete and get a task approved to earn your first verified certificate',
            date: '', type: 'certificate', status: 'upcoming',
          });
        }

        setMilestones(events);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, user?.campusCredScore, user?.streakDays]);

  const activeApplication =
    applications.find(a => a.status === 'Hired') ||
    applications.find(a => a.status === 'Shortlisted') ||
    applications.find(a => a.status === 'Applied') || null;

  const applicationStages = ['Applied', 'Shortlisted', 'Hired'];
  const stageIndex = activeApplication ? applicationStages.indexOf(activeApplication.status) : -1;
  const internshipPhases: InternshipPhase[] = activeApplication ? applicationStages.map((stage, i) => ({
    id: stage,
    title: stage === 'Hired' ? 'Offer / Hired' : stage,
    startDate: '', endDate: '',
    company: activeApplication.company, role: activeApplication.title,
    status: i < stageIndex ? 'completed' : i === stageIndex ? 'active' : 'upcoming',
    progress: i < stageIndex ? 100 : i === stageIndex ? 50 : 0,
    milestones: [],
  })) : [];

  const filteredMilestones = filter === 'all' ? milestones : milestones.filter(m => m.type === filter);
  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = Math.max(milestones.length, 1);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-electric/30 border-t-electric rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2"><Map className="w-6 h-6 text-emerald-500" /> My Journey</h1>
          <p className="text-sm text-text-secondary">Track your internship progress and career milestones</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1"><TrendingUp className="w-3.5 h-3.5 mr-1" />{completedCount}/{totalMilestones} milestones</Badge>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="animate-fade-in">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold font-heading">Journey Progress</h3>
                <p className="text-sm text-text-secondary">From Starter to Legend — your path so far</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-navy">{milestones.length ? Math.round((completedCount / totalMilestones) * 100) : 0}%</p>
                <p className="text-xs text-text-secondary">Complete</p>
              </div>
            </div>
            <Progress value={milestones.length ? (completedCount / totalMilestones) * 100 : 0} className="h-3 mb-4" />
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span className="flex items-center gap-1"><span>🌱</span> Starter</span>
              <span className="flex items-center gap-1"><span>⚡</span> Achiever</span>
              <span className="flex items-center gap-1"><span>🔥</span> Expert</span>
              <span className="flex items-center gap-1"><span>💎</span> Elite</span>
              <span className="flex items-center gap-1"><span>👑</span> Legend</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Internship */}
      <div>
        <h2 className="text-lg font-semibold font-heading mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-purple-500" /> Active Internship</h2>
        {activeApplication ? (
        <Card className="border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {(activeApplication.company || 'C')[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">{activeApplication.title}</h3>
                    <p className="text-sm text-text-secondary">{activeApplication.company}{activeApplication.duration ? ` • ${activeApplication.duration}` : ''}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">{activeApplication.status}</Badge>
                </div>
                <div className="mt-4 space-y-3">
                  {internshipPhases.map((phase) => (
                    <div key={phase.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className={`font-medium ${phase.status === 'active' ? 'text-electric' : phase.status === 'completed' ? 'text-green-600' : 'text-text-secondary'}`}>
                          {phase.status === 'completed' && <CheckCircle className="w-3.5 h-3.5 inline mr-1" />}
                          {phase.status === 'active' && <Clock className="w-3.5 h-3.5 inline mr-1" />}
                          {phase.title}
                        </span>
                        <span className="text-xs text-text-secondary">{phase.startDate} - {phase.endDate}</span>
                      </div>
                      <Progress value={phase.progress} className="h-1.5" />
                      {phase.status === 'active' && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {phase.milestones.map((m, mi) => (
                            <span key={mi} className="text-[10px] text-text-secondary bg-muted px-2 py-0.5 rounded">{m}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Briefcase className="w-12 h-12 text-text-secondary/30 mx-auto mb-3" />
            <p className="text-sm font-semibold">No active internship yet</p>
            <p className="text-xs text-text-secondary mt-1">Apply to micro-internships to start your internship journey.</p>
            <Link href="/internships">
              <Button className="mt-4 gap-2">Browse Internships <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </CardContent>
        </Card>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'task', 'certificate', 'internship', 'streak', 'level'].map(f => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)} className="capitalize whitespace-nowrap">
            {f === 'all' && <Sparkles className="w-3.5 h-3.5 mr-1" />}
            {f}
          </Button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5" style={{ backgroundColor: '#E2E8F0' }} />
        <div className="space-y-6">
          {filteredMilestones.map((milestone, i) => {
            const Icon = typeIcon[milestone.type] || Target;
            const color = typeColor[milestone.type] || 'text-text-secondary';
            const isCompleted = milestone.status === 'completed';
            const isActive = milestone.status === 'in-progress';

            return (
              <div
                key={milestone.id}
                className="animate-fade-in relative pl-12"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`absolute left-3 w-5 h-5 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-green-500' : isActive ? 'bg-electric animate-pulse' : 'bg-muted border-2'
                }`} style={!isCompleted && !isActive ? { borderColor: '#E2E8F0' } : undefined}>
                  {isCompleted ? <CheckCircle className="w-3 h-3 text-white" /> : isActive ? <Clock className="w-3 h-3 text-white" /> : <Flag className="w-2.5 h-2.5 text-text-secondary" />}
                </div>
                <Card className={`hover:shadow-sm transition-shadow ${isActive ? 'border-electric/30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <h4 className="text-sm font-semibold">{milestone.title}</h4>
                      </div>
                      {milestone.points ? (
                        <Badge variant="secondary" className="text-[10px]">+{milestone.points} pts</Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-text-secondary mt-1">{milestone.description}</p>
                    {milestone.date && (
                      <p className="text-[10px] text-text-secondary mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{new Date(milestone.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                    {milestone.company && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-purple-500" />
                        <span className="text-xs text-purple-600 font-medium">{milestone.company}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
