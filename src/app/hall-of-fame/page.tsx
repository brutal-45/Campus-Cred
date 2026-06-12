'use client';

import dynamic from 'next/dynamic';
const HallOfFamePage = dynamic(() => import('@/components/portfolio/HallOfFamePage').then(m => ({ default: m.HallOfFamePage })), { ssr: false });
export default function HallOfFameRoute() { return <HallOfFamePage />; }
