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

interface LeaderboardEntry {
  id: string; rank: number; name: string; avatar: string; branch: string; college: string;
  score: number; level: string; streak: number; tasksCompleted: number; change: 'up' | 'down' | 'same';
  changeValue: number;
}

const branches = ['All', 'CSE', 'ECE', 'IT', 'Mechanical', 'Civil', 'EEE', 'Data Science', 'AI & ML'];

const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', rank: 1, name: 'Arjun Mehta', avatar: 'AM', branch: 'CSE', college: 'IIT Delhi', score: 920, level: 'Legend', streak: 45, tasksCompleted: 28, change: 'same', changeValue: 0 },
  { id: '2', rank: 2, name: 'Priya Sharma', avatar: 'PS', branch: 'CSE', college: 'IIT Bombay', score: 875, level: 'Elite', streak: 38, tasksCompleted: 25, change: 'up', changeValue: 2 },
  { id: '3', rank: 3, name: 'Rahul Verma', avatar: 'RV', branch: 'ECE', college: 'NIT Trichy', score: 810, level: 'Elite', streak: 30, tasksCompleted: 22, change: 'down', changeValue: 1 },
  { id: '4', rank: 4, name: 'Sneha Iyer', avatar: 'SI', branch: 'IT', college: 'VIT Vellore', score: 750, level: 'Elite', streak: 25, tasksCompleted: 20, change: 'up', changeValue: 3 },
  { id: '5', rank: 5, name: 'Vikram Singh', avatar: 'VS', branch: 'CSE', college: 'IIIT Hyderabad', score: 680, level: 'Elite', streak: 22, tasksCompleted: 18, change: 'same', changeValue: 0 },
  { id: '6', rank: 6, name: 'Ananya Patel', avatar: 'AP', branch: 'Data Science', college: 'BITS Pilani', score: 620, level: 'Expert', streak: 18, tasksCompleted: 16, change: 'up', changeValue: 5 },
  { id: '7', rank: 7, name: 'Karthik R', avatar: 'KR', branch: 'AI & ML', college: 'IIT Madras', score: 580, level: 'Expert', streak: 15, tasksCompleted: 15, change: 'down', changeValue: 2 },
  { id: '8', rank: 8, name: 'Deepa M', avatar: 'DM', branch: 'CSE', college: 'NIT Warangal', score: 540, level: 'Expert', streak: 12, tasksCompleted: 14, change: 'up', changeValue: 1 },
  { id: '9', rank: 9, name: 'Suresh Kumar', avatar: 'SK', branch: 'Mechanical', college: 'DTU Delhi', score: 480, level: 'Expert', streak: 10, tasksCompleted: 12, change: 'down', changeValue: 3 },
  { id: '10', rank: 10, name: 'Meera Joshi', avatar: 'MJ', branch: 'ECE', college: 'NSUT Delhi', score: 450, level: 'Expert', streak: 9, tasksCompleted: 11, change: 'up', changeValue: 2 },
  { id: '11', rank: 11, name: 'Aditya Rao', avatar: 'AR', branch: 'Civil', college: 'COEP Pune', score: 400, level: 'Expert', streak: 7, tasksCompleted: 10, change: 'same', changeValue: 0 },
  { id: '12', rank: 12, name: 'Nisha Gupta', avatar: 'NG', branch: 'CSE', college: 'Jadavpur University', score: 380, level: 'Expert', streak: 8, tasksCompleted: 9, change: 'up', changeValue: 4 },
  { id: '13', rank: 13, name: 'Rohan Das', avatar: 'RD', branch: 'EEE', college: 'IIT Kharagpur', score: 350, level: 'Expert', streak: 6, tasksCompleted: 8, change: 'down', changeValue: 1 },
  { id: '14', rank: 14, name: 'Pooja Reddy', avatar: 'PR', branch: 'IT', college: 'IIIT Delhi', score: 310, level: 'Achiever', streak: 5, tasksCompleted: 7, change: 'up', changeValue: 2 },
  { id: '15', rank: 15, name: 'Siddharth Nair', avatar: 'SN', branch: 'Data Science', college: 'IISC Bangalore', score: 280, level: 'Achiever', streak: 4, tasksCompleted: 6, change: 'down', changeValue: 2 },
];

const getLevelInfo = (levelName: string) => LEVEL_THRESHOLDS.find(l => l.level === levelName) || LEVEL_THRESHOLDS[0];

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedBranch, setSelectedBranch] = React.useState('All');
  const [timeframe, setTimeframe] = React.useState('all');

  const filteredEntries = mockLeaderboard.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.college.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBranch = selectedBranch === 'All' || entry.branch === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  const top3 = filteredEntries.slice(0, 3);
  const rest = filteredEntries.slice(3);

  const myRank = 12;
  const myEntry = mockLeaderboard.find(e => e.rank === myRank);

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
            <Star className="w-3.5 h-3.5 mr-1" />Your Rank: #{myRank}
          </Badge>
        </div>
      </div>

      {/* My Position Card */}
      {myEntry && (
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
            const branchEntries = mockLeaderboard.filter(e => e.branch === branch);
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
