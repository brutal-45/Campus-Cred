'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store';

const roleHome: Record<string, string> = {
  admin: '/admin',
  company: '/company/dashboard',
  mentor: '/mentor/dashboard',
  college: '/college/dashboard',
  student: '/dashboard',
};

export default function AppEntryPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    router.replace(roleHome[user.role] || '/dashboard');
  }, [isAuthenticated, router, user]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Opening your CampusCred app…</p>
      </div>
    </main>
  );
}
