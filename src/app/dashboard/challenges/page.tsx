'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Zap, Flame, Clock, CheckCircle, Star, Trophy, ArrowRight, RotateCcw,
  Calendar, Target, Gift, Lock, ChevronRight, Sparkles, Timer,
} from 'lucide-react';
import { toast } from 'sonner';

interface Challenge {
  id: string; title: string; description: string; category: string; difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number; timeLimit: number; completed: boolean; xpReward: number;
}

export default function ChallengesPage() {
  const [streak, setStreak] = React.useState(7);
  const [activeChallenge, setActiveChallenge] = React.useState<Challenge | null>(null);
  const [timeLeft, setTimeLeft] = React.useState(0);
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);
  const [completedToday, setCompletedToday] = React.useState(1);
  const [totalPoints, setTotalPoints] = React.useState(245);
  const [isLoading, setIsLoading] = React.useState(true);

  const dailyChallenges: Challenge[] = [
    { id: '1', title: 'Build a Responsive Navbar', description: 'Create a fully responsive navigation bar with mobile hamburger menu, dropdown, and smooth animations using React and Tailwind CSS.', category: 'Development', difficulty: 'Easy', points: 50, timeLimit: 1800, completed: false, xpReward: 30 },
    { id: '2', title: 'API Error Handling', description: 'Implement comprehensive error handling for a REST API including 404, 500, rate limiting, and proper error response format.', category: 'Development', difficulty: 'Medium', points: 80, timeLimit: 3600, completed: false, xpReward: 50 },
    { id: '3', title: 'Design a Landing Page', description: 'Create a visually stunning landing page with hero section, features grid, testimonials, and CTA. Focus on typography and spacing.', category: 'Design', difficulty: 'Medium', points: 70, timeLimit: 2700, completed: false, xpReward: 45 },
    { id: '4', title: 'Write Technical Blog Post', description: 'Write a 500-word technical blog post explaining a complex concept in simple terms. Include code examples and diagrams.', category: 'Writing', difficulty: 'Easy', points: 40, timeLimit: 2400, completed: true, xpReward: 25 },
    { id: '5', title: 'Database Schema Design', description: 'Design a normalized database schema for an e-commerce platform with users, products, orders, and reviews tables.', category: 'Data', difficulty: 'Hard', points: 100, timeLimit: 5400, completed: false, xpReward: 70 },
  ];

  const [challenges, setChallenges] = React.useState<Challenge[]>(dailyChallenges);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          toast.error('Time is up! Challenge failed.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const startChallenge = (challenge: Challenge) => {
    setActiveChallenge(challenge);
    setTimeLeft(challenge.timeLimit);
    setIsTimerRunning(true);
    toast.info(`Challenge started: ${challenge.title}`);
  };

  const completeChallenge = () => {
    if (!activeChallenge) return;
    setChallenges(challenges.map(c => c.id === activeChallenge.id ? { ...c, completed: true } : c));
    setCompletedToday(prev => prev + 1);
    setTotalPoints(prev => prev + activeChallenge.points);
    setStreak(prev => prev + 1);
    setIsTimerRunning(false);
    toast.success(`+${activeChallenge.points} points! Challenge completed! 🎉`);
    setActiveChallenge(null);
    setTimeLeft(0);
  };

  const skipChallenge = () => {
    setActiveChallenge(null);
    setIsTimerRunning(false);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const difficultyColor = (d: string) => {
    switch (d) { case 'Easy': return 'bg-green-100 text-green-700 border-green-200'; case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200'; case 'Hard': return 'bg-red-100 text-red-700 border-red-200'; default: return ''; }
  };

  const streakDays = Array.from({ length: 7 }, (_, i) => {
    const dayIndex = i;
    const isActive = i < streak % 7 || (streak >= 7);
    const isToday = i === new Date().getDay() - 1 || (i === 6 && new Date().getDay() === 0);
    return { day: ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i], isActive, isToday };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2"><Zap className="w-6 h-6 text-amber-500" /> Daily Challenges</h1>
          <p className="text-sm text-text-secondary">Complete challenges to earn points and maintain your streak</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-orange-100 text-orange-700 border-orange-200 px-3 py-1"><Flame className="w-3.5 h-3.5 mr-1" />{streak} day streak</Badge>
          <Badge className="bg-electric/10 text-electric border-electric/20 px-3 py-1"><Star className="w-3.5 h-3.5 mr-1" />{totalPoints} pts</Badge>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Current Streak', value: streak, icon: Flame, color: 'text-orange-500', suffix: 'days' },
          { label: 'Completed Today', value: completedToday, icon: CheckCircle, color: 'text-green-500', suffix: '/3' },
          { label: 'Total Points', value: totalPoints, icon: Star, color: 'text-amber-500', suffix: 'pts' },
          { label: 'Best Streak', value: 14, icon: Trophy, color: 'text-purple-500', suffix: 'days' },
        ].map((stat, i) => (
          <div key={stat.label} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <Card><CardContent className="p-4 text-center">
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold">{stat.value}<span className="text-sm text-text-secondary font-normal ml-1">{stat.suffix}</span></p>
              <p className="text-xs text-text-secondary">{stat.label}</p>
            </CardContent></Card>
          </div>
        ))}
      </div>

      {/* Active Challenge Panel */}
      {activeChallenge && (
        <div className="animate-fade-in">
          <Card className="border-2 border-electric/30 bg-electric/5">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-5 h-5 text-electric animate-pulse" />
                    <span className="text-sm font-semibold text-electric">Challenge in Progress</span>
                  </div>
                  <h3 className="text-lg font-bold">{activeChallenge.title}</h3>
                  <p className="text-sm text-text-secondary mt-1">{activeChallenge.description}</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="text-3xl font-mono font-bold text-electric">{formatTime(timeLeft)}</div>
                  <Progress value={(timeLeft / activeChallenge.timeLimit) * 100} className="w-40 h-2" />
                  <div className="flex gap-2">
                    <Button onClick={completeChallenge} className="gap-2 bg-navy text-white"><CheckCircle className="w-4 h-4" />Complete</Button>
                    <Button variant="outline" onClick={skipChallenge} className="gap-2"><RotateCcw className="w-4 h-4" />Skip</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weekly Streak Calendar */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-text-secondary" />This Week</h3>
          <div className="flex items-center justify-between">
            {streakDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-text-secondary font-medium">{day.day}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  day.isActive ? 'bg-gradient-to-br from-orange-400 to-red-500 shadow-md shadow-orange-500/30' : 'bg-muted border'
                } ${day.isToday ? 'ring-2 ring-electric ring-offset-2 ring-offset-background' : ''}`} style={!day.isActive ? { borderColor: '#E2E8F0' } : undefined}>
                  {day.isActive ? <Flame className="w-4 h-4 text-white" /> : <Lock className="w-3.5 h-3.5 text-text-secondary" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Challenge Cards */}
      <div>
        <h2 className="text-lg font-semibold font-heading mb-4">Today&apos;s Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge, i) => (
            <div key={challenge.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <Card className={`hover:shadow-md transition-all duration-200 ${challenge.completed ? 'opacity-70' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={difficultyColor(challenge.difficulty)}>{challenge.difficulty}</Badge>
                        <Badge variant="outline" className="text-xs">{challenge.category}</Badge>
                      </div>
                      <h3 className="text-sm font-semibold">{challenge.title}</h3>
                    </div>
                    {challenge.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Gift className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mb-3 line-clamp-2">{challenge.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-text-secondary">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{challenge.points} pts</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.floor(challenge.timeLimit / 60)}min</span>
                      <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-purple-500" />{challenge.xpReward} XP</span>
                    </div>
                    {!challenge.completed && !activeChallenge && (
                      <Button size="sm" onClick={() => startChallenge(challenge)} className="gap-1 text-xs">
                        Start <ChevronRight className="w-3 h-3" />
                      </Button>
                    )}
                    {challenge.completed && (
                      <span className="text-xs text-green-600 font-medium">Completed ✓</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
