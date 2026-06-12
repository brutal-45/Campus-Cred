'use client';

import dynamic from 'next/dynamic';
const LoginPage = dynamic(() => import('@/components/auth/LoginPage').then(m => ({ default: m.LoginPage })), { ssr: false });
export default function LoginRoute() { return <LoginPage />; }
