'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store';

/**
 * Decodes the payload of a JWT token without a library.
 * Returns the parsed payload object or null on failure.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/** Interval check frequency in milliseconds */
const CHECK_INTERVAL_MS = 60_000; // 60 seconds

/** Refresh the token when it will expire within this window (ms) */
const REFRESH_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Hook that silently refreshes the access token before it expires.
 *
 * - Checks every 60 seconds whether the current JWT will expire within 2 minutes.
 * - If so, calls the refresh-token API to obtain a new access token.
 * - On success the Zustand store's `token` (and derived `tokenExpiry`) is updated.
 * - On failure (e.g. refresh token expired) the user is logged out.
 * - Only active when `isAuthenticated` is true and `token` exists.
 * - Properly cleans up the interval on unmount.
 */
export function useTokenRefresh() {
  const { token, tokenExpiry, isAuthenticated, setToken, logout } = useAppStore();

  // Use a ref so the interval callback always has the latest values without
  // needing to tear down and recreate the interval on every state change.
  const stateRef = useRef({ token, tokenExpiry, isAuthenticated, setToken, logout });
  stateRef.current = { token, tokenExpiry, isAuthenticated, setToken, logout };

  // Track whether a refresh is already in-flight to prevent concurrent requests
  const refreshingRef = useRef(false);

  const tryRefresh = useCallback(async () => {
    const { token: currentToken, isAuthenticated: authed } = stateRef.current;

    if (!authed || !currentToken) return;

    // Determine expiry – prefer the stored tokenExpiry, fall back to decoding
    let expiryMs = stateRef.current.tokenExpiry;
    if (!expiryMs) {
      const payload = decodeJwtPayload(currentToken);
      if (payload?.exp && typeof payload.exp === 'number') {
        expiryMs = payload.exp * 1000;
      }
    }

    // If we still can't determine expiry, skip (let it fail naturally)
    if (!expiryMs) return;

    const now = Date.now();
    const timeUntilExpiry = expiryMs - now;

    // Only refresh if the token will expire within the refresh window
    if (timeUntilExpiry > REFRESH_WINDOW_MS) return;

    // Prevent concurrent refresh attempts
    if (refreshingRef.current) return;
    refreshingRef.current = true;

    try {
      const res = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Server reads from HttpOnly cookie
      });

      if (!res.ok) {
        // Refresh token is invalid/expired – force logout
        stateRef.current.logout();
        return;
      }

      const data = await res.json();
      if (data.token) {
        stateRef.current.setToken(data.token);
      } else {
        stateRef.current.logout();
      }
    } catch {
      // Network error – we'll retry on the next interval tick
    } finally {
      refreshingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Only start the interval when authenticated and a token exists
    if (!isAuthenticated || !token) return;

    // Run an immediate check in case the token is already near expiry
    tryRefresh();

    const intervalId = setInterval(tryRefresh, CHECK_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, token, tryRefresh]);
}
