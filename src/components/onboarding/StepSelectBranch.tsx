'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  Code,
  Cpu,
  BarChart3,
  Megaphone,
  DollarSign,
  Users,
  Globe,
  Lightbulb,
  Cloud,
  Shield,
  Smartphone,
  Atom,
  Beaker,
  Hash,
  Dna,
  CircuitBoard,
  BookOpen,
  Palette,
  Brain,
  Landmark,
  ScrollText,
  Newspaper,
  UsersRound,
  Briefcase,
  Settings,
  Database,
  PenTool,
  Heart,
  Stethoscope,
  Pill,
  Activity,
  Flower2,
  FlaskRound,
  Wrench,
  HardHat,
  Zap,
  Building,
  Scale,
  Gavel,
  ShieldCheck,
  Globe2,
  ShoppingCart,
  Search,
  Layout,
  ImageIcon,
  MousePointer,
  Video,
  Scissors,
} from 'lucide-react';
import { DEGREE_BRANCH_MAP } from '@/lib/constants';

const BRANCH_ICONS: Record<string, React.ReactNode> = {
  'Computer Science': <Code className="h-5 w-5" />,
  'Information Technology': <Cpu className="h-5 w-5" />,
  'Electronics & Communication': <CircuitBoard className="h-5 w-5" />,
  'Electrical Engineering': <Zap className="h-5 w-5" />,
  'Mechanical Engineering': <Wrench className="h-5 w-5" />,
  'Civil Engineering': <Building className="h-5 w-5" />,
  'Chemical Engineering': <Beaker className="h-5 w-5" />,
  Biotechnology: <Dna className="h-5 w-5" />,
  'Aerospace Engineering': <Globe className="h-5 w-5" />,
  'Artificial Intelligence & ML': <Brain className="h-5 w-5" />,
  General: <BookOpen className="h-5 w-5" />,
  'Data Analytics': <BarChart3 className="h-5 w-5" />,
  'Cloud Computing': <Cloud className="h-5 w-5" />,
  'Cyber Security': <Shield className="h-5 w-5" />,
  'Mobile App Development': <Smartphone className="h-5 w-5" />,
  Marketing: <Megaphone className="h-5 w-5" />,
  Finance: <DollarSign className="h-5 w-5" />,
  'Human Resources': <Users className="h-5 w-5" />,
  'International Business': <Globe className="h-5 w-5" />,
  Entrepreneurship: <Lightbulb className="h-5 w-5" />,
  Physics: <Atom className="h-5 w-5" />,
  Chemistry: <FlaskRound className="h-5 w-5" />,
  Mathematics: <Hash className="h-5 w-5" />,
  Electronics: <CircuitBoard className="h-5 w-5" />,
  Statistics: <BarChart3 className="h-5 w-5" />,
  'Accounting & Finance': <DollarSign className="h-5 w-5" />,
  'Banking & Insurance': <Landmark className="h-5 w-5" />,
  Taxation: <ScrollText className="h-5 w-5" />,
  'E-Commerce': <ShoppingCart className="h-5 w-5" />,
  English: <BookOpen className="h-5 w-5" />,
  Psychology: <Brain className="h-5 w-5" />,
  Economics: <BarChart3 className="h-5 w-5" />,
  'Political Science': <Landmark className="h-5 w-5" />,
  History: <ScrollText className="h-5 w-5" />,
  'Journalism & Mass Communication': <Newspaper className="h-5 w-5" />,
  Sociology: <UsersRound className="h-5 w-5" />,
  Operations: <Settings className="h-5 w-5" />,
  'Business Analytics': <BarChart3 className="h-5 w-5" />,
  'Software Engineering': <Code className="h-5 w-5" />,
  'Data Science': <Database className="h-5 w-5" />,
  'Computer Engineering': <Cpu className="h-5 w-5" />,
  'Corporate Law': <Scale className="h-5 w-5" />,
  'Criminal Law': <Gavel className="h-5 w-5" />,
  'Constitutional Law': <Landmark className="h-5 w-5" />,
  'Intellectual Property Law': <ShieldCheck className="h-5 w-5" />,
  'International Law': <Globe2 className="h-5 w-5" />,
  'Cyber Law': <Shield className="h-5 w-5" />,
  MBBS: <Stethoscope className="h-5 w-5" />,
  BDS: <Activity className="h-5 w-5" />,
  'B.Pharm': <Pill className="h-5 w-5" />,
  BPT: <Activity className="h-5 w-5" />,
  'B.Sc Nursing': <Heart className="h-5 w-5" />,
  BAMS: <Flower2 className="h-5 w-5" />,
  BHMS: <Flower2 className="h-5 w-5" />,
  Physiology: <Activity className="h-5 w-5" />,
  'UI/UX Design': <Layout className="h-5 w-5" />,
  'Graphic Design': <ImageIcon className="h-5 w-5" />,
  'Product Design': <MousePointer className="h-5 w-5" />,
  Animation: <Video className="h-5 w-5" />,
  'Fashion Design': <Scissors className="h-5 w-5" />,
  'Interior Design': <Palette className="h-5 w-5" />,
  'VLSI Design': <CircuitBoard className="h-5 w-5" />,
  'Power Systems': <Zap className="h-5 w-5" />,
  'Structural Engineering': <Building className="h-5 w-5" />,
  'Digital Marketing': <Megaphone className="h-5 w-5" />,
  'AI & ML': <Brain className="h-5 w-5" />,
};

const BRANCH_DESCRIPTIONS: Record<string, string> = {
  'Computer Science': 'Build software, algorithms & systems',
  'Information Technology': 'Manage & apply technology solutions',
  'Electronics & Communication': 'Design circuits & communication systems',
  'Electrical Engineering': 'Power systems & electrical design',
  'Mechanical Engineering': 'Machines, robotics & manufacturing',
  'Civil Engineering': 'Infrastructure, construction & design',
  'Chemical Engineering': 'Process design & material science',
  Biotechnology: 'Biological systems & genetic engineering',
  'Aerospace Engineering': 'Aircraft & spacecraft design',
  'Artificial Intelligence & ML': 'Smart systems & deep learning',
  General: 'Comprehensive foundational curriculum',
  'Data Analytics': 'Data-driven decision making',
  'Cloud Computing': 'Scalable cloud infrastructure',
  'Cyber Security': 'Protect systems & data',
  'Mobile App Development': 'Build iOS & Android apps',
  Marketing: 'Brand strategy & market research',
  Finance: 'Investment & financial planning',
  'Human Resources': 'Talent & people management',
  'International Business': 'Global trade & cross-border ops',
  Entrepreneurship: 'Start, build & scale ventures',
};

interface StepSelectBranchProps {
  selectedDegree: string;
  selectedBranch: string;
  onUpdate: (branch: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepSelectBranch({
  selectedDegree,
  selectedBranch,
  onUpdate,
  onNext,
  onPrev,
}: StepSelectBranchProps) {
  const [localSelected, setLocalSelected] = useState(selectedBranch);
  const [searchQuery, setSearchQuery] = useState('');
  const branches = DEGREE_BRANCH_MAP[selectedDegree] || [];

  const filteredBranches = branches.filter((branch) =>
    branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setLocalSelected(selectedBranch);
  }, [selectedBranch]);

  const handleSelect = (branch: string) => {
    setLocalSelected(branch);
    onUpdate(branch);
  };

  return (
    <div
      className="animate-fade-in-up w-full max-w-3xl mx-auto"
    >
      <div className="text-center mb-6">
        <div
          className="animate-fade-in w-16 h-16 rounded-2xl bg-purple/20 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple/20"
          style={{ borderColor: '#E2E8F0', border: '1px solid', animationDelay: '100ms' }}
        >
          <GraduationCap className="h-8 w-8 text-purple-light" />
        </div>
        <h2
          className="animate-fade-in text-3xl font-bold text-white font-[family-name:var(--font-poppins)]"
          style={{ animationDelay: '150ms' }}
        >
          Choose your branch
        </h2>
        <p
          className="animate-fade-in text-text-secondary mt-2 text-sm"
          style={{ animationDelay: '200ms' }}
        >
          Specializations available for{' '}
          <span className="text-electric font-medium">{selectedDegree}</span>
        </p>
      </div>

      {/* Search */}
      {branches.length > 4 && (
        <div
          className="animate-fade-in-up mb-4"
          style={{ animationDelay: '250ms' }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300/50" />
            <input
              placeholder="Search branches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border text-white placeholder:text-blue-300/30 text-sm focus:outline-none focus:border-purple/50 focus:ring-1 focus:ring-purple/20 transition-all duration-200"
              style={{ borderColor: '#E2E8F0' }}
            />
          </div>
        </div>
      )}

      {/* Branch Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredBranches.map((branch, index) => {
          const isSelected = localSelected === branch;

          return (
            <button
              key={branch}
              onClick={() => handleSelect(branch)}
              className={`animate-fade-in card-hover relative group p-4 rounded-xl border transition-all duration-300 text-left btn-press ${
                isSelected
                  ? 'border-purple/60 bg-purple/10 shadow-lg shadow-purple/15'
                  : 'border-white/10 bg-white/5 hover:border-purple/30 hover:bg-white/8'
              }`}
              style={{ animationDelay: `${index * 40}ms` }}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple flex items-center justify-center shadow-md">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </div>
              )}

              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 transition-colors duration-300 ${
                    isSelected
                      ? 'text-purple-light'
                      : 'text-blue-200/40 group-hover:text-blue-200/70'
                  }`}
                >
                  {BRANCH_ICONS[branch] || <BookOpen className="h-5 w-5" />}
                </div>

                <div className="min-w-0">
                  {/* Branch Name */}
                  <p
                    className={`font-semibold text-sm leading-tight transition-colors duration-300 ${
                      isSelected
                        ? 'text-white'
                        : 'text-blue-100/80 group-hover:text-white'
                    }`}
                  >
                    {branch}
                  </p>

                  {/* Description */}
                  <p
                    className={`text-xs mt-1 leading-relaxed transition-colors duration-300 ${
                      isSelected
                        ? 'text-purple-light/70'
                        : 'text-blue-200/40 group-hover:text-blue-200/60'
                    }`}
                  >
                    {BRANCH_DESCRIPTIONS[branch] ||
                      `Specialization in ${branch}`}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {branches.length === 0 && (
        <div className="animate-fade-in text-center py-12">
          <p className="text-blue-200/40 text-sm">
            No branches available for this degree. Please go back and select a
            different degree.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div
        className="animate-fade-in-up flex items-center justify-between mt-6"
        style={{ animationDelay: '300ms' }}
      >
        <Button
          type="button"
          variant="ghost"
          onClick={onPrev}
          className="text-blue-200/60 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Change Degree
        </Button>
        <Button
          type="button"
          disabled={!localSelected}
          onClick={onNext}
          className="btn-press btn-primary text-white font-semibold px-8 h-11 rounded-xl shadow-lg shadow-electric/20 hover:shadow-electric/40 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
