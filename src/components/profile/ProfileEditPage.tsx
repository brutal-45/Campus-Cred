'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useAppStore, User } from '@/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Camera,
  Save,
  User as UserIcon,
  GraduationCap,
  Link2,
  Briefcase,
  Building2,
  MapPin,
  Phone,
  AtSign,
  Plus,
  X,
  Loader2,
  Linkedin,
  Github,
  Twitter,
  Globe,
  Sparkles,
  Award,
  Hash,
  Users,
  DollarSign,
  ArrowLeft,
  Download,
  ExternalLink,
  FileDown,
  Share2,
  Shield,
  CheckCircle2,
  LogOut,
} from 'lucide-react';

/* ── Types ── */

interface SocialLinkEntry {
  platform: string;
  url: string;
}

interface ProfileFormData {
  fullName: string;
  bio: string;
  phone: string;
  city: string;
  state: string;
  college: string;
  degree: string;
  branch: string;
  year: string;
  skills: string[];
  socialLinks: SocialLinkEntry[];
  profilePhoto: string;
  collegeName: string;
  address: string;
  naacRating: string;
  nirfRank: string;
  collegeWebsite: string;
  totalStudents: string;
  designation: string;
  organization: string;
  experience: string;
  expertise: string[];
  hourlyRate: string;
  mentorBio: string;
}

interface Certificate {
  id: string;
  certificateId: string;
  taskTitle: string;
  degree: string;
  branch: string;
  issuedDate: string;
  studentName: string;
  pdfUrl?: string | null;
}

const SOCIAL_PLATFORMS = [
  { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
  { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
  { key: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://x.com/username' },
  { key: 'portfolio', label: 'Portfolio', icon: Globe, placeholder: 'https://yourwebsite.com' },
];

const GRADIENT_PALETTES = [
  ['#3B82F6', '#8B5CF6'],
  ['#10B981', '#3B82F6'],
  ['#F59E0B', '#EF4444'],
  ['#8B5CF6', '#EC4899'],
  ['#06B6D4', '#3B82F6'],
  ['#F97316', '#F59E0B'],
];

function getInitials(name: string): string {
  if (!name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

function getGradientForName(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index] as [string, string];
}

function parseSocialLinks(raw: string | undefined): SocialLinkEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((l: Record<string, string>) => ({
        platform: l.platform || l.key || '',
        url: l.url || '',
      })).filter((l: SocialLinkEntry) => l.platform && l.url);
    }
    if (typeof parsed === 'object') {
      return Object.entries(parsed).map(([key, url]) => ({
        platform: key,
        url: String(url),
      })).filter((l) => l.url);
    }
  } catch {
    // not JSON, ignore
  }
  return [];
}

function parseSkills(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {
    // comma-separated
  }
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/* ── Component ── */

export function ProfileEditPage() {
  const router = useRouter();
  const { user, token, setUser, logout } = useAppStore();

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [newExpertise, setNewExpertise] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const gradient = getGradientForName(user?.fullName || 'default');
  const initials = getInitials(user?.fullName || 'User');

  const [form, setForm] = useState<ProfileFormData>({
    fullName: '',
    bio: '',
    phone: '',
    city: '',
    state: '',
    college: '',
    degree: '',
    branch: '',
    year: '',
    skills: [],
    socialLinks: [],
    profilePhoto: '',
    collegeName: '',
    address: '',
    naacRating: '',
    nirfRank: '',
    collegeWebsite: '',
    totalStudents: '',
    designation: '',
    organization: '',
    experience: '',
    expertise: [],
    hourlyRate: '',
    mentorBio: '',
  });

  // Initialize form from user data
  useEffect(() => {
    if (!user) return;

    const socials = parseSocialLinks(user.socialLinks);
    const skills = parseSkills(user.skills);

    const platformLinks: SocialLinkEntry[] = SOCIAL_PLATFORMS.map((p) => {
      const existing = socials.find(
        (s) => s.platform.toLowerCase() === p.key || s.platform.toLowerCase() === p.label.toLowerCase()
      );
      return {
        platform: p.key,
        url: existing?.url || '',
      };
    });

    setForm({
      fullName: user.fullName || '',
      bio: user.bio || '',
      phone: user.phone || '',
      city: user.city || '',
      state: user.state || '',
      college: user.college || '',
      degree: user.degree || '',
      branch: user.branch || '',
      year: user.year || '',
      skills,
      socialLinks: platformLinks,
      profilePhoto: user.profilePhoto || '',
      collegeName: user.college || '',
      address: '',
      naacRating: '',
      nirfRank: '',
      collegeWebsite: '',
      totalStudents: '',
      designation: '',
      organization: '',
      experience: '',
      expertise: [],
      hourlyRate: '',
      mentorBio: '',
    });

    setPhotoPreview(user.profilePhoto || null);
  }, [user]);

  const role = user?.role || 'student';
  const isStudent = role === 'student';
  const isCollege = role === 'college';
  const isMentor = role === 'mentor';

  // ── Fetch certificates for download ──
  const { data: certData } = useQuery({
    queryKey: ['profile-certificates'],
    queryFn: async () => {
      const res = await fetch('/api/student/certificates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch certificates');
      return res.json();
    },
    enabled: !!token && isStudent,
  });

  const certificates: Certificate[] = certData?.certificates || [];

  // ── Field updater ──
  const updateField = useCallback(<K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // ── Skills management ──
  const addSkill = useCallback(() => {
    const trimmed = newSkill.trim();
    if (trimmed && !form.skills.includes(trimmed) && form.skills.length < 20) {
      updateField('skills', [...form.skills, trimmed]);
      setNewSkill('');
    }
  }, [newSkill, form.skills, updateField]);

  const removeSkill = useCallback((skill: string) => {
    updateField('skills', form.skills.filter((s) => s !== skill));
  }, [form.skills, updateField]);

  // ── Expertise management (mentor) ──
  const addExpertise = useCallback(() => {
    const trimmed = newExpertise.trim();
    if (trimmed && !form.expertise.includes(trimmed) && form.expertise.length < 15) {
      updateField('expertise', [...form.expertise, trimmed]);
      setNewExpertise('');
    }
  }, [newExpertise, form.expertise, updateField]);

  const removeExpertise = useCallback((item: string) => {
    updateField('expertise', form.expertise.filter((e) => e !== item));
  }, [form.expertise, updateField]);

  // ── Photo handling ──
  const handleDirectPhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, and WEBP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }, []);

  // ── Upload photo ──
  const uploadPhoto = useCallback(async (): Promise<string | null> => {
    if (!photoFile) return form.profilePhoto || null;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);

      const res = await fetch('/api/auth/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to upload photo');
      }

      const data = await res.json();
      return data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Photo upload failed');
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  }, [photoFile, form.profilePhoto]);

  // ── Save profile ──
  const handleSave = useCallback(async () => {
    if (!token) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    setSaving(true);
    try {
      // 1. Upload photo if changed
      let photoUrl = form.profilePhoto;
      if (photoFile) {
        const uploadedUrl = await uploadPhoto();
        if (uploadedUrl) {
          photoUrl = uploadedUrl;
        } else if (photoFile) {
          setSaving(false);
          return;
        }
      }

      // 2. Build social links object
      const socialLinksObj: Record<string, string> = {};
      form.socialLinks.forEach((link) => {
        if (link.url.trim()) {
          socialLinksObj[link.platform] = link.url.trim();
        }
      });

      // 3. Build request body
      const body: Record<string, unknown> = {
        fullName: form.fullName.trim(),
        bio: form.bio.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        profilePhoto: photoUrl,
        skills: form.skills.join(', '),
        socialLinks: JSON.stringify(socialLinksObj),
      };

      if (isStudent) {
        body.college = form.college.trim();
        body.degree = form.degree.trim();
        body.branch = form.branch.trim();
        body.year = form.year.trim();
      }

      if (isCollege) {
        body.college = form.collegeName.trim();
        body.collegeName = form.collegeName.trim();
        body.address = form.address.trim();
        body.naacRating = form.naacRating.trim();
        body.nirfRank = form.nirfRank ? parseInt(form.nirfRank, 10) : null;
        body.collegeWebsite = form.collegeWebsite.trim();
        body.totalStudents = form.totalStudents ? parseInt(form.totalStudents, 10) : null;
      }

      if (isMentor) {
        body.designation = form.designation.trim();
        body.organization = form.organization.trim();
        body.experience = form.experience.trim();
        body.expertise = JSON.stringify(form.expertise);
        body.hourlyRate = form.hourlyRate ? parseInt(form.hourlyRate, 10) : null;
        body.mentorBio = form.mentorBio.trim();
      }

      // 4. Save profile
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save profile');
      }

      const data = await res.json();

      if (data.user && setUser) {
        setUser({
          ...user,
          ...data.user,
        } as User);
      }

      toast.success('Profile updated successfully!');
      setPhotoFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }, [token, form, photoFile, uploadPhoto, isStudent, isCollege, isMentor, user, setUser]);

  // ── Certificate download ──
  const handleDownloadCertPDF = useCallback((cert: Certificate) => {
    if (cert.pdfUrl) {
      const link = document.createElement('a');
      link.href = cert.pdfUrl;
      link.download = `${cert.certificateId}.pdf`;
      link.target = '_blank';
      link.click();
    } else {
      // Navigate to certificate page to view/download
      router.push(`/dashboard/certificates/${cert.id}`);
    }
  }, [router]);

  const handleViewCertificate = useCallback((certId: string) => {
    router.push(`/dashboard/certificates/${certId}`);
  }, [router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-text-secondary">Please log in to edit your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-muted border border-border hover:bg-muted/80 transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-heading">Edit Profile</h1>
            <p className="text-sm text-text-secondary">Update your personal and professional details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-200 dark:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || uploadingPhoto}
            className="gap-2 bg-navy text-white hover:bg-navy/90 dark:bg-electric dark:hover:bg-electric-dark shrink-0"
          >
            {saving || uploadingPhoto ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {uploadingPhoto ? 'Uploading...' : saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* ── Profile Photo Hero ── */}
      <div className="animate-fade-in">
        <div className="relative bg-navy rounded-2xl overflow-hidden">
          <div className="h-24 sm:h-32 hero-bg opacity-60" />
          <div className="relative px-6 pb-6 -mt-12 sm:-mt-14">
            <div className="relative inline-block group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-white dark:border-navy-light shadow-xl bg-white">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white text-3xl font-bold"
                    style={{ background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})` }}
                  >
                    {initials}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-200"
                aria-label="Change profile photo"
              >
                <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleDirectPhotoChange}
                className="hidden"
              />
            </div>
            <div className="mt-3">
              <h2 className="text-xl font-bold text-white">{form.fullName || 'Your Name'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-white/60 text-sm capitalize">{role}</p>
                {isStudent && user.campusCredUsername && (
                  <span className="text-white/40 text-sm">• @{user.campusCredUsername}</span>
                )}
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-green-500/20 text-green-400">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-white/40 text-xs mt-1">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stats (Students) ── */}
      {isStudent && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="bg-muted/50 border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-navy dark:text-electric">{user.campusCredScore ?? 0}</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Score</p>
          </div>
          <div className="bg-muted/50 border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-navy dark:text-electric">{user.level}</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Level</p>
          </div>
          <div className="bg-muted/50 border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-navy dark:text-electric">{user.streakDays ?? 0}</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Day Streak</p>
          </div>
          <div className="bg-muted/50 border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-navy dark:text-electric">{certificates.length}</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Certificates</p>
          </div>
        </div>
      )}

      {/* ── Personal Information ── */}
      <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
        <Card className="border-[#E2E8F0]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-electric" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">
                  <Phone className="w-3.5 h-3.5 inline mr-1 text-text-secondary" />
                  Phone Number
                </label>
                <Input
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+91 9876543210"
                  type="tel"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">
                  <MapPin className="w-3.5 h-3.5 inline mr-1 text-text-secondary" />
                  City
                </label>
                <Input
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Mumbai"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">
                  <MapPin className="w-3.5 h-3.5 inline mr-1 text-text-secondary" />
                  State
                </label>
                <Input
                  value={form.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  placeholder="Maharashtra"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block text-foreground">Bio / About</label>
              <Textarea
                value={form.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-text-secondary mt-1">{form.bio.length}/500 characters</p>
            </div>

            {isStudent && user.campusCredUsername && (
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">
                  <AtSign className="w-3.5 h-3.5 inline mr-1 text-text-secondary" />
                  CampusCred Username
                </label>
                <Input
                  value={user.campusCredUsername}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-text-secondary mt-1">Your username cannot be changed</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Education Section (Students) ── */}
      {isStudent && (
        <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <Card className="border-[#E2E8F0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-500" /> Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">College Name</label>
                <Input
                  value={form.college}
                  onChange={(e) => updateField('college', e.target.value)}
                  placeholder="IIT Bombay"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-foreground">Degree</label>
                  <Input
                    value={form.degree}
                    onChange={(e) => updateField('degree', e.target.value)}
                    placeholder="B.Tech"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-foreground">Branch</label>
                  <Input
                    value={form.branch}
                    onChange={(e) => updateField('branch', e.target.value)}
                    placeholder="Computer Science"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-foreground">Year</label>
                  <Input
                    value={form.year}
                    onChange={(e) => updateField('year', e.target.value)}
                    placeholder="3rd Year"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Skills Section (Students) ── */}
      {isStudent && (
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Card className="border-[#E2E8F0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {form.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-sm gap-1.5 pr-2">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="hover:text-red-500 transition-colors ml-0.5"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {form.skills.length === 0 && (
                  <p className="text-sm text-text-secondary">No skills added yet. Add your skills below.</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Type a skill and press Enter..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  maxLength={30}
                />
                <Button
                  size="sm"
                  onClick={addSkill}
                  disabled={!newSkill.trim() || form.skills.length >= 20}
                  className="gap-1 bg-electric hover:bg-electric-dark text-white shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
              <p className="text-xs text-text-secondary">{form.skills.length}/20 skills added</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Certificates Section (Students) ── */}
      {isStudent && (
        <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
          <Card className="border-[#E2E8F0]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-gold" /> My Certificates
                </CardTitle>
                {certificates.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/dashboard/certificates')}
                    className="text-xs text-electric hover:text-electric-dark"
                  >
                    View All <ArrowLeft className="w-3 h-3 ml-1 rotate-180" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {certificates.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-10 h-10 text-text-secondary/30 mx-auto mb-2" />
                  <p className="text-sm text-text-secondary">No certificates yet</p>
                  <p className="text-xs text-text-secondary/60 mt-1">Complete tasks to earn verified certificates</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {certificates.slice(0, 3).map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border hover:bg-muted/70 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5 text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{cert.taskTitle}</p>
                        <p className="text-[10px] text-text-secondary">
                          {cert.certificateId} • {new Date(cert.issuedDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCertificate(cert.id)}
                          className="h-8 w-8 p-0 text-text-secondary hover:text-electric"
                          title="View Certificate"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadCertPDF(cert)}
                          className="h-8 w-8 p-0 text-text-secondary hover:text-electric"
                          title="Download PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Social Links Section ── */}
      <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
        <Card className="border-[#E2E8F0]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="w-4 h-4 text-purple-500" /> Social Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SOCIAL_PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const linkEntry = form.socialLinks.find((l) => l.platform === platform.key);
              const currentUrl = linkEntry?.url || '';

              return (
                <div key={platform.key} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-text-secondary" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-text-secondary mb-1 block">{platform.label}</label>
                    <Input
                      value={currentUrl}
                      onChange={(e) => {
                        const updated = form.socialLinks.map((l) =>
                          l.platform === platform.key ? { ...l, url: e.target.value } : l
                        );
                        updateField('socialLinks', updated);
                      }}
                      placeholder={platform.placeholder}
                      type="url"
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ── Account Actions ── */}
      <div className="animate-fade-in" style={{ animationDelay: '350ms' }}>
        <Card className="border-[#E2E8F0]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-text-secondary" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/settings/security')}
              className="w-full justify-start gap-2"
            >
              <Shield className="w-4 h-4" />
              Security Settings
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (confirm('Are you sure you want to sign out?')) {
                  logout();
                }
              }}
              className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 border-red-200 dark:border-red-500/20"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Save Bar ── */}
      <div className="sticky bottom-0 z-40 bg-white/80 dark:bg-navy/80 backdrop-blur-md border-t border-[#E2E8F0] dark:border-navy-lighter -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="gap-1.5 text-text-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || uploadingPhoto}
            className="gap-2 bg-navy text-white hover:bg-navy/90 dark:bg-electric dark:hover:bg-electric-dark ml-auto"
          >
            {saving || uploadingPhoto ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {uploadingPhoto ? 'Uploading...' : saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProfileEditPage;
