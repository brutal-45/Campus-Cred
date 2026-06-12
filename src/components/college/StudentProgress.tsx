'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Search,
  GraduationCap,
  Trophy,
  Award,
  Flame,
  Star,
  Users,
} from 'lucide-react';

interface StudentData {
  id: string;
  fullName: string;
  email: string;
  college: string;
  degree: string;
  branch: string;
  year: string;
  points: number;
  level: string;
  streakDays: number;
  isVerified: boolean;
  createdAt: string;
}

export function StudentProgress() {
  const { token } = useAppStore();
  const [students, setStudents] = React.useState<StudentData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    const fetchStudents = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/admin/students?limit=50', { headers });
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [token]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Legend': return 'bg-gold/10 text-gold border-gold/20';
      case 'Pro': return 'bg-purple/10 text-purple border-purple/20';
      case 'Expert': return 'bg-electric/10 text-electric border-electric/20';
      case 'Achiever': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getProgressToNextLevel = (points: number) => {
    const thresholds = [
      { level: 'Starter', min: 0 },
      { level: 'Achiever', min: 50 },
      { level: 'Expert', min: 150 },
      { level: 'Pro', min: 300 },
      { level: 'Legend', min: 500 },
    ];

    let currentIndex = 0;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (points >= thresholds[i].min) {
        currentIndex = i;
        break;
      }
    }

    if (currentIndex >= thresholds.length - 1) return 100;
    const current = thresholds[currentIndex].min;
    const next = thresholds[currentIndex + 1].min;
    return Math.round(((points - current) / (next - current)) * 100);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.branch || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground">Student Progress</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track completion rates, certificates, and points for students from your college
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or branch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No students found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-11 h-11">
                    <AvatarFallback className="bg-electric/10 text-electric text-sm font-semibold">
                      {student.fullName.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{student.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {student.degree && student.branch
                        ? `${student.degree} - ${student.branch}`
                        : 'No degree info'}
                    </p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${getLevelColor(student.level)}`}>
                    {student.level}
                  </Badge>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Trophy className="w-3 h-3 text-warning" />
                    </div>
                    <p className="text-sm font-bold">{student.points}</p>
                    <p className="text-[9px] text-muted-foreground">Points</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Flame className="w-3 h-3 text-orange-500" />
                    </div>
                    <p className="text-sm font-bold">{student.streakDays || 0}</p>
                    <p className="text-[9px] text-muted-foreground">Streak</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Award className="w-3 h-3 text-success" />
                    </div>
                    <p className="text-sm font-bold">0</p>
                    <p className="text-[9px] text-muted-foreground">Certs</p>
                  </div>
                </div>

                {/* Level progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{student.level}</span>
                    <span>{getProgressToNextLevel(student.points)}% to next</span>
                  </div>
                  <Progress value={getProgressToNextLevel(student.points)} className="h-1.5" />
                </div>

                {/* Year and college */}
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  {student.year && (
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {student.year}
                    </span>
                  )}
                  {student.college && (
                    <span className="truncate">{student.college}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
