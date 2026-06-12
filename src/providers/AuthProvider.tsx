'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';

/**
 * AuthProvider wraps the application and handles:
 *
 * 1. **Session restoration on mount** – If there is no access token in the
 *    Zustand store but a valid `cc_refresh` HttpOnly cookie may exist (e.g. the
 *    user refreshed the page), the provider attempts a silent token refresh. On
 *    success the access token (and derived expiry) are stored; on failure the
 *    stale state is cleared.
 *
 * 2. **Silent token auto-refresh** – Delegates to the `useTokenRefresh` hook
 *    which periodically checks whether the access token is about to expire and
 *    silently refreshes it.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated, setToken, setUser, logout } = useAppStore();
  const [isRestoring, setIsRestoring] = useState(true);

  // Activate the silent auto-refresh mechanism
  useTokenRefresh();

  // On mount, try to restore an existing session from the refresh cookie
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      // If we already have a token and are authenticated, nothing to restore
      if (token && isAuthenticated) {
        setIsRestoring(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/refresh-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}), // Server reads from HttpOnly cookie
        });

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          if (data.token) {
            setToken(data.token);

            // Optionally fetch the user profile to restore the full session
            try {
              const profileRes = await fetch('/api/user/profile', {
                headers: { Authorization: `Bearer ${data.token}` },
              });
              if (profileRes.ok) {
                const profileData = await profileRes.json();
                if (profileData.user) {
                  setUser(profileData.user);
                }
              }
            } catch {
              // Profile fetch failed – token is still valid, user can retry
            }
          } else {
            // No token returned – session is invalid
            logout();
          }
        } else {
          // Refresh cookie is invalid/expired – clear any stale state
          logout();
        }
      } catch {
        // Network error – we can't determine session state right now
        // Leave whatever state exists (could be offline)
      } finally {
        if (!cancelled) {
          setIsRestoring(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []); // Run once on mount

  // While restoring session, render nothing (or a minimal loader)
  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Restoring session…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
