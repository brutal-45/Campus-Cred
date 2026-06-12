'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  MapPin, GraduationCap, Building2, Code2, Award, ExternalLink,
  Share2, Copy, Check, Linkedin, Github, Globe, Mail, Phone,
  Star, Briefcase, Flame, ChevronRight, QrCode, Eye,
  Download, MessageSquare, Calendar, Trophy, Zap, Crown, Gem,
  Sprout, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { ScoreRing } from '@/components/dashboard/LevelBadge';
import { LEVEL_THRESHOLDS, PLATFORM_DOMAIN } from '@/lib/constants';
import { getLevelForScore } from '@/lib/score-service';
import { toast } from 'sonner';

interface PortfolioData {
  student: {
    id: string;
    fullName: string;
    email: string | null;
    phone: string | null;
    degree: string | null;
    branch: string | null;
    college: string | null;
    city: string | null;
    bio: string | null;
    profilePhoto: string | null;
    skills: string[];
    socialLinks: Record<string, string>;
    campusCredUsername: string | null;
    isVerified: boolean;
    memberSince: string;
  };
  score: {
    totalScore: number;
    level: string;
    levelIcon: string;
    tasksCompleted: number;
    certificatesEarned: number;
    streakDays: number;
    peerReviewsGiven: number;
  };
  certificates: Array<{
    certificateId: string;
    taskTitle: string;
    level: string;
    issuedDate: string;
    skills: string[];
    thumbnailUrl: string | null;
    qrCodeUrl: string | null;
  }>;
  completedTasks: Array<{
    id: string;
    taskTitle: string;
    category: string | null;
    difficulty: string;
    rating: number | null;
    submittedAt: string;
    feedback: string | null;
  }>;
  internships: Array<{
    title: string;
    company: string;
    companyLogo: string | null;
    industry: string | null;
    status: string;
    duration: string | null;
    stipend: string | null;
  }>;
}

export function PublicPortfolioPage() {
  const params = useParams();
  const username = params.username as string;
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('certificates');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQR, setShowQR] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      fetchPortfolio(username);
    }
  }, [username]);

  const fetchPortfolio = async (uname: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/student/portfolio/${uname}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('Student not found');
        } else {
          setError('Failed to load portfolio');
        }
        return;
      }
      const portfolio = await res.json();
      setData(portfolio);
    } catch {
      setError('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const shareLink = data ? `https://${PLATFORM_DOMAIN}/student/${data.student.campusCredUsername || username}` : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiedLink(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data?.student.fullName} - CampusCred Portfolio`,
          text: `Check out ${data?.student.fullName}'s verified portfolio on CampusCred!`,
          url: shareLink,
        });
      } catch { /* user cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-16 h-16 border-4 border-electric/30 border-t-electric rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold font-heading mb-2">Portfolio Not Found</h1>
          <p className="text-text-secondary mb-6">{error || 'This student profile does not exist or is not public.'}</p>
          <a href="/" className="inline-flex items-center gap-2 text-electric hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to CampusCred
          </a>
        </div>
      </div>
    );
  }

  const { student, score, certificates, completedTasks, internships } = data;
  const levelInfo = getLevelForScore(score.totalScore);
  const levelData = LEVEL_THRESHOLDS.find(l => l.level === levelInfo.level) || LEVEL_THRESHOLDS[0];
  const initials = student.fullName.split(' ').map(n => n[0]).join('');
  const memberDate = new Date(student.memberSince);

  return (
    <div className="min-h-screen bg-background relative">
      {/* CampusCred Watermark */}
      <CampusCredLogo size={80} variant="icon" className="absolute bottom-4 right-4 opacity-[0.05]" />

      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-72 bg-gradient-to-b from-muted/50 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4 py-8">
        {/* Header with logo and share */}
        <div
          className="flex items-center justify-between mb-8 animate-fade-in"
          style={{ animationDelay: '0ms' }}
        >
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <CampusCredLogo size={36} variant="dark" animate={false} />
            <span className="text-xs text-text-secondary hidden sm:inline">Verified Portfolio</span>
          </a>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="gap-1.5 text-xs"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button
              size="sm"
              onClick={handleShare}
              className="gap-1.5 text-xs btn-primary"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
          </div>
        </div>

        {/* Profile Hero Section */}
        <div
          className="animate-fade-in"
          style={{ animationDelay: '100ms' }}
        >
          <Card className="cc-card overflow-hidden">
            {/* Cover gradient */}
            <div className={`h-32 bg-gradient-to-r ${levelData.gradient} opacity-80`} />

            <CardContent className="relative px-6 pb-6 -mt-16">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                {/* Profile Photo */}
                <div className="relative">
                  <Avatar className="w-28 h-28 border-4 border-card shadow-xl">
                    <AvatarImage src={student.profilePhoto || undefined} alt={student.fullName} />
                    <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-electric to-purple text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {student.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-card">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Name and basic info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold font-heading">{student.fullName}</h1>
                    <Badge variant="outline" className={`${levelData.bgClass} w-fit text-xs font-semibold`}>
                      <span className="mr-1">{levelInfo.icon}</span>
                      {levelInfo.level}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-text-secondary">
                    {student.degree && student.branch && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {student.degree} • {student.branch}
                      </span>
                    )}
                    {student.college && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {student.college}
                      </span>
                    )}
                    {student.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {student.city}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    Member since {memberDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    {student.campusCredUsername && (
                      <> &middot; <span className="text-electric">@{student.campusCredUsername}</span></>
                    )}
                  </p>
                </div>

                {/* Score Ring */}
                <div className="hidden sm:block">
                  <ScoreRing score={score.totalScore} size={100} showLabel={true} />
                </div>
              </div>

              {/* Bio */}
              {student.bio && (
                <p className="mt-4 text-sm text-foreground/80 leading-relaxed max-w-2xl">
                  {student.bio}
                </p>
              )}

              {/* Social Links */}
              {Object.keys(student.socialLinks).length > 0 && (
                <div className="flex items-center gap-3 mt-3">
                  {student.socialLinks.linkedin && (
                    <a href={student.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-blue-600 transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                  {student.socialLinks.github && (
                    <a href={student.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-gray-900 dark:hover:text-white transition-colors">
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {student.socialLinks.portfolio && (
                    <a href={student.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-electric transition-colors">
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}

              {/* Skills */}
              {student.skills.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {student.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs px-2.5 py-0.5 bg-electric/5 text-electric border border-electric/10">
                        <Code2 className="w-3 h-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Row */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 animate-fade-in"
          style={{ animationDelay: '200ms' }}
        >
          <div className="cc-card bg-white rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-navy">{score.totalScore}</div>
              <div className="text-xs text-text-secondary mt-1">CampusCred Score</div>
          </div>
          <div className="cc-card bg-white rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-electric">{score.tasksCompleted}</div>
              <div className="text-xs text-text-secondary mt-1">Tasks Done</div>
          </div>
          <div className="cc-card bg-white rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-500">{score.certificatesEarned}</div>
              <div className="text-xs text-text-secondary mt-1">Certificates</div>
          </div>
          <div className="cc-card bg-white rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-2xl font-bold text-orange-500">{score.streakDays}</span>
              </div>
              <div className="text-xs text-text-secondary mt-1">Day Streak</div>
          </div>
        </div>

        {/* Mobile Score Ring */}
        <div className="sm:hidden flex justify-center mt-6">
          <ScoreRing score={score.totalScore} size={140} showLabel={true} />
        </div>

        {/* Main Content Tabs */}
        <div
          className="mt-6 animate-fade-in"
          style={{ animationDelay: '300ms' }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="certificates" className="gap-1.5 text-xs sm:text-sm">
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Certificates</span>
                <span className="sm:hidden">Certs</span>
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{certificates.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-1.5 text-xs sm:text-sm">
                <Code2 className="w-4 h-4" />
                <span className="hidden sm:inline">Tasks</span>
                <span className="sm:hidden">Tasks</span>
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{completedTasks.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="internships" className="gap-1.5 text-xs sm:text-sm">
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">Internships</span>
                <span className="sm:hidden">Work</span>
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{internships.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Certificates Tab */}
            <TabsContent value="certificates">
              {certificates.length === 0 ? (
                <EmptyState
                  icon={<Award className="w-12 h-12 text-text-secondary/30" />}
                  title="No certificates yet"
                  description="Certificates will appear here when tasks are approved and completed."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificates.map((cert, idx) => (
                    <div
                      key={cert.certificateId}
                      className="animate-fade-in"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <Card className="cc-card overflow-hidden group">
                        {/* Certificate preview area */}
                        <div className="relative h-40 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 overflow-hidden">
                          {cert.thumbnailUrl ? (
                            <img
                              src={cert.thumbnailUrl}
                              alt={cert.taskTitle}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <Award className="w-12 h-12 text-amber-400/50" />
                              <p className="text-xs text-amber-600/60 mt-2 font-medium">{cert.level} Certificate</p>
                            </div>
                          )}
                          {/* QR code overlay */}
                          {cert.qrCodeUrl && (
                            <button
                              onClick={() => setShowQR(showQR === cert.certificateId ? null : cert.certificateId)}
                              className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-lg shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <QrCode className="w-4 h-4 text-gray-700" />
                            </button>
                          )}
                          {/* Level badge */}
                          <Badge className="absolute bottom-2 left-2 text-[10px] bg-white/90 text-gray-700 shadow-sm">
                            {cert.level}
                          </Badge>
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-semibold text-sm truncate">{cert.taskTitle}</h4>
                          <p className="text-xs text-text-secondary mt-1">
                            {new Date(cert.issuedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          {cert.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {cert.skills.slice(0, 3).map((skill, sIdx) => (
                                <Badge key={sIdx} variant="outline" className="text-[10px] px-1.5 py-0">
                                  {skill}
                                </Badge>
                              ))}
                              {cert.skills.length > 3 && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  +{cert.skills.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            <a
                              href={`/verify/${cert.certificateId}`}
                              target="_blank"
                              className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium text-electric hover:text-electric/80 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Verify
                            </a>
                            <a
                              href={`/api/certificates/${cert.certificateId}`}
                              className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium text-text-secondary hover:text-foreground transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" /> Download
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Completed Tasks Tab */}
            <TabsContent value="tasks">
              {completedTasks.length === 0 ? (
                <EmptyState
                  icon={<Code2 className="w-12 h-12 text-text-secondary/30" />}
                  title="No completed tasks yet"
                  description="Tasks completed by this student will appear here with ratings and feedback."
                />
              ) : (
                <div className="space-y-3">
                  {completedTasks.map((task, idx) => (
                    <div
                      key={task.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <Card className="cc-card">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm truncate">{task.taskTitle}</h4>
                                <DifficultyBadge difficulty={task.difficulty} />
                              </div>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-text-secondary">
                                {task.category && (
                                  <span className="flex items-center gap-1">
                                    <Code2 className="w-3 h-3" />
                                    {task.category}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(task.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              {task.feedback && (
                                <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                                  <p className="text-xs text-text-secondary">
                                    <MessageSquare className="w-3 h-3 inline mr-1" />
                                    {task.feedback}
                                  </p>
                                </div>
                              )}
                            </div>
                            {/* Rating */}
                            {task.rating && (
                              <div className="flex items-center gap-0.5 shrink-0">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${star <= task.rating! ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Internships Tab */}
            <TabsContent value="internships">
              {internships.length === 0 ? (
                <EmptyState
                  icon={<Briefcase className="w-12 h-12 text-text-secondary/30" />}
                  title="No internship history yet"
                  description="Internships and micro-work completed through CampusCred will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {internships.map((intern, idx) => (
                    <div
                      key={idx}
                      className="animate-fade-in"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <Card className="cc-card">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 text-xs font-semibold">
                                {intern.company.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                              <AvatarImage src={intern.companyLogo || undefined} />
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm">{intern.title}</h4>
                              <p className="text-xs text-text-secondary">{intern.company}{intern.industry ? ` • ${intern.industry}` : ''}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <StatusBadge status={intern.status} />
                              {intern.stipend && (
                                <p className="text-xs text-emerald-600 mt-1">{intern.stipend}</p>
                              )}
                              {intern.duration && (
                                <p className="text-xs text-text-secondary">{intern.duration}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* CampusCred Score Breakdown */}
        <div
          className="mt-8 animate-fade-in"
          style={{ animationDelay: '400ms' }}
        >
          <Card className="cc-card">
            <CardHeader className="pb-3">
              <h2 className="text-lg font-bold font-heading flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                CampusCred Score Breakdown
              </h2>
              <p className="text-xs text-text-secondary">How this student earned their {score.totalScore}/1000 score</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ScoreItem
                  icon={<Check className="w-4 h-4 text-blue-500" />}
                  label="Tasks Completed"
                  value={score.tasksCompleted}
                  points={`+${score.tasksCompleted * 50}`}
                  color="blue"
                />
                <ScoreItem
                  icon={<Award className="w-4 h-4 text-amber-500" />}
                  label="Certificates Earned"
                  value={score.certificatesEarned}
                  points={`+${score.certificatesEarned * 30}`}
                  color="amber"
                />
                <ScoreItem
                  icon={<Flame className="w-4 h-4 text-orange-500" />}
                  label="Day Streak"
                  value={score.streakDays}
                  points={`+${score.streakDays * 5}`}
                  color="orange"
                />
                <ScoreItem
                  icon={<MessageSquare className="w-4 h-4 text-purple-500" />}
                  label="Peer Reviews"
                  value={score.peerReviewsGiven}
                  points={`+${score.peerReviewsGiven * 10}`}
                  color="purple"
                />
              </div>

              {/* Level progress */}
              <Separator className="my-4" />
              <div className="space-y-3">
                {LEVEL_THRESHOLDS.map((lt) => {
                  const progressPercent = score.totalScore >= lt.maxScore
                    ? 100
                    : score.totalScore >= lt.minScore
                      ? ((score.totalScore - lt.minScore) / (lt.maxScore - lt.minScore)) * 100
                      : 0;
                  return (
                    <div key={lt.level} className="flex items-center gap-3">
                      <span className="text-lg w-7 text-center">{lt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${score.totalScore >= lt.minScore ? 'text-foreground' : 'text-text-secondary'}`}>
                            {lt.level}
                          </span>
                          <span className="text-xs text-text-secondary">{lt.minScore} - {lt.maxScore}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-[width] duration-700 ease-out"
                            style={{
                              width: `${progressPercent}%`,
                              backgroundColor: lt.color,
                            }}
                          />
                        </div>
                      </div>
                      {score.totalScore >= lt.minScore && (
                        <Check className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact CTA for Companies */}
        <div
          className="mt-8 mb-12 animate-fade-in"
          style={{ animationDelay: '500ms' }}
        >
          <Card style={{ borderColor: 'rgba(59,130,246,0.2)' }} className="bg-gradient-to-br from-electric/5 to-purple/5">
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-bold font-heading mb-2">Interested in hiring {student.fullName.split(' ')[0]}?</h2>
              <p className="text-sm text-text-secondary mb-4">
                Contact this student directly or post an internship on CampusCred.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button className="btn-primary gap-1.5">
                  <Mail className="w-4 h-4" />
                  Contact Student
                </Button>
                <Button variant="outline" className="gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  Post Internship
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t" style={{ borderColor: '#E2E8F0' }}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <CampusCredLogo size={28} variant="dark" animate={false} />
            <span className="text-xs text-text-secondary">Verified Portfolio</span>
          </div>
          <p className="text-xs text-text-secondary">
            This portfolio is verified by CampusCred. All certificates are QR-verified and tamper-proof.
          </p>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowQR(null)}
        >
          <div
            className="bg-card rounded-xl p-6 shadow-xl max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-center mb-4">Scan to Verify</h3>
            {certificates.find(c => c.certificateId === showQR)?.qrCodeUrl ? (
              <img
                src={certificates.find(c => c.certificateId === showQR)!.qrCodeUrl!}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            ) : (
              <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex flex-col items-center justify-center">
                <QrCode className="w-16 h-16 text-text-secondary/30" />
                <p className="text-xs text-text-secondary mt-2">QR Code</p>
              </div>
            )}
            <p className="text-xs text-center text-text-secondary mt-3">
              Certificate ID: {showQR}
            </p>
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={() => setShowQR(null)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper Components ───

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon}
      <h3 className="text-lg font-semibold mt-4">{title}</h3>
      <p className="text-sm text-text-secondary mt-1 max-w-sm">{description}</p>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    Easy: 'bg-green-100 text-green-700 border-green-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Hard: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colors[difficulty] || ''}`}>
      {difficulty}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Applied: 'bg-blue-100 text-blue-700',
    Shortlisted: 'bg-amber-100 text-amber-700',
    Hired: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
  };

  return (
    <Badge className={`text-[10px] px-2 py-0.5 ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </Badge>
  );
}

function ScoreItem({ icon, label, value, points, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  points: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
      <span className="text-xs font-medium text-emerald-600">{points}</span>
    </div>
  );
}
