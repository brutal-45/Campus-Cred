'use client';

import React from 'react';

import { useAppStore } from '@/store';
import { OverviewPanel as CompanyOverview } from './OverviewPanel';
import { PostInternshipForm } from './PostInternshipForm';
import { ApplicantReview } from './ApplicantReview';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import {
  LayoutDashboard,
  PlusCircle,
  FileCheck,
  Users,
  LogOut,
  Menu,
  X,
  Home,
} from 'lucide-react';

const tabItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'post', label: 'Post Internship', icon: PlusCircle },
  { id: 'submissions', label: 'View Submissions', icon: FileCheck },
  { id: 'hired', label: 'Hired Students', icon: Users },
];

export function CompanyDashboard() {
  const { user, companyTab, setCompanyTab, logout, navigate } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen section-gray">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (companyTab) {
      case 'overview':
        return <CompanyOverview />;
      case 'post':
        return <PostInternshipForm />;
      case 'submissions':
        return <ApplicantReview />;
      case 'hired':
        return <ApplicantReview defaultTab="hired" />;
      default:
        return <CompanyOverview />;
    }
  };

  return (
    <div className="min-h-screen section-gray flex flex-col">
      {/* Company branding header */}
      <div className="bg-white border-b border-[#E2E8F0] py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CampusCredLogo size={36} variant="dark" />
            <div>
              <h1 className="text-navy font-bold font-heading text-lg">
                {user.fullName || 'Company Dashboard'}
              </h1>
              <p className="text-text-secondary text-xs">CampusCred for Employers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Desktop: Home + Logout buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('landing')}
                className="h-8 gap-1.5 px-3 text-text-secondary hover:text-navy hover:bg-[#F1F5F9] rounded-lg text-xs font-medium"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 gap-1.5 px-3 text-text-secondary hover:text-danger hover:bg-red-50 rounded-lg text-xs font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-navy text-white text-sm font-semibold">
                {user.fullName.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-navy" /> : <Menu className="w-5 h-5 text-navy" />}
            </button>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-[#E2E8F0] bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Desktop tabs */}
          <div className="hidden lg:flex gap-1 py-1">
            {tabItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCompanyTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    companyTab === item.id
                      ? 'bg-navy/10 text-navy'
                      : 'text-text-secondary hover:bg-[#F1F5F9] hover:text-navy'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
          {/* Mobile tabs - scrollable */}
          <div className="lg:hidden flex gap-1 py-1 overflow-x-auto">
            {tabItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCompanyTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    companyTab === item.id
                      ? 'bg-navy/10 text-navy'
                      : 'text-text-secondary hover:bg-[#F1F5F9]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div key={companyTab} className="animate-fade-in">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden sticky bottom-0 z-50 bg-white border-t border-[#E2E8F0] px-2 py-1">
        <div className="flex items-center justify-around">
          {tabItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCompanyTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${
                  companyTab === item.id ? 'text-navy' : 'text-text-secondary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => navigate('landing')}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-text-secondary hover:text-navy transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={logout}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-text-secondary hover:text-danger transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-medium">Sign Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
