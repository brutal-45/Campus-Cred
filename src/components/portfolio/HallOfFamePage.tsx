'use client';

import React, { useEffect, useState } from 'react';
import {
  Trophy, Medal, Crown, Flame, Star, ChevronDown,
  GraduationCap, MapPin, Building2, ExternalLink, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { ScoreRing } from '@/components/dashboard/LevelBadge';
import { LEVEL_THRESHOLDS, DEGREE_BRANCH_MAP } from '@/lib/constants';
import { getLevelForScore } from '@/lib/score-service';
import { useAppStore } from '@/store';
import { BackButton } from '@/components/shared/BackButton';

interface HallOfFameStudent {
  id: string;
  fullName: string;
  campusCredScore: number;
  level: string;
  branch: string;
  degree: string;
  college: string;
  profilePhoto: string | null;
  campusCredUsername: string | null;
}

interface BranchGroup {
  branch: string;
  students: HallOfFameStudent[];
}

export function HallOfFamePage() {
  const { navigate } = useAppStore();
  const [data, setData] = useState<{
    type: string;
    branches: BranchGroup[];
    topOverall: HallOfFameStudent[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchHallOfFame();
  }, []);

  const fetchHallOfFame = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/hall-of-fame');
      if (res.ok) {
        const result = await res.json();
        setData(result);
        // Auto-expand first 3 branches
        if (result.branches) {
          const initial = new Set(result.branches.slice(0, 3).map((b: BranchGroup) => b.branch));
          setExpandedBranches(initial);
        }
      }
    } catch (error) {
      console.error('Failed to fetch Hall of Fame:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBranch = (branch: string) => {
    setExpandedBranches(prev => {
      const next = new Set(prev);
      if (next.has(branch)) {
        next.delete(branch);
      } else {
        next.add(branch);
      }
      return next;
    });
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-amber-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="text-sm font-bold text-text-secondary w-6 text-center">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 border-gray-200';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200';
    return 'bg-card border-border';
  };

  // Filter branches by search
  const filteredBranches = data?.branches.filter(b =>
    !searchQuery || b.branch.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-16 h-16 border-4 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading Hall of Fame...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-muted/50 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="mb-4">
            <BackButton onClick={() => navigate('dashboard')} to="Dashboard" />
          </div>

          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200/50 animate-fade-in"
              style={{ animationDelay: '200ms' }}
            >
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-heading text-navy">
              Hall of Fame
            </h1>
            <p className="text-text-secondary mt-2">
              Top 10 students per branch on CampusCred — the brightest talent in India
            </p>
          </div>
        </div>

        {/* Top 3 Podium */}
        {data?.topOverall && data.topOverall.length > 0 && (
          <div
            className="mb-10 animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            <h2 className="text-lg font-bold font-heading text-center mb-6 flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              Overall Top Performers
            </h2>
            <div className="flex items-end justify-center gap-3 sm:gap-4">
              {/* 2nd place */}
              {data.topOverall[1] && (
                <PodiumCard student={data.topOverall[1]} rank={2} />
              )}
              {/* 1st place */}
              {data.topOverall[0] && (
                <PodiumCard student={data.topOverall[0]} rank={1} />
              )}
              {/* 3rd place */}
              {data.topOverall[2] && (
                <PodiumCard student={data.topOverall[2]} rank={3} />
              )}
            </div>
          </div>
        )}

        {/* Search */}
        <div
          className="mb-6 animate-fade-in"
          style={{ animationDelay: '300ms' }}
        >
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input
              placeholder="Search by branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Branch-wise Rankings */}
        <div className="space-y-4">
          {filteredBranches.map((branchGroup, bIdx) => (
            <div
              key={branchGroup.branch}
              className="animate-fade-in"
              style={{ animationDelay: `${bIdx * 100}ms` }}
            >
              <Card className="cc-card overflow-hidden">
                <button
                  onClick={() => toggleBranch(branchGroup.branch)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-electric/10 to-purple/10 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-electric" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-sm">{branchGroup.branch}</h3>
                      <p className="text-xs text-text-secondary">{branchGroup.students.length} top students</p>
                    </div>
                  </div>
                  <div
                    className="transition-transform duration-200"
                    style={{ transform: expandedBranches.has(branchGroup.branch) ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <ChevronDown className="w-5 h-5 text-text-secondary" />
                  </div>
                </button>

                {expandedBranches.has(branchGroup.branch) && (
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-2">
                      {branchGroup.students.map((student, sIdx) => {
                        const levelInfo = getLevelForScore(student.campusCredScore);
                        const levelData = LEVEL_THRESHOLDS.find(l => l.level === levelInfo.level) || LEVEL_THRESHOLDS[0];
                        return (
                          <div
                            key={student.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border animate-fade-in ${getRankBg(sIdx + 1)}`}
                            style={{ animationDelay: `${sIdx * 30}ms` }}
                          >
                            {/* Rank */}
                            <div className="w-8 flex justify-center shrink-0">
                              {getRankIcon(sIdx + 1)}
                            </div>

                            {/* Avatar */}
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={student.profilePhoto || undefined} />
                              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-electric to-purple text-white">
                                {student.fullName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm truncate">
                                  {student.campusCredUsername ? (
                                    <a
                                      href={`/student/${student.campusCredUsername}`}
                                      className="hover:text-electric transition-colors"
                                    >
                                      {student.fullName}
                                    </a>
                                  ) : (
                                    student.fullName
                                  )}
                                </h4>
                                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${levelData.bgClass}`}>
                                  {levelInfo.icon} {levelInfo.level}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                                {student.college && (
                                  <span className="flex items-center gap-0.5 truncate">
                                    <Building2 className="w-3 h-3" />
                                    {student.college}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Score */}
                            <div className="text-right shrink-0">
                              <div className="text-lg font-bold" style={{ color: levelData.color }}>
                                {student.campusCredScore}
                              </div>
                              <div className="text-[10px] text-text-secondary">score</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>

        {/* No results */}
        {filteredBranches.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-text-secondary/30 mx-auto" />
            <h3 className="text-lg font-semibold mt-4">
              {searchQuery ? 'No branches match your search' : 'No rankings yet'}
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              {searchQuery ? 'Try a different search term' : 'Rankings will appear as students earn CampusCred Scores'}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8 mt-8 border-t" style={{ borderColor: '#E2E8F0' }}>
          <CampusCredLogo size={28} variant="dark" animate={false} />
          <p className="text-xs text-text-secondary mt-2">
            Rankings are updated in real-time based on CampusCred Scores
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Podium Card ───

function PodiumCard({ student, rank }: { student: HallOfFameStudent; rank: number }) {
  const levelInfo = getLevelForScore(student.campusCredScore);
  const levelData = LEVEL_THRESHOLDS.find(l => l.level === levelInfo.level) || LEVEL_THRESHOLDS[0];
  const heights: Record<number, string> = { 1: 'h-44', 2: 'h-36', 3: 'h-32' };
  const crownColors: Record<number, string> = { 1: 'text-amber-400', 2: 'text-gray-400', 3: 'text-amber-700' };
  const initials = student.fullName.split(' ').map(n => n[0]).join('');

  return (
    <div
      className={`flex flex-col items-center animate-fade-in ${rank === 1 ? 'order-2' : rank === 2 ? 'order-1' : 'order-3'}`}
      style={{ animationDelay: `${300 + rank * 150}ms` }}
    >
      <div className="text-center mb-2">
        <div className={`${crownColors[rank]} mb-1`}>
          {rank === 1 ? <Crown className="w-6 h-6 mx-auto" /> : <Medal className="w-5 h-5 mx-auto" />}
        </div>
        <Avatar className={`w-${rank === 1 ? '16' : '14'} h-${rank === 1 ? '16' : '14'} border-2 ${rank === 1 ? 'border-amber-400' : 'border-border'} shadow-lg`}>
          <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-electric to-purple text-white">
            {initials}
          </AvatarFallback>
          <AvatarImage src={student.profilePhoto || undefined} />
        </Avatar>
        <h3 className="font-bold text-sm mt-2 truncate max-w-[120px]">
          {student.campusCredUsername ? (
            <a href={`/student/${student.campusCredUsername}`} className="hover:text-electric transition-colors">
              {student.fullName}
            </a>
          ) : student.fullName}
        </h3>
        <Badge variant="outline" className={`text-[10px] mt-1 ${levelData.bgClass}`}>
          {levelInfo.icon} {levelInfo.level}
        </Badge>
        <div className="text-lg font-bold mt-1" style={{ color: levelData.color }}>
          {student.campusCredScore}
        </div>
        <p className="text-[10px] text-text-secondary">{student.college}</p>
      </div>
      <div className={`${heights[rank]} w-20 sm:w-24 rounded-t-lg bg-gradient-to-t ${levelData.gradient} opacity-20`} />
    </div>
  );
}
