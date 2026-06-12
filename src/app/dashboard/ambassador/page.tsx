'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Megaphone, Copy, Share2, Users, Gift, Star, Trophy, CheckCircle,
  ExternalLink, QrCode, Twitter, Linkedin, MessageCircle, Link2,
  TrendingUp, Target, Award, Zap, Crown, Sparkles, ArrowRight, Wallet,
} from 'lucide-react';
import { toast } from 'sonner';

interface ReferralActivity {
  id: string; name: string; date: string; status: 'registered' | 'active' | 'rewarded'; points: number;
}

interface Reward {
  id: string; name: string; description: string; required: number; current: number; icon: React.ElementType; unlocked: boolean;
}

const mockActivities: ReferralActivity[] = [
  { id: '1', name: 'Amit Kumar', date: '2024-06-08', status: 'rewarded', points: 20 },
  { id: '2', name: 'Sneha Das', date: '2024-06-07', status: 'active', points: 20 },
  { id: '3', name: 'Vikram Singh', date: '2024-06-05', status: 'registered', points: 0 },
  { id: '4', name: 'Priya Nair', date: '2024-06-03', status: 'rewarded', points: 20 },
  { id: '5', name: 'Karthik R', date: '2024-06-01', status: 'active', points: 20 },
  { id: '6', name: 'Deepa M', date: '2024-05-28', status: 'rewarded', points: 20 },
];

const rewards: Reward[] = [
  { id: '1', name: 'Bronze Ambassador', description: 'Refer 3 students', required: 3, current: 3, icon: Award, unlocked: true },
  { id: '2', name: 'Silver Ambassador', description: 'Refer 5 students', required: 5, current: 5, icon: Star, unlocked: true },
  { id: '3', name: 'Gold Ambassador', description: 'Refer 10 students', required: 10, current: 7, icon: Crown, unlocked: false },
  { id: '4', name: 'Platinum Ambassador', description: 'Refer 25 students', required: 25, current: 7, icon: Trophy, unlocked: false },
  { id: '5', name: 'Legend Ambassador', description: 'Refer 50 students', required: 50, current: 7, icon: Sparkles, unlocked: false },
];

export default function AmbassadorPage() {
  const [referralCode] = React.useState('STUDENT2024XYZ');
  const [referralLink, setReferralLink] = React.useState('https://campuscred.in/r/STUDENT2024XYZ');
  const [copied, setCopied] = React.useState(false);
  const [totalReferrals] = React.useState(7);
  const [totalPoints] = React.useState(140);
  const [activeReferrals] = React.useState(4);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Join me on CampusCred! Complete real-world tasks, earn verified certificates, and get hired 🚀 Use my referral link: ${referralLink}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`Hey! Join CampusCred with my referral link. Complete real tasks, earn certificates, and build your career! 🎓 ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const statusColor: Record<string, string> = {
    registered: 'bg-blue-100 text-blue-700 border-blue-200',
    active: 'bg-green-100 text-green-700 border-green-200',
    rewarded: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading flex items-center gap-2"><Megaphone className="w-6 h-6 text-amber-500" /> Campus Ambassador</h1>
          <p className="text-sm text-text-secondary">Refer students, earn rewards, and grow the CampusCred community</p>
        </div>
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-3 py-1 w-fit">
          <Star className="w-3.5 h-3.5 mr-1" />Silver Ambassador
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Referrals', value: totalReferrals, icon: Users, color: 'text-electric' },
          { label: 'Active Referrals', value: activeReferrals, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Points Earned', value: totalPoints, icon: Zap, color: 'text-amber-500' },
          { label: 'Next Reward', value: '3 more', icon: Trophy, color: 'text-purple-500' },
        ].map((stat, i) => (
          <div key={stat.label} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <Card><CardContent className="p-4 text-center">
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-text-secondary">{stat.label}</p>
            </CardContent></Card>
          </div>
        ))}
      </div>

      {/* Referral Link Card */}
      <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-semibold">Your Referral Link</h3>
            </div>
            <div className="flex gap-2 mb-4">
              <Input value={referralLink} readOnly className="bg-white font-mono text-sm" />
              <Button onClick={copyLink} className="gap-2 bg-navy text-white whitespace-nowrap">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={shareOnTwitter} className="gap-2">
                <Twitter className="w-4 h-4" />Twitter
              </Button>
              <Button variant="outline" size="sm" onClick={shareOnLinkedIn} className="gap-2">
                <Linkedin className="w-4 h-4" />LinkedIn
              </Button>
              <Button variant="outline" size="sm" onClick={shareOnWhatsApp} className="gap-2">
                <MessageCircle className="w-4 h-4" />WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
                <Share2 className="w-4 h-4" />More
              </Button>
            </div>
            <div className="mt-4 p-3 bg-amber-100/50 rounded-lg">
              <p className="text-xs text-amber-800 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5" />
                You earn <strong>20 points</strong> for each referral who completes their first task!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Progress */}
      <div>
        <h2 className="text-lg font-semibold font-heading mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-purple-500" /> Rewards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward, i) => (
            <div key={reward.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <Card className={`${reward.unlocked ? 'border-amber-200 bg-amber-50/30' : ''} ${!reward.unlocked && reward.id === '3' ? 'border-electric/30' : ''}`}>
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                    reward.unlocked ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : 'bg-muted text-text-secondary'
                  }`}>
                    <reward.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold">{reward.name}</h4>
                  <p className="text-xs text-text-secondary mt-0.5">{reward.description}</p>
                  <div className="mt-3">
                    <Progress value={(reward.current / reward.required) * 100} className="h-2" />
                    <p className="text-[10px] text-text-secondary mt-1">{reward.current}/{reward.required} referrals</p>
                  </div>
                  {reward.unlocked && (
                    <Badge className="mt-2 bg-green-100 text-green-700 border-green-200 text-[10px]">
                      <CheckCircle className="w-3 h-3 mr-0.5" />Unlocked
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Activities */}
      <div>
        <h2 className="text-lg font-semibold font-heading mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-electric" /> Referral Activities</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y" style={{ borderColor: '#E2E8F0' }}>
              {mockActivities.map((activity, i) => (
                <div
                  key={activity.id}
                  className="animate-fade-in flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-white text-xs font-semibold">
                      {activity.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.name}</p>
                      <p className="text-[10px] text-text-secondary">{new Date(activity.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {activity.points > 0 && (
                      <span className="text-xs font-semibold text-amber-600">+{activity.points} pts</span>
                    )}
                    <Badge variant="outline" className={statusColor[activity.status]}>{activity.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: 1, title: 'Share Your Link', desc: 'Send your unique referral link to friends via social media or direct message' },
              { step: 2, title: 'They Register', desc: 'When they sign up using your link, they become your referral' },
              { step: 3, title: 'Earn Rewards', desc: 'Get 20 points when they complete their first task + unlock badges' },
            ].map((item, i) => (
              <div key={item.step} className="text-center p-3">
                <div className="w-8 h-8 rounded-full bg-navy text-white text-sm font-bold mx-auto mb-2 flex items-center justify-center">{item.step}</div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-text-secondary mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
