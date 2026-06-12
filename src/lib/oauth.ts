/**
 * OAuth Utility — Handles OAuth configuration, URL generation,
 * popup flow, and callback exchange for Google, GitHub, and LinkedIn.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type OAuthProvider = 'google' | 'github' | 'linkedin';

export interface OAuthConfig {
  clientId: string;
  redirectUri: string;
  authUrl: string;
  scope: string;
  tokenUrl?: string;
}

export interface OAuthUserData {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  name: string;
  avatar: string | null;
}

export interface OAuthResult {
  user: OAuthUserData;
  isNewUser: boolean;
}

// ─── Demo mock data for development ──────────────────────────────────────────

const DEMO_OAUTH_DATA: Record<OAuthProvider, OAuthUserData> = {
  google: {
    provider: 'google',
    providerId: 'google_demo_12345',
    email: 'student@gmail.com',
    name: 'Demo Student',
    avatar: null,
  },
  github: {
    provider: 'github',
    providerId: 'github_demo_12345',
    email: 'devstudent@github.com',
    name: 'Dev Student',
    avatar: null,
  },
  linkedin: {
    provider: 'linkedin',
    providerId: 'linkedin_demo_12345',
    email: 'professional@outlook.com',
    name: 'Pro Student',
    avatar: null,
  },
};

// ─── OAuth Provider Configurations ───────────────────────────────────────────

const OAUTH_CONFIGS: Record<OAuthProvider, OAuthConfig> = {
  google: {
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirectUri:
      typeof window !== 'undefined'
        ? `${window.location.origin}/api/auth/oauth/callback/google`
        : '',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'openid email profile',
    tokenUrl: 'https://oauth2.googleapis.com/token',
  },
  github: {
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
    redirectUri:
      typeof window !== 'undefined'
        ? `${window.location.origin}/api/auth/oauth/callback/github`
        : '',
    authUrl: 'https://github.com/login/oauth/authorize',
    scope: 'user:email read:user',
    tokenUrl: 'https://github.com/login/oauth/access_token',
  },
  linkedin: {
    clientId: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '',
    redirectUri:
      typeof window !== 'undefined'
        ? `${window.location.origin}/api/auth/oauth/callback/linkedin`
        : '',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scope: 'openid profile email',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  },
};

// ─── Environment Detection ───────────────────────────────────────────────────

/**
 * Returns true when we are running in demo / development mode.
 * In demo mode we skip the real OAuth redirect and simulate the flow.
 */
export function isDemoMode(): boolean {
  // If no client IDs are configured, force demo mode
  const provider: OAuthProvider = 'google';
  const config = OAUTH_CONFIGS[provider];
  if (!config.clientId) return true;
  return process.env.NODE_ENV !== 'production';
}

// ─── URL Generation ──────────────────────────────────────────────────────────

/**
 * Builds the full authorization URL for the given OAuth provider.
 * Includes a random `state` parameter for CSRF protection.
 */
export function getOAuthUrl(provider: OAuthProvider): string {
  const config = OAUTH_CONFIGS[provider];
  const state = generateState();

  // Persist state so we can verify it on callback
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_provider', provider);
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  // GitHub doesn't support access_type / prompt
  if (provider === 'github') {
    params.delete('access_type');
    params.delete('prompt');
  }

  return `${config.authUrl}?${params.toString()}`;
}

// ─── Popup Flow ──────────────────────────────────────────────────────────────

/**
 * Opens a centered popup window to the OAuth provider's authorization page.
 * Returns a Promise that resolves with the OAuth callback result (code + state).
 */
export function openOAuthPopup(
  provider: OAuthProvider
): Promise<{ code: string; state: string }> {
  return new Promise((resolve, reject) => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const url = getOAuthUrl(provider);

    const popup = window.open(
      url,
      `oauth_${provider}`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,scrollbars=yes`
    );

    if (!popup) {
      reject(new Error('Popup blocked. Please allow popups for this site.'));
      return;
    }

    // Poll the popup to detect when it closes or redirects to our callback
    const interval = setInterval(() => {
      try {
        // Check if popup closed by user
        if (popup.closed) {
          clearInterval(interval);
          reject(new Error('Authentication cancelled.'));
          return;
        }

        // Check if popup redirected to our callback URL
        const popupUrl = popup.location.href;
        if (popupUrl.includes('/api/auth/oauth/callback/')) {
          clearInterval(interval);
          const urlObj = new URL(popupUrl);
          const code = urlObj.searchParams.get('code');
          const state = urlObj.searchParams.get('state');

          popup.close();

          if (code && state) {
            resolve({ code, state });
          } else {
            reject(new Error('Authorization code not received.'));
          }
        }
      } catch {
        // Cross-origin error means popup is still on the provider domain — keep waiting
      }
    }, 500);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      if (!popup.closed) popup.close();
      reject(new Error('Authentication timed out.'));
    }, 5 * 60 * 1000);
  });
}

// ─── Callback Exchange ───────────────────────────────────────────────────────

/**
 * Exchanges the OAuth authorization code for user data via our backend API.
 */
export async function handleOAuthCallback(
  provider: OAuthProvider,
  code: string,
  state: string
): Promise<{ user: OAuthUserData; isNewUser: boolean; token: string; refreshToken: string }> {
  // Verify state matches
  const savedState = typeof window !== 'undefined' ? sessionStorage.getItem('oauth_state') : null;
  if (savedState && savedState !== state) {
    throw new Error('State mismatch. Possible CSRF attack.');
  }

  const res = await fetch('/api/auth/oauth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, code, state }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'OAuth authentication failed');
  }

  return data;
}

// ─── Demo Flow ───────────────────────────────────────────────────────────────

/**
 * Simulates an OAuth flow in development / demo mode.
 * Calls our backend with mock provider data.
 */
export async function handleDemoOAuth(
  provider: OAuthProvider
): Promise<{
  user: Record<string, unknown>;
  token: string;
  refreshToken: string;
  isNewUser: boolean;
}> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

  const mockData = DEMO_OAUTH_DATA[provider];

  const res = await fetch('/api/auth/oauth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mockData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `${provider} login failed`);
  }

  return data;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateState(): string {
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for SSR
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}
