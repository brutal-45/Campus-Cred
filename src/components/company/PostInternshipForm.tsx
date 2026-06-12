'use client';

import React from 'react';
import { useAppStore } from '@/store';
import { DEGREES, DEGREE_BRANCH_MAP } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Plus, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  title: string;
  description: string;
  selectedDegrees: string[];
  selectedBranches: string[];
  duration: string;
  isPaid: boolean;
  stipend: string;
  deadline: string;
}

export function PostInternshipForm() {
  const { token } = useAppStore();
  const [submitting, setSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState<FormData>({
    title: '',
    description: '',
    selectedDegrees: [],
    selectedBranches: [],
    duration: '',
    isPaid: false,
    stipend: '',
    deadline: '',
  });

  const availableBranches = React.useMemo(() => {
    const branches = new Set<string>();
    formData.selectedDegrees.forEach((deg) => {
      (DEGREE_BRANCH_MAP[deg] || []).forEach((br) => branches.add(br));
    });
    return Array.from(branches);
  }, [formData.selectedDegrees]);

  const toggleDegree = (degree: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedDegrees: prev.selectedDegrees.includes(degree)
        ? prev.selectedDegrees.filter((d) => d !== degree)
        : [...prev.selectedDegrees, degree],
      selectedBranches: prev.selectedDegrees.includes(degree)
        ? prev.selectedBranches.filter((b) => {
            const otherDegrees = prev.selectedDegrees.filter((d) => d !== degree);
            const otherBranches = new Set<string>();
            otherDegrees.forEach((d) =>
              (DEGREE_BRANCH_MAP[d] || []).forEach((br) => otherBranches.add(br))
            );
            return otherBranches.has(b);
          })
        : prev.selectedBranches,
    }));
  };

  const toggleBranch = (branch: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedBranches: prev.selectedBranches.includes(branch)
        ? prev.selectedBranches.filter((b) => b !== branch)
        : [...prev.selectedBranches, branch],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || formData.selectedDegrees.length === 0 || formData.selectedBranches.length === 0 || !formData.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.isPaid && !formData.stipend) {
      toast.error('Please enter the stipend amount');
      return;
    }

    setSubmitting(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/company/internships', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          degrees: formData.selectedDegrees,
          branches: formData.selectedBranches,
          duration: formData.duration,
          isPaid: formData.isPaid,
          stipend: formData.isPaid ? formData.stipend : null,
          deadline: new Date(formData.deadline).toISOString(),
        }),
      });

      if (res.ok) {
        toast.success('Internship posted successfully!');
        setFormData({
          title: '',
          description: '',
          selectedDegrees: [],
          selectedBranches: [],
          duration: '',
          isPaid: false,
          stipend: '',
          deadline: '',
        });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to post internship');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-foreground">Post New Internship</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new internship opportunity for students
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Internship Title <span className="text-danger">*</span>
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="e.g., Full-Stack Development Intern"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Description <span className="text-danger">*</span>
              </Label>
              <Textarea
                placeholder="Describe the internship role, responsibilities, and what the student will learn..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
              />
            </div>

            {/* Degrees multi-select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Eligible Degrees <span className="text-danger">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">Select the degrees eligible for this internship</p>
              <div className="flex flex-wrap gap-2">
                {DEGREES.map((degree) => {
                  const isSelected = formData.selectedDegrees.includes(degree);
                  return (
                    <button
                      key={degree}
                      type="button"
                      onClick={() => toggleDegree(degree)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                        isSelected
                          ? 'bg-electric/10 text-electric border-electric/30 shadow-sm'
                          : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                      }`}
                    >
                      {degree}
                    </button>
                  );
                })}
              </div>
              {formData.selectedDegrees.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.selectedDegrees.map((deg) => (
                    <Badge key={deg} variant="secondary" className="text-[10px] gap-1">
                      {deg}
                      <button type="button" onClick={() => toggleDegree(deg)} className="hover:text-danger">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Branches multi-select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Eligible Branches <span className="text-danger">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                {formData.selectedDegrees.length === 0
                  ? 'Select degrees first to see available branches'
                  : 'Select branches eligible for this internship'}
              </p>
              {availableBranches.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableBranches.map((branch) => {
                    const isSelected = formData.selectedBranches.includes(branch);
                    return (
                      <button
                        key={branch}
                        type="button"
                        onClick={() => toggleBranch(branch)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                          isSelected
                            ? 'bg-purple/10 text-purple border-purple/30 shadow-sm'
                            : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                        }`}
                      >
                        {branch}
                      </button>
                    );
                  })}
                </div>
              )}
              {formData.selectedBranches.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.selectedBranches.map((br) => (
                    <Badge key={br} variant="secondary" className="text-[10px] gap-1">
                      {br}
                      <button type="button" onClick={() => toggleBranch(br)} className="hover:text-danger">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Duration and Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Duration</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(val) => setFormData({ ...formData, duration: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 month">1 Month</SelectItem>
                    <SelectItem value="2 months">2 Months</SelectItem>
                    <SelectItem value="3 months">3 Months</SelectItem>
                    <SelectItem value="6 months">6 Months</SelectItem>
                    <SelectItem value="1 year">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Application Deadline <span className="text-danger">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Paid / Stipend */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Paid Internship</Label>
                  <p className="text-xs text-muted-foreground">Toggle if this is a paid position</p>
                </div>
                <Switch
                  checked={formData.isPaid}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isPaid: checked, stipend: checked ? formData.stipend : '' })
                  }
                />
              </div>
              {formData.isPaid && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Stipend</Label>
                  <Input
                    placeholder="e.g., ₹15,000/month"
                    value={formData.stipend}
                    onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary text-white gap-2 py-3"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Post Internship
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
