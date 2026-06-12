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
  GraduationCap, Wrench, FolderOpen, Briefcase, Award, Plus, X, Edit3,
  Save, Trash2, Calendar, MapPin, Building2, ExternalLink, FileText, Download,
  Eye, ChevronUp, ChevronDown, GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';

interface EducationEntry {
  id: string; institution: string; degree: string; field: string; startYear: string; endYear: string; gpa: string;
}
interface SkillEntry { id: string; category: string; items: string[]; }
interface ProjectEntry {
  id: string; title: string; description: string; technologies: string[]; link: string; startDate: string; endDate: string;
}
interface ExperienceEntry {
  id: string; company: string; role: string; startDate: string; endDate: string; current: boolean; description: string;
}
interface CertificationEntry { id: string; name: string; issuer: string; date: string; link: string; }

export default function ResumePage() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = React.useState('education');
  const [isSaving, setIsSaving] = React.useState(false);

  const [education, setEducation] = React.useState<EducationEntry[]>([
    { id: '1', institution: user?.college || 'IIT Delhi', degree: user?.degree || 'B.Tech', field: user?.branch || 'CSE', startYear: '2021', endYear: '2025', gpa: '8.5' },
  ]);
  const [skillGroups, setSkillGroups] = React.useState<SkillEntry[]>([
    { id: '1', category: 'Programming', items: ['Python', 'JavaScript', 'TypeScript', 'C++'] },
    { id: '2', category: 'Frameworks', items: ['React', 'Next.js', 'Node.js', 'Django'] },
    { id: '3', category: 'Tools', items: ['Git', 'Docker', 'AWS', 'Figma'] },
  ]);
  const [projects, setProjects] = React.useState<ProjectEntry[]>([
    { id: '1', title: 'E-Commerce Platform', description: 'Built a full-stack e-commerce platform with React, Node.js, and MongoDB. Features include user auth, payment integration, and admin dashboard.', technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'], link: 'https://github.com/student/ecommerce', startDate: 'Jan 2024', endDate: 'Mar 2024' },
    { id: '2', title: 'AI Chat Assistant', description: 'Developed an AI-powered chatbot using Python and OpenAI API. Integrated with Slack and Discord for team collaboration.', technologies: ['Python', 'OpenAI', 'Slack API', 'FastAPI'], link: 'https://github.com/student/ai-chat', startDate: 'Oct 2023', endDate: 'Dec 2023' },
  ]);
  const [experience, setExperience] = React.useState<ExperienceEntry[]>([
    { id: '1', company: 'Razorpay', role: 'Frontend Intern', startDate: 'May 2024', endDate: 'Jul 2024', current: false, description: 'Developed responsive UI components for the merchant dashboard. Reduced page load time by 30% through code splitting and lazy loading.' },
  ]);
  const [certifications, setCertifications] = React.useState<CertificationEntry[]>([
    { id: '1', name: 'Web Development Professional', issuer: 'CampusCred', date: '2024', link: '/verify/CERT-2024' },
    { id: '2', name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', date: '2024', link: '' },
  ]);

  const addEducation = () => setEducation([...education, { id: Date.now().toString(), institution: '', degree: '', field: '', startYear: '', endYear: '', gpa: '' }]);
  const addProject = () => setProjects([...projects, { id: Date.now().toString(), title: '', description: '', technologies: [], link: '', startDate: '', endDate: '' }]);
  const addExperience = () => setExperience([...experience, { id: Date.now().toString(), company: '', role: '', startDate: '', endDate: '', current: false, description: '' }]);
  const addCertification = () => setCertifications([...certifications, { id: Date.now().toString(), name: '', issuer: '', date: '', link: '' }]);

  const removeEntry = <T extends { id: string }>(list: T[], setList: React.Dispatch<React.SetStateAction<T[]>>, id: string) => {
    setList(list.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Resume saved successfully!');
    setIsSaving(false);
  };

  const sectionConfig = [
    { id: 'education', label: 'Education', icon: GraduationCap, color: 'text-blue-500', count: education.length },
    { id: 'skills', label: 'Skills', icon: Wrench, color: 'text-purple-500', count: skillGroups.length },
    { id: 'projects', label: 'Projects', icon: FolderOpen, color: 'text-emerald-500', count: projects.length },
    { id: 'experience', label: 'Experience', icon: Briefcase, color: 'text-amber-500', count: experience.length },
    { id: 'certifications', label: 'Certifications', icon: Award, color: 'text-rose-500', count: certifications.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Resume Builder</h1>
          <p className="text-sm text-text-secondary">Build a professional resume to share with companies</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Eye className="w-4 h-4" />Preview</Button>
          <Button variant="outline" className="gap-2"><Download className="w-4 h-4" />Download PDF</Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-navy text-white">
            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </Button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sectionConfig.map(section => (
          <Button
            key={section.id}
            variant={activeTab === section.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(section.id)}
            className="gap-2 whitespace-nowrap"
          >
            <section.icon className={`w-4 h-4 ${activeTab !== section.id ? section.color : ''}`} />
            {section.label}
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">{section.count}</Badge>
          </Button>
        ))}
      </div>

      <Separator />

      {/* Education Section */}
      {activeTab === 'education' && (
        <div className="animate-fade-in space-y-4">
          {education.map((edu, i) => (
            <Card key={edu.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold">{edu.institution || 'New Education Entry'}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeEntry(education, setEducation, edu.id)} className="text-danger hover:text-danger">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium">Institution</label><Input value={edu.institution} onChange={e => setEducation(education.map((e, idx) => idx === i ? { ...e, institution: e.target.value } : e))} placeholder="University name" /></div>
                  <div><label className="text-xs font-medium">Degree</label><Input value={edu.degree} onChange={e => setEducation(education.map((en, idx) => idx === i ? { ...en, degree: (e.target as HTMLInputElement).value } : en))} placeholder="B.Tech" /></div>
                  <div><label className="text-xs font-medium">Field of Study</label><Input value={edu.field} onChange={e => setEducation(education.map((en, idx) => idx === i ? { ...en, field: (e.target as HTMLInputElement).value } : en))} placeholder="Computer Science" /></div>
                  <div><label className="text-xs font-medium">GPA</label><Input value={edu.gpa} onChange={e => setEducation(education.map((en, idx) => idx === i ? { ...en, gpa: (e.target as HTMLInputElement).value } : en))} placeholder="8.5/10" /></div>
                  <div><label className="text-xs font-medium">Start Year</label><Input value={edu.startYear} onChange={e => setEducation(education.map((en, idx) => idx === i ? { ...en, startYear: (e.target as HTMLInputElement).value } : en))} placeholder="2021" /></div>
                  <div><label className="text-xs font-medium">End Year</label><Input value={edu.endYear} onChange={e => setEducation(education.map((en, idx) => idx === i ? { ...en, endYear: (e.target as HTMLInputElement).value } : en))} placeholder="2025" /></div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addEducation} className="w-full border-dashed gap-2"><Plus className="w-4 h-4" />Add Education</Button>
        </div>
      )}

      {/* Skills Section */}
      {activeTab === 'skills' && (
        <div className="animate-fade-in space-y-4">
          {skillGroups.map((group, gi) => (
            <Card key={group.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Input value={group.category} onChange={e => setSkillGroups(skillGroups.map((g, i) => i === gi ? { ...g, category: e.target.value } : g))} className="max-w-[200px] font-semibold" placeholder="Category name" />
                  <Button variant="ghost" size="sm" onClick={() => setSkillGroups(skillGroups.filter((_, i) => i !== gi))} className="text-danger hover:text-danger"><Trash2 className="w-4 h-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item, ii) => (
                    <Badge key={ii} variant="secondary" className="px-3 py-1 gap-1.5">
                      {item}
                      <button onClick={() => setSkillGroups(skillGroups.map((g, i) => i === gi ? { ...g, items: g.items.filter((_, j) => j !== ii) } : g))} className="hover:text-danger"><X className="w-3 h-3" /></button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={() => setSkillGroups([...skillGroups, { id: Date.now().toString(), category: '', items: [] }])} className="w-full border-dashed gap-2"><Plus className="w-4 h-4" />Add Skill Category</Button>
        </div>
      )}

      {/* Projects Section */}
      {activeTab === 'projects' && (
        <div className="animate-fade-in space-y-4">
          {projects.map((proj, i) => (
            <Card key={proj.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{proj.title || 'New Project'}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeEntry(projects, setProjects, proj.id)} className="text-danger hover:text-danger"><Trash2 className="w-4 h-4" /></Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2"><label className="text-xs font-medium">Project Title</label><Input value={proj.title} onChange={e => setProjects(projects.map((p, idx) => idx === i ? { ...p, title: e.target.value } : p))} placeholder="Project name" /></div>
                  <div className="sm:col-span-2"><label className="text-xs font-medium">Description</label><Textarea value={proj.description} onChange={e => setProjects(projects.map((p, idx) => idx === i ? { ...p, description: e.target.value } : p))} placeholder="What did you build?" className="min-h-[80px]" /></div>
                  <div><label className="text-xs font-medium">Link</label><Input value={proj.link} onChange={e => setProjects(projects.map((p, idx) => idx === i ? { ...p, link: e.target.value } : p))} placeholder="https://..." /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs font-medium">Start</label><Input value={proj.startDate} onChange={e => setProjects(projects.map((p, idx) => idx === i ? { ...p, startDate: e.target.value } : p))} placeholder="Jan 2024" /></div>
                    <div><label className="text-xs font-medium">End</label><Input value={proj.endDate} onChange={e => setProjects(projects.map((p, idx) => idx === i ? { ...p, endDate: e.target.value } : p))} placeholder="Mar 2024" /></div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {proj.technologies.map((tech, ti) => (
                    <Badge key={ti} variant="outline" className="px-2 py-0.5 text-xs gap-1">{tech}<button onClick={() => setProjects(projects.map((p, idx) => idx === i ? { ...p, technologies: p.technologies.filter((_, j) => j !== ti) } : p))}><X className="w-2.5 h-2.5" /></button></Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addProject} className="w-full border-dashed gap-2"><Plus className="w-4 h-4" />Add Project</Button>
        </div>
      )}

      {/* Experience Section */}
      {activeTab === 'experience' && (
        <div className="animate-fade-in space-y-4">
          {experience.map((exp, i) => (
            <Card key={exp.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold">{exp.role || 'New Experience'} {exp.company && `at ${exp.company}`}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeEntry(experience, setExperience, exp.id)} className="text-danger hover:text-danger"><Trash2 className="w-4 h-4" /></Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium">Company</label><Input value={exp.company} onChange={e => setExperience(experience.map((ex, idx) => idx === i ? { ...ex, company: e.target.value } : ex))} placeholder="Company name" /></div>
                  <div><label className="text-xs font-medium">Role</label><Input value={exp.role} onChange={e => setExperience(experience.map((ex, idx) => idx === i ? { ...ex, role: e.target.value } : ex))} placeholder="Frontend Intern" /></div>
                  <div><label className="text-xs font-medium">Start Date</label><Input value={exp.startDate} onChange={e => setExperience(experience.map((ex, idx) => idx === i ? { ...ex, startDate: e.target.value } : ex))} placeholder="May 2024" /></div>
                  <div><label className="text-xs font-medium">End Date</label><Input value={exp.endDate} onChange={e => setExperience(experience.map((ex, idx) => idx === i ? { ...ex, endDate: e.target.value } : ex))} placeholder="Jul 2024" /></div>
                  <div className="sm:col-span-2"><label className="text-xs font-medium">Description</label><Textarea value={exp.description} onChange={e => setExperience(experience.map((ex, idx) => idx === i ? { ...ex, description: e.target.value } : ex))} placeholder="What did you accomplish?" className="min-h-[80px]" /></div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addExperience} className="w-full border-dashed gap-2"><Plus className="w-4 h-4" />Add Experience</Button>
        </div>
      )}

      {/* Certifications Section */}
      {activeTab === 'certifications' && (
        <div className="animate-fade-in space-y-4">
          {certifications.map((cert, i) => (
            <Card key={cert.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-rose-500" />
                    <span className="text-sm font-semibold">{cert.name || 'New Certification'}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeEntry(certifications, setCertifications, cert.id)} className="text-danger hover:text-danger"><Trash2 className="w-4 h-4" /></Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium">Certification Name</label><Input value={cert.name} onChange={e => setCertifications(certifications.map((c, idx) => idx === i ? { ...c, name: e.target.value } : c))} placeholder="AWS Certified" /></div>
                  <div><label className="text-xs font-medium">Issuing Organization</label><Input value={cert.issuer} onChange={e => setCertifications(certifications.map((c, idx) => idx === i ? { ...c, issuer: e.target.value } : c))} placeholder="Amazon Web Services" /></div>
                  <div><label className="text-xs font-medium">Date</label><Input value={cert.date} onChange={e => setCertifications(certifications.map((c, idx) => idx === i ? { ...c, date: e.target.value } : c))} placeholder="2024" /></div>
                  <div><label className="text-xs font-medium">Link</label><Input value={cert.link} onChange={e => setCertifications(certifications.map((c, idx) => idx === i ? { ...c, link: e.target.value } : c))} placeholder="https://..." /></div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addCertification} className="w-full border-dashed gap-2"><Plus className="w-4 h-4" />Add Certification</Button>
        </div>
      )}
    </div>
  );
}
