'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store';
import { Trophy, Medal, Award, ChevronRight } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  id: string;
  fullName: string;
  points: number;
  level: string;
  college: string;
  isCurrentUser: boolean;
}

const rankIcons = [
  <Trophy key="1" className="w-4 h-4 text-yellow-500" />,
  <Medal key="2" className="w-4 h-4 text-gray-400" />,
  <Award key="3" className="w-4 h-4 text-amber-700" />,
];

/**
 * LeaderboardWidget
 *
 * Design rules:
 * - Card style: white bg, 1px border, 12px radius, subtle shadow
 * - Simple CSS fade-in animation (no framer-motion)
 * - Skeleton loading states with shimmer
 * - Current user highlight: electric blue bg at 5%, left border
 * - 4px spacing grid
 */
export function LeaderboardWidget() {
  const { user, token } = useAppStore();

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', user?.branch],
    queryFn: async () => {
      const res = await fetch('/api/student/leaderboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      return res.json();
    },
    enabled: !!token,
  });

  const leaderboard: LeaderboardEntry[] = data?.leaderboard || [];

  return (
    <div className="bg-card border rounded-xl shadow-sm overflow-hidden animate-fade-in" style={{ borderColor: '#E2E8F0' }}>
      <div className="p-4" style={{ borderBottom: '1px solid #E2E8F0' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold font-heading flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Leaderboard
          </h3>
          <Badge variant="secondary" className="text-[10px]">
            {data?.currentUserBranch || 'Your Branch'}
          </Badge>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded-full skeleton-shimmer" />
                <Skeleton className="w-8 h-8 rounded-full skeleton-shimmer" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-24 mb-1 skeleton-shimmer" />
                  <Skeleton className="h-2 w-16 skeleton-shimmer" />
                </div>
                <Skeleton className="h-3 w-10 skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto text-text-secondary mb-2" />
            <p className="text-sm text-text-secondary">No students yet</p>
          </div>
        ) : (
          <div>
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                  entry.isCurrentUser
                    ? 'border-l-2 border-l-electric'
                    : 'hover:bg-muted/50'
                }`}
                style={entry.isCurrentUser ? { backgroundColor: 'rgba(59,130,246,0.05)' } : undefined}
              >
                {/* Rank */}
                <div className="w-6 flex items-center justify-center">
                  {index < 3 ? (
                    rankIcons[index]
                  ) : (
                    <span className="text-xs text-text-secondary font-medium">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="w-8 h-8">
                  <AvatarFallback
                    className={`text-xs font-semibold ${
                      entry.isCurrentUser
                        ? 'bg-electric text-white'
                        : 'bg-muted text-text-secondary'
                    }`}
                  >
                    {entry.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>

                {/* Name and college */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      entry.isCurrentUser ? 'text-electric' : 'text-foreground'
                    }`}
                  >
                    {entry.fullName}
                    {entry.isCurrentUser && (
                      <span className="text-[10px] ml-1 text-electric/70">(You)</span>
                    )}
                  </p>
                  <p className="text-[10px] text-text-secondary truncate">
                    {entry.college}
                  </p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">
                    {entry.points}
                  </p>
                  <p className="text-[10px] text-text-secondary">pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3" style={{ borderTop: '1px solid #E2E8F0' }}>
        <button
          onClick={() => useAppStore.getState().navigate('hall-of-fame')}
          className="w-full flex items-center justify-center gap-1 text-xs text-electric hover:text-electric-dark transition-colors font-medium"
        >
          View Hall of Fame
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
