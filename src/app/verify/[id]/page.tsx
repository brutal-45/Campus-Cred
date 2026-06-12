'use client';

import dynamic from 'next/dynamic';
const VerifyPage = dynamic(() => import('@/components/certificate/VerifyPage').then(m => ({ default: m.VerifyPage })), { ssr: false });
export default function VerifyRoute() { return <VerifyPage />; }
