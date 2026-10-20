'use client';

import dynamic from 'next/dynamic';

const MentorDashboard = dynamic(
  () => import('@/components/mentor/MentorDashboard').then((module) => ({ default: module.MentorDashboard })),
  { ssr: false }
);

export default function MentorDashboardRoute() {
  return <MentorDashboard />;
}
