'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, User } from '@/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BackButton } from '@/components/shared/BackButton';
import { ProfilePhotoUpload } from '@/components/auth/ProfilePhotoUpload';
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
  // College-specific
  collegeName: string;
  address: string;
  naacRating: string;
  nirfRank: string;
  collegeWebsite: string;
  totalStudents: string;
  // Mentor-specific
  designation: string;
  organization: string;
  experience: string;
  expertise: string[];
  hourlyRate: string;
  mentorBio: string;
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
  const { user, token, setUser } = useAppStore();

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

    // Pre-fill social links from known platforms
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
  const handlePhotoSelect = useCallback((file: File | null, previewUrl: string | null) => {
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(previewUrl);
    } else {
      setPhotoFile(null);
      setPhotoPreview(user?.profilePhoto || null);
    }
  }, [user?.profilePhoto]);

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
          // Upload failed and we had a new file to upload — abort
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

      // Student-specific fields
      if (isStudent) {
        body.college = form.college.trim();
        body.degree = form.degree.trim();
        body.branch = form.branch.trim();
        body.year = form.year.trim();
      }

      // College-specific fields
      if (isCollege) {
        body.college = form.collegeName.trim();
        body.collegeName = form.collegeName.trim();
        body.address = form.address.trim();
        body.naacRating = form.naacRating.trim();
        body.nirfRank = form.nirfRank ? parseInt(form.nirfRank, 10) : null;
        body.collegeWebsite = form.collegeWebsite.trim();
        body.totalStudents = form.totalStudents ? parseInt(form.totalStudents, 10) : null;
      }

      // Mentor-specific fields
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

      // 5. Update user in store
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
          <BackButton onClick={() => router.push('/dashboard')} variant="icon" className="!bg-muted !border-[#E2E8F0] !text-foreground hover:!bg-muted/80" />
          <div>
            <h1 className="text-2xl font-bold font-heading">Edit Profile</h1>
            <p className="text-sm text-text-secondary">Update your personal and professional details</p>
          </div>
        </div>
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
          {uploadingPhoto ? 'Uploading photo...' : saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* ── Profile Photo Hero ── */}
      <div className="animate-fade-in">
        <div className="relative bg-navy rounded-2xl overflow-hidden">
          {/* Banner */}
          <div className="h-24 sm:h-32 hero-bg opacity-60" />
          {/* Avatar */}
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
              {/* Camera overlay */}
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
              <p className="text-white/60 text-sm capitalize">{role} {isStudent && user.campusCredUsername && `• @${user.campusCredUsername}`}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Profile Photo Upload Section (uses existing component) ── */}
      <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
        <Card className="border-[#E2E8F0]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="w-4 h-4 text-electric" /> Profile Photo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfilePhotoUpload
              onPhotoSelect={handlePhotoSelect}
              fullName={form.fullName}
            />
          </CardContent>
        </Card>
      </div>

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
                  Full Name <span className="text-danger">*</span>
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

            {/* CampusCred Username (display only for students) */}
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
                <GraduationCap className="w-4 h-4 text-purple" /> Education
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

      {/* ── College Info Section (Colleges) ── */}
      {isCollege && (
        <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <Card className="border-[#E2E8F0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-electric" /> College Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">College Name</label>
                <Input
                  value={form.collegeName}
                  onChange={(e) => updateField('collegeName', e.target.value)}
                  placeholder="Indian Institute of Technology"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Address</label>
                <Input
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  placeholder="Powai, Mumbai, Maharashtra 400076"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-foreground">
                    <Award className="w-3.5 h-3.5 inline mr-1 text-text-secondary" />
                    NAAC Rating
                  </label>
                  <Input
                    value={form.naacRating}
                    onChange={(e) => updateField('naacRating', e.target.value)}
                    placeholder="A++"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-foreground">
                    <Hash className="w-3.5 h-3.5 inline mr-1 text-text-secondary" />
                    NIRF Rank
                  </label>
                  <Input
                    value={form.nirfRank}
                    onChange={(e) => updateField('nirfRank', e.target.value)}
                    placeholder="1"
                    type="number"
                    min="1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-foreground">
                    <Globe className="w-3.5 h-3.5 inline mr-1 text-text-secondary" />
                    Website
                  </label>
                  <Input
                    value={form.collegeWebsite}
                    onChange={(e) => updateField('collegeWebsite', e.target.value)}
                    placeholder="https://iitb.ac.in"
                    type="url"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-foreground">
                    <Users className="w-3.5 h-3.5 inline mr-1 text-text-secondary" />
                    Total Students
                  </label>
                  <Input
                    value={form.totalStudents}
                    onChange={(e) => updateField('totalStudents', e.target.value)}
                    placeholder="10000"
                    type="number"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Professional Section (Mentors) ── */}
      {isMentor && (
        <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <Card className="border-[#E2E8F0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-500" /> Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-foreground">Designation</label>
                  <Input
                    value={form.designation}
                    onChange={(e) => updateField('designation', e.target.value)}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-foreground">Organization</label>
                  <Input
                    value={form.organization}
                    onChange={(e) => updateField('organization', e.target.value)}
                    placeholder="Google India"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-foreground">Experience</label>
                  <Input
                    value={form.experience}
                    onChange={(e) => updateField('experience', e.target.value)}
                    placeholder="8 years"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block text-foreground">
                    <DollarSign className="w-3.5 h-3.5 inline mr-1 text-text-secondary" />
                    Hourly Rate (INR)
                  </label>
                  <Input
                    value={form.hourlyRate}
                    onChange={(e) => updateField('hourlyRate', e.target.value)}
                    placeholder="1500"
                    type="number"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Bio</label>
                <Textarea
                  value={form.mentorBio}
                  onChange={(e) => updateField('mentorBio', e.target.value)}
                  placeholder="Tell students about your mentoring style and expertise..."
                  className="min-h-[100px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-text-secondary mt-1">{form.mentorBio.length}/500 characters</p>
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
                      className="hover:text-danger transition-colors ml-0.5"
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

      {/* ── Expertise Section (Mentors) ── */}
      {isMentor && (
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Card className="border-[#E2E8F0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple" /> Expertise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {form.expertise.map((item) => (
                  <Badge key={item} variant="secondary" className="px-3 py-1.5 text-sm gap-1.5 pr-2">
                    {item}
                    <button
                      onClick={() => removeExpertise(item)}
                      className="hover:text-danger transition-colors ml-0.5"
                      aria-label={`Remove ${item}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {form.expertise.length === 0 && (
                  <p className="text-sm text-text-secondary">No expertise areas added yet.</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  placeholder="Type an expertise area and press Enter..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addExpertise();
                    }
                  }}
                  maxLength={30}
                />
                <Button
                  size="sm"
                  onClick={addExpertise}
                  disabled={!newExpertise.trim() || form.expertise.length >= 15}
                  className="gap-1 bg-electric hover:bg-electric-dark text-white shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>
              <p className="text-xs text-text-secondary">{form.expertise.length}/15 expertise areas added</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Social Links Section ── */}
      <div className="animate-fade-in" style={{ animationDelay: '250ms' }}>
        <Card className="border-[#E2E8F0]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="w-4 h-4 text-purple" /> Social Links
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

      {/* ── Bottom Save Bar ── */}
      <div className="sticky bottom-0 z-40 bg-white/80 dark:bg-navy/80 backdrop-blur-md border-t border-[#E2E8F0] dark:border-navy-lighter -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <p className="text-sm text-text-secondary hidden sm:block">
            {saving ? 'Saving your changes...' : 'Make changes and click Save'}
          </p>
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
            {uploadingPhoto ? 'Uploading photo...' : saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProfileEditPage;
