'use client';

import dynamic from 'next/dynamic';
const OnboardingFlow = dynamic(() => import('@/components/onboarding/OnboardingFlow').then(m => ({ default: m.OnboardingFlow })), { ssr: false });
export default function RegisterRoute() { return <OnboardingFlow />; }
