'use client';

import dynamic from 'next/dynamic';
const AccountSecurityPage = dynamic(() => import('@/components/auth/AccountSecurityPage').then(m => ({ default: m.AccountSecurityPage })), { ssr: false });
export default function SettingsRoute() { return <AccountSecurityPage />; }
