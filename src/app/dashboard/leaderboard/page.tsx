'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy, Medal, Crown, Star, Search, Filter, TrendingUp,
  ArrowUp, ArrowDown, Minus, Users, Target, Zap, Award,
  ChevronUp, ChevronDown, Flame, GraduationCap, MapPin,
} from 'lucide-react';
import { LEVEL_THRESHOLDS } from '@/lib/constants';
import { useAppStore } from '@/store';

interface LeaderboardEntry {
  id: string; rank: number; name: string; avatar: string; branch: string; college: string;
  score: number; level: string; streak: number; tasksCompleted: number; change: 'up' | 'down' | 'same';
  changeValue: number;
}

const branches = ['All', 'CSE', 'ECE', 'IT', 'Mechanical', 'Civil', 'EEE', 'Data Science', 'AI & ML'];

function initialsOf(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'S';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const getLevelInfo = (levelName: string) => LEVEL_THRESHOLDS.find(l => l.level === levelName) || LEVEL_THRESHOLDS[0];

export default function LeaderboardPage() {
  const { token, user } = useAppStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedBranch, setSelectedBranch] = React.useState('All');
  const [timeframe, setTimeframe] = React.useState('all');
  const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);
  const [globalEntries, setGlobalEntries] = React.useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Global list (for branch-wise stats, independent of the branch filter)
  React.useEffect(() => {
    if (!token) return;
    fetch('/api/student/leaderboard?branch=All&limit=100', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data) return;
        setGlobalEntries((data.leaderboard || []).map((e: Record<string, unknown>) => ({
          branch: String(e.branch || ''),
          score: Number(e.score ?? e.campusCredScore ?? 0),
        })) as LeaderboardEntry[]);
      })
      .catch(() => {});
  }, [token]);

  React.useEffect(() => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    fetch(`/api/student/leaderboard?branch=${encodeURIComponent(selectedBranch)}&limit=50`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data) return;
        setEntries((data.leaderboard || []).map((e: Record<string, unknown>) => ({
          id: String(e.id),
          rank: Number(e.rank),
          name: String(e.fullName || ''),
          avatar: initialsOf(String(e.fullName || '')),
          branch: String(e.branch || ''),
          college: String(e.college || ''),
          score: Number(e.score ?? e.campusCredScore ?? 0),
          level: String(e.level || 'Starter'),
          streak: Number(e.streakDays || 0),
          tasksCompleted: Number(e.tasksCompleted || 0),
          change: 'same' as const,
          changeValue: 0,
        })));
        if (data.currentUser?.rank) setMyRank(data.currentUser.rank);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, selectedBranch]);

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.college.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const top3 = filteredEntries.slice(0, 3);
  const rest = filteredEntries.slice(3);

  const myEntry: LeaderboardEntry | undefined = user ? {
    id: user.id,
    rank: myRank || 0,
    name: user.fullName,
    avatar: initialsOf(user.fullName),
    branch: user.branch || '',
    college: user.college || '',
    score: user.campusCredScore || 0,
    level: user.level || 'Starter',
    streak: user.streakDays || 0,
    tasksCompleted: entries.find(e => e.id === user.id)?.tasksCompleted || 0,
    change: 'same',
    changeValue: 0,
  } : undefined;

  const rankColors: Record<number, string> = {
    1: 'from-amber-300 to-amber-500',
    2: 'from-slate-300 to-slate-500',
    3: 'from-orange-300 to-orange-500',
  };

  const rankIcons: Record<number, React.ReactNode> = {
    1: <Crown className="w-6 h-6 text-amber-500" />,
    2: <Medal className="w-6 h-6 text-slate-400" />,
    3: <Medal className="w-6 h-6 text-orange-400" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2"><Trophy className="w-6 h-6 text-amber-500" /> Leaderboard</h1>
          <p className="text-sm text-text-secondary">See how you rank against other students</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-3 py-1">
            <Star className="w-3.5 h-3.5 mr-1" />Your Rank: {myRank ? `#${myRank}` : '—'}
          </Badge>
        </div>
      </div>

      {/* My Position Card */}
      {myEntry && myRank !== null && (
        <div className="animate-fade-in">
          <Card className="border-2 border-electric/20 bg-electric/[0.03]">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-navy">#{myEntry.rank}</div>
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-navy text-white text-sm font-semibold">{myEntry.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{myEntry.name} <Badge variant="outline" className="text-[10px] ml-1">You</Badge></p>
                  <p className="text-xs text-text-secondary">{myEntry.branch} • {myEntry.college}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-navy">{myEntry.score}</p>
                  <p className="text-[10px] text-text-secondary">CampusCred Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name or college..." className="pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button variant="outline" size="sm" className="gap-1 whitespace-nowrap" onClick={() => setSelectedBranch('All')}>
            <Filter className="w-3.5 h-3.5" />{selectedBranch === 'All' ? 'All Branches' : selectedBranch}
          </Button>
          {branches.slice(1, 6).map(branch => (
            <Button
              key={branch}
              variant={selectedBranch === branch ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedBranch(branch)}
              className="whitespace-nowrap"
            >
              {branch}
            </Button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3">
        {top3.map((entry, i) => {
          const levelInfo = getLevelInfo(entry.level);
          const isFirst = entry.rank === 1;
          return (
            <div
              key={entry.id}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <Card className={`text-center ${isFirst ? 'border-2 border-amber-300 shadow-lg shadow-amber-200/50 -mt-4' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex justify-center mb-2">{rankIcons[entry.rank]}</div>
                  <Avatar className={`w-${isFirst ? '14' : '12'} h-${isFirst ? '14' : '12'} mx-auto mb-2`}>
                    <AvatarFallback className={`bg-gradient-to-br ${rankColors[entry.rank] || 'from-slate-300 to-slate-500'} text-white font-bold ${isFirst ? 'text-base' : 'text-sm'}`}>
                      {entry.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <p className={`font-semibold ${isFirst ? 'text-sm' : 'text-xs'} truncate`}>{entry.name}</p>
                  <p className="text-[10px] text-text-secondary truncate">{entry.branch}</p>
                  <div className="mt-2">
                    <p className={`font-bold ${isFirst ? 'text-lg' : 'text-sm'} text-navy`}>{entry.score}</p>
                    <Badge className={`text-[9px] px-1.5 py-0 ${levelInfo.bgClass}`}>{entry.level} {levelInfo.icon}</Badge>
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {entry.change === 'up' && <ArrowUp className="w-3 h-3 text-green-500" />}
                    {entry.change === 'down' && <ArrowDown className="w-3 h-3 text-red-500" />}
                    {entry.change === 'same' && <Minus className="w-3 h-3 text-text-secondary" />}
                    <span className="text-[10px] text-text-secondary">{entry.changeValue > 0 ? entry.changeValue : '—'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Rest of Leaderboard */}
      <Card>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[3rem_1fr_6rem_5rem_5rem_4rem_3rem] gap-2 p-3 border-b bg-muted/50 text-xs font-medium text-text-secondary" style={{ borderColor: '#E2E8F0' }}>
            <span>Rank</span>
            <span>Student</span>
            <span>Branch</span>
            <span>Score</span>
            <span>Level</span>
            <span>Streak</span>
            <span>Change</span>
          </div>

          {/* Table Rows */}
          <div className="divide-y" style={{ borderColor: '#E2E8F0' }}>
            {rest.map((entry, i) => {
              const levelInfo = getLevelInfo(entry.level);
              return (
                <div
                  key={entry.id}
                  className={`animate-fade-in grid grid-cols-[3rem_1fr_6rem_5rem_5rem_4rem_3rem] gap-2 p-3 items-center hover:bg-muted/30 transition-colors ${
                    entry.rank === myRank ? 'bg-electric/[0.03] border-l-2 border-electric' : ''
                  }`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <span className="text-sm font-bold text-text-secondary">#{entry.rank}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-navy text-white text-[10px] font-semibold">{entry.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{entry.name} {entry.rank === myRank && <Badge variant="outline" className="text-[8px] ml-1 py-0">You</Badge>}</p>
                      <p className="text-[10px] text-text-secondary truncate sm:hidden">{entry.branch} • {entry.score} pts</p>
                      <p className="text-[10px] text-text-secondary truncate hidden sm:block">{entry.college}</p>
                    </div>
                  </div>
                  <span className="text-xs text-text-secondary hidden sm:block">{entry.branch}</span>
                  <span className="text-sm font-bold text-navy hidden sm:block">{entry.score}</span>
                  <Badge className={`text-[9px] px-1.5 py-0 hidden sm:inline-flex ${levelInfo.bgClass}`}>{entry.level}</Badge>
                  <span className="text-xs text-text-secondary hidden sm:flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" />{entry.streak}</span>
                  <span className="hidden sm:flex items-center">
                    {entry.change === 'up' && <ArrowUp className="w-3.5 h-3.5 text-green-500" />}
                    {entry.change === 'down' && <ArrowDown className="w-3.5 h-3.5 text-red-500" />}
                    {entry.change === 'same' && <Minus className="w-3.5 h-3.5 text-text-secondary" />}
                    <span className="text-[10px] text-text-secondary ml-0.5">{entry.changeValue > 0 ? entry.changeValue : ''}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Branch Summary */}
      <div>
        <h2 className="text-lg font-semibold font-heading mb-4">Branch-wise Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['CSE', 'ECE', 'IT', 'Data Science'].map((branch, i) => {
            const branchEntries = globalEntries.filter(e => e.branch === branch);
            const avgScore = branchEntries.length > 0 ? Math.round(branchEntries.reduce((sum, e) => sum + e.score, 0) / branchEntries.length) : 0;
            return (
              <div key={branch} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <Card className="hover:shadow-sm transition-shadow cursor-pointer" onClick={() => setSelectedBranch(branch)}>
                  <CardContent className="p-4 text-center">
                    <GraduationCap className="w-5 h-5 text-electric mx-auto mb-2" />
                    <p className="text-sm font-semibold">{branch}</p>
                    <p className="text-lg font-bold text-navy">{avgScore}</p>
                    <p className="text-[10px] text-text-secondary">avg score • {branchEntries.length} students</p>
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
