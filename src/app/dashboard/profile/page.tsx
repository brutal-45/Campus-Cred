'use client';

import dynamic from 'next/dynamic';

const ProfileEditPage = dynamic(
  () => import('@/components/profile/ProfileEditPage').then((m) => ({ default: m.ProfileEditPage })),
  { ssr: false }
);

export default function ProfileRoute() {
  return <ProfileEditPage />;
}
