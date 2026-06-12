'use client';

import dynamic from 'next/dynamic';
const CertificatePage = dynamic(() => import('@/components/certificate/CertificatePage').then(m => ({ default: m.CertificatePage })), { ssr: false });
export default function CertificateDetailRoute() { return <CertificatePage />; }
