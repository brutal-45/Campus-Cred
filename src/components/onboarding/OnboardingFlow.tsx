'use client';

import React, { useState, useCallback } from 'react';
import { Sparkles } from 'lucide-react';
import { CampusCredLogo } from '@/components/shared/CampusCredLogo';
import { BackButton } from '@/components/shared/BackButton';
import { ProgressStepper } from '@/components/shared/ProgressStepper';
import { LiveCertificatePreview } from '@/components/certificate/LiveCertificatePreview';
import { StepRegister } from './StepRegister';
import { StepPersonalInfo } from './StepPersonalInfo';
import { StepSelectDegree } from './StepSelectDegree';
import { StepSelectBranch } from './StepSelectBranch';
import { StepSelectYear } from './StepSelectYear';
import { StepVerifyEmail } from './StepVerifyEmail';
import { CompletionScreen } from './CompletionScreen';
import { useAppStore } from '@/store';
import { toast } from 'sonner';

const STEPPER_LABELS = [
  { label: 'Academic' },
  { label: 'Degree' },
  { label: 'Branch' },
  { label: 'Year' },
  { label: 'Verify' },
];

interface OnboardingData {
  college: string;
  city: string;
  state: string;
  degree: string;
  branch: string;
  year: string;
  collegeVerified: boolean;
  emailVerified: boolean;
}

/** Certificate preview is shown only on academic steps (1-4) */
function useShowCertificatePreview(step: number) {
  return step >= 1 && step <= 4;
}

export function OnboardingFlow() {
  const { user, setUser, token, navigate, oauthUser, oauthOnboarding, setOauthOnboarding } = useAppStore();

  // OAuth users skip Step 0 (StepRegister) — start at Step 1 (StepPersonalInfo)
  const initialStep = oauthOnboarding ? 1 : 0;

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    college: '',
    city: '',
    state: '',
    degree: '',
    branch: '',
    year: '',
    collegeVerified: false,
    emailVerified: oauthOnboarding, // OAuth users are already email-verified
  });

  const showCertificatePreview = useShowCertificatePreview(currentStep);

  // Map currentStep to stepper step
  // Steps 1-4: Academic steps (stepper 0-3)
  // Step 5: Email verify step (stepper 4)
  const getStepperStep = () => {
    if (currentStep <= 1) return 0;
    if (currentStep === 2) return 1;
    if (currentStep === 3) return 2;
    if (currentStep === 4) return 3;
    if (currentStep === 5) return 4;
    return 4;
  };

  const stepperStep = getStepperStep();

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const updateOnboardingData = useCallback(
    (partial: Partial<OnboardingData>) => {
      setOnboardingData((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const handleComplete = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          college: onboardingData.college,
          city: onboardingData.city,
          state: onboardingData.state,
          degree: onboardingData.degree,
          branch: onboardingData.branch,
          year: onboardingData.year,
          collegeVerified: onboardingData.collegeVerified,
          isVerified: onboardingData.emailVerified,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to save profile');
        setCurrentStep(6);
        return;
      }

      setUser(data.user);
      // Clear OAuth onboarding state after completion
      if (oauthOnboarding) {
        setOauthOnboarding(false);
      }
      setCurrentStep(6);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Something went wrong, but your account is ready!');
      setCurrentStep(6);
    }
  }, [token, onboardingData, setUser, oauthOnboarding, setOauthOnboarding]);

  const handleGoToDashboard = useCallback(() => {
    navigate('dashboard');
  }, [navigate]);

  // Determine step label
  const getStepLabel = () => {
    if (currentStep === 0) return '';
    if (currentStep >= 1 && currentStep <= 4) return `Step ${currentStep} of 4 — Academic`;
    if (currentStep === 5) return 'Email Verification';
    return '';
  };

  // Whether to show the stepper (steps 1-5)
  const showStepper = currentStep >= 1 && currentStep <= 5;

  // ─── Certificate preview props derived from onboarding data ───
  const certificateStudentName = user?.fullName || '';
  const certificateDegree = onboardingData.degree;
  const certificateBranch = onboardingData.branch;
  const certificateCollege = onboardingData.college;
  const certificateCity = onboardingData.city;

  // ─── Shared certificate preview panel (used in both desktop & mobile) ───
  const certificatePreviewPanel = (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-gold" />
        <h3 className="text-sm font-semibold text-gold font-[family-name:var(--font-poppins)]">
          Your Certificate Preview
        </h3>
      </div>

      {/* Preview area with dark card styling */}
      <div
        className="rounded-xl p-3 shadow-lg shadow-black/10"
        style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: '#E2E8F0', border: '1px solid' }}
      >
        <LiveCertificatePreview
          studentName={certificateStudentName}
          degree={certificateDegree}
          branch={certificateBranch}
          college={certificateCollege}
          city={certificateCity}
          taskTitle="Sample CampusCred Task"
          skills={['Web Development', 'Problem Solving']}
          level="Starter"
          profilePhotoUrl={user?.profilePhoto || user?.oauthAvatar || null}
          collapsible={false}
        />
      </div>

      {/* Subtle hint text */}
      <p className="text-[10px] text-blue-200/30 text-center">
        Certificate updates live as you fill in your details
      </p>
    </div>
  );

  return (
    <div className="min-h-screen hero-bg flex flex-col">
      {/* Header with BackButton + CampusCredLogo */}
      <header
        className="animate-fade-in relative z-10 flex items-center justify-between px-4 sm:px-8 py-5"
      >
        <div className="flex items-center gap-3">
          <BackButton
            onClick={() => {
              if (currentStep === 0) {
                navigate('landing');
              } else {
                handlePrev();
              }
            }}
            to={currentStep === 0 ? 'Home' : 'Previous Step'}
          />
          <button
            onClick={() => navigate('landing')}
            className="flex items-center gap-2 group"
          >
            <CampusCredLogo
              size={36}
              variant="white"
              animate={currentStep === 0}
            />
          </button>
        </div>

        {currentStep > 0 && currentStep < 6 && (
          <span
            className="animate-fade-in text-blue-200/40 text-sm font-[family-name:var(--font-poppins)]"
          >
            {getStepLabel()}
          </span>
        )}
      </header>

      {/* Progress Stepper */}
      {showStepper && (
        <div
          className="animate-fade-in relative z-10 px-4 sm:px-8 mb-6 max-w-3xl mx-auto w-full"
          style={{ animationDelay: '200ms' }}
        >
          <ProgressStepper steps={STEPPER_LABELS} currentStep={stepperStep} />
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-start sm:items-center justify-center px-4 sm:px-8 pb-8">
        {/* Two-column layout on desktop when certificate preview is visible */}
        {showCertificatePreview ? (
          <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left column: Step form */}
            <div className="flex-1 min-w-0">
              {currentStep === 1 && (
                <StepPersonalInfo
                  key="personal"
                  data={{
                    college: onboardingData.college,
                    city: onboardingData.city,
                    state: onboardingData.state,
                  }}
                  onUpdate={(data) =>
                    updateOnboardingData({
                      college: data.college,
                      city: data.city,
                      state: data.state,
                    })
                  }
                  onNext={handleNext}
                  onPrev={handlePrev}
                />
              )}
              {currentStep === 2 && (
                <StepSelectDegree
                  key="degree"
                  selectedDegree={onboardingData.degree}
                  onUpdate={(degree) => updateOnboardingData({ degree })}
                  onNext={handleNext}
                  onPrev={handlePrev}
                />
              )}
              {currentStep === 3 && (
                <StepSelectBranch
                  key="branch"
                  selectedDegree={onboardingData.degree}
                  selectedBranch={onboardingData.branch}
                  onUpdate={(branch) => updateOnboardingData({ branch })}
                  onNext={handleNext}
                  onPrev={handlePrev}
                />
              )}
              {currentStep === 4 && (
                <StepSelectYear
                  key="year"
                  selectedYear={onboardingData.year}
                  selectedDegree={onboardingData.degree}
                  onUpdate={(year) => updateOnboardingData({ year })}
                  onNext={() => {
                    if (oauthOnboarding) {
                      // OAuth users already have verified emails — skip email verification step
                      updateOnboardingData({ emailVerified: true });
                      handleComplete();
                    } else {
                      updateOnboardingData({ emailVerified: false });
                      handleNext();
                    }
                  }}
                  onPrev={handlePrev}
                />
              )}
            </div>

            {/* Right column: Certificate preview (desktop only, relatively static) */}
            <div
              className="animate-fade-in hidden lg:block w-[380px] shrink-0 sticky top-8 self-start"
              style={{ animationDelay: '300ms' }}
            >
              {certificatePreviewPanel}
            </div>

            {/* Mobile/Tablet: Collapsible certificate preview below form */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobilePreviewOpen((prev) => !prev)}
                className="w-full flex items-center justify-between p-3 rounded-xl border hover:bg-gold/5 transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: '#E2E8F0', border: '1px solid' }}
              >
                <span className="flex items-center gap-2 text-sm text-gold font-medium">
                  <Sparkles className="w-4 h-4" />
                  Certificate Preview
                </span>
                <span
                  className="text-white/40 transition-transform duration-200"
                  style={{ transform: mobilePreviewOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </button>

              {mobilePreviewOpen && (
                <div className="overflow-hidden">
                  <div className="pt-3">
                    {certificatePreviewPanel}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Default single-column layout for steps without preview */
          <>
            {currentStep === 0 && (
              <StepRegister key="register" onNext={handleNext} />
            )}
            {currentStep === 5 && (
              <StepVerifyEmail
                key="verify-email"
                email={user?.email || ''}
                onVerified={() => {
                  updateOnboardingData({ emailVerified: true });
                  handleComplete();
                }}
                onSkip={() => {
                  // Skip email verification — user can verify later from profile
                  updateOnboardingData({ emailVerified: false });
                  handleComplete();
                }}
                onPrev={handlePrev}
              />
            )}
            {currentStep === 6 && (
              <CompletionScreen
                key="completion"
                userName={user?.fullName || 'Student'}
                degree={onboardingData.degree}
                branch={onboardingData.branch}
                city={onboardingData.city}
                onGoToDashboard={handleGoToDashboard}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
