'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell, CheckCircle, X, Filter, CheckCheck, Trash2, Clock, Star,
  Award, MessageSquare, Users, Zap, Trophy, BookOpen, Briefcase,
  Megaphone, Settings, AlertCircle, Info, Sparkles, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string; title: string; message: string; time: string; read: boolean; type: 'task' | 'certificate' | 'mentorship' | 'streak' | 'system' | 'social' | 'achievement';
  actionUrl?: string; actionLabel?: string;
}

const mockNotifications: Notification[] = [
  { id: '1', title: 'Certificate Ready! 🎉', message: 'Your "Web Development Professional" certificate is ready for download. Share it on LinkedIn!', time: '5m ago', read: false, type: 'certificate', actionUrl: '/dashboard/portfolio', actionLabel: 'View Certificate' },
  { id: '2', title: 'New Challenge Available', message: 'Today\'s challenge: "Build a REST API" - Complete it to earn 50 points and maintain your streak!', time: '1h ago', read: false, type: 'task', actionUrl: '/dashboard/challenges', actionLabel: 'Start Challenge' },
  { id: '3', title: 'Mentor Session Reminder', message: 'Your session with Priya Sharma starts in 30 minutes. Don\'t forget to prepare your questions!', time: '2h ago', read: false, type: 'mentorship', actionUrl: '/dashboard/mentorship', actionLabel: 'Join Session' },
  { id: '4', title: 'Streak Milestone! 🔥', message: 'Amazing! You\'ve maintained a 7-day streak. Keep going to unlock the 14-day badge!', time: '1d ago', read: true, type: 'streak' },
  { id: '5', title: 'Task Submission Approved', message: 'Your submission for "UI Design Challenge" has been approved. +70 points added to your score!', time: '1d ago', read: true, type: 'achievement' },
  { id: '6', title: 'New Message from Rahul', message: 'Rahul Verma sent you a message about mock interview preparation.', time: '2d ago', read: true, type: 'social', actionUrl: '/dashboard/messages', actionLabel: 'Reply' },
  { id: '7', title: 'Leaderboard Update', message: 'You moved up 3 positions in the CSE branch leaderboard! Current rank: #12', time: '2d ago', read: true, type: 'achievement', actionUrl: '/dashboard/leaderboard', actionLabel: 'View Leaderboard' },
  { id: '8', title: 'Ambassador Reward Unlocked', message: 'You\'ve earned the "Silver Ambassador" badge for referring 5 students! Claim your reward.', time: '3d ago', read: true, type: 'system', actionUrl: '/dashboard/ambassador', actionLabel: 'Claim Reward' },
  { id: '9', title: 'System Update', message: 'CampusCred now supports PDF certificate downloads! Update your portfolio to showcase them.', time: '4d ago', read: true, type: 'system' },
  { id: '10', title: 'Internship Opportunity', message: 'New micro-internship at Flipkart matching your skills. Apply before the deadline!', time: '5d ago', read: true, type: 'task', actionUrl: '/dashboard/journey', actionLabel: 'Apply Now' },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  task: { icon: BookOpen, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  certificate: { icon: Award, color: 'text-amber-500', bgColor: 'bg-amber-100' },
  mentorship: { icon: Users, color: 'text-purple-500', bgColor: 'bg-purple-100' },
  streak: { icon: Zap, color: 'text-orange-500', bgColor: 'bg-orange-100' },
  system: { icon: Settings, color: 'text-slate-500', bgColor: 'bg-slate-100' },
  social: { icon: MessageSquare, color: 'text-cyan-500', bgColor: 'bg-cyan-100' },
  achievement: { icon: Trophy, color: 'text-emerald-500', bgColor: 'bg-emerald-100' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = React.useState<string>('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const clearAll = () => {
    setNotifications(prev => prev.filter(n => !n.read));
    toast.success('Read notifications cleared');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2"><Bell className="w-6 h-6 text-electric" /> Notifications</h1>
          <p className="text-sm text-text-secondary">Stay updated on your activities and achievements</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge className="bg-electric/10 text-electric border-electric/20 px-3 py-1">{unreadCount} unread</Badge>
          )}
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-1.5" disabled={unreadCount === 0}>
            <CheckCheck className="w-4 h-4" />Mark all read
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll} className="gap-1.5">
            <Trash2 className="w-4 h-4" />Clear read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'task', label: 'Tasks', count: notifications.filter(n => n.type === 'task').length },
          { id: 'certificate', label: 'Certificates', count: notifications.filter(n => n.type === 'certificate').length },
          { id: 'achievement', label: 'Achievements', count: notifications.filter(n => n.type === 'achievement').length },
          { id: 'social', label: 'Social', count: notifications.filter(n => n.type === 'social').length },
          { id: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length },
        ].map(f => (
          <Button
            key={f.id}
            variant={filter === f.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.id)}
            className="gap-1.5 whitespace-nowrap"
          >
            {f.label}
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">{f.count}</Badge>
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        <>
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-text-secondary/30 mx-auto mb-3" />
                <p className="text-sm font-semibold">No notifications</p>
                <p className="text-xs text-text-secondary mt-1">You&apos;re all caught up! Check back later.</p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification, i) => {
              const config = typeConfig[notification.type] || typeConfig.system;
              const Icon = config.icon;

              return (
                <div
                  key={notification.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <Card className={`hover:shadow-sm transition-all duration-200 ${!notification.read ? 'border-electric/20 bg-electric/[0.02]' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {!notification.read && <span className="w-2 h-2 rounded-full bg-electric flex-shrink-0" />}
                                <h4 className="text-sm font-semibold">{notification.title}</h4>
                              </div>
                              <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{notification.message}</p>
                            </div>
                            <span className="text-[10px] text-text-secondary whitespace-nowrap flex-shrink-0">{notification.time}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {notification.actionLabel && (
                              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                                {notification.actionLabel}
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                            {!notification.read && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => markAsRead(notification.id)}>
                                <CheckCircle className="w-3 h-3" />Mark read
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-text-secondary hover:text-danger ml-auto" onClick={() => deleteNotification(notification.id)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })
          )}
        </>
      </div>
    </div>
  );
}
