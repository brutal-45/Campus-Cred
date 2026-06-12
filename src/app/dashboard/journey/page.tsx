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

interface MilestoneEntry {
  id: string; title: string; description: string; date: string; type: 'task' | 'certificate' | 'internship' | 'streak' | 'level';
  status: 'completed' | 'in-progress' | 'upcoming'; points?: number; company?: string;
}

interface InternshipPhase {
  id: string; title: string; startDate: string; endDate: string; company: string; role: string;
  status: 'completed' | 'active' | 'upcoming'; progress: number; milestones: string[];
}

const milestones: MilestoneEntry[] = [
  { id: '1', title: 'First Task Completed', description: 'Completed your first task "Build a Landing Page"', date: '2024-09-15', type: 'task', status: 'completed', points: 50 },
  { id: '2', title: '7-Day Streak Achievement', description: 'Maintained a 7-day streak of daily task activity', date: '2024-09-22', type: 'streak', status: 'completed', points: 35 },
  { id: '3', title: 'First Certificate Earned', description: 'Earned "Web Development Professional" certificate', date: '2024-10-01', type: 'certificate', status: 'completed', points: 30 },
  { id: '4', title: 'Level Up: Achiever ⚡', description: 'Reached Achiever level with 150+ CampusCred Score', date: '2024-10-15', type: 'level', status: 'completed', points: 0 },
  { id: '5', title: 'Razorpay Internship Started', description: 'Began Frontend Developer internship at Razorpay', date: '2024-11-01', type: 'internship', status: 'completed', company: 'Razorpay' },
  { id: '6', title: '10 Tasks Completed', description: 'Completed 10 tasks across different categories', date: '2024-11-20', type: 'task', status: 'completed', points: 100 },
  { id: '7', title: 'Level Up: Expert 🔥', description: 'Reached Expert level with 350+ CampusCred Score', date: '2024-12-01', type: 'level', status: 'in-progress', points: 0 },
  { id: '8', title: 'Second Certificate', description: 'Earn "Data Science Fundamentals" certificate', date: '', type: 'certificate', status: 'upcoming', points: 30 },
  { id: '9', title: '30-Day Streak', description: 'Maintain a 30-day activity streak', date: '', type: 'streak', status: 'upcoming', points: 150 },
  { id: '10', title: 'Level Up: Elite 💎', description: 'Reach Elite level with 600+ CampusCred Score', date: '', type: 'level', status: 'upcoming', points: 0 },
];

const internshipPhases: InternshipPhase[] = [
  { id: '1', title: 'Onboarding & Learning', startDate: 'Nov 1', endDate: 'Nov 15', company: 'Razorpay', role: 'Frontend Intern', status: 'completed', progress: 100, milestones: ['Team introduction', 'Codebase walkthrough', 'First PR merged'] },
  { id: '2', title: 'Feature Development', startDate: 'Nov 16', endDate: 'Dec 15', company: 'Razorpay', role: 'Frontend Intern', status: 'completed', progress: 100, milestones: ['Built payment form component', 'Implemented form validation', 'Unit tests written'] },
  { id: '3', title: 'Advanced Contributions', startDate: 'Dec 16', endDate: 'Jan 15', company: 'Razorpay', role: 'Frontend Intern', status: 'active', progress: 65, milestones: ['Dashboard optimization', 'Code review participation', 'Mentoring new interns'] },
  { id: '4', title: 'Final Presentation', startDate: 'Jan 16', endDate: 'Jan 31', company: 'Razorpay', role: 'Frontend Intern', status: 'upcoming', progress: 0, milestones: ['Presentation preparation', 'Demo to stakeholders', 'Exit interview'] },
];

const typeIcon: Record<string, React.ElementType> = { task: Target, certificate: Award, internship: Briefcase, streak: Zap, level: Trophy };
const typeColor: Record<string, string> = { task: 'text-electric', certificate: 'text-amber-500', internship: 'text-purple-500', streak: 'text-orange-500', level: 'text-emerald-500' };

export default function JourneyPage() {
  const [filter, setFilter] = React.useState<string>('all');

  const filteredMilestones = filter === 'all' ? milestones : milestones.filter(m => m.type === filter);
  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = milestones.length;

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
                <p className="text-2xl font-bold text-navy">{Math.round((completedCount / totalMilestones) * 100)}%</p>
                <p className="text-xs text-text-secondary">Complete</p>
              </div>
            </div>
            <Progress value={(completedCount / totalMilestones) * 100} className="h-3 mb-4" />
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
        <Card className="border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                R
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold">Frontend Developer Intern</h3>
                    <p className="text-sm text-text-secondary">Razorpay • Nov 2024 - Jan 2025</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
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
