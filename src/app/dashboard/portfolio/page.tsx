'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  User, Globe, Github, Linkedin, Twitter, ExternalLink, Save, Eye,
  Plus, X, Camera, Edit3, MapPin, GraduationCap, Mail, Link2, Sparkles, Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface SocialLink {
  platform: string;
  url: string;
  icon: React.ElementType;
}

export default function PortfolioPage() {
  const { user } = useAppStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const [bio, setBio] = React.useState(user?.bio || 'Passionate student developer building real-world skills through CampusCred. Focused on full-stack development and UI/UX design.');
  const [skills, setSkills] = React.useState<string[]>(
    user?.skills ? user.skills.split(',').map(s => s.trim()) : ['React', 'TypeScript', 'Node.js', 'Python', 'UI/UX Design', 'Git']
  );
  const [newSkill, setNewSkill] = React.useState('');
  const [socialLinks, setSocialLinks] = React.useState<SocialLink[]>([
    { platform: 'GitHub', url: 'https://github.com/student', icon: Github },
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/student', icon: Linkedin },
    { platform: 'Twitter', url: 'https://twitter.com/student', icon: Twitter },
    { platform: 'Portfolio', url: 'https://student.dev', icon: Globe },
  ]);
  const [newLinkPlatform, setNewLinkPlatform] = React.useState('');
  const [newLinkUrl, setNewLinkUrl] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addSocialLink = () => {
    if (newLinkPlatform.trim() && newLinkUrl.trim()) {
      const iconMap: Record<string, React.ElementType> = {
        GitHub: Github, LinkedIn: Linkedin, Twitter: Twitter, Portfolio: Globe, Website: Globe, Blog: Globe,
      };
      setSocialLinks([...socialLinks, {
        platform: newLinkPlatform.trim(),
        url: newLinkUrl.trim(),
        icon: iconMap[newLinkPlatform.trim()] || Link2,
      }]);
      setNewLinkPlatform('');
      setNewLinkUrl('');
    }
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          skills: skills.join(', '),
          socialLinks: JSON.stringify(socialLinks),
        }),
      });
      if (res.ok) {
        toast.success('Portfolio saved successfully!');
        setIsEditing(false);
      } else {
        toast.error('Failed to save portfolio');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('') || 'S';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Portfolio Editor</h1>
          <p className="text-sm text-text-secondary">Customize your public profile visible to companies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="gap-2">
            <Eye className="w-4 h-4" />{showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button onClick={isEditing ? handleSave : () => setIsEditing(true)} disabled={isSaving} className="gap-2 bg-navy text-white">
            {isEditing ? (
              isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />
            ) : (
              <Edit3 className="w-4 h-4" />
            )}
            {isEditing ? (isSaving ? 'Saving...' : 'Save Changes') : 'Edit Portfolio'}
          </Button>
        </div>
      </div>

      {!showPreview ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bio Section */}
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-electric" /> Bio & About
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-navy flex items-center justify-center text-white text-2xl font-bold">
                      {initials}
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Camera className="w-4 h-4" /> Change Photo
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Bio</label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tell companies about yourself..."
                    className="min-h-[100px] resize-none"
                  />
                  <p className="text-xs text-text-secondary mt-1">{bio.length}/300 characters</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Degree</label>
                    <Input value={user?.degree || ''} disabled className="bg-muted" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Branch</label>
                    <Input value={user?.branch || ''} disabled className="bg-muted" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">College</label>
                    <Input value={user?.college || ''} disabled className="bg-muted" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">City</label>
                    <Input value={user?.city || ''} disabled className="bg-muted" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Section */}
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1.5 text-sm gap-1.5">
                      {skill}
                      {isEditing && (
                        <button onClick={() => removeSkill(skill)} className="hover:text-danger transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      className="flex-1"
                      onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button size="sm" onClick={addSkill} className="gap-1">
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </div>
                )}
                <p className="text-xs text-text-secondary">{skills.length}/20 skills added</p>
              </CardContent>
            </Card>
          </div>

          {/* Social Links Section */}
          <div className="animate-fade-in lg:col-span-2" style={{ animationDelay: '300ms' }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-purple-500" /> Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {socialLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <link.icon className="w-5 h-5 text-text-secondary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{link.platform}</p>
                      <p className="text-xs text-text-secondary truncate">{link.url}</p>
                    </div>
                    {isEditing && (
                      <Button variant="ghost" size="sm" onClick={() => removeSocialLink(index)} className="text-danger hover:text-danger">
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-3 p-3 border border-dashed rounded-lg" style={{ borderColor: '#E2E8F0' }}>
                    <Input value={newLinkPlatform} onChange={(e) => setNewLinkPlatform(e.target.value)} placeholder="Platform (e.g. GitHub)" className="flex-1" />
                    <Input value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} placeholder="URL" className="flex-1" />
                    <Button size="sm" onClick={addSocialLink} className="gap-1">
                      <Plus className="w-4 h-4" /> Add
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Preview Mode */
        <div className="animate-fade-in space-y-6">
          <Card className="overflow-hidden">
            <div className="bg-navy p-8 text-center relative">
              <div className="w-24 h-24 rounded-2xl bg-navy border-4 border-white/30 mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                {initials}
              </div>
              <h2 className="text-2xl font-bold text-white mt-4">{user?.fullName}</h2>
              <p className="text-white/70 text-sm mt-1 flex items-center justify-center gap-2">
                <GraduationCap className="w-4 h-4" />{user?.degree} • {user?.branch}
              </p>
              <p className="text-white/60 text-xs mt-1 flex items-center justify-center gap-2">
                <MapPin className="w-3 h-3" />{user?.college} • {user?.city}
              </p>
            </div>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-2">About</h3>
                <p className="text-sm">{bio}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map(skill => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1">{skill}</Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-text-secondary mb-3">Connect</h3>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm">
                      <link.icon className="w-4 h-4" />{link.platform}<ExternalLink className="w-3 h-3 text-text-secondary" />
                    </a>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
