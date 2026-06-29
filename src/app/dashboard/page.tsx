'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  User, FileText, Zap, Users, Map, MessageSquare, Bell, Megaphone, Trophy,
  Flame, Target, Award, ArrowRight, Sparkles, TrendingUp, Clock, BookOpen,
  Download, ExternalLink,
} from 'lucide-react';

const quickLinks = [
  { label: 'Certificates', href: '/dashboard/certificates', icon: Award, color: 'from-amber-400 to-yellow-600', desc: 'View & download' },
  { label: 'Portfolio', href: '/dashboard/portfolio', icon: User, color: 'from-blue-400 to-blue-600', desc: 'Edit your public profile' },
  { label: 'Resume', href: '/dashboard/resume', icon: FileText, color: 'from-purple-400 to-purple-600', desc: 'Build your resume' },
  { label: 'Challenges', href: '/dashboard/challenges', icon: Zap, color: 'from-amber-400 to-orange-600', desc: 'Daily challenges' },
  { label: 'Mentorship', href: '/dashboard/mentorship', icon: Users, color: 'from-emerald-400 to-emerald-600', desc: 'Book sessions' },
  { label: 'Journey', href: '/dashboard/journey', icon: Map, color: 'from-rose-400 to-rose-600', desc: 'Track progress' },
  { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare, color: 'from-cyan-400 to-cyan-600', desc: 'View messages' },
  { label: 'Ambassador', href: '/dashboard/ambassador', icon: Megaphone, color: 'from-yellow-400 to-yellow-600', desc: 'Refer & earn' },
];

const recentActivity = [
  { text: 'Welcome certificate generated!', time: 'Just now', icon: Award, color: 'text-amber-500' },
  { text: 'Profile setup completed', time: 'Just now', icon: Target, color: 'text-green-500' },
  { text: 'Start your first challenge', time: 'Ready', icon: Zap, color: 'text-orange-500' },
  { text: 'Build your portfolio', time: 'Ready', icon: BookOpen, color: 'text-purple-500' },
];

export default function DashboardOverviewPage() {
  const { user, token } = useAppStore();
  const score = user?.campusCredScore ?? 0;
  const streakDays = user?.streakDays ?? 0;

  // Fetch real certificate count
  const { data: certData } = useQuery({
    queryKey: ['dashboard-certificates'],
    queryFn: async () => {
      const res = await fetch('/api/student/certificates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!token,
  });

  const certCount = certData?.certificates?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="animate-fade-in relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-navy opacity-95" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-white/70 text-sm">Welcome back,</p>
              <h1 className="text-2xl md:text-3xl font-bold font-heading text-white">{user?.fullName || 'Student'}!</h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge className="bg-white/20 text-white border-white/30">{user?.level || 'Starter'} {score}/1000</Badge>
                <Badge className="bg-orange-500/30 text-orange-200 border-orange-500/40">
                  <Flame className="w-3 h-3 mr-1" />{streakDays} day streak
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <Button asChild className="bg-gold text-navy hover:bg-gold/90 font-semibold shadow-lg gap-2">
                <Link href="/dashboard/certificates">
                  <Award className="w-4 h-4" /> My Certificates
                </Link>
              </Button>
              <Button asChild className="bg-white text-navy hover:bg-white/90 font-semibold shadow-lg">
                <Link href="/dashboard/challenges">
                  <Zap className="w-4 h-4 mr-2" />Daily Challenge
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'CampusCred Score', value: score, max: 1000, icon: Target, color: 'text-electric' },
          { label: 'Day Streak', value: streakDays, max: 30, icon: Flame, color: 'text-orange-500' },
          { label: 'Certificates', value: certCount, max: 10, icon: Award, color: 'text-amber-500' },
          { label: 'Level', value: user?.level || 'Starter', max: 5, icon: Sparkles, color: 'text-purple-500', isText: true },
        ].map((stat, i) => (
          <div key={stat.label} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-text-secondary mb-2">{stat.label}</p>
                {!stat.isText && <Progress value={(typeof stat.value === 'number' ? stat.value : 0 / stat.max) * 100} className="h-1.5" />}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Certificate Quick Access — Prominent */}
      {certCount > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Card className="border-gold/30 bg-gradient-to-r from-gold/5 to-amber-50/50 dark:from-gold/5 dark:to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-gold" /> Your Certificates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex -space-x-2">
                  {certData?.certificates?.slice(0, 3).map((cert: any, i: number) => (
                    <div key={cert.id} className="w-12 h-12 rounded-xl bg-navy border-2 border-white dark:border-navy-light flex items-center justify-center shadow-sm">
                      <Award className="w-6 h-6 text-gold" />
                    </div>
                  ))}
                  {certCount > 3 && (
                    <div className="w-12 h-12 rounded-xl bg-muted border-2 border-white dark:border-navy-light flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-text-secondary">+{certCount - 3}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{certCount} certificate{certCount !== 1 ? 's' : ''} earned</p>
                  <p className="text-xs text-text-secondary">Download, share, and verify your achievements</p>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" className="gap-2 bg-gold text-navy hover:bg-gold/90 font-semibold">
                    <Link href="/dashboard/certificates">
                      <Download className="w-4 h-4" /> Download
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link href="/dashboard/certificates">
                      <ExternalLink className="w-4 h-4" /> View All
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Links Grid */}
      <div>
        <h2 className="text-lg font-semibold font-heading mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {quickLinks.map((link, i) => (
            <div key={link.href} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <Link href={link.href}>
                <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group h-full">
                  <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                      <link.icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-sm font-semibold">{link.label}</p>
                    <p className="text-[10px] text-text-secondary">{link.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-text-secondary" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((activity, i) => (
            <div key={i} className="animate-fade-in flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors" style={{ animationDelay: `${i * 100}ms` }}>
              <activity.icon className={`w-4 h-4 flex-shrink-0 ${activity.color}`} />
              <p className="text-sm flex-1">{activity.text}</p>
              <span className="text-xs text-text-secondary whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
