'use client';

import dynamic from 'next/dynamic';

const ForgotPasswordPage = dynamic(
  () => import('@/components/auth/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })),
  { ssr: false }
);

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
