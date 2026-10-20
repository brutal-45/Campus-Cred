'use client';

import dynamic from 'next/dynamic';

const ResetPasswordPage = dynamic(
  () => import('@/components/auth/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })),
  { ssr: false }
);

export default function ResetPasswordRoute() {
  return <ResetPasswordPage />;
}
