'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Clock,
  Coins,
  Download,
  Upload,
  Link2,
  FileText,
  Send,
  CheckCircle2,
  Hourglass,
  Eye,
  XCircle,
  Zap,
  AlertTriangle,
  Globe,
  GraduationCap,
  BookOpen,
  MessageSquare,
  FileUp,
  X,
} from 'lucide-react';
import { format } from 'date-fns';

interface TaskData {
  id: string;
  title: string;
  description: string;
  degree: string;
  branch: string;
  difficulty: string;
  points: number;
  deadline: string;
  taskKitUrl: string | null;
  isActive: boolean;
  createdAt: string;
  totalSubmissions: number;
}

interface UserSubmission {
  id: string;
  fileUrl: string | null;
  externalLink: string | null;
  description: string | null;
  status: string;
  feedback: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

const difficultyConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  Easy: {
    color: 'text-green-700',
    bg: 'bg-green-100 border-green-200',
    icon: <Zap className="w-3.5 h-3.5" />,
  },
  Medium: {
    color: 'text-yellow-700',
    bg: 'bg-yellow-100 border-yellow-200',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  Hard: {
    color: 'text-red-700',
    bg: 'bg-red-100 border-red-200',
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
};

const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  Pending: {
    color: 'text-yellow-700',
    bg: 'bg-yellow-100 border-yellow-200',
    icon: <Hourglass className="w-5 h-5" />,
    label: 'Submission Received',
  },
  'Under Review': {
    color: 'text-blue-700',
    bg: 'bg-blue-100 border-blue-200',
    icon: <Eye className="w-5 h-5" />,
    label: 'Under Review',
  },
  Approved: {
    color: 'text-green-700',
    bg: 'bg-green-100 border-green-200',
    icon: <CheckCircle2 className="w-5 h-5" />,
    label: 'Approved!',
  },
  Rejected: {
    color: 'text-red-700',
    bg: 'bg-red-100 border-red-200',
    icon: <XCircle className="w-5 h-5" />,
    label: 'Needs Revision',
  },
};

function CountdownTimer({ deadline }: { deadline: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(deadline).getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
        <Clock className="w-4 h-4 text-red-500" />
        <span className="text-sm font-semibold text-red-500">Deadline has passed</span>
      </div>
    );
  }

  const isUrgent = timeLeft.days < 2;

  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
      isUrgent ? 'bg-red-500/10 border-red-500/20' : 'bg-electric/10 border-electric/20'
    }`}>
      <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-500' : 'text-electric'}`} />
      <div className="flex gap-2">
        {[
          { value: timeLeft.days, label: 'Days' },
          { value: timeLeft.hours, label: 'Hrs' },
          { value: timeLeft.minutes, label: 'Min' },
          { value: timeLeft.seconds, label: 'Sec' },
        ].map((item, i) => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`text-center min-w-[32px] ${
              isUrgent ? 'text-red-500' : 'text-electric'
            }`}>
              <span className="text-lg font-bold font-heading leading-none">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-[9px] block text-text-secondary mt-0.5">{item.label}</span>
            </div>
            {i < 3 && <span className="text-lg font-bold text-text-secondary/50 mb-3">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TaskPage() {
  const { selectedTaskId, token, goBack } = useAppStore();
  const queryClient = useQueryClient();

  // Form state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [externalLink, setExternalLink] = useState('');
  const [description, setDescription] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Fetch task detail
  const { data, isLoading, error } = useQuery({
    queryKey: ['task', selectedTaskId],
    queryFn: async () => {
      if (!selectedTaskId) return null;
      const res = await fetch(`/api/tasks/${selectedTaskId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch task');
      return res.json();
    },
    enabled: !!selectedTaskId,
  });

  const task: TaskData | null = data?.task || null;
  const userSubmission: UserSubmission | null = data?.userSubmission || null;
  const hasSubmitted = !!userSubmission && ['Pending', 'Under Review', 'Approved'].includes(userSubmission.status);

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTaskId) throw new Error('No task selected');

      // In a real app, we'd upload the file first and get a URL
      // For now, we create a fake URL from the file name
      let fileUrl = '';
      if (uploadedFile) {
        fileUrl = `uploads/${uploadedFile.name}`;
      }

      const res = await fetch(`/api/student/tasks/${selectedTaskId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId: selectedTaskId,
          fileUrl: fileUrl || undefined,
          externalLink: externalLink || undefined,
          description: description || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Submission failed');
      return result;
    },
    onSuccess: () => {
      toast.success('Task submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['task', selectedTaskId] });
      setUploadedFile(null);
      setExternalLink('');
      setDescription('');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to submit task');
    },
  });

  // Word count
  const wordCount = description.trim() ? description.trim().split(/\s+/).length : 0;
  const isOverWordLimit = wordCount > 300;

  // File handling
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        toast.error('File size must be under 50MB');
        return;
      }
      const allowedTypes = [
        'application/pdf',
        'application/zip',
        'application/x-zip-compressed',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp',
        'video/mp4',
        'video/quicktime',
        'video/webm',
      ];
      const allowedExtensions = ['.pdf', '.zip', '.png', '.jpg', '.jpeg', '.webp', '.mp4', '.mov', '.webm'];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
        toast.error('Invalid file type. Accepted: PDF, ZIP, Images, Video');
        return;
      }
      setUploadedFile(file);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size must be under 50MB');
        return;
      }
      setUploadedFile(file);
    }
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = () => {
    if (!uploadedFile && !externalLink) {
      toast.error('Please upload a file or provide an external link');
      return;
    }
    if (externalLink) {
      try {
        new URL(externalLink);
      } catch {
        toast.error('Please enter a valid URL');
        return;
      }
    }
    if (isOverWordLimit) {
      toast.error('Description must be 300 words or less');
      return;
    }
    submitMutation.mutate();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen hero-bg p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-24 skeleton-shimmer" />
          <div className="p-6 space-y-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px' }}>
            <Skeleton className="h-8 w-3/4 skeleton-shimmer" />
            <Skeleton className="h-6 w-1/2 skeleton-shimmer" />
            <Skeleton className="h-24 w-full skeleton-shimmer" />
          </div>
          <div className="p-6 space-y-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px' }}>
            <Skeleton className="h-6 w-32 skeleton-shimmer" />
            <Skeleton className="h-40 w-full skeleton-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !task) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center p-4">
        <div className="p-8 text-center max-w-md animate-fade-in" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px' }}>
          <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-bold font-heading text-white mb-2">Task Not Found</h2>
          <p className="text-sm text-white/60 mb-6">
            The task you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button onClick={goBack} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const diff = difficultyConfig[task.difficulty] || difficultyConfig.Medium;
  const submissionStatus = userSubmission ? statusConfig[userSubmission.status] : null;

  return (
    <div className="min-h-screen hero-bg">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-navy/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-3 flex items-center gap-4">
          <Button
            onClick={goBack}
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Button>
          <div className="flex-1" />
          <Badge className="text-[10px] px-2 bg-white/10 text-white/70 border-white/10">
            {task.totalSubmissions} submission{task.totalSubmissions !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* Task Header */}
        <div className="animate-fade-in">
          <div className="p-6 space-y-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px' }}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-3">
                <h1 className="text-2xl md:text-3xl font-bold font-heading text-white leading-tight">
                  {task.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-electric/20 text-electric-light border-electric/30 text-xs gap-1">
                    <GraduationCap className="w-3 h-3" />
                    {task.degree}
                  </Badge>
                  <Badge className="bg-purple/20 text-purple-light border-purple/30 text-xs gap-1">
                    <BookOpen className="w-3 h-3" />
                    {task.branch}
                  </Badge>
                  <Badge className={`${diff.bg} ${diff.color} border text-xs gap-1`} variant="outline">
                    {diff.icon}
                    {task.difficulty}
                  </Badge>
                </div>
              </div>

              {/* Points */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-electric/20 to-purple/20 border border-white/10">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-lg font-bold font-heading text-white">{task.points}</span>
                <span className="text-xs text-white/60">points</span>
              </div>
            </div>

            {/* Deadline countdown */}
            <CountdownTimer deadline={task.deadline} />
          </div>
        </div>

        {/* Task Description */}
        <div
          className="animate-fade-in"
          style={{ animationDelay: '100ms' }}
        >
          <div className="p-6 space-y-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px' }}>
            <h2 className="text-lg font-bold font-heading text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-electric" />
              Task Description
            </h2>
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm">
                {task.description}
              </div>
            </div>

            {/* Task Kit Download */}
            {task.taskKitUrl && (
              <>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between p-3 rounded-lg bg-electric/10 border border-electric/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Task Kit Available</p>
                      <p className="text-xs text-white/50">Download resources and templates</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-navy text-white hover:opacity-90 transition-opacity gap-1.5"
                    onClick={() => {
                      if (task.taskKitUrl) {
                        window.open(task.taskKitUrl, '_blank');
                      }
                    }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Kit
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Submission Section */}
        <div
          className="animate-fade-in"
          style={{ animationDelay: '200ms' }}
        >
          {hasSubmitted && userSubmission ? (
            /* Already Submitted - Show Status */
            <div
              className="p-6 animate-fade-in"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px' }}
            >
              <h2 className="text-lg font-bold font-heading text-white mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-electric" />
                Your Submission
              </h2>

              <div className="flex flex-col items-center py-6 space-y-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center animate-fade-in ${
                    submissionStatus?.bg || 'bg-yellow-100'
                  }`}
                >
                  {React.cloneElement(submissionStatus?.icon || <Hourglass className="w-8 h-8" />, {
                    className: `w-8 h-8 ${submissionStatus?.color || 'text-yellow-700'}`,
                  })}
                </div>

                <h3 className="text-xl font-bold font-heading text-white">
                  {submissionStatus?.label || 'Submitted'}
                </h3>

                <p className="text-sm text-white/60 text-center max-w-sm">
                  {userSubmission.status === 'Pending' && 'Your submission is being processed. We\'ll notify you once it\'s reviewed.'}
                  {userSubmission.status === 'Under Review' && 'A reviewer is currently evaluating your submission. Stay tuned for feedback!'}
                  {userSubmission.status === 'Approved' && 'Congratulations! Your submission has been approved. Check your certificates!'}
                  {userSubmission.status === 'Rejected' && 'Your submission needs some improvements. Check the feedback below and try again.'}
                </p>

                <div className="text-xs text-white/40">
                  Submitted on {format(new Date(userSubmission.submittedAt), 'dd MMM yyyy, hh:mm a')}
                </div>

                {/* Submission details */}
                {(userSubmission.fileUrl || userSubmission.externalLink) && (
                  <div className="w-full space-y-2 mt-2">
                    {userSubmission.fileUrl && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                        <FileUp className="w-4 h-4 text-electric" />
                        <span className="text-xs text-white/70 truncate flex-1">{userSubmission.fileUrl}</span>
                      </div>
                    )}
                    {userSubmission.externalLink && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                        <Globe className="w-4 h-4 text-purple-light" />
                        <a
                          href={userSubmission.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-electric hover:underline truncate flex-1"
                        >
                          {userSubmission.externalLink}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Feedback */}
                {userSubmission.feedback && (
                  <div className="w-full mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-electric" />
                      <span className="text-sm font-semibold text-white">Reviewer Feedback</span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">{userSubmission.feedback}</p>
                    {userSubmission.reviewedAt && (
                      <p className="text-xs text-white/40 mt-2">
                        Reviewed on {format(new Date(userSubmission.reviewedAt), 'dd MMM yyyy')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Submission Form */
            <div
              className="p-6 animate-fade-in"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '12px' }}
            >
              <h2 className="text-lg font-bold font-heading text-white mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-electric" />
                Submit Your Work
              </h2>

              <div className="space-y-6">
                {/* File Upload Zone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload File
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
                      isDragOver
                        ? 'border-electric bg-electric/10 scale-[1.02]'
                        : uploadedFile
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-white/20 hover:border-electric/50 hover:bg-white/5'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.zip,.png,.jpg,.jpeg,.webp,.mp4,.mov,.webm"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {uploadedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-xs">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-white/50">{formatFileSize(uploadedFile.size)}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFile(null);
                          }}
                          className="ml-2 p-1 rounded-full hover:bg-white/10 transition-colors"
                        >
                          <X className="w-4 h-4 text-white/60" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileUp className={`w-10 h-10 mx-auto ${isDragOver ? 'text-electric' : 'text-white/40'}`} />
                        <p className="text-sm text-white/70">
                          {isDragOver ? 'Drop your file here' : 'Drag & drop your file here'}
                        </p>
                        <p className="text-xs text-white/40">
                          PDF, ZIP, Images, Video • Max 50MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* External Link */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    External Link
                  </label>
                  <Input
                    placeholder="GitHub, Figma, Google Drive, or YouTube URL"
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-electric focus:ring-electric/20"
                  />
                  <p className="text-xs text-white/30">
                    Share your GitHub repo, Figma design, Google Drive link, or YouTube video
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Description
                  </label>
                  <Textarea
                    placeholder="Describe your approach, tools used, and any key highlights... (max 300 words)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-electric focus:ring-electric/20 resize-none"
                  />
                  <div className="flex justify-end">
                    <span className={`text-xs ${
                      isOverWordLimit ? 'text-danger font-semibold' : 'text-white/40'
                    }`}>
                      {wordCount}/300 words
                    </span>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending || (!uploadedFile && !externalLink) || isOverWordLimit}
                  className="w-full bg-navy text-white hover:opacity-90 transition-all font-bold text-base py-6 gap-2 disabled:opacity-50 active:scale-[0.97]"
                  size="lg"
                >
                  {submitMutation.isPending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Task
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-white/30">
                  Make sure to review your submission before sending. You can only submit once per task.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom padding for mobile */}
        <div className="h-8" />
      </div>
    </div>
  );
}
